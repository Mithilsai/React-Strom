import React, { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

const DynamicBackground = ({ weatherData, darkMode }) => {
  const backgroundRef = useRef(null);

  const setDefaultBackground = (container) => {
    // Clear existing background elements
    container.innerHTML = '';

    // Set default background
    container.style.backgroundImage = 'url(/default.jpg)';
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.backgroundRepeat = 'no-repeat';
    container.style.backgroundColor = '#667eea';

    // Add glass effect overlay
    const glassOverlay = document.createElement('div');
    glassOverlay.className = 'glass-overlay';
    container.appendChild(glassOverlay);
  };

  // Set default background on mount
  useEffect(() => {
    if (backgroundRef.current) {
      console.log('Setting default background on mount');
      setDefaultBackground(backgroundRef.current);
    }
  }, []);

  useEffect(() => {
    console.log('DynamicBackground useEffect triggered:', { weatherData, darkMode });
    
    if (backgroundRef.current) {
      if (weatherData && weatherData.current) {
        const weatherType = getWeatherType(weatherData.current.weather_code);
        const isNight = isNightTime(weatherData);
        console.log('Weather data available:', { weatherType, isNight, weatherCode: weatherData.current.weather_code });
        createDynamicBackground(weatherType, isNight);
      } else {
        console.log('No weather data, setting default background');
        // Set default background when no weather data
        setDefaultBackground(backgroundRef.current);
      }
    }
  }, [weatherData, darkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNightTime = (weatherData) => {
    if (weatherData && weatherData.timezone) {
      const locationTime = new Date().toLocaleString('en-US', {
        timeZone: weatherData.timezone
      });
      const locationDate = new Date(locationTime);
      const currentHour = locationDate.getHours();
      return currentHour >= 18 || currentHour <= 6;
    }
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour <= 6;
  };

  const getWeatherType = (code) => {
    if (code >= 0 && code <= 3) return 'clear';
    if (code >= 45 && code <= 48) return 'foggy';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 77) return 'snowy';
    if (code >= 80 && code <= 82) return 'rainy';
    if (code >= 85 && code <= 86) return 'snowy';
    if (code >= 95 && code <= 99) return 'stormy';
    return 'clear';
  };



  const createDynamicBackground = (weatherType, isNight) => {
    const container = backgroundRef.current;
    if (!container) return;

    console.log('Creating dynamic background:', { weatherType, isNight });

    // Clear existing background elements
    container.innerHTML = '';

    // Set background image based on weather type and time
    setBackgroundImage(container, weatherType, isNight);

    // Add weather-specific overlay effects
    addWeatherOverlay(container, weatherType, isNight);
  };

  const setBackgroundImage = (container, weatherType, isNight) => {
    const backgrounds = {
      clear: {
        day: '/sun.avif',
        night: '/night.jpg'
      },
      foggy: {
        day: '/fog.jpg',
        night: '/fog.jpg'
      },
      rainy: {
        day: '/rain.jpg',
        night: '/rain.jpg'
      },
      snowy: {
        day: '/snow.avif',
        night: '/snow.avif'
      },
      stormy: {
        day: '/rain.jpg',
        night: '/rain.jpg'
      }
    };

    const timeOfDay = isNight ? 'night' : 'day';
    const background = backgrounds[weatherType][timeOfDay];

    console.log('Setting background:', { weatherType, timeOfDay, background });

    // Set image background
    container.style.backgroundImage = `url(${background})`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
    container.style.backgroundRepeat = 'no-repeat';
    
    // Add a fallback background color
    container.style.backgroundColor = '#667eea';
  };

  const addWeatherOverlay = (container, weatherType, isNight) => {
    // Add glass effect overlay
    const glassOverlay = document.createElement('div');
    glassOverlay.className = 'glass-overlay';
    container.appendChild(glassOverlay);

    // Add weather-specific animations
    switch (weatherType) {
      case 'clear':
        if (isNight) {
          addNightEffects(container);
        } else {
          addSunnyEffects(container);
        }
        break;
      case 'foggy':
        addFogEffects(container, isNight);
        break;
      case 'rainy':
        addRainEffects(container, isNight);
        break;
      case 'snowy':
        addSnowEffects(container, isNight);
        break;
      case 'stormy':
        addStormEffects(container, isNight);
        break;
      default:
        addSunnyEffects(container);
    }
  };

  const addSunnyEffects = (container) => {
    // Add floating particles for sunny day
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'sunny-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 3}s`;
      container.appendChild(particle);
    }

    // Animate particles
    animate('.sunny-particle', {
      translateY: [0, -50],
      opacity: [0, 0.6, 0],
      scale: [0, 1, 0],
      duration: 4000,
      loop: true,
      delay: stagger(200),
      easing: 'easeInOutQuad'
    });
  };

  const addNightEffects = (container) => {
    // Add stars for night
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.className = 'night-star';
      star.innerHTML = '⭐';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 60}%`;
      star.style.fontSize = `${0.5 + Math.random() * 1}rem`;
      container.appendChild(star);
    }

    // Animate stars
    animate('.night-star', {
      opacity: [0.3, 1, 0.3],
      scale: [0.8, 1.2, 0.8],
      duration: 3000,
      loop: true,
      delay: stagger(100),
      easing: 'easeInOutQuad'
    });
  };

  const addFogEffects = (container, isNight) => {
    // Add fog layers
    for (let i = 0; i < 8; i++) {
      const fog = document.createElement('div');
      fog.className = 'fog-layer';
      fog.style.left = `${Math.random() * 100}%`;
      fog.style.top = `${Math.random() * 100}%`;
      fog.style.opacity = '0.4';
      container.appendChild(fog);
    }

    // Animate fog
    animate('.fog-layer', {
      translateX: [0, 50, 0],
      opacity: [0.2, 0.6, 0.2],
      scale: [1, 1.2, 1],
      duration: 8000,
      loop: true,
      delay: stagger(1000),
      easing: 'easeInOutQuad'
    });
  };

  const addRainEffects = (container, isNight) => {
    // Create rain container
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain-container';
    container.appendChild(rainContainer);

    // Create rain drops
    for (let i = 0; i < 100; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      rainContainer.appendChild(drop);
    }

    // Animate rain
    animate('.rain-drop', {
      translateY: [0, window.innerHeight],
      opacity: [1, 0],
      duration: 1000,
      loop: true,
      delay: stagger(20),
      easing: 'easeInQuad'
    });
  };

  const addSnowEffects = (container, isNight) => {
    // Create snow container
    const snowContainer = document.createElement('div');
    snowContainer.className = 'snow-container';
    container.appendChild(snowContainer);

    // Create snow flakes
    for (let i = 0; i < 80; i++) {
      const flake = document.createElement('div');
      flake.className = 'snow-flake';
      flake.innerHTML = '❄️';
      flake.style.left = `${Math.random() * 100}%`;
      flake.style.animationDelay = `${Math.random() * 3}s`;
      flake.style.fontSize = `${0.5 + Math.random() * 1}rem`;
      snowContainer.appendChild(flake);
    }

    // Animate snow
    animate('.snow-flake', {
      translateY: [0, window.innerHeight],
      translateX: [0, 50],
      rotate: '360deg',
      opacity: [1, 0],
      duration: 4000,
      loop: true,
      delay: stagger(50),
      easing: 'easeInOutQuad'
    });
  };

  const addStormEffects = (container, isNight) => {
    // Create lightning
    const lightning = document.createElement('div');
    lightning.className = 'lightning';
    lightning.innerHTML = '⚡';
    lightning.style.fontSize = '4rem';
    lightning.style.opacity = '0';
    container.appendChild(lightning);

    // Create rain
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain-container';
    container.appendChild(rainContainer);

    for (let i = 0; i < 120; i++) {
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      rainContainer.appendChild(drop);
    }

    // Animate lightning
    animate('.lightning', {
      opacity: [0, 1, 0],
      scale: [1, 1.2, 1],
      duration: 200,
      loop: true,
      delay: 3000,
      easing: 'easeInOutQuad'
    });

    // Animate rain
    animate('.rain-drop', {
      translateY: [0, window.innerHeight],
      opacity: [1, 0],
      duration: 800,
      loop: true,
      delay: stagger(15),
      easing: 'easeInQuad'
    });
  };

  return (
    <div ref={backgroundRef} className="dynamic-background">
      {/* Debug buttons - remove in production */}
      <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 9999, display: 'flex', gap: '5px', flexDirection: 'column' }}>
        <button onClick={() => setBackgroundImage(backgroundRef.current, 'clear', false)} style={{ padding: '8px', fontSize: '12px', backgroundColor: 'white', border: '1px solid black' }}>Sun</button>
        <button onClick={() => setBackgroundImage(backgroundRef.current, 'clear', true)} style={{ padding: '8px', fontSize: '12px', backgroundColor: 'white', border: '1px solid black' }}>Night</button>
        <button onClick={() => setBackgroundImage(backgroundRef.current, 'rainy', false)} style={{ padding: '8px', fontSize: '12px', backgroundColor: 'white', border: '1px solid black' }}>Rain</button>
        <button onClick={() => setBackgroundImage(backgroundRef.current, 'snowy', false)} style={{ padding: '8px', fontSize: '12px', backgroundColor: 'white', border: '1px solid black' }}>Snow</button>
        <button onClick={() => setBackgroundImage(backgroundRef.current, 'foggy', false)} style={{ padding: '8px', fontSize: '12px', backgroundColor: 'white', border: '1px solid black' }}>Fog</button>
        <button onClick={() => {
          console.log('Testing direct background set');
          backgroundRef.current.style.backgroundImage = 'url(/default.jpg)';
          backgroundRef.current.style.backgroundSize = 'cover';
        }} style={{ padding: '8px', fontSize: '12px', backgroundColor: 'red', color: 'white', border: '1px solid black' }}>Test Default</button>
      </div>
    </div>
  );
};

export default DynamicBackground; 