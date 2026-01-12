import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
    const pageNumbers = [];

    for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    if (pageNumbers.length <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={20} className="text-gray-600" />
            </button>

            {pageNumbers.map(number => (
                <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === number ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    {number}
                </button>
            ))}

            <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageNumbers.length}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronRight size={20} className="text-gray-600" />
            </button>
        </div>
    );
};

export default Pagination;