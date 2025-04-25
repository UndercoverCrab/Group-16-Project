import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/VolunteerHistory.js", () => ({
  VolunteerHistory: {
    find: jest.fn(),
  },
}));
jest.unstable_mockModule("../models/Event.js", () => ({
  Event: {
    find: jest.fn(),
  },
}));
jest.unstable_mockModule("../models/User.js", () => ({
  UserCredentials: {},
  UserProfile: {
    find: jest.fn(),
  },
}));
jest.unstable_mockModule("../utils/csvGenerator.js", () => ({
  generateCSV: jest.fn(() => Buffer.from("mock csv")),
}));
jest.unstable_mockModule("../utils/pdfGenerator.js", () => ({
  generatePDF: jest.fn(() => Buffer.from("mock pdf")),
}));

let generateVolunteerHistoryReport, generateEventAssignmentsReport;
let VolunteerHistory, Event, UserProfile;
let generateCSV, generatePDF;

beforeAll(async () => {
  const service = await import("../services/reportingService.js");
  generateVolunteerHistoryReport = service.generateVolunteerHistoryReport;
  generateEventAssignmentsReport = service.generateEventAssignmentsReport;

  ({ VolunteerHistory } = await import("../models/VolunteerHistory.js"));
  ({ Event } = await import("../models/Event.js"));
  ({ UserProfile } = await import("../models/User.js"));
  ({ generateCSV } = await import("../utils/csvGenerator.js"));
  ({ generatePDF } = await import("../utils/pdfGenerator.js"));
});

describe("reportingService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockVolunteerHistoryFind = (data) => {
    VolunteerHistory.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(data),
      }),
    });
  };

  describe("generateVolunteerHistoryReport", () => {
    it("should return a CSV volunteer report", async () => {
      mockVolunteerHistoryFind([
        {
          eventId: {
            eventName: "Cleanup",
            location: "Park",
            eventDate: new Date("2023-01-01"),
          },
          volunteerId: { _id: "user1", email: "test@example.com" },
          status: "Attended",
        },
      ]);

      UserProfile.find.mockResolvedValue([
        { userId: "user1", fullName: "Test User" },
      ]);

      const result = await generateVolunteerHistoryReport("csv");

      expect(generateCSV).toHaveBeenCalled();
      expect(result.contentType).toBe("text/csv");
      expect(result.fileName).toMatch(/volunteer-history.*\.csv/);
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should return a PDF volunteer report", async () => {
      mockVolunteerHistoryFind([
        {
          eventId: {
            eventName: "Cleanup",
            location: "Park",
            eventDate: new Date("2023-01-01"),
          },
          volunteerId: { _id: "user1", email: "test@example.com" },
          status: "Attended",
        },
      ]);

      UserProfile.find.mockResolvedValue([
        { userId: "user1", fullName: "Test User" },
      ]);

      const result = await generateVolunteerHistoryReport("pdf");

      expect(generatePDF).toHaveBeenCalled();
      expect(result.contentType).toBe("application/pdf");
      expect(result.fileName).toMatch(/volunteer-history.*\.pdf/);
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should handle missing profile gracefully (fallback to N/A)", async () => {
      mockVolunteerHistoryFind([
        {
          eventId: {
            eventName: "Cleanup",
            location: "Park",
            eventDate: new Date("2023-01-01"),
          },
          volunteerId: { _id: "user2", email: "missing@example.com" },
          status: "No-show",
        },
      ]);

      UserProfile.find.mockResolvedValue([]);

      const result = await generateVolunteerHistoryReport("csv");

      expect(generateCSV).toHaveBeenCalled();
      expect(result.contentType).toBe("text/csv");
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });

  describe("generateEventAssignmentsReport", () => {
    it("should return a CSV event assignments report", async () => {
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            eventName: "Workshop",
            location: "Library",
            eventDate: new Date("2023-02-01"),
            assignedVolunteers: [{ _id: "user2", email: "vol@example.com" }],
          },
        ]),
      });

      UserProfile.find.mockResolvedValue([
        { userId: "user2", fullName: "Volunteer Name" },
      ]);

      const result = await generateEventAssignmentsReport("csv");

      expect(generateCSV).toHaveBeenCalled();
      expect(result.contentType).toBe("text/csv");
      expect(result.fileName).toMatch(/event-assignments.*\.csv/);
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it("should return CSV with fallback values if no volunteers", async () => {
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            eventName: "Seminar",
            location: "Auditorium",
            eventDate: new Date("2023-03-01"),
            assignedVolunteers: [],
          },
        ]),
      });

      UserProfile.find.mockResolvedValue([]);

      const result = await generateEventAssignmentsReport("csv");

      expect(generateCSV).toHaveBeenCalled();
      expect(result.buffer.toString()).toContain("None");
    });

    it("should fallback to N/A for missing user profiles", async () => {
      Event.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue([
          {
            eventName: "Talk",
            location: "Hall A",
            eventDate: new Date("2023-05-01"),
            assignedVolunteers: [
              { _id: "userX", email: "unknown@example.com" },
            ],
          },
        ]),
      });

      UserProfile.find.mockResolvedValue([]);

      const result = await generateEventAssignmentsReport("csv");

      expect(generateCSV).toHaveBeenCalled();
      expect(result.buffer.toString()).toContain("N/A");
    });
  });
});
