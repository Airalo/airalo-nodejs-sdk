const { describe, test, expect } = require("@jest/globals");
const TopupService = require("../../../src/services/TopupService");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");

jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("TopupService", () => {
  let mockConfig;
  let mockHttpClient;
  let mockSignature;
  let topupService;
  let airalo;
  const validIccid = "89012345678901234567";

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

    topupService = new TopupService(
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
    airalo.services.topup = topupService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.topupService = {
      createTopup: jest.fn().mockImplementation((payload) => {
        // Map packageId to package_id for TopupService
        const mappedPayload = {
          ...payload,
          package_id: payload.packageId,
        };
        delete mappedPayload.packageId;
        return topupService.createTopup(mappedPayload);
      }),
    };
  });

  afterEach(() => {
    AiraloStatic.pool = {};
  });

  describe("Direct Service Tests", () => {
    test("should create topup successfully with valid payload", async () => {
      const mockResponse = {
        data: {
          id: "top123",
          package_id: "pkg1",
          iccid: validIccid,
          status: "completed",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const payload = {
        package_id: "pkg1",
        iccid: validIccid,
        description: "Test topup",
      };

      const result = await topupService.createTopup(payload);

      expect(result.data.id).toBe("top123");
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
      expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
        "Content-Type: application/json",
        "Authorization: Bearer test-token",
        "airalo-signature: test-signature",
      ]);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(payload),
      );
    });

    test("should validate package_id in payload", async () => {
      const invalidPayloads = [
        { iccid: validIccid },
        { package_id: "", iccid: validIccid },
        { package_id: null, iccid: validIccid },
      ];

      for (const payload of invalidPayloads) {
        await expect(topupService.createTopup(payload)).rejects.toThrow(
          /package_id.*required/i,
        );
      }
    });

    test("should validate iccid in payload", async () => {
      const invalidPayloads = [
        { package_id: "pkg1" },
        { package_id: "pkg1", iccid: "" },
        { package_id: "pkg1", iccid: null },
      ];

      for (const payload of invalidPayloads) {
        await expect(topupService.createTopup(payload)).rejects.toThrow(
          /iccid.*required/i,
        );
      }
    });

    test("should handle API errors", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("API Error"));

      const payload = {
        package_id: "pkg1",
        iccid: validIccid,
        description: "Test topup",
      };

      await expect(topupService.createTopup(payload)).rejects.toThrow(
        "API Error",
      );
    });

    test("should require access token during initialization", () => {
      expect(
        () => new TopupService(mockConfig, mockHttpClient, mockSignature, null),
      ).toThrow(/Invalid access token/);
    });

    test("should generate signature for request", async () => {
      mockHttpClient.post.mockResolvedValue({ data: { id: "top123" } });

      const payload = {
        package_id: "pkg1",
        iccid: validIccid,
        description: "Test topup",
      };

      await topupService.createTopup(payload);

      expect(mockSignature.getSignature).toHaveBeenCalledWith(payload);
      expect(mockHttpClient.setHeaders).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.stringMatching(/^airalo-signature: .+/),
        ]),
      );
    });
  });

  describe("Airalo Instance Tests", () => {
    test("should create topup through Airalo instance", async () => {
      const mockResponse = {
        data: {
          id: "top123",
          package_id: "pkg1",
          iccid: validIccid,
          status: "completed",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await airalo.topup("pkg1", validIccid, "Test topup");

      expect(result.data.id).toBe("top123");
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          package_id: "pkg1",
          iccid: validIccid,
          description: "Test topup",
        }),
      );
    });

    test("should use default description in Airalo instance", async () => {
      mockHttpClient.post.mockResolvedValue({ data: { id: "top123" } });

      await airalo.topup("pkg1", validIccid);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          package_id: "pkg1",
          iccid: validIccid,
          description: "Topup placed from Nodejs SDK",
        }),
      );
    });
  });

  describe("AiraloStatic Tests", () => {
    test("should create topup through AiraloStatic", async () => {
      const mockResponse = {
        data: {
          id: "top123",
          package_id: "pkg1",
          iccid: validIccid,
          status: "completed",
        },
      };

      mockHttpClient.post.mockResolvedValue(mockResponse);

      const result = await AiraloStatic.topup("pkg1", validIccid, "Test topup");

      expect(result.data.id).toBe("top123");
      expect(AiraloStatic.topupService.createTopup).toHaveBeenCalledWith({
        packageId: "pkg1",
        iccid: validIccid,
        description: "Test topup",
      });
    });

    test("should use default description in AiraloStatic", async () => {
      mockHttpClient.post.mockResolvedValue({ data: { id: "top123" } });

      await AiraloStatic.topup("pkg1", validIccid);

      expect(AiraloStatic.topupService.createTopup).toHaveBeenCalledWith({
        packageId: "pkg1",
        iccid: validIccid,
        description: "Topup placed from Nodejs SDK",
      });
    });

    test("should handle errors in AiraloStatic properly", async () => {
      mockHttpClient.post.mockRejectedValue(new Error("API Error"));

      await expect(AiraloStatic.topup("pkg1", validIccid)).rejects.toThrow(
        "API Error",
      );
    });
  });
});
