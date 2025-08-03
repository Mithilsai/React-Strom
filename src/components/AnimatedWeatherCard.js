import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { animate, stagger } from 'animejs';

const AnimatedWeatherCard = ({ weatherData, darkMode, city }) => {
  const cardRef = useRef(null);
  const [currentWeather, setCurrentWeather] = useState('sun');
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    if (weatherData) {
      console.log('Weather Data Timezone:', weatherData.timezone);
      console.log('Current UTC Time:', new Date().toISOString());
      
      const weatherType = getWeatherType(weatherData.current.weather_code);
      console.log('Weather Type:', weatherType, 'Is Night:', isNight);
      
      setCurrentWeather(weatherType);
      startWeatherAnimation(weatherType);
    }
  }, [weatherData]); // eslint-disable-line react-hooks/exhaustive-deps

  const getWeatherType = (code) => {
    // Get the current time in the searched location's timezone
    let isNightTime = false;
    
    if (weatherData && weatherData.timezone) {
      // Use the timezone from the weather API response
      const locationTime = new Date().toLocaleString('en-US', {
        timeZone: weatherData.timezone
      });
      const locationDate = new Date(locationTime);
      const currentHour = locationDate.getHours();
      isNightTime = currentHour >= 18 || currentHour <= 6;
    } else {
      // Fallback to user's local time if timezone not available
      const currentHour = new Date().getHours();
      isNightTime = currentHour >= 18 || currentHour <= 6;
    }
    
    setIsNight(isNightTime);
    
    // WMO Weather interpretation codes - mapping to your weather types
    if (code === 0) {
      // Clear sky - show sun or moon based on time
      return isNightTime ? 'moon' : 'sun';
    }
    if (code === 1 || code === 2) {
      // Mainly clear (1) or Partly cloudy (2) - show clouds with sun/moon
      return isNightTime ? 'cloudy-night' : 'cloudy-day';
    }
    if (code === 3) {
      // Overcast - show only clouds
      return 'cloudy';
    }
    if (code >= 45 && code <= 48) {
      // Foggy - show fog with sun or moon based on time
      return isNightTime ? 'fog-night' : 'fog-day';
    }
    if (code >= 51 && code <= 67) {
      // Rain - show rain animation
      return 'rain';
    }
    if (code >= 71 && code <= 77) {
      // Snow - show snow animation
      return 'snow';
    }
    if (code >= 80 && code <= 82) {
      // Rain showers - show rain animation
      return 'rain';
    }
    if (code >= 85 && code <= 86) {
      // Snow showers - show snow animation
      return 'snow';
    }
    if (code >= 95 && code <= 99) {
      // Thunderstorm - show thunder animation
      return 'thunder';
    }
    
    // Default to sun or moon based on time
    return isNightTime ? 'moon' : 'sun';
  };

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

  const startWeatherAnimation = (weatherType) => {
    // Clear any existing animations
    const container = cardRef.current;
    if (!container) return;

    // Remove existing animation elements
    const existingElements = container.querySelectorAll('.weather-animation-element');
    existingElements.forEach(el => el.remove());

    switch (weatherType) {
      case 'sun':
        animateSun();
        break;
      case 'moon':
        animateMoon();
        break;
      case 'cloudy-day':
        animateCloudyDay();
        break;
      case 'cloudy-night':
        animateCloudyNight();
        break;
      case 'fog-day':
        animateFogDay();
        break;
      case 'fog-night':
        animateFogNight();
        break;
      case 'rain':
        animateRain();
        break;
      case 'snow':
        animateSnow();
        break;
      case 'thunder':
        animateThunder();
        break;
      case 'cloudy':
        animateClouds();
        break;
      default:
        animateSun();
    }
  };

  const createAnimationElement = (className, iconComponent = null) => {
    const element = document.createElement('div');
    element.className = `weather-animation-element ${className}`;
    if (cardRef.current) {
      cardRef.current.appendChild(element);
    }
    return element;
  };

  const animateSun = () => {
    // Create sun element directly
    const sunElement = createAnimationElement('sun-element');
    sunElement.innerHTML = '☀️';

    // Sun rotation animation
    animate('.sun-element', {
      rotate: '360deg',
      duration: 10000,
      loop: true,
      easing: 'linear'
    });
  };

  const animateMoon = () => {
    // Create moon element directly
    const moonElement = createAnimationElement('moon-element');
    moonElement.innerHTML = '🌙';
    
    // Create stars
    for (let i = 0; i < 8; i++) {
      const star = createAnimationElement('star');
      star.innerHTML = '⭐';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
    }

    // Moon glow animation
    animate('.moon-element', {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      duration: 3000,
      loop: true,
      easing: 'easeInOutQuad'
    });

    // Stars animation
    animate('.star', {
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
      duration: 2000,
      loop: true,
      delay: stagger(300),
      easing: 'easeInOutQuad'
    });
  };

  const animateCloudyDay = () => {
    // Create sun behind clouds
    const sunElement = createAnimationElement('sun-element');
    sunElement.innerHTML = '☀️';
    
    // Create clouds
    for (let i = 0; i < 3; i++) {
      const cloud = createAnimationElement('cloud-element');
      cloud.innerHTML = '☁️';
      cloud.style.left = `${20 + i * 25}%`;
      cloud.style.top = `${30 + i * 10}%`;
    }

    // Sun behind clouds animation
    animate('.sun-element', {
      opacity: [0.6, 0.9, 0.6],
      scale: [0.8, 1, 0.8],
      duration: 4000,
      loop: true,
      easing: 'easeInOutQuad'
    });

    // Cloud movement
    animate('.cloud-element', {
      translateX: [0, 30, 0],
      opacity: [0.7, 1, 0.7],
      duration: 5000,
      loop: true,
      delay: stagger(1000),
      easing: 'easeInOutQuad'
    });
  };

  const animateCloudyNight = () => {
    // Create moon behind clouds
    const moonElement = createAnimationElement('moon-element');
    moonElement.innerHTML = '🌙';
    
    // Create clouds
    for (let i = 0; i < 3; i++) {
      const cloud = createAnimationElement('cloud-element');
      cloud.innerHTML = '☁️';
      cloud.style.left = `${20 + i * 25}%`;
      cloud.style.top = `${30 + i * 10}%`;
    }

    // Moon behind clouds animation
    animate('.moon-element', {
      opacity: [0.6, 0.9, 0.6],
      scale: [0.8, 1, 0.8],
      duration: 4000,
      loop: true,
      easing: 'easeInOutQuad'
    });

    // Cloud movement
    animate('.cloud-element', {
      translateX: [0, 30, 0],
      opacity: [0.7, 1, 0.7],
      duration: 5000,
      loop: true,
      delay: stagger(1000),
      easing: 'easeInOutQuad'
    });
  };

  const animateFogDay = () => {
    // Create sun behind fog
    const sunElement = createAnimationElement('sun-element');
    sunElement.innerHTML = '☀️';
    
    // Create fog elements
    for (let i = 0; i < 5; i++) {
      const fog = createAnimationElement('fog-element');
      fog.innerHTML = '☁️';
      fog.style.left = `${Math.random() * 100}%`;
      fog.style.top = `${Math.random() * 100}%`;
    }

    // Fog animation
    animate('.fog-element', {
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.1, 1],
      duration: 4000,
      loop: true,
      easing: 'easeInOutQuad'
    });

    // Sun behind fog
    animate('.sun-element', {
      opacity: [0.5, 0.8, 0.5],
      scale: [0.8, 1, 0.8],
      duration: 3000,
      loop: true,
      easing: 'easeInOutQuad'
    });
  };

  const animateFogNight = () => {
    // Create moon behind fog
    const moonElement = createAnimationElement('moon-element');
    moonElement.innerHTML = '🌙';
    
    // Create fog elements
    for (let i = 0; i < 5; i++) {
      const fog = createAnimationElement('fog-element');
      fog.innerHTML = '☁️';
      fog.style.left = `${Math.random() * 100}%`;
      fog.style.top = `${Math.random() * 100}%`;
    }

    // Fog animation
    animate('.fog-element', {
      opacity: [0.3, 0.8, 0.3],
      scale: [1, 1.1, 1],
      duration: 4000,
      loop: true,
      easing: 'easeInOutQuad'
    });

    // Moon behind fog
    animate('.moon-element', {
      opacity: [0.5, 0.8, 0.5],
      scale: [0.8, 1, 0.8],
      duration: 3000,
      loop: true,
      easing: 'easeInOutQuad'
    });
  };

  const animateRain = () => {
    // Create cloud
    const cloud = createAnimationElement('cloud-element');
    cloud.innerHTML = '☁️';
    
    // Create rain container
    const rainContainer = createAnimationElement('rain-container');
    
    // Create rain drops
    for (let i = 0; i < 30; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      rainContainer.appendChild(drop);
    }

    // Rain animation
    animate('.rain-drop', {
      translateY: [0, 200],
      opacity: [1, 0],
      duration: 1000,
      loop: true,
      delay: stagger(50),
      easing: 'easeInQuad'
    });

    // Cloud animation
    animate('.cloud-element', {
      translateX: [0, 20, 0],
      opacity: [0.7, 1, 0.7],
      duration: 3000,
      loop: true,
      easing: 'easeInOutQuad'
    });
  };

  const animateSnow = () => {
    // Create cloud
    const cloud = createAnimationElement('cloud-element');
    cloud.innerHTML = '☁️';
    
    // Create snow container
    const snowContainer = createAnimationElement('snow-container');
    
    // Create snow flakes
    for (let i = 0; i < 25; i++) {
      const flake = document.createElement('div');
      flake.className = 'snow-flake';
      flake.innerHTML = '❄️';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDelay = `${Math.random() * 3}s`;
      snowContainer.appendChild(flake);
    }

    // Snow animation
    animate('.snow-flake', {
      translateY: [0, 200],
      translateX: [0, 50],
      rotate: '360deg',
      opacity: [1, 0],
      duration: 3000,
      loop: true,
      delay: stagger(100),
      easing: 'easeInOutQuad'
    });

    // Cloud animation
    animate('.cloud-element', {
      translateX: [0, 20, 0],
      opacity: [0.7, 1, 0.7],
      duration: 3000,
      loop: true,
      easing: 'easeInOutQuad'
    });
  };

  const animateThunder = () => {
    // Create cloud
    const cloud = createAnimationElement('cloud-element');
    cloud.innerHTML = '☁️';
    
    // Create lightning
    const lightning = createAnimationElement('lightning-element');
    lightning.innerHTML = '⚡';
    
    // Create rain container
    const rainContainer = createAnimationElement('rain-container');
    
    // Create rain drops
    for (let i = 0; i < 20; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      rainContainer.appendChild(drop);
    }

    // Lightning flash
    animate('.lightning-element', {
      opacity: [0, 1, 0],
      scale: [1, 1.2, 1],
      duration: 200,
      loop: true,
      delay: 2000,
      easing: 'easeInOutQuad'
    });

    // Rain animation
    animate('.rain-drop', {
      translateY: [0, 200],
      opacity: [1, 0],
      duration: 1000,
      loop: true,
      delay: stagger(50),
      easing: 'easeInQuad'
    });

    // Cloud animation
    animate('.cloud-element', {
      translateX: [0, 20, 0],
      opacity: [0.7, 1, 0.7],
      duration: 3000,
      loop: true,
      easing: 'easeInOutQuad'
    });
  };

  const animateClouds = () => {
    // Create multiple clouds
    for (let i = 0; i < 3; i++) {
      const cloud = createAnimationElement('cloud-element');
      cloud.innerHTML = '☁️';
      cloud.style.left = `${20 + i * 30}%`;
      cloud.style.top = `${20 + i * 10}%`;
    }

    // Cloud movement
    animate('.cloud-element', {
      translateX: [0, 50, 0],
      opacity: [0.7, 1, 0.7],
      duration: 4000,
      loop: true,
      delay: stagger(500),
      easing: 'easeInOutQuad'
    });
  };

  if (!weatherData) return null;

  const current = weatherData.current;
  const formatTemperature = (temp) => Math.round(temp);

  return (
    <motion.div
      ref={cardRef}
      className={`animated-weather-card ${currentWeather} ${darkMode ? 'dark-mode' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Weather Information */}
      <div className="weather-info">
        <div className="temperature">
          {formatTemperature(current.temperature_2m)}
          <span className="unit">°C</span>
        </div>
        <div className="weather-description">
          {getWeatherDescription(current.weather_code)}
        </div>
        <div className="weather-details">
          <div className="detail">
            <span className="icon">💧</span>
            <span>{current.relative_humidity_2m}%</span>
          </div>
          <div className="detail">
            <span className="icon">💨</span>
            <span>{Math.round(current.wind_speed_10m)} km/h</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animated-weather-card {
          position: relative;
          width: 300px;
          height: 400px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 2rem;
          color: white;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .dark-mode.animated-weather-card {
          background: rgba(0, 0, 0, 0.2);
        }

        .animated-weather-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 20px;
          pointer-events: none;
        }

        /* Weather Animation Elements */
        .weather-animation-element {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }

        /* Sun Animation Styles */
        .sun-element {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 4rem;
          filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.5));
          z-index: 2;
        }

        .sun-ray {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 20px;
          background: rgba(255, 255, 0, 0.8);
          border-radius: 1px;
          transform-origin: center 30px;
          margin-top: -10px;
          margin-left: -1px;
        }

        /* Moon Animation Styles */
        .moon-element {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 4rem;
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.5));
          z-index: 2;
        }

        .star {
          position: absolute;
          font-size: 1rem;
          color: white;
          filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
          z-index: 1;
        }

        /* Fog Animation Styles */
        .fog-element {
          position: absolute;
          font-size: 2rem;
          opacity: 0.6;
          filter: blur(1px);
          z-index: 1;
        }

        /* Rain Animation Styles */
        .rain-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .rain-drop {
          position: absolute;
          width: 2px;
          height: 20px;
          background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8));
          border-radius: 0 0 2px 2px;
        }

        /* Snow Animation Styles */
        .snow-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .snow-flake {
          position: absolute;
          font-size: 1rem;
          color: white;
        }

        /* Thunder Animation Styles */
        .lightning-element {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 3rem;
          filter: drop-shadow(0 0 20px rgba(255, 255, 0, 0.8));
          z-index: 3;
        }

        /* Cloud Animation Styles */
        .cloud-element {
          position: absolute;
          font-size: 2rem;
          opacity: 0.8;
          z-index: 1;
        }

        /* Weather Info Styles */
        .weather-info {
          position: relative;
          z-index: 2;
          text-align: center;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .temperature {
          font-size: 4rem;
          font-weight: 700;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .unit {
          font-size: 1.5rem;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        .weather-description {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          text-transform: capitalize;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .weather-details {
          display: flex;
          justify-content: space-around;
          gap: 1rem;
        }

        .detail {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
        }

        .icon {
          font-size: 1.25rem;
        }

        /* Weather Type Specific Styles */
        .rain {
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        }

        .snow {
          background: linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%);
          color: #2d3436;
        }

        .thunder {
          background: linear-gradient(135deg, #636e72 0%, #2d3436 100%);
        }

        .fog-day, .fog-night {
          background: linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%);
        }

        .moon {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        }

        .sun {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
        }

        .cloudy-day {
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
        }

        .cloudy-night {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        }

        @media (max-width: 768px) {
          .animated-weather-card {
            width: 280px;
            height: 350px;
            padding: 1.5rem;
          }

          .temperature {
            font-size: 3rem;
          }

          .weather-description {
            font-size: 1rem;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AnimatedWeatherCard; 