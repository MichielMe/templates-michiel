import React, { useState, useEffect } from "react";
import { useItems } from "../context/ItemContext";

/**
 * Item Form Component
 *
 * Form for creating or editing items
 *
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data (for editing)
 * @param {Function} props.onSuccess - Function to call after successful submission
 * @param {string} props.mode - "create" or "edit" mode
 */
function ItemForm({ initialData = {}, onSuccess, mode = "create" }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    ...initialData,
  });

  const [formErrors, setFormErrors] = useState({});
  const { createItem, updateItem, loading, error } = useItems();

  // Update form if initialData changes (useful when editing)
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
      });
    }
  }, [initialData]);

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

    if (!formData.title || formData.title.trim() === "") {
      errors.title = "Title is required";
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
      if (mode === "create") {
        await createItem(formData);
      } else {
        await updateItem(initialData.id, formData);
      }

      // Reset form after successful creation
      if (mode === "create") {
        setFormData({
          title: "",
          description: "",
        });
      }

      // Call success callback if provided
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Item submission failed:", err);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">
          {mode === "create" ? "Create New Item" : "Edit Item"}
        </h2>

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
          {/* Title Input */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Title</span>
            </label>
            <input
              type="text"
              name="title"
              className={`input input-bordered w-full ${
                formErrors.title ? "input-error" : ""
              }`}
              value={formData.title}
              onChange={handleChange}
              placeholder="Item title"
            />
            {formErrors.title && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {formErrors.title}
                </span>
              </label>
            )}
          </div>

          {/* Description Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              name="description"
              className="textarea textarea-bordered w-full"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Item description (optional)"
              rows={4}
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                ? "Create Item"
                : "Update Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemForm;
