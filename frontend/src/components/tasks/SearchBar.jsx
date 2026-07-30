import { FaSearch } from "react-icons/fa";

function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="search-bar">
      <FaSearch className="search-icon" />

      <input
        type="text"
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;