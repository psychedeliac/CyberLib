import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PopularBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // ✅ Use API URL from environment
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch popular books
  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const response = await axios.get(`${API_URL}/popular-books`);
        setBooks(response.data);
      } catch (err) {
        setError('Failed to fetch popular books');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularBooks();
  }, [API_URL]);

  // Handle book click
  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return <div>Loading popular books...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="recommendations-container">
      {books.map((book, index) => (
        <div
          key={index}
          className="book"
          onClick={() => handleBookClick(book._id)}
        >
          <img
            src={book.coverImage || 'https://via.placeholder.com/128x180?text=No+Image'}
            alt={book.title}
            className="book-image"
          />
          <h3>{book.title}</h3>
          <p>Read Count: {book.readCount}</p>
          <p>Wish Count: {book.wishCount}</p>
        </div>
      ))}
    </div>
  );
};

export default PopularBooks;
