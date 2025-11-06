import React, { useState, useEffect } from "react";

export const LogsDisplay = ({ logs, onClear }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem('logsExpanded');
    return saved === 'true';
  });

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('logsExpanded', isExpanded.toString());
  }, [isExpanded]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTimestamp = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getLogTypeLabel = (type) => {
    const labels = {
      status: 'STATUS',
      speech: 'SPEECH',
      translation: 'TRANSLATION',
      settings: 'SETTINGS',
      error: 'ERROR'
    };
    return labels[type] || type.toUpperCase();
  };

  return (
    <div className="logs-section">
      <div className="logs-header" onClick={toggleExpanded}>
        <h3 className="logs-title">
          Event Logs ({logs.length})
        </h3>
        <div className="logs-controls">
          {logs.length > 0 && (
            <button
              className="clear-logs-btn"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              title="Clear all logs"
            >
              Clear
            </button>
          )}
          <span className={`logs-chevron ${isExpanded ? 'logs-chevron--expanded' : ''}`}>
            ▼
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="logs-container">
          {logs.length === 0 ? (
            <div className="logs-empty">No events logged yet</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`log-entry log-entry--${log.type}`}>
                <div className="log-header-row">
                  <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
                  <span className="log-type">{getLogTypeLabel(log.type)}</span>
                </div>
                <div className="log-message">{log.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
