const ensureAuthenticated = (req,res,next)=>{
    const auth = req.headers['authorization'];
    if(!auth){
        return res.status(403)
        .json({message:'unauthorized,jwt token is required'});
    }
    try{
        const decoded = Jwt.verify(auth,process.env.jWT_SECRET);
        req.user = decoded;
        next();
    }catch (err){
        return res.status(403)
        .json({message:'unauthorized,jwt token wrong or expired'});
    }
}

module.exports = ensureAuthenticated;