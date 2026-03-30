export function DInput({ label, placeholder, inputType = "text", field, options, required, onInputChange, formData }) {
  const value = formData?.[field] || "";

  const handleChange = (e) => {
    if (onInputChange) {
      onInputChange(field, e.target.value);
    }
  };

  if (inputType === "select") {
    return (
      <div className="d-input">
        {label && <label className="d-input__label">{label}{required && <span className="d-input__req">*</span>}</label>}
        <select className="d-input__field" value={value} onChange={handleChange} required={required}>
          <option value="">{placeholder || "Select..."}</option>
          {(options || []).map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  if (inputType === "textarea") {
    return (
      <div className="d-input">
        {label && <label className="d-input__label">{label}{required && <span className="d-input__req">*</span>}</label>}
        <textarea
          className="d-input__field d-input__field--textarea"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          rows={3}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="d-input">
      {label && <label className="d-input__label">{label}{required && <span className="d-input__req">*</span>}</label>}
      <input
        className="d-input__field"
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
      />
    </div>
  );
}
