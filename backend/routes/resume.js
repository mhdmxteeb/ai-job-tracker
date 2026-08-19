const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const { GoogleGenAI } = require('@google/genai');

const auth = require('../middleware/auth');
const Application = require('../models/Application');

// ============================================================
// MULTER SETUP
// ============================================================

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage
});

// ============================================================
// GEMINI INITIALIZATION
// ============================================================

let ai;

if (process.env.GEMINI_API_KEY) {
    try {
        ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        });

        console.log('Gemini AI client initialized successfully.');

    } catch (err) {
        console.error(
            'Google Gen AI client initialization failed:',
            err.message
        );
    }
} else {
    console.warn(
        'GEMINI_API_KEY is not configured. Resume analysis is unavailable.'
    );
}

// ============================================================
// GEMINI RESPONSE SCHEMA
// ============================================================

const gResponseSchema = {
    type: "OBJECT",

    properties: {

        ats_score: {
            type: "INTEGER"
        },

        keyword_match_percentage: {
            type: "INTEGER"
        },

        missing_keywords: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        technical_skill_gap: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        soft_skill_gap: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        resume_improvements: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        project_feedback: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        bullet_improvements: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        interview_questions: {
            type: "ARRAY",
            items: {
                type: "STRING"
            }
        },

        final_verdict: {
            type: "STRING"
        }
    },

    required: [
        "ats_score",
        "keyword_match_percentage",
        "missing_keywords",
        "technical_skill_gap",
        "soft_skill_gap",
        "resume_improvements",
        "project_feedback",
        "bullet_improvements",
        "interview_questions",
        "final_verdict"
    ]
};

// ============================================================
// SYSTEM PROMPT
// ============================================================

const SYSTEM_PROMPT = `
You are an expert career coach, ATS (Applicant Tracking System)
analyzer, and technical recruiter with 15+ years of experience
in hiring software engineers.

Your task is to analyze resumes and compare them against job descriptions.

Provide:

1. ATS compatibility score from 0 to 100.
2. Keyword match percentage from 0 to 100.
3. Missing keywords from the job description.
4. Technical skill gap analysis.
5. Soft skill gap analysis.
6. Resume formatting and content improvements.
7. Project improvement suggestions.
8. Bullet point enhancement suggestions.
9. Interview questions based on the target role.
10. A final professional verdict.

Important rules:

- Be specific and actionable.
- Do not invent skills that are not present in the resume.
- Compare the resume directly against the provided job description.
- Focus on skills relevant to the target role.
- Keep the response structured.
- Return only valid JSON according to the provided schema.
`;

// ============================================================
// HELPER FUNCTION
// ============================================================

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// ============================================================
// GEMINI REQUEST WITH RETRY
// ============================================================

async function generateGeminiResponse(analysisPrompt) {

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {

        try {

            console.log(
                `Gemini request attempt ${attempt}/${maxRetries}`
            );

            const response = await ai.models.generateContent({

                model: 'gemini-2.5-flash',

                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text: analysisPrompt
                            }
                        ]
                    }
                ],

                config: {

                    systemInstruction: SYSTEM_PROMPT,

                    responseMimeType: 'application/json',

                    responseSchema: gResponseSchema,

                    temperature: 0.2
                }
            });

            // Check for empty response

            if (!response || !response.text) {

                throw new Error(
                    'Gemini returned an empty response.'
                );
            }

            console.log(
                'Gemini response received successfully.'
            );

            return response.text;

        } catch (error) {

            console.error(
                `Gemini attempt ${attempt} failed:`,
                error.message
            );

            // Retry only temporary service errors

            if (
                error.status === 503 &&
                attempt < maxRetries
            ) {

                const delay = attempt * 3000;

                console.log(
                    `Gemini temporarily unavailable. Retrying in ${delay / 1000} seconds...`
                );

                await sleep(delay);

                continue;
            }

            // Retry rate-limit errors as well

            if (
                error.status === 429 &&
                attempt < maxRetries
            ) {

                const delay = attempt * 5000;

                console.log(
                    `Gemini rate limit reached. Retrying in ${delay / 1000} seconds...`
                );

                await sleep(delay);

                continue;
            }

            // No more retries

            throw error;
        }
    }

    throw new Error(
        'Gemini request failed after all retry attempts.'
    );
}

// ============================================================
// POST /api/resume/analyze
// ============================================================

// @route   POST api/resume/analyze
// @desc    Upload resume, parse, and analyze with Gemini
// @access  Private

