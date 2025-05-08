import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Hand } from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useFirebase();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // First, login the user
      await login(email, password);

      // Then, get the user's role from Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role || 'user';

        // Redirect based on the role from Firestore
        if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        // If no user document exists, default to user role
        navigate('/user/dashboard');
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Invalid email or password. Please try again.");
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

      {/* Sign-In Card */}
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <h2 className="text-4xl font-extrabold text-center text-white drop-shadow-lg">
          Welcome to <span className="text-[#f9bd04]">Signify</span>
        </h2>
        <p className="text-center text-gray-200 mb-6">Sign in to explore interactive ASL learning!</p>

        {error && <p className="text-red-400 text-center">{error}</p>}

        <form onSubmit={handleSignIn} className="space-y-4">
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

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-[#f9bd04] text-[#3151f9] font-semibold py-2 rounded-lg hover:bg-[#f95e54] hover:text-white transition duration-300 shadow-lg flex justify-center"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full" viewBox="0 0 24 24"></svg>
                Signing In...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-gray-200 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#f9bd04] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
