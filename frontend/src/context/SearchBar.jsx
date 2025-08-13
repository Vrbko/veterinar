import React, { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleChange}
        className="search-input"
      />
      <button className="btn btn-primary" aria-label="Search">
        🔍
      </button>
    </div>
  );
}
