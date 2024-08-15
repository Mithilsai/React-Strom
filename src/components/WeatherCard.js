import { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const WeatherChart = ({ data }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Temperature',
        data: data.values,
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
      },
    ],
  };

  return <Line data={chartData} />;
};

const WeatherCard = ({ city }) => {
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: city.lat,
            longitude: city.lon,
            hourly: 'temperature_2m',
            current_weather: true,
            timezone: 'auto'
          }
        });

        const hourlyData = response.data.hourly;
        const labels = hourlyData.time;
        const values = hourlyData.temperature_2m;

        setWeatherData({ labels, values });
      } catch (error) {
        setError('Failed to fetch weather data.');
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, [city]);

  if (error) {
    return (
      <Card bg="light" text="dark" className="mb-4">
        <Card.Body>
          <Card.Text>{error}</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card bg="light" text="dark" className="mb-4">
      <Card.Header>Weather in {city.name}</Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            {weatherData ? (
              <>
                <Card.Text>Current Temperature: {weatherData.values[0]}°C</Card.Text>
                <WeatherChart data={weatherData} />
              </>
            ) : (
              <Spinner animation="border" />
            )}
          </Col>
          <Col md={6}>
            <Card.Text>Map of {city.name}</Card.Text>
            <MapContainer
              center={[city.lat, city.lon]}
              zoom={13}
              style={{ height: '300px', width: '100%' }}
              key={city.name}  // This key helps to re-render the map when city changes
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[city.lat, city.lon]}>
                <Popup>{city.name}</Popup>
              </Marker>
            </MapContainer>
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer className="text-muted">Data provided by Open-Meteo API</Card.Footer>
    </Card>
  );
};

export default WeatherCard;
