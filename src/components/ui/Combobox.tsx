"use client";

import { useId, useState, type ReactNode } from "react";

export type ComboboxOption = { key: string; content: ReactNode };

type Props = {
  /** Names the input when no visible `<label>` points at `inputId`. */
  ariaLabel?: string;
  /** Lets an external `<label htmlFor>` and `aria-describedby` reach the input. */
  inputId?: string;
  describedBy?: string;
  listLabel: string;
  value: string;
  placeholder?: string;
  options: ComboboxOption[];
  open: boolean;
  onValueChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onPick: (index: number) => void;
  /** Called when ArrowDown passes the last option or the list is scrolled to its end. */
  onLoadMore?: () => void;
  /** Whether ArrowDown on the last option should load more instead of wrapping to the first. */
  canLoadMore?: boolean;
  footer?: ReactNode;
  inputClassName?: string;
  listClassName?: string;
  optionClassName?: string;
};

export default function Combobox({
  ariaLabel,
  inputId,
  describedBy,
  listLabel,
  value,
  placeholder,
  options,
  open,
  onValueChange,
  onOpenChange,
  onPick,
  onLoadMore,
  canLoadMore = false,
  footer,
  inputClassName,
  listClassName = "max-h-60 overflow-y-auto",
  optionClassName = "px-3 py-2 cursor-pointer aria-selected:bg-gray-100 hover:bg-gray-100",
}: Props) {
  const id = useId();
  const [active, setActive] = useState(0);
  const expanded = open && options.length > 0;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") onOpenChange(false);
    if (!expanded) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      if (step === 1 && active === options.length - 1 && canLoadMore) {
        onLoadMore?.();
        return;
      }
      setActive((active + step + options.length) % options.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      onPick(Math.min(active, options.length - 1));
    }
  };

  return (
    <>
      <input
        id={inputId}
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={expanded}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={expanded ? `${id}-option-${Math.min(active, options.length - 1)}` : undefined}
        aria-describedby={describedBy}
        value={value}
        placeholder={placeholder}
        onChange={(event) => {
          onValueChange(event.target.value);
          onOpenChange(true);
          setActive(0);
        }}
        onBlur={() => onOpenChange(false)}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />
      {expanded && (
        <div className="absolute top-full z-10 w-full bg-white border rounded-md shadow-lg">
          <ul
            id={`${id}-listbox`}
            role="listbox"
            aria-label={listLabel}
            onScroll={(event) => {
              const list = event.currentTarget;
              if (list.scrollHeight - list.scrollTop - list.clientHeight < 24) onLoadMore?.();
            }}
            className={listClassName}
          >
            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === active}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onPick(index);
                }}
                className={optionClassName}
              >
                {option.content}
              </li>
            ))}
          </ul>
          {footer}
        </div>
      )}
    </>
  );
}
