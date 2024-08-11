const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const tls = require('tls');
const fs = require('fs');
const { URL } = require('url');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

let requestCounter = 0;

// Xử lý các yêu cầu DoH
app.all('/doh/:username', bodyParser.raw({ type: 'application/dns-message' }), async (req, res) => {
  const { username } = req.params;
  const dnsQuery = req.method === 'GET' ? req.query.dns : req.body;
  const contentType = 'application/dns-message';

  if ((req.method === 'GET' && !req.query.dns) || (req.method === 'POST' && !dnsQuery.length) || req.headers['content-type'] !== contentType) {
    return res.redirect('/');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const dohEndpoints = user.nextdnsUrls;
    if (!dohEndpoints || dohEndpoints.length === 0) {
      return res.status(500).send('No DOH endpoints available');
    }

    const currentEndpoint = dohEndpoints[requestCounter];
    requestCounter = (requestCounter + 1) % dohEndpoints.length;

    if (!currentEndpoint.startsWith('http://') && !currentEndpoint.startsWith('https://')) {
      throw new Error(`Invalid DOH endpoint: ${currentEndpoint}`);
    }

    const response = await fetch(currentEndpoint + (req.method === 'GET' ? `?dns=${dnsQuery}` : ''), {
      method: req.method,
      headers: {
        'Accept': contentType,
        'Content-Type': contentType,
      },
      body: req.method === 'POST' ? dnsQuery : undefined,
    });

    if (!response.ok) {
      return res.status(response.status).send('Error fetching DOH response');
    }

    const data = await response.buffer();
    res.setHeader('Content-Type', contentType);
    res.send(data);
  } catch (error) {
    console.error('Error fetching DOH response:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Tạo server TLS cho DoT
const dotServer = tls.createServer({
  key: fs.readFileSync('/path/to/privkey.pem'),
  cert: fs.readFileSync('/path/to/fullchain.pem')
}, async (socket) => {
  let isEnded = false;

  socket.on('data', async (data) => {
    const hostname = socket.servername || '';
    const username = hostname.split('.')[0];

    try {
      const user = await User.findOne({ username });
      if (!user) {
        socket.destroy();
        return;
      }

      const dotEndpoints = user.nextdnsUrls.map(url => {
        const pathPart = new URL(url).pathname.slice(1);
        return `${pathPart}.dns.nextdns.io`;
      });

      const currentEndpoint = dotEndpoints[requestCounter];
      requestCounter = (requestCounter + 1) % dotEndpoints.length;

      const client = tls.connect(853, currentEndpoint, {
        rejectUnauthorized: false,
        servername: currentEndpoint  // Ensure SNI is set
      }, () => {
        client.write(data);
      });

      client.on('data', (responseData) => {
        if (!isEnded) {
          socket.write(responseData);
        }
      });

      client.on('end', () => {
        if (!isEnded) {
          socket.end();
          isEnded = true;
        }
      });

      client.on('error', (err) => {
        console.error(`Error forwarding DoT request to ${currentEndpoint}:`, err);
        if (!isEnded) {
          socket.destroy();
          isEnded = true;
        }
      });

    } catch (error) {
      console.error('Error fetching DoT response:', error);
      if (!isEnded) {
        socket.destroy();
        isEnded = true;
      }
    }
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

dotServer.listen(853, () => {
  console.log('DoT server is running on port 853');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
