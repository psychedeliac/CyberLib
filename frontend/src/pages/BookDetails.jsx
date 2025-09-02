import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './BookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readStatus, setReadStatus] = useState(false);
  const [wishlistStatus, setWishlistStatus] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE = process.env.REACT_APP_API_URL;

  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const res = await axios.get(`${API_BASE}/books/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBook(res.data);
      } catch (err) {
        if (err.response && err.response.status >= 500) {
          setError('Error fetching book details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id, token, API_BASE]);

  // Check book status
  useEffect(() => {
    const checkBookStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/books/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReadStatus(res.data.inReadList);
        setWishlistStatus(res.data.inWishlist);
      } catch (err) {
        console.log('Status check error:', err.message);
      }
    };

    checkBookStatus();
  }, [id, token, API_BASE]);

  // Add to read list
  const addToReadList = async () => {
    setError(null);
    try {
      await axios.post(`${API_BASE}/user/books/read`, { bookId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReadStatus(true);
      axios.post(`${API_BASE}/popular-books/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(e => console.log('Popular books update failed:', e.message));
    } catch (err) {
      if (err.response && err.response.status !== 409) {
        setError(err.response?.data?.message || 'Error adding to read list');
      }
    }
  };

  // Remove from read list
  const removeFromReadList = async () => {
    setError(null);
    try {
      await axios.delete(`${API_BASE}/user/books/read/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReadStatus(false);
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.message || 'Error removing from read list');
      }
    }
  };

  // Add to wishlist
  const addToWishlist = async () => {
    setError(null);
    try {
      await axios.post(`${API_BASE}/user/books/wishlist`, { bookId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistStatus(true);
      axios.post(`${API_BASE}/popular-books/wishlist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(e => console.log('Popular books update failed:', e.message));
    } catch (err) {
      if (err.response && err.response.status !== 409) {
        setError(err.response?.data?.message || 'Error adding to wishlist');
      }
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async () => {
    setError(null);
    try {
      await axios.delete(`${API_BASE}/user/books/wishlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlistStatus(false);
    } catch (err) {
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.message || 'Error removing from wishlist');
      }
    }
  };

  // Submit rating and review
  const submitReview = async () => {
    if (rating < 1 || rating > 5) {
      setError('Please select a valid rating');
      return;
    }
    if (reviewText.trim() === "") {
      setError('Please write a review');
      return;
    }
    try {
      await axios.post(`${API_BASE}/books/review/${id}`, {
        rating,
        reviewText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setError(null);
      setReviewSuccess(true);
      setRating(0);
      setReviewText("");

      // Reload book details
      const res = await axios.get(`${API_BASE}/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBook(res.data);
    } catch (err) {
      setError('Error submitting review');
    }
  };

  if (loading) return <div className="loading">LOADING...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!book) return <div className="error">NO BOOK FOUND</div>;

  const authors = Array.isArray(book.authors) ? book.authors : [];

  return (
    <div className="book-details">
      <h2>{book.title}</h2>
      <img src={book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'} alt={book.title} />
      
      <div className="detail-section">
        <span className="detail-label">AUTHOR(S):</span>
        <span className="detail-value">{authors.join(', ') || 'Unknown'}</span>
      </div>
      
      <div className="detail-section">
        <span className="detail-label">DESCRIPTION:</span>
        <p className="detail-value">{book.description || 'No description available'}</p>
      </div>
      
      <div className="detail-section">
        <span className="detail-label">PUBLISHED:</span>
        <span className="detail-value">{book.publishedDate || 'Unknown'}</span>
      </div>

      <div className="detail-section">
        <span className="detail-label">RATING:</span>
        <span className="detail-value">
          {book.averageRating ? `${book.averageRating}/5` : 'Not rated yet'}
        </span>
      </div>
      
      <div className="detail-section">
        <span className="detail-label">REVIEWS:</span>
        <span className="detail-value">
          {book.reviewCount > 0 ? `${book.reviewCount} reviews` : 'No reviews yet'}
        </span>
      </div>

      <div className="action-buttons">
        {readStatus ? (
          <button className="cyber-button remove" onClick={removeFromReadList}>
            REMOVE FROM READ LIST
          </button>
        ) : (
          <button className="cyber-button add" onClick={addToReadList}>
            ADD TO READ LIST
          </button>
        )}
        
        {wishlistStatus ? (
          <button className="cyber-button remove" onClick={removeFromWishlist}>
            REMOVE FROM WISHLIST
          </button>
        ) : (
          <button className="cyber-button add" onClick={addToWishlist}>
            ADD TO WISHLIST
          </button>
        )}
      </div>

      <div className="rating-section">
        <strong>YOUR RATING:</strong>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setRating(star)}
              className={`star ${star <= rating ? 'selected' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="review-input">
        <textarea
          className="cyber-textarea"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="WRITE YOUR REVIEW..."
        />
        <button className="submit-review" onClick={submitReview}>
          SUBMIT REVIEW
        </button>
      </div>

      {book.reviews && book.reviews.length > 0 && (
        <div className="reviews-section">
          <h3>USER REVIEWS</h3>
          {book.reviews.map((review, index) => (
            <div key={index} className="review">
              <p><strong>{review.userId?.username || 'Anonymous'}</strong></p>
              <p>Rating: {review.rating}/5</p>
              <p>{review.reviewText}</p>
            </div>
          ))}
        </div>
      )}

      {reviewSuccess && (
        <div className="success-message">REVIEW SUBMITTED SUCCESSFULLY!</div>
      )}
    </div>
  );
};

export default BookDetails;
