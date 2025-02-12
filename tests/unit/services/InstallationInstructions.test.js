const { describe, test, expect } = require("@jest/globals");
const InstallationInstructionsService = require("../../../src/services/InstallationInstructionsService");
const Cached = require("../../../src/helpers/Cached");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");

jest.mock("../../../src/helpers/Cached");
jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("InstallationInstructionsService", () => {
  let mockConfig;
  let mockHttpClient;
  let instructionsService;
  let airalo;
  const validIccid = "89012345678901234567";

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfig = {
      getUrl: jest.fn(() => "https://api.test.com"),
      getHttpHeaders: jest.fn(() => ({})),
      get: jest.fn(),
    };

    mockHttpClient = {
      setHeaders: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue({
        data: {
          iccid: validIccid,
          instructions: [{ title: "Step 1", description: "Test" }],
        },
      }),
    };

    // Setup Cached mock
    Cached.get.mockImplementation((fn) => fn());

    instructionsService = new InstallationInstructionsService(
      mockConfig,
      mockHttpClient,
      "test-token",
    );

    airalo = new Airalo({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });

    await airalo.initialize();
    airalo.services.instruction = instructionsService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.installationInstructionsService = instructionsService;
  });

  afterEach(() => {
    AiraloStatic.pool = {};
  });

  test("should require access token", () => {
    expect(
      () =>
        new InstallationInstructionsService(mockConfig, mockHttpClient, null),
    ).toThrow("Invalid access token");
  });

  test("should require ICCID parameter", async () => {
    await expect(
      instructionsService.getInstructions({
        language: "en",
      }),
    ).rejects.toThrow('The parameter "iccid" is required');
  });

  test("should get instructions with proper headers", async () => {
    await instructionsService.getInstructions({
      iccid: validIccid,
      language: "en",
    });

    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
      "Accept-Language: en",
    ]);
  });

  test("should handle empty response", async () => {
    mockHttpClient.get.mockReturnValueOnce({});

    const result = await instructionsService.getInstructions({
      iccid: validIccid,
      language: "en",
    });

    expect(result).toBeNull();
  });

  test("should cache responses", async () => {
    let callCount = 0;
    Cached.get.mockImplementation((fn) => {
      if (callCount === 0) {
        callCount++;
        return fn();
      }
      return {
        data: {
          iccid: validIccid,
          instructions: [{ title: "Step 1", description: "Test" }],
        },
      };
    });

    const params = { iccid: validIccid, language: "en" };

    await instructionsService.getInstructions(params);
    await instructionsService.getInstructions(params);

    expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
  });

  test("should get instructions through Airalo wrapper", async () => {
    const result = await airalo.getSimInstructions(validIccid, "en");
    expect(result).toBeDefined();
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
      "Accept-Language: en",
    ]);
  });

  test("should get instructions through AiraloStatic wrapper", async () => {
    const result = await AiraloStatic.getSimInstructions(validIccid, "en");
    expect(result).toBeDefined();
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
      "Accept-Language: en",
    ]);
  });

  test("should handle API errors", async () => {
    mockHttpClient.get.mockImplementationOnce(() => {
      throw new Error("API Error");
    });

    await expect(
      instructionsService.getInstructions({
        iccid: validIccid,
        language: "en",
      }),
    ).rejects.toThrow();
  });
});
