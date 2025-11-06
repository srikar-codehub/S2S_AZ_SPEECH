import { useState, useCallback } from "react";

/**
 * Custom hook to manage event logging
 * Tracks application events with timestamps and categorization
 */
export const useEventLogger = () => {
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((type, message, metadata = {}) => {
    const logEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type, // 'status' | 'speech' | 'translation' | 'settings' | 'error'
      message,
      metadata
    };

    setLogs((prevLogs) => {
      const newLogs = [logEntry, ...prevLogs];
      // Limit to 100 most recent entries
      return newLogs.slice(0, 100);
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    logs,
    addLog,
    clearLogs
  };
};
