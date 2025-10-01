const express = require('express');
require('dotenv').config();

// Load routers
const userRouter = require('./routes/userRouter');
const membershipRouter = require('./routes/membershipRouter');
const listRouter = require('./routes/listRouter');
const itemRouter = require('./routes/itemRouter');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup API permissions 
const allowedOrigins = [
  process.env.STATIC_SITE_URL,
  'http://localhost:3000',
  'http://localhost:5173'
];

const checkOrigin = (req, res, next) => {
  const origin = req?.headers?.origin || '';
  console.log('Request incoming from origin: ', req?.headers?.origin || 'NONE')

  if (allowedOrigins.includes(origin)) {
    // If the origin is in our allowed list, let the request proceed.
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
  } else {
    // If the origin is not allowed, send a 403 Forbidden error.
    res.status(403).json({
      success: false,
      message: 'Permission Denied: Invalid Origin'
    });
  }
};
app.use(checkOrigin)

// Setup fall through API response
app.get('/', (req, res) => {
    console.log('Hit Fallthrough')
    res.json({
        message: 'Empty Call Response'
    });
});

app.use('/users', userRouter);
app.use('/memberships', membershipRouter);
app.use('/lists', listRouter);
app.use('/items', itemRouter);

app.listen(process.env.PORT || 5000, () => {console.log(`Listening on port ${process.env.PORT || 5000}`)});
