# Voice Chat Translator Server

This is the server component of the Voice Chat Translator application, which enables real-time voice communication between users speaking different languages.

## Features

- **Real-time Communication**: Uses Socket.IO for instant message delivery
- **Speech-to-Text Conversion**: Converts audio messages to text
- **Language Translation**: Translates text between different languages
- **Text-to-Speech Conversion**: Converts translated text back to speech
- **Session Management**: Manages connections between users with unique session keys
- **Audio Format Conversion**: Converts between different audio formats for compatibility

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/daniazhuk/voicechat-translator.git
   cd voicechat-translator/server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   GOOGLE_API_KEY=your-api-key
   DEEPL_API_KEY=your-api-key
   # Needed Google Service API Key with Text-to-Speech and Speech-to-Text services enabled 
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. The server will be running at `http://localhost:3000`

## API Documentation

### Socket.IO Events

#### Client to Server

- **joinSession**: Join a chat session
  ```javascript
  socket.emit('joinSession', {
    sessionKey: 'unique-session-id',
    language: 'en-us' // BCP-47 language codes
  });
  ```

- **voiceTransfer**: Send voice data to another user
  ```javascript
  socket.emit('voiceTransfer', {
    audioBase64: 'base64-encoded-audio-data'
  });
  ```

#### Server to Client

- **sessionStatus**: Updates about session status
  ```javascript
  // Possible status values: 'waiting', 'connected', 'error', 'expired'
  socket.on('sessionStatus', (data) => {
    console.log(data.status, data.message);
  });
  ```

- **voiceReceived**: Receive voice data from another user
  ```javascript
  socket.on('voiceReceived', (data) => {
    // data contains:
    // - audioBase64: Base64 encoded translated audio
    // - text: Original transcribed text
    // - translatedText: Translated text
    // - fromLanguage: Source language code
    // - toLanguage: Target language code
  });
  ```

- **error**: Error notifications
  ```javascript
  socket.on('error', (data) => {
    console.error(data.message);
  });
  ```

## Architecture

The server consists of several key components:

1. **Express Server**: Handles HTTP requests
2. **Socket.IO Server**: Manages WebSocket connections for real-time communication
3. **Session Manager**: Tracks active sessions and connected users
4. **Speech Processing Modules**:
   - `handleSpeechToText.js`: Converts audio to text
   - `handleTranslation.js`: Translates text between languages
   - `handleTextToSpeech.js`: Converts text to audio
   - `m4aBase64ToWavBase64.js`: Converts audio formats

## Session Lifecycle

1. A user connects and joins a session with a unique key
2. If they're the first user, the server creates a new session and waits for another user
3. When a second user joins with the same key, the server connects them
4. Users can then exchange voice messages that are automatically translated
5. When a user disconnects, the other user is notified
6. Sessions expire after 24 hours of inactivity

## Development

To run the server in development mode with automatic restarts:

```bash
  npm run dev
```

