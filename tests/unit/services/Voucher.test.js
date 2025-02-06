const { describe, test, expect } = require("@jest/globals");
const VoucherService = require("../../../src/services/VoucherService");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");
const SdkConstants = require("../../../src/constants/SdkConstants");

jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("VoucherService", () => {
  let mockConfig;
  let mockHttpClient;
  let mockSignature;
  let voucherService;
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
    };

    mockSignature = {
      getSignature: jest.fn().mockReturnValue("test-signature"),
    };

    voucherService = new VoucherService(
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
    airalo.services.vouchers = voucherService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.voucherService = voucherService;
  });

  afterEach(() => {
    AiraloStatic.pool = {};
  });

  describe("Regular Vouchers", () => {
    test("should create voucher through Airalo instance", async () => {
      const mockResponse = {
        data: {
          id: "voucher123",
          amount: 100,
          quantity: 1,
          usage_limit: 5,
          status: "active",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await airalo.voucher(5, 100, 1, false);

      expect(result.data.id).toBe("voucher123");
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 100,
          quantity: 1,
          usage_limit: 5,
          is_paid: false,
        }),
      );
    });

    test("should create voucher through AiraloStatic", async () => {
      const mockResponse = {
        data: {
          id: "voucher123",
          amount: 100,
          quantity: 1,
          usage_limit: 5,
          status: "active",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await AiraloStatic.voucher(5, 100, 1, false);

      expect(result.data.id).toBe("voucher123");
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          amount: 100,
          quantity: 1,
          usage_limit: 5,
          is_paid: false,
        }),
      );
    });

    test("should validate amount through wrapper methods", async () => {
      await expect(airalo.voucher(5, 0, 1)).rejects.toThrow(
        `The amount is required`,
      );
      await expect(
        AiraloStatic.voucher(5, SdkConstants.VOUCHER_MAX_NUM + 1, 1),
      ).rejects.toThrow(
        `The amount may not be greater than ${SdkConstants.VOUCHER_MAX_NUM}`,
      );
    });

    test("should validate quantity", async () => {
      // Test zero quantity
      expect(() =>
        voucherService._validateVoucher({
          amount: 100,
          usage_limit: 5,
          is_paid: false,
        }),
      ).toThrow("The quantity is required");

      // Test too large quantity
      expect(() =>
        voucherService._validateVoucher({
          amount: 100,
          quantity: 110,
          usage_limit: 5,
          is_paid: false,
        }),
      ).toThrow("The quantity may not be greater than 100");
    });

    test("should validate usage limit through wrapper methods", async () => {
      await expect(airalo.voucher(-1, 100, 1)).rejects.toThrow(
        `The usage_limit may not be greater than ${SdkConstants.VOUCHER_MAX_NUM}`,
      );
      await expect(
        AiraloStatic.voucher(SdkConstants.VOUCHER_MAX_NUM + 1, 100, 1),
      ).rejects.toThrow(
        `The usage_limit may not be greater than ${SdkConstants.VOUCHER_MAX_NUM}`,
      );
    });

    test("should validate voucher code with quantity", async () => {
      await expect(airalo.voucher(5, 100, 2, false, "TEST123")).rejects.toThrow(
        `The selected voucher code allows a maximum quantity of 1`,
      );
      await expect(
        AiraloStatic.voucher(5, 100, 2, false, "TEST123"),
      ).rejects.toThrow(
        `The selected voucher code allows a maximum quantity of 1`,
      );
    });
  });

  describe("eSIM Vouchers", () => {
    const validPayload = {
      vouchers: [
        {
          package_id: "pkg1",
          quantity: 1,
        },
      ],
    };

    test("should create eSIM voucher through direct service", async () => {
      const mockResponse = {
        data: {
          id: "esim_voucher123",
          vouchers: validPayload.vouchers,
          status: "active",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await voucherService.createEsimVoucher(validPayload);

      expect(result.data.id).toBe("esim_voucher123");
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(validPayload),
      );
    });

    test("should create eSIM voucher through wrapper methods", async () => {
      const mockResponse = {
        data: {
          id: "esim_voucher123",
          vouchers: validPayload.vouchers,
          status: "active",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const resultAiralo = await airalo.esimVouchers(validPayload);
      expect(resultAiralo.data.id).toBe("esim_voucher123");

      const resultStatic = await AiraloStatic.esimVouchers(validPayload);
      expect(resultStatic.data.id).toBe("esim_voucher123");
    });

    test("should validate eSIM voucher payload", async () => {
      const invalidPayloads = [
        {}, // empty payload
        { vouchers: null }, // null vouchers
        { vouchers: [] }, // empty vouchers array
        { vouchers: "not-an-array" }, // invalid vouchers type
        { vouchers: [{ quantity: 1 }] }, // missing package_id
        { vouchers: [{ package_id: "pkg1" }] }, // missing quantity
        {
          vouchers: [
            {
              package_id: "pkg1",
              quantity: SdkConstants.VOUCHER_MAX_QUANTITY + 1,
            },
          ],
        }, // invalid quantity
      ];

      for (const payload of invalidPayloads) {
        await expect(
          voucherService.createEsimVoucher(payload),
        ).rejects.toThrow();
        await expect(airalo.esimVouchers(payload)).rejects.toThrow();
        await expect(AiraloStatic.esimVouchers(payload)).rejects.toThrow();
      }
    });
  });

  describe("Error Handling", () => {
    test("should require access token", () => {
      expect(
        () =>
          new VoucherService(mockConfig, mockHttpClient, mockSignature, null),
      ).toThrow("Invalid access token");
    });

    test("should require initialization", async () => {
      const uninitializedAiralo = new Airalo({
        client_id: "test-id",
        client_secret: "test-secret",
        env: "sandbox",
      });

      await expect(uninitializedAiralo.voucher(5, 100, 1)).rejects.toThrow(
        "not initialized",
      );

      AiraloStatic.pool = {};
      await expect(AiraloStatic.voucher(5, 100, 1)).rejects.toThrow(
        "not initialized",
      );
    });

    test("should handle API errors", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("API Error"));

      await expect(
        voucherService.createVoucher({
          amount: 100,
          quantity: 1,
          usage_limit: 5,
        }),
      ).rejects.toThrow("API Error");

      await expect(airalo.voucher(5, 100, 1)).rejects.toThrow("API Error");

      await expect(AiraloStatic.voucher(5, 100, 1)).rejects.toThrow(
        "API Error",
      );
    });
  });

  describe("Headers and Signature", () => {
    test("should send correct headers", async () => {
      mockHttpClient.post.mockResolvedValue({ data: { id: "voucher123" } });

      await airalo.voucher(5, 100, 1);

      expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
        "Content-Type: application/json",
        "Authorization: Bearer test-token",
        "airalo-signature: test-signature",
      ]);
    });

    test("should generate signature for request", async () => {
      mockHttpClient.post.mockResolvedValue({ data: { id: "voucher123" } });

      await airalo.voucher(5, 100, 1);

      expect(mockSignature.getSignature).toHaveBeenCalled();
      expect(mockHttpClient.setHeaders).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringMatching(/^airalo-signature: .+/),
        ]),
      );
    });
  });
});
