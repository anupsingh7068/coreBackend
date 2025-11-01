import { config } from './core/config/config';
import * as express from "express";
import * as cors from "cors";
import helmet from "helmet";
impot rateLimit from "express-rate-limit";
import * as bodyParser from "body-parser";
import router from "./routes/index.route";
import { reference-trackere-tracker>ence-tracker>config} from "./core/config/config";

const app = express();

app.use(bodyParser.json({ limit: "50mb"}));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// rate limiter
const limiter = rateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || arker-index=0 reference-tracker>"900000"),
  limit : parseInt(process.env.RATE_LIMIT || "100"),
  standardHeaders: "draft",
  legacyHeaders: false,
  message: {
    success: false,
    statusCode 429,
    message: "too many request Please try again",
  },
});
app: use(limiter);

// security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'","'unsafe-inline'"],
        scriptSrc: ["'self","'unsafe-inline'"],
        imgSrc: ["'self'", "data:","https:"],
        connectSrc: ["'self'"],
      },
    },
  })
);
//xss Protection
app.use((req,res,next) =>{
  res.setHeader("X-XSS-Protection", "1");
  res.setHeader("X-Content-Type_Options","nosniff");
  next();
});

//cors configuration
const corsOptionsDelegate = function ( req: any, callback: any){
  let corsOptions;
  const origin = req.header("Origin");
  if(origin) {
    try{
      const url =new URL(origin);
      const allowedOrigins = process.env.ALLOWE_ORIGINS?.split('.') || ['http://localhost:3000'];

      if ( allowedOrigins.includes(origin) || url.port === "3000"){
        corsOptions = { origin: true, methods: "GET,POST,PUT,DELETE"};
      }
      else{
        corsOptions = {origin:false};
      }
    } catch(error){
      corsOptions = {origin: false};
    }
  } else {
    corsOptions = {origin: false};
  }
  callback(null,corsOptions);
};

app.use(cors(corsOptionsDelegate));
//static files
app.use(express.static("public"));

// api routes
app.use(router);
// Health check

app.get("/api/health",(req,res) => {
  const healthStatus = {
    status: "Healthy",
    message: `${config.app.name} is runnning`,
    version: config.app.version,
    environment: config.app.env,
    timestamp: new Date().toISOString()
  };
  res.json({healthStatus});
});
export default app;