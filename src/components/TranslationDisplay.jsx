import React from "react";
import { TextDisplay } from "./TextDisplay";

export const TranslationDisplay = ({
  sourceText,
  translatedText,
  sourceLanguageName,
  targetLanguageName
}) => (
  <div className="control-grid">
    <TextDisplay
      title={`Detected Speech (${sourceLanguageName})`}
      text={sourceText}
      placeholder="Speak to see detected speech..."
    />
    <TextDisplay
      title={`Translated (${targetLanguageName})`}
      text={translatedText}
      placeholder="Translation will appear here..."
      isTranslation
    />
  </div>
);
