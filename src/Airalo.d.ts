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

    export interface OrderResponse {
        id: number;
        code: string;
        package_id: string;
        currency: string;
        quantity: number;
        type: string;
        description: string;
        esim_type: string;
        validity: number;
        package: string | null;
        data: string;
        price: number;
        text: string | null,
        voice: string | null,
        net_price: number | null
        created_at: string;
        manual_installation: string;
        qrcode_installation: string;
        installation_guides: string;
    }

    export interface CreateTopupResponse {
        data: OrderResponse;
        meta?: {
            message: string;
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

    export interface OrderPayload {
        package_id: string;
        quantity: number;
        type: string;
        description?: string;
        webhook_url?: string;
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


    export class TopupService {
        constructor(config: AiraloConfig, httpClient: HttpClient, signature: Signature, accessToken: string);
        createTopup(params: {
            packageId: string;
            iccid: string;
            description?: string | null;
        }): Promise<CreateTopupResponse>;
    }

    export class OAuthService {
        constructor(config: AiraloConfig, httpClient: HttpClient, signature: Signature);
        getAccessToken(): Promise<string>;
    }

    export interface EsimCloudShare {
        to_email: string;
        sharing_option: ('link' | 'pdf')[];
        copy_address?: string[];
    }

    export interface OrderResponse {
        data: {
            id: number;
            code: string;
            currency: string;
            package_id: string;
            quantity: number;
            type: string;
            description: string;
            esim_type: string;
            validity: number;
            package: string;
            data: string;
            price: number;
            created_at: string;
            manual_installation: string;
            qrcode_installation: string;
            installation_guides: Record<string, string>;
            text: string | null;
            voice: string | null;
            net_price: number;
            sims: Array<{
                id: number;
                created_at: string;
                iccid: string;
                lpa: string;
                imsis: any;
                matching_id: string;
                qrcode: string;
                qrcode_url: string;
                airalo_code: string | null;
                apn_type: string;
                apn_value: string | null;
                is_roaming: boolean;
                confirmation_code: string | null;
                apn: {
                    ios: {
                        apn_type: string;
                        apn_value: string | null;
                    };
                    android: {
                        apn_type: string;
                        apn_value: string | null;
                    };
                };
                msisdn: string | null;
            }>;
        };
        meta: {
            message: string;
        };
    }

    export interface AsyncOrderResponse {
        data: {
            request_id: string;
            accepted_at: string;
        };
        meta: {
            message: string;
        };
    }

    export class OrderService {
        constructor(
            config: AiraloConfig,
            httpClient: HttpClient,
            signature: Signature,
            accessToken: string
        );

        createOrder(payload: OrderPayload): Promise<OrderResponse>;
        createOrderWithEmailSimShare(payload: OrderPayload, esimCloud: EsimCloudShare): Promise<OrderResponse>;
        createOrderAsync(payload: OrderPayload): Promise<AsyncOrderResponse>;
        createOrderBulk(params: Record<string, number>, description?: string): Promise<Record<string, OrderResponse>>;
        createOrderBulkWithEmailSimShare(
            params: Record<string, number>,
            esimCloud: EsimCloudShare,
            description?: string
        ): Promise<Record<string, OrderResponse>>;
        createOrderAsyncBulk(
            params: Record<string, number>,
            webhookUrl?: string,
            description?: string
        ): Promise<Record<string, AsyncOrderResponse>>;

    export default class Airalo {
        constructor(config: AiraloConfig);
        initialize(): Promise<this>;

        getAllPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getSimPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getLocalPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getGlobalPackages(flat?: boolean, limit?: number | null, page?: number | null): Promise<PackageResponse | null>;
        getCountryPackages(countryCode: string, flat?: boolean, limit?: number | null): Promise<PackageResponse | null>;
        topup(packageId: string, iccid: string, description?: string): Promise <CreateTopupResponse | null>;

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