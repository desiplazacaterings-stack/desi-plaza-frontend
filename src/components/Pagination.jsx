import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage = 15 }) {
  // Always show pagination info, but only show page numbers if more than 1 page
  if (!currentPage || !totalPages || !totalItems) return null;

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Adjust start if we're near the end
  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Calculate showing range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </div>
      
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button 
            onClick={() => onPageChange(1)} 
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-first"
            title="First Page"
          >
            « First
          </button>

          <button 
            onClick={() => onPageChange(currentPage - 1)} 
            disabled={currentPage === 1}
            className="pagination-btn pagination-btn-prev"
          >
            ‹ Previous
          </button>

          <div className="pagination-numbers">
            {startPage > 1 && (
              <>
                <button 
                  onClick={() => onPageChange(1)} 
                  className="pagination-btn"
                >
                  1
                </button>
                {startPage > 2 && <span className="pagination-ellipsis">...</span>}
              </>
            )}

            {pageNumbers.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
              >
                {pageNum}
              </button>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <span className="pagination-ellipsis">...</span>}
                <button 
                  onClick={() => onPageChange(totalPages)} 
                  className="pagination-btn"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-next"
          >
            Next ›
          </button>

          <button 
            onClick={() => onPageChange(totalPages)} 
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-btn-last"
            title="Last Page"
          >
            Last »
          </button>
        </div>
      )}
    </div>
  );
}
export default Pagination;
