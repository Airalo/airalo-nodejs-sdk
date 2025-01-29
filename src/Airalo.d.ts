declare module 'airalo-sdk' {
    export interface AiraloConfig {
        client_id: string;
        client_secret: string;
        env?: 'sandbox' | 'production';
        http_headers?: Record<string, string>;
    }

    export interface HttpRequestOptions {
        method?: string;
        body?: any;
        headers?: Record<string, string>;
    }

    export interface PackageOperator {
        title: string;
        is_roaming: boolean;
        info: string[];
    }

    export interface Package {
        package_id: string;
        slug: string;
        type: string;
        price: number;
        net_price: number;
        amount: number;
        day: number;
        is_unlimited: boolean;
        title: string;
        data: string;
        short_info: string | null;
        voice: string | null;
        text: string | null;
        plan_type: string;
        activation_policy: string;
        operator: PackageOperator;
        countries: string[];
        image: string | null;
        other_info: any;
    }

    export interface PackageResponse {
        data: Package[];
        meta?: {
            message: string;
            last_page?: number;
        };
    }

    export class HttpClient {
        constructor(config: AiraloConfig);
        setHeaders(headers: string[]): this;
        setTimeout(timeout?: number): this;
        ignoreSSL(): this;
        request(url: string, options?: HttpRequestOptions): Promise<any>;
        get(url: string, params?: Record<string, any>): Promise<any>;
        post(url: string, params?: Record<string, any>): Promise<any>;
        head(url: string, params?: Record<string, any>): Promise<any>;
    }

    export class Signature {
        constructor(secret: string);
        getSignature(payload: any): string | null;
        checkSignature(hash: string | null, payload: any): boolean;
        private preparePayload(payload: any): string | null;
        private signData(
            payload: string,
            algo?: 'sha512' | string
        ): string;
    }

    export class Crypt {
        static encrypt(data: string, key: string): string;
        static decrypt(data: string, key: string): string;
        static isEncrypted(data: any): boolean;
        static md5(str: string): string;
    }

    export class Cached {
        static readonly CACHE_KEY: string;
        static readonly TTL: number;
        static readonly cachePath: string;

        static get<T>(
            work: (() => Promise<T>) | (() => T) | T,
            cacheName: string,
            ttl?: number
        ): Promise<T>;

        static clearCache(): Promise<void>;

        private static init(): Promise<void>;
        private static getID(key: string): string;
    }

    export class PackagesService {
        constructor(config: AiraloConfig, httpClient: HttpClient, accessToken: string);
        getPackages(params?: {
            flat?: boolean;
            limit?: number | null;
            page?: number | null;
            simOnly?: boolean;
            type?: 'local' | 'global';
            country?: string;
        }): Promise<PackageResponse | null>;
    }

    export class OAuthService {
        constructor(config: AiraloConfig, httpClient: HttpClient, signature: Signature);
        getAccessToken(): Promise<string>;
    }

    export default class Airalo {
        constructor(config: AiraloConfig);
        initialize(): Promise<this>;

        getAllPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getSimPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getLocalPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getGlobalPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getCountryPackages(countryCode: string, flat?: boolean, limit?: number | null): Promise<PackageResponse | null>;
    }
}