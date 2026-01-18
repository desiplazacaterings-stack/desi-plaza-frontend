import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 15;

export const usePagination = (items = []) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      totalItems,
      currentItems,
      startIndex,
      endIndex
    };
  }, [items, currentPage]);

  const goToPage = (pageNum) => {
    const pageNumber = Math.max(1, Math.min(pageNum, paginationData.totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    goToPage(currentPage + 1);
  };

  const prevPage = () => {
    goToPage(currentPage - 1);
  };

  return {
    ...paginationData,
    goToPage,
    nextPage,
    prevPage,
    setCurrentPage
  };
};

export default usePagination;
