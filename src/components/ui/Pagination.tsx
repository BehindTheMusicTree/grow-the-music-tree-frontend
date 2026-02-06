"use client";

import classnames from "classnames";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button } from "@components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end page numbers to show
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Ensure we show maxPagesToShow - 2 pages (excluding first and last)
      const pagesToShow = maxPagesToShow - 2;
      if (endPage - startPage + 1 < pagesToShow) {
        if (startPage === 2) {
          endPage = Math.min(totalPages - 1, startPage + pagesToShow - 1);
        } else if (endPage === totalPages - 1) {
          startPage = Math.max(2, endPage - pagesToShow + 1);
        }
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className={classnames("flex items-center justify-center my-4", className)}>
      <Button className="mx-1 px-3 py-1 text-sm rounded" onClick={handlePrevious} disabled={currentPage === 1}>
        <FaChevronLeft />
      </Button>

      <div className="flex mx-2">
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="mx-1 px-3 py-1 text-sm">
              ...
            </span>
          ) : (
            <Button
              key={page}
              className={classnames(
                "mx-1 px-3 py-1 text-sm rounded",
                currentPage === page ? "bg-green-600 text-white" : "hover:bg-gray-200"
              )}
              onClick={() => onPageChange(page as number)}
              disabled={currentPage === page}
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button className="mx-1 px-3 py-1 text-sm rounded" onClick={handleNext} disabled={currentPage === totalPages}>
        <FaChevronRight />
      </Button>
    </div>
  );
}
