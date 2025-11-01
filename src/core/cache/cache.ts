import { cache } from './../middleware';
import Redis from "ioredis";
import { config } from "../config/config";
 export class CacheService {

    private static instance: CacheService;
    private client: Redis;

    private constructor() {
        this.client = new Redis({
            host: config.cache.host,
            port: config.cache.port,
        });
    }

    public static getInstance(): CacheService{
        if(!CacheService.instance){
            CacheService.instance = new CacheService();

        }
        return CacheService.instance;
    }

    async set(key: string, value: any, ttl?: number): Promise<boolean>{
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        const result = ttl
        ? await this.client.set(key,stringValue,"EX",ttl)
        : await this.client.set(key,stringValue);
        return result === "OK";
    }

    async get<T = any>(key: string): Promise<T| null>{
        const value = await this.client.get(key);
        if(!value) return null;
        try{
            return JSON.parse(value);

        }
        catch {
            return value as T;
        }
    }

    async delete(key: string): Promise<boolean>{
        const result = await this.client.del(key);
        return result > 0;
    }

    async exists(key: string): Promise<boolean> {
        const result = await this.client.exists(key);
        return result === 1;
    }
 }