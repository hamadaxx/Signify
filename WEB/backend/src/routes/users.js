const express = require('express');
const router = express.Router();
const { admin, db } = require('../config/firebase');

// Get all users
router.get('/', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];

        usersSnapshot.forEach(doc => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const userDoc = await db.collection('users').doc(req.params.id).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            id: userDoc.id,
            ...userDoc.data()
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { name, email, role, photoURL } = req.body;
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (role) updateData.role = role;
        if (photoURL) updateData.photoURL = photoURL;

        await db.collection('users').doc(req.params.id).update(updateData);

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        // Delete from Firestore
        await db.collection('users').doc(req.params.id).delete();

        // Delete from Firebase Auth
        await admin.auth().deleteUser(req.params.id);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

module.exports = router; 