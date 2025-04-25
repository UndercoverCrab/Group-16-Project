import { jest } from "@jest/globals";
import { generatePDF } from "../utils/pdfGenerator.js";

// Mock PDFDocument and its methods
jest.unstable_mockModule("pdfkit", () => {
  const mockDocument = {
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    on: jest.fn().mockImplementation(function (event, callback) {
      this._events = this._events || {};
      this._events[event] = callback;
      return this;
    }),
    end: jest.fn().mockImplementation(function () {
      if (this._events?.data) {
        this._events.data(Buffer.from("mock-chunk-1"));
        this._events.data(Buffer.from("mock-chunk-2"));
      }
      this._events?.end?.();
      return this;
    }),
  };

  return {
    default: jest.fn(() => mockDocument),
  };
});

const PDFDocument = (await import("pdfkit")).default;

describe("pdfGenerator", () => {
  let mockDocInstance;

  beforeEach(() => {
    mockDocInstance = PDFDocument();
    jest.clearAllMocks();
  });

  it("should generate a PDF with title and data", async () => {
    const testData = [
      { Name: "John", Email: "john@test.com" },
      { Name: "Alice", Email: "alice@test.com" },
    ];

    const result = await generatePDF(testData, "Test Report");

    // Verify PDF construction
    expect(PDFDocument).toHaveBeenCalled();

    // Verify title formatting
    expect(mockDocInstance.fontSize).toHaveBeenCalledWith(18);
    expect(mockDocInstance.text).toHaveBeenCalledWith("Test Report", {
      align: "center",
    });

    // Verify headers
    expect(mockDocInstance.fontSize).toHaveBeenCalledWith(12);
    expect(mockDocInstance.text).toHaveBeenCalledWith("Name | Email", {
      underline: true,
    });

    // Verify data rows
    expect(mockDocInstance.text).toHaveBeenCalledWith("John | john@test.com");
    expect(mockDocInstance.text).toHaveBeenCalledWith("Alice | alice@test.com");

    // Verify buffer construction
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toMatch(/mock-chunk-1mock-chunk-2/);
  });

  it("should handle empty data array", async () => {
    const result = await generatePDF([], "Empty Report");

    expect(mockDocInstance.text).toHaveBeenCalledWith("No data available.");
    expect(mockDocInstance.end).toHaveBeenCalled();
  });

  it("should use default title when not provided", async () => {
    await generatePDF([{ Test: "Data" }]);
    expect(mockDocInstance.text).toHaveBeenCalledWith("Report", {
      align: "center",
    });
  });

  it("should handle different data structures", async () => {
    const complexData = [
      { ID: 1, "Full Name": "John Doe", Active: true },
      { ID: 2, "Full Name": "Jane Smith", Active: false },
    ];

    await generatePDF(complexData, "Complex Data");

    expect(mockDocInstance.text).toHaveBeenCalledWith(
      "ID | Full Name | Active",
      { underline: true }
    );
    expect(mockDocInstance.text).toHaveBeenCalledWith("1 | John Doe | true");
    expect(mockDocInstance.text).toHaveBeenCalledWith("2 | Jane Smith | false");
  });

  it("should reject on errors", async () => {
    PDFDocument.mockImplementationOnce(() => {
      throw new Error("PDF creation failed");
    });

    await expect(generatePDF([{ Error: "Test" }])).rejects.toThrow(
      "PDF creation failed"
    );
  });

  it("should properly chain PDF methods", async () => {
    await generatePDF([{ Test: "Data" }]);

    // Verify method chaining works
    expect(mockDocInstance.fontSize().text().moveDown()).toBe(mockDocInstance);
  });

  it("should handle special characters in data", async () => {
    const specialData = [{ Content: "Line\nBreak", Symbols: "☑✓★" }];

    await generatePDF(specialData);
    expect(mockDocInstance.text).toHaveBeenCalledWith("Content | Symbols", {
      underline: true,
    });
    expect(mockDocInstance.text).toHaveBeenCalledWith("Line\nBreak | ☑✓★");
  });
});
