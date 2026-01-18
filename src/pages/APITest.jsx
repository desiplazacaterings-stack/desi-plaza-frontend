import { useState } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config';

function APITest() {
  const [testResults, setTestResults] = useState({
    backendHealth: null,
    loginTest: null,
    errors: []
  });
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {
      backendHealth: null,
      loginTest: null,
      errors: []
    };

    try {
      console.log('🧪 Running API Tests...\n');

      // Test 1: Backend Health Check
      console.log(`Testing: ${API_ENDPOINTS.BASE_URL}/api/health`);
      try {
        const healthResponse = await axios.get(`${API_ENDPOINTS.BASE_URL}/api/health`, {
          timeout: 5000
        });
        results.backendHealth = {
          status: 'SUCCESS',
          code: healthResponse.status,
          data: healthResponse.data,
          message: 'Backend is responding'
        };
        console.log('✓ Health check passed:', healthResponse.data);
      } catch (error) {
        results.backendHealth = {
          status: 'FAILED',
          error: error.message,
          code: error.response?.status || 'No response',
          message: error.response?.statusText || 'No connection'
        };
        results.errors.push(`Health check failed: ${error.message}`);
        console.error('✗ Health check failed:', error.message);
      }

      // Test 2: Login Endpoint (without credentials)
      console.log(`\nTesting: ${API_ENDPOINTS.AUTH.LOGIN}`);
      try {
        const loginResponse = await axios.post(
          API_ENDPOINTS.AUTH.LOGIN,
          { email: 'test@example.com', password: 'test123456' },
          { timeout: 5000 }
        );
        results.loginTest = {
          status: 'SUCCESS',
          code: loginResponse.status,
          data: loginResponse.data,
          message: 'Login endpoint is working'
        };
        console.log('✓ Login endpoint responded:', loginResponse.data);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 400) {
          results.loginTest = {
            status: 'ENDPOINT_WORKS',
            code: error.response.status,
            data: error.response.data,
            message: 'Endpoint is working (returned expected auth error)'
          };
          console.log('✓ Login endpoint is working (auth error as expected):', error.response.data);
        } else {
          results.loginTest = {
            status: 'FAILED',
            error: error.message,
            code: error.response?.status || 'No response',
            message: error.response?.statusText || 'No connection'
          };
          results.errors.push(`Login endpoint failed: ${error.message}`);
          console.error('✗ Login endpoint failed:', error.message);
        }
      }

      // Test 3: CORS Configuration
      console.log('\nTesting CORS...');
      try {
        const corsTest = await axios.options(API_ENDPOINTS.AUTH.LOGIN, {
          timeout: 5000
        });
        console.log('✓ CORS is configured:', corsTest.headers);
      } catch (error) {
        console.warn('⚠️ CORS check inconclusive:', error.message);
      }

    } catch (error) {
      console.error('Test suite error:', error);
      results.errors.push(`Test suite error: ${error.message}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', background: '#1e1e1e', color: '#0f0', minHeight: '100vh' }}>
      <h1>🧪 API Diagnostic Test</h1>
      
      <button 
        onClick={runTests} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          marginBottom: '20px',
          background: '#0f0',
          color: '#000',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        {loading ? 'Running Tests...' : 'Run Tests'}
      </button>

      <div style={{ background: '#0a0a0a', padding: '20px', borderRadius: '5px', marginTop: '20px' }}>
        <h2>Test Results:</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>1. Backend Health Check</h3>
          {testResults.backendHealth ? (
            <pre style={{ background: '#1a1a1a', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify(testResults.backendHealth, null, 2)}
            </pre>
          ) : (
            <p>Run tests to see results...</p>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>2. Login Endpoint Test</h3>
          {testResults.loginTest ? (
            <pre style={{ background: '#1a1a1a', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
              {JSON.stringify(testResults.loginTest, null, 2)}
            </pre>
          ) : (
            <p>Run tests to see results...</p>
          )}
        </div>

        <div>
          <h3>3. Errors & Warnings</h3>
          {testResults.errors.length > 0 ? (
            <ul>
              {testResults.errors.map((error, index) => (
                <li key={index} style={{ color: '#f00' }}>❌ {error}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#0f0' }}>✓ No errors detected</p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#0a0a0a', borderRadius: '5px' }}>
        <h3>Configuration Info:</h3>
        <pre>{`API Base URL: ${API_ENDPOINTS.BASE_URL}
Auth Login: ${API_ENDPOINTS.AUTH.LOGIN}
Environment: ${import.meta.env.MODE}`}</pre>
      </div>
    </div>
  );
}

export default APITest;
