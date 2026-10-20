import { useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import { DEFAULT_ZOOM, ROCHESTER_HILLS_CENTER } from '../constants.js'
import { checkCoordinates, isNearRochesterHills, parseCoordinate } from '../validation.js'
import OsmTileLayer from './OsmTileLayer.jsx'

// Pin shown at the chosen spot (same CSS family as the report pins).
const pickIcon = L.divIcon({
  className: 'pp-marker',
  html: '<span class="pp-pin pp-pin--picked pp-pin--selected">◎</span>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
})

// Six decimal places is about 10 cm: plenty, and keeps numbers readable.
const round6 = (n) => Number(n.toFixed(6))

// Lives inside <MapContainer>: turns a map click into a chosen location.
function ClickToPick({ onPick }) {
  useMapEvents({
    click(event) {
      // wrap() keeps longitude in -180..180 if the map was panned around the world.
      const { lat, lng } = event.latlng.wrap()
      onPick(round6(lat), round6(lng))
    },
  })
  return null
}

const show = (n) => (n === null || n === undefined ? '' : n.toFixed(6))

// Lets people choose a location in three ways:
//   1. click/tap the map (or drag the pin)
//   2. keyboard: pan the map with the arrow keys, then "Use the map's center"
//   3. type the latitude and longitude
// The two read-only boxes always show what is currently chosen.
export default function LocationPicker({ latitude, longitude, onChange, error }) {
  const mapRef = useRef(null)
  const [tilesFailed, setTilesFailed] = useState(false)
  const [typed, setTyped] = useState({ latitude: '', longitude: '' })
  const [typedError, setTypedError] = useState('')

  const hasLocation = latitude !== null && longitude !== null

  function setFromMapCenter() {
    const map = mapRef.current
    if (!map) return
    const { lat, lng } = map.getCenter().wrap()
    onChange(round6(lat), round6(lng))
    setTypedError('')
  }

  function applyTyped() {
    const lat = parseCoordinate(typed.latitude)
    const lng = parseCoordinate(typed.longitude)
    const problem = checkCoordinates(Number.isNaN(lat) ? null : lat, Number.isNaN(lng) ? null : lng)
    if (problem) {
      setTypedError(
        problem === 'Choose a location on the map.'
          ? 'Enter both a latitude and a longitude, for example 42.658 and -83.15.'
          : problem,
      )
      return
    }
    setTypedError('')
    onChange(round6(lat), round6(lng))
    const map = mapRef.current
    if (map) map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: false })
  }

  const describedBy = ['location-help', error ? 'location-error' : null].filter(Boolean).join(' ')

  return (
    <fieldset
      className="location"
      id="location-group"
      tabIndex={-1}
      aria-describedby={describedBy}
    >
      <legend>
        Location <span className="required">(required)</span>
      </legend>
      <p id="location-help" className="hint">
        Click or tap the map to place the pin. You can drag the pin to adjust it. If you
        can’t use a mouse or touch screen, use the options under “Set the location
        another way”.
      </p>

      <div className="map-wrap" role="region" aria-label="Map for choosing the report location">
        <MapContainer
          ref={mapRef}
          className="map map--picker"
          center={hasLocation ? [latitude, longitude] : ROCHESTER_HILLS_CENTER}
          zoom={hasLocation ? 15 : DEFAULT_ZOOM}
          minZoom={9}
        >
          <OsmTileLayer
            onFailed={() => setTilesFailed(true)}
            onLoaded={() => setTilesFailed(false)}
          />
          <ClickToPick onPick={onChange} />
          {hasLocation && (
            <Marker
              position={[latitude, longitude]}
              icon={pickIcon}
              draggable
              title="Selected report location. Drag to adjust."
              eventHandlers={{
                dragend: (event) => {
                  const { lat, lng } = event.target.getLatLng().wrap()
                  onChange(round6(lat), round6(lng))
                },
              }}
            />
          )}
        </MapContainer>
        {tilesFailed && (
          <p className="map-warning" role="status">
            Map tiles could not be loaded. You can still set the location by typing
            coordinates below.
          </p>
        )}
      </div>

      <div className="coords">
        <div className="field">
          <label htmlFor="latitude">Latitude (from the map)</label>
          <input
            id="latitude"
            type="text"
            readOnly
            value={show(latitude)}
            placeholder="Not chosen yet"
            aria-invalid={error ? 'true' : undefined}
          />
        </div>
        <div className="field">
          <label htmlFor="longitude">Longitude (from the map)</label>
          <input
            id="longitude"
            type="text"
            readOnly
            value={show(longitude)}
            placeholder="Not chosen yet"
            aria-invalid={error ? 'true' : undefined}
          />
        </div>
      </div>

      <p className="location-status" aria-live="polite">
        {hasLocation
          ? `Location selected: latitude ${show(latitude)}, longitude ${show(longitude)}.`
          : 'No location selected yet.'}
      </p>
      {hasLocation && !isNearRochesterHills(latitude, longitude) && (
        <p className="field-warning" role="status">
          This spot looks to be outside Rochester Hills. PathwayPulse is for Rochester
          Hills pathways, so please check the location.
        </p>
      )}
      {error && (
        <p id="location-error" className="field-error">
          {error}
        </p>
      )}

      <details className="alt-location">
        <summary>Set the location another way</summary>
        <div className="alt-location__body">
          <p className="hint">
            <strong>With the keyboard:</strong> focus the map, move it with the arrow keys
            (+ and - zoom), then press the button to use the middle of the map.
          </p>
          <button type="button" className="btn btn--secondary" onClick={setFromMapCenter}>
            Use the map’s center as the location
          </button>
          <p className="hint">
            <strong>By typing:</strong> enter coordinates in decimal degrees, for example
            latitude 42.658 and longitude -83.15.
          </p>
          <div className="coords">
            <div className="field">
              <label htmlFor="typed-latitude">Latitude</label>
              <input
                id="typed-latitude"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={typed.latitude}
                onChange={(event) => setTyped({ ...typed, latitude: event.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="typed-longitude">Longitude</label>
              <input
                id="typed-longitude"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={typed.longitude}
                onChange={(event) => setTyped({ ...typed, longitude: event.target.value })}
              />
            </div>
          </div>
          <button type="button" className="btn btn--secondary" onClick={applyTyped}>
            Set location from these coordinates
          </button>
          <p className="field-error" role="alert">
            {typedError}
          </p>
        </div>
      </details>
    </fieldset>
  )
}
