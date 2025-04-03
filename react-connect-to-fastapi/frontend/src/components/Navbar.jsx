import React from "react";

/**
 * Navbar Component
 *
 * A responsive navigation bar using DaisyUI components
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title/brand to display in the navbar
 * @param {Array} props.links - Array of link objects [{text: 'Home', href: '/', active: true, onClick: fn}, ...]
 * @param {React.ReactNode} props.endContent - Optional content to display at the end of the navbar
 * @returns {React.ReactElement} Navbar component
 */
function Navbar({ title = "App", links = [], endContent }) {
  return (
    <div className="navbar bg-base-200 shadow-md">
      {/* Navbar start - Brand/Logo section */}
      <div className="navbar-start">
        {/* Mobile menu (only visible on small screens) */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {links.map((link, index) => (
              <li key={index}>
                <a
                  href={link.href}
                  className={link.active ? "active" : ""}
                  onClick={(e) => {
                    if (link.onClick) {
                      e.preventDefault();
                      link.onClick();
                    }
                  }}
                >
                  {link.icon && <span>{link.icon}</span>}
                  {link.text}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Brand/Logo */}
        <a href="/" className="btn btn-ghost text-xl">
          {title}
        </a>
      </div>

      {/* Navbar center - Links section (desktop) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {links.map((link, index) => (
            <li key={index}>
              <a
                href={link.href}
                className={link.active ? "active" : ""}
                onClick={(e) => {
                  if (link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
              >
                {link.icon && <span>{link.icon}</span>}
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Navbar end - Additional content */}
      <div className="navbar-end">
        {endContent || (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img alt="Avatar" src="https://picsum.photos/200" />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a>Profile</a>
              </li>
              <li>
                <a>Settings</a>
              </li>
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
