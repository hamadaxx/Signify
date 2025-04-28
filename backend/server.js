const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' })); // Allow all origins for development

mongoose.connect("mongodb://127.0.0.1:27017/asl", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Database connected"))
  .catch(err => console.log("Database connection error:", err));

const QuestionSchema = new mongoose.Schema({
    text: String,
    likes: { type: Number, default: 0 },
    replies: [{ type: String }],
});

const Question = mongoose.model("Question", QuestionSchema);

// Fetch all questions
app.get("/questions", async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Fetch a specific question by ID
app.get("/questions/:id", async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (question) {
            res.json(question);
        } else {
            res.status(404).json({ message: "Question not found" });
        }
    } catch (error) {
        console.error('Error fetching question:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Post a new question
app.post("/post_question", async (req, res) => {
    try {
        const newQuestion = new Question({ text: req.body.text });
        await newQuestion.save();
        res.json({ message: "Question posted", question: newQuestion });
    } catch (error) {
        console.error('Error posting question:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Post a reply to a question
app.post("/reply/:id", async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (question) {
            question.replies.push(req.body.reply);
            await question.save();
            res.json({ message: "Reply added", question });
        } else {
            res.status(404).json({ message: "Question not found" });
        }
    } catch (error) {
        console.error('Error posting reply:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Like a question
app.post("/like/:id", async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (question) {
            question.likes += 1;
            await question.save();
            res.json({ message: "Question liked", question });
        } else {
            res.status(404).json({ message: "Question not found" });
        }
    } catch (error) {
        console.error('Error liking question:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start the server
app.listen(5000, () => {
    console.log("Server is running on http://192.168.1.6:5000");
});