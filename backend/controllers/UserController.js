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

    // Verifica se o ID é válido
    if (id.length !== 24) {
      return res.status(400).json({ message: "Usuário não encontrado!" });
    }

    // Recupera o usuário pelo token
    const token = getToken(req);
    const user = await getUserByToken(token);

    // Extrai dados do corpo da requisição
    const { name, email, phone, password, confirmpassword } = req.body;

    // Valida campos obrigatórios
    const requiredFields = {
      name: "O nome é obrigatório",
      email: "O email é obrigatório",
      phone: "O telefone é obrigatório",
    };

    for (const field in requiredFields) {
      if (!req.body[field]) {
        return res.status(422).json({ message: requiredFields[field] });
      }
      user[field] = req.body[field]; // Atualiza os campos do usuário
    }

    // Valida e atualiza a senha, se fornecida
    if (password && confirmpassword) {
      if (password !== confirmpassword) {
        return res.status(422).json({ message: "As senhas não conferem!" });
      } else {
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        user.password = passwordHash;
      }
    }

    // Verifica se o e-mail já está em uso por outro usuário
    const userExists = await User.findOne({ email });
    if (userExists && userExists._id.toString() !== user._id.toString()) {
      return res.status(422).json({ message: "E-mail já está em uso!" });
    }

    user.email = email;

    // Se houver imagem, atualiza o campo
    if (req.file) {
      user.image = req.file.filename;
    }
    console.log("Arquivo:", req.file);
    console.log("Corpo:", req.body);
    
    try {
      await User.findOneAndUpdate(
        { _id: user._id },
        { $set: user },
        { new: true }
      );
      console.log("Arquivo:", req.file);
      console.log("Corpo:", req.body);
      
      res.status(200).json({ message: "Usuário atualizado com sucesso!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};
