import { useState } from 'react'
import './SearchBar.css'

function SearchBar({ searchQuery, onSearch }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search establishments..."
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
        className="search-input"
      />
      {searchQuery && (
        <button className="search-clear" onClick={() => onSearch('')}>
          ✕
        </button>
      )}
    </div>
  )
}

export default SearchBar
