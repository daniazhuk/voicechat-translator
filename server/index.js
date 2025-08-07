// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { handleSpeechToText } from './handleSpeechToText.js';
import { handleTranslation } from './handleTranslation.js';
import { handleTextToSpeech } from './handleTextToSpeech.js';
import { m4aBase64ToWavBase64 } from './m4aBase64ToWavBase64.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
app.use(cors());

// Store for active sessions
const sessions = {};

app.get('/', (req, res) => {
  res.send('Voice Chat Translator Server');
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle session join request
  socket.on('joinSession', ({sessionKey, language}) => {
    console.log(`User ${socket.id} trying to join session: ${sessionKey} with language: ${language}`);
    
    if (!sessions[sessionKey]) {
      sessions[sessionKey] = {
        devices: [{id: socket.id, language}],
        createdAt: new Date()
      };
      socket.join(sessionKey);
      socket.emit('sessionStatus', {status: 'waiting', message: 'Waiting for another device to join'});
    } else if (sessions[sessionKey].devices.length === 1) {
      if (sessions[sessionKey].devices.some(device => device.id === socket.id)) {
        socket.emit('sessionStatus', {status: 'waiting', message: 'You are already in this session'});
        return;
      }
      sessions[sessionKey].devices.push({id: socket.id, language});
      socket.join(sessionKey);
      
      io.to(sessionKey).emit('sessionStatus', {status: 'connected', message: 'Devices connected successfully'});
    } else {
      socket.emit('sessionStatus', {status: 'error', message: 'Session is full'});
    }
  });
  
  socket.on('voiceTransfer', async (data) => {
    const sessionKey = Object.keys(sessions).find(key =>
      sessions[key].devices.some(device => device.id === socket.id)
    );
    
    if (!sessionKey) {
      socket.emit('error', {message: 'Not in any active session'});
      return;
    }
    
    const session = sessions[sessionKey];
    const sender = session.devices.find(dev => dev.id === socket.id);
    const receiver = session.devices.find(dev => dev.id !== socket.id);
    
    if (!receiver) {
      socket.emit('error', {message: 'No receiver in session'});
      return;
    }
    
    const fromLanguage = sender.language;
    const toLanguage = receiver.language;
    
    try {
      const wavBase64 = await m4aBase64ToWavBase64(data.audioBase64);
      const text = await handleSpeechToText(wavBase64, fromLanguage);
      const translatedText = await handleTranslation(text, toLanguage);
      const neededToTTS =  fromLanguage !== toLanguage
      let translatedAudio;
      if (neededToTTS) {
        translatedAudio = await handleTextToSpeech(translatedText, toLanguage);
      }
      const sendData = {
        audioBase64: neededToTTS && translatedAudio ? translatedAudio : wavBase64,
        text,
        translatedText,
        fromLanguage,
        toLanguage
      }
      console.log(sendData)
      io.to(receiver.id).emit('voiceReceived', sendData);
    } catch (err) {
      console.error('Voice transfer error:', err);
      socket.emit('error', {message: err.message || 'Server error'});
    }
  });
  
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find and clean up sessions this socket was part of
    Object.keys(sessions).forEach(key => {
      const session = sessions[key];
      const index = session.devices.findIndex(device => device.id === socket.id);
      
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
          const remainingSocketId = session.devices[0].id;
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
      io.to(key).emit('sessionStatus', {status: 'expired', message: 'Session expired'});
      delete sessions[key];
      console.log(`Removed expired session: ${key}`);
    }
  });
}, 60 * 60 * 1000);

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});
