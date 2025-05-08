import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Hand } from "lucide-react";
import { useFirebase } from "../../context/FirebaseContext";

const SignUp = () => {
    const navigate = useNavigate();
    const { signup } = useFirebase();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            await signup(
                formData.email,
                formData.password,
                formData.firstName,
                formData.lastName
            );
            navigate('/signin');
        } catch (err) {
            setError(err.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#3151f9] overflow-hidden">
             {/* Background Elements - ASL Inspired */}
      <div className="absolute inset-0 flex justify-center items-center opacity-10">
        <Hand size={300} strokeWidth={0.4} className="text-white rotate-12" />
      </div>
      <div className="absolute top-10 left-10 w-28 h-28 bg-[#f95e54] opacity-40 rounded-full blur-2xl animate-bounce"></div>
      <div className="absolute bottom-16 right-20 w-36 h-36 bg-[#f9bd04] opacity-30 rounded-full blur-3xl animate-pulse"></div>

      {/* Sign-Up Card */}
      <div className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <h2 className="text-4xl font-extrabold text-center text-white drop-shadow-lg">
          Join <span className="text-[#f9bd04]">Signify</span>
        </h2>
        <p className="text-center text-gray-200 mb-6">Start learning ASL today!</p>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-100 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
              value={formData.password}
              onChange={handleChange}
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

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f9bd04] bg-transparent text-white placeholder-gray-300"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-4 flex items-center text-white"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                Signing Up...
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