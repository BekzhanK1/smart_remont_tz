"use client";

import { useCallback, useState } from "react";
import { debounce } from "@/utils/helpers";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Поиск по названию и описанию...",
  debounceMs = 300,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);

  const debouncedOnChange = useCallback(
    debounce((v: string) => onChange(v), debounceMs),
    [onChange, debounceMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    debouncedOnChange(v);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <input
        type="search"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
        aria-label="Поиск"
      />
    </div>
  );
}
