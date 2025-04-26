import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { Types } from "mongoose";

jest.unstable_mockModule("../models/User.js", () => ({
  UserProfile: {
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    prototype: { save: jest.fn() },
  },
  UserCredentials: {
    findByIdAndUpdate: jest.fn(),
  },
}));

const { UserProfile, UserCredentials } = await import("../models/User.js");
const { getUserProfile, createUserProfile, updateUserProfile, getVolunteers } =
  await import("../controllers/userController.js");

describe("User Controller", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      params: {},
      user: { userId: "507f1f77bcf86cd799439011" },
      body: {
        fullName: "Test User",
        address1: "123 Test St",
        city: "Testville",
        state: "TS",
        zipCode: "12345",
        skills: ["Testing"],
        availability: ["2025-01-01"],
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    Types.ObjectId = jest.fn((id) => new mongoose.Types.ObjectId(id));
  });

  describe("getUserProfile", () => {
    it("should return user profile when found", async () => {
      const mockProfile = {
        userId: mockReq.user.userId,
        fullName: "Test User",
      };
      UserProfile.findOne.mockResolvedValue(mockProfile);
      mockReq.params.userId = mockReq.user.userId;

      await getUserProfile(mockReq, mockRes);

      expect(UserProfile.findOne).toHaveBeenCalledWith({
        userId: expect.any(mongoose.Types.ObjectId),
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
    });

    it("should return 404 when profile not found", async () => {
      UserProfile.findOne.mockResolvedValue(null);
      mockReq.params.userId = "invalidUserId";

      await getUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Profile not found",
      });
    });

    it("should handle server errors", async () => {
      UserProfile.findOne.mockRejectedValue(new Error("Database error"));
      mockReq.params.userId = mockReq.user.userId;

      await getUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("createUserProfile", () => {
    it("should create new profile successfully", async () => {
      UserProfile.findOne.mockResolvedValue(null);
      const mockProfile = { ...mockReq.body, userId: mockReq.user.userId };
      UserProfile.prototype.save.mockResolvedValue(mockProfile);

      await createUserProfile(mockReq, mockRes);

      expect(UserProfile.findOne).toHaveBeenCalledWith({
        userId: mockReq.user.userId,
      });
      expect(UserCredentials.findByIdAndUpdate).toHaveBeenCalledWith(
        mockReq.user.userId,
        { profileCompleted: true }
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Profile updated successfully",
        profile: mockProfile,
      });
    });

    it("should return 400 if profile already exists", async () => {
      UserProfile.findOne.mockResolvedValue({ exists: true });

      await createUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Profile already exists.",
      });
    });
  });

  describe("updateUserProfile", () => {
    it("should update existing profile", async () => {
      const mockUpdatedProfile = {
        ...mockReq.body,
        userId: mockReq.user.userId,
      };
      UserProfile.findOneAndUpdate.mockResolvedValue(mockUpdatedProfile);

      await updateUserProfile(mockReq, mockRes);

      expect(UserProfile.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: mockReq.user.userId },
        expect.any(Object),
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      expect(UserCredentials.findByIdAndUpdate).toHaveBeenCalledWith(
        mockReq.user.userId,
        { profileCompleted: true }
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Profile updated successfully",
        updatedProfile: mockUpdatedProfile,
      });
    });

    it("should handle update errors", async () => {
      UserProfile.findOneAndUpdate.mockRejectedValue(
        new Error("Update failed")
      );

      await updateUserProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getVolunteers", () => {
    it("should return list of volunteers", async () => {
      const mockProfiles = [
        { fullName: "Volunteer 1" },
        { fullName: "Volunteer 2" },
      ];
      UserProfile.find.mockResolvedValue(mockProfiles);

      await getVolunteers(mockReq, mockRes);

      expect(UserProfile.find).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockProfiles);
    });

    it("should handle database errors", async () => {
      UserProfile.find.mockRejectedValue(new Error("Database error"));

      await getVolunteers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
