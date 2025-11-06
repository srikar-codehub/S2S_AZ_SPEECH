import React from "react";

export const VoiceSelector = ({
  value,
  onChange,
  voices,
  disabled
}) => (
  <div className="form-field">
    <label className="form-label" htmlFor="voice-select">
      Neural Voice
    </label>
    <select
      id="voice-select"
      className="form-select"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {voices.length === 0 ? (
        <option value="">No voices available</option>
      ) : (
        voices.map(voice => (
          <option key={voice.short_name} value={voice.short_name}>
            {voice.name} - {voice.gender}
          </option>
        ))
      )}
    </select>
  </div>
);
