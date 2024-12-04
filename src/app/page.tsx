
'use client'; 
import React, { useEffect, useState } from 'react'; 
import { Container, Typography, Card, CardContent, Button, TextField } from '@mui/material';

interface Item {
  id: number;
  name: string;
  description: string;
  highestBid: number;
}

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [bid, setBid] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
    }
  }, [isLoggedIn]);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // This allows cookies to be included
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLoggedIn(true);
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleBid = async (id: number) => {
    try {
      //console.log("Sending bid request for item ID:", id); // Log the ID
    //console.log("Bid value:", bid); // Log the bid value
      const response = await fetch('http://localhost:5000/api/bid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, bid }),
        credentials: 'include',
      });
      //console.log("Response status:", response.status); // Log the response status
      //console.log("Response headers:", response.headers); // Log headers
      
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, highestBid: data.item.highestBid } : item
        )
      );
    } catch (error) {
      console.error('Error submitting bid:', error);
    }
  };

  return (
    <Container>
      {!isLoggedIn ? (
        <Card>
          <CardContent>
            <Typography variant="h5">Login</Typography>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={handleLogin}>
              Login
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Typography variant="h3" gutterBottom>
            Auction Items
          </Typography>
          {items.map((item) => (
            <Card key={item.id} style={{ marginBottom: '1rem' }}>
              <CardContent>
                <Typography variant="h5">{item.name}</Typography>
                <Typography>{item.description}</Typography>
                <Typography>Highest Bid: ${item.highestBid}</Typography>
                <TextField
                  type="number"
                  label="Your Bid"
                  value={selectedItem === item.id ? bid : ''}
                  onChange={(e) => {
                    setBid(Number(e.target.value));
                    setSelectedItem(item.id);
                  }}
                />
                <Button variant="contained" onClick={() => handleBid(item.id)}>
                  Submit Bid
                </Button>
              </CardContent>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default App;


// 'use client'; 
// // This directive is specific to Next.js to ensure the component is rendered on the client side.

// import React, { useEffect, useState } from 'react'; 
// // Importing React and necessary hooks for state and lifecycle management.

// import axios from 'axios'; 
// // Importing axios for making HTTP requests to the backend.

// import { Container, Typography, Card, CardContent, Button, TextField } from '@mui/material'; 
// // Importing Material-UI components for UI styling and structure.

// interface Item {
//   id: number;            // Unique identifier for the item.
//   name: string;          // Name of the auction item.
//   description: string;   // Description of the auction item.
//   highestBid: number;    // Current highest bid for the item.
// }

// // Defining the main functional component of the application.
// const App: React.FC = () => {
//   // State to hold the list of auction items.
//   const [items, setItems] = useState<Item[]>([]);
  
//   // State to track the user's bid value.
//   const [bid, setBid] = useState<number>(0);
  
//   // State to track which item the user is bidding on.
//   const [selectedItem, setSelectedItem] = useState<number | null>(null);

//   useEffect(() => {
//     // Fetching auction items from the backend API on component mount.
//     axios.get('http://localhost:5000/api/items')
//       .then((response) => {
//         // Updating the state with the list of items retrieved from the API.
//         setItems(response.data);
//       })
//       .catch((error) => {
//         // Logging an error message if the API call fails.
//         console.error('There was an error fetching the items!', error);
//       });
//   }, []); // Empty dependency array ensures this runs only once on component mount.

//   const handleBid = (id: number) => {
//     // Function to handle submitting a bid for a specific item.
//     axios.post('http://localhost:5000/api/bid', { id, bid }, { withCredentials: true })
//       .then((response) => {
//         // Updating the highest bid for the item if the bid was successful.
//         //setItems updates the items state => setItems((prev) => { ... }) ensures we are working with latest state
//         //the map function loops through the existing array of items (prev)
//         //...prev.map((item) => { ... }) the map method creates a new array where each item is updated (or kept the same)
//         //for each item: if its id matches the one we're updating (item.id === id), a new version of the item is created with an updated highestbid
//         //otherwise, the items remains unchanged
//         //{ ...item, highestBid: response.data.item.highestBid } => ...item spreads props pf current item into a new object to ensure all props of the item remain unchaged unless explicitly modified
//         //highestBid: response.data.item.highestBid: Updates only the highestBid property of the copied item with the new highest bid value from the server (response.data.item.highestBid).
//         //item.id === id ? { ... } : item => If the current item.id matches the id of the updated item: Return a new object with the updated highestBid.
//         //otherwise: return original item unchanged
//         //Key point: This conditional (? :) ensures only the item with the matching id gets updated, while the rest remain unchanged.
//         //this creates a new array with the updated highestbid for the relevant item and leaves all other items the same
//         setItems((prev) =>
//           prev.map((item) =>
//             item.id === id ? { ...item, highestBid: response.data.item.highestBid } : item
//           )
//         );
//       })
//       .catch((error) => {
//         // Logging an error message if the bid submission fails.
//         console.error('Error submitting bid:', error);
//       });
//   };

//   return (
//     <Container>
//       {/* Header for the auction items list */}
//       <Typography variant="h3" gutterBottom>
//         Auction Items
//       </Typography>
      
//       {/* Looping through each item to display it as a card */}
//       {items.map((item) => (
//         <Card key={item.id} style={{ marginBottom: '1rem' }}>
//           <CardContent>
//             {/* Displaying the item's name, description, and current highest bid */}
//             <Typography variant="h5">{item.name}</Typography>
//             <Typography>{item.description}</Typography>
//             <Typography>Highest Bid: ${item.highestBid}</Typography>
            
//             {/* Input field for the user to enter their bid */}
//             <TextField
//               type="number"
//               label="Your Bid"
//               value={selectedItem === item.id ? bid : ''} // Show bid only for the selected item.
//               onChange={(e) => {
//                 // Update the bid value and set the selected item.
//                 setBid(Number(e.target.value));
//                 setSelectedItem(item.id);
//               }}
//             />
            
//             {/* Button to submit the bid */}
//             <Button variant="contained" onClick={() => handleBid(item.id)}>
//               Submit Bid
//             </Button>
//           </CardContent>
//         </Card>
//       ))}
//     </Container>
//   );
// };

// export default App; // Exporting the component for use in other parts of the application.
