import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button, Offcanvas } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './components/SearchBar';
import WeatherDashboard from './components/WeatherDashboard';
import LoadingScreen from './components/LoadingScreen';
import DynamicBackground from './components/DynamicBackground';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  const [city, setCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [favoriteCities, setFavoriteCities] = useState([]);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleCitySelect = (city) => {
    setCity(city);
    // Add to favorites if not already there
    if (!favoriteCities.find(fav => fav.name === city.name)) {
      setFavoriteCities(prev => [...prev, city]);
    }
  };

  const handleWeatherDataUpdate = (data) => {
    console.log('Weather data received:', data);
    setWeatherData(data);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  const removeFavorite = (cityName) => {
    setFavoriteCities(prev => prev.filter(city => city.name !== cityName));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <motion.div 
        className={`app ${darkMode ? 'dark-mode' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      {/* Dynamic Background */}
      <DynamicBackground weatherData={weatherData} darkMode={darkMode} />
      {/* Professional Navigation */}
      <Navbar 
        bg={darkMode ? "dark" : "light"} 
        variant={darkMode ? "dark" : "light"} 
        expand="lg"
        className="professional-navbar"
        fixed="top"
      >
        <Container fluid className="px-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Navbar.Brand 
              href="https://github.com/Mithilsai/React-Strom" 
              target="_blank"
              rel="noopener noreferrer"
              className="brand-logo"
            >
              <span className="brand-icon">⚡</span>
              <span className="brand-text">React Strom</span>
              <span className="brand-badge">Pro</span>
            </Navbar.Brand>
          </motion.div>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggler-custom" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="me-auto">
              <Nav.Link 
                onClick={() => setShowSidebar(true)}
                className="nav-link-custom"
                aria-label="View favorite cities"
              >
                <span className="nav-icon">📍</span>
                <span className="nav-text">Favorites</span>
                <span className="nav-badge">{favoriteCities.length}</span>
              </Nav.Link>
              <Nav.Link 
                href="https://open-meteo.com/" 
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link-custom"
                aria-label="Weather data source"
              >
                <span className="nav-icon">🌤️</span>
                <span className="nav-text">Data Source</span>
              </Nav.Link>
            </Nav>
            <Nav className="nav-actions">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant={darkMode ? "outline-light" : "outline-dark"}
                  onClick={toggleDarkMode}
                  className="theme-toggle"
                  aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  <span className="theme-icon">{darkMode ? '☀️' : '🌙'}</span>
                </Button>
              </motion.div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container fluid className="main-content">
        <div className="content-wrapper">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <SearchBar onCitySelect={handleCitySelect} darkMode={darkMode} />
        </motion.div>

        <AnimatePresence mode="wait">
          {city && (
            <motion.div
              key={city.name}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <WeatherDashboard 
                city={city} 
                darkMode={darkMode} 
                onWeatherDataUpdate={handleWeatherDataUpdate}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </Container>

      {/* Favorites Sidebar */}
      <Offcanvas 
        show={showSidebar} 
        onHide={() => setShowSidebar(false)}
        placement="end"
        className={darkMode ? 'dark-mode' : ''}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>📍 Favorite Cities</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {favoriteCities.length === 0 ? (
            <p className="text-muted">No favorite cities yet. Search for a city to add it here!</p>
          ) : (
            <div className="favorites-list">
              {favoriteCities.map((favCity, index) => (
                <motion.div
                  key={favCity.name}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="favorite-item"
                >
                  <div 
                    className="favorite-city"
                    onClick={() => {
                      setCity(favCity);
                      setShowSidebar(false);
                    }}
                  >
                    <span>{favCity.name}</span>
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeFavorite(favCity.name)}
                  >
                    ✕
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Professional Footer */}
      <motion.footer 
        className={`footer ${darkMode ? 'dark-mode' : ''}`}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Container fluid className="px-4">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-brand">
                <span className="footer-brand-icon">⚡</span>
                <div className="footer-brand-text">
                  <h6>React Strom Pro</h6>
                  <p>Enterprise-grade weather forecasting platform</p>
                </div>
              </div>
              <div className="footer-social">
                <a href="https://github.com/Mithilsai/React-Strom" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository">
                  <i className="fab fa-github"></i>
                </a>
                <a href="https://mithilsai.github.io/" target="_blank" rel="noopener noreferrer" aria-label="Developer Portfolio">
                  <i className="fas fa-user"></i>
                </a>
              </div>
            </div>
            
            <div className="footer-section">
              <h6>Features</h6>
              <ul className="footer-links">
                <li><a href="#weather-data">Real-time Weather</a></li>
                <li><a href="#forecast">7-Day Forecast</a></li>
                <li><a href="#radar">Live Radar</a></li>
                <li><a href="#favorites">City Management</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h6>Data Sources</h6>
              <ul className="footer-links">
                <li><a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo API</a></li>
                <li><a href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></li>
                <li><a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">RainViewer</a></li>
                <li><a href="https://erikflowers.github.io/weather-icons/" target="_blank" rel="noopener noreferrer">Weather Icons</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h6>Support</h6>
              <ul className="footer-links">
                <li><a href="https://github.com/Mithilsai/React-Strom/issues" target="_blank" rel="noopener noreferrer">Report Issues</a></li>
                <li><a href="https://github.com/Mithilsai/React-Strom" target="_blank" rel="noopener noreferrer">Documentation</a></li>
                <li><a href="mailto:contact@reactstrom.com">Contact Support</a></li>
                <li><a href="#privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; {new Date().getFullYear()} React Strom Pro. All rights reserved.</p>
              <div className="footer-bottom-links">
                <a href="#terms">Terms of Service</a>
                <span className="separator">•</span>
                <a href="#privacy">Privacy Policy</a>
                <span className="separator">•</span>
                <a href="#cookies">Cookie Policy</a>
              </div>
            </div>
          </div>
        </Container>
      </motion.footer>
      </motion.div>
    </ErrorBoundary>
  );
}

export default App;
