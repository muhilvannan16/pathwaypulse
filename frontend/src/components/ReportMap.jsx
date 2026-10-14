import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import {
  CATEGORY_LABELS,
  DEFAULT_ZOOM,
  ROCHESTER_HILLS_CENTER,
  STATUS_LABELS,
} from '../constants.js'
import { isValidCoordinate, prefersReducedMotion, statusMeta } from '../utils.js'

// Markers are small CSS-drawn pins (divIcon) instead of Leaflet's default
// image icons, which break when bundled with Vite. The HTML here is built
// only from our own fixed status list, never from user text.
const iconCache = new Map()
function getIcon(status, selected) {
  const { slug, glyph } = statusMeta(status)
  const key = `${slug}-${selected}`
  if (!iconCache.has(key)) {
    iconCache.set(
      key,
      L.divIcon({
        className: 'pp-marker',
        html: `<span class="pp-pin pp-pin--${slug}${selected ? ' pp-pin--selected' : ''}">${glyph}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -18],
      }),
    )
  }
  return iconCache.get(key)
}

// Lives inside <MapContainer> so it can use the map instance (useMap).
// When the selected report changes it centers the map and opens the popup.
function FlyToSelected({ report, markerRefs }) {
  const map = useMap()
  useEffect(() => {
    if (!report) return
    const target = [report.latitude, report.longitude]
    const zoom = Math.max(map.getZoom(), 14)
    if (prefersReducedMotion()) {
      map.setView(target, zoom, { animate: false })
    } else {
      map.flyTo(target, zoom, { duration: 0.6 })
    }
    markerRefs.current.get(report.id)?.openPopup()
  }, [map, report, markerRefs])
  return null
}

export default function ReportMap({ reports, selectedReport, isSample, onSelect }) {
  const markerRefs = useRef(new Map())
  const [tilesFailed, setTilesFailed] = useState(false)
  const mappable = reports.filter((r) => isValidCoordinate(r.latitude, r.longitude))

  return (
    <div className="map-wrap" role="region" aria-label="Map of community reports">
      <MapContainer
        className="map"
        center={ROCHESTER_HILLS_CENTER}
        zoom={DEFAULT_ZOOM}
        minZoom={9}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          eventHandlers={{
            tileerror: () => setTilesFailed(true),
            tileload: () => setTilesFailed(false),
          }}
        />
        {mappable.map((report) => {
          const selected = selectedReport?.id === report.id
          return (
            <Marker
              key={report.id}
              ref={(marker) => {
                if (marker) markerRefs.current.set(report.id, marker)
                else markerRefs.current.delete(report.id)
              }}
              position={[report.latitude, report.longitude]}
              icon={getIcon(report.status, selected)}
              zIndexOffset={selected ? 1000 : 0}
              title={`${report.title} (${report.status})`}
              eventHandlers={{ click: () => onSelect(report.id) }}
            >
              <Popup autoPan={false}>
                <strong className="popup__title">{report.title}</strong>
                <span className="popup__line">
                  {CATEGORY_LABELS[report.category] ?? report.category}
                </span>
                <span className="popup__line">
                  Status: {STATUS_LABELS[report.status] ?? report.status}
                </span>
                {isSample && <span className="popup__line popup__sample">Sample data</span>}
              </Popup>
            </Marker>
          )
        })}
        <FlyToSelected report={selectedReport} markerRefs={markerRefs} />
      </MapContainer>
      {tilesFailed && (
        <p className="map-warning" role="status">
          Map tiles could not be loaded. The report list still works.
        </p>
      )}
    </div>
  )
}
