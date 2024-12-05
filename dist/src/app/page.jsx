"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, Button, TextField, IconButton, } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
const App = () => {
    const [items, setItems] = useState([]);
    const [bid, setBid] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null); // To store the user's role
    const [newItemName, setNewItemName] = useState("");
    const [newItemDescription, setNewItemDescription] = useState("");
    const [newItemHighestBid, setNewItemHighestBid] = useState(0);
    useEffect(() => {
        if (isLoggedIn) {
            fetchItems();
        }
    }, [isLoggedIn]);
    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.success) {
                setIsLoggedIn(true);
                setUserRole(username);
            }
            else {
                alert("Login failed");
            }
        }
        catch (error) {
            console.error("Error logging in:", error);
        }
    };
    const fetchItems = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/items");
            const data = await response.json();
            setItems(data);
        }
        catch (error) {
            console.error("Error fetching items:", error);
        }
    };
    const handleAddItem = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newItemName,
                    description: newItemDescription,
                    highestBid: newItemHighestBid,
                }),
                credentials: "include", // Include cookies for authentication
            });
            const data = await response.json();
            if (data.success) {
                setItems((prev) => [...prev, data.item]); // Add the new item to the list
                setNewItemName("");
                setNewItemDescription("");
                setNewItemHighestBid(0); // Reset the new item input fields
            }
            else {
                console.error("Failed to add new item");
            }
        }
        catch (error) {
            console.error("Error adding new item:", error);
        }
    };
    const handleBid = async (id) => {
        try {
            //console.log("Sending bid request for item ID:", id); // Log the ID
            //console.log("Bid value:", bid); // Log the bid value
            const response = await fetch("http://localhost:5000/api/bid", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, bid }),
                credentials: "include",
            });
            //console.log("Response status:", response.status); // Log the response status
            //console.log("Response headers:", response.headers); // Log headers
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            const data = await response.json();
            console.log(data);
            setItems((prev) => prev.map((item) => item.id === id ? Object.assign(Object.assign({}, item), { highestBid: data.item.highestBid }) : item));
        }
        catch (error) {
            console.error("Error submitting bid:", error);
        }
    };
    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/items/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // This allows cookies to be included
            });
            if (response.ok) {
                setItems((prevItems) => prevItems.filter((item) => item.id !== id));
                alert("Item deleted successfully");
            }
            else {
                console.error("Failed to delete item", id);
            }
        }
        catch (error) {
            console.error("Error deleting item:", error);
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
          {/* Conditionally render the admin functionality */}
          {username === "admin" && (<Card style={{ marginBottom: "1rem" }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1 }}>Add New Item</Typography>
                <TextField label="Item Name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} fullWidth sx={{ mb: 1 }}/>
                <TextField label="Description" value={newItemDescription} onChange={(e) => setNewItemDescription(e.target.value)} fullWidth sx={{ mb: 1 }}/>
                <TextField label="Highest Bid" type="number" value={newItemHighestBid} onChange={(e) => setNewItemHighestBid(Number(e.target.value))} fullWidth sx={{ mb: 1 }}/>
                <Button variant="contained" onClick={handleAddItem}>
                  Add Item
                </Button>
              </CardContent>
            </Card>)}
          {items.map((item) => (<Card key={item.id} style={{ marginBottom: "1rem", position: "relative" }}>
              <CardContent>
                <Typography variant="h5">{item.name}</Typography>
                <Typography>{item.description}</Typography>
                <Typography>Highest Bid: ${item.highestBid}</Typography>
                {/* Conditionally render the admin functionality for delete*/}
                {username === "admin" && (<IconButton onClick={() => handleDelete(item.id)} style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                    }}>
                    <DeleteIcon />
                  </IconButton>)}
                 {/* Conditionally render the bidder functionality for bid*/}
                 {username === "bidder1" && (<><TextField type="number" label="Your Bid" value={selectedItem === item.id ? bid : ""} onChange={(e) => {
                        setBid(Number(e.target.value));
                        setSelectedItem(item.id);
                    }}/><Button variant="contained" onClick={() => handleBid(item.id)}>
                      Submit Bid
                    </Button></>)}
              </CardContent>
            </Card>))}
        </>)}
    </Container>);
};
export default App;
