// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, getUserById, loginUser } = require('../controllers/userController');

router.post('/register', createUser);
router.post('/login', loginUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

module.exports = router;
