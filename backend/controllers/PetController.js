const Pet = require("../model/Pet");
const getToken = require("../helpers/get-token");
const getUserByToken = require("../helpers/get-user-by-token");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = class PetController {
  static async create(req, res) {
    const { name, age, weigth, color } = req.body;
    const images = req.files;
    const available = true;
    // images upload
    // get pet owner

    const token = getToken(req);
    const user = await getUserByToken(token);
    // validations
    const requiredFields = {
      name: "O nome é obrigatório",
      age: "O idade é obrigatório",
      weigth: "O peso é obrigatório",
      color: "O color é obrigatório",
    };

    for (const field in requiredFields) {
      if (!req.body[field]) {
        res.status(422).json({ message: requiredFields[field] });
        return;
      }
    }
    if (!images || images.length === 0) {
      return res.status(422).json({ message: "A imagem é obrigatória" });
    }
    
    const pet = new Pet({
      name,
      age,
      weigth,
      color,
      available,
      images: [],
      user: {
        _id: user._id,
        name: user.name,
        image: user.image,
        phone: user.phone,
      },
    });

    images.map((image) => {
      pet.images.push(image.filename);
    });
    try {
      const newpet = await pet.save();
      res.status(201).json({ message: "pet cadastro com sucesso!", newpet });
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  static async getAll(req, res) {
    const pets = await Pet.find().sort("-createdAt");

    res.status(200).json({
      pets: pets,
    });
  }

  static async getAllUserPet(req, res) {
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "user._id": user._id }).sort("-createdAt");
    res.status(200).json({ pets });
  }

  static async getAllUserAdoptions(req, res) {
    //get user from token
    const token = getToken(req);
    const user = await getUserByToken(token);
    const pets = await Pet.find({ "adopter._id": user._id }).sort("-createdAt");
    res.status(200).json({ pets });
  }

  static async getPetByid(req, res) {
    const id = req.params.id;
    // check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido!!" });
      return;
    }
    // check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não contrado " });
    }
    res.status(200).json({ pet, pet });
  }
  static async removePetByID(req, res) {
    const id = req.params.id;
    // check if id is valid
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: "ID inválido!!" });
      return;
    }
    // check if pet exists
    const pet = await Pet.findOne({ _id: id });
    if (!pet) {
      res.status(404).json({ message: "Pet não contrado " });
      return;
    }

    // check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(404).json({
        message:
          "Houve um problema em processar a sua solicatação, tente novamente mais tarde!",
      });
      return;
    }

    await Pet.findByIdAndDelete(id);

    res.status(200).json({ messae: "Pet removido com sucesso! " });
  }
  static async updatePet(req, res) {
    const id = req.params.id;

    const { name, age, weigth, color, available } = req.body;

    console.log(req.body)
    const images = req.files;
    const updatedData = {};

    // check if pet exists
    const pet = await Pet.findOne({ _id: id });

    if (!pet) {
      res.status(404).json({ message: "Pet não contrado " });
      return;
    }
    // check if logged in user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (pet.user._id.toString() !== user._id.toString()) {
      res.status(404).json({
        message:
          "Houve um problema em processar a sua solicatação, tente novamente mais tarde!",
      });
      return;
    }

    //validations
    const requiredFields = {
      name: "O nome é obrigatório",
      age: "O idade é obrigatório",
      weigth: "O peso é obrigatório",
      color: "O color é obrigatório",
    };

    for (const field in requiredFields) {
      if (!req.body[field]) {
        res.status(422).json({ message: requiredFields[field] });
        return;
      }
      updatedData[field] = req.body[field];
    }

    if (images.length > 0 ) {
      updatedData.images = [];
      images.map((image) => {
        updatedData.images.push(image.filename);
      });
    }

    await Pet.findByIdAndUpdate(id, updatedData);
    res.status(200).json({ message: "Atualizado com sucesso" });
  }

  static async schedule(req, res) {
    const id = req.params.id;

    // check if pets exist

    const pet = await Pet.findById(id);

    if (!pet) {
      res.status(404).json({ message: "Pet não existe" });
    }

    //checl if user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);
    if (pet.user._id.equals(user._id)) {
      res.status(404).json({
        message: "Você não pode agenda uma visita com seu proprio pet",
      });
      return;
    }
    // check if user has already scheduled a visit
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(404).json({
          message: "Você já agendou uma visita para este pet!",
        });
        return;
      }
    }
    // add user to pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    };
    await Pet.findByIdAndUpdate(id, pet);
    res.status(200).json({ message: "Agendamento com sucesso" });
  }

  static async concludeAdoption(req, res) {
    const id = req.params.id;

    const pet = await Pet.findById(id);
    if (!pet) {
      res.status(404).json({ message: "Pet não existe" });
    }
    //checl if user registered the pet
    const token = getToken(req);
    const user = await getUserByToken(token);

    if (!pet.user._id.equals(user._id)) {
      res.status(404).json({
        message: "Você não pode concluir um pet que não é seu",
      });
      return;
    }
    pet.available = false;
    await Pet.findByIdAndUpdate(id, pet);
    res.status(200).json({
      message: "Parabéns! O cliclo de adoção foi finalizado com sucesso!",
    });
  }
};
