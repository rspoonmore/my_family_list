const express = require('express');
require('dotenv').config();

// Load routers
const userRouter = require('./routes/userRouter');
const membershipRouter = require('./routes/membershipRouter');
const listRouter = require('./routes/listRouter');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setup API permissions 
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173']
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if(allowedOrigins.includes(origin)) {
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

app.listen(process.env.PORT || 5000, () => {console.log(`Listening on port ${process.env.PORT || 5000}`)});
