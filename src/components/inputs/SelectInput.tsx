"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id?: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
}

interface SelectInputwLabelProps extends SelectInputProps {
  label: string;
}

export default function SelectInput({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideContainer = containerRef.current?.contains(target);
      const isInsideDropdown = dropdownRef.current?.contains(target);

      if (!isInsideContainer && !isInsideDropdown) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleSelect = (optionValue: string) => {
    onChange({ target: { name, value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      id={`${id || name}-container`}
      className="relative w-full"
    >
      <div
        id={id || name}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id || name}-label`}
        className={`
          group w-full h-fit p-1 cursor-pointer
          border border-border rounded-xl bg-surface/50
          ${isOpen ? "border-primary-500 ring-1 ring-primary-500" : "hover:border-primary-300 hover:ring-1 hover:ring-primary-300"}
          transition-all duration-200 ease-in-out
        `}
      >
        <div className="flex flex-row items-center px-2 py-2">
          {icon && <div className="mr-2 text-muted shrink-0">{icon}</div>}
          <div
            className={`w-full text-sm ${!selectedOption ? "text-muted" : "text-text"}`}
          >
            {selectedOption ? selectedOption.label : placeholder || "Select..."}
          </div>
          <ChevronDown
            size={16}
            className={`shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180 text-primary-500" : ""}`}
          />
        </div>
      </div>

      {isOpen &&
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
              {options.map((opt) => (
                <div
                  key={opt.value}
                  id={`${id || name}-option-${opt.value}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(opt.value);
                  }}
                  className={`
                    px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors
                    ${
                      value === opt.value
                        ? "bg-primary-500/10 text-primary-500 font-semibold"
                        : "text-text hover:bg-muted/10"
                    }
                  `}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function SelectInputwLabel({
  label,
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: SelectInputwLabelProps) {
  return (
    <div
      id={`${id || name}-field-group`}
      className="flex flex-col gap-1 w-full"
    >
      <label htmlFor={id || name} id={`${id || name}-label`} className="font-medium text-text text-sm">
        {label}
      </label>
      <SelectInput
        id={id || name}
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
