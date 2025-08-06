// Test client for Voice Chat Translator Server
const { io } = require("socket.io-client");

// Function to create a test client
function createClient(name, sessionKey) {
    console.log(`Creating client: ${name}`);

    // Connect to the server
    const socket = io("http://localhost:3000");

    // Handle connection
    socket.on("connect", () => {
        console.log(`${name} connected with ID: ${socket.id}`);

        // Join the session
        console.log(`${name} joining session: ${sessionKey}`);
        socket.emit("joinSession", sessionKey);
    });

    // Handle session status updates
    socket.on("sessionStatus", (status) => {
        console.log(`${name} session status: ${status.status} - ${status.message}`);

        // If connected and this is device1, send a test message
        if (status.status === "connected" && name === "Device1") {
            setTimeout(() => {
                const testData = {
                    type: "text",
                    content: "Hello from Device1!",
                    timestamp: new Date().toISOString()
                };
                console.log(`${name} sending data:`, testData);
                socket.emit("transferData", testData);
            }, 1000);
        }
    });

    // Handle receiving data
    socket.on("receiveData", (data) => {
        console.log(`${name} received data:`, data);
    });

    // Handle errors
    socket.on("error", (error) => {
        console.error(`${name} error:`, error);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`${name} disconnected`);
    });

    return socket;
}

// Create two test clients with the same session key
const sessionKey = "test-session-" + Date.now();
const device1 = createClient("Device1", sessionKey);
const device2 = createClient("Device2", sessionKey);

// Close connections after 10 seconds
setTimeout(() => {
    console.log("Test complete, closing connections");
    device1.disconnect();
    device2.disconnect();
    process.exit(0);
}, 10000);
