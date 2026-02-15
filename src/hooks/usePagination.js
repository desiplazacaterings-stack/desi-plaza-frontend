import { useState, useMemo } from 'react';

export const usePagination = (items = [], itemsPerPage = 15) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    return {
      currentPage,
      totalPages,
      totalItems,
      currentItems,
      startIndex,
      endIndex,
      itemsPerPage
    };
  }, [items, currentPage, itemsPerPage]);

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
