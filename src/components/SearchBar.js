import { useState } from 'react';
import { Form, Button, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';

const SearchBar = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
        }
      });
      setSuggestions(response.data);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  const handleSelect = (city) => {
    onCitySelect({ name: city.display_name, lat: city.lat, lon: city.lon });
    setQuery('');
    setSuggestions([]);
  };

  return (
    <Form onSubmit={handleSearch}>
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search for a city"
          aria-label="City"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button variant="primary" type="submit">Search</Button>
      </InputGroup>
      {suggestions.length > 0 && (
        <ul className="list-group">
          {suggestions.map((city, index) => (
            <li key={index} className="list-group-item list-group-item-action" onClick={() => handleSelect(city)}>
              {city.display_name}
            </li>
          ))}
        </ul>
      )}
    </Form>
  );
};

export default SearchBar;
