const { describe, test, expect } = require("@jest/globals");
const PackagesService = require("../../../src/services/PackagesService");
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

describe("PackagesService", () => {
  let mockConfig;
  let mockHttpClient;
  let packagesService;
  let cachedValue = null;
  let airalo;

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

    packagesService = new PackagesService(
      mockConfig,
      mockHttpClient,
      "test-token",
    );

    airalo = new Airalo({
      client_id: "test-id",
      client_secret: "test-secret",
    });

    await airalo.initialize();
    airalo.services.packages = packagesService;

    await AiraloStatic.init({
      client_id: "test-id",
      client_secret: "test-secret",
    });
    AiraloStatic.packagesService = packagesService;
  });

  afterEach(() => {
    cachedValue = null;
    AiraloStatic.pool = {};
  });

  test("should get all packages successfully", async () => {
    const mockResponse = {
      data: [
        {
          id: 1,
          slug: "test-package",
          operators: [
            {
              title: "Test Operator",
              packages: [{ id: "pkg1", title: "Test Package" }],
              countries: [{ country_code: "US" }],
            },
          ],
        },
      ],
      meta: { last_page: 1 },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    // Using Airalo instance
    const resultInstance = await airalo.getAllPackages();
    expect(resultInstance.data).toHaveLength(1);

    // Using AiraloStatic
    const resultStatic = await AiraloStatic.getAllPackages();
    expect(resultStatic.data).toHaveLength(1);

    expect(mockHttpClient.setHeaders).toHaveBeenCalledWith([
      "Authorization: Bearer test-token",
    ]);
    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringContaining("include=topup"),
    );
  });

  test("should handle pagination", async () => {
    const mockResponse1 = {
      data: [{ id: 1 }],
      meta: { last_page: 2 },
    };

    const mockResponse2 = {
      data: [{ id: 2 }],
      meta: { last_page: 2 },
    };

    // Mock responses for Airalo instance call (2 pages)
    mockHttpClient.get.mockImplementation(() => {
      // Track number of calls to properly return either first or second page
      const callCount = mockHttpClient.get.mock.calls.length;
      if (callCount % 2 === 1) {
        return Promise.resolve(mockResponse1);
      } else {
        return Promise.resolve(mockResponse2);
      }
    });

    // Test both implementation approaches
    const [resultInstance, resultStatic] = await Promise.all([
      airalo.getAllPackages(false, null, 1),
      AiraloStatic.getAllPackages(false, null, 1),
    ]);

    // Verify results
    expect(resultInstance.data).toHaveLength(2);
    expect(resultStatic.data).toHaveLength(2);
    expect(mockHttpClient.get).toHaveBeenCalledTimes(4);
  });

  test("should return flattened response when requested", async () => {
    const mockResponse = {
      data: [
        {
          slug: "test-package",
          operators: [
            {
              title: "Test Operator",
              packages: [
                {
                  id: "pkg1",
                  title: "Test Package",
                  price: 10,
                  type: "sim",
                },
              ],
              countries: [{ country_code: "US" }],
              plan_type: "data",
            },
          ],
        },
      ],
      meta: { last_page: 1 },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    // Using Airalo instance
    const resultInstance = await airalo.getAllPackages(true);
    expect(resultInstance.data[0]).toHaveProperty("package_id", "pkg1");
    expect(resultInstance.data[0]).toHaveProperty("countries", ["US"]);
    expect(resultInstance.data[0]).toHaveProperty("type", "sim");
    expect(resultInstance.data[0]).toHaveProperty("plan_type", "data");

    // Using AiraloStatic
    const resultStatic = await AiraloStatic.getAllPackages(true);
    expect(resultStatic.data[0]).toHaveProperty("package_id", "pkg1");
    expect(resultStatic.data[0]).toHaveProperty("countries", ["US"]);
    expect(resultStatic.data[0]).toHaveProperty("type", "sim");
    expect(resultStatic.data[0]).toHaveProperty("plan_type", "data");
  });

  test("should handle local package filtering", async () => {
    const response = { data: [], meta: { last_page: 1 } };
    mockHttpClient.get.mockResolvedValue(response);

    // Using Airalo instance
    await airalo.getLocalPackages();
    // Using AiraloStatic
    await AiraloStatic.getLocalPackages();

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringMatching(/.*filter%5Btype%5D=local.*/),
    );
  });

  test("should handle global package filtering", async () => {
    const response = { data: [], meta: { last_page: 1 } };
    mockHttpClient.get.mockResolvedValue(response);

    // Using Airalo instance
    await airalo.getGlobalPackages();
    // Using AiraloStatic
    await AiraloStatic.getGlobalPackages();

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringMatching(/.*filter%5Btype%5D=global.*/),
    );
  });

  test("should handle country filter", async () => {
    // Using Airalo instance
    await airalo.getCountryPackages("US");
    // Using AiraloStatic
    await AiraloStatic.getCountryPackages("US");

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.stringMatching(/.*filter%5Bcountry%5D=US.*/),
    );
  });

  test("should respect package limit", async () => {
    const mockResponse = {
      data: Array(10).fill({ id: 1 }),
      meta: { last_page: 1 },
    };

    mockHttpClient.get.mockResolvedValue(mockResponse);

    // Using Airalo instance
    const resultInstance = await airalo.getAllPackages(false, 5);
    expect(resultInstance.data).toHaveLength(5);

    // Using AiraloStatic
    const resultStatic = await AiraloStatic.getAllPackages(false, 5);
    expect(resultStatic.data).toHaveLength(5);
  });

  test("should handle sim-only packages", async () => {
    // Using Airalo instance
    await airalo.getSimPackages();
    // Using AiraloStatic
    await AiraloStatic.getSimPackages();

    expect(mockHttpClient.get).toHaveBeenCalledWith(
      expect.not.stringContaining("include=topup"),
    );
  });

  test("should properly construct cache key", async () => {
    await airalo.getAllPackages();
    expect(Crypt.md5).toHaveBeenCalled();
    expect(Cached.get).toHaveBeenCalledWith(
      expect.any(Function),
      expect.stringContaining("hashed_"),
    );
  });
});
