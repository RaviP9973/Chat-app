import jwt from 'jsonwebtoken'

export const verifyToken = async(req,res,next) =>{
    // console.log("cookies here",req.cookies)
    const token = req.cookies.jwt;

    // console.log(token);
    if(!token) return res.status(401).send("You are not authorised ");
    jwt.verify(token,process.env.JWT_KEY, async(err,payload) => {
        if(err) return res.status(403).send("Token is not valid");

        req.userId = payload.userId;
        next();
    });


}