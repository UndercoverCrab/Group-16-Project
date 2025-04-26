import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";

function EventManagementForm() {
  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setRequiredSkills] = useState("");
  const [urgency, setUrgency] = useState("");
  const [eventDate, setEventDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // skills (multi-select dropdown)
  const skillsOptions = [
    { value: "leadership", label: "Leadership" },
    { value: "teamwork", label: "Teamwork" },
    { value: "flexible schedule", label: "Flexible Schedule" },
    { value: "problem solving", label: "Problem Solving" },
    { value: "other", label: "Other" },
  ];

  // urgency (dropdown)
  const urgencyOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

    // dark light styling
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

    // handleSubmit
    const handleSubmit = async (event) => {
      event.preventDefault();
      const requiredSkills = skills.map(option => option.label)

      try {
        const response = await fetch("http://localhost:5000/api/events/create-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventName, eventDescription, location, requiredSkills, urgency, eventDate }),
        });
    
        const data = await response.json();
    
        if (data.success) {
          alert("Event created successfully!");
        } else {
          console.log("body: ", JSON.stringify({ eventName, eventDescription, requiredSkills, urgency, eventDate }))
          setErrorMessage("Failed to create event.");
        }
      } catch (error) {
        console.error("Error:", error);
        setErrorMessage("Server error. Please try again.");
      }
    };

  return (
    <>
    <h1>Create Event</h1>
    <form className="border" onSubmit={handleSubmit}>
      <div className="form-field">
        <label>
          Event Name (required):
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            maxLength={100}
            required
            style={{ width: "100%", padding: "6px", fontSize: "16px" }}
          />
        </label>
      </div>
      <div>
        <label>
          Event Description (required):
          <textarea
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "16px",
              minHeight: "100px",
            }}
          />
        </label>
      </div>
      <div>
        <label>
          Location (required):
          <textarea
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", fontSize: "16px" }}
          />
        </label>
      </div>
      <div>
        <label>
          Required Skills (required):
          <Select
            isMulti
            options={skillsOptions}
            value={skills}
            onChange={(selected) => setRequiredSkills(selected)}
            required
            styles={lightdark}
          />
        </label>
      </div>
      <div>
        <label>
          Urgency (required):
          <Select
            options={urgencyOptions}
            value={urgencyOptions.find((option) => option.value === urgency)}
            onChange={(selected) => setUrgency(selected.value)}
            required
            styles={lightdark}
            
          />
        </label>
      </div>
      <div>
        <label>
          Event Date (required):
          <div className="event-date-container">
          <DatePicker
            selected={eventDate}
            onChange={(date) => setEventDate(date)}
            dateFormat="yyyy-MM-dd"
            required
            className="event-date-input"
          />
          </div>
        </label>
      </div>
      <div style={{paddingTop: "8px"}}>
        <button type="submit"> 
          Submit
        </button>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </form>
    </>
  );
}

export default EventManagementForm;
