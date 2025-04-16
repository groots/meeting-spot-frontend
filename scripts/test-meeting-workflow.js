#!/usr/bin/env node

/**
 * Meeting Spot Workflow Test Script
 * 
 * This script tests the end-to-end functionality of the meeting spot finding workflow.
 * It simulates both User A and User B to create a meeting request, respond to it,
 * and verify the results.
 * 
 * Prerequisites:
 * - A running backend API
 * - Valid test user credentials
 * - API_URL environment variable set to the backend URL
 */

const fetch = require('node-fetch');
const colors = require('colors/safe');
const readline = require('readline');

// Configuration
const API_URL = process.env.API_URL || 'https://api.findameetingspot.com';
const TEST_CREDENTIALS = {
  email: process.env.TEST_EMAIL || 'test@example.com',
  password: process.env.TEST_PASSWORD || 'testpassword',
};

// Test locations (New York - Empire State Building and Grand Central)
const LOCATION_A = {
  address: '350 5th Ave, New York, NY',
  lat: 40.7484,
  lon: -73.9857
};

const LOCATION_B = {
  address: '89 E 42nd St, New York, NY',
  lat: 40.7527,
  lon: -73.9772
};

// Create readline interface for interactive mode
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utilities
const log = {
  info: (msg) => console.log(colors.blue('INFO: ') + msg),
  success: (msg) => console.log(colors.green('SUCCESS: ') + msg),
  error: (msg) => console.log(colors.red('ERROR: ') + msg),
  warning: (msg) => console.log(colors.yellow('WARNING: ') + msg),
  step: (msg) => console.log(colors.cyan('\n=== ' + msg + ' ==='))
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test steps
async function login() {
  log.step('Logging in as User A');
  
  try {
    const response = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_CREDENTIALS.email,
        password: TEST_CREDENTIALS.password,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Login failed: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    log.success(`Logged in successfully as ${TEST_CREDENTIALS.email}`);
    return data.access_token;
  } catch (error) {
    log.error(`Login failed: ${error.message}`);
    process.exit(1);
  }
}

async function createMeetingRequest(token) {
  log.step('Creating meeting request');
  
  try {
    const requestData = {
      address_a: LOCATION_A.address,
      location_type: 'Restaurant / Food',
      user_b_contact_type: 'EMAIL',
      user_b_contact: 'userb-test@example.com',
      address_a_lat: LOCATION_A.lat,
      address_a_lon: LOCATION_A.lon
    };
    
    log.info(`Request data: ${JSON.stringify(requestData, null, 2)}`);
    
    const response = await fetch(`${API_URL}/api/v1/meeting-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || response.statusText;
      } catch {
        errorMessage = errorText || response.statusText;
      }
      throw new Error(`Failed to create meeting request: ${errorMessage}`);
    }
    
    const data = await response.json();
    log.success(`Meeting request created with ID: ${data.request_id}`);
    
    return {
      requestId: data.request_id,
      status: data.status,
      shareUrl: `${API_URL}/request/${data.request_id}?token=${data.share_token}`,
      shareToken: data.share_token
    };
  } catch (error) {
    log.error(`Failed to create meeting request: ${error.message}`);
    process.exit(1);
  }
}

async function respondToRequest(requestId, shareToken) {
  log.step('Responding to meeting request as User B');
  
  try {
    const responseData = {
      address_b: LOCATION_B.address,
      address_b_lat: LOCATION_B.lat,
      address_b_lon: LOCATION_B.lon,
      token: shareToken
    };
    
    log.info(`Response data: ${JSON.stringify(responseData, null, 2)}`);
    
    const response = await fetch(`${API_URL}/api/v1/meeting-requests/${requestId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || response.statusText;
      } catch {
        errorMessage = errorText || response.statusText;
      }
      throw new Error(`Failed to respond to meeting request: ${errorMessage}`);
    }
    
    const data = await response.json();
    log.success(`Response submitted, status: ${data.status}`);
    
    return data.status;
  } catch (error) {
    log.error(`Failed to respond to meeting request: ${error.message}`);
    return null;
  }
}

async function waitForResults(requestId, token, maxAttempts = 10) {
  log.step('Waiting for meeting spot calculation to complete');
  
  let attempts = 0;
  let status = 'calculating';
  
  while (status === 'calculating' && attempts < maxAttempts) {
    attempts++;
    log.info(`Checking status, attempt ${attempts}/${maxAttempts}...`);
    
    try {
      const response = await fetch(`${API_URL}/api/v1/meeting-requests/${requestId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        log.warning(`Failed to check status: ${response.statusText}`);
      } else {
        const data = await response.json();
        status = data.status;
        log.info(`Current status: ${status}`);
        
        if (status === 'completed') {
          log.success('Meeting spot calculation completed successfully!');
          return data;
        } else if (status === 'failed') {
          log.error('Meeting spot calculation failed');
          return null;
        }
      }
    } catch (error) {
      log.warning(`Error checking status: ${error.message}`);
    }
    
    // Wait 2 seconds before next attempt
    await sleep(2000);
  }
  
  if (status !== 'completed') {
    log.error(`Meeting spot calculation did not complete after ${maxAttempts} attempts`);
    return null;
  }
}

async function verifyResults(resultsData) {
  log.step('Verifying meeting spot results');
  
  if (!resultsData) {
    log.error('No results data to verify');
    return false;
  }
  
  // Verify we have suggested options
  const suggestions = resultsData.suggested_options || [];
  if (suggestions.length === 0) {
    log.error('No meeting spots were suggested');
    return false;
  }
  
  log.success(`Found ${suggestions.length} suggested meeting spots`);
  
  // Verify midpoint calculation
  if (!resultsData.midpoint) {
    log.warning('Midpoint data is missing');
  } else {
    log.info(`Midpoint calculated at: ${JSON.stringify(resultsData.midpoint)}`);
  }
  
  // Log the top 3 suggestions
  log.info('Top suggestions:');
  suggestions.slice(0, 3).forEach((spot, index) => {
    console.log(`  ${index + 1}. ${spot.name} (${spot.address}) - Rating: ${spot.rating || 'N/A'}`);
  });
  
  // Verify the suggestions are within a reasonable distance of the midpoint
  // This is a simple check that could be expanded
  if (resultsData.midpoint && suggestions[0].location) {
    const midpoint = resultsData.midpoint;
    const firstSpot = suggestions[0].location;
    
    // Simple distance check (not accurate, just for testing)
    const distance = Math.sqrt(
      Math.pow(midpoint.lat - firstSpot.lat, 2) + 
      Math.pow(midpoint.lng - firstSpot.lng, 2)
    ) * 111; // Rough conversion to km
    
    log.info(`Distance from midpoint to first suggestion: ~${distance.toFixed(2)} km`);
    
    if (distance > 5) {
      log.warning('First suggestion seems far from the midpoint (>5km)');
    } else {
      log.success('First suggestion is within reasonable distance from midpoint');
    }
  }
  
  return true;
}

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main function that runs the full workflow test
async function runWorkflowTest() {
  log.step('STARTING MEETING SPOT WORKFLOW TEST');
  console.log('Testing against API URL:', API_URL);
  
  try {
    // Step 1: Login as User A
    const token = await login();
    
    // Step 2: Create a meeting request
    const requestData = await createMeetingRequest(token);
    console.log('\nShare URL:', colors.green(requestData.shareUrl));
    
    // Optional: Allow manual testing
    const useManualTesting = await prompt(
      '\nDo you want to manually test by opening the share URL in a browser? (y/n): '
    );
    
    if (useManualTesting.toLowerCase() === 'y') {
      console.log('\nPlease open the share URL in a browser and complete the response form.');
      console.log('Press Enter when you have submitted the form...');
      await prompt('');
    } else {
      // Step 3: Simulate User B responding to the request
      await respondToRequest(requestData.requestId, requestData.shareToken);
    }
    
    // Step 4: Wait for the calculation to complete
    const resultsData = await waitForResults(requestData.requestId, token);
    
    // Step 5: Verify the results
    const success = await verifyResults(resultsData);
    
    if (success) {
      log.success('WORKFLOW TEST COMPLETED SUCCESSFULLY');
    } else {
      log.error('WORKFLOW TEST FAILED: Results verification failed');
      process.exit(1);
    }
  } catch (error) {
    log.error(`WORKFLOW TEST FAILED: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the test
runWorkflowTest(); 