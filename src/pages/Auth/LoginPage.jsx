import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../custom-hooks/useAuth";

function LoginPage() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

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
      password: "SuperCready@2026",
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
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password.trim();

    const foundUser = dummyUsers.find(
      (u) => u.email.toLowerCase() === email && u.password === password
    );

    if (foundUser) {
      const token = "dummy_token_" + foundUser.role;
      login(token, foundUser);
      if (foundUser.role === 'kb-admin') {
        navigate("/kb-success-leads");
      } else if (foundUser.role === 'kb-mumbai') {
        navigate("/kb-mumbai-success-leads");
      } else if (foundUser.role === 'kb-banglore') {
        navigate("/kb-banglore-success-leads");
      } else {
        navigate("/");
      }
    } else {
      setError("Invalid email or password");
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white w-96 p-6 rounded shadow-md space-y-4">
        <h2 className="text-2xl font-semibold">Login</h2>
        <input name="email" type="email" placeholder="Email" onChange={handleChange} value={formData.email} className="w-full p-2 border rounded"/>
        <input name="password" type="password" placeholder="Password" onChange={handleChange} value={formData.password} className="w-full p-2 border rounded"/>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" className="bg-indigo-600 w-full text-white p-2 rounded">Login</button>
      </form>
    </div>
  );
}

export default LoginPage;