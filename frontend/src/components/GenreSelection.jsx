import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './GenreSelection.css';

const genresList = [
  'Philosophical Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Historical',
  'Thriller', 'Romance', 'Biography', 'Self-Help', 'Dystopian',
  'Horror', 'Adventure', 'Classic', 'Satire', 'Psychological Drama', 'Erotica',
];

function GenreSelection() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [error, setError] = useState('');

  // ✅ Use API URL from env
  const API_URL = process.env.REACT_APP_API_URL;

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleNext = async () => {
    if (selectedGenres.length < 3) {
      setError('Please select at least 3 genres');
      return;
    }

    try {
      await axios.post(`${API_URL}/user/update-interests`, {
        userId,
        interests: selectedGenres
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving interests:', error);
      setError('Failed to save interests. Please try again.');
    }
  };

  return (
    <div className="genre-container">
      <h1 className="genre-title">SELECT YOUR GENRES</h1>
      <p className="genre-subtitle">Choose at least 3 genres to continue:</p>
      
      {error && <p className="genre-error">{error}</p>}
      
      <div className="genres-grid">
        {genresList.map((genre) => (
          <button
            key={genre}
            className={`genre-option ${selectedGenres.includes(genre) ? 'selected' : ''}`}
            onClick={() => toggleGenre(genre)}
          >
            {genre}
          </button>
        ))}
      </div>
      
      <button
        className={`next-btn ${selectedGenres.length >= 3 ? 'enabled' : ''}`}
        onClick={handleNext}
        disabled={selectedGenres.length < 3}
      >
        CONTINUE
      </button>
    </div>
  );
}

export default GenreSelection;
