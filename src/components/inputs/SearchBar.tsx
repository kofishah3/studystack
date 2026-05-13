"use client";

import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  initialValue?: string;
  id?: string;
}

export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  initialValue = "",
  id = "search-bar",
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full group" id={`${id}-form`}>
      <div className="relative flex items-center">
        <Search
          className="absolute left-4 text-gray-400 group-focus-within:text-primary-500 transition-colors pointer-events-none"
          size={18}
        />
        <input
          id={id}
          type="text"
          name="search"
          placeholder={placeholder}
          defaultValue={initialValue}
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
        />
      </div>
    </form>
  );
}
