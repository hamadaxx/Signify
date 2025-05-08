const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');
const { body, validationResult } = require('express-validator');

// Register new user
router.post('/register', [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName } = req.body;

        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`
        });

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            firstName,
            lastName,
            email,
            role: 'user',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Create custom token
        const token = await admin.auth().createCustomToken(userRecord.uid);

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Verify the user exists in Firebase Auth
        const userRecord = await admin.auth().getUserByEmail(email);

        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        const userData = userDoc.data();

        // Create custom token
        const token = await admin.auth().createCustomToken(userRecord.uid);

        res.json({
            token,
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                role: userData.role
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        const userRecord = await admin.auth().getUser(decodedToken.uid);
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        res.json({
            user: {
                uid: userRecord.uid,
                email: userRecord.email,
                displayName: userRecord.displayName,
                ...userData
            }
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router; 