import React from "react";

const DeviceDropdown = ({ label, devices, selectedDevice, onChange, disabled, deviceType }) => (
  <div className="form-field">
    <label className="form-label">{label}</label>
    <select
      className="form-select"
      value={selectedDevice}
      onChange={onChange}
      disabled={disabled}
    >
      {devices.map(device => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `${deviceType} ${device.deviceId.slice(0, 5)}`}
        </option>
      ))}
    </select>
  </div>
);

export const AudioDeviceSelector = ({
  inputDevices,
  outputDevices,
  selectedInput,
  selectedOutput,
  onInputChange,
  onOutputChange,
  disabled
}) => (
  <div className="status-card">
    <h3 className="status-title">Audio Devices</h3>

    <DeviceDropdown
      label="Microphone Input"
      devices={inputDevices}
      selectedDevice={selectedInput}
      onChange={onInputChange}
      disabled={disabled}
      deviceType="Microphone"
    />

    <DeviceDropdown
      label="Audio Output"
      devices={outputDevices}
      selectedDevice={selectedOutput}
      onChange={onOutputChange}
      disabled={disabled}
      deviceType="Speaker"
    />
  </div>
);
