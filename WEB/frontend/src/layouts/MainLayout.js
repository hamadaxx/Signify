import { Outlet } from 'react-router-dom';
import { useFirebase } from '../context/FirebaseContext';

const MainLayout = () => {
    const { currentUser, logout } = useFirebase();

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-2xl font-bold text-[#3151f9]">SIGNIFY</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            {currentUser ? (
                                <button
                                    onClick={logout}
                                    className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f95e54] hover:bg-[#f9bd04] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3151f9]"
                                >
                                    Sign Out
                                </button>
                            ) : (
                                <div className="flex space-x-4">
                                    <a
                                        href="/signin"
                                        className="text-gray-700 hover:text-[#3151f9] px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Sign In
                                    </a>
                                    <a
                                        href="/signup"
                                        className="text-gray-700 hover:text-[#3151f9] px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Sign Up
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout; 