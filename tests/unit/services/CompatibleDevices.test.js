const { describe, test, expect } = require("@jest/globals");
const CompatibleDevicesService = require("../../../src/services/CompatibleDevicesService");
const AiraloException = require("../../../src/exceptions/AiraloException");
const API_CONSTANTS = require("../../../src/constants/ApiConstants");

jest.mock("../../../src/helpers/Cached");

describe("CompatibleDevicesService", () => {
  let mockConfig;
  let mockHttpClient;
  let compatibleDevicesService;
  const validAccessToken = "test-token";

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      getUrl: jest.fn(() => "https://api.test.com"),
    };

    mockHttpClient = {
      setHeaders: jest.fn().mockReturnThis(),
      get: jest.fn().mockReturnValue({
        data: { devices: [{ model: "Device 1" }, { model: "Device 2" }] },
      }),
    };

    compatibleDevicesService = new CompatibleDevicesService(
      mockConfig,
      mockHttpClient,
      validAccessToken,
    );
  });

  test("should require access token", () => {
    expect(
      () => new CompatibleDevicesService(mockConfig, mockHttpClient, null),
    ).toThrow(
      new AiraloException("Invalid access token please check your credentials"),
    );
  });

  test("should get compatible devices with proper headers", async () => {
    await compatibleDevicesService.getCompatibleDevices();

    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
    ]);
  });

  test("should return null if no data is found", async () => {
    mockHttpClient.get.mockReturnValueOnce({});

    const result = await compatibleDevicesService.getCompatibleDevices();

    expect(result).toBeNull();
  });

  test("should get compatible devices response", async () => {
    const result = await compatibleDevicesService.getCompatibleDevices();

    expect(result).toBeDefined();
    expect(result.data.devices).toHaveLength(2);
  });

  test("should handle API errors", async () => {
    mockHttpClient.get.mockImplementationOnce(() => {
      throw new Error("API Error");
    });

    await expect(
      compatibleDevicesService.getCompatibleDevices(),
    ).rejects.toThrow("API Error");
  });

  test("should build the correct URL for compatible devices", () => {
    const url = compatibleDevicesService.buildUrl();

    expect(url).toBe(
      "https://api.test.com" + API_CONSTANTS.ENDPOINTS.COMPATIBLE_DEVICES_SLUG,
    );
  });
});
