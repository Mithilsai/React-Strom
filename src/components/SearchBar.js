import React, { useState, useEffect, useRef } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { animate, stagger } from 'animejs';

const SearchBar = ({ onCitySelect, darkMode }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchCities();
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchCities = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 8,
          addressdetails: 1,
          countrycodes: 'us,ca,gb,de,fr,it,es,au,jp,in,br,mx,ru,cn,kr'
        }
      });
      
      const filteredSuggestions = response.data
        .filter(city => city.display_name.split(',').length <= 3) // Filter out overly long names
        .slice(0, 6);
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
      
      // Animate suggestions appearance
      if (filteredSuggestions.length > 0) {
        animate('.suggestion-item', {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(50),
          duration: 300,
          easing: 'easeOutQuad'
        });
      }
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (city) => {
    const cityData = {
      name: city.display_name.split(',')[0], // Get just the city name
      fullName: city.display_name,
      lat: parseFloat(city.lat),
      lon: parseFloat(city.lon),
      country: city.address?.country || 'Unknown'
    };
    
    onCitySelect(cityData);
    setQuery(cityData.name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Animate selection
    animate(inputRef.current, {
      scale: [1, 1.02, 1],
      duration: 300,
      easing: 'easeInOutQuad'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    }
  };

  const getWeatherIcon = (cityName) => {
    const icons = ['🌤️', '🌥️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️'];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <div className="search-container" ref={searchRef}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Form onSubmit={handleSubmit}>
          <InputGroup className="search-input-group">
            <Form.Control
              ref={inputRef}
              type="text"
              placeholder="Search for a city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="search-input"
              autoComplete="off"
              aria-label="Search for a city"
              aria-describedby="search-help"
            />
            <Button 
              type="submit" 
              variant="primary" 
              className="search-button"
              disabled={isLoading}
              aria-label={isLoading ? "Searching..." : "Search for weather"}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  ⏳
                </motion.div>
              ) : (
                '🔍'
              )}
            </Button>
          </InputGroup>
        </Form>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              className="suggestions-container"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {suggestions.map((city, index) => (
                <motion.div
                  key={`${city.place_id}-${index}`}
                  className="suggestion-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ 
                    backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    x: 5
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(city)}
                >
                  <div className="suggestion-content">
                    <span className="suggestion-icon">
                      {getWeatherIcon(city.display_name)}
                    </span>
                    <div className="suggestion-text">
                      <div className="suggestion-city">
                        {city.display_name.split(',')[0]}
                      </div>
                      <div className="suggestion-details">
                        {city.display_name.split(',').slice(1, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Searches */}
        {!showSuggestions && query.length === 0 && (
          <motion.div
            className="recent-searches"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="recent-title">Popular Cities</div>
            <div className="recent-grid">
              {['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai'].map((city, index) => (
                <motion.div
                  key={city}
                  className="recent-city"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuery(city)}
                >
                  {city}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        .search-input-group {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-input {
          border: 2px solid var(--gray-200);
          border-radius: var(--radius-xl);
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
          transition: all var(--transition-normal);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }

        .dark-mode .search-input {
          background: rgba(30, 41, 59, 0.9);
          border-color: var(--gray-600);
          color: var(--dark-text);
        }

        .search-input:focus {
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          outline: none;
        }

        .search-button {
          border-radius: var(--radius-xl);
          padding: 1rem 1.5rem;
          font-weight: 600;
          transition: all var(--transition-normal);
          border: none;
          background: var(--primary-color);
        }

        .search-button:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .suggestions-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          border: 1px solid var(--gray-200);
          margin-top: 0.5rem;
          overflow: hidden;
          max-height: 300px;
          overflow-y: auto;
        }

        .dark-mode .suggestions-container {
          background: rgba(30, 41, 59, 0.95);
          border-color: var(--gray-600);
        }

        .suggestion-item {
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          border-bottom: 1px solid var(--gray-100);
        }

        .dark-mode .suggestion-item {
          border-bottom: 1px solid var(--gray-600);
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .suggestion-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .suggestion-icon {
          font-size: 1.5rem;
          width: 2rem;
          text-align: center;
        }

        .suggestion-text {
          flex: 1;
        }

        .suggestion-city {
          font-weight: 600;
          color: var(--gray-900);
          margin-bottom: 0.25rem;
        }

        .dark-mode .suggestion-city {
          color: var(--dark-text);
        }

        .suggestion-details {
          font-size: 0.875rem;
          color: var(--gray-500);
        }

        .dark-mode .suggestion-details {
          color: var(--gray-400);
        }

        .recent-searches {
          margin-top: 2rem;
          text-align: center;
        }

        .recent-title {
          font-size: 0.875rem;
          color: var(--gray-500);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }

        .dark-mode .recent-title {
          color: var(--gray-400);
        }

        .recent-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          max-width: 400px;
          margin: 0 auto;
        }

        .recent-city {
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 500;
          color: var(--gray-700);
          transition: all var(--transition-fast);
          border: 1px solid var(--gray-200);
        }

        .dark-mode .recent-city {
          background: rgba(30, 41, 59, 0.8);
          color: var(--dark-text);
          border-color: var(--gray-600);
        }

        .recent-city:hover {
          background: rgba(255, 255, 255, 0.95);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        .dark-mode .recent-city:hover {
          background: rgba(30, 41, 59, 0.95);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        @media (max-width: 768px) {
          .recent-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
