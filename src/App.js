import React, { useEffect, useRef, useState, useMemo } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import "./App.css";
import azureLanguages from "./data/azure_languages.json";
import azureVoices from "./data/azure_voices.json";

function App() {
  const [listening, setListening] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [latestAudioUrl, setLatestAudioUrl] = useState(null);
  const [error, setError] = useState("");

  // Language and voice selection states
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [selectedVoice, setSelectedVoice] = useState("");

  // Audio device states
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState("");
  const [selectedOutputDevice, setSelectedOutputDevice] = useState("");

  const translatorRef = useRef(null);
  const synthesizerRef = useRef(null);

  // Helper function to get voice locale codes for a language
  const getVoiceLocalesForLanguage = (languageCode) => {
    const matchingLocales = [];
    const baseLanguage = languageCode.split('-')[0];

    for (const locale in azureVoices) {
      if (locale.startsWith(baseLanguage + '-')) {
        matchingLocales.push(locale);
      }
    }

    // Special handling for Chinese variants
    if (languageCode === 'zh-Hans') {
      return matchingLocales.filter(l => l === 'zh-CN' || l.startsWith('zh-CN-'));
    }

    if (languageCode === 'zh-Hant') {
      return matchingLocales.filter(l => l === 'zh-TW' || l === 'zh-HK');
    }

    // For exact locale matches
    if (languageCode.includes('-') && matchingLocales.includes(languageCode)) {
      return [languageCode];
    }

    return matchingLocales;
  };

  // Get available voices for the selected target language
  const availableVoices = useMemo(() => {
    const locales = getVoiceLocalesForLanguage(targetLanguage);
    const voices = locales.flatMap(locale =>
      (azureVoices[locale] || []).map(voice => ({
        ...voice,
        locale: locale
      }))
    );

    // Sort: Female voices first, then alphabetically by name
    return voices.sort((a, b) => {
      if (a.gender !== b.gender) {
        return a.gender === 'Female' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [targetLanguage]);

  // Get the locale code for source language (for speech recognition)
  const getSourceLocale = (langCode) => {
    const locales = getVoiceLocalesForLanguage(langCode);
    // Default to first available locale or construct a common one
    if (locales.length > 0) {
      // Prefer US for English, FR for French, etc.
      const preferredLocale = locales.find(l =>
        l === `${langCode}-US` ||
        l === `${langCode.toUpperCase()}-${langCode.toUpperCase()}`||
        l.startsWith(langCode.split('-')[0] + '-')
      );
      return preferredLocale || locales[0];
    }
    // Fallback: try to construct a locale
    return `${langCode}-${langCode.toUpperCase()}`;
  };

  // Enumerate audio devices
  useEffect(() => {
    const enumerateDevices = async () => {
      try {
        // Request microphone permission first
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();

        const inputDevices = devices.filter(device => device.kind === 'audioinput');
        const outputDevices = devices.filter(device => device.kind === 'audiooutput');

        setAudioInputDevices(inputDevices);
        setAudioOutputDevices(outputDevices);

        // Set default devices
        if (inputDevices.length > 0 && !selectedInputDevice) {
          setSelectedInputDevice(inputDevices[0].deviceId);
        }
        if (outputDevices.length > 0 && !selectedOutputDevice) {
          setSelectedOutputDevice(outputDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error enumerating devices:", err);
      }
    };

    enumerateDevices();
  }, [selectedInputDevice, selectedOutputDevice]);

  // Set default voice when target language changes
  useEffect(() => {
    if (availableVoices.length > 0) {
      // Default to first female voice or first voice available
      const defaultVoice = availableVoices.find(v => v.gender === 'Female') || availableVoices[0];
      setSelectedVoice(defaultVoice.short_name);
    } else {
      setSelectedVoice("");
    }
  }, [availableVoices]);

  // Prepare language options for dropdowns
  const languageOptions = useMemo(() => {
    return Object.entries(azureLanguages)
      .map(([code, data]) => ({
        value: code,
        label: data.name === data.nativeName
          ? data.name
          : `${data.name} (${data.nativeName})`
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const startTranslation = () => {
    const speechKey = process.env.REACT_APP_SPEECH_KEY;
    const serviceRegion = process.env.REACT_APP_SPEECH_REGION;

    if (!speechKey || !serviceRegion) {
      setError("Missing Azure Speech key or region in .env");
      return;
    }

    if (listening) {
      return;
    }

    if (!selectedVoice) {
      setError("Please select a voice for the target language");
      return;
    }

    setError("");
    setSourceText("");
    setTranslatedText("");

    const translationConfig =
      SpeechSDK.SpeechTranslationConfig.fromSubscription(
        speechKey,
        serviceRegion
      );

    // Set source language for speech recognition
    const sourceLocale = getSourceLocale(sourceLanguage);
    translationConfig.speechRecognitionLanguage = sourceLocale;

    // Set target language for translation
    translationConfig.addTargetLanguage(targetLanguage.split('-')[0]); // Use base language code

    // Set voice for synthesis
    translationConfig.voiceName = selectedVoice;
    translationConfig.speechSynthesisOutputFormat =
      SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    // Use selected audio input device or default
    const audioConfig = selectedInputDevice
      ? SpeechSDK.AudioConfig.fromMicrophoneInput(selectedInputDevice)
      : SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const translator = new SpeechSDK.TranslationRecognizer(
      translationConfig,
      audioConfig
    );
    translatorRef.current = translator;

    const synthesizer = new SpeechSDK.SpeechSynthesizer(translationConfig);
    synthesizerRef.current = synthesizer;

    setListening(true);
    translator.startContinuousRecognitionAsync(
      () => {},
      (err) => {
        console.error(err);
        setError("Unable to start translation. Check mic permissions.");
        stopTranslation();
      }
    );

    translator.recognizing = (s, e) => {
      setSourceText(e.result.text || "");
    };

    translator.recognized = (s, e) => {
      if (
        e.result.reason !== SpeechSDK.ResultReason.TranslatedSpeech ||
        !e.result.translations
      ) {
        return;
      }

      const targetLangCode = targetLanguage.split('-')[0];
      const translated = e.result.translations.get(targetLangCode);
      if (!translated) {
        return;
      }
      setTranslatedText(translated);

      const activeSynthesizer = synthesizerRef.current;
      if (!activeSynthesizer) {
        return;
      }
      activeSynthesizer.speakTextAsync(
        translated,
        (result) => {
          if (
            result.reason ===
            SpeechSDK.ResultReason.SynthesizingAudioCompleted
          ) {
            const audioBuffer = result.audioData;
            const blob = new Blob([audioBuffer], { type: "audio/mp3" });
            const url = window.URL.createObjectURL(blob);
            setLatestAudioUrl((previousUrl) => {
              if (previousUrl) {
                window.URL.revokeObjectURL(previousUrl);
              }
              return url;
            });
          } else if (
            result.reason === SpeechSDK.ResultReason.Canceled &&
            result.errorDetails
          ) {
            console.error(result.errorDetails);
            setError("Text synthesized but playback was canceled.");
          }
        },
        (err) => {
          console.error(err);
          setError("Unable to synthesize the translated audio.");
        }
      );
    };

    translator.canceled = (s, e) => {
      console.error(e);
      setError(e.errorDetails || "Translation canceled.");
      stopTranslation();
    };

    translator.sessionStopped = () => {
      stopTranslation();
    };
  };

  const stopTranslation = () => {
    const translator = translatorRef.current;
    if (translator) {
      translator.stopContinuousRecognitionAsync(
        () => translator.close(),
        () => translator.close()
      );
      translatorRef.current = null;
    }
    const synthesizer = synthesizerRef.current;
    if (synthesizer) {
      synthesizer.close();
      synthesizerRef.current = null;
    }
    setListening(false);
  };

  useEffect(() => {
    return () => {
      stopTranslation();
      setLatestAudioUrl((currentUrl) => {
        if (currentUrl) {
          window.URL.revokeObjectURL(currentUrl);
        }
        return null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get source and target language display names
  const sourceLanguageName = azureLanguages[sourceLanguage]?.name || sourceLanguage;
  const targetLanguageName = azureLanguages[targetLanguage]?.name || targetLanguage;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1 className="app-title">Live Speech Translation</h1>
      </header>

      <main className="app-main">
        {/* Configuration Card */}
        <div className="config-card">
          <h2 className="section-title">Translation Settings</h2>
          <div className="config-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="source-language">
                Source Language
              </label>
              <select
                id="source-language"
                className="form-select"
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                disabled={listening}
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="target-language">
                Target Language
              </label>
              <select
                id="target-language"
                className="form-select"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                disabled={listening}
              >
                {languageOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="voice-select">
                Neural Voice
              </label>
              <select
                id="voice-select"
                className="form-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                disabled={listening || availableVoices.length === 0}
              >
                {availableVoices.length === 0 ? (
                  <option value="">No voices available</option>
                ) : (
                  availableVoices.map(voice => (
                    <option key={voice.short_name} value={voice.short_name}>
                      {voice.name} - {voice.gender}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Status and Audio Device Controls */}
        <div className="control-grid">
          <div className="status-card">
            <div className="status-header">
              <div className={`status-dot ${listening ? 'status-dot--listening' : 'status-dot--idle'}`} />
              <h2 className="status-title">
                {listening ? 'Listening' : 'Ready'}
              </h2>
            </div>
            <p className="status-message">
              {listening
                ? `Listening in ${sourceLanguageName} and translating to ${targetLanguageName}...`
                : 'Click Start to begin translation'}
            </p>
            {!listening ? (
              <button className="status-button" onClick={startTranslation}>
                Start Translation
              </button>
            ) : (
              <button className="status-button status-button--stop" onClick={stopTranslation}>
                Stop Translation
              </button>
            )}
          </div>

          <div className="status-card">
            <h3 className="status-title">Audio Devices</h3>

            <div className="form-field">
              <label className="form-label">Microphone Input</label>
              <select
                className="form-select"
                value={selectedInputDevice}
                onChange={(e) => setSelectedInputDevice(e.target.value)}
                disabled={listening}
              >
                {audioInputDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Audio Output</label>
              <select
                className="form-select"
                value={selectedOutputDevice}
                onChange={(e) => setSelectedOutputDevice(e.target.value)}
                disabled={listening}
              >
                {audioOutputDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Text Display Cards */}
        <div className="control-grid">
          <div className="text-display-card">
            <h3 className="text-display-title">
              Detected Speech ({sourceLanguageName})
            </h3>
            <div className="text-display-content">
              {sourceText || "Speak to see detected speech..."}
            </div>
          </div>

          <div className="text-display-card">
            <h3 className="text-display-title">
              Translated ({targetLanguageName})
            </h3>
            <div className="text-display-content text-display-content--translated">
              {translatedText || "Translation will appear here..."}
            </div>
          </div>
        </div>

        {/* Audio Section */}
        {latestAudioUrl && (
          <div className="audio-section">
            <h3 className="audio-title">Latest Translation Audio</h3>
            <div className="audio-controls">
              <audio className="audio-player" controls src={latestAudioUrl} />
              <a
                href={latestAudioUrl}
                download="translation.mp3"
                className="download-link"
              >
                Download MP3
              </a>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
