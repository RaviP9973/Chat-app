export const verifyToken = async (req, res, next) => {
    try {
        // Import auth dynamically to avoid circular dependency
        const { auth } = await import("../config/auth.js");
        
        // Get the session from better-auth
        console.log("=== Auth Middleware Debug ===");
        console.log("Request URL:", req.url);
        console.log("Request method:", req.method);
        console.log("Cookies:", req.cookies);
        console.log("Authorization header:", req.headers.authorization);
        
        const session = await auth.api.getSession({
            headers: req.headers
        });

        console.log("Session result:", JSON.stringify(session, null, 2));

        if (!session || !session.user) {
            return res.status(401).json({ 
                error: "You are not authorized",
                authenticated: false 
            });
        }

        // Attach user info to request for downstream controllers
        req.userId = session.user.id;
        req.user = session.user;
        
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(403).json({ 
            error: "Token is not valid",
            authenticated: false 
        });
    }
}