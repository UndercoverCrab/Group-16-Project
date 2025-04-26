import EventManagementForm from "../components/EventManagementForm";
import Footer from "../components/Footer";
import Header from "../components/Header";
import "./EventStyle.css";
import VolunteerMatchingForm from "../components/VolunteerMatchingForm";
import ReportingForm from "../components/ReportingForm";

function EventManagement() {
  return (
    <div className="event-form-page">
      <Header />
      <div className="event-form-container">
        <EventManagementForm />
      </div>
      <div className="volunteer-matching-container">
        <VolunteerMatchingForm />
      </div>
      <div className="event-form-container">
        <ReportingForm />
      </div>
      <Footer />
    </div>
  );
}

export default EventManagement;
