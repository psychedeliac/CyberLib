import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook

const PopularAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();  // Initialize navigate

  const API_URL = process.env.REACT_APP_API_URL; // Use env variable

  useEffect(() => {
    const fetchPopularAuthors = async () => {
      try {
        const response = await axios.get(`${API_URL}/popular-authors`);
        setAuthors(response.data.data || response.data); // Adjust depending on backend response
      } catch (err) {
        setError('Failed to fetch popular authors');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularAuthors();
  }, [API_URL]);

  if (loading) {
    return <div>Loading popular authors...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  // Handle author click to navigate to the AuthorDetails page
  const handleAuthorClick = (authorId) => {
    navigate(`/author/${authorId}`);
  };

  return (
    <div className="recommendations-container">
      {authors.map((author) => (
        <div
          key={author._id}
          className="author"
          onClick={() => handleAuthorClick(author._id)}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={author.image || `https://via.placeholder.com/150?text=${author.name}`}
            alt={author.name}
            className="author-image"
          />
          <h3>{author.name}</h3>
          <p>Rating: {author.rating?.toFixed(1) || 'N/A'}</p>
          <p>Reviews: {author.reviewCount || 0}</p>
          {author.top_work && <p>Top Work: {author.top_work}</p>}
        </div>
      ))}
    </div>
  );
};

export default PopularAuthors;
