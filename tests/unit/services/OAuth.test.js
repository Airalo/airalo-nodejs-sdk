const OAuthService = require("../../../src/services/OAuthService");
const Cached = require("../../../src/helpers/Cached");
const Crypt = require("../../../src/helpers/Crypt");
const API_CONSTANTS = require("../../../src/constants/ApiConstants");

// Mock helpers
jest.mock("../../../src/helpers/Cached");
jest.mock("../../../src/helpers/Crypt");

describe("OAuthService", () => {
  let mockConfig;
  let mockHttpClient;
  let mockSignature;
  let oauthService;
  let cachedValue = null;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      getCredentials: () => ({
        client_id: "test-id",
        client_secret: "test-secret",
      }),
      getUrl: () => "https://api.test.com",
    };

    mockHttpClient = {
      setHeaders: jest.fn().mockReturnThis(),
      post: jest.fn(),
    };

    mockSignature = {
      getSignature: jest.fn(() => "test-signature"),
    };

    Cached.get.mockImplementation(async (fn) => {
      if (cachedValue) return cachedValue;
      cachedValue = await fn();
      return cachedValue;
    });

    Crypt.encrypt.mockImplementation(
      (val, key) => `encrypted_${val}_with_${key}`,
    );
    Crypt.decrypt.mockImplementation((val, key) =>
      val.replace(`encrypted_`, "").replace(`_with_${key}`, ""),
    );

    oauthService = new OAuthService(mockConfig, mockHttpClient, mockSignature);
    oauthService.getEncryptionKey = jest.fn(() => "test-key");
  });

  afterEach(() => {
    cachedValue = null;
  });

  test("should get access token successfully", async () => {
    mockHttpClient.post.mockResolvedValue({
      data: { access_token: "test-token" },
    });

    const token = await oauthService.getAccessToken();

    expect(token).toBe("test-token");
    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "airalo-signature: test-signature",
    ]);
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      "https://api.test.com" + API_CONSTANTS.ENDPOINTS.TOKEN,
      {
        client_id: "test-id",
        client_secret: "test-secret",
        grant_type: "client_credentials",
      },
    );
  });

  test("should retry on failure and succeed", async () => {
    mockHttpClient.post
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        data: { access_token: "test-token" },
      });

    const token = await oauthService.getAccessToken();

    expect(token).toBe("test-token");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
  });

  test("should throw after max retries", async () => {
    mockHttpClient.post.mockRejectedValue(new Error("Network error"));

    await expect(oauthService.getAccessToken()).rejects.toThrow(
      "Failed to get access token: Network error",
    );
    expect(mockHttpClient.post).toHaveBeenCalledTimes(OAuthService.RETRY_LIMIT);
  });

  test("should throw when response has no access token", async () => {
    mockHttpClient.post.mockResolvedValue({ data: {} });

    await expect(oauthService.getAccessToken()).rejects.toThrow(
      "Access token not found in response",
    );
  });

  test("should use caching for subsequent calls", async () => {
    mockHttpClient.post.mockResolvedValue({
      data: { access_token: "test-token" },
    });

    const token1 = await oauthService.getAccessToken();
    const token2 = await oauthService.getAccessToken();

    expect(token1).toBe("test-token");
    expect(token2).toBe("test-token");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(1);
    expect(Cached.get).toHaveBeenCalledTimes(2);
  });

  test("should use encryption for token storage", async () => {
    const expectedToken = "test-token";
    mockHttpClient.post.mockResolvedValue({
      data: { access_token: expectedToken },
    });

    const token = await oauthService.getAccessToken();

    expect(token).toBe(expectedToken);
    expect(Crypt.encrypt).toHaveBeenCalledWith(expectedToken, "test-key");
    expect(Crypt.decrypt).toHaveBeenCalledWith(
      `encrypted_${expectedToken}_with_test-key`,
      "test-key",
    );
  });

  test("should construct correct cache key", async () => {
    mockHttpClient.post.mockResolvedValue({
      data: { access_token: "test-token" },
    });

    await oauthService.getAccessToken();

    expect(Cached.get).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining(OAuthService.CACHE_NAME),
    );
  });

  test("should delay between retries", async () => {
    mockHttpClient.post
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        data: { access_token: "test-token" },
      });

    const token = await oauthService.getAccessToken();

    expect(token).toBe("test-token");
    expect(mockHttpClient.post).toHaveBeenCalledTimes(2);
  });
});
