import React, { useEffect, useState } from "react";

function VolunteerHistory() {
  const [history, setHistory] = useState([]);
  const [eventDetails, setEventDetails] = useState(null);

  useEffect(() => {
    const fetchVolunteerHistory = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await fetch(
          `http://localhost:5000/api/volunteers/history/${userId}`
        );

        const data = await response.json();
        console.log(data);

        setHistory(data.history);
        const events = data.history.map((eventHistory) => ({
          eventName: eventHistory.eventId.eventName,
          eventDescription: eventHistory.eventId.eventDescription,
          location: eventHistory.eventId.location,
          requiredSkills: eventHistory.eventId.requiredSkills,
          urgency: eventHistory.eventId.urgency,
          eventDate: eventHistory.eventId.eventDate,
        }));

        setEventDetails(events);
      } catch (err) {}
    };

    fetchVolunteerHistory();
  }, []);

  console.log(eventDetails);

  return (
    <div className="container-history">
      <h2>Volunteer History</h2>
      <table className="volunteer-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Description</th>
            <th>Location</th>
            <th>Required Skills</th>
            <th>Urgency</th>
            <th>Event Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((eventHistory, index) => (
              <tr key={index}>
                <td>{eventHistory.eventId.eventName}</td>
                <td>{eventHistory.eventId.eventDescription}</td>
                <td>{eventHistory.eventId.location}</td>
                <td>{eventHistory.eventId.requiredSkills.join(", ")}</td>
                <td>{eventHistory.eventId.urgency}</td>
                <td>
                  {new Date(
                    eventHistory.eventId.eventDate
                  ).toLocaleDateString()}
                </td>
                <td>{eventHistory.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center" }}>
                No history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default VolunteerHistory;
