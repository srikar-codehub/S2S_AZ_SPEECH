/**
 * Validate Azure configuration from environment variables
 * Throws error if configuration is missing
 */
export const validateAzureConfig = () => {
  const speechKey = process.env.REACT_APP_SPEECH_KEY;
  const serviceRegion = process.env.REACT_APP_SPEECH_REGION;

  if (!speechKey || !serviceRegion) {
    throw new Error("Missing Azure Speech key or region in .env");
  }

  return { speechKey, serviceRegion };
};

/**
 * Validate translation setup before starting
 * Throws error if setup is invalid
 */
export const validateTranslationSetup = (selectedVoice) => {
  if (!selectedVoice) {
    throw new Error("Please select a voice for the target language");
  }
};
