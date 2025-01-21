const express = require('express');
const router = express.Router();
const {
    getTemporaryUsers,
    approveUser,
    registerUser,
    loginUser,
    rejectUser,
    getUserCounts,
    temporaryuserscount
} = require('../controllers/userController');

// Route for getting all temporary users
router.get('/registrations', getTemporaryUsers);

router.get('/count',getUserCounts)
// Route for approving a user (move to confirmed)
router.post('/approve/:id', approveUser);

// Route for user registration
router.post('/register', registerUser);

router.post('/reject/:id', rejectUser);

// Route for user login
router.post('/login', loginUser);
router.get('/temporaryuserscount',temporaryuserscount);

module.exports = router;
