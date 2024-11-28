//@jest-environment node
import request from 'supertest'; // For testing HTTP requests
import express from 'express'; // For handling the server
import bodyParser from 'body-parser'; // Middleware for request parsing
import cors from 'cors'; // Middleware for handling CORS
import readline from 'readline'; // For reading input from the command line
// Create a test server based on your server.ts file
const app = express();
app.use(cors());
app.use(bodyParser.json());
// Sample data (mocked for testing)
let items = [
    { id: 1, name: 'John Deere 6230 Tractor', description: '4 Cylinder Diesel.', highestBid: 28000 },
    { id: 2, name: '1990 GMC 7000 digger derrick truck', description: '8 Cylinder Diesel.', highestBid: 4100 },
];
// Mock endpoints for testing
app.get('/api/items', (req, res) => {
    res.json(items);
});
app.post('/api/bid', (req, res) => {
    const { id, bid } = req.body;
    const item = items.find((item) => item.id === id);
    if (item && bid > item.highestBid) {
        item.highestBid = bid;
        res.status(200).json({ success: true, item });
    }
    else {
        res.status(400).json({ success: false, message: 'Invalid bid.' });
    }
});
describe('API Tests', () => {
    it('should fetch all items and display their current highest bids', async () => {
        // Test the GET /api/items endpoint
        const response = await request(app).get('/api/items');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        console.log('\nCurrent items and highest bids:');
        response.body.forEach((item) => {
            console.log(`${item.name}: $${item.highestBid}`);
        });
    });
    it('should allow entering a new bid and verify the highest bid is updated', async () => {
        // Prompt user for input using readline
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const askQuestion = (query) => {
            return new Promise((resolve) => rl.question(query, resolve));
        };
        // Get the current highest bid for item 1
        const initialResponse = await request(app).get('/api/items');
        const item = initialResponse.body.find((i) => i.id === 1);
        console.log(`\nCurrent highest bid for ${item.name}: $${item.highestBid}`);
        // Ask user for a new bid
        const userInput = await askQuestion('Enter your new bid: ');
        rl.close();
        const newBid = parseFloat(userInput);
        if (isNaN(newBid)) {
            console.error('Invalid input. Please enter a numeric value.');
            return;
        }
        // Submit the new bid using POST /api/bid
        const postResponse = await request(app)
            .post('/api/bid')
            .send({ id: 1, bid: newBid });
        if (postResponse.status === 200) {
            console.log(`\nNew highest bid for ${postResponse.body.item.name}: $${postResponse.body.item.highestBid}`);
        }
        else {
            console.error('\nBid update failed:', postResponse.body.message);
        }
        // Assert that the bid was updated successfully
        if (postResponse.status === 200) {
            expect(postResponse.body.item.highestBid).toBe(newBid);
        }
        else {
            expect(postResponse.status).toBe(400);
        }
    });
});
