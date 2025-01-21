const express = require('express');
const facultyController = require('../controllers/facultyController');
const router = express.Router();

router.post('/save', facultyController.saveFaculty);

// Get all faculties pending approval
router.get('/getAllFaculties', facultyController.getAllFaculties);

// Approve a faculty (move to confirmed collection)
router.post('/approve/:id', facultyController.approveFaculty);

router.post("/filterFaculties", facultyController.getFilteredFaculty);
router.get('/monthly',facultyController.getFacultyEntriesByMonth);
module.exports = router;
