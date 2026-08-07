const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Applied', 'Interviewing', 'Offered', 'Rejected'],
        default: 'Applied'
    },
    dateApplied: {
        type: Date,
        default: Date.now
    },
    // AI Analysis Results
    atsScore: {
        type: Number,
    },
    keywordMatchPercentage: {
        type: Number,
    },
    missingKeywords: {
        type: [String],
        default: []
    },
    technicalSkillGap: {
        type: [String],
        default: []
    },
    softSkillGap: {
        type: [String],
        default: []
    },
    resumeImprovements: {
        type: [String],
        default: []
    },
    projectFeedback: {
        type: [String],
        default: []
    },
    bulletImprovements: {
        type: [String],
        default: []
    },
    interviewQuestions: {
        type: Array, // Array of mixed objects/strings
        default: []
    },
    finalVerdict: {
        type: String
    }
});

module.exports = mongoose.model('Application', ApplicationSchema);
