import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  const dummyUsers = [
    {
      id: 1,
      name: "Admin User",
      email: "admin@switchmyloan.in",
      password: "Cready@2026",
      role: "admin",
    },
    {
      id: 2,
      name: "Super Admin",
      email: "super@switchmyloan.in",
      password: "SuperrCready@2027",
      role: "super-admin",
    },
    {
      id: 3,
      name: "KB Admin",
      email: "kb@cready.in",
      password: "KBAdmin@2026",
      role: "kb-admin",
    },
    {
      id: 3,
      name: "KB Admin Mumbai",
      email: "kb-mumbai@cready.in",
      password: "KBadmin@2026",
      role: "kb-mumbai",
    },
    {
      id: 4,
      name: "KB Admin Banglore",
      email: "kb-banglore@cready.in",
      password: "KbBanglore@2026",
      role: "kb-banglore",
    },
    {
      id: 5,
      name: "MV Admin",
      email: "mvadmin@switchmyloan.in",
      password: "MVAdmin@2026",
      role: "mv-admin",
    },
    {
      id: 6,
      name: "MV Page",
      email: "mvpage@switchmyloan.in",
      password: "MVPage@2026",
      role: "mv-page",
    },
    {
      id: 7,
      name: "MV Page Admin",
      email: "creadypageadmin@switchmyloan.in",
      password: "CreadyPageAdmin@2026",
      role: "mv-page-admin",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleBlur = (e) => {
    setTouched({ ...touched, [e.target.name]: true });
  };

  const emailError =
    touched.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
      ? "Please enter a valid email address"
      : "";

  const passwordError =
    touched.password && !formData.password ? "Password is required" : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate network delay for a realistic feel
    await new Promise((r) => setTimeout(r, 800));

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    const foundUser = dummyUsers.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );

    if (foundUser) {
      const token = "dummy_token_" + foundUser.role;
      login(token, foundUser);
      if (foundUser.role === "kb-admin") {
        navigate("/kb-success-leads");
      } else if (foundUser.role === "kb-mumbai") {
        navigate("/kb-mumbai-success-leads");
      } else if (foundUser.role === "kb-banglore") {
        navigate("/kb-banglore-success-leads");
      } else if (foundUser.role === "mv-admin") {
        navigate("/mv-success-leads");
      } else if (foundUser.role === "mv-page") {
        navigate("/offer-leads");
      } else if (foundUser.role === "mv-page-admin") {
        navigate("/offer-leads-analytics");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neutral">Welcome Back</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in to continue</p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-error/10 border border-error/20 px-3 py-2.5 text-error text-sm animate-[shake_0.4s_ease-in-out]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                  emailError ? "border-error focus:ring-error/30 focus:border-error" : "border-gray-300"
                }`}
              />
            </div>
            {emailError && <p className="text-xs text-error">{emailError}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-12 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                  passwordError ? "border-error focus:ring-error/30 focus:border-error" : "border-gray-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            {passwordError && <p className="text-xs text-error">{passwordError}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;