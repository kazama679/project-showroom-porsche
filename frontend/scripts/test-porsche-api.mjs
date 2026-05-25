// Test script to analyze Porsche configurator API
const modelCode = '9YABN1';
const baseUrl = 'https://configurator.porsche.com';

async function testEndpoints() {
  const endpoints = [
    // Data API
    `/en-US/mode/model/${modelCode}.data`,
    `/en-US/mode/model/${modelCode}.data?options=0Q`,
    // Try REST-style API
    `/api/configuration/${modelCode}`,
    `/api/v1/configuration/${modelCode}`,
    `/api/v2/markets/US/models/${modelCode}`,
    // Try Remix loader
    `/en-US/mode/model/${modelCode}?_data=routes%2F%28configurator%29.mode.model.%24modelCode`,
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint}`;
      console.log(`\n=== Testing: ${url} ===`);
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        }
      });
      console.log(`Status: ${res.status}`);
      console.log(`Content-Type: ${res.headers.get('content-type')}`);
      
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('json')) {
          const data = await res.json();
          console.log('JSON Response keys:', Object.keys(data));
          console.log('First 500 chars:', JSON.stringify(data).substring(0, 500));
        } else {
          const text = await res.text();
          console.log('Response length:', text.length);
          console.log('First 300 chars:', text.substring(0, 300));
        }
      }
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

// Test IOD image URL 
async function testIOD() {
  // Known working URL pattern from analysis
  const iodUrl = 'https://prs.porsche.com/iod/image/US/9YABN1/1/N4Igxg9gdgZglgcxALlAQynAtmgLnaAZxQG0BdAGnDSwFMAnNFUOAExRFoA9cBaAGwgB3XjHrQ+-WjFwgqEAA74izEADc09OBlnIQrWoQDWuRSAC+5qrShq44qHSi6W7PQFV6AIwwBZNGAYciCKylDEqJZU-IgAFvhQSKggbBwAIgCCAJrBoQThzFEgCuKsAK5gLiluIACcWRkAQgByAIy5SvkRoJCwiKQgAAwAisGtaQAcYwDiU1QATADCAOzB8wBaABLBAMwAYhnBACx7AGzHw6NUR+6NwQCsywAKD76HVPcAGp-BpwCSO1+AGlar9mlcQMtBj8qMsdgBRYLLT73JFZdpUCY7NLBCYAZQAMsFak9VlQMs1gnsACqAqjTVrTYJ-ABq82ZAHU6SAgY1zlQCdNqWkAEpEqjNABS7Kow1a7xAwxFoKoLMWMpALI5GJA61aeJAlHAEDKznoAE8OO4DVQsBADPwsrRNCh5oN5qdLFYQIRaLgEghuiAYBB6DhdCAAFYKWhIKi4RjhBSaGy6GBofi+yxAA?clientId=icc';
  
  try {
    console.log('\n=== Testing IOD Image URL ===');
    const res = await fetch(iodUrl);
    console.log(`Status: ${res.status}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
    console.log(`Content-Length: ${res.headers.get('content-length')}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

testEndpoints().then(() => testIOD());
