import { useState, useEffect } from "react";

/**
 * Custom hook to manage audio recording URL
 * Handles URL creation and cleanup
 */
export const useAudioRecording = () => {
  const [latestAudioUrl, setLatestAudioUrl] = useState(null);

  const updateAudio = (blob) => {
    const url = window.URL.createObjectURL(blob);
    setLatestAudioUrl((previousUrl) => {
      if (previousUrl) {
        window.URL.revokeObjectURL(previousUrl);
      }
      return url;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (latestAudioUrl) {
        window.URL.revokeObjectURL(latestAudioUrl);
      }
    };
  }, [latestAudioUrl]);

  return {
    latestAudioUrl,
    updateAudio
  };
};
