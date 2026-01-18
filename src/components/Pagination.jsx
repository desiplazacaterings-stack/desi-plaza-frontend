import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  if (totalPages <= 1) return null;

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

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalItems} total items)
      </div>
      
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
    </div>
  );
}

export default Pagination;
