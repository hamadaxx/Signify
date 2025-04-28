const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// @route   GET /api/questions
// @desc    Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/questions
// @desc    Create a new question
router.post('/', async (req, res) => {
  try {
    const newQuestion = new Question({ text: req.body.text });
    await newQuestion.save();
    res.json(newQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   POST /api/questions/:id/like
// @desc    Like a question
router.post('/:id/like', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    question.likes += 1;
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/questions/:id/reply
// @desc    Reply to a question
router.post('/:id/reply', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    question.replies.push({ text: req.body.text });
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
