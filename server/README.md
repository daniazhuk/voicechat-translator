# Voice Chat Translator Server

A WebSocket server that enables real-time communication between two devices using session keys.

## Features

- Session-based device pairing
- Real-time bidirectional data transfer between paired devices
- Automatic session management and cleanup
- Simple API for client integration

## Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:

```bash
  npm install
```

## Usage

### Starting the Server

```bash
  npm start
```

The server will start on port 3000 by default.

## Client Integration

Clients can connect to the server using Socket.IO. Here's how to integrate with the server:

### 1. Connect to the Server

```javascript
const { io } = require("socket.io-client");
// or in browser: import { io } from "socket.io-client";

const socket = io("http://your-server-address:3000");
```

### 2. Join a Session

Both devices need to use the same session key to be paired:

```javascript
// Generate or use a predefined session key
const sessionKey = "your-unique-session-key";

// Join the session
socket.emit("joinSession", sessionKey);
```

### 3. Handle Session Status

```javascript
socket.on("sessionStatus", (status) => {
    console.log(`Session status: ${status.status} - ${status.message}`);
    
    // Possible status values:
    // - "waiting": Waiting for another device to join
    // - "connected": Both devices are connected
    // - "error": Error occurred (e.g., session is full)
    // - "expired": Session has expired
});
```

### 4. Transfer Data

Once connected, devices can transfer data to each other:

```javascript
// Send data to the other device in the session
const data = {
    type: "text", // or "audio", "image", etc.
    content: "Hello from Device 1!",
    timestamp: new Date().toISOString()
};
socket.emit("transferData", data);

// Receive data from the other device
socket.on("receiveData", (data) => {
    console.log("Received data:", data);
    // Process the received data
});
```

### 5. Handle Errors

```javascript
socket.on("error", (error) => {
    console.error("Error:", error);
});
```

### 6. Handle Disconnection

```javascript
socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
```

## Session Management

- Each session can have a maximum of 2 devices
- Sessions are automatically cleaned up when all devices disconnect
- Sessions older than 24 hours are automatically removed

## Example

See `test-client.js` for a complete example of how to use the server.

## License

ISC
