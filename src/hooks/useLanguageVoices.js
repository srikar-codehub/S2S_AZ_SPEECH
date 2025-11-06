import { useState, useEffect, useMemo } from "react";
import { getAvailableVoices } from "../utils/azureLanguageUtils";

/**
 * Custom hook to manage language voices
 * Automatically selects default voice when target language changes
 */
export const useLanguageVoices = (targetLanguage) => {
  const [selectedVoice, setSelectedVoice] = useState("");

  const availableVoices = useMemo(() => {
    return getAvailableVoices(targetLanguage);
  }, [targetLanguage]);

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

  return {
    availableVoices,
    selectedVoice,
    setSelectedVoice
  };
};
