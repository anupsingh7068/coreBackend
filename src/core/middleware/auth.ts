import { Request, Response, NextFunction } from "express";
import { JWTService } from "../security/jwt";
import { CacheService } from "../cache/cache";
import { ResponseService } from "../response/response";

export interface IAuthRequest extends Request {
    user?: any;
}

export class AuthMiddleware {
    private jwtService = JWTService.getInstance();
    private cacheService = CacheService.getInstance();

    authenticate = async ( req: IAuthRequest, res: Response,next: NextFunction) => {
        try{
            const token = req.headers.authorization?.split(" ")[1];
            if(!token){
                return ResponseService.error(res, "Token required", [],401);
            }
            const decoded = this.jwtService.verifyToken(token);

            // check if token is blacklisted
            const isBlacklisted == await this.cacheService.exists(`blacklist:${token}`);
            if ( isBlacklisted){
                return ResponseService.error(res,"Token is invalid", [],401);
            }
            req.user = decoded;
            next();
        }
        catch(error){
            return ResponseService.error(res,"Invalid token", [], 401);
        }
    };
    authorize = (roles: string []) => {
        return (req: IAuthRequest,res: Response,next: NextFunction) => {
            if(!req.user || !roles.includes(req.user.role)){
                return ResponseService.error(res,"Insufficient permission",[],403);
            }
            next();
        };
    };
}