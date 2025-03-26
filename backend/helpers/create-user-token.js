const jwt = require("jsonwebtoken");

const createUserToken = async (user,  req, res) => {
  const token = jwt.sign(
    {
      name: user.name,
      id: user._id,
    },
    "nosssosrcret"
  );

  res
    .status(200)
    .json({ message: "Você está autenticado", token: token, UserId: user._id });
};

module.exports = createUserToken;
