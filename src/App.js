import React, { useState, useMemo, useEffect, useRef } from "react";
import "./App.css";
import azureLanguages from "./data/azure_languages.json";
import logo from "./assets/logo-protiviti.png";

// Hooks
import { useAudioDevices } from "./hooks/useAudioDevices";
import { useLanguageVoices } from "./hooks/useLanguageVoices";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useAzureTranslation } from "./hooks/useAzureTranslation";
import { useEventLogger } from "./hooks/useEventLogger";

// Components
import { TranslationSettings } from "./components/TranslationSettings";
import { StatusDisplay } from "./components/StatusDisplay";
import { AudioDeviceSelector } from "./components/AudioDeviceSelector";
import { TranslationDisplay } from "./components/TranslationDisplay";
import { AudioPlayer } from "./components/AudioPlayer";
import { ErrorMessage } from "./components/ErrorMessage";
import { LogsDisplay } from "./components/LogsDisplay";

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
  const { logs, addLog, clearLogs } = useEventLogger();

  // Refs to track previous values
  const prevSourceLanguageRef = useRef(sourceLanguage);
  const prevTargetLanguageRef = useRef(targetLanguage);
  const prevSelectedVoiceRef = useRef(selectedVoice);
  const prevInputDeviceRef = useRef(audioDevices.selectedInputDevice);
  const prevOutputDeviceRef = useRef(audioDevices.selectedOutputDevice);
  const prevSourceTextRef = useRef("");
  const prevTranslatedTextRef = useRef("");

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

  // Log listening state changes
  useEffect(() => {
    if (listening) {
      addLog('status', 'Listening started');
    } else {
      if (prevSourceTextRef.current !== "" || prevTranslatedTextRef.current !== "") {
        addLog('status', 'Translation stopped');
      }
    }
  }, [listening, addLog]);

  // Log source text changes (final results only)
  useEffect(() => {
    if (sourceText && sourceText !== prevSourceTextRef.current && listening) {
      addLog('speech', `Detected Speech (${sourceLanguageName}): ${sourceText}`, {
        language: sourceLanguageName,
        text: sourceText
      });
      prevSourceTextRef.current = sourceText;
    }
  }, [sourceText, sourceLanguageName, listening, addLog]);

  // Log translated text changes
  useEffect(() => {
    if (translatedText && translatedText !== prevTranslatedTextRef.current && listening) {
      addLog('translation', `Translated (${targetLanguageName}): ${translatedText}`, {
        language: targetLanguageName,
        text: translatedText
      });
      prevTranslatedTextRef.current = translatedText;
    }
  }, [translatedText, targetLanguageName, listening, addLog]);

  // Log errors
  useEffect(() => {
    if (error) {
      addLog('error', `Error: ${error}`);
    }
  }, [error, addLog]);

  // Log source language changes
  useEffect(() => {
    if (prevSourceLanguageRef.current !== sourceLanguage) {
      const prevName = getLanguageDisplayName(prevSourceLanguageRef.current, azureLanguages);
      addLog('settings', `Source language changed: ${prevName} → ${sourceLanguageName}`);
      prevSourceLanguageRef.current = sourceLanguage;
    }
  }, [sourceLanguage, sourceLanguageName, addLog]);

  // Log target language changes
  useEffect(() => {
    if (prevTargetLanguageRef.current !== targetLanguage) {
      const prevName = getLanguageDisplayName(prevTargetLanguageRef.current, azureLanguages);
      addLog('settings', `Target language changed: ${prevName} → ${targetLanguageName}`);
      prevTargetLanguageRef.current = targetLanguage;
    }
  }, [targetLanguage, targetLanguageName, addLog]);

  // Log voice changes
  useEffect(() => {
    if (prevSelectedVoiceRef.current && prevSelectedVoiceRef.current !== selectedVoice) {
      addLog('settings', `Voice changed: ${prevSelectedVoiceRef.current} → ${selectedVoice}`);
    }
    prevSelectedVoiceRef.current = selectedVoice;
  }, [selectedVoice, addLog]);

  // Log input device changes
  useEffect(() => {
    if (prevInputDeviceRef.current && prevInputDeviceRef.current !== audioDevices.selectedInputDevice) {
      const device = audioDevices.audioInputDevices.find(d => d.deviceId === audioDevices.selectedInputDevice);
      addLog('settings', `Microphone changed: ${device?.label || audioDevices.selectedInputDevice}`);
    }
    prevInputDeviceRef.current = audioDevices.selectedInputDevice;
  }, [audioDevices.selectedInputDevice, audioDevices.audioInputDevices, addLog]);

  // Log output device changes
  useEffect(() => {
    if (prevOutputDeviceRef.current && prevOutputDeviceRef.current !== audioDevices.selectedOutputDevice) {
      const device = audioDevices.audioOutputDevices.find(d => d.deviceId === audioDevices.selectedOutputDevice);
      addLog('settings', `Audio output changed: ${device?.label || audioDevices.selectedOutputDevice}`);
    }
    prevOutputDeviceRef.current = audioDevices.selectedOutputDevice;
  }, [audioDevices.selectedOutputDevice, audioDevices.audioOutputDevices, addLog]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Live Speech Translation</h1>
        <img src={logo} alt="Protiviti Logo" className="app-logo" />
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
        <LogsDisplay logs={logs} onClear={clearLogs} />
        <ErrorMessage error={error} />
      </main>
    </div>
  );
}

export default App;
