const https = require('https');

function testEndpoint(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ url, status: res.statusCode, data: data.substring(0, 300) });
      });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function main() {
  const endpoints = [
    'https://mrstudy.net/api/faq',
    'https://mrstudy.net/api/faqs',
    'https://mrstudy.net/api/user/faq',
    'https://mrstudy.net/api/user/faqs',
    'https://mrstudy.net/api/general/faq',
    'https://mrstudy.net/api/general/faqs',
    'https://mrstudy.net/api/user/general/faq',
    'https://mrstudy.net/api/user/general/faqs',
  ];
  
  for (const ep of endpoints) {
    const res = await testEndpoint(ep);
    console.log(`[${res.status || 'ERR'}] ${ep} -> ${res.data || res.error}`);
  }
}

main();
