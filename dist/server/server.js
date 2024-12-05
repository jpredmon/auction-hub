import express from 'express'; // core framework for web apps and APIs in Node.js
import cors from 'cors'; // Cross-Origin Resource Sharing
import session from 'express-session'; // Ensure this is already installed and imported
import passport from './auth/passport.js';
import sequelize from './config/database.js';
import bcrypt from 'bcrypt';
import User, { UserRole } from './models/User.js';
import Item from './models/Item.js';
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
        // Seed Items
        const existingItem1 = await Item.findOne({ where: { name: 'John Deere 6230 Tractor' } });
        if (!existingItem1) {
            await Item.create({
                name: 'John Deere 6230 Tractor',
                description: '4 Cylinder Diesel.',
                highestBid: 28000,
            });
            console.log('Item: John Deere 6230 Tractor created.');
        }
        const existingItem2 = await Item.findOne({ where: { name: '1990 GMC 7000 digger derrick truck' } });
        if (!existingItem2) {
            await Item.create({
                name: '1990 GMC 7000 digger derrick truck',
                description: '8 Cylinder Diesel.',
                highestBid: 4100,
            });
            console.log('Item: 1990 GMC 7000 digger derrick truck created.');
        }
        console.log('DB seeded.');
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
// let items = [
//   { id: 1, name: 'John Deere 6230 Tractor', description: '4 Cylinder Diesel.', highestBid: 28000 },
//   { id: 2, name: '1990 GMC 7000 digger derrick truck', description: '8 Cylinder Diesel.', highestBid: 4100 },
// ];
app.get('/', (req, res) => {
    res.send('Welcome to the server!');
});
// API Routes
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
// app.use((req, res, next) => {
//   console.log('Line 165 Cookies:', req.cookies); // You may need to use a cookie-parser middleware
//   next();
// });
// Public Route: Fetch items
app.get('/api/items', async (req, res) => {
    try {
        const items = await Item.findAll(); // Fetch all items from the database
        res.json(items);
    }
    catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ success: false, message: 'Error fetching items.' });
    }
});
app.get('/test-auth', authorize(UserRole.BIDDER), (req, res) => {
    res.json({ success: true, message: 'User authorized!', user: req.user });
});
app.get('/check-cookies', (req, res) => {
    res.json({ cookies: req.cookies });
});
// Handle POST requests to the /api/bid endpoint
// Protected Route: Place a bid (requires authentication and bidder role)
app.post('/api/bid', passport.authenticate('session'), authorize(UserRole.BIDDER), async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    const { id, bid } = req.body;
    try {
        const item = await Item.findByPk(id); // Find item by primary key (id)
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found.' });
        }
        if (bid > item.highestBid) {
            item.highestBid = bid; // Update the highest bid
            await item.save(); // Save the updated item
            res.status(200).json({ success: true, item });
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid bid.' });
        }
    }
    catch (err) {
        console.error('Error placing bid:', err);
        res.status(500).json({ success: false, message: 'Error placing bid.' });
    }
});
// Admin-only Route: Manage auction items
app.post('/api/items', passport.authenticate('session'), authorize(UserRole.ADMIN), // Allow only users with the "ADMIN" role
async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
    }
    const { name, description, highestBid } = req.body;
    try {
        const newItem = await Item.create({ name, description, highestBid });
        res.status(201).json({ success: true, item: newItem });
    }
    catch (err) {
        console.error('Error creating item:', err);
        res.status(500).json({ success: false, message: 'Error creating item.' });
    }
});
// Admin-only Route: Delete an auction item
app.delete('/api/items/:id', // Use a URL parameter to specify the item ID
passport.authenticate('session'), authorize(UserRole.ADMIN), // Only admins can delete items
async (req, res) => {
    // Get the item ID from the request parameters
    const { id } = req.params;
    // Find the item in the database
    const item = await Item.findByPk(id); // Replace with your Sequelize model if needed
    if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    try {
        // Delete the item from the database
        await item.destroy();
        return res.status(200).json({ success: true, message: 'Item deleted successfully.' });
    }
    catch (err) {
        console.error('Error deleting item:', err);
        return res.status(500).json({ success: false, message: 'Error deleting item.' });
    }
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
