import { MESSAGES } from './../config/constants';
import { IApiResponse } from './response';
import { Response} from "express";
import { HTTP_STATUS  } from "../config/constants";

export interface IApiResponse<T = any>{
    succss: boolean;
    message: string;
    data?: T;
    errors?:string[];
    meta?: { timestamp: string;
        version: string;
        [key: string]: any;
    };
    
}

export class ResponseService {
    static success<T>(
        res: Response,
        data?:T,
        message: string = "Success",
        statusCode: number = HTTP_STATUS.OK
    ): Response{
        cont response: IApiResponse<T> = {
            success: true,
            message,
            data,
            meta: { 
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            }
        };
        return res.status(statusCode).json(response);
    }
    
    static error(
        res: Response,
        message: string = " Error occurred",
        errors?: string[],
        statusCode: number = HTTP_STATUS.BAD_REQUEST
    ): Response{
        const response: IApiResponse = {
            succss: false,
            message,
            errors,
            meta: {
                timestamp: new Date().toISOString(),
                version: "1.0.0"
            }
            
        };
        return res.status(statusCode).json(response);
    }
}