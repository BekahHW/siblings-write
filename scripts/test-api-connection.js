#!/usr/bin/env node

/**
 * Test script for Kit API connection
 * 
 * This script tests the connection to the Kit API with different authentication methods
 * to help debug 401 Unauthorized errors.
 * 
 * Usage: node test-api-connection.js
 */

const fetch = require('node-fetch');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get API key from environment
const KIT_API_KEY = process.env.KIT_API_KEY;

// Log API key details (without revealing the actual key)
console.log('API Key exists:', !!KIT_API_KEY);
console.log('API Key length:', KIT_API_KEY ? KIT_API_KEY.length : 0);
console.log('API Key first 4 chars:', KIT_API_KEY ? KIT_API_KEY.substring(0, 4) : 'none');

// Test different API endpoints and authentication methods
async function testApiConnection() {
  console.log('\n=== Testing Kit API Connection ===\n');
  
  // Test cases for different auth methods
  const testCases = [
    {
      name: 'Using X-Kit-Api-Key header (per documentation)',
      url: 'https://api.kit.com/v4/broadcasts?limit=1',
      headers: {
        'X-Kit-Api-Key': KIT_API_KEY,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Using Bearer token format',
      url: 'https://api.kit.com/v4/broadcasts?limit=1',
      headers: {
        'Authorization': `Bearer ${KIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Using API key directly',
      url: 'https://api.kit.com/v4/broadcasts?limit=1',
      headers: {
        'Authorization': KIT_API_KEY,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Using API key with ApiKey prefix',
      url: 'https://api.kit.com/v4/broadcasts?limit=1',
      headers: {
        'Authorization': `ApiKey ${KIT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Using API key as a parameter',
      url: `https://api.kit.com/v4/broadcasts?limit=1&api_key=${KIT_API_KEY}`,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    {
      name: 'Testing /v4/me endpoint with X-Kit-Api-Key',
      url: 'https://api.kit.com/v4/me',
      headers: {
        'X-Kit-Api-Key': KIT_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  ];
  
  // Run all test cases
  for (const testCase of testCases) {
    console.log(`\n--- Testing: ${testCase.name} ---`);
    console.log(`URL: ${testCase.url}`);
    console.log('Headers:', JSON.stringify(testCase.headers, null, 2));
    
    try {
      const response = await fetch(testCase.url, { headers: testCase.headers });
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      // Try to parse response
      try {
        if (response.status !== 204) { // No content
          const responseText = await response.text();
          console.log('Response:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
          
          try {
            const responseJson = JSON.parse(responseText);
            if (responseJson.errors) {
              console.log('Error details:', responseJson.errors);
            }
          } catch (e) {
            // Not JSON, already showed text version
          }
        }
      } catch (e) {
        console.log('Could not read response body');
      }
      
      if (response.ok) {
        console.log('✅ SUCCESS - This authentication method works!');
      } else {
        console.log('❌ FAILED - This authentication method does not work');
      }
    } catch (error) {
      console.error('Error making request:', error.message);
      console.log('❌ FAILED - Request error');
    }
  }
  
  console.log('\n=== Test Results ===');
  console.log('If any test succeeded with a 200 status, use that authentication method in your script.');
  console.log('If all tests failed with 401 Unauthorized, your API key may be invalid or expired.');
}

// Run the tests
testApiConnection().catch(error => {
  console.error('Error running tests:', error);
});