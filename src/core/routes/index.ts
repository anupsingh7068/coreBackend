import { Router } from "express";
import { RouteManager } from "./routeManager";
 
// import module routes
import { authRoutes} from "../modules/auth/routes";
import { userRoutes} from "../modules/auth/routes";

const router = Router();
 const routeManager = new RouteManager();

 // version interface 
 interface IModuleRoutes{
    path: string;
    routes: any;
    version?: string;
 }

 //module configuration
 const moduleRoutes: IModuleRoutes[] = [
    {path: "/auth",
     routes: authRoutes,
     version: "v1"

    },
    {
        path: "/users",
        routes: userRoutes,
        version: "v1"
    }
 ];
 // register all module routes
 moduleRoutes.forEach(({path,routes,version = "v1"}) => {
    const moduleRouter =routeManager.registerRoutes(routes);
    router.use(`/api/${version}${path}`, moduleRouter);
    console.log(`module registerd: /api/${vesion}${path}`);

 });

 // health check
 router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toDateString(),
        version: "1.0.0"
    });
 });

 export default router;