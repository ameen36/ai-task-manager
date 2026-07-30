import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await register(form);

    if (result.message) {
      setMessage("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setMessage(result.error || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <h1>Create Account</h1>

      <form onSubmit={handleSubmit} className="auth-form">

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">
          Register
        </button>

      </form>

      {message && <p>{message}</p>}

      <p>
        Already have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </p>

    </div>
  );
}

export default Register;