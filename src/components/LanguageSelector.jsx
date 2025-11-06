import React from "react";

export const LanguageSelector = ({
  id,
  label,
  value,
  onChange,
  options,
  disabled
}) => (
  <div className="form-field">
    <label className="form-label" htmlFor={id}>
      {label}
    </label>
    <select
      id={id}
      className="form-select"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);
