import { AuthMiddleware } from './../middleware/auth';
import { Middleware } from './../interfaces';
import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationService } from "../validation/validator";


export interface IRouteDefinition {
    method: "get" | "post" | "delete" | "patch";
    path: string;
    handler: any;
    middleware?: any[];
    validation?: any;
    public?: boolean;
}

export class RouteManager {
    private router: Router;
    private AuthMiddleware = new AuthMiddleware();
    constructor() {
        this.router = Router();
    }
    registerRoutes(routes: IRouteDefinition[]): Router{
        routes.forEach(({method, path,handler, middleware = [],validation,public: isPublic}) => {
            const allMiddleware: any[] = [];

            // add validation if provided
         if (validation) {
            allMiddleware.push(ValidationService.validate(validation));
         }

         // add auth if not public 
         if(!isPublic){
            allMiddleware.push(this.AuthMiddleware.authenticate);
         }
         // add custom middleware
         allMiddleware.push(...middleware);
         //register route
         this.router[method](path, ...allMiddleware, handler);

        });
        return this.router;
    }
}