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

    export class SimService {
        constructor(config: AiraloConfig, httpClient: HttpClient, accessToken: string);
        simUsage(params: { iccid: string }): Promise<SimUsageResponse | null>;
        simUsageBulk(iccids: string[]): Promise<Record<string, SimUsageResponse> | null>;
        simTopups(params: { iccid: string }): Promise<SimTopupResponse | null>;
        simPackageHistory(params: { iccid: string }): Promise<SimPackageHistoryResponse | null>;
    }

    // ... other existing type definitions ...

    export default class Airalo {
        constructor(config: AiraloConfig);
        initialize(): Promise<this>;

        getAllPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getSimPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getLocalPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getGlobalPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getCountryPackages(countryCode: string, flat?: boolean, limit?: number | null): Promise<PackageResponse | null>;

        // New SIM-related methods
        getSimUsage(iccid: string): Promise<SimUsageResponse | null>;
        getSimUsageBulk(iccids: string[]): Promise<Record<string, SimUsageResponse> | null>;
        getSimTopups(iccid: string): Promise<SimTopupResponse | null>;
        getSimPackageHistory(iccid: string): Promise<SimPackageHistoryResponse | null>;
    }

    export class AiraloStatic {
        static init(config: AiraloConfig): Promise<void>;
        
        // New static SIM-related methods
        static getSimUsage(iccid: string): Promise<SimUsageResponse | null>;
        static getSimUsageBulk(iccids: string[]): Promise<Record<string, SimUsageResponse> | null>;
        static getSimTopups(iccid: string): Promise<SimTopupResponse | null>;
        static getSimPackageHistory(iccid: string): Promise<SimPackageHistoryResponse | null>;
    }
}