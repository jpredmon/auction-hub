'use client';
import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, Button, TextField } from '@mui/material';
const App = () => {
    const [items, setItems] = useState([]);
    const [bid, setBid] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    useEffect(() => {
        if (isLoggedIn) {
            fetchItems();
        }
    }, [isLoggedIn]);
    const fetchItems = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/items');
            const data = await response.json();
            setItems(data);
        }
        catch (error) {
            console.error('Error fetching items:', error);
        }
    };
    const handleBid = async (id) => {
        try {
            console.log("Sending bid request for item ID:", id); // Log the ID
            console.log("Bid value:", bid); // Log the bid value
            const response = await fetch('http://localhost:5000/api/bid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, bid }),
                credentials: 'include',
            });
            console.log("Response status:", response.status); // Log the response status
            console.log("Response headers:", response.headers); // Log headers
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            setItems((prev) => prev.map((item) => item.id === id ? Object.assign(Object.assign({}, item), { highestBid: data.item.highestBid }) : item));
        }
        catch (error) {
            console.error('Error submitting bid:', error);
        }
    };
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
            }
            else {
                alert('Login failed');
            }
        }
        catch (error) {
            console.error('Error logging in:', error);
        }
    };
    return (<Container>
      {!isLoggedIn ? (<Card>
          <CardContent>
            <Typography variant="h5">Login</Typography>
            <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth/>
            <TextField type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth/>
            <Button variant="contained" onClick={handleLogin}>
              Login
            </Button>
          </CardContent>
        </Card>) : (<>
          <Typography variant="h3" gutterBottom>
            Auction Items
          </Typography>
          {items.map((item) => (<Card key={item.id} style={{ marginBottom: '1rem' }}>
              <CardContent>
                <Typography variant="h5">{item.name}</Typography>
                <Typography>{item.description}</Typography>
                <Typography>Highest Bid: ${item.highestBid}</Typography>
                <TextField type="number" label="Your Bid" value={selectedItem === item.id ? bid : ''} onChange={(e) => {
                    setBid(Number(e.target.value));
                    setSelectedItem(item.id);
                }}/>
                <Button variant="contained" onClick={() => handleBid(item.id)}>
                  Submit Bid
                </Button>
              </CardContent>
            </Card>))}
        </>)}
    </Container>);
};
export default App;
