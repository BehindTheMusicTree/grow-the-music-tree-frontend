"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import PropTypes from "prop-types";

export function MenuGroup({ items, className = "" }) {
  const pathname = usePathname();

  return (
    <div className={`w-full mb-4 ${className}`}>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center p-2 text-white hover:bg-gray-800 rounded transition-colors duration-200 mb-1 ${
              isActive ? "bg-gray-700" : ""
            }`}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

MenuGroup.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ).isRequired,
  className: PropTypes.string,
};
