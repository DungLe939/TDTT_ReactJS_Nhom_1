const https = require('https');
https.get('https://firestore.googleapis.com/v1/projects/smart-tourism-abf26/databases/(default)/documents/restaurants?pageSize=1', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 500)));
});
