/**
 * API URL Troubleshooting Tool
 * 
 * This script provides utilities for debugging API URL construction issues
 * and can be used to check API connections directly from the server.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

// Configuration - adjust as needed
const config = {
  apiUrl: 'https://api.findameetingspot.com',
  endpoints: [
    '/api/v1/auth/register',
    '/debug/db-check'
  ],
  logPath: './api-debug-logs.json',
  testsToRun: ['direct-call', 'url-construction']
};

// Utility to make HTTP requests to various endpoints
async function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    // Parse URL to determine http vs https
    const isHttps = url.startsWith('https://');
    const lib = isHttps ? https : http;
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'API-Debug-Tool/1.0'
      }
    };
    
    const req = lib.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        // Try to parse as JSON if possible
        let parsedBody;
        try {
          parsedBody = JSON.parse(responseBody);
        } catch (e) {
          parsedBody = responseBody;
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test direct API calls
async function testDirectCalls() {
  console.log('Testing direct API calls...');
  const results = {};
  
  // Test registration endpoint
  try {
    console.log('Testing /api/v1/auth/register endpoint...');
    const testEmail = `test_${Date.now()}@example.com`;
    results.registerEndpoint = await makeRequest(
      'POST', 
      `${config.apiUrl}/api/v1/auth/register`,
      { email: testEmail, password: 'TestPassword123!' }
    );
    console.log(`Register endpoint status: ${results.registerEndpoint.statusCode}`);
  } catch (error) {
    results.registerEndpoint = { error: error.message };
    console.error('Error testing register endpoint:', error);
  }
  
  // Test db-check endpoint
  try {
    console.log('Testing /debug/db-check endpoint...');
    results.dbCheckEndpoint = await makeRequest('GET', `${config.apiUrl}/debug/db-check`);
    console.log(`DB check endpoint status: ${results.dbCheckEndpoint.statusCode}`);
  } catch (error) {
    results.dbCheckEndpoint = { error: error.message };
    console.error('Error testing db-check endpoint:', error);
  }
  
  return results;
}

// Test URL construction logic
function testUrlConstruction() {
  console.log('Testing API URL construction logic...');
  
  // Simulate frontend URL construction
  function constructApiUrl(endpoint, baseUrl = config.apiUrl) {
    // Common patterns that might cause issues
    const patterns = [
      // Simple concatenation - might be correct
      `${baseUrl}${endpoint}`,
      
      // Double slash - common error
      `${baseUrl}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`,
      
      // Domain duplication - the issue we're seeing
      `${baseUrl}/.${baseUrl.split('//')[1]}${endpoint}`,
      
      // Path-relative URL - might cause issues
      endpoint
    ];
    
    return patterns.map(url => ({
      pattern: patterns.indexOf(url),
      url,
      isLikelyCorrect: !url.includes('/.') && !url.includes('//')
    }));
  }
  
  const results = {};
  
  // Test URL construction for each endpoint
  config.endpoints.forEach(endpoint => {
    results[endpoint] = constructApiUrl(endpoint);
  });
  
  return results;
}

// Run tests and log results
async function runTests() {
  const results = {
    timestamp: new Date().toISOString(),
    config: { ...config },
    tests: {}
  };
  
  if (config.testsToRun.includes('direct-call')) {
    results.tests.directCalls = await testDirectCalls();
  }
  
  if (config.testsToRun.includes('url-construction')) {
    results.tests.urlConstruction = testUrlConstruction();
  }
  
  // Log results
  fs.writeFileSync(config.logPath, JSON.stringify(results, null, 2));
  console.log(`Test results saved to ${config.logPath}`);
  
  return results;
}

// Run the tests
runTests()
  .then(results => {
    console.log('All tests completed!');
    
    // Summarize results
    if (results.tests.directCalls) {
      const registerStatus = results.tests.directCalls.registerEndpoint.statusCode;
      const dbCheckStatus = results.tests.directCalls.dbCheckEndpoint.statusCode;
      
      console.log('\nAPI Response Summary:');
      console.log(`- Register Endpoint: ${registerStatus || 'Error'}`);
      console.log(`- DB Check Endpoint: ${dbCheckStatus || 'Error'}`);
    }
    
    if (results.tests.urlConstruction) {
      console.log('\nPossible URL Issues:');
      Object.entries(results.tests.urlConstruction).forEach(([endpoint, urls]) => {
        console.log(`\nEndpoint: ${endpoint}`);
        urls.forEach(({ pattern, url, isLikelyCorrect }) => {
          console.log(`  ${isLikelyCorrect ? '✅' : '❌'} Pattern ${pattern}: ${url}`);
        });
      });
    }
  })
  .catch(error => {
    console.error('Error running tests:', error);
  }); 