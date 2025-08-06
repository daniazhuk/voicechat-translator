const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
const cors = require('cors');
app.use(cors());

// Store for active sessions
const sessions = {};

app.get('/', (req, res) => {
    res.send('Voice Chat Translator Server');
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle session join request
    socket.on('joinSession', (sessionKey) => {
        console.log(`User ${socket.id} trying to join session: ${sessionKey}`);

        // If session doesn't exist, create it
        if (!sessions[sessionKey]) {
            sessions[sessionKey] = {
                devices: [socket.id],
                createdAt: new Date()
            };
            socket.join(sessionKey);
            console.log(`Created new session: ${sessionKey}`);
            socket.emit('sessionStatus', { status: 'waiting', message: 'Waiting for another device to join' });
        }
        // If session exists but has only one device
        else if (sessions[sessionKey].devices.length === 1) {
            // Don't add the same device twice
            if (sessions[sessionKey].devices.includes(socket.id)) {
                socket.emit('sessionStatus', { status: 'waiting', message: 'You are already in this session' });
                return;
            }

            // Add second device to session
            sessions[sessionKey].devices.push(socket.id);
            socket.join(sessionKey);
            console.log(`Second device joined session: ${sessionKey}`);

            // Notify both devices that connection is established
            io.to(sessionKey).emit('sessionStatus', { status: 'connected', message: 'Devices connected successfully' });
        }
        // If session already has two devices
        else {
            socket.emit('sessionStatus', { status: 'error', message: 'Session is full' });
        }
    });

    // Handle data transfer between devices
    socket.on('transferData', (data) => {
        // Find which session this socket belongs to
        const sessionKey = Object.keys(sessions).find(key =>
            sessions[key].devices.includes(socket.id)
        );

        if (sessionKey) {
            // Broadcast to all other clients in the same session
            socket.to(sessionKey).emit('receiveData', data);
            console.log(`Data transferred in session ${sessionKey}`);
        } else {
            socket.emit('error', { message: 'Not in any active session' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find and clean up sessions this socket was part of
        Object.keys(sessions).forEach(key => {
            const session = sessions[key];
            const index = session.devices.indexOf(socket.id);

            if (index !== -1) {
                session.devices.splice(index, 1);
                console.log(`Removed device from session ${key}`);

                // If session is empty, remove it
                if (session.devices.length === 0) {
                    delete sessions[key];
                    console.log(`Removed empty session: ${key}`);
                }
                // If one device remains, notify it
                else if (session.devices.length === 1) {
                    const remainingSocketId = session.devices[0];
                    const remainingSocket = io.sockets.sockets.get(remainingSocketId);
                    if (remainingSocket) {
                        remainingSocket.emit('sessionStatus', {
                            status: 'waiting',
                            message: 'Other device disconnected, waiting for reconnection'
                        });
                    }
                }
            }
        });
    });
});

// Clean up old sessions periodically (every hour)
setInterval(() => {
    const now = new Date();
    Object.keys(sessions).forEach(key => {
        const session = sessions[key];
        const sessionAge = now - session.createdAt;

        // Remove sessions older than 24 hours
        if (sessionAge > 24 * 60 * 60 * 1000) {
            io.to(key).emit('sessionStatus', { status: 'expired', message: 'Session expired' });
            delete sessions[key];
            console.log(`Removed expired session: ${key}`);
        }
    });
}, 60 * 60 * 1000);

server.listen(port, () => {
    console.log(`Server running at ${port}`);
});
