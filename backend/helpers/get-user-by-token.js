const jwt = require('jsonwebtoken')

const User = require('../model/User')

const getUserByToken =  async (token)=>{

    if(!token){
        return res.status(401).json({message: "Acesso Negado! "})
    }

    const decoded = jwt.verify(token, "nosssosrcret")

    const userId = decoded.id 

    const user = await User.findOne({_id :userId })

    return user
}

module.exports = getUserByToken