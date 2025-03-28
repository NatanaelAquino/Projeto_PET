const router = require("express").Router();

const PetController = require("../controllers/PetController");

const verifyToken = require("../helpers/verify-token");
const { imageUpload } = require("../helpers/image-upload");

router.post(
  "/create",
  verifyToken,
  imageUpload.array("images"),
  PetController.create
);
router.get("/", PetController.getAll);
router.get("/mypets", verifyToken, PetController.getAllUserPet);
router.get("/myadoptions", verifyToken, PetController.getAllUserAdoptions);
router.get("/:id", PetController.getPetByid);
router.delete("/:id", verifyToken, PetController.removePetByID);
router.patch(
  "/:id",
  verifyToken,
  imageUpload.array("images"),
  PetController.updatePet
); 


module.exports = router;
