// Simple script to test the API connection
const https = require('https');

const apiUrl = 'https://meeting-spot-backend.onrender.com/api/v2/health';

console.log(`Testing connection to: ${apiUrl}`);

const request = https.get(apiUrl, (response) => {
  console.log(`Status Code: ${response.statusCode}`);
  console.log(`Status Message: ${response.statusMessage}`);
  
  let data = '';
  
  response.on('data', (chunk) => {
    data += chunk;
  });
  
  response.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('Response Data:');
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log('Raw Response:');
      console.log(data);
    }
  });
});

request.on('error', (error) => {
  console.error('Error:', error.message);
});

request.end(); 