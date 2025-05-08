const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  likes: { type: Number, default: 0 },
  replies: [
    {
      text: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Question', QuestionSchema);
