const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const SDK_CONSTANTS = require("../constants/SdkConstants");

class Cached {
  static CACHE_KEY = SDK_CONSTANTS.CACHE.KEY;
  static TTL = SDK_CONSTANTS.CACHE.TTL;
  static cachePath = path.join(process.cwd(), ".cache");
  static customCachePath = null;

  static setCachePath(path) {
    if (path) {
      this.customCachePath = path;
    }
  }

  static getCachePath() {
    // Priority: 1. Custom path set via setCachePath, 2. ENV variable, 3. Default
    return (
      this.customCachePath ||
      process.env.AIRALO_SDK_CACHE_PATH ||
      this.cachePath
    );
  }

  static async get(work, cacheName, ttl = 3600) {
    await this.init();
    const id = this.getID(cacheName);

    try {
      const cacheFile = path.join(this.getCachePath(), id);

      try {
        const cacheData = await fs.readFile(cacheFile, "utf8");
        const { data, expiresAt } = JSON.parse(cacheData);

        if (expiresAt > Date.now()) {
          return data;
        }

        await fs.unlink(cacheFile);
      } catch {
        // Cache miss or invalid cache
      }

      const result = typeof work === "function" ? await work() : work;

      if (result) {
        const cacheData = {
          data: result,
          expiresAt: Date.now() + (ttl || this.TTL) * 1000,
        };

        await fs.writeFile(cacheFile, JSON.stringify(cacheData), {
          mode: 0o777,
        });
      }

      return result;
    } catch {
      // On cache error, still return the work result
      return typeof work === "function" ? await work() : work;
    }
  }

  static async clearCache() {
    try {
      await this.init();
      const files = await fs.readdir(this.getCachePath());

      await Promise.all(
        files
          .filter((file) => file.startsWith(this.CACHE_KEY))
          .map((file) => fs.unlink(path.join(this.getCachePath(), file))),
      );
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  static async init() {
    await fs.mkdir(this.getCachePath(), { recursive: true });
  }

  static getID(key) {
    return this.CACHE_KEY + crypto.createHash("md5").update(key).digest("hex");
  }
}

module.exports = Cached;
