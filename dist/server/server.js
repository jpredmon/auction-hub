import express from 'express'; // core framework for web apps and APIs in Node.js
import cors from 'cors'; // Cross-Origin Resource Sharing
import session from 'express-session'; // Ensure this is already installed and imported
import passport from './auth/passport.js';
import sequelize from './config/database.js';
import bcrypt from 'bcrypt';
import User, { UserRole } from './models/User.js';
import { authorize } from './middleware/authorize.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
// Load environment variables from .env file
dotenv.config();
sequelize.authenticate()
    .then(() => console.log('Database connected successfully.'))
    .catch((err) => console.error('Unable to connect to the database:', err));
sequelize.sync({ force: false }).then(() => {
    console.log('Database synchronized.');
});
const seedDatabase = async () => {
    try {
        // Ensure password is retrieved from the environment variable or defaults to a secure fallback
        const adminPassword = process.env.ADMIN_PASSWORD || 'defaultADMIN_PASSWORD';
        if (adminPassword === 'defaultADMIN_PASSWORD') {
            console.warn('Warning: Using default admin password. Please set ADMIN_PASSWORD in .env for production.');
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        // Check if 'admin' user exists
        const adminUser = await User.findOne({ where: { username: 'admin' } });
        if (!adminUser) {
            await User.create({
                username: 'admin',
                password: hashedPassword,
                role: UserRole.ADMIN,
            });
            console.log('Admin user created.');
        }
        else {
            console.log('Admin user already exists, skipping creation.');
        }
        // Check if 'bidder1' user exists
        const bidder1 = await User.findOne({ where: { username: 'bidder1' } });
        if (!bidder1) {
            const bidderPassword = 'password123'; // You can still use a default password or an environment variable for each user
            const hashedBidderPassword = await bcrypt.hash(bidderPassword, 10);
            await User.create({
                username: 'bidder1',
                password: hashedBidderPassword,
                role: UserRole.BIDDER,
            });
            console.log('Bidder1 user created.');
        }
        else {
            console.log('Bidder1 user already exists, skipping creation.');
        }
        console.log('Users seeded.');
    }
    catch (error) {
        console.error('Error while seeding database:', error);
    }
};
seedDatabase();
const app = express();
const PORT = 5000;
// Middleware for parsing cookies
app.use(cookieParser());
// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow credentials (cookies)
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json()); // parse JSON bodies
app.use(session({
    secret: process.env.SESSION_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('SESSION_SECRET is required in production');
        }
        return 'defaultSecret';
    })(),
    resave: false,
    saveUninitialized: true,
    cookie: {
        //secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: 'lax', // or 'none' if on different origins
    },
}));
app.use(passport.initialize()); // Initialize passport for authentication
app.use(passport.session());
//app.enable('trust proxy');
// Sample data 
let items = [
    { id: 1, name: 'John Deere 6230 Tractor', description: '4 Cylinder Diesel.', highestBid: 28000 },
    { id: 2, name: '1990 GMC 7000 digger derrick truck', description: '8 Cylinder Diesel.', highestBid: 4100 },
];
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});
// API Routes
// app.post('/login', async (req, res, next) => {
//   const { username, password } = req.body;
//   try {
//     Find the user by username
//     const user = await User.findOne({ where: { username } });
//     if (!user || !password) {
//       return res.status(401).json({ success: false, message: 'Invalid username or password.' });
//     }
//     Check if the password matches
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ success: false, message: 'Invalid username or password.' });
//     }
//     Use Passport's `req.login()` to bind the user to the session
//     req.login(user, (err) => {
//       if (err) {
//         console.error('Login error:', err);
//         return next(err); // Handle error
//       }
//       Login successful, return success response
//       return res.status(200).json({ success: true, message: 'Logged in successfully.' });
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ success: false, message: 'An error occurred during login.' });
//   }
// });
// Use passport.authenticate('local') to handle login
app.post('/login', passport.authenticate('local'), (req, res) => {
    //console.log("Session after login: ", req.session);  // Log the full session object
    //console.log("Authenticated user:", req.user); // Check that the correct user data is attached
    //console.log("Cookies line 158:", req.cookies); // Check that the correct user data is attached
    //console.log("UserRole", UserRole);  // Log the full session object
    // If we get here, Passport has successfully authenticated the user
    // No need to manually check credentials or set up the session
    res.status(200).json({ success: true, message: 'Logged in successfully.' });
});
app.use((req, res, next) => {
    console.log('Line 165 Cookies:', req.cookies); // You may need to use a cookie-parser middleware
    next();
});
// Public Route: Fetch items
app.get('/api/items', (req, res) => {
    //res.set('Access-Control-Allow-Origin', 'http://localhost:3000'); // Allow specific origin
    //res.set('Access-Control-Allow-Credentials', 'true'); // Allow cookies
    res.json(items);
});
app.get('/test-auth', authorize(UserRole.BIDDER), (req, res) => {
    res.json({ success: true, message: 'User authorized!', user: req.user });
});
app.get('/check-cookies', (req, res) => {
    res.json({ cookies: req.cookies });
});
// Handle POST requests to the /api/bid endpoint
// Protected Route: Place a bid (requires authentication and bidder role)
app.post('/api/bid', (req, res, next) => {
    // console.log('Before Passport session authentication');
    // console.log("Authenticated user: ", req.user); // Log the authenticated user
    // console.log("Session after login: ", req.session);  // Log the full session object
    next(); // Continue to the next middleware
}, passport.authenticate('session'), (req, res, next) => {
    //console.log('After Passport session authentication');
    //console.log("Authenticated user: ", req.user); // Log the authenticated user
    //console.log("Session after login: ", req.session);  // Log the full session object
    next(); // Continue to the next middleware
}, authorize(UserRole.BIDDER), // Allow only users with the "BIDDER" role
(req, res) => {
    // Extract `id` and `bid` values from the request body
    // The client sends these values when making a bid
    //console.log("Authenticated user: ", req.user); // Log the authenticated user
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    //console.log("Request body: ", req.body); // Log the request body
    const { id, bid } = req.body;
    // Find the item in the `items` array that matches the provided `id`
    // `items` is assumed to be a pre-existing array of auction items
    const item = items.find((item) => item.id === id);
    //console.log(item, bid);
    // Check if the item exists and if the submitted bid is higher than the current highest bid
    if (item && bid > item.highestBid) {
        // If both conditions are true:
        // Update the item's `highestBid` property with the new bid
        item.highestBid = bid;
        // Respond with a status code of 200 (success)
        // Include a success message and the updated item in the response
        res.status(200).json({ success: true, item });
    }
    else {
        // If the item is not found or the bid is not higher than the current highest bid:
        // Respond with a status code of 400 (bad request)
        // Include an error message in the response
        res.status(400).json({ success: false, message: 'Invalid bid.' });
    }
});
// Admin-only Route: Manage auction items
app.post('/api/items', passport.authenticate('session'), authorize(UserRole.ADMIN), // Allow only users with the "ADMIN" role
(req, res) => {
    console.log("Authenticated user: ", req.user); // Log the authenticated user
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    console.log("Request body: ", req.body); // Log the request body
    const { name, description, highestBid } = req.body;
    const newItem = { id: items.length + 1, name, description, highestBid };
    items.push(newItem);
    res.status(201).json({ success: true, item: newItem });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
