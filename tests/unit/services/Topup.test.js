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
      get: jest.fn().mockReturnValue("test-secret"),
    };

    mockHttpClient = {
      setHeaders: jest.fn().mockReturnThis(),
      post: jest.fn().mockResolvedValue({
        data: {
          id: "top123",
          package_id: "pkg1",
          iccid: validIccid,
          status: "completed",
        },
      }),
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

    // Initialize Airalo instance
    airalo = new Airalo({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    await airalo.initialize();
    airalo.services.topup = topupService;

    // Initialize AiraloStatic
    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.topupService = topupService;
  });

  afterEach(() => {
    AiraloStatic.pool = {};
  });

  test("should create topup successfully", async () => {
    const result = await topupService.createTopup({
      package_id: "pkg1",
      iccid: validIccid,
      description: "Test topup",
    });

    expect(result.data.id).toBe("top123");
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Content-Type: application/json",
      "Authorization: Bearer test-token",
      "airalo-signature: test-signature",
    ]);
  });

  test("should require package_id", async () => {
    await expect(
        topupService.createTopup({
          iccid: validIccid,
        }),
    ).rejects.toThrow(/package_id.*required/);
  });

  test("should require iccid", async () => {
    await expect(
        topupService.createTopup({
          package_id: "pkg1",
        }),
    ).rejects.toThrow(/iccid.*required/);
  });

  test("should create topup through Airalo instance", async () => {
    const result = await airalo.topup("pkg1", validIccid, "Test topup");

    expect(result.data.id).toBe("top123");
    expect(mockHttpClient.post).toHaveBeenCalledWith(expect.any(String), {
      package_id: "pkg1",
      iccid: validIccid,
      description: "Test topup",
    });
  });

  test("should create topup through AiraloStatic", async () => {
    await AiraloStatic.topup("pkg1", validIccid, "Test topup");

    expect(mockHttpClient.post).toHaveBeenCalledWith(expect.any(String), {
      package_id: "pkg1",
      iccid: validIccid,
      description: "Test topup",
    });
  });

  test("should use default description", async () => {
    await airalo.topup("pkg1", validIccid);

    expect(mockHttpClient.post).toHaveBeenCalledWith(expect.any(String), {
      package_id: "pkg1",
      iccid: validIccid,
      description: "Topup placed from Nodejs SDK",
    });
  });

  test("should handle API errors", async () => {
    mockHttpClient.post.mockRejectedValueOnce(new Error("API Error"));

    await expect(
        topupService.createTopup({
          package_id: "pkg1",
          iccid: validIccid,
        }),
    ).rejects.toThrow("API Error");
  });

  test("should require access token", () => {
    expect(
        () => new TopupService(mockConfig, mockHttpClient, mockSignature, null),
    ).toThrow("Invalid access token");
  });

  test("should generate signature", async () => {
    const payload = {
      package_id: "pkg1",
      iccid: validIccid,
    };

    await topupService.createTopup(payload);

    expect(mockSignature.getSignature).toHaveBeenCalledWith(payload);
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringMatching(/^airalo-signature: .+/)]),
    );
  });
});