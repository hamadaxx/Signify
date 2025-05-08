import React, { useEffect, useState } from 'react';
import { auth } from '../config/firebase';

const TestAuth = () => {
    const [status, setStatus] = useState('Testing...');
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            console.log("Auth object:", auth);
            console.log("Firebase SDK initialized:", !!auth);
            console.log("Current user:", auth.currentUser);

            setStatus('Firebase SDK initialized successfully!');
        } catch (err) {
            console.error("Error in Firebase initialization:", err);
            setError(err.message);
            setStatus('Firebase initialization failed');
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#3151f9]">
            <div className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <h1 className="text-2xl font-bold text-white mb-4">Firebase Authentication Test</h1>
                <p className="text-white mb-2">{status}</p>
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-100 text-sm">
                        {error}
                    </div>
                )}
                <pre className="bg-black/30 p-4 rounded mt-4 text-white text-xs overflow-auto max-h-40">
                    {JSON.stringify({
                        authInitialized: !!auth,
                        config: {
                            apiKey: '***' + (auth?.app?.options?.apiKey || '').substring(3),
                            projectId: auth?.app?.options?.projectId,
                            authDomain: auth?.app?.options?.authDomain
                        }
                    }, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default TestAuth; 