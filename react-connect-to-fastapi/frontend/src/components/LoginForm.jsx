import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Login Form Component
 *
 * Handles user authentication through a login form
 */
function LoginForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const { login, loading, error } = useAuth();

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

    if (!formData.username) {
      errors.username = "Username is required";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.username, formData.password);
      // Login successful - call onSuccess if provided
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handling is done in the AuthContext
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Login</h2>

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
          {/* Username Input */}
          <div className="form-control w-full">
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
              placeholder="Enter username"
            />
            {formErrors.username && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.username}
                </span>
              </label>
            )}
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
              placeholder="Enter your password"
            />
            {formErrors.password && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.password}
                </span>
              </label>
            )}
          </div>

          {/* Helper text for default login */}
          <div className="mt-2 text-sm text-gray-500">
            <p>
              Default login: username <strong>admin</strong>, password{" "}
              <strong>Admin123!</strong>
            </p>
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginForm;
