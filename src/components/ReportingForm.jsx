import { useState, useEffect } from 'react';
import Select from 'react-select';

function ReportingForm() {
  const [reportType, setReportType] = useState("");
  const [format, setFormat] = useState("");
  
  const reportTypeOptions = [
    { value: "events", label: "Event Details" },
    { value: "volunteers", label: "Volunteer Assignments" },
  ];
  
  const formatOptions = [
    { value: "csv", label: "CSV" },
    { value: "pdf", label: "PDF" },
  ];
  
  // light dark styling 
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = (e) => setIsDark(e.matches);

    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, []);
  const lightdark = {
    singleValue: (base) => ({
        ...base,
        color: isDark ? "#fffff" : "#00000"
    }),
    control: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2b2a33" : "#fffff",
      color: isDark ? "#fffff" : "#00000",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? "#2b2a33" : "#fffff",
      color: isDark ? "#fffff" : "#00000",
    }),
    option: (base, { isFocused, isSelected }) => ({
      ...base,
      backgroundColor: isSelected
        ? isDark
          ? "#66666"
          : "#ddddd"
        : isFocused
        ? isDark
          ? "#55555"
          : "#ccccc"
        : "transparent",
      color: isDark ? "#fffff" : "#00000",
    }),
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const apiUrl = `http://localhost:5000/api/reports/${reportType}?format=${format}`;
    window.open(apiUrl, '_blank');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Report Type:
          <Select
            options={reportTypeOptions}
            value={reportTypeOptions.find((option) => option.value === reportType)}
            onChange={(e) => setReportType(e.value)}
            required
            styles={lightdark}
          />
        </label>

        <label>
          File Format:
          <Select
            options={formatOptions}
            value={formatOptions.find((option) => option.value === format)}
            onChange={(e) => setFormat(e.value)}
            required
            styles={lightdark}
          />
        </label>

        <button type="submit">
          Export Data
        </button>
      </form>
    </div>
  );   
}

export default ReportingForm;