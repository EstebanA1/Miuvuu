// Pagination.jsx
import React from 'react';
import Button from '@mui/material/Button';
import { ChevronLeft, ChevronRight } from "lucide-react";
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;

        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + showPages - 1);

        if (end - start + 1 < showPages) {
            start = Math.max(1, end - showPages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    return (
        <div className="pagination-container">
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="pagination-icon-button"
            >
                <ChevronLeft className="chevron-icon" />
            </Button>

            {getPageNumbers().map((pageNum) => (
                <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="default"
                    onClick={() => onPageChange(pageNum)}
                    className={`pagination-number-button ${currentPage === pageNum ? 'active' : ''}`}
                >
                    {pageNum}
                </Button>
            ))}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="pagination-icon-button"
            >
                <ChevronRight className="chevron-icon" />
            </Button>
        </div>
    );
};

export default Pagination;