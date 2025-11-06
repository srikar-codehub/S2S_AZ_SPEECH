import React, { useState, useEffect, useRef } from "react";

export const StatusDisplay = ({
  isListening,
  sourceLanguageName,
  targetLanguageName,
  onStart,
  onStop,
  onCountdownChange
}) => {
  const [countdownDuration, setCountdownDuration] = useState(() => {
    const saved = localStorage.getItem('countdownDuration');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [countdownValue, setCountdownValue] = useState(null);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const intervalRef = useRef(null);
  const prevCountdownDurationRef = useRef(countdownDuration);

  // Save countdown duration to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem('countdownDuration', countdownDuration.toString());
    if (prevCountdownDurationRef.current !== countdownDuration && onCountdownChange) {
      onCountdownChange(prevCountdownDurationRef.current, countdownDuration);
    }
    prevCountdownDurationRef.current = countdownDuration;
  }, [countdownDuration, onCountdownChange]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleStartClick = () => {
    if (countdownDuration <= 0) {
      // If duration is 0 or negative, start immediately
      onStart();
      return;
    }

    // Start countdown
    setIsCountingDown(true);
    setCountdownValue(countdownDuration);

    let currentCount = countdownDuration;

    intervalRef.current = setInterval(() => {
      currentCount -= 1;

      if (currentCount <= 0) {
        // Countdown complete - clear interval first, then start
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsCountingDown(false);
        setCountdownValue(null);
        onStart();
      } else {
        // Update display
        setCountdownValue(currentCount);
      }
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsCountingDown(false);
    setCountdownValue(null);
  };

  const handleDurationChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 30) {
      setCountdownDuration(value);
    }
  };

  return (
    <div className="status-card">
      {isCountingDown ? (
        // Countdown Display
        <>
          <div className="status-header">
            <div className="status-dot status-dot--countdown" />
            <h2 className="status-title">Starting...</h2>
          </div>
          <div className="countdown-display">
            <div className="countdown-number">{countdownValue}</div>
            <p className="countdown-message">Get ready to speak</p>
          </div>
          <button
            className="status-button status-button--cancel"
            onClick={handleCancelCountdown}
          >
            Cancel
          </button>
        </>
      ) : (
        // Normal Display (Idle or Listening)
        <>
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

          {!isListening && (
            <div className="form-field">
              <label className="form-label">Countdown Duration (seconds)</label>
              <div className="countdown-duration-controls">
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={countdownDuration}
                  onChange={handleDurationChange}
                  className="countdown-duration-input"
                />
                <div className="countdown-duration-presets">
                  <button
                    className={`countdown-preset-btn ${countdownDuration === 3 ? 'countdown-preset-btn--active' : ''}`}
                    onClick={() => setCountdownDuration(3)}
                  >
                    3s
                  </button>
                  <button
                    className={`countdown-preset-btn ${countdownDuration === 5 ? 'countdown-preset-btn--active' : ''}`}
                    onClick={() => setCountdownDuration(5)}
                  >
                    5s
                  </button>
                  <button
                    className={`countdown-preset-btn ${countdownDuration === 10 ? 'countdown-preset-btn--active' : ''}`}
                    onClick={() => setCountdownDuration(10)}
                  >
                    10s
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isListening ? (
            <button className="status-button" onClick={handleStartClick}>
              Start Translation
            </button>
          ) : (
            <button className="status-button status-button--stop" onClick={onStop}>
              Stop Translation
            </button>
          )}
        </>
      )}
    </div>
  );
};
