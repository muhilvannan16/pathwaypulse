import { TileLayer } from 'react-leaflet'

// OpenStreetMap background tiles with the required attribution. Shared by the
// explore map and the location picker. onFailed/onLoaded let the parent show
// a fallback message if the tile server can't be reached.
export default function OsmTileLayer({ onFailed, onLoaded }) {
  return (
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
      eventHandlers={{
        tileerror: () => onFailed?.(),
        tileload: () => onLoaded?.(),
      }}
    />
  )
}
