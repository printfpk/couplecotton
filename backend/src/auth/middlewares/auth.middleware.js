import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';


import fs from 'fs';

async function authMiddleware(req, res, next) {
    fs.writeFileSync('auth_debug.log', JSON.stringify({
        headers: req.headers,
        cookies: req.cookies,
        body: req.body
    }, null, 2));

    let token = req.cookies.token;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.error("AuthMiddleware: No token found. req.cookies =", req.cookies);
        return res.status(401).json({ message: "Unauthorized: No token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = decoded

        req.user = user; // attach user info to request

        next();

    }
    catch (err) {
        console.error("AuthMiddleware: Token verification failed", err);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

}

export {
    authMiddleware
};
