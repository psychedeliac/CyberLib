import React from 'react';
import { useNavigate } from 'react-router-dom';

const Recommendations = ({ books, loading, error }) => {
  const navigate = useNavigate();

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);  // Navigate to the book details page with the book ID
  };

  if (loading) {
    return <div>Loading recommendations...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (books.length === 0) {
    return <div>No recommendations found</div>;
  }

  return (
    <div className="recommendations-container">
      {books.map((book, index) => (
        <div
          key={index}
          className="book"
          onClick={() => handleBookClick(book._id)}  // Make each book clickable
        >
          <img
            src={book.coverImage || 'https://via.placeholder.com/128x180?text=No+Image'}
            alt={book.title}
            className="book-image"
          />
          <h3>{book.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default Recommendations;