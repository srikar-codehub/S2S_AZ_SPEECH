import React from "react";

export const StatusDisplay = ({
  isListening,
  sourceLanguageName,
  targetLanguageName,
  onStart,
  onStop
}) => (
  <div className="status-card">
    <div className="status-header">
      <div className={`status-dot ${isListening ? 'status-dot--listening' : 'status-dot--idle'}`} />
      <h2 className="status-title">
        {isListening ? 'Listening' : 'Ready'}
      </h2>
    </div>
    <p className="status-message">
      {isListening
        ? `Listening in ${sourceLanguageName} and translating to ${targetLanguageName}...`
        : 'Click Start to begin translation'}
    </p>
    {!isListening ? (
      <button className="status-button" onClick={onStart}>
        Start Translation
      </button>
    ) : (
      <button className="status-button status-button--stop" onClick={onStop}>
        Stop Translation
      </button>
    )}
  </div>
);
