import * as dotenv from "dotenv";
dotenv.config();


export interface IConfig{
    app: {
        name: string;
        version: string;
        port: number;
        env: string;
    };
    database: {
        host: string;
        port: number;
        name: string;
        user: string;
        password: string;
    };
    security:{
        jwtSecret: string;
        encryptionKey: string;
        hashRounds: number;
    };
    cache:{
        host: string;
        port: number;
        ttl: number;
    
    };
}

export const config: IConfig = {
    app: {
        name: process.env.APP_NAME ||  "Generic API",
        version: process.env.APP_VERSION || "1.0.0",
        port: parseInt(process.env.PORT || "3000"),
        env: process.env.NODE_ENV || "development"

    },
    database: {
        host: process.env.DB_HOST ||  "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        name:  process.env.DB_NAME || "app_db",
        user: process.env.DB_USER || "user",
        password: process.env.DB_PASSWORD || "password"

    },

        security: {
        jwtSecret: process.env.JWT_SECRET ||  "your-secret-key",
        encryptionKey: process.env.ENCRYPTION_KEY || "your-encryption-key",
        hashRounds: parseInt(process.env.HASH_ROUNDS || "12")

    },
    cache: {
        host: process.env.REDIS_HOST ||  "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        ttl: parseInt(process.env.CACHE_TTL || "3600")

    }

}