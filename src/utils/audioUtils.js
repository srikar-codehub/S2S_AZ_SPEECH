/**
 * Enumerate available audio input and output devices
 * Requests microphone permission first to get device labels
 */
export const enumerateAudioDevices = async () => {
  try {
    // Request microphone permission first
    await navigator.mediaDevices.getUserMedia({ audio: true });

    const devices = await navigator.mediaDevices.enumerateDevices();

    const inputDevices = devices.filter(device => device.kind === 'audioinput');
    const outputDevices = devices.filter(device => device.kind === 'audiooutput');

    return { inputDevices, outputDevices };
  } catch (err) {
    console.error("Error enumerating devices:", err);
    return { inputDevices: [], outputDevices: [] };
  }
};

/**
 * Create an audio blob from audio buffer
 */
export const createAudioBlob = (audioBuffer) => {
  return new Blob([audioBuffer], { type: "audio/mp3" });
};
