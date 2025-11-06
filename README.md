# Live Speech Translation

A real-time speech-to-speech translation application powered by Azure Cognitive Services. Speak in one language and hear the translation in another, with support for multiple languages and neural voices.

![Live Speech Translation](src/assets/translate.png)

## Features

- **Real-time Translation**: Speak in one language and get instant translation in another
- **Multi-language Support**: Support for 30+ languages including English, French, Spanish, German, Japanese, Chinese, and more
- **Neural Voice Synthesis**: High-quality neural voices for natural-sounding translated speech
- **Customizable Countdown**: Set a countdown timer (0-30 seconds) before translation starts
- **Audio Device Selection**: Choose specific microphone input and audio output devices
- **Audio Playback Control**: Download translated audio or replay previous translations
- **Event Logging**: Track all translation events, settings changes, and errors
- **Responsive UI**: Professional, modern interface that works on desktop and mobile

## Prerequisites

Before running this application, you need:

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)
- **Azure Cognitive Services Account**
  - Azure Speech Service subscription
  - Speech API Key and Region

## Azure Setup

1. **Create an Azure Account**
   - Go to [Azure Portal](https://portal.azure.com/)
   - Sign up for a free account (includes free tier for Speech Services)

2. **Create a Speech Service Resource**
   - In Azure Portal, click "Create a resource"
   - Search for "Speech" and select "Speech"
   - Click "Create"
   - Fill in the required details:
     - Subscription: Your Azure subscription
     - Resource group: Create new or use existing
     - Region: Choose a region (e.g., East US, West Europe)
     - Name: Give your resource a unique name
     - Pricing tier: F0 (free) or S0 (standard)
   - Click "Review + Create" then "Create"

3. **Get Your API Key and Region**
   - Once deployment is complete, go to your Speech resource
   - Click on "Keys and Endpoint" in the left menu
   - Copy one of the keys (KEY 1 or KEY 2)
   - Note the region (e.g., "eastus", "westeurope")

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd speech-translate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   - Create a `.env` file in the root directory
   - Add your Azure credentials:
   ```env
   REACT_APP_SPEECH_KEY=your_azure_speech_key_here
   REACT_APP_SERVICE_REGION=your_azure_region_here
   ```

   Example:
   ```env
   REACT_APP_SPEECH_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   REACT_APP_SERVICE_REGION=eastus
   ```

   **Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

4. **Verify Installation**
   ```bash
   npm start
   ```

   The app should open at [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Translation Flow

1. **Select Languages**
   - Choose your source language (language you'll speak)
   - Choose your target language (language for translation)
   - Select a neural voice for the translated speech

2. **Configure Audio Devices** (Optional)
   - Select your preferred microphone input
   - Select your preferred audio output device

3. **Set Countdown Duration** (Optional)
   - Adjust the countdown timer (default: 3 seconds)
   - Set to 0 for immediate translation start

4. **Start Translation**
   - Click "Start Translation"
   - Wait for countdown (if set)
   - Speak clearly in your source language
   - Hear the translation in real-time

5. **Stop Translation**
   - Click "Stop Translation" when done
   - Any ongoing audio playback will stop immediately

### Features

#### Translation Display
- **Source Text**: Shows what you said in the original language
- **Translated Text**: Shows the translation in the target language

#### Audio Player
- **Playback**: Listen to the latest translated audio
- **Download**: Save the translation as an MP3 file

#### Event Logs
- Expandable/collapsible log panel
- Color-coded log entries:
  - **Blue**: Status changes (listening started/stopped)
  - **Green**: Detected speech
  - **Purple**: Translations
  - **Gray**: Settings changes
  - **Red**: Errors
- Clear logs button
- Automatically limited to 100 most recent entries

## Project Structure

```
speech-translate/
├── public/
│   ├── index.html              # HTML template
│   └── translate.png           # Favicon
├── src/
│   ├── assets/                 # Static assets
│   │   ├── logo-protiviti.png
│   │   └── translate.png
│   ├── components/             # React components
│   │   ├── AudioDeviceSelector.jsx
│   │   ├── AudioPlayer.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── LogsDisplay.jsx
│   │   ├── StatusDisplay.jsx
│   │   ├── TextDisplay.jsx
│   │   ├── TranslationDisplay.jsx
│   │   └── TranslationSettings.jsx
│   ├── data/                   # Static data
│   │   ├── azure_languages.json
│   │   └── azure_voices.json
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudioDevices.js
│   │   ├── useAudioRecording.js
│   │   ├── useAzureTranslation.js
│   │   ├── useEventLogger.js
│   │   └── useLanguageVoices.js
│   ├── utils/                  # Utility functions
│   │   ├── audioUtils.js
│   │   ├── azureLanguageUtils.js
│   │   └── validation.js
│   ├── App.js                  # Main application component
│   ├── App.css                 # Application styles
│   └── index.js                # Entry point
├── .env                        # Environment variables (create this)
├── .gitignore
├── package.json
└── README.md
```

## Architecture

### Custom Hooks

- **useAzureTranslation**: Manages Azure Speech SDK integration for translation and synthesis
- **useAudioDevices**: Handles audio input/output device enumeration and selection
- **useLanguageVoices**: Manages voice selection for target language
- **useAudioRecording**: Manages audio URL lifecycle and cleanup
- **useEventLogger**: Tracks application events with timestamps and categorization

### Components

- **StatusDisplay**: Shows translation status and countdown timer
- **TranslationSettings**: Language and voice selection
- **AudioDeviceSelector**: Microphone and speaker selection
- **TranslationDisplay**: Shows source and translated text
- **AudioPlayer**: Audio playback and download
- **LogsDisplay**: Collapsible event log viewer
- **ErrorMessage**: Error display

### Utilities

- **azureLanguageUtils**: Language mapping and voice management
- **audioUtils**: Audio device enumeration and blob creation
- **validation**: Configuration and setup validation

## Troubleshooting

### Microphone Not Working
- Grant microphone permissions in your browser
- Check that the correct microphone is selected
- Verify your microphone works in other applications

### Translation Not Starting
- Check that your Azure credentials are correct in `.env`
- Verify you have an active internet connection
- Check browser console for error messages
- Ensure you've selected a valid voice for the target language

### Audio Not Playing
- Check that the correct audio output device is selected
- Verify system volume is not muted
- Try a different browser (Chrome recommended)

### "Invalid API Key" Error
- Verify your `REACT_APP_SPEECH_KEY` is correct
- Check that you copied the key without extra spaces
- Ensure your Azure Speech resource is active
- Verify the region matches your resource (e.g., "eastus")

### Build Errors
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Clear browser cache
- Try `npm start` again

## Browser Support

- **Chrome** (recommended): Full support
- **Edge**: Full support
- **Firefox**: Full support
- **Safari**: Supported (may require additional permissions)

## Technologies Used

- **React 18**: Frontend framework
- **Azure Cognitive Services**: Speech-to-text, translation, and text-to-speech
- **Web Audio API**: Audio device management
- **LocalStorage**: Settings persistence

## Performance Notes

- Maximum 100 log entries kept in memory
- Audio URLs automatically cleaned up to prevent memory leaks
- Countdown duration and expanded state persisted to localStorage
- Audio device preferences saved locally

## Security

- Never commit `.env` file with credentials
- API keys are stored as environment variables
- No sensitive data is logged or stored
- All API calls go directly to Azure (no intermediate server)

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: This is a one-way operation!** Ejects from Create React App configuration

## License

This project is for demonstration purposes.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Azure Speech Services documentation: [Azure Speech Docs](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
- Check browser console for error messages

## Acknowledgments

- Built with [Create React App](https://create-react-app.dev/)
- Powered by [Azure Cognitive Services](https://azure.microsoft.com/services/cognitive-services/)
- UI design inspired by modern design principles
