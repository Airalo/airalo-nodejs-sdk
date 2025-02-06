const { describe, test, expect } = require("@jest/globals");
const SimService = require("../../../src/services/SimService");
const Cached = require("../../../src/helpers/Cached");
const Crypt = require("../../../src/helpers/Crypt");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");

jest.mock("../../../src/helpers/Cached");
jest.mock("../../../src/helpers/Crypt");
jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("SimService", () => {
  let mockConfig;
  let mockHttpClient;
  let simService;
  let airalo;
  let cachedValue = null;
  const validIccid = "89012345678901234567";

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfig = {
      getUrl: jest.fn(() => "https://api.test.com"),
      getHttpHeaders: jest.fn(() => ({})),
    };

    mockHttpClient = {
      setHeaders: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    Cached.get.mockImplementation(async (fn) => {
      if (cachedValue) return cachedValue;
      const result = await fn();
      cachedValue = result;
      return result;
    });

    Crypt.md5.mockImplementation((val) => "hashed_" + val);

    simService = new SimService(mockConfig, mockHttpClient, "test-token");

    airalo = new Airalo({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });

    await airalo.initialize();
    airalo.services.sims = simService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.simService = simService;
  });

  afterEach(() => {
    cachedValue = null;
    AiraloStatic.pool = {};
  });

  test("should get sim usage successfully", async () => {
    const mockResponse = {
      data: {
        iccid: validIccid,
        usage: {
          data: "500MB",
          voice: "100min",
          text: "50SMS",
        },
      },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getSimUsage(validIccid),
      AiraloStatic.getSimUsage(validIccid),
    ]);

    expect(resultInstance.data.iccid).toBe(validIccid);
    expect(resultStatic.data.iccid).toBe(validIccid);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Authorization: Bearer test-token",
    ]);
  });

  test("should get bulk sim usage successfully", async () => {
    const iccids = [validIccid, validIccid.replace(/\d$/, "8")];
    const mockResponse = {
      data: {
        usage: {
          data: "500MB",
          voice: "100min",
          text: "50SMS",
        },
      },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getSimUsageBulk(iccids),
      AiraloStatic.getSimUsageBulk(iccids),
    ]);

    expect(resultInstance[iccids[0]]).toBeDefined();
    expect(resultStatic[iccids[1]]).toBeDefined();
    expect(mockHttpClient.get).toHaveBeenCalledTimes(4); // 2 ICCIDs × 2 calls
  });

  test("should get sim topups successfully", async () => {
    const mockResponse = {
      data: {
        iccid: validIccid,
        topups: [
          {
            id: "top1",
            package_id: "pkg1",
            status: "completed",
          },
        ],
      },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getSimTopups(validIccid),
      AiraloStatic.getSimTopups(validIccid),
    ]);

    expect(resultInstance.data.topups).toHaveLength(1);
    expect(resultStatic.data.topups).toHaveLength(1);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
  });

  test("should get sim package history successfully", async () => {
    const mockResponse = {
      data: {
        iccid: validIccid,
        packages: [
          {
            id: "pkg1",
            status: "active",
            activated_at: "2024-02-06T00:00:00Z",
          },
        ],
      },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getSimPackageHistory(validIccid),
      AiraloStatic.getSimPackageHistory(validIccid),
    ]);

    expect(resultInstance.data.packages).toHaveLength(1);
    expect(resultStatic.data.packages).toHaveLength(1);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(2);
  });

  test("should validate ICCID format", async () => {
    const invalidIccids = [
      "", // empty
      "123", // too short
      "a".repeat(19), // non-numeric
      "9".repeat(23), // too long
      null, // null
      undefined, // undefined
      {}, // object
      [], // array
    ];

    for (const iccid of invalidIccids) {
      await expect(airalo.getSimUsage(iccid)).rejects.toThrow(
        /iccid.*invalid/i,
      );
      await expect(AiraloStatic.getSimUsage(iccid)).rejects.toThrow(
        /iccid.*invalid/i,
      );
    }
  });

  test("should validate bulk sim usage input", async () => {
    const invalidInputs = [
      null,
      undefined,
      {},
      "string",
      123,
      [], // empty array
    ];

    for (const input of invalidInputs) {
      await expect(airalo.getSimUsageBulk(input)).rejects.toThrow(
        /iccids.*array/i,
      );
      await expect(AiraloStatic.getSimUsageBulk(input)).rejects.toThrow(
        /iccids.*array/i,
      );
    }
  });

  test("should handle API errors", async () => {
    mockHttpClient.get.mockRejectedValue(new Error("API Error"));

    await expect(airalo.getSimUsage(validIccid)).rejects.toThrow("API Error");
    await expect(AiraloStatic.getSimUsage(validIccid)).rejects.toThrow(
      "API Error",
    );
  });

  test("should handle bulk API errors gracefully", async () => {
    mockHttpClient.get.mockRejectedValue(new Error("API Error"));

    const iccids = [validIccid, validIccid.replace(/\d$/, "8")];
    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getSimUsageBulk(iccids),
      AiraloStatic.getSimUsageBulk(iccids),
    ]);

    // Bulk operations handle errors by including them in the response
    expect(resultInstance[iccids[0]].message).toBe("API Error");
    expect(resultStatic[iccids[0]].message).toBe("API Error");
  });

  test("should properly construct cache key", async () => {
    await airalo.getSimUsage(validIccid);

    expect(Crypt.md5).toHaveBeenCalled();
    expect(Cached.get).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining("hashed_"),
      300,
    );
  });

  test("should use different cache timeouts for different endpoints", async () => {
    // Test usage endpoint (300s cache)
    await airalo.getSimUsage(validIccid);
    expect(Cached.get).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(String),
      300,
    );

    // Test package history endpoint (900s cache)
    await airalo.getSimPackageHistory(validIccid);
    expect(Cached.get).toHaveBeenLastCalledWith(
      expect.any(Function),
      expect.any(String),
      900,
    );
  });

  test("should handle empty response data", async () => {
    mockHttpClient.get.mockResolvedValue({ data: null });

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getSimUsage(validIccid),
      AiraloStatic.getSimUsage(validIccid),
    ]);

    expect(resultInstance).toBeNull();
    expect(resultStatic).toBeNull();
  });
});
