import express from 'express';
import { getNote, createNote, updateNote, deleteNote } from '../controllers/notecontroller.js';
import { login, register, logout } from '../controllers/usercontroller.js';
import { verifyToken } from '../middleware/VerifyToken.js';
import { refreshToken } from '../controllers/RefreshToken.js';

const router = express.Router();

// CRUD NOTES
router.get('/notes', verifyToken, getNote);
router.post('/add-notes', verifyToken, createNote);
router.put('/update-notes/:id', verifyToken, updateNote);
router.delete('/delete-notes/:id', verifyToken, deleteNote);

// Endpoint user
router.get("/token", refreshToken);
router.post("/login", login);
router.post("/register", register);
router.get("/logout", logout);

export default router;