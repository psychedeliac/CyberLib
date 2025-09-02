import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatHistory from '../components/ChatHistory';  // Import ChatHistory
import './Chatbot.css';

const API_BASE = process.env.REACT_APP_API_URL;

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: '🌌 *Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, a guide through the labyrinth of literature.\n\nAsk, and I shall reveal:\n\n✨ *Books that dance with the stars*\n🔥 *Stories that burn like embers*\n🌙 *Verses that whisper in the dark*\n\nWhat calls to your soul today?',
      specialFormat: true
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatId, setChatId] = useState(null);

  const genres = [
    'Philosophical Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Historical',
    'Thriller', 'Romance', 'Biography', 'Self-Help', 'Dystopian',
    'Horror', 'Adventure', 'Classic', 'Satire', 'Psychological Drama', 'Erotica'
  ];

  const authors = [
    'Friedrich Nietzsche', 'Fyodor Dostoyevsky', 'Albert Camus', 'Colleen Hoover', 
    'Charles Bukowski', 'Frank Herbert Hayward', 'Marie Lu', 'George Orwell', 'J.K. Rowling', 
    'Stephen King', 'Leo Tolstoy', 'Jane Austen', 'Mark Twain Media', 'Haruki Murakami', 
    'Gabriel Garcia Marquez', 'J.R.R. Tolkien', 'Agatha Christie', 'William Shakespeare', 
    'Homer H. Hickam', 'Ernest Hemingway', 'Virginia Woolf', 'Isaac Asimov', 'John Steinbeck', 
    'George R.R. Martin', 'Kurt Vonnegut', 'Toni Morrison', 'H. G. Wells Society', 'Ray Bradbury', 
    'Douglas Adams', 'Margaret Atwood', 'Khaled Hosseini', 'John Green', 'F. Scott Fitzgerald', 
    'Oscar Wilde', 'Maya Angelou', 'Arthur C. Clarke', 'C.S. Lewis', 'Joseph Conrad', 'Dan Brown', 
    'Emily Dickinson', 'Vladimir Nabokov', 'Sylvia Plath', 'William Faulkner', 'Jack Kerouac', 
    'Herman Melville', 'J.D. Salinger', 'Charles Dickens', 'Società Dante Alighieri', 'Marcel Proust', 
    'William Golding', 'Chimamanda Ngozi Adichie', 'Jodi Picoult', 'James Patterson Jr.', 'Neil Gaiman', 
    'Danielle Steel', 'Nicholas Sparks', 'E.L. James', 'Ken Follett', 'Paulo Coelho Netto', 'Harper Lee', 
    'Lisa Gardner', 'Patricia Cornwell', 'Stephenie Meyer', 'Richard Adams', 'Ruth Ware', 'Tom Clancy', 
    'Elena Ferrante', 'David Baldacci', 'Anne Rice', 'Dean Koontz', 'Sandra Brown', 'Karin Slaughter', 
    'Michael Connelly', 'Tana French', 'Greg Iles', 'Kate Morton', 'Catherine Coulter', 'Jeffrey Archer', 
    'Lee Child', 'John Grisham', 'David Foster Wallace', 'Michael Crichton', 'Nelson De Mille', 'David Mitchell', 
    'Shirley Jackson', 'Rachel Carson', 'Margaret Mitchell', 'Leonard Cohen', 'Jack London', 'Beryl Bainbridge', 
    'Zadie Smith', 'Ruth Rendell', 'Alice Munro', 'Elif Şafak', 'Jamaica Kincaid', 'Roald Dahl', 'Walt Whitman', 
    'Jean-Paul Sartre', 'E.M. Forster', 'James Joyce', 'Dorothy Parker', 'Henry James', 'Caitlin Moran', 'Philip K. Dick', 
    'Ayn Rand', 'Arthur Miller', 'Harlan Coben', 'Liane Moriarty', 'Margaret Drabble', 'William Somerset Maugham', 
    'Christopher Marlowe', 'Bram Stoker', 'Mary Shelley', 'Louise Erdrich', 'Paul Auster'
  ];

  useEffect(() => {
    if (chatId) {
      fetchChatMessages(chatId);
    }
  }, [chatId]);

  const fetchChatMessages = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.messages) {
        setMessages(res.data.messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          specialFormat: msg.sender === 'bot'
        })));
      }
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  const loadChat = (selectedChatId) => {
    setChatId(selectedChatId);
  };

  const saveMessageToBackend = async (sender, text) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_BASE}/chat`,
        { sender, text, chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (!chatId && res.data._id) {
        setChatId(res.data._id);
      }
    } catch (err) {
      console.error('Error saving message:', err.response?.data || err.message);
    }
  };
  
  const sendMessage = async (message) => {
    const userMessage = { sender: 'user', text: message, specialFormat: false };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    await saveMessageToBackend('user', message);
  
    const query = message.toLowerCase();
    let response;
    let isSpecialFormat = true;
  
    const isAuthorSearch = query.includes('books by') || query.includes('author') || query.includes('written by');
    const matchedGenre = genres.find((genre) => query.includes(genre.toLowerCase()));
    const isSimilarBooksRequest = query.includes('similar') || query.includes('like') || query.includes('related') || query.includes('closest');
    const isGeneralBookRequest = (query.includes('recommend') && query.includes('book')) || (query.includes('suggest') && query.includes('book'));
    const isGeneralAuthorRequest = (query.includes('recommend') && query.includes('author')) || (query.includes('suggest') && query.includes('author'));
  
    if (isSimilarBooksRequest) {
      const bookTitle = getBookTitleFromQuery(query);
      response = bookTitle ? await fetchSimilarBooks(bookTitle) : '🔮 *Tell me which book you are referring to...*';
    } else if (isGeneralBookRequest) {
      response = await fetchPopularBooks();
    } else if (isGeneralAuthorRequest) {
      response = await fetchPopularAuthors();
    } else if (isAuthorSearch) {
      const authorName = findAuthorInQuery(query);
      response = authorName ? await fetchBooksByAuthor(authorName) : '🔮 *The name slips through my fingers like sand...*';
    } else if (matchedGenre) {
      response = await fetchRecommendations(matchedGenre);
    } else {
      const authorName = findAuthorInQuery(query);
      response = authorName ? await fetchBooksByAuthor(authorName) : '📜 *The universe of books unfolds before you...*';
    }
  
    const botMessage = { sender: 'bot', text: response, specialFormat: isSpecialFormat };
    setMessages(prev => [...prev, botMessage]);
    await saveMessageToBackend('bot', response);
  };
  
  const findAuthorInQuery = (query) => {
    for (const author of authors) {
      if (query.includes(author.toLowerCase())) return author;
    }
    for (const author of authors) {
      const authorParts = author.split(' ');
      for (const part of authorParts) {
        if (part.length >= 4 && query.includes(part.toLowerCase())) return author;
      }
    }
    return null;
  };

  const getBookTitleFromQuery = (query) => {
    const match = query.match(/(similar to|like|related to|closest to) (.*)/);
    return match ? match[2].trim() : null;
  };

  const fetchRecommendations = async (genre) => {
    try {
      const res = await axios.get(`${API_BASE}/chatbot/recommendations?genre=${genre}`);
      const books = res.data || [];
      if (!books.length) return `🌑 *The ${genre} shelf lies empty...*`;
      const bookList = books.map(b => `📖 *${b.title}* — ${b.year || 'a timeless tale'}`).join('\n');
      return `🌠 *In the realm of ${genre}, I found these...*\n\n${bookList}`;
    } catch {
      return '⚡ *The library trembles...*';
    }
  };

  const fetchBooksByAuthor = async (author) => {
    try {
      const res = await axios.get(`${API_BASE}/chatbot/author?author=${encodeURIComponent(author)}`);
      const books = res.data || [];
      if (!books.length) return `🌫️ *The echoes of ${author} fade...*`;
      const bookList = books.map(b => `📜 *${b.title}* — ${b.year || 'an untold year'}`).join('\n');
      return `🖋️ *Behold, the works of ${author}:*\n\n${bookList}`;
    } catch {
      return '🌪️ *The ink bleeds, the pages flutter...*';
    }
  };

  const fetchSimilarBooks = async (bookTitle) => {
    try {
      const res = await axios.get(`${API_BASE}/chatbot/similar-books?title=${encodeURIComponent(bookTitle)}`);
      const books = res.data || [];
      if (!books.length) return `🌑 *I couldn't find any similar books to ${bookTitle}...*`;
      const bookList = books.map(b => `📖 *${b.title}* — ${b.year || 'a classic of its kind'}`).join('\n');
      return `🌠 *Here are some books similar to ${bookTitle}:*\n\n${bookList}`;
    } catch {
      return '⚡ *The library trembles...*';
    }
  };

  const fetchPopularBooks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/popular-books`);
      const books = res.data || [];
      if (!books.length) return `📚 *The shelves of renown are momentarily bare...*`;
      const bookList = books.map(b => `📘 *${b.title}* — ⭐ ${b.readCount} reads, 💖 ${b.wishCount} wishes`).join('\n');
      return `🔥 *These books burn bright with fame:*\n\n${bookList}`;
    } catch {
      return '🚫 *I could not fetch popular books right now...*';
    }
  };

  const fetchPopularAuthors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/popular-authors`);
      const authors = res.data || [];
      if (!authors.length) return `🖋️ *The storytellers are hidden in shadow...*`;
      const list = authors.map(a => `👤 *${a.authorName}* — ⭐ ${a.readCount} reads, 💖 ${a.wishCount} wishes`).join('\n');
      return `📖 *Here are authors the realm reveres:*\n\n${list}`;
    } catch {
      return '🚫 *I could not fetch popular authors right now...*';
    }
  };

  const startNewChat = () => {
    setChatId(null);
    setMessages([{ 
      sender: 'bot', 
      text: '🌌 *Welcome, wayfarer of words.*\n\nI am the *Keeper of Tales*, a guide through the labyrinth of literature.\n\nAsk, and I shall reveal:\n\n✨ *Books that dance with the stars*\n🔥 *Stories that burn like embers*\n🌙 *Verses that whisper in the dark*\n\nWhat calls to your soul today?',
      specialFormat: true
    }]);
  };

  return (
    <div className="chatbot-page">
      <div className="sidebar">
        <button className="new-chat-button" onClick={startNewChat}>
          ✨ New Conversation
        </button>
        <ChatHistory onSelectChat={loadChat} currentChatId={chatId} />
      </div>
      
      <div className="chatbot-container">
        <div className="chat-window">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender}-message ${message.specialFormat ? 'special-format' : ''}`}>
              <p>
                <strong>{message.sender === 'bot' ? 'KEEPER OF TALES:' : 'YOU:'}</strong> 
                <span style={{ whiteSpace: 'pre-line' }}>{message.text}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Whisper your query..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && userInput.trim()) sendMessage(userInput);
            }}
          />
          <button onClick={() => userInput.trim() && sendMessage(userInput)}>SEND</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
