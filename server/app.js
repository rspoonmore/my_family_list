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
const allowedOrigins = process.env.STATIC_SITE_URL
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if(allowedOrigins.toLowerCase() === origin.toLowerCase()) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    next();
})

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
