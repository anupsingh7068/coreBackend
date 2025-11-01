import * as jwt from "jsonwebtoken";
import { config  } from "../config/config";

export interface IJWTPayload{
    id: string;
    email?: string;
    role?: string;
    [key: string] : any;
}


export class JWTService {

    private static instance: JWTService;
    public static getInstance(): JWTService{
        if(!JWTService.instance){
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }

    generateToken(payload: IJWTPayload,expiresIn: string = "24h"): string{
        return jwt.sign(payload,config.security.jwtSecret,{expiresIn});

    }

    verifyToken(token: string): IJWTPayload{
        return jwt.verify(token,config.security.jwtSecret) as IJWTPayload;
    }

    decodeToken(token: string): IJWTPayload | null {
        return jwt.decode(token) as IJWTPayload;
    }
}