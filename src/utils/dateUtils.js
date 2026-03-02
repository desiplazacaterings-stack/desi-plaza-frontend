/**
 * Date Utility Functions
 * Handles proper timezone conversions and date comparisons
 */

/**
 * Parse a date string from the server (assumes UTC) and normalize it
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {Date} - Normalized Date object in UTC
 */
export const parseServerDate = (dateString) => {
  if (!dateString) return null;
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

/**
 * Get the date part only (midnight local time) for comparison
 * This ensures dates compare correctly regardless of time component
 * @param {string|Date} dateString - Date to parse
 * @returns {Date} - Date object set to midnight in local timezone
 */
export const getDateOnly = (dateString) => {
  const date = parseServerDate(dateString);
  if (!date) return null;
  
  // Convert to local date at midnight
  const localDate = new Date(date);
  localDate.setHours(0, 0, 0, 0);
  return localDate;
};

/**
 * Format date for display with Indian locale
 * @param {string|Date} dateString - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  const date = parseServerDate(dateString);
  if (!date) return 'N/A';
  
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  });
};

/**
 * Format date with time
 * @param {string|Date} dateString - Date to format
 * @returns {string} - Formatted date-time string
 */
export const formatDateTime = (dateString) => {
  const date = parseServerDate(dateString);
  if (!date) return 'N/A';
  
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Check if two dates are on the same day (ignoring time)
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date
 * @returns {boolean} - True if dates are the same day
 */
export const isSameDay = (date1, date2) => {
  const d1 = getDateOnly(date1);
  const d2 = getDateOnly(date2);
  
  if (!d1 || !d2) return false;
  
  return d1.getTime() === d2.getTime();
};

/**
 * Check if date is within range (inclusive)
 * @param {string|Date} date - Date to check
 * @param {string|Date} startDate - Range start (inclusive)
 * @param {string|Date} endDate - Range end (inclusive, should be end of day)
 * @returns {boolean} - True if date is in range
 */
export const isDateInRange = (date, startDate, endDate) => {
  const d = parseServerDate(date);
  const start = parseServerDate(startDate);
  const end = parseServerDate(endDate);
  
  if (!d || !start || !end) return false;
  
  return d >= start && d <= end;
};

/**
 * Get the end of day for a given date
 * @param {string|Date} dateString - Date
 * @returns {Date} - Date set to 23:59:59.999
 */
export const getEndOfDay = (dateString) => {
  const date = parseServerDate(dateString);
  if (!date) return null;
  
  const eod = new Date(date);
  eod.setHours(23, 59, 59, 999);
  return eod;
};

/**
 * Get start of day for a given date
 * @param {string|Date} dateString - Date
 * @returns {Date} - Date set to 00:00:00.000
 */
export const getStartOfDay = (dateString) => {
  const date = parseServerDate(dateString);
  if (!date) return null;
  
  const sod = new Date(date);
  sod.setHours(0, 0, 0, 0);
  return sod;
};

/**
 * Get the effective date for an order (eventDate, createdAt, or deliveryTime)
 * @param {object} order - Order object
 * @returns {Date|null} - The effective date
 */
export const getOrderDate = (order) => {
  if (order?.eventDate) {
    return parseServerDate(order.eventDate);
  } else if (order?.createdAt) {
    return parseServerDate(order.createdAt);
  } else if (order?.deliveryTime) {
    return parseServerDate(order.deliveryTime);
  }
  return null;
};

/**
 * Format event date for display with fallback to createdAt
 * @param {object} order - Order object
 * @returns {string} - Formatted date
 */
export const formatOrderDate = (order) => {
  const date = getOrderDate(order);
  return formatDate(date);
};
