import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth";

function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 🔹 Dummy user and token
    const dummyToken = "dummy_access_token_12345";
    const dummyUser = {
      id: 1,
      name: "John Doe",
      email: "admin@gmail",
      password: "Admin@123",
    };

    // Compare credentials (email case-insensitive, password exact)
    const enteredEmail = (formData.email || "").trim().toLowerCase();
    const expectedEmail = (dummyUser.email || "").trim().toLowerCase();
    const enteredPassword = formData.password || "";

    if (enteredEmail === expectedEmail && enteredPassword === dummyUser.password) {
      // save in storage via useAuth
      login(dummyToken, dummyUser);

      // redirect to home page
      navigate("/");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  useEffect(() => {
    logout();
  }, []);

  return (
    <div
      className="flex items-center justify-center min-h-screen 
      bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-4"
    >
      {/* Login Card */}
      <div className="w-full max-w-md shadow-xl bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          {/* <img src={logo} alt="Logo" className="w-32" /> */}
          <h3 className="text-2xl font-bold text-gray-800">MoneyView SML</h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-gray-700">Password</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
            />
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition duration-200 shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
