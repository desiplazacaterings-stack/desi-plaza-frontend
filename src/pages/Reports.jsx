import { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';
import './Reports.css';

function Reports() {
  const [monthYear, setMonthYear] = useState(new Date().toISOString().slice(0, 7));
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
    orders: []
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem('token');

  // Fetch report data
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
          <label htmlFor="month-select">Select Month & Year:</label>
          <input
            id="month-select"
            type="month"
            value={monthYear}
            onChange={handleMonthChange}
            className="month-input"
          />
        </div>
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
                <p className="stat-number">₹{reportData.totalRevenue.toLocaleString('en-IN')}</p>
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
              <p className="breakdown-amount">₹{reportData.totalInstantOrderRevenue.toLocaleString('en-IN')}</p>
              <p className="breakdown-label">From {reportData.instantOrders} instant orders</p>
            </div>

            <div className="breakdown-card">
              <h3>🎊 Event Orders Revenue</h3>
              <p className="breakdown-amount">₹{reportData.totalEventRevenue.toLocaleString('en-IN')}</p>
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
              <p className="breakdown-amount">₹{reportData.totalSalesTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total sales tax from instant orders</p>
            </div>

            <div className="breakdown-card service-card">
              <h3>⚙️ Service Charges Collected</h3>
              <p className="breakdown-amount">₹{reportData.totalServiceCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total service charges from instant orders</p>
            </div>

            <div className="breakdown-card discount-card">
              <h3>🎁 Discounts Offered</h3>
              <p className="breakdown-amount" style={{ color: '#e74c3c' }}>-₹{reportData.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">Total discounts on instant orders</p>
            </div>
          </div>

          <div className="breakdown-section">
            <div className="breakdown-card payment-cash">
              <h3>💵 Cash Payments</h3>
              <p className="breakdown-amount">₹{reportData.cashRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">{reportData.cashOrders} orders via cash</p>
            </div>

            <div className="breakdown-card payment-card">
              <h3>💳 Card Payments</h3>
              <p className="breakdown-amount">₹{reportData.cardRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">{reportData.cardOrders} orders via card</p>
            </div>

            <div className="breakdown-card payment-online">
              <h3>📱 Online Payments</h3>
              <p className="breakdown-amount">₹{reportData.onlineRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              <p className="breakdown-label">{reportData.onlineOrders} orders via online</p>
            </div>
          </div>

          {reportData.orders.length > 0 && (
            <div className="orders-table-section">
              <h2>Orders for {monthName} {selectedYear}</h2>
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
                        <td>{order.customerName}</td>
                        <td>{order.mobile}</td>
                        <td>
                          {order.eventDate 
                            ? new Date(order.eventDate).toLocaleDateString('en-IN')
                            : order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-IN')
                            : order.deliveryTime
                            ? new Date(order.deliveryTime).toLocaleDateString('en-IN')
                            : 'N/A'
                          }
                        </td>
                        <td>{order.eventType || 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${order.orderType?.toLowerCase()}`}>
                            {order.orderType}
                          </span>
                        </td>
                        <td>₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`payment-mode-badge payment-${order.paymentMode?.toLowerCase() || 'cash'}`}>
                            {order.paymentMode || 'Cash'}
                          </span>
                        </td>
                        <td>
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
              <p>No orders found for {monthName} {selectedYear}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reports;
