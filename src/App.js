import React, { useState, useMemo } from "react";
import "./App.css";
import azureLanguages from "./data/azure_languages.json";

// Hooks
import { useAudioDevices } from "./hooks/useAudioDevices";
import { useLanguageVoices } from "./hooks/useLanguageVoices";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useAzureTranslation } from "./hooks/useAzureTranslation";

// Components
import { TranslationSettings } from "./components/TranslationSettings";
import { StatusDisplay } from "./components/StatusDisplay";
import { AudioDeviceSelector } from "./components/AudioDeviceSelector";
import { TranslationDisplay } from "./components/TranslationDisplay";
import { AudioPlayer } from "./components/AudioPlayer";
import { ErrorMessage } from "./components/ErrorMessage";

// Utils
import { createLanguageOptions, getLanguageDisplayName } from "./utils/azureLanguageUtils";

function App() {
  // State
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [error, setError] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");

  // Custom Hooks
  const audioDevices = useAudioDevices();
  const { availableVoices, selectedVoice, setSelectedVoice } = useLanguageVoices(targetLanguage);
  const { latestAudioUrl, updateAudio } = useAudioRecording();

  const { listening, startTranslation, stopTranslation } = useAzureTranslation({
    sourceLanguage,
    targetLanguage,
    selectedVoice,
    selectedInputDevice: audioDevices.selectedInputDevice,
    onSourceTextChange: setSourceText,
    onTranslatedTextChange: setTranslatedText,
    onAudioGenerated: updateAudio,
    onError: setError
  });

  // Computed values
  const languageOptions = useMemo(() => createLanguageOptions(azureLanguages), []);
  const sourceLanguageName = getLanguageDisplayName(sourceLanguage, azureLanguages);
  const targetLanguageName = getLanguageDisplayName(targetLanguage, azureLanguages);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Live Speech Translation</h1>
      </header>

      <main className="app-main">
        <TranslationSettings
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          selectedVoice={selectedVoice}
          languageOptions={languageOptions}
          availableVoices={availableVoices}
          onSourceLanguageChange={(e) => setSourceLanguage(e.target.value)}
          onTargetLanguageChange={(e) => setTargetLanguage(e.target.value)}
          onVoiceChange={(e) => setSelectedVoice(e.target.value)}
          disabled={listening}
        />

        <div className="control-grid">
          <StatusDisplay
            isListening={listening}
            sourceLanguageName={sourceLanguageName}
            targetLanguageName={targetLanguageName}
            onStart={startTranslation}
            onStop={stopTranslation}
          />

          <AudioDeviceSelector
            inputDevices={audioDevices.audioInputDevices}
            outputDevices={audioDevices.audioOutputDevices}
            selectedInput={audioDevices.selectedInputDevice}
            selectedOutput={audioDevices.selectedOutputDevice}
            onInputChange={(e) => audioDevices.setSelectedInputDevice(e.target.value)}
            onOutputChange={(e) => audioDevices.setSelectedOutputDevice(e.target.value)}
            disabled={listening}
          />
        </div>

        <TranslationDisplay
          sourceText={sourceText}
          translatedText={translatedText}
          sourceLanguageName={sourceLanguageName}
          targetLanguageName={targetLanguageName}
        />

        <AudioPlayer audioUrl={latestAudioUrl} />
        <ErrorMessage error={error} />
      </main>
    </div>
  );
}

export default App;
