import { jest } from "@jest/globals";

jest.unstable_mockModule("../services/reportingService.js", () => ({
  generateVolunteerHistoryReport: jest.fn(),
  generateEventAssignmentsReport: jest.fn(),
}));

let getVolunteerHistoryReport, getEventAssignmentsReport;
let reportingService;

beforeAll(async () => {
  const controller = await import("../controllers/reportingController.js");
  getVolunteerHistoryReport = controller.getVolunteerHistoryReport;
  getEventAssignmentsReport = controller.getEventAssignmentsReport;

  reportingService = await import("../services/reportingService.js");
});

describe("reportingController", () => {
  const mockBuffer = Buffer.from("some test data");
  const mockResponse = {
    buffer: mockBuffer,
    contentType: "text/csv",
    fileName: "mock-file.csv",
  };

  let req;
  let res;

  beforeEach(() => {
    req = { query: {} };
    res = {
      setHeader: jest.fn(),
      send: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe("getVolunteerHistoryReport", () => {
    it("should return a volunteer history report", async () => {
      reportingService.generateVolunteerHistoryReport.mockResolvedValue(
        mockResponse
      );
      await getVolunteerHistoryReport(req, res);
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        expect.stringContaining("mock-file.csv")
      );
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });

    it("should handle errors", async () => {
      reportingService.generateVolunteerHistoryReport.mockRejectedValue(
        new Error("fail")
      );
      await getVolunteerHistoryReport(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to generate volunteer history report.",
      });
    });
  });

  describe("getEventAssignmentsReport", () => {
    it("should return an event assignments report", async () => {
      reportingService.generateEventAssignmentsReport.mockResolvedValue(
        mockResponse
      );
      await getEventAssignmentsReport(req, res);
      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
      expect(res.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        expect.stringContaining("mock-file.csv")
      );
      expect(res.send).toHaveBeenCalledWith(mockBuffer);
    });

    it("should handle errors", async () => {
      reportingService.generateEventAssignmentsReport.mockRejectedValue(
        new Error("fail")
      );
      await getEventAssignmentsReport(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to generate event assignments report.",
      });
    });
  });
});
