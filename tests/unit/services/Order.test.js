const { describe, test, expect } = require("@jest/globals");
const OrderService = require("../../../src/services/OrderService");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");
const SDK_CONSTANTS = require("../../../src/constants/SdkConstants");

jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("OrderService", () => {
  let mockConfig;
  let mockHttpClient;
  let mockSignature;
  let orderService;
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

    orderService = new OrderService(
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
    airalo.services.order = orderService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.orderService = orderService;
  });

  afterEach(() => {
    AiraloStatic.pool = {};
  });

  test("should create order successfully", async () => {
    const mockResponse = {
      data: {
        id: "order123",
        package_id: "pkg1",
        quantity: 1,
        status: "completed",
      },
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    // Test both instance and static methods
    const [resultInstance, resultStatic] = await Promise.all([
      airalo.order("pkg1", 1, "Test order"),
      AiraloStatic.order("pkg1", 1, "Test order"),
    ]);

    expect(resultInstance.data.id).toBe("order123");
    expect(resultStatic.data.id).toBe("order123");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
      "airalo-signature: test-signature",
    ]);
  });

  test("should create order with email sim share", async () => {
    const mockResponse = {
      data: {
        id: "order123",
        package_id: "pkg1",
        quantity: 1,
        status: "completed",
        to_email: "test@example.com",
      },
    };

    const esimCloud = {
      to_email: "test@example.com",
      sharing_option: ["link", "pdf"],
      copy_address: ["cc@example.com"],
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.orderWithEmailSimShare("pkg1", 1, esimCloud, "Test order"),
      AiraloStatic.orderWithEmailSimShare("pkg1", 1, esimCloud, "Test order"),
    ]);

    expect(resultInstance.data.to_email).toBe("test@example.com");
    expect(resultStatic.data.to_email).toBe("test@example.com");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
  });

  test("should create async order", async () => {
    const mockResponse = {
      data: {
        id: "order123",
        status: "pending",
      },
    };

    mockHttpClient.code = 202;
    mockHttpClient.post.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.orderAsync("pkg1", 1, "https://webhook.test", "Test order"),
      AiraloStatic.orderAsync("pkg1", 1, "https://webhook.test", "Test order"),
    ]);

    expect(resultInstance.data.status).toBe("pending");
    expect(resultStatic.data.status).toBe("pending");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
  });

  test("should create bulk order", async () => {
    const mockResponse = {
      data: {
        id: "order123",
        status: "completed",
      },
    };

    const packages = {
      pkg1: 1,
      pkg2: 2,
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.orderBulk(packages, "Test bulk order"),
      AiraloStatic.orderBulk(packages, "Test bulk order"),
    ]);

    expect(resultInstance.pkg1.data.id).toBe("order123");
    expect(resultStatic.pkg2.data.id).toBe("order123");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(4); // 2 packages × 2 calls
  });

  test("should create bulk order with email sim share", async () => {
    const mockResponse = {
      data: {
        id: "order123",
        status: "completed",
        to_email: "test@example.com",
      },
    };

    const packages = {
      pkg1: 1,
      pkg2: 2,
    };

    const esimCloud = {
      to_email: "test@example.com",
      sharing_option: ["link", "pdf"],
    };

    mockHttpClient.post.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.orderBulkWithEmailSimShare(packages, esimCloud, "Test bulk order"),
      AiraloStatic.orderBulkWithEmailSimShare(
        packages,
        esimCloud,
        "Test bulk order",
      ),
    ]);

    expect(resultInstance.pkg1.data.to_email).toBe("test@example.com");
    expect(resultStatic.pkg2.data.to_email).toBe("test@example.com");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(4);
  });

  test("should create async bulk order", async () => {
    const mockResponse = {
      data: {
        id: "order123",
        status: "pending",
      },
    };

    const packages = {
      pkg1: 1,
      pkg2: 2,
    };

    mockHttpClient.code = 202;
    mockHttpClient.post.mockResolvedValue(mockResponse);

    const [resultInstance, resultStatic] = await Promise.all([
      airalo.orderAsyncBulk(
        packages,
        "https://webhook.test",
        "Test bulk order",
      ),
      AiraloStatic.orderAsyncBulk(
        packages,
        "https://webhook.test",
        "Test bulk order",
      ),
    ]);

    expect(resultInstance.pkg1.data.status).toBe("pending");
    expect(resultStatic.pkg2.data.status).toBe("pending");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(4);
  });

  test("should validate order payload", async () => {
    const invalidPayloads = [
      { package_id: "", quantity: 1 },
      { package_id: "pkg1", quantity: 0 },
      { package_id: "pkg1", quantity: SDK_CONSTANTS.ORDER_LIMIT + 1 },
    ];

    for (const payload of invalidPayloads) {
      await expect(
        airalo.order(payload.package_id, payload.quantity),
      ).rejects.toThrow();
      await expect(
        AiraloStatic.order(payload.package_id, payload.quantity),
      ).rejects.toThrow();
    }
  });

  test("should validate email sim share payload", async () => {
    const invalidEsimCloud = {
      to_email: "invalid-email",
      sharing_option: ["invalid-option"],
      copy_address: ["invalid-cc-email"],
    };

    await expect(
      airalo.orderWithEmailSimShare("pkg1", 1, invalidEsimCloud),
    ).rejects.toThrow();
    await expect(
      AiraloStatic.orderWithEmailSimShare("pkg1", 1, invalidEsimCloud),
    ).rejects.toThrow();
  });

  test("should validate bulk order limits", async () => {
    const tooManyPackages = {};
    for (let i = 0; i <= SDK_CONSTANTS.BULK_ORDER_LIMIT + 1; i++) {
      tooManyPackages[`pkg${i}`] = 1;
    }

    await expect(airalo.orderBulk(tooManyPackages)).rejects.toThrow();
    await expect(AiraloStatic.orderBulk(tooManyPackages)).rejects.toThrow();
  });

  test("should handle order creation failure", async () => {
    mockHttpClient.code = 400;
    mockHttpClient.post.mockRejectedValue(new Error("API Error"));

    await expect(airalo.order("pkg1", 1)).rejects.toThrow("API Error");
    await expect(AiraloStatic.order("pkg1", 1)).rejects.toThrow("API Error");
  });
});
