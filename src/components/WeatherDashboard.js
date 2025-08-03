import React, { useState, useEffect } from 'react';
import { Card, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, BarElement } from 'chart.js';
import axios from 'axios';
import { animate, stagger } from 'animejs';
import AnimatedWeatherCard from './AnimatedWeatherCard';
import RainViewerMap from './RainViewerMap';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, BarElement);

const WeatherDashboard = ({ city, darkMode, onWeatherDataUpdate }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChart, setActiveChart] = useState('hourly'); // 'hourly', 'precipitation', 'forecast'

  useEffect(() => {
    fetchWeatherData();
  }, [city]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch current weather and hourly forecast
      const [currentResponse, forecastResponse] = await Promise.all([
        axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: city.lat,
            longitude: city.lon,
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index',
            hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m',
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code',
            timezone: 'auto'
          }
        }),
        axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: city.lat,
            longitude: city.lon,
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code,uv_index_max',
            timezone: 'auto'
          }
        })
      ]);

      const current = currentResponse.data;
      const forecast = forecastResponse.data;

      setWeatherData(current);
      setForecastData(forecast);
      
      // Pass weather data to parent for background
      if (onWeatherDataUpdate) {
        onWeatherDataUpdate(current);
      }
      
      // Animate data appearance
      setTimeout(() => {
        animate('.weather-card', {
          opacity: [0, 1],
          translateY: [30, 0],
          delay: stagger(100),
          duration: 600,
          easing: 'easeOutQuad'
        });
      }, 300);

    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherType = (code) => {
    // WMO Weather interpretation codes
    if (code >= 0 && code <= 3) return 'sun';      // Clear sky
    if (code >= 45 && code <= 48) return 'cloudy'; // Foggy
    if (code >= 51 && code <= 67) return 'rain';   // Rain
    if (code >= 71 && code <= 77) return 'snow';   // Snow
    if (code >= 80 && code <= 82) return 'rain';   // Rain showers
    if (code >= 85 && code <= 86) return 'snow';   // Snow showers
    if (code >= 95 && code <= 99) return 'thunder'; // Thunderstorm
    return 'sun';
  };

  const getWeatherIcon = (code) => {
    const icons = {
      sun: '☀️',
      cloudy: '☁️',
      rain: '🌧️',
      snow: '🌨️',
      thunder: '⛈️'
    };
    return icons[getWeatherType(code)] || '🌤️';
  };

  // eslint-disable-next-line no-unused-vars
  const getWeatherDescription = (code) => {
    const descriptions = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return descriptions[code] || 'Unknown';
  };

  const formatTemperature = (temp) => {
    return Math.round(temp);
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <motion.div
        className="loading-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-spinner-container">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Loading weather data for {city.name}...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="error-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="error-card">
          <Card.Body className="text-center">
            <div className="error-icon">⚠️</div>
            <h5>Oops! Something went wrong</h5>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={fetchWeatherData}
            >
              Try Again
            </button>
          </Card.Body>
        </Card>
      </motion.div>
    );
  }

  const current = weatherData?.current || {};
  // Safe data access with defaults
  const hourly = weatherData?.hourly || {};
  const daily = forecastData?.daily || {};

  // Prepare chart data with safe access
  const hourlyChartData = {
    labels: (hourly.time || []).slice(0, 24).map(time => formatTime(time)),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: (hourly.temperature_2m || Array(24).fill(0)).slice(0, 24),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const precipitationChartData = {
    labels: (hourly.time || []).slice(0, 24).map(time => formatTime(time)),
    datasets: [
      {
        label: 'Precipitation Probability (%)',
        data: (hourly.precipitation_probability || Array(24).fill(0)).slice(0, 24),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3b82f6',
        borderWidth: 1
      }
    ]
  };

  const renderChart = () => {
    switch (activeChart) {
      case 'hourly':
        return (
          <Line 
            data={hourlyChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: false,
                  grid: {
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                },
                x: {
                  grid: {
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }
              }
            }}
            height={200}
          />
        );
      case 'precipitation':
        return (
          <Bar 
            data={precipitationChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                },
                x: {
                  grid: {
                    color: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                  }
                }
              }
            }}
            height={200}
          />
        );
      case 'forecast':
        return (
          <div className="forecast-list-compact">
            {(daily.time || []).map((date, index) => (
              <motion.div
                key={date}
                className="forecast-item-compact"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="forecast-day-compact">
                  {formatDate(date)}
                </div>
                <div className="forecast-icon-compact">
                  {getWeatherIcon((daily.weather_code || [])[index] || 0)}
                </div>
                <div className="forecast-temp-compact">
                  <span className="temp-max">{formatTemperature((daily.temperature_2m_max || [])[index] || 0)}°</span>
                  <span className="temp-min">{formatTemperature((daily.temperature_2m_min || [])[index] || 0)}°</span>
                </div>
                <div className="forecast-precip-compact">
                  {(daily.precipitation_probability_max || [])[index] || 0}%
                </div>
              </motion.div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      className="weather-dashboard-new"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Top Row - Weather Card and City Details */}
      <div className="top-row">
        {/* Animated Weather Card */}
        <motion.div
          className="animated-card-container"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <AnimatedWeatherCard weatherData={weatherData} darkMode={darkMode} city={city} />
        </motion.div>

        {/* Current Weather Details Card */}
        <motion.div
          className="weather-card current-weather"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="weather-header">
            <div className="location-info">
              <h2 className="city-name">{city.name}</h2>
              <p className="city-country">{city.country}</p>
            </div>
          </div>

          <div className="weather-details">
            <div className="detail-item">
              <div className="detail-icon">🌡️</div>
              <div className="detail-label">Feels Like</div>
              <div className="detail-value">{formatTemperature(current.apparent_temperature || 0)}°C</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">💧</div>
              <div className="detail-label">Humidity</div>
              <div className="detail-value">{current.relative_humidity_2m || 0}%</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">💨</div>
              <div className="detail-label">Wind</div>
              <div className="detail-value">{Math.round(current.wind_speed_10m || 0)} km/h</div>
            </div>
            <div className="detail-item">
              <div className="detail-icon">☀️</div>
              <div className="detail-label">UV Index</div>
              <div className="detail-value">{current.uv_index || 0}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="main-content-grid">
        {/* Left Side - Charts */}
        <div className="charts-section">
          <motion.div
            className="weather-card chart-card"
            initial={{ scale: 0.9, opacity: 0, x: -50 }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 100 }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="chart-header">
              <h4>Weather Data</h4>
              <ButtonGroup size="sm" className="chart-toggle">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant={activeChart === 'hourly' ? 'primary' : 'outline-primary'}
                    onClick={() => {
                      setActiveChart('hourly');
                      animate('.chart-content', {
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        duration: 300,
                        easing: 'easeOutQuad'
                      });
                    }}
                  >
                    24H
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant={activeChart === 'precipitation' ? 'primary' : 'outline-primary'}
                    onClick={() => {
                      setActiveChart('precipitation');
                      animate('.chart-content', {
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        duration: 300,
                        easing: 'easeOutQuad'
                      });
                    }}
                  >
                    Rain
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant={activeChart === 'forecast' ? 'primary' : 'outline-primary'}
                    onClick={() => {
                      setActiveChart('forecast');
                      animate('.chart-content', {
                        opacity: [0, 1],
                        scale: [0.95, 1],
                        duration: 300,
                        easing: 'easeOutQuad'
                      });
                    }}
                  >
                    7D
                  </Button>
                </motion.div>
              </ButtonGroup>
            </div>
            <div className="chart-content">
              {renderChart()}
            </div>
          </motion.div>
        </div>

        {/* Right Side - RainViewer Map */}
        <div className="map-section">
          <RainViewerMap city={city} darkMode={darkMode} />
        </div>
      </div>

      <style jsx>{`
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner-container {
          text-align: center;
        }

        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .error-card {
          max-width: 400px;
          text-align: center;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .top-row {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
          align-items: start;
        }

        .animated-card-container {
          display: flex;
          justify-content: center;
        }

        .current-weather {
          height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-shrink: 0;
        }

        .location-info h2 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          color: var(--gray-900);
        }

        .dark-mode .location-info h2 {
          color: var(--dark-text);
        }

        .city-country {
          margin: 0;
          color: var(--gray-500);
          font-size: 1rem;
        }

        .dark-mode .city-country {
          color: var(--gray-400);
        }

        .weather-icon-large {
          font-size: 4rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        .temperature-display {
          text-align: center;
          margin-bottom: 2rem;
        }

        .temperature-value {
          font-size: 4rem;
          font-weight: 700;
          color: var(--primary-color);
          line-height: 1;
        }

        .temperature-unit {
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--gray-500);
          margin-left: 0.25rem;
        }

        .weather-description {
          font-size: 1.25rem;
          color: var(--gray-600);
          margin-top: 0.5rem;
          text-transform: capitalize;
        }

        .dark-mode .weather-description {
          color: var(--gray-400);
        }

        .weather-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          flex-grow: 1;
          align-content: center;
          padding: 0.5rem 0;
        }

        .detail-item {
          text-align: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-lg);
          transition: all var(--transition-fast);
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 80px;
        }

        .dark-mode .detail-item {
          background: rgba(51, 65, 85, 0.5);
        }

        .detail-item:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: scale(1.05);
        }

        .dark-mode .detail-item:hover {
          background: rgba(51, 65, 85, 0.8);
        }

        .detail-icon {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }

        .detail-label {
          font-size: 0.75rem;
          color: var(--gray-500);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .detail-value {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gray-900);
          margin-top: 0.25rem;
        }

        .dark-mode .detail-value {
          color: var(--dark-text);
        }

        .forecast-list-compact {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
        }

        .forecast-item-compact {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.5);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .dark-mode .forecast-item-compact {
          background: rgba(51, 65, 85, 0.5);
        }

        .forecast-item-compact:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: translateX(5px);
        }

        .dark-mode .forecast-item-compact:hover {
          background: rgba(51, 65, 85, 0.8);
        }

        .forecast-day-compact {
          font-weight: 600;
          color: var(--gray-900);
          min-width: 80px;
          font-size: 0.875rem;
        }

        .dark-mode .forecast-day-compact {
          color: var(--dark-text);
        }

        .forecast-icon-compact {
          font-size: 1.25rem;
          width: 1.5rem;
          text-align: center;
        }

        .forecast-temp-compact {
          display: flex;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
        }

                 .forecast-precip-compact {
           font-size: 0.75rem;
           color: var(--gray-500);
           min-width: 2rem;
           text-align: right;
         }

         .temp-max {
           color: var(--primary-color);
         }

         .temp-min {
           color: var(--gray-500);
         }



        .weather-dashboard-new {
          max-width: 1200px;
          margin: 0 auto;
        }

        .main-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        .charts-section {
          display: flex;
          flex-direction: column;
        }

        .map-section {
          display: flex;
          flex-direction: column;
        }

        .chart-card {
          height: 400px;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--gray-200);
        }

        .dark-mode .chart-header {
          border-bottom: 1px solid var(--gray-600);
        }

        .chart-toggle {
          display: flex;
          gap: 0.25rem;
        }

        .chart-content {
          height: 300px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .top-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .current-weather {
            height: auto;
            min-height: 300px;
          }

          .main-content-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .chart-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .chart-toggle {
            width: 100%;
            justify-content: center;
          }

          .animated-weather-card {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default WeatherDashboard; 