import React from "react";
import { LanguageSelector } from "./LanguageSelector";
import { VoiceSelector } from "./VoiceSelector";

export const TranslationSettings = ({
  sourceLanguage,
  targetLanguage,
  selectedVoice,
  languageOptions,
  availableVoices,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onVoiceChange,
  disabled
}) => (
  <div className="config-card">
    <h2 className="section-title">Translation Settings</h2>
    <div className="config-grid">
      <LanguageSelector
        id="source-language"
        label="Source Language"
        value={sourceLanguage}
        onChange={onSourceLanguageChange}
        options={languageOptions}
        disabled={disabled}
      />
      <LanguageSelector
        id="target-language"
        label="Target Language"
        value={targetLanguage}
        onChange={onTargetLanguageChange}
        options={languageOptions}
        disabled={disabled}
      />
      <VoiceSelector
        value={selectedVoice}
        onChange={onVoiceChange}
        voices={availableVoices}
        disabled={disabled || availableVoices.length === 0}
      />
    </div>
  </div>
);
