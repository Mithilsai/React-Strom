import React from 'react';

const RainViewerMap = ({ city, darkMode }) => {
  // Generate RainViewer URL with city coordinates
  const generateRainViewerUrl = (lat, lon) => {
    // Minimal settings to reduce controls
    const zoom = 8;
    return `https://www.rainviewer.com/map.html?loc=${lat},${lon},${zoom}&oCS=1&oAP=1&c=3&o=83&lm=0&layer=radar&sm=1&sn=0&hideControls=1&noControls=1&minimal=1`;
  };

  const rainViewerUrl = generateRainViewerUrl(city.lat, city.lon);

  return (
    <div className="rainviewer-container-clean">
      <iframe 
        src={rainViewerUrl}
        width="100%" 
        height="400px"
        frameBorder="0" 
        style={{ 
          border: 0, 
          borderRadius: '0',
          background: 'transparent'
        }} 
        allowFullScreen
        title="RainViewer Weather Radar"
        onLoad={(e) => {
          // Try to hide controls via CSS injection
          try {
            const iframe = e.target;
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
              const style = iframeDoc.createElement('style');
              style.textContent = `
                .rv-controls, .rv-control-bar, .rv-time-controls, .rv-playback-controls {
                  display: none !important;
                }
                .rv-map-container {
                  height: 100% !important;
                }
              `;
              iframeDoc.head.appendChild(style);
            }
          } catch (error) {
            // Cross-origin restrictions may prevent this
            console.log('Could not inject CSS into RainViewer iframe');
          }
        }}
      />
    </div>
  );
};

export default RainViewerMap; 