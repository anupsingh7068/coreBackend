import { validate } from './../middleware';
import * as Joi from "joi";
import { Request , Response, NextFunction } from "express";

export interface IValidationSchema {
    body?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    headers?: Joi.ObjectSchema;
}

export class ValidationService {
    static validate(schema: IValidationSchema){
        return (req: Request, res: Response, next: NextFunction) => {
            const validationOptions = {
                abortEarly: false,
                convert: true,
                stripUnknown: true
            };
             
            const errors: string[] = [];

            //validate each part of the request
            Object.keys(schema).forEach((key)=>{
                const { error }= schema[key as keyof IValidationSchema]!.validate(
                    req[key as keyof Request],
                    validationOptions
                );
             if (error) {
                errors.push(...error.details.map(detail => detail.message));
             }
            });
            if( errors.length >0){
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors
                });
            }
            next();
                };
            }

        }
