"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/types";
import { fetchProducts } from "@/services/api";
import { debounce } from "@/utils/helpers";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  autocomplete?: boolean;
  autocompleteMs?: number;
  autocompleteMinChars?: number;
  autocompleteLimit?: number;
  onSelectSuggestion?: (product: Product) => void;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Поиск по названию и описанию...",
  debounceMs = 300,
  autocomplete = true,
  autocompleteMs = 200,
  autocompleteMinChars = 2,
  autocompleteLimit = 6,
  onSelectSuggestion,
}: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const debouncedOnChange = useMemo(
    () => debounce((...args: unknown[]) => onChange(args[0] as string), debounceMs),
    [onChange, debounceMs]
  );

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        if (!autocomplete) return;
        const q = String(args[0] ?? "").trim();
        if (q.length < autocompleteMinChars) {
          setSuggestions([]);
          setOpen(false);
          setHighlighted(-1);
          return;
        }

        const seq = ++requestSeq.current;
        setLoading(true);
        fetchProducts({
          search: q,
          limit: autocompleteLimit,
          offset: 0,
          sort_by: "name",
          sort_order: "asc",
        })
          .then((res) => {
            if (seq !== requestSeq.current) return;
            setSuggestions(res.results ?? []);
            setOpen((res.results ?? []).length > 0);
            setHighlighted(-1);
          })
          .catch(() => {
            if (seq !== requestSeq.current) return;
            setSuggestions([]);
            setOpen(false);
            setHighlighted(-1);
          })
          .finally(() => {
            if (seq === requestSeq.current) setLoading(false);
          });
      }, autocompleteMs),
    [autocomplete, autocompleteLimit, autocompleteMinChars, autocompleteMs]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    debouncedOnChange(v);
    if (autocomplete) debouncedFetchSuggestions(v);
  };

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!rootRef.current.contains(e.target)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const selectSuggestion = (p: Product) => {
    setLocal(p.name);
    setOpen(false);
    setHighlighted(-1);
    setSuggestions([]);
    if (onSelectSuggestion) {
      onSelectSuggestion(p);
    } else {
      onChange(p.name);
    }
  };

  const listboxId = "searchbar-suggestions";

  return (
    <div ref={rootRef} className="w-full max-w-xl mx-auto relative">
      <input
        type="search"
        value={local}
        onChange={handleChange}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!autocomplete) return;
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp") && suggestions.length > 0) {
            setOpen(true);
            return;
          }
          if (!open) return;
          if (e.key === "Escape") {
            setOpen(false);
            setHighlighted(-1);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlighted((i) => Math.min(i + 1, suggestions.length - 1));
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlighted((i) => Math.max(i - 1, 0));
            return;
          }
          if (e.key === "Enter") {
            if (highlighted >= 0 && highlighted < suggestions.length) {
              e.preventDefault();
              selectSuggestion(suggestions[highlighted]);
            }
          }
        }}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors"
        aria-label="Поиск"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
      />

      {autocomplete && open ? (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          {loading ? (
            <div className="px-4 py-3 text-sm text-slate-500">Ищем…</div>
          ) : (
            <ul id={listboxId} role="listbox" className="max-h-72 overflow-auto">
              {suggestions.map((p, idx) => (
                <li key={p.id} role="option" aria-selected={idx === highlighted}>
                  <button
                    type="button"
                    className={
                      "w-full text-left px-4 py-2.5 text-sm transition-colors " +
                      (idx === highlighted ? "bg-emerald-50" : "hover:bg-slate-50")
                    }
                    onMouseEnter={() => setHighlighted(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectSuggestion(p)}
                  >
                    <div className="font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.category}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
