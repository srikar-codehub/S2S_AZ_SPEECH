import React from "react";

export const TextDisplay = ({
  title,
  text,
  placeholder,
  isTranslation = false
}) => (
  <div className="text-display-card">
    <h3 className="text-display-title">{title}</h3>
    <div className={`text-display-content ${isTranslation ? 'text-display-content--translated' : ''}`}>
      {text || placeholder}
    </div>
  </div>
);
