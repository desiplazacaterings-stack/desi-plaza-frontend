/**
 * Mobile-Safe Print Utility
 * Handles printing on both desktop and mobile devices
 * Works around browser limitations on mobile platforms
 */

export default function mobileSafePrint(htmlContent, options = {}) {
  const {
    title = 'Print Document',
    delay = 300,
    onSuccess = null,
    onError = null
  } = options;

  try {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // Mobile: Use data URL approach (more reliable on mobile)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open in same window for mobile - more reliable than new window
      const printWindow = window.open(url, '_blank');
      
      if (!printWindow) {
        // Fallback: If popup is blocked, show alert
        alert('Please enable pop-ups to print. Alternatively, use your browser\'s print menu (Share > Print or Menu > Print)');
        onError?.('Popup blocked');
        return;
      }

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Close after printing (optional)
          printWindow.onafterprint = () => {
            URL.revokeObjectURL(url);
            printWindow.close();
          };
          
          onSuccess?.();
        }, delay);
      };
    } else {
      // Desktop: Use traditional window.open approach
      const printWindow = window.open('', '', 'height=800,width=1000');
      
      if (!printWindow) {
        alert('Could not open print window. Please enable pop-ups.');
        onError?.('Popup blocked');
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        onSuccess?.();
      }, delay);
    }
  } catch (error) {
    console.error('Print error:', error);
    alert('An error occurred while preparing the document for printing.');
    onError?.(error);
  }
}

/**
 * Alternative: Print content by injecting into DOM
 * Use this when window.open is blocked or not working
 */
export function printToDOMElement(htmlContent, options = {}) {
  const {
    title = 'Print Document',
    containerId = 'print-container'
  } = options;

  try {
    // Create container if it doesn't exist
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        background: white;
        overflow: auto;
      `;
      document.body.appendChild(container);
    }

    container.innerHTML = htmlContent;
    
    setTimeout(() => {
      window.print();
      // Restore previous state
      setTimeout(() => {
        container.innerHTML = '';
        container.style.display = 'none';
      }, 500);
    }, 300);
  } catch (error) {
    console.error('Print to DOM error:', error);
    alert('An error occurred while preparing the document for printing.');
  }
}
