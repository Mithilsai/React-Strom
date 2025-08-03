import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  const [loadingText, setLoadingText] = useState('Initializing WeatherPro...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadingSteps = [
      { text: 'Connecting to weather services...', duration: 800 },
      { text: 'Loading weather data...', duration: 600 },
      { text: 'Preparing your dashboard...', duration: 600 },
      { text: 'Almost ready...', duration: 400 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text);
        setProgress(((currentStep + 1) / loadingSteps.length) * 100);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="loading-content"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Weather Icon Animation */}
        <motion.div
          className="weather-icon-container"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <div className="weather-icon">🌤️</div>
        </motion.div>

        {/* Loading Text */}
        <motion.h1 
          className="loading-text"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          WeatherPro
        </motion.h1>

        <motion.p 
          className="loading-subtext"
          key={loadingText}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loadingText}
        </motion.p>

        {/* Progress Bar */}
        <div className="progress-container">
          <motion.div 
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Loading Dots */}
        <div className="loading-dots">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="loading-dot"
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Background Weather Elements */}
      <div className="background-weather">
        {[...Array(6)].map((_, index) => (
          <motion.div
            key={index}
            className="floating-cloud"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 50, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            ☁️
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .weather-icon-container {
          margin-bottom: 2rem;
        }

        .weather-icon {
          font-size: 4rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .progress-container {
          width: 300px;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          margin: 2rem auto;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #60a5fa, #3b82f6);
          border-radius: 3px;
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }

        .background-weather {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-cloud {
          position: absolute;
          font-size: 2rem;
          opacity: 0.3;
        }

        .loading-content {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </motion.div>
  );
};

export default LoadingScreen; 