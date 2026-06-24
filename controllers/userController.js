const userService = require("../services/userService");

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userService.loginUser(email, password);
    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getAllUsers, getUserById, loginUser };
