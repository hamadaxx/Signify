import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Hand } from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { signup } = useFirebase();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password || !firstName || !lastName) {
            setError("Please fill in all fields");
            return;
        }

        setLoading(true);

        try {
            await signup(email, password, firstName, lastName);
            navigate("/signin");
        } catch (error) {
            console.error("Sign up error:", error);
            if (error.code === 'auth/email-already-in-use') {
                setError("Email is already in use");
            } else if (error.code === 'auth/invalid-email') {
                setError("Invalid email address");
            } else if (error.code === 'auth/weak-password') {
                setError("Password is too weak");
            } else if (error.code === 'auth/network-request-failed') {
                setError("Network error. Please check your connection.");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#3151f9] overflow-hidden">
            {/* Background Elements - ASL Inspired */}
            <div className="absolute inset-0 flex justify-center items-center opacity-10">
                <Hand size={300} strokeWidth={0.4} className="text-white -rotate-12" />
            </div>
            <div className="absolute top-10 left-10 w-28 h-28 bg-[#f95e54] opacity-40 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute bottom-16 right-20 w-36 h-36 bg-[#f9bd04] opacity-30 rounded-full blur-3xl animate-pulse"></div>

            {/* Sign-Up Card */}
            <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                <h2 className="text-4xl font-extrabold text-center text-white drop-shadow-lg">
                    Join <span className="text-[#f9bd04]">Signify</span>
                </h2>
                <p className="text-center text-gray-200 mb-6">Create your account to start learning ASL!</p>

                {error && <p className="text-red-400 text-center">{error}</p>}

                <form onSubmit={handleSignUp} className="space-y-4">
                    {/* First Name */}
                    <input
                        type="text"
                        placeholder="First Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                    />

                    {/* Last Name */}
                    <input
                        type="text"
                        placeholder="Last Name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {/* Password with toggle */}
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-4 flex items-center text-white"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Sign Up Button */}
                    <button
                        type="submit"
                        className="w-full bg-[#f9bd04] text-[#3151f9] font-semibold py-2 rounded-lg hover:bg-[#f95e54] hover:text-white transition duration-300 shadow-lg flex justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                                Creating Account...
                            </span>
                        ) : (
                            "Sign Up"
                        )}
                    </button>
                </form>

                {/* Sign In Link */}
                <p className="text-center text-gray-200 mt-4">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-[#f9bd04] font-semibold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp; 