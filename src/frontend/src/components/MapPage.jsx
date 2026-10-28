import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import { useState } from 'react'
import L from 'leaflet'
import './MapPage.css'
import AddEstablishmentForm from './AddEstablishmentForm'

// Fix default marker icon issue in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER = [51.505, -0.09]

function MapClickHandler({ onAddEstablishment }) {
  useMapEvents({
    click(e) {
      onAddEstablishment(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapPage({ establishments, onMapClick, onSelectEstablishment }) {
  const [showForm, setShowForm] = useState(false)
  const [formCoords, setFormCoords] = useState({ lat: 0, lng: 0 })

  const handleMapClick = (lat, lng) => {
    setFormCoords({ lat, lng })
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
  }

  const handleFormSuccess = () => {
    onMapClick()
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#27ae60'
    if (rating >= 3) return '#f39c12'
    if (rating >= 2) return '#e67e22'
    return '#e74c3c'
  }

  return (
    <div className="map-page">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onAddEstablishment={handleMapClick} />
        {establishments.map((est) => (
          <Marker
            key={est.id}
            position={[est.latitude, est.longitude]}
            eventHandlers={{
              click: () => onSelectEstablishment(est.id),
            }}
          >
            <Popup>
              <div className="marker-popup">
                <h3>{est.name}</h3>
                <div className="popup-rating">
                  <span className="rating-value" style={{ color: getRatingColor(est.averageRating) }}>
                    {est.averageRating.toFixed(1)}
                  </span>
                  <span className="rating-stars">
                    {'★'.repeat(Math.round(est.averageRating))}
                    {'☆'.repeat(5 - Math.round(est.averageRating))}
                  </span>
                </div>
                <p className="review-count">{est.reviews?.length || 0} review(s)</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {establishments.length === 0 && (
        <div className="empty-state">
          <p>🗺️ No establishments yet. Click on the map to add one!</p>
        </div>
      )}
      {showForm && (
        <AddEstablishmentForm
          lat={formCoords.lat}
          lng={formCoords.lng}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}

export default MapPage
