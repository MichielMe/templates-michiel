import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Register Form Component
 *
 * Handles user registration through a form
 */
function RegisterForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    full_name: "",
    password: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const { register, loading, error } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validate email
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    // Validate username
    if (!formData.username) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = "Username must be alphanumeric with - and _ allowed";
    }

    // Validate password
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else {
      // Check password complexity
      if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Password must contain at least one uppercase letter";
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = "Password must contain at least one lowercase letter";
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Password must contain at least one number";
      }
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Create user data object without confirmPassword
    const userData = {
      email: formData.email,
      username: formData.username,
      full_name: formData.full_name,
      password: formData.password,
    };

    try {
      await register(userData);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handling is done in the AuthContext
      console.error("Registration failed:", err);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Register</h2>

        {error && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              className={`input input-bordered w-full ${
                formErrors.email ? "input-error" : ""
              }`}
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
            {formErrors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.email}
                </span>
              </label>
            )}
          </div>

          {/* Username Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              name="username"
              className={`input input-bordered w-full ${
                formErrors.username ? "input-error" : ""
              }`}
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
            />
            {formErrors.username && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.username}
                </span>
              </label>
            )}
          </div>

          {/* Full Name Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Full Name (Optional)</span>
            </label>
            <input
              type="text"
              name="full_name"
              className="input input-bordered w-full"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          {/* Password Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              name="password"
              className={`input input-bordered w-full ${
                formErrors.password ? "input-error" : ""
              }`}
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a strong password"
            />
            {formErrors.password && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.password}
                </span>
              </label>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`input input-bordered w-full ${
                formErrors.confirmPassword ? "input-error" : ""
              }`}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
            />
            {formErrors.confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.confirmPassword}
                </span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;
