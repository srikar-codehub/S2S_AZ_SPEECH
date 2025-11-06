import React from "react";

export const AudioPlayer = ({ audioUrl }) => {
  if (!audioUrl) return null;

  return (
    <div className="audio-section">
      <h3 className="audio-title">Latest Translation Audio</h3>
      <div className="audio-controls">
        <audio className="audio-player" controls src={audioUrl} />
        <a
          href={audioUrl}
          download="translation.mp3"
          className="download-link"
        >
          Download MP3
        </a>
      </div>
    </div>
  );
};
