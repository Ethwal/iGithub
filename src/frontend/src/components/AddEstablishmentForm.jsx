import { useState } from 'react'
import './AddEstablishmentForm.css'

function AddEstablishmentForm({ lat, lng, onClose, onSuccess }) {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [hasBidet, setHasBidet] = useState(false)
  const [hasFreeTissue, setHasFreeTissue] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter an establishment name')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/establishments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          latitude: lat,
          longitude: lng,
          rating,
          comment: comment.trim(),
          hasBidet,
          hasFreeTissue,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create establishment')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to create establishment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Establishment</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Establishment Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Central Cafe"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Rating</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= rating ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="comment">Review (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
            />
          </div>
          <div className="form-group amenities-group">
            <label>Toilet Amenities</label>
            <div className="amenity-checkboxes">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hasBidet}
                  onChange={(e) => setHasBidet(e.target.checked)}
                />
                🚿 Bidet
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={hasFreeTissue}
                  onChange={(e) => setHasFreeTissue(e.target.checked)}
                />
                🧻 Free Tissue
              </label>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Saving...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEstablishmentForm
