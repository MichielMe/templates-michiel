import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

/**
 * Auth Buttons Component
 *
 * Displays login/register or user info in the navbar
 */
function AuthButtons() {
  const { user, logout, isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Toggle login modal
  const toggleLoginModal = () => {
    setShowLoginModal(!showLoginModal);
    if (showRegisterModal) setShowRegisterModal(false);
  };

  // Toggle register modal
  const toggleRegisterModal = () => {
    setShowRegisterModal(!showRegisterModal);
    if (showLoginModal) setShowLoginModal(false);
  };

  // Close all modals
  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost">
            <div className="flex items-center gap-2">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-8">
                  <span>{user?.username?.charAt(0).toUpperCase() || "U"}</span>
                </div>
              </div>
              <span>{user?.username || "User"}</span>
            </div>
          </label>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a>Profile</a>
            </li>
            <li>
              <a>Settings</a>
            </li>
            <li>
              <a onClick={handleLogout}>Logout</a>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <button className="btn btn-ghost" onClick={toggleLoginModal}>
            Login
          </button>
          <button className="btn btn-primary" onClick={toggleRegisterModal}>
            Register
          </button>
        </>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closeModals}
            >
              ✕
            </button>
            <LoginForm onSuccess={closeModals} />
            <div className="text-center mt-4">
              <p className="text-sm">
                Don't have an account?{" "}
                <button
                  className="link link-primary"
                  onClick={toggleRegisterModal}
                >
                  Register
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={closeModals}
            >
              ✕
            </button>
            <RegisterForm onSuccess={toggleLoginModal} />
            <div className="text-center mt-4">
              <p className="text-sm">
                Already have an account?{" "}
                <button
                  className="link link-primary"
                  onClick={toggleLoginModal}
                >
                  Login
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthButtons;
