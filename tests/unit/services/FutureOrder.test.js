const { describe, test, expect } = require("@jest/globals");
const FutureOrderService = require("../../../src/services/FutureOrderService");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");
const SDK_CONSTANTS = require("../../../src/constants/SdkConstants");

jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("FutureOrderService", () => {
  let mockConfig;
  let mockHttpClient;
  let mockSignature;
  let futureOrderService;
  let airalo;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockConfig = {
      getUrl: jest.fn(() => "https://api.test.com"),
      getHttpHeaders: jest.fn(() => ({})),
    };

    mockHttpClient = {
      setHeaders: jest.fn().mockReturnThis(),
      post: jest.fn(),
      code: 200,
    };

    mockSignature = {
      getSignature: jest.fn().mockReturnValue("test-signature"),
    };

    futureOrderService = new FutureOrderService(
      mockConfig,
      mockHttpClient,
      mockSignature,
      "test-token",
    );

    airalo = new Airalo({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });

    await airalo.initialize();
    airalo.services.futureOrders = futureOrderService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.futureOrderService = futureOrderService;
  });

  afterEach(() => {
    AiraloStatic.pool = {};
  });

  test("should create future order successfully", async () => {
    const mockResponse = {
      data: {
        request_id: "request123",
        package_id: "pkg1",
        quantity: 1,
        status: "pending",
        due_date: "2025-03-15 14:30",
        accepted_at: "2025-03-03 12:00",
      },
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    // Test both instance and static methods
    const [resultInstance, resultStatic] = await Promise.all([
      airalo.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        "https://webhook.test",
        "Test future order",
      ),
      AiraloStatic.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        "https://webhook.test",
        "Test future order",
      ),
    ]);

    expect(resultInstance.data.request_id).toBe("request123");
    expect(resultStatic.data.request_id).toBe("request123");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
      "airalo-signature: test-signature",
    ]);
  });

  test("should create future order with all optional parameters", async () => {
    const mockResponse = {
      data: {
        request_id: "request123",
        package_id: "pkg1",
        quantity: 1,
        status: "pending",
        due_date: "2025-03-15 14:30",
        accepted_at: "2025-03-03 12:00",
        to_email: "test@example.com",
      },
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        "https://webhook.test",
        "Test future order",
        "brand-setting-1",
        "test@example.com",
        ["link", "pdf"],
        ["cc@example.com"],
      ),
      AiraloStatic.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        "https://webhook.test",
        "Test future order",
        "brand-setting-1",
        "test@example.com",
        ["link", "pdf"],
        ["cc@example.com"],
      ),
    ]);

    expect(resultInstance.data.to_email).toBe("test@example.com");
    expect(resultStatic.data.to_email).toBe("test@example.com");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);

    // Verify the payload sent includes all parameters
    expect(mockHttpClient.post.mock.calls[0][1]).toMatchObject({
      package_id: "pkg1",
      quantity: 1,
      due_date: "2025-03-15 14:30",
      webhook_url: "https://webhook.test",
      description: "Test future order",
      brand_settings_name: "brand-setting-1",
      to_email: "test@example.com",
      sharing_option: ["link", "pdf"],
      copy_address: ["cc@example.com"],
    });
  });

  test("should cancel future order", async () => {
    const mockResponse = {
      data: {
        cancelled_requests: ["request123", "request456"],
      },
      meta: {
        message: "Future orders cancelled successfully",
      },
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    const requestIds = ["request123", "request456"];

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.cancelFutureOrder(requestIds),
      AiraloStatic.cancelFutureOrder(requestIds),
    ]);

    expect(resultInstance.data.cancelled_requests).toEqual([
      "request123",
      "request456",
    ]);
    expect(resultStatic.data.cancelled_requests).toEqual([
      "request123",
      "request456",
    ]);
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);

    // Verify the payload sent includes request_ids
    expect(mockHttpClient.post.mock.calls[0][1]).toEqual({
      request_ids: ["request123", "request456"],
    });
  });

  test("should validate future order payload", async () => {
    const invalidPayloads = [
      // Missing package_id
      ["", 1, "2025-03-15 14:30"],
      // Invalid quantity
      ["pkg1", 0, "2025-03-15 14:30"],
      // Exceeding quantity limit
      ["pkg1", SDK_CONSTANTS.FUTURE_ORDER_LIMIT + 1, "2025-03-15 14:30"],
      // Missing due date
      ["pkg1", 1, ""],
      // Invalid due date format
      ["pkg1", 1, "2025/03/15 14:30"],
    ];

    for (const [packageId, quantity, dueDate] of invalidPayloads) {
      await expect(
        airalo.createFutureOrder(packageId, quantity, dueDate),
      ).rejects.toThrow();
      await expect(
        AiraloStatic.createFutureOrder(packageId, quantity, dueDate),
      ).rejects.toThrow();
    }
  });

  test("should validate email parameters", async () => {
    const invalidEmail = "invalid-email";
    const invalidSharingOption = ["invalid-option"];
    const invalidCopyAddress = ["invalid-cc-email"];

    await expect(
      airalo.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        null,
        null,
        null,
        invalidEmail,
      ),
    ).rejects.toThrow();

    await expect(
      airalo.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        null,
        null,
        null,
        "valid@example.com",
        invalidSharingOption,
      ),
    ).rejects.toThrow();

    await expect(
      airalo.createFutureOrder(
        "pkg1",
        1,
        "2025-03-15 14:30",
        null,
        null,
        null,
        "valid@example.com",
        ["link"],
        invalidCopyAddress,
      ),
    ).rejects.toThrow();
  });

  test("should validate cancel future order payload", async () => {
    const invalidPayloads = [
      // Empty array
      [],
      // Not an array
      "request123",
      // Null value
      null,
    ];

    for (const requestIds of invalidPayloads) {
      await expect(airalo.cancelFutureOrder(requestIds)).rejects.toThrow();
      await expect(
        AiraloStatic.cancelFutureOrder(requestIds),
      ).rejects.toThrow();
    }
  });

  test("should handle future order creation failure", async () => {
    mockHttpClient.code = 400;
    mockHttpClient.post.mockRejectedValue(new Error("API Error"));

    await expect(
      airalo.createFutureOrder("pkg1", 1, "2025-03-15 14:30"),
    ).rejects.toThrow("API Error");

    await expect(
      AiraloStatic.createFutureOrder("pkg1", 1, "2025-03-15 14:30"),
    ).rejects.toThrow("API Error");
  });

  test("should handle future order cancellation failure", async () => {
    mockHttpClient.code = 400;
    mockHttpClient.post.mockRejectedValue(new Error("API Error"));

    await expect(airalo.cancelFutureOrder(["request123"])).rejects.toThrow(
      "API Error",
    );

    await expect(
      AiraloStatic.cancelFutureOrder(["request123"]),
    ).rejects.toThrow("API Error");
  });
});
