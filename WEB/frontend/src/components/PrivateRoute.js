import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';

const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useFirebase();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!currentUser) {
        return <Navigate to="/signin" />;
    }

    return children;
};

export default PrivateRoute; 