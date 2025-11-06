import { useState, useEffect } from "react";
import { enumerateAudioDevices } from "../utils/audioUtils";

/**
 * Custom hook to manage audio input and output devices
 * Enumerates devices and manages selection
 */
export const useAudioDevices = () => {
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState("");
  const [selectedOutputDevice, setSelectedOutputDevice] = useState("");

  useEffect(() => {
    const loadDevices = async () => {
      const { inputDevices, outputDevices } = await enumerateAudioDevices();

      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);

      // Set default devices
      if (inputDevices.length > 0 && !selectedInputDevice) {
        setSelectedInputDevice(inputDevices[0].deviceId);
      }
      if (outputDevices.length > 0 && !selectedOutputDevice) {
        setSelectedOutputDevice(outputDevices[0].deviceId);
      }
    };

    loadDevices();
  }, [selectedInputDevice, selectedOutputDevice]);

  return {
    audioInputDevices,
    audioOutputDevices,
    selectedInputDevice,
    selectedOutputDevice,
    setSelectedInputDevice,
    setSelectedOutputDevice
  };
};
