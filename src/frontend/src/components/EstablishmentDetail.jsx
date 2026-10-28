import { useState } from 'react'
import './EstablishmentDetail.css'

function EstablishmentDetail({ establishment, onClose, onReviewAdded }) {
  const [rating, setRating] = useState(3)
  const [comment, setComment] = useState('')
  const [hasBidet, setHasBidet] = useState(false)
  const [hasFreeTissue, setHasFreeTissue] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`/api/establishments/${establishment.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim(), hasBidet, hasFreeTissue }),
      })

      if (!response.ok) {
        throw new Error('Failed to add review')
      }

      setComment('')
      setRating(3)
      setHasBidet(false)
      setHasFreeTissue(false)
      onReviewAdded(establishment.id)
    } catch (err) {
      setError(err.message || 'Failed to add review')
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#27ae60'
    if (rating >= 3) return '#f39c12'
    if (rating >= 2) return '#e67e22'
    return '#e74c3c'
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <h2>{establishment.name}</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="detail-rating">
        <span className="rating-number" style={{ color: getRatingColor(establishment.averageRating) }}>
          {establishment.averageRating.toFixed(1)}
        </span>
        <div className="rating-stars">
          {'★'.repeat(Math.round(establishment.averageRating))}
          {'☆'.repeat(5 - Math.round(establishment.averageRating))}
        </div>
        <span className="review-count">{establishment.reviews?.length || 0} review(s)</span>
      </div>

      <div className="reviews-section">
        <h3>Reviews</h3>
        {establishment.reviews && establishment.reviews.length > 0 ? (
          <div className="reviews-list">
            {establishment.reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <span className="review-rating">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
                <div className="review-amenities">
                  {review.hasBidet && <span className="amenity-badge">🚿 Bidet</span>}
                  {review.hasFreeTissue && <span className="amenity-badge">🧻 Free Tissue</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>

      <div className="add-review-section">
        <h3>Add Your Review</h3>
        <form onSubmit={handleSubmitReview}>
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
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={3}
          />
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
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EstablishmentDetail
