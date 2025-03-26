const jwt = require('jsonwebtoken')
const getToken = require("./get-token");

// middleware to validate token 

const checkToken = (req,res,next) =>{
    const authHeader =  req.headers.authorization

    if(!authHeader){
        res.status(401).json({message: "Acesso Negado! "})
    }
    const token = getToken(req)
    if(!token){
        res.status(401).json({message: "Acesso Negado! "})
    }
    try {
        const verifyToken = jwt.verify(token, 'nosssosrcret')
        req.user = verifyToken 
        next()
    } catch (error) {
        res.status(400).json({message: "Token inválido "})

    }
}

module.exports = checkToken