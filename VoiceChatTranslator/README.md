# Voice Chat Translator Mobile App

A React Native mobile application that enables real-time voice communication between users speaking different languages. The app automatically translates voice messages between users with different language preferences.

## Features

- **Real-time Voice Translation**: Communicate with people who speak different languages
- **Text Display**: View the original text and translation of voice messages
- **Multiple Languages**: Support for various languages
- **Session Management**: Connect with others using unique session keys
- **User-friendly Interface**: Simple and intuitive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (optional for development)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/daniazhuk/voicechat-translator.git
   cd voicechat-translator/VoiceChatTranslator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the server URL:
   - Create a `.env` file in the project root with:
   ```
   EXPO_PUBLIC_SERVER_URL=your-server-url
   ```
   - For local development, you can use `10.0.2.2:3000` for Android emulator or `localhost:3000` for iOS

## Usage

1. Start the app:
   ```bash
   npx expo start
   ```

2. In the Expo developer tools, choose to run the app on:
   - iOS Simulator
   - Android Emulator
   - Physical device using Expo Go app (scan the QR code)

## How to Use the App

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

## Development

This project is built with:
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/audio-av/)

## Troubleshooting

- **Connection Issues**: Make sure the server is running and the server URL is correctly configured
- **Audio Recording Problems**: Check that your device has microphone permissions enabled
- **Language Not Available**: The app supports languages provided by the translation service

