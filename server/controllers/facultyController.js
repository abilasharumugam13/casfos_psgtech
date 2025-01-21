const Faculty = require('../model/faculty');
const ConfirmedFaculty = require('../model/ConfirmedFaculty');

// Save a new faculty
const saveFaculty = async (req, res) => {
  const { facultyType, ...facultyData } = req.body;
  console.log(req.body);
  try {
    const newFaculty = new Faculty({ facultyType, ...facultyData.facultyData });
    await newFaculty.save();
    res.status(201).send({ success: true, message: 'Faculty saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: 'Error saving faculty data' });
  }
};

const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve a faculty
const approveFaculty = async (req, res) => {
  const { id } = req.params;
  try {
    const faculty = await Faculty.findById(id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
    // Move faculty to confirmedFaculties collection
    const confirmedFaculty = new ConfirmedFaculty({ ...faculty._doc });
    await confirmedFaculty.save();
    // Remove faculty from pending
    await Faculty.findByIdAndDelete(id);
    res.json({ message: 'Faculty approved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// controllers/facultyController.js

// Fetch filtered faculty details
const getFilteredFaculty = async (req, res) => {
  try {
    const {
      facultyType,
      name,
      yearOfAllotment,
      emailId,
      domainKnowledge,
      areaOfExpertise,
      institution,
    } = req.body;

    // Build a dynamic query object
    const query = {};

    if (facultyType) query.facultyType = {$regex: facultyType, $options:"i"};
    if (name) query.name = { $regex: name, $options: "i" }; // Case-insensitive search
    if (yearOfAllotment) query.yearOfAllotment = yearOfAllotment;
    if (emailId) query.emailId = { $regex: emailId, $options: "i" };
    if (domainKnowledge) query.domainKnowledge = { $regex: domainKnowledge, $options: "i" };
    if (areaOfExpertise) query.areaOfExpertise = { $regex: areaOfExpertise, $options: "i" };
    if (institution) query.institution = { $regex: institution, $options: "i" };

    // Fetch faculty data based on the query
    const faculties = await ConfirmedFaculty.find(query);

    if (faculties.length === 0) {
      return res.status(404).json({ message: "No matching records found." });
    }

    res.status(200).json(faculties);
  } catch (error) {
    console.error("Error fetching faculty details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getFacultyEntriesByMonth = async (req, res) => {
  try {
    const faculties = await ConfirmedFaculty.find({});
    const internalCounts = Array(12).fill(0);
    const externalCounts = Array(12).fill(0);
    faculties.forEach((faculty) => {
      const month = new Date(faculty.joined).getUTCMonth(); // Extract month
      if (faculty.facultyType === 'internal') {
        internalCounts[month]++;
      } else if (faculty.facultyType === 'external') {
        externalCounts[month]++;
      }
    });

    res.json({
      labels: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      internal: internalCounts,
      external: externalCounts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching faculty data.' });
  }
};


// Export all functions as an object
module.exports = {
  saveFaculty,
  getAllFaculties,
  approveFaculty,
  getFilteredFaculty,
  getFacultyEntriesByMonth,
};
