# Voice Chat Translator

A cross-platform solution for real-time multilingual voice chat with automatic speech recognition, translation, and speech synthesis.

This repository contains two projects:

- [`VoiceChatTranslator/`](./VoiceChatTranslator) — **Mobile App** (React Native + Expo)
- [`server/`](./server) — **Server** (Node.js + Express + Socket.IO)

---

## Table of Contents

- [Voice Chat Translator Mobile App](#voice-chat-translator-mobile-app)
- [Voice Chat Translator Server](#voice-chat-translator-server)
- [Development and Contributing](#development-and-contributing)

---

## Voice Chat Translator Mobile App

A React Native mobile application that enables real-time voice communication between users speaking different languages. The app automatically translates voice messages between users with different language preferences.

### Features

- **Real-time Voice Translation**: Communicate with people who speak different languages
- **Text Display**: View the original text and translation of voice messages
- **Multiple Languages**: Support for various languages
- **Session Management**: Connect with others using unique session keys
- **User-friendly Interface**: Simple and intuitive design

### How to Use the App

1. **Select Your Language**:
    - Tap the language selector at the top of the main screen
    - Choose your preferred language from the list

2. **Create or Join a Chat Session**:
    - Enter a unique session key in the input field
    - Tap "Add Chat" to create or join a session
    - Share the same session key with the person you want to chat with

3. **Start a Voice Chat**:
    - Select a chat session from your list
    - Wait for the other person to join (if they haven't already)
    - Once connected, you'll see "Devices connected successfully"

4. **Send Voice Messages**:
    - Press and hold the microphone button to record
    - Release to send the message
    - Your message will be automatically translated to the recipient's language

5. **Listen to Messages**:
    - Tap the play button on received messages to hear them
    - View the original text and translation by tapping the text toggle button

### Development

This project is built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/audio-av/)

### Troubleshooting

- **Connection Issues**: Make sure the server is running and the server URL is correctly configured
- **Audio Recording Problems**: Check that your device has microphone permissions enabled
- **Language Not Available**: The app supports languages provided by the translation service

## Voice Chat Translator Server

This is the server component of the Voice Chat Translator application, which enables real-time voice communication between users speaking different languages.

### Features

- **Real-time Communication**: Uses Socket.IO for instant message delivery
- **Speech-to-Text Conversion**: Converts audio messages to text
- **Language Translation**: Translates text between different languages
- **Text-to-Speech Conversion**: Converts translated text back to speech
- **Session Management**: Manages connections between users with unique session keys
- **Audio Format Conversion**: Converts between different audio formats for compatibility

### API Documentation

#### Socket.IO Events

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

### Session Lifecycle

1. A user connects and joins a session with a unique key
2. If they're the first user, the server creates a new session and waits for another user
3. When a second user joins with the same key, the server connects them
4. Users can then exchange voice messages that are automatically translated
5. When a user disconnects, the other user is notified
6. Sessions expire after 24 hours of inactivity


### Development and Contributing
Fork and clone the repository

See each project's README for local development

Pull requests and issues are welcome!