router.post(
    '/analyze',
    auth,
    upload.single('resume'),

    async (req, res) => {

        try {

            // ==================================================
            // CHECK FILE
            // ==================================================

            if (!req.file) {

                return res.status(400).json({
                    msg: 'No resume file uploaded.'
                });
            }

            // ==================================================
            // GET FORM DATA
            // ==================================================

            const {
                company,
                role,
                jobDescription
            } = req.body;

            if (
                !company ||
                !role ||
                !jobDescription
            ) {

                return res.status(400).json({
                    msg: 'Please provide company, role, and job description.'
                });
            }

            // ==================================================
            // CHECK GEMINI
            // ==================================================

            if (!ai) {

                return res.status(503).json({
                    msg: 'Gemini AI is not configured. Please check GEMINI_API_KEY in your backend .env file.'
                });
            }

            // ==================================================
            // PARSE PDF
            // ==================================================

            let pdfData;

            try {

                pdfData = await pdfParse(
                    req.file.buffer
                );

            } catch (pdfError) {

                console.error(
                    'PDF parsing error:',
                    pdfError.message
                );

                return res.status(400).json({
                    msg: 'Unable to read the uploaded PDF.'
                });
            }

            const resumeText = pdfData.text;

            // ==================================================
            // CHECK RESUME TEXT
            // ==================================================

            if (
                !resumeText ||
                resumeText.trim().length === 0
            ) {

                return res.status(400).json({
                    msg: 'Could not extract text from the provided PDF.'
                });
            }

            console.log(
                `Resume text extracted: ${resumeText.length} characters`
            );

            // ==================================================
            // LIMIT VERY LARGE RESUMES
            // ==================================================

            const maxResumeLength = 30000;

            const cleanedResumeText =
                resumeText.length > maxResumeLength
                    ? resumeText.substring(
                        0,
                        maxResumeLength
                    )
                    : resumeText;

            // ==================================================
            // CREATE AI PROMPT
            // ==================================================

            const analysisPrompt = `

Analyze the following resume against the provided job description.

========================
RESUME
========================

${cleanedResumeText}

========================
TARGET JOB
========================

Company:
${company}

Role:
${role}

========================
JOB DESCRIPTION
========================

${jobDescription}

========================
ANALYSIS REQUIREMENTS
========================

Analyze the resume carefully.

Calculate:

1. ATS score from 0-100.
2. Keyword match percentage from 0-100.
3. Missing keywords.
4. Technical skill gaps.
5. Soft skill gaps.
6. Resume improvement suggestions.
7. Project feedback.
8. Bullet point improvement suggestions.
9. Interview questions.
10. Final verdict.

Return ONLY JSON matching the provided schema.

Do not add markdown.
Do not add explanations outside JSON.

`;

            // ==================================================
            // CALL GEMINI
            // ==================================================

            let responseText;

            try {

                responseText =
                    await generateGeminiResponse(
                        analysisPrompt
                    );

            } catch (apiError) {

                console.error(
                    'Gemini API Error:',
                    apiError
                );

                // 503 - temporary unavailable

                if (apiError.status === 503) {

                    return res.status(503).json({
                        msg: 'Gemini is temporarily unavailable because of high demand. Please try again in a few seconds.'
                    });
                }

                // 429 - rate limit

                if (apiError.status === 429) {

                    return res.status(429).json({
                        msg: 'Gemini API rate limit reached. Please try again shortly.'
                    });
                }

                // 401 / 403 - API key issue

                if (
                    apiError.status === 401 ||
                    apiError.status === 403
                ) {

                    return res.status(apiError.status).json({
                        msg: 'Gemini API authentication failed. Please check your GEMINI_API_KEY.'
                    });
                }

                // Other Gemini errors

                return res.status(500).json({
                    msg: 'Error connecting to Gemini API.',
                    error: apiError.message
                });
            }

            // ==================================================
            // PARSE GEMINI JSON
            // ==================================================

            let analysisResult;

            try {

                analysisResult =
                    JSON.parse(responseText);

            } catch (jsonError) {

                console.error(
                    'Failed to parse Gemini JSON response:',
                    responseText
                );

                return res.status(500).json({
                    msg: 'Gemini returned an invalid analysis response.'
                });
            }

            // ==================================================
            // VALIDATE AI RESULT
            // ==================================================

            if (
                typeof analysisResult.ats_score !== 'number'
            ) {

                return res.status(500).json({
                    msg: 'Invalid ATS score returned by Gemini.'
                });
            }

            // ==================================================
            // CREATE APPLICATION
            // ==================================================

            const newApplication =
                new Application({

                    user: req.user.id,

                    company: company,

                    role: role,

                    jobDescription: jobDescription,

                    status: 'Applied',

                    atsScore:
                        analysisResult.ats_score,

                    keywordMatchPercentage:
                        analysisResult.keyword_match_percentage,

                    missingKeywords:
                        analysisResult.missing_keywords || [],

                    technicalSkillGap:
                        analysisResult.technical_skill_gap || [],

                    softSkillGap:
                        analysisResult.soft_skill_gap || [],

                    resumeImprovements:
                        analysisResult.resume_improvements || [],

                    projectFeedback:
                        analysisResult.project_feedback || [],

                    bulletImprovements:
                        analysisResult.bullet_improvements || [],

                    interviewQuestions:
                        analysisResult.interview_questions || [],

                    finalVerdict:
                        analysisResult.final_verdict || ''
                });

            // ==================================================
            // SAVE TO MONGODB
            // ==================================================

            if (
                mongoose.connection.readyState === 1
            ) {

                await newApplication.save();

                console.log(
                    'Resume analysis saved to MongoDB.'
                );

            } else {

                console.warn(
                    'MongoDB is not connected. Analysis will not be saved.'
                );
            }

            // ==================================================
            // SEND RESPONSE TO FRONTEND
            // ==================================================

            return res.json(
                newApplication
            );

        } catch (error) {

            console.error(
                'Resume analysis server error:',
                error
            );

            return res.status(500).json({
                msg: 'Server error while analyzing resume.',
                error: error.message
            });
        }
    }
);

// ============================================================
// GET /api/resume/applications
// ============================================================

// @route   GET api/resume/applications
// @desc    Get all applications for current user
// @access  Private

router.get(
    '/applications',
    auth,

    async (req, res) => {

        try {

            // ==================================================
            // CHECK MONGODB
            // ==================================================

            if (
                mongoose.connection.readyState !== 1
            ) {

                return res.status(503).json({
                    msg: 'Database not connected yet.'
                });
            }

            // ==================================================
            // GET APPLICATIONS
            // ==================================================

            const applications =
                await Application
                    .find({
                        user: req.user.id
                    })
                    .sort({
                        dateApplied: -1
                    });

            return res.json(
                applications
            );

        } catch (error) {

            console.error(
                'Application fetch error:',
                error.message
            );

            return res.status(500).json({
                msg: 'Server error while fetching applications.'
            });
        }
    }
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;