import { useEffect, useState } from "react";
import api from "../api/axios";

export default function FilterBar({
  vehicleType,
  setVehicleType,
  category,
  setCategory,
  location,
  setLocation,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  fuelType,          
  setFuelType,     
}) {
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get("/vehicles/locations");
        setAllLocations(res.data);
      } catch {
        setAllLocations([]);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationChange = (value) => {
    setLocation(value);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const matches = allLocations.filter((loc) =>
      loc.toLowerCase().includes(value.toLowerCase())
    );

    setSuggestions(matches);
    setShowSuggestions(true);
  };

  const handleSelect = (loc) => {
    setLocation(loc);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      {/* Location */}
      <div className="relative col-span-2 md:col-span-1">
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => handleLocationChange(e.target.value)}
          className="border rounded px-3 py-2 text-sm w-full"
        />

        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-30 bg-white border rounded mt-1 w-full max-h-40 overflow-y-auto shadow text-sm">
            {suggestions.map((loc) => (
              <li
                key={loc}
                onClick={() => handleSelect(loc)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
              >
                {loc}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Vehicle Type */}
      <select
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All Types</option>
        <option value="car">Car</option>
        <option value="bike">Bike</option>
        <option value="suv">SUV</option>
      </select>

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All Categories</option>
        <option value="economy">Economy</option>
        <option value="premium">Premium</option>
        <option value="luxury">Luxury</option>
      </select>

      {/* Fuel Type */}
      <select
        value={fuelType}
        onChange={(e) => setFuelType(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All Fuel Types</option>
        <option value="petrol">Petrol</option>
        <option value="diesel">Diesel</option>
        <option value="electric">Electric</option>
        <option value="cng">CNG</option>
        <option value="hybrid">Hybrid</option>
      </select>

      {/* Min Price */}
      <input
        type="number"
        placeholder="Min ₹"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      />

      {/* Max Price */}
      <input
        type="number"
        placeholder="Max ₹"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      />
    </div>
  );
}
