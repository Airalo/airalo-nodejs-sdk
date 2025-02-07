const { describe, test, expect } = require("@jest/globals");
const ExchangeRateService = require("../../../src/services/ExchangeRateService");
const Cached = require("../../../src/helpers/Cached");
const Airalo = require("../../../src/Airalo");
const AiraloStatic = require("../../../src/AiraloStatic");

jest.mock("../../../src/helpers/Cached");
jest.mock("../../../src/services/OAuthService", () => {
  return jest.fn().mockImplementation(() => ({
    getAccessToken: jest.fn().mockResolvedValue("test-token"),
  }));
});

describe("ExchangeRateService", () => {
  let mockConfig;
  let mockHttpClient;
  let exchangeRateService;
  let airalo;
  let cachedValue = null;

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

    exchangeRateService = new ExchangeRateService(
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
    airalo.services.exchangeRates = exchangeRateService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
      env: "sandbox",
    });
    AiraloStatic.exchangeRateService = exchangeRateService;
  });

  afterEach(() => {
    cachedValue = null;
    AiraloStatic.pool = {};
  });

  describe("Direct Service Tests", () => {
    test("should get exchange rates successfully", async () => {
      const mockResponse = {
        data: {
          date: "2025-01-13",
          rates: [
            {
              from: "USD",
              mid: "0.67688309",
              to: "GBP",
            },
            {
              from: "USD",
              mid: "1.19694495",
              to: "EUR",
            },
          ],
        },
        meta: {
          message: "success",
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await exchangeRateService.exchangeRates({
        date: "2024-02-07",
        to: "EUR,GBP",
      });

      expect(result.data.rates).toBeDefined();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("date=2024-02-07"),
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("to=EUR%2CGBP"),
      );
      expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
        "Accept: application/json",
        "Content-Type: ",
        "Authorization: Bearer test-token",
      ]);
    });

    test("should validate date format", async () => {
      await expect(
        exchangeRateService.exchangeRates({
          date: "2024/02/07",
        }),
      ).rejects.toThrow(/^Please enter a valid date in the format YYYY-MM-DD$/);

      await expect(
        exchangeRateService.exchangeRates({
          date: "20240207",
        }),
      ).rejects.toThrow(/^Please enter a valid date in the format YYYY-MM-DD$/);

      await expect(
        exchangeRateService.exchangeRates({
          date: "2024-2-7",
        }),
      ).rejects.toThrow(/^Please enter a valid date in the format YYYY-MM-DD$/);
    });

    test("should validate currency code format", async () => {
      await expect(
        exchangeRateService.exchangeRates({
          to: "EURO",
        }),
      ).rejects.toThrow(
          /^Please enter a comma separated list of currency codes. Each code must have 3 letters$/,
      );

      await expect(
        exchangeRateService.exchangeRates({
          to: "EU",
        }),
      ).rejects.toThrow(
        /^Please enter a comma separated list of currency codes. Each code must have 3 letters$/,
      );

      await expect(
        exchangeRateService.exchangeRates({
          to: "EUR,GB",
        }),
      ).rejects.toThrow(
        /^Please enter a comma separated list of currency codes. Each code must have 3 letters$/,
      );
    });

    test("should handle empty parameters", async () => {
      const mockResponse = {
        data: {
          date: "2025-01-13",
          rates: [
            {
              from: "USD",
              mid: "0.67688309",
              to: "GBP",
            },
            {
              from: "USD",
              mid: "1.19694495",
              to: "EUR",
            },
          ],
        },
        meta: {
          message: "success",
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await exchangeRateService.exchangeRates({});

      expect(result.data.rates).toBeDefined();
      expect(result.data.date).toBeDefined();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.not.stringContaining("date="),
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.not.stringContaining("to="),
      );
    });
  });

  describe("Airalo Instance Tests", () => {
    test("should get exchange rates through Airalo instance", async () => {
      const mockResponse = {
        data: {
          date: "2024-02-07",
          rates: [
            {
              from: "USD",
              mid: "1.19694495",
              to: "EUR",
            },
          ],
        },
        meta: {
          message: "success",
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await airalo.getExchangeRates(
        "2024-02-07",
        null,
        null,
        "EUR",
      );

      expect(result.data.rates).toBeDefined();
      expect(result.data.date).toBeDefined();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("date=2024-02-07"),
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("to=EUR"),
      );
    });

    test("should handle validation through Airalo instance", async () => {
      await expect(airalo.getExchangeRates("2024/02/07")).rejects.toThrow(
        /^Please enter a valid date in the format YYYY-MM-DD$/,
      );

      await expect(
        airalo.getExchangeRates(null, null, null, "EURO"),
      ).rejects.toThrow(
        /^Please enter a comma separated list of currency codes. Each code must have 3 letters$/,
      );
    });
  });

  describe("AiraloStatic Tests", () => {
    test("should get exchange rates through AiraloStatic", async () => {
      const mockResponse = {
        data: {
          source: "USD",
          rates: {
            EUR: 0.85,
          },
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await AiraloStatic.getExchangeRates(
        "2024-02-07",
        null,
        null,
        "EUR",
      );

      expect(result.data.rates).toBeDefined();
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("date=2024-02-07"),
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining("to=EUR"),
      );
    });

    test("should handle validation through AiraloStatic", async () => {
      await expect(AiraloStatic.getExchangeRates("2024/02/07")).rejects.toThrow(
        /^Please enter a valid date in the format YYYY-MM-DD$/,
      );

      await expect(
        AiraloStatic.getExchangeRates(null, null, null, "EURO"),
      ).rejects.toThrow(
        /^Please enter a comma separated list of currency codes. Each code must have 3 letters$/,
      );
    });
  });

  describe("Caching", () => {
    test("should use cache for repeated requests", async () => {
      const mockResponse = {
        data: {
          source: "USD",
          rates: {
            EUR: 0.85,
          },
        },
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      // First call
      await exchangeRateService.exchangeRates({ to: "EUR" });

      // Second call - should use cache
      await exchangeRateService.exchangeRates({ to: "EUR" });

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1);
      expect(Cached.get).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(String),
        300,
      );
    });
  });

  describe("Error Handling", () => {
    test("should require access token", () => {
      expect(
        () => new ExchangeRateService(mockConfig, mockHttpClient, null),
      ).toThrow(/^Invalid access token please check your credentials$/);
    });

    test("should handle API errors", async () => {
      mockHttpClient.get.mockRejectedValue(new Error("API Error"));

      await expect(
        exchangeRateService.exchangeRates({ to: "EUR" }),
      ).rejects.toThrow(/^API Error$/);
    });

    test("should require initialization", async () => {
      const uninitializedAiralo = new Airalo({
        client_id: "test-id",
        client_secret: "test-secret",
        env: "sandbox",
      });

      await expect(uninitializedAiralo.getExchangeRates()).rejects.toThrow(
          /^Airalo SDK not initialized. Please call initialize\(\) method first.$/);

      AiraloStatic.pool = {};
      await expect(AiraloStatic.getExchangeRates()).rejects.toThrow(
        /^Airalo SDK is not initialized, please call static method init\(\) first$/,
      );
    });
  });
});
