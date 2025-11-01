import * as crypto from "crypto";
import  * as bcrypt from "bcrypt";
import { config} from "../config/config";


export class CryptoService{
    private static instance: CryptoService;
    private algorithm = "aes-256-cbc";
    

    public static getInstance(): CryptoService{
        if(!CryptoService.instance){
            CryptoService.instance = new CryptoService();
        }
        return CryptoService.instance;
    }
   

    // generic encryption
    encrypt (text: string, key?:string): string{
        const secretKey = key || config.security.encryptionKey;
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm,Buffer.from(secretKey),iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return `${iv.toString("hex")}:${encrypted}`;
    }

    // generic decryption
    decrypt(encryptedText: string, key?: string): string {
        const secretKey = key || config.security.encryptionKey;
        const [ivHex, encrypted] = encryptedText.split(":");
        const iv = Buffer.from(ivHex,"hex");

        const decipher = crypto.createDecipheriv(this.algorithm,Buffer.from(secretKey,iv));
        let decrypted = decipher.update(encrypted,"hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;


    }

    // password hashing
    async hashPassword(password: string): Promise<string>{
        return bcrypt.hash(password,config.security.hashRounds);
    }
    
    // password verification
    async verifyPassword(password: string, hash: string): Promise<boolean>{
        return bcrypt.compare(password,hash);
    }

    // Generate random token
    generateToken(length:number = 32): string{
        return crypto.randomBytes(length).toString("hex");
    }

}