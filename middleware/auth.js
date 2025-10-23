import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
    const authHeader=req.headers.authorization;
    console.log('Full Authorization header:', authHeader);
    
    if(authHeader){
        const parts = authHeader.split(' ');
        const token = (parts[1] || '').trim();
        if(!token){
            console.error('No token found after Bearer');
            return res.status(401).json({message:'No token provided'});
        }
        
        if(!process.env.JWT_SECRET){
            console.error('Secret key is not defined');
            return res.status(500).json({message:'Server Configuration error'});
        }
        
        jwt.verify(token, process.env.JWT_SECRET, (err, user)=>{
            if(err){
                console.error('JWT verification error:', err.message);
                return res.status(403).json({message:'Invalid token', error: err.message});
            }
            req.user=user;
            next();
        });
    }
    else{
        return res.status(401).json({message:'Authorization header missing'});
    }
};