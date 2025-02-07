const Cached = require("../helpers/Cached");
const Crypt = require("../helpers/Crypt");
const AiraloException = require("../exceptions/AiraloException");
const API_CONSTANTS = require("../constants/ApiConstants");

class PackagesService {
  constructor(config, httpClient, accessToken) {
    if (!accessToken) {
      throw new AiraloException(
        "Invalid access token please check your credentials",
      );
    }

    this.accessToken = accessToken;
    this.config = config;
    this.baseUrl = this.config.getUrl();
    this.httpClient = httpClient;
  }

  async getPackages(params = {}) {
    const url = this.buildUrl(params);

    try {
      const result = await Cached.get(
        async () => {
          let currentPage = params.page ?? 1;
          const result = { data: [] };

          while (true) {
            const pageUrl = currentPage ? `${url}&page=${currentPage}` : url;

            const response = await this.httpClient
              .setHeaders([`Authorization: Bearer ${this.accessToken}`])
              .get(pageUrl);

            if (!response?.data || response.data.length === 0) {
              break;
            }

            result.data = [...result.data, ...response.data];

            if (params.limit && result.data.length >= params.limit) {
              result.data = result.data.slice(0, params.limit);
              break;
            }

            if (response.meta?.last_page === currentPage) {
              break;
            }

            currentPage++;
          }

          return params.flat ? this.flatten(result) : result;
        },
        this.getKey(url, params),
      );

      return result?.data?.length ? result : null;
    } catch (error) {
      throw new AiraloException(`Failed to fetch packages: ${error.message}`);
    }
  }

  buildUrl(params = {}) {
    const url = `${this.baseUrl}${API_CONSTANTS.ENDPOINTS.PACKAGES}?`;
    const queryParams = {};

    queryParams.include = "topup";

    if (params.simOnly === true) {
      delete queryParams.include;
    }

    if (params.type === "local") {
      queryParams["filter[type]"] = "local";
    }

    if (params.type === "global") {
      queryParams["filter[type]"] = "global";
    }

    if (params.country) {
      queryParams["filter[country]"] = params.country;
    }

    if (params.limit && params.limit > 0) {
      queryParams.limit = params.limit;
    }

    const queryString = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");

    return url + queryString;
  }

  flatten(data) {
    const flattened = { data: [] };

    for (const each of data.data) {
      for (const operator of each.operators) {
        for (const pkg of operator.packages) {
          const countries = operator.countries.map(
            (country) => country.country_code,
          );

          flattened.data.push({
            package_id: pkg.id,
            slug: each.slug,
            type: pkg.type,
            price: pkg.price,
            net_price: pkg.net_price,
            amount: pkg.amount,
            day: pkg.day,
            is_unlimited: pkg.is_unlimited,
            title: pkg.title,
            data: pkg.data,
            short_info: pkg.short_info,
            voice: pkg.voice,
            text: pkg.text,
            plan_type: operator.plan_type,
            activation_policy: operator.activation_policy,
            operator: {
              title: operator.title,
              is_roaming: operator.is_roaming,
              info: operator.info,
            },
            countries,
            image: operator.image?.url || null,
            other_info: operator.other_info,
          });
        }
      }
    }

    return flattened;
  }

  getKey(url, params) {
    const cacheString =
      url +
      JSON.stringify(params) +
      JSON.stringify(this.config.getHttpHeaders()) +
      this.accessToken;

    return Crypt.md5(cacheString);
  }
}

module.exports = PackagesService;
