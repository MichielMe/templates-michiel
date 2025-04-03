import React, { useState } from "react";

/**
 * Comprehensive Form Component
 *
 * A form component with various input types using DaisyUI components.
 * Easily customizable and modular.
 *
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.onSubmit - Function to call on form submission
 * @param {string} props.title - Form title
 * @param {string} props.submitText - Text for the submit button
 * @param {boolean} props.loading - Whether the form is in a loading state
 * @returns {React.ReactElement} Form component
 */
function Form({
  initialData = {},
  onSubmit,
  title = "Data Form",
  submitText = "Submit",
  loading = false,
}) {
  // Default form structure with all possible fields
  const defaultFormData = {
    textInput: "",
    email: "",
    password: "",
    textarea: "",
    checkbox: false,
    toggle: false,
    radio: "",
    select: "",
    range: 50,
    number: 0,
    date: "",
    time: "",
    color: "#000000",
    file: null,
    tags: [],
    ...initialData,
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState("");

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    let newValue = value;
    if (type === "checkbox") newValue = checked;
    else if (type === "file") newValue = files[0];
    else if (type === "number") newValue = parseFloat(value) || 0;

    setFormData({ ...formData, [name]: newValue });

    // Clear error for this field when changed
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle tag input
  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation example
    const newErrors = {};
    if (!formData.textInput) newErrors.textInput = "This field is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call the onSubmit callback with the form data
    if (onSubmit) onSubmit(formData);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{title}</h2>

        <form onSubmit={handleSubmit}>
          {/* Text Input */}
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Text Input</span>
            </label>
            <input
              type="text"
              name="textInput"
              value={formData.textInput}
              className={`input input-bordered w-full ${
                errors.textInput ? "input-error" : ""
              }`}
              onChange={handleInputChange}
              placeholder="Enter text"
            />
            {errors.textInput && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.textInput}
                </span>
              </label>
            )}
          </div>

          {/* Email Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className={`input input-bordered w-full ${
                errors.email ? "input-error" : ""
              }`}
              onChange={handleInputChange}
              placeholder="example@domain.com"
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.email}
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
              value={formData.password}
              className="input input-bordered w-full"
              onChange={handleInputChange}
              placeholder="Enter password"
            />
          </div>

          {/* Textarea */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Text Area</span>
            </label>
            <textarea
              name="textarea"
              value={formData.textarea}
              className="textarea textarea-bordered w-full"
              onChange={handleInputChange}
              placeholder="Enter longer text"
              rows={4}
            ></textarea>
          </div>

          {/* Number Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Number</span>
            </label>
            <input
              type="number"
              name="number"
              value={formData.number}
              className="input input-bordered w-full"
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          {/* Select Dropdown */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Select Option</span>
            </label>
            <select
              name="select"
              value={formData.select}
              className="select select-bordered w-full"
              onChange={handleInputChange}
            >
              <option value="" disabled>
                Select an option
              </option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>

          {/* Checkbox */}
          <div className="form-control mt-4">
            <label className="label cursor-pointer">
              <span className="label-text">Checkbox Option</span>
              <input
                type="checkbox"
                name="checkbox"
                checked={formData.checkbox}
                className="checkbox checkbox-primary"
                onChange={handleInputChange}
              />
            </label>
          </div>

          {/* Toggle */}
          <div className="form-control mt-4">
            <label className="label cursor-pointer">
              <span className="label-text">Toggle Option</span>
              <input
                type="checkbox"
                name="toggle"
                checked={formData.toggle}
                className="toggle toggle-primary"
                onChange={handleInputChange}
              />
            </label>
          </div>

          {/* Radio Buttons */}
          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Radio Options</span>
            </label>
            <div className="flex gap-4">
              <label className="label cursor-pointer">
                <span className="label-text mr-2">Option A</span>
                <input
                  type="radio"
                  name="radio"
                  value="optionA"
                  checked={formData.radio === "optionA"}
                  className="radio radio-primary"
                  onChange={handleInputChange}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-2">Option B</span>
                <input
                  type="radio"
                  name="radio"
                  value="optionB"
                  checked={formData.radio === "optionB"}
                  className="radio radio-primary"
                  onChange={handleInputChange}
                />
              </label>
              <label className="label cursor-pointer">
                <span className="label-text mr-2">Option C</span>
                <input
                  type="radio"
                  name="radio"
                  value="optionC"
                  checked={formData.radio === "optionC"}
                  className="radio radio-primary"
                  onChange={handleInputChange}
                />
              </label>
            </div>
          </div>

          {/* Range Slider */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Range Slider</span>
              <span className="label-text-alt">{formData.range}</span>
            </label>
            <input
              type="range"
              name="range"
              min="0"
              max="100"
              value={formData.range}
              className="range range-primary"
              onChange={handleInputChange}
            />
            <div className="w-full flex justify-between text-xs px-2">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* Date Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Date</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              className="input input-bordered w-full"
              onChange={handleInputChange}
            />
          </div>

          {/* Time Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Time</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              className="input input-bordered w-full"
              onChange={handleInputChange}
            />
          </div>

          {/* Color Picker */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Color</span>
            </label>
            <input
              type="color"
              name="color"
              value={formData.color}
              className="w-full h-10"
              onChange={handleInputChange}
            />
          </div>

          {/* File Upload */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">File Upload</span>
            </label>
            <input
              type="file"
              name="file"
              className="file-input file-input-bordered w-full"
              onChange={handleInputChange}
            />
          </div>

          {/* Tags Input */}
          <div className="form-control w-full mt-4">
            <label className="label">
              <span className="label-text">Tags (press Enter to add)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="badge badge-primary gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="btn btn-xs btn-circle btn-ghost"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              className="input input-bordered w-full"
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add a tag"
            />
          </div>

          {/* Fieldset */}
          <fieldset className="border rounded-lg p-4 mt-4">
            <legend className="px-2 text-sm font-medium">
              Additional Information
            </legend>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Option 1</span>
                <input type="checkbox" className="checkbox" />
              </label>
            </div>
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Option 2</span>
                <input type="checkbox" className="checkbox" />
              </label>
            </div>
          </fieldset>

          {/* Submit Button */}
          <div className="form-control mt-6">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Processing..." : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Form;
