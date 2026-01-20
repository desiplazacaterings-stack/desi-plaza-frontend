import { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';
import './Reports.css';
import * as XLSX from 'xlsx';

function Reports() {
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [useCustomDateRange, setUseCustomDateRange] = useState(false);
  const [reportData, setReportData] = useState({
    instantOrders: 0,
    eventsCompleted: 0,
    totalRevenue: 0,
    totalInstantOrderRevenue: 0,
    totalEventRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalSalesTax: 0,
    totalServiceCharge: 0,
    totalDiscount: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    onlineRevenue: 0,
    cashOrders: 0,
    cardOrders: 0,
    onlineOrders: 0,
    totalShortCloseAmount: 0,
    orders: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userRole, setUserRole] = useState(null);

  const token = localStorage.getItem('token');

  // Fetch user role on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserRole(user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Download report as Excel
  const downloadReportAsExcel = () => {
    if (userRole !== 'admin') {
      alert('Only admins can download reports');
      return;
    }

    if (reportData.orders.length === 0) {
      alert('No data to download');
      return;
    }

    downloadReportAsExcelWithDateRange();
  };

  // Download report with custom date range
  const downloadReportAsExcelWithDateRange = () => {
    if (reportData.orders.length === 0) {
      alert('No data to download');
      return;
    }

    try {
      // Prepare Excel data
      const excelData = reportData.orders.map(order => ({
        'Customer Name': order.customerName,
        'Mobile': order.mobile,
        'Event Date': order.eventDate ? new Date(order.eventDate).toLocaleDateString('en-IN') : 'N/A',
        'Event Type': order.eventType || 'N/A',
        'Order Type': order.orderType,
        'Amount': order.totalAmount || order.total || 0,
        'Payment Mode': order.paymentMode || 'Cash',
        'Status': order.status
      }));

      // Create workbook
      const workbook = XLSX.utils.book_new();

      // Create summary sheet
      const summaryData = [
        ['Business Report Summary'],
        [],
        ['Report Generated Date', new Date().toLocaleDateString('en-IN')],
        ['Date Range', `${fromDate} to ${toDate}`],
        [],
        ['Key Metrics', 'Value'],
        ['Instant Orders', reportData.instantOrders],
        ['Events Completed', reportData.eventsCompleted],
        ['Total Revenue', `$${reportData.totalRevenue}`],
        ['Pending Orders', reportData.pendingOrders],
        ['Completed Orders', reportData.completedOrders],
        [],
        ['Revenue Breakdown', 'Amount'],
        ['Instant Order Revenue', `$${reportData.totalInstantOrderRevenue}`],
        ['Event Revenue', `$${reportData.totalEventRevenue}`],
        [],
        ['Payment Wise Breakdown', 'Amount', 'Count'],
        ['Cash Revenue', `$${reportData.cashRevenue}`, reportData.cashOrders],
        ['Card Revenue', `$${reportData.cardRevenue}`, reportData.cardOrders],
        ['Online Revenue', `$${reportData.onlineRevenue}`, reportData.onlineOrders],
        [],
        ['Charges & Discounts', 'Amount'],
        ['Sales Tax', `$${reportData.totalSalesTax}`],
        ['Service Charge', `$${reportData.totalServiceCharge}`],
        ['Discounts', `$${reportData.totalDiscount}`]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Create orders sheet
      const ordersSheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders');

      // Generate filename with date range
      const filename = `DPC_Report_${fromDate}_to_${toDate}_${new Date().getTime()}.xlsx`;

      // Download
      XLSX.writeFile(workbook, filename);
      setMessage('✓ Report downloaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error downloading report:', error);
      setMessage('✗ Failed to download report');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Fetch report data based on date range
  const fetchReportDataByDateRange = async (from, to) => {
    setLoading(true);
    setMessage('');

    try {
      // Fetch all orders
      const response = await axios.get(API_ENDPOINTS.ORDERS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orders = response.data.data || [];

      // Parse dates
      const fromDateTime = new Date(from);
      const toDateTime = new Date(to);
      toDateTime.setHours(23, 59, 59, 999); // Include entire day

      // Filter orders for the selected date range
      const filteredOrders = orders.filter(order => {
        let orderDate = null;
        
        if (order.eventDate) {
          orderDate = new Date(order.eventDate);
        } else if (order.createdAt) {
          orderDate = new Date(order.createdAt);
        } else if (order.deliveryTime) {
          orderDate = new Date(order.deliveryTime);
        } else {
          return false;
        }

        return orderDate >= fromDateTime && orderDate <= toDateTime;
      });

      console.log('Filtered orders for date range', from, 'to', to, ':', filteredOrders);

      // Calculate statistics
      const instantOrdersList = filteredOrders.filter(o => o.orderType === 'Instant');
      const eventsList = filteredOrders.filter(o => o.orderType === 'Event');
      
      const instantOrders = instantOrdersList.length;
      const eventsCompleted = eventsList.filter(o => o.status === 'Completed').length;
      
      const totalInstantOrderRevenue = instantOrdersList.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const totalEventRevenue = eventsList.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

      const pendingOrders = filteredOrders.filter(o => o.status === 'Pending Payment' || o.status === 'Placed').length;
      const completedOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

      const totalSalesTax = instantOrdersList.reduce((sum, o) => sum + (o.salesTax || 0), 0);
      const totalServiceCharge = instantOrdersList.reduce((sum, o) => sum + (o.serviceCharge || 0), 0);
      const totalDiscount = instantOrdersList.reduce((sum, o) => sum + (o.discount || 0), 0);

      const cashRevenue = filteredOrders.filter(o => o.paymentMode === 'Cash').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const cardRevenue = filteredOrders.filter(o => o.paymentMode === 'Card').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const onlineRevenue = filteredOrders.filter(o => o.paymentMode === 'Online').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      
      const cashOrders = filteredOrders.filter(o => o.paymentMode === 'Cash').length;
      const cardOrders = filteredOrders.filter(o => o.paymentMode === 'Card').length;
      const onlineOrders = filteredOrders.filter(o => o.paymentMode === 'Online').length;

      // Calculate short close amount (Event total - Amount received for short closed orders)
      const totalShortCloseAmount = filteredOrders
        .filter(o => o.isShortClosed === true)
        .reduce((sum, o) => sum + (o.shortCloseAmount || 0), 0);

      setReportData({
        instantOrders,
        eventsCompleted,
        totalRevenue: totalInstantOrderRevenue + totalEventRevenue,
        totalInstantOrderRevenue,
        totalEventRevenue,
        pendingOrders,
        completedOrders,
        totalSalesTax,
        totalServiceCharge,
        totalDiscount,
        cashRevenue,
        cardRevenue,
        onlineRevenue,
        cashOrders,
        cardOrders,
        onlineOrders,
        totalShortCloseAmount,
        orders: filteredOrders
      });

      setMessage(`Report loaded for ${from} to ${to}`);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setMessage('Error fetching report data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle date range search
  const handleDateRangeSearch = () => {
    if (useCustomDateRange) {
      if (!fromDate || !toDate) {
        setMessage('⚠️ Please select both from and to dates');
        return;
      }

      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);

      if (fromDateObj > toDateObj) {
        setMessage('⚠️ From date cannot be greater than To date');
        return;
      }

      fetchReportDataByDateRange(fromDate, toDate);
    }
  };

  // Handle reset to today
  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    setFromDate(firstOfMonth);
    setToDate(today);
    setMessage('📅 Dates reset to today');
    setTimeout(() => setMessage(''), 2000);
  };

  // Handle monthly report change
  const fetchReportData = async (month, year) => {
    setLoading(true);
    setMessage('');
    try {
      // Get all orders
      const response = await axios.get(
        API_ENDPOINTS.ORDERS.GET_ALL,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const orders = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('Fetched orders:', orders);
      console.log('Order types found:', orders.map(o => ({ id: o._id, orderType: o.orderType, status: o.status })));
      
      // Parse month and year
      const [yearStr, monthStr] = month.split('-');
      const monthNum = parseInt(monthStr);
      const yearNum = parseInt(yearStr);

      // Filter orders for the selected month and year
      const filteredOrders = orders.filter(order => {
        // For instant orders without eventDate, use createdAt or deliveryTime
        let orderDate = null;
        
        if (order.eventDate) {
          orderDate = new Date(order.eventDate);
        } else if (order.createdAt) {
          orderDate = new Date(order.createdAt);
        } else if (order.deliveryTime) {
          orderDate = new Date(order.deliveryTime);
        } else {
          console.log('Order missing date fields:', order);
          return false;
        }

        const matches = (
          orderDate.getFullYear() === yearNum &&
          orderDate.getMonth() + 1 === monthNum
        );
        return matches;
      });

      console.log('Filtered orders for', monthNum, '/', yearNum, ':', filteredOrders);

      // Calculate statistics
      const instantOrdersList = filteredOrders.filter(o => o.orderType === 'Instant');
      const eventsList = filteredOrders.filter(o => o.orderType === 'Event');
      
      const instantOrders = instantOrdersList.length;
      const eventsCompleted = eventsList.filter(o => o.status === 'Completed').length;
      
      const totalInstantOrderRevenue = instantOrdersList.reduce((sum, o) => {
        // Use totalAmount if available, otherwise calculate from total/total
        const amount = o.totalAmount || o.total || 0;
        console.log('Instant order amount:', amount, 'Details:', o);
        return sum + amount;
      }, 0);
      
      const totalEventRevenue = eventsList.reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

      const pendingOrders = filteredOrders.filter(o => o.status === 'Pending Payment' || o.status === 'Placed').length;
      const completedOrders = filteredOrders.filter(o => o.status === 'Completed' || o.status === 'Delivered').length;

      // Calculate total charges (tax + service charge)
      const totalSalesTax = instantOrdersList.reduce((sum, o) => sum + (o.salesTax || 0), 0);
      const totalServiceCharge = instantOrdersList.reduce((sum, o) => sum + (o.serviceCharge || 0), 0);
      const totalDiscount = instantOrdersList.reduce((sum, o) => sum + (o.discount || 0), 0);

      // Calculate payment mode wise breakdown
      const cashRevenue = filteredOrders.filter(o => o.paymentMode === 'Cash').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const cardRevenue = filteredOrders.filter(o => o.paymentMode === 'Card').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      const onlineRevenue = filteredOrders.filter(o => o.paymentMode === 'Online').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);
      
      const cashOrders = filteredOrders.filter(o => o.paymentMode === 'Cash').length;
      const cardOrders = filteredOrders.filter(o => o.paymentMode === 'Card').length;
      const onlineOrders = filteredOrders.filter(o => o.paymentMode === 'Online').length;

      // Calculate short close amount
      const totalShortCloseAmount = filteredOrders
        .filter(o => o.isShortClosed === true)
        .reduce((sum, o) => sum + (o.shortCloseAmount || 0), 0);

      console.log('Report Summary:', {
        instantOrders,
        totalInstantOrderRevenue,
        totalEventRevenue,
        eventsCompleted
      });

      setReportData({
        instantOrders,
        eventsCompleted,
        totalRevenue: totalInstantOrderRevenue + totalEventRevenue,
        totalInstantOrderRevenue,
        totalEventRevenue,
        pendingOrders,
        completedOrders,
        totalSalesTax,
        totalServiceCharge,
        totalDiscount,
        cashRevenue,
        cardRevenue,
        onlineRevenue,
        cashOrders,
        cardOrders,
        onlineOrders,
        totalShortCloseAmount,
        orders: filteredOrders
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      setMessage('Error fetching report data: ' + (error.response?.data?.message || error.message));
      setReportData({
        instantOrders: 0,
        eventsCompleted: 0,
        totalRevenue: 0,
        totalInstantOrderRevenue: 0,
        totalEventRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalSalesTax: 0,
        totalServiceCharge: 0,
        totalDiscount: 0,
        cashRevenue: 0,
        cardRevenue: 0,
        onlineRevenue: 0,
        cashOrders: 0,
        cardOrders: 0,
        onlineOrders: 0,
        orders: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(monthYear, selectedYear);
  }, [monthYear, selectedYear]);

  const handleMonthChange = (e) => {
    setMonthYear(e.target.value);
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const [, month] = monthYear.split('-');
    setMonthYear(`${year}-${month}`);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const [, monthStr] = monthYear.split('-');
  const monthIndex = parseInt(monthStr) - 1;
  const monthName = monthNames[monthIndex];

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Business Reports</h1>
        <p>Track your instant orders and events statistics</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>
            <input 
              type="checkbox" 
              checked={useCustomDateRange}
              onChange={(e) => setUseCustomDateRange(e.target.checked)}
            />
            Use Custom Date Range
          </label>
        </div>

        {!useCustomDateRange ? (
          <div className="filter-group">
            <label htmlFor="month-select">Select Month & Year:</label>
            <input
              id="month-select"
              type="month"
              value={monthYear}
              onChange={handleMonthChange}
              className="month-input"
            />
          </div>
        ) : (
          <div className="filter-group date-range-group">
            <div className="date-inputs">
              <div className="date-field">
                <label htmlFor="from-date">From Date:</label>
                <input
                  id="from-date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="date-input"
                />
              </div>

              <div className="date-field">
                <label htmlFor="to-date">To Date:</label>
                <input
                  id="to-date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="date-input"
                />
              </div>
            </div>

            <div className="button-group">
              <button 
                onClick={handleDateRangeSearch}
                className="btn-search"
              >
                🔍 Search Report
              </button>
              <button 
                onClick={handleReset}
                className="btn-reset"
              >
                ↻ Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {message && <div className="message error-message">{message}</div>}

      {loading ? (
        <div className="loading">Loading report data...</div>
      ) : (
        <>
          <div className="statistics-grid">
            <div className="stat-card instant-orders">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <h3>Instant Orders</h3>
                <p className="stat-number">{reportData.instantOrders}</p>
                <p className="stat-label">Orders Placed</p>
              </div>
            </div>

            <div className="stat-card events">
              <div className="stat-icon">🎉</div>
              <div className="stat-content">
                <h3>Events Completed</h3>
                <p className="stat-number">{reportData.eventsCompleted}</p>
                <p className="stat-label">Successful Events</p>
              </div>
            </div>

            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Revenue</h3>
                <p className="stat-number">${reportData.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="stat-label">All Orders</p>
              </div>
            </div>

            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending Orders</h3>
                <p className="stat-number">{reportData.pendingOrders}</p>
                <p className="stat-label">Awaiting Completion</p>
              </div>
            </div>
          </div>

          <div className="breakdown-section">
            <div className="breakdown-card">
              <h3>💳 Instant Orders Revenue</h3>
              <p className="breakdown-amount">${reportData.totalInstantOrderRevenue.toLocaleString('en-IN')}</p>
              <p className="breakdown-label">From {reportData.instantOrders} instant orders</p>
            </div>

            <div className="breakdown-card">
              <h3>🎊 Event Orders Revenue</h3>
              <p className="breakdown-amount">${reportData.totalEventRevenue.toLocaleString('en-IN')}</p>
              <p className="breakdown-label">From {reportData.eventsCompleted} completed events</p>
            </div>

            <div className="breakdown-card">
              <h3>✅ Completed Orders</h3>
              <p className="breakdown-amount">{reportData.completedOrders}</p>
              <p className="breakdown-label">Successfully Delivered/Completed</p>
            </div>
          </div>

          <div className="breakdown-section">
            <div className="breakdown-card tax-card">
              <h3>📊 Sales Tax Collected</h3>
              <p className="breakdown-amount">${reportData.totalSalesTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total sales tax from instant orders</p>
            </div>

            <div className="breakdown-card service-card">
              <h3>⚙️ Service Charges Collected</h3>
              <p className="breakdown-amount">${reportData.totalServiceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total service charges from instant orders</p>
            </div>

            <div className="breakdown-card discount-card">
              <h3>🎁 Discounts Offered</h3>
              <p className="breakdown-amount" style={{ color: '#e74c3c' }}>-${reportData.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total discounts on instant orders</p>
            </div>

            <div className="breakdown-card short-close-card">
              <h3>🔒 Short Close Amount</h3>
              <p className="breakdown-amount" style={{ color: '#f39c12' }}>-${reportData.totalShortCloseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total event partial closures</p>
            </div>
          </div>

          <div className="breakdown-section">
            <div className="breakdown-card payment-cash">
              <h3>💵 Cash Payments</h3>
              <p className="breakdown-amount">${reportData.cashRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">{reportData.cashOrders} orders via cash</p>
            </div>

            <div className="breakdown-card payment-card">
              <h3>💳 Card Payments</h3>
              <p className="breakdown-amount">${reportData.cardRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">{reportData.cardOrders} orders via card</p>
            </div>

            <div className="breakdown-card payment-online">
              <h3>📱 Online Payments</h3>
              <p className="breakdown-amount">${reportData.onlineRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">{reportData.onlineOrders} orders via online</p>
            </div>
          </div>

          {reportData.orders.length > 0 && (
            <div className="orders-table-section">
              <div className="table-header">
                <h2>
                  {useCustomDateRange 
                    ? `Orders from ${fromDate} to ${toDate}` 
                    : `Orders for ${monthName} ${selectedYear}`
                  }
                </h2>
                {userRole === 'admin' && (
                  <button className="download-btn" onClick={downloadReportAsExcel} title="Download report as Excel file">
                    📥 Download Excel
                  </button>
                )}
              </div>
              <div className="table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Mobile</th>
                      <th>Event Date</th>
                      <th>Event Type</th>
                      <th>Order Type</th>
                      <th>Amount</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.orders.map((order) => (
                      <tr key={order._id}>
                        <td data-label="Customer">{order.customerName}</td>
                        <td data-label="Mobile">{order.mobile}</td>
                        <td data-label="Event Date">
                          {order.eventDate 
                            ? new Date(order.eventDate).toLocaleDateString('en-IN')
                            : order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN')
                            : order.deliveryTime
                            ? new Date(order.deliveryTime).toLocaleDateString('en-IN')
                            : 'N/A'
                          }
                        </td>
                        <td data-label="Event Type">{order.eventType || 'N/A'}</td>
                        <td data-label="Order Type">
                          <span className={`badge badge-${order.orderType?.toLowerCase()}`}>
                            {order.orderType}
                          </span>
                        </td>
                        <td data-label="Amount">${(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</td>
                        <td data-label="Payment Mode">
                          <span className={`payment-mode-badge payment-${order.paymentMode?.toLowerCase() || 'cash'}`}>
                            {order.paymentMode || 'Cash'}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span className={`status-badge status-${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportData.orders.length === 0 && (
            <div className="no-data">
              <p>
                {useCustomDateRange 
                  ? `No orders found from ${fromDate} to ${toDate}` 
                  : `No orders found for ${monthName} ${selectedYear}`
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reports;
