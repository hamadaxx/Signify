const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const { body, validationResult } = require('express-validator');

// Get all courses
router.get('/', async (req, res) => {
    try {
        const coursesSnapshot = await db.collection('courses').get();
        const courses = [];
        coursesSnapshot.forEach(doc => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        res.json(courses);
    } catch (error) {
        console.error('Error getting courses:', error);
        res.status(500).json({ message: 'Error getting courses' });
    }
});

// Get single course
router.get('/:id', async (req, res) => {
    try {
        const courseDoc = await db.collection('courses').doc(req.params.id).get();
        if (!courseDoc.exists) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ id: courseDoc.id, ...courseDoc.data() });
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({ message: 'Error getting course' });
    }
});

// Create course
router.post('/', [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('level').notEmpty(),
    body('duration').notEmpty(),
    body('price').isNumeric()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const courseData = {
            ...req.body,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const courseRef = await db.collection('courses').add(courseData);
        const courseDoc = await courseRef.get();

        res.status(201).json({
            id: courseDoc.id,
            ...courseDoc.data()
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Error creating course' });
    }
});

// Update course
router.put('/:id', async (req, res) => {
    try {
        const courseRef = db.collection('courses').doc(req.params.id);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const updateData = {
            ...req.body,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await courseRef.update(updateData);
        const updatedDoc = await courseRef.get();

        res.json({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Error updating course' });
    }
});

// Delete course
router.delete('/:id', async (req, res) => {
    try {
        const courseRef = db.collection('courses').doc(req.params.id);
        const courseDoc = await courseRef.get();

        if (!courseDoc.exists) {
            return res.status(404).json({ message: 'Course not found' });
        }

        await courseRef.delete();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course' });
    }
});

// Enroll in course
router.post('/:id/enroll', async (req, res) => {
    try {
        const { userId } = req.body;
        const courseRef = db.collection('courses').doc(req.params.id);
        const userRef = db.collection('users').doc(userId);

        const courseDoc = await courseRef.get();
        const userDoc = await userRef.get();

        if (!courseDoc.exists) {
            return res.status(404).json({ message: 'Course not found' });
        }
        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add course to user's enrolled courses
        await userRef.update({
            enrolledCourses: admin.firestore.FieldValue.arrayUnion(req.params.id)
        });

        // Add user to course's enrolled students
        await courseRef.update({
            enrolledStudents: admin.firestore.FieldValue.arrayUnion(userId)
        });

        res.json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ message: 'Error enrolling in course' });
    }
});

module.exports = router; 