import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', username: '', password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // ✅ Use env variable instead of hardcoded URL
  const API_URL = process.env.REACT_APP_API_URL;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignIn ? '/auth/login' : '/auth/signup';

    try {
      const res = await axios.post(`${API_URL}${endpoint}`, formData);

      setMessage(res.data.message);

      // ✅ Save token and user to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Redirect depending on interests
      if (res.data.user.interests && res.data.user.interests.length >= 3) {
        navigate('/dashboard');
      } else {
        navigate('/genres', { state: { userId: res.data.user._id } });
      }

    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isSignIn ? 'Sign In' : 'Sign Up'}</h2>
        {!isSignIn && (
          <>
            <input name="name" onChange={handleChange} placeholder="Name" required />
            <input name="email" onChange={handleChange} placeholder="Email" required />
          </>
        )}
        <input name="username" onChange={handleChange} placeholder="Username" required />
        <input type="password" name="password" onChange={handleChange} placeholder="Password" required />
        <button type="submit">{isSignIn ? 'Login' : 'Register'}</button>
        <p>{message}</p>
        <span onClick={() => setIsSignIn(!isSignIn)}>
          {isSignIn ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
        </span>
      </form>
    </div>
  );
}

export default AuthForm;
