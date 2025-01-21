const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyType: { type: String, required: true },
  name: String,
  cadre: String,
  yearOfAllotment: String,
  rrSfsDate: Date,
  dateOfJoining: Date,
  dateOfRelieve: Date,
  dateOfBirth: Date,
  mobileNumber: String,
  communicationAddress: String,
  email: String,
  photograph: Object,
  ugDegree: String,
  pgDegree: String,
  phd: String,
  postDoctoral: String,
  presentPlaceOfWorking: String,
  domainKnowledge: String,
  areasOfExpertise: String,
  articlesPublications: String,
  readingMaterialPrepared: String,
  readingMaterialReleased: String,
  booksReleased: String,
  awardsReceived: String,
  inServiceTrainingHandled: String,
  coursesHandled: [{
    date: Date,
    sessionHandled: String,
    lectureName: String,
    feedbackRating: Number,
  }],
  toursAttended: [{
    tourName: String,
    fieldExerciseName: String,
    date: Date,
    place: String,
    batch: String,
    remarks: String,
    feedbackRating: Number,
  }],
  examiner: [{
    name: String,
    subject: String,
    date: Date,
    paperCorrected: String,
  }],
  institution: String, 
  joined: { type: Date, default: () => {
    // Get the current date in UTC
    let date = new Date();
    
    // Convert to IST (UTC+5:30)
    let istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC +5:30 hours
    let istDate = new Date(date.getTime() + istOffset);
    
    return istDate;
} }// Only for external faculty
});

module.exports = mongoose.model('ConfirmedFaculty', facultySchema);
