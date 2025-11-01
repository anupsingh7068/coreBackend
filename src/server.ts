import app from "./app";
import { CacheService, CacheService } from "./core/cache/cache";
import { SecretsManager} from "./core/security/secretManager";
import { Logger } from "./core/logger/logger";
import * as dotenv from "dotenv";

dotenv.config();
const logger = Logger.getInstance();
const PORT = process.env.PORT || 3000;
const enableAWS = process.env.AWS_SECRET_MANAGER_ENABLED || "0";


async fuction startApp(){
try{
    //load aws secrets if enabled
    if(enableAWS!=="0"){
        logger.info("Loading configuration from AWS...");
        const secretManager = new SecretsManager();
        await secretManager.loadConfig();
        logger.success("AWS configuration loaded");
    }
    // initialize cache service
    logger.info("initializing cache service...");
    const cacheService = CacheService.getInstance();
    await cacheService.set("server_statup", new Date().toISOString(),60);
    logger.success("cache service initialized");

// start server
app.lister(PORT,() => {
    logger.success( ` server is running on port ${PORT} at ${process.env.NODE_ENV} environment`);
    logger.info(` Health checkt http://localhost: ${PORT}/api/health`);
    logger.info(`API Base: http://localhost:${PORT}/api/v1`);
});

} catch (error){
    logger.error("failed to start server:", error);
    process.exit(1);
}
}

// graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received , shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    Logger.INFO('SIGINT received, shutting down gracefully');
    process.exit(0);
});
startAPP();
