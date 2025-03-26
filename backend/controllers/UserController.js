const createUserToken = require("../helpers/create-user-token");
const getUserByToken = require("../helpers/get-user-by-token");
const getToken = require("../helpers/get-token");
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmpassword } = req.body;

    // validations
    const requiredFields = {
      name: "O nome é obrigatório",
      email: "O email é obrigatório",
      phone: "O phone é obrigatório",
      password: "O password é obrigatório",
      confirmpassword: "O confirmpassword é obrigatório",
    };

    for (const field in requiredFields) {
      if (!req.body[field]) {
        res.status(422).json({ message: requiredFields[field] });
        return;
      }
    }
    if (password != confirmpassword) {
      res.status(422).json({ message: "requiredFields[field]" });
      return;
    }

    // check if user exists
    const UserExists = await User.findOne({ email: email });

    if (UserExists) {
      res.status(422).json({ message: "Por favor, utilize outro e-mail" });
      return;
    }

    // create a password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // create a user
    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    });

    try {
      const newUser = await user.save();
      await createUserToken(newUser, req, res);
      return;
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    const requiredFields = {
      email: "O email é obrigatório",
      password: "O password é obrigatório",
    };

    for (const field in requiredFields) {
      if (!req.body[field]) {
        res.status(422).json({ message: requiredFields[field] });
        return;
      }
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      res
        .status(422)
        .json({ message: "Não há usuário cadastro nesse e-mail " });
      return;
    }

    // checl if passworf match with db password
    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      res.status(422).json({ message: "Senha invalida " });
      return;
    }
    await createUserToken(user, req, res);
  }

  static async checkUser(req, res) {
    let currenUser;

    console.log(req.headers.authorization);

    if (req.headers.authorization) {
      const token = getToken(req);

      const decoded = jwt.verify(token, "nosssosrcret");

      currenUser = await User.findById(decoded.id);

      currenUser.password = undefined;
    } else {
      currenUser = null;
    }

    res.status(200).send(currenUser);
  }

  static async getUserByid(req, res) {
    const id = req.params.id;

    const user = await User.findById(id).select("-password");

    if (!user) {
      res.status(422).json({ message: "Usario não encontrado" });
      return;
    }

    res.status(200).json({ user });
  }

  static async editUser(req, res) {
    const id = req.params.id;

    // cheack if user exists
    const token = getToken(req);
    const user = await getUserByToken(token);

    //validations
    if (req.params.id.length !== 24) {
      res.status(400).json({ messege: "Usúario não enconstrado!" });
      return;
    }

    const { name, email, phone, password, confirmpassword } = req.body;

    let image = "";
    if (req.file){
      image = req.file.filename 
    }
    const requiredFields = {
      name: "O nome é obrigatório",
      email: "O email é obrigatório",
      phone: "O phone é obrigatório",
    };

    for (const field in requiredFields) {
      if (!req.body[field]) {
        res.status(422).json({ message: requiredFields[field] });
        return;
      }
      user[field] = req.body[field];
    }

    if (password != confirmpassword) {
      res.status(422).json({ messege: "Senha não conferem !" });
      return;
    } else if (password === confirmpassword && password != null) {
      // create a password
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      user.password = passwordHash;
    }
    // check if email has already taken
    const userExists = await User.findOne({ email }); 
    
    if (userExists && userExists._id.toString() !== user._id.toString()) {
      res.status(422).json({ message: "E-mail já existe!" });
      return;
    }
    
    user.email = email; 

    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );

      res.status(200).json({ message: "Usuario Atualizado ! " });
    } catch (error) {
      res.status(500).josn({ message: error });
      return;
    }
  }
};
