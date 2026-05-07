const https = require('https');

const config = {
  hostname: 'ideal.cloud.tvserp.com',
  path: '/api/transactions/7051566551057335',
  method: 'GET',
  headers: {
    'User-Agent': 'yaak',
    'Accept': '*/*',
    'x-api-key': 'a1ed5fbc665c496b35def802c1598543'
  },
  timeout: 10000
};

const startTime = Date.now();

console.log('===========================================');
console.log('🔍 Verificando estado de iDEAL Channel...');
console.log('===========================================');
console.log(`URL: https://${config.hostname}${config.path}`);
console.log('');

const req = https.request(config, (res) => {
  const duration = Date.now() - startTime;
  const status = res.statusCode;
  
  console.log('-------------------------------------------');
  
  if (status === 200) {
    console.log('✅ iDEAL Channel: UP');
    console.log(`   Status Code: ${status}`);
    console.log(`   Response Time: ${duration}ms`);
  } else {
    console.log('❌ iDEAL Channel: DOWN');
    console.log(`   Status Code: ${status}`);
    console.log(`   Response Time: ${duration}ms`);
  }
  
  console.log('-------------------------------------------');
  
  req.destroy();
});

req.on('error', (err) => {
  const duration = Date.now() - startTime;
  console.log('-------------------------------------------');
  console.log('❌ iDEAL Channel: DOWN');
  console.log(`   Error: ${err.message}`);
  console.log(`   Response Time: ${duration}ms`);
  console.log('-------------------------------------------');
});

req.on('timeout', () => {
  console.log('-------------------------------------------');
  console.log('❌ iDEAL Channel: DOWN (Timeout)');
  console.log(`   Timeout: 10 segundos`);
  console.log('-------------------------------------------');
  req.destroy();
});

req.end();
