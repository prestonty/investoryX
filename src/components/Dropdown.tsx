"use client";

import { useEffect, useRef, useState } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled = false,
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.value === value);
  const displayText = selected?.label ?? placeholder;

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="min-w-[84px] w-full flex items-center justify-between gap-2 rounded-md border border-light bg-white px-3 py-1.5 text-left text-sm text-dark shadow-sm hover:bg-light/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {displayText}
        <RiArrowDropDownLine />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-full overflow-hidden rounded-md border border-light bg-white shadow-md">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-dark hover:bg-light/40"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
