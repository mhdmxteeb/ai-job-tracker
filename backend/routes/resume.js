const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenAI } = require('@google/genai');
const auth = require('../middleware/auth');
const Application = require('../models/Application');

// Multer setup for memory storage (we just need the buffer to parse it)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini
// Assumes GEMINI_API_KEY is in .env or system env variables
let ai;
try {
    ai = new GoogleGenAI();
} catch (e) {
    console.log('Google Gen AI client init failed. Make sure GEMINI_API_KEY is defined.');
}

// Ensure the AI client will return robust JSON
const gResponseSchema = {
    type: "OBJECT",
    properties: {
        ats_score: { type: "INTEGER" },
        keyword_match_percentage: { type: "INTEGER" },
        missing_keywords: { type: "ARRAY", items: { type: "STRING" } },
        technical_skill_gap: { type: "ARRAY", items: { type: "STRING" } },
        soft_skill_gap: { type: "ARRAY", items: { type: "STRING" } },
        resume_improvements: { type: "ARRAY", items: { type: "STRING" } },
        project_feedback: { type: "ARRAY", items: { type: "STRING" } },
        bullet_improvements: { type: "ARRAY", items: { type: "STRING" } },
        interview_questions: { type: "ARRAY", items: { type: "STRING" } },
        final_verdict: { type: "STRING" }
    },
    required: ["ats_score", "keyword_match_percentage", "missing_keywords", "technical_skill_gap", "soft_skill_gap", "resume_improvements", "project_feedback", "bullet_improvements", "interview_questions", "final_verdict"]
};


// System Prompt as requested
const SYSTEM_PROMPT = `
You are an expert career coach, ATS (Applicant Tracking System) analyzer, and technical recruiter with 15+ years of experience in hiring software engineers.

Your task is to analyze resumes and compare them against job descriptions.

Provide:
1. ATS compatibility score (0-100)
2. Missing keywords
3. Skill gap analysis
4. Project improvement suggestions
5. Resume formatting improvements
6. Bullet point enhancement suggestions
7. Recommended skills to learn
8. Interview preparation tips based on the role

Be professional, specific, and actionable.
Keep feedback structured and easy to read.
`;

// @route   POST api/resume/analyze
// @desc    Upload resume, parse, and analyze with Gemini
// @access  Private
router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const { company, role, jobDescription } = req.body;

        if (!company || !role || !jobDescription) {
            return res.status(400).json({ msg: 'Please provide company, role, and job description.' });
        }

        // Parse PDF
        const pdfData = await pdfParse(req.file.buffer);
        const resumeText = pdfData.text;

        if (!resumeText) {
            return res.status(400).json({ msg: 'Could not extract text from the provided PDF.' });
        }

        // Call Gemini Model
        const analysisPrompt = `
Analyze the following resume:
[RESUME TEXT START]
${resumeText}
[RESUME TEXT END]

Target Job Role: ${role}
Job Description:
${jobDescription}

Compare the resume with the job description.
Return response in JSON format exactly structured as requested.
`;

        // We use gemini-2.5-flash as the recommended default model
        let responseText = '';
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        role: "user",
                        parts: [{ text: analysisPrompt }]
                    }
                ],
                config: {
                    systemInstruction: SYSTEM_PROMPT,
                    responseMimeType: 'application/json',
                    responseSchema: gResponseSchema,
                    temperature: 0.2
                }
            });

            if (response.text) {
                responseText = response.text;
            } else {
                throw new Error('Empty response from GenAI');
            }

        } catch (apiErr) {
            console.error('Gemini API Error:', apiErr);
            return res.status(500).json({ msg: 'Error connecting to Gemini API. Ensure GEMINI_API_KEY is correctly set in backend.' });
        }

        // Parse AI output
        let analysisResult;
        try {
            analysisResult = JSON.parse(responseText);
        } catch (err) {
            console.error('Failed to parse GenAI JSON response', responseText);
            return res.status(500).json({ msg: 'Failed to process AI response' });
        }

        // Save Application to DB
        const newApplication = new Application({
            user: req.user.id,
            company,
            role,
            jobDescription,
            status: 'Applied',
            atsScore: analysisResult.ats_score,
            keywordMatchPercentage: analysisResult.keyword_match_percentage,
            missingKeywords: analysisResult.missing_keywords,
            technicalSkillGap: analysisResult.technical_skill_gap,
            softSkillGap: analysisResult.soft_skill_gap,
            resumeImprovements: analysisResult.resume_improvements,
            projectFeedback: analysisResult.project_feedback,
            bulletImprovements: analysisResult.bullet_improvements,
            interviewQuestions: analysisResult.interview_questions,
            finalVerdict: analysisResult.final_verdict
        });

        // NOTE: Only save to DB if Mongo is actively connected
        if (mongoose.connection.readyState === 1) {
            await newApplication.save();
        }

        res.json(newApplication);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/resume/applications
// @desc    Get all applications for user
// @access  Private
router.get('/applications', auth, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({ msg: 'Database not connected yet.' });
        }
        const applications = await Application.find({ user: req.user.id }).sort({ dateApplied: -1 });
        res.json(applications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
