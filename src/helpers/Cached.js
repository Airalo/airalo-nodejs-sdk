const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const SDK_CONSTANTS = require('../constants/SdkConstants');

class Cached {
    static CACHE_KEY = SDK_CONSTANTS.CACHE.KEY;
    static TTL = SDK_CONSTANTS.CACHE.TTL;
    static cachePath = path.join(process.cwd(), '.cache');

    static async get(work, cacheName, ttl = 0) {
        await this.init();
        const id = this.getID(cacheName);

        try {
            // Try to get from cache
            const cacheFile = path.join(this.cachePath, id);

            try {
                const cacheData = await fs.readFile(cacheFile, 'utf8');
                const { data, expiresAt } = JSON.parse(cacheData);

                // Check if cache is still valid
                if (expiresAt > Date.now()) {
                    return data;
                }

                // Cache expired, delete it
                await fs.unlink(cacheFile);
            } catch (error) {
                // Cache miss or invalid cache
            }

            // Execute work function
            const result = typeof work === 'function' ?
                await work() :
                work;

            if (result) {
                // Store with expiration
                const cacheData = {
                    data: result,
                    expiresAt: Date.now() + (ttl || this.TTL) * 1000
                };

                await fs.writeFile(
                    cacheFile,
                    JSON.stringify(cacheData),
                    { mode: 0o777 }
                );
            }

            return result;
        } catch (error) {
            console.error('Cache error:', error);
            // On cache error, still return the work result
            return typeof work === 'function' ?
                await work() :
                work;
        }
    }

    static async clearCache() {
        try {
            await this.init();
            const files = await fs.readdir(this.cachePath);

            await Promise.all(
                files
                    .filter(file => file.startsWith(this.CACHE_KEY))
                    .map(file => fs.unlink(path.join(this.cachePath, file)))
            );
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    }

    static async init() {
        await fs.mkdir(this.cachePath, { recursive: true });
    }

    static getID(key) {
        return this.CACHE_KEY + crypto
            .createHash('md5')
            .update(key)
            .digest('hex');
    }
}

module.exports = Cached;