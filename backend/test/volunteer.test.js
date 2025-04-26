import request from "supertest";
import app from "../index.js";
import { UserCredentials, UserProfile } from "../models/User.js";
import { Event } from "../models/Event.js";
import { VolunteerHistory } from "../models/VolunteerHistory.js";
import mongoose from "mongoose";
import { jest } from "@jest/globals";

describe("Volunteer Matching API", () => {
  let volunteerProfileId, eventId, volunteerUserId;

  beforeAll(async () => {
    const user = new UserCredentials({
      email: "volunteer@example.com",
      password: "password123",
      role: "volunteer",
    });
    await user.save();
    volunteerUserId = user._id;

    const profile = new UserProfile({
      userId: volunteerUserId,
      fullName: "Volunteer Name",
      address1: "123 Volunteer St",
      city: "Los Angeles",
      state: "CA",
      zipCode: "12345",
      skills: ["Teamwork"],
    });
    await profile.save();
    volunteerProfileId = profile._id;

    const event = new Event({
      eventName: "Beach Cleanup",
      requiredSkills: ["Teamwork"],
      urgency: "high",
    });
    await event.save();
    eventId = event._id;
  });

  afterAll(async () => {
    await UserCredentials.deleteMany();
    await UserProfile.deleteMany();
    await Event.deleteMany();
    await VolunteerHistory.deleteMany();
    await mongoose.connection.close();
  });

  describe("GET /history/:id", () => {
    it("should return 200 with empty history if none exists", async () => {
      const res = await request(app).get(
        `/api/volunteers/history/${volunteerProfileId}`
      );
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.history).toEqual([]);
      expect(res.body.message).toBe("No history available.");
    });

    it("should fetch history with populated event info", async () => {
      const match = new VolunteerHistory({
        volunteerId: volunteerUserId,
        eventId,
        status: "Pending",
      });
      await match.save();

      const res = await request(app).get(
        `/api/volunteers/history/${volunteerProfileId}`
      );

      expect(res.status).toBe(200);
      expect(res.body.history.length).toBe(1);
      expect(res.body.history[0].eventId).toMatchObject({
        eventName: "Beach Cleanup",
      });
    });

    it("should return 500 on database error", async () => {
      jest.spyOn(VolunteerHistory, "find").mockImplementationOnce(() => {
        throw new Error("DB failure");
      });

      const res = await request(app).get(
        `/api/volunteers/history/${volunteerProfileId}`
      );

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      jest.restoreAllMocks();
    });
  });

  describe("POST /match", () => {
    beforeEach(async () => {
      await VolunteerHistory.deleteMany();
    });

    it("should match volunteer to event successfully", async () => {
      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: volunteerProfileId,
        eventId,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const history = await VolunteerHistory.findOne({
        volunteerId: volunteerUserId,
      });
      expect(history).toBeTruthy();
    });

    it("should return 400 for invalid volunteer ID format", async () => {
      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: "invalid-id",
        eventId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid volunteer ID format/);
    });

    it("should return 400 for invalid event ID format", async () => {
      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: volunteerProfileId,
        eventId: "invalid-id",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid event ID format/);
    });

    it("should return 400 when volunteer profile not found", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: fakeId,
        eventId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Volunteer not found");
    });

    it("should return 400 for non-volunteer role user", async () => {
      const adminUser = new UserCredentials({
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
      });
      await adminUser.save();

      const adminProfile = new UserProfile({
        userId: adminUser._id,
        fullName: "Admin User",
      });
      await adminProfile.save();

      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: adminProfile._id,
        eventId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid volunteer ID");
    });

    it("should return 400 when event not found", async () => {
      const fakeEventId = new mongoose.Types.ObjectId();
      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: volunteerProfileId,
        eventId: fakeEventId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid event ID");
    });

    it("should return 400 for profile with missing user link", async () => {
      const orphanProfile = new UserProfile({
        fullName: "Orphan Volunteer",
      });
      await orphanProfile.save();

      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: orphanProfile._id,
        eventId,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Invalid volunteer ID");
    });

    it("should handle database errors gracefully", async () => {
      jest.spyOn(UserProfile, "findOne").mockImplementationOnce(() => {
        throw new Error("DB error");
      });

      const res = await request(app).post("/api/volunteers/match").send({
        volunteerId: volunteerProfileId,
        eventId,
      });

      expect(res.status).toBe(500);
      jest.restoreAllMocks();
    });
  });
});
