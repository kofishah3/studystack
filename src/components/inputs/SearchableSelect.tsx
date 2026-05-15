"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown } from "lucide-react";

interface SearchableSelectProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: string[];
  placeholder?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectwLabelProps extends SearchableSelectProps {
  label: string;
}

export default function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
        onChange({ target: { name, value: searchTerm } });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchTerm, name, onChange]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    setSearchTerm(option);
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setSearchTerm(newVal);
    onChange({ target: { name, value: newVal } });
    if (!isOpen) setIsOpen(true);
  };

  return (
    <div
      ref={containerRef}
      id={`${id || name}-container`}
      className="relative w-full"
    >
      <div
        className={`
          group w-full h-fit p-1 cursor-text
          border border-border rounded-xl bg-surface/50
          ${isOpen ? "border-primary-500 ring-1 ring-primary-500" : "hover:border-primary-300 hover:ring-1 hover:ring-primary-300"}
          transition-all duration-200 ease-in-out
        `}
      >
        <div className="flex flex-row items-center px-2 gap-5">
          {icon || <Search size={18} className="mr-2 text-muted shrink-0" />}
          <input
            id={id}
            name={name}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder || "Type to search..."}
            autoComplete="off"
            className="w-full bg-transparent outline-none border-none text-text text-sm placeholder:text-muted py-2"
          />
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-500" : ""}`}
          />
        </div>
      </div>

      {isOpen &&
        filteredOptions.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            id={`${id || name}-dropdown`}
            style={{
              position: "absolute",
              top: `${coords.top + 8}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
            }}
            className="
              z-9999
              bg-surface border border-border rounded-xl shadow-2xl
              overflow-hidden animate-in fade-in zoom-in-95 duration-150
            "
          >
            <div className="p-1 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.map((opt) => (
                <div
                  key={opt}
                  id={`${id || name}-option-${opt.replace(/\s+/g, "-")}`}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSelect(opt);
                  }}
                  className={`
                    px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
                    ${
                      value === opt
                        ? "bg-primary-500/10 text-primary-500 font-semibold"
                        : "text-text hover:bg-muted/10"
                    }
                  `}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function SearchableSelectwLabel({
  label,
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: SearchableSelectwLabelProps) {
  return (
    <div
      id={`${id || name}-field-group`}
      className="flex flex-col gap-1 w-full"
    >
      <p id={`${id || name}-label`} className="font-medium text-text text-sm">
        {label}
      </p>
      <SearchableSelect
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        icon={icon}
      />
    </div>
  );
}
