import { useState } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';

function App() {
  const [city, setCity] = useState(null);

  const handleCitySelect = (city) => {
    setCity(city);
  };

  return (
    
    <Container fluid>
<Navbar bg="primary" variant="dark" expand="lg">
  <Container>
    <Navbar.Brand href="https://github.com/Mithilsai/React-Strom" target="_blank">React Strom</Navbar.Brand>
    <Navbar.Collapse className="justify-content-end">
      <Nav>
        <Nav.Link href="https://mithilsai.github.io/" target="_blank">Creator</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>


      <Container className="mt-5 pt-5">
        <SearchBar onCitySelect={handleCitySelect} />
        {city && <WeatherCard city={city} />}
      </Container>

      <footer className="bg-primary text-white text-center py-3 mt-5">
        <p>&copy; {new Date().getFullYear()} React Strom Weather App</p>
      </footer>
    </Container>
  );
}

export default App;
