import { useState, useRef, useEffect } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import { validateAzureConfig, validateTranslationSetup } from "../utils/validation";
import { getSourceLocale } from "../utils/azureLanguageUtils";
import { createAudioBlob } from "../utils/audioUtils";

/**
 * Custom hook to manage Azure Speech SDK integration
 * Handles translation, recognition, and synthesis
 */
export const useAzureTranslation = ({
  sourceLanguage,
  targetLanguage,
  selectedVoice,
  selectedInputDevice,
  onSourceTextChange,
  onTranslatedTextChange,
  onAudioGenerated,
  onError
}) => {
  const [listening, setListening] = useState(false);
  const translatorRef = useRef(null);
  const synthesizerRef = useRef(null);
  const audioElementRef = useRef(null);

  const startTranslation = () => {
    try {
      // Validate configuration
      const { speechKey, serviceRegion } = validateAzureConfig();
      validateTranslationSetup(selectedVoice);

      if (listening) {
        return;
      }

      // Clear previous state
      onError("");
      onSourceTextChange("");
      onTranslatedTextChange("");

      // Create translation config
      const translationConfig = SpeechSDK.SpeechTranslationConfig.fromSubscription(
        speechKey,
        serviceRegion
      );

      // Set source language for speech recognition
      const sourceLocale = getSourceLocale(sourceLanguage);
      translationConfig.speechRecognitionLanguage = sourceLocale;

      // Set target language for translation
      translationConfig.addTargetLanguage(targetLanguage.split('-')[0]);

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

      // Create synthesizer with null audio config to prevent auto-playback
      // This allows us to control playback through our own audio element
      const synthesizer = new SpeechSDK.SpeechSynthesizer(translationConfig, null);
      synthesizerRef.current = synthesizer;

      setListening(true);

      translator.startContinuousRecognitionAsync(
        () => {},
        (err) => {
          console.error(err);
          onError("Unable to start translation. Check mic permissions.");
          stopTranslation();
        }
      );

      // Recognizing event - interim results
      translator.recognizing = (s, e) => {
        onSourceTextChange(e.result.text || "");
      };

      // Recognized event - final results
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
        onTranslatedTextChange(translated);

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
              const blob = createAudioBlob(audioBuffer);
              onAudioGenerated(blob);

              // Create and play audio through a controlled audio element
              if (!audioElementRef.current) {
                audioElementRef.current = new Audio();
              }
              const audioUrl = URL.createObjectURL(blob);
              audioElementRef.current.src = audioUrl;
              audioElementRef.current.play().catch(err => {
                console.error('Audio playback error:', err);
              });
            } else if (
              result.reason === SpeechSDK.ResultReason.Canceled &&
              result.errorDetails
            ) {
              console.error(result.errorDetails);
              onError("Text synthesized but playback was canceled.");
            }
          },
          (err) => {
            console.error(err);
            onError("Unable to synthesize the translated audio.");
          }
        );
      };

      translator.canceled = (s, e) => {
        console.error(e);
        onError(e.errorDetails || "Translation canceled.");
        stopTranslation();
      };

      translator.sessionStopped = () => {
        stopTranslation();
      };
    } catch (err) {
      onError(err.message);
    }
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

    // Stop and cleanup audio playback
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.src = '';
    }

    setListening(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranslation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    listening,
    startTranslation,
    stopTranslation
  };
};
