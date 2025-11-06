import azureVoices from "../data/azure_voices.json";

/**
 * Get voice locale codes for a given language code
 * Handles special cases like Chinese variants
 */
export const getVoiceLocalesForLanguage = (languageCode) => {
  const matchingLocales = [];
  const baseLanguage = languageCode.split('-')[0];

  for (const locale in azureVoices) {
    if (locale.startsWith(baseLanguage + '-')) {
      matchingLocales.push(locale);
    }
  }

  // Special handling for Chinese variants
  if (languageCode === 'zh-Hans') {
    return matchingLocales.filter(l => l === 'zh-CN' || l.startsWith('zh-CN-'));
  }

  if (languageCode === 'zh-Hant') {
    return matchingLocales.filter(l => l === 'zh-TW' || l === 'zh-HK');
  }

  // For exact locale matches
  if (languageCode.includes('-') && matchingLocales.includes(languageCode)) {
    return [languageCode];
  }

  return matchingLocales;
};

/**
 * Get the preferred locale code for source language (for speech recognition)
 */
export const getSourceLocale = (langCode) => {
  const locales = getVoiceLocalesForLanguage(langCode);

  // Default to first available locale or construct a common one
  if (locales.length > 0) {
    // Prefer US for English, FR for French, etc.
    const preferredLocale = locales.find(l =>
      l === `${langCode}-US` ||
      l === `${langCode.toUpperCase()}-${langCode.toUpperCase()}` ||
      l.startsWith(langCode.split('-')[0] + '-')
    );
    return preferredLocale || locales[0];
  }

  // Fallback: try to construct a locale
  return `${langCode}-${langCode.toUpperCase()}`;
};

/**
 * Create language options for dropdown from azure_languages.json
 */
export const createLanguageOptions = (azureLanguages) => {
  return Object.entries(azureLanguages)
    .map(([code, data]) => ({
      value: code,
      label: data.name === data.nativeName
        ? data.name
        : `${data.name} (${data.nativeName})`
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Sort voices with female voices first, then alphabetically by name
 */
export const sortVoicesByGender = (voices) => {
  return voices.sort((a, b) => {
    if (a.gender !== b.gender) {
      return a.gender === 'Female' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
};

/**
 * Get display name for a language
 */
export const getLanguageDisplayName = (languageCode, azureLanguages) => {
  return azureLanguages[languageCode]?.name || languageCode;
};

/**
 * Get available voices for a target language
 */
export const getAvailableVoices = (targetLanguage) => {
  const locales = getVoiceLocalesForLanguage(targetLanguage);
  const voices = locales.flatMap(locale =>
    (azureVoices[locale] || []).map(voice => ({
      ...voice,
      locale: locale
    }))
  );

  return sortVoicesByGender(voices);
};
