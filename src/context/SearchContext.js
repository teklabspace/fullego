'use client';
import { createContext, useContext, useState } from 'react';

// Shared search term driven by the Navbar search box and consumed by the active
// page (e.g. Assets, Concierge). Lets one navbar input search whatever tab is open.
const SearchContext = createContext({ query: '', setQuery: () => {} });

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('');
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
