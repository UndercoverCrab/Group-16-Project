import { jest } from "@jest/globals";
import { generateCSV } from "../utils/csvGenerator.js";

jest.unstable_mockModule("csv-writer", () => ({
  createObjectCsvStringifier: jest.fn(() => ({
    getHeaderString: jest.fn(),
    stringifyRecords: jest.fn(),
  })),
}));

const { createObjectCsvStringifier } = await import("csv-writer");

describe("csvGenerator", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should generate CSV with correct headers and data", () => {
    const mockGetHeaderString = jest.fn().mockReturnValue("name,email\n");
    const mockStringifyRecords = jest
      .fn()
      .mockReturnValue("John,john@test.com\n");

    createObjectCsvStringifier.mockImplementation(() => ({
      getHeaderString: mockGetHeaderString,
      stringifyRecords: mockStringifyRecords,
    }));

    const testData = [
      { name: "John", email: "john@test.com" },
      { name: "Alice", email: "alice@test.com" },
    ];

    const result = generateCSV(testData);

    expect(createObjectCsvStringifier).toHaveBeenCalledWith({
      header: [
        { id: "name", title: "name" },
        { id: "email", title: "email" },
      ],
    });

    expect(result.toString("utf8").startsWith("\uFEFF")).toBe(true);

    const expectedContent = "\uFEFFname,email\nJohn,john@test.com\n";
    expect(result.toString("utf8")).toBe(expectedContent);
  });

  it("should handle empty data array", () => {
    const result = generateCSV([]);
    expect(result.toString("utf8")).toBe("\uFEFF");
  });

  it("should handle null/undefined data", () => {
    const nullResult = generateCSV(null);
    expect(nullResult.toString("utf8")).toBe("");

    const undefinedResult = generateCSV(undefined);
    expect(undefinedResult.toString("utf8")).toBe("");
  });

  it("should include UTF-8 BOM character", () => {
    const testData = [{ field: "value" }];

    createObjectCsvStringifier.mockImplementation(() => ({
      getHeaderString: () => "header\n",
      stringifyRecords: () => "data\n",
    }));

    const result = generateCSV(testData);
    const bufferString = result.toString("utf8");

    expect(bufferString.charCodeAt(0)).toBe(65279);
    expect(bufferString.startsWith("\uFEFF")).toBe(true);
  });

  it("should return empty buffer for invalid input", () => {
    const invalidData = [{}];
    const result = generateCSV(invalidData);
    expect(result.length).toBeGreaterThan(0);

    const trulyInvalid = "not-an-array";
    const invalidResult = generateCSV(trulyInvalid);
    expect(invalidResult.toString("utf8")).toBe("");
  });
});
