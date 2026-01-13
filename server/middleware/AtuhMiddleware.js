export const verifyToken = async (req, res, next) => {
    try {
        const { auth } = await import("../config/auth.js");
        
        const session = await auth.api.getSession({
            headers: req.headers
        });

        if (!session || !session.user) {
            return res.status(401).json({ 
                error: "You are not authorized",
                authenticated: false 
            });
        }

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