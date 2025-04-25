import { VolunteerHistory } from "../models/VolunteerHistory.js";
import { UserCredentials, UserProfile } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Types } from "mongoose";
import mongoose from "mongoose";

// Get Volunteer History
export const getVolunteerHistory = async (req, res) => {
  try {
    const volunteerId = req.params.id;
    console.log(volunteerId);

    const history = await VolunteerHistory.find({
      volunteerId: new Types.ObjectId(volunteerId),
    }).populate("eventId");

    console.log(history);

    return res.json({
      success: true,
      history,
      message: history.length ? "History found." : "No history available.",
    });
  } catch (error) {
    console.error("Match Volunteer Error:", error); // Log full error details
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Match Volunteer to Event
export const matchVolunteer = async (req, res) => {
  try {
    const { volunteerId, eventId } = req.body;

    console.log("Received volunteerId:", volunteerId);
    console.log("Received eventId:", eventId);

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(volunteerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid volunteer ID format" });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID format" });
    }

    // Check if volunteer exists
    const volunteer = await UserProfile.findOne({
      _id: volunteerId,
    }).populate("userId");

    if (!volunteer) {
      return res
        .status(400)
        .json({ success: false, message: "Volunteer not found" });
    }

    if (!volunteer.userId || volunteer.userId.role !== "volunteer") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid volunteer ID" });
    }

    console.log("Volunteer found:", volunteer);

    // Check if event exists
    const event = await Event.findById(eventId);
    console.log("Event found:", event);

    if (!event) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID" });
    }

    // Create a new volunteer-event match entry
    const newMatch = new VolunteerHistory({
      volunteerId: volunteer.userId._id,
      eventId,
      status: "Pending",
    });

    await newMatch.save();
    console.log("Match saved successfully");

    res.json({ success: true, message: "Volunteer matched successfully!" });
  } catch (error) {
    console.error("Error in matchVolunteer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
