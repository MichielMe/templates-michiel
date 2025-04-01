import "./App.css";
import Card from "./components/card";
import api from "./context/api";
import React, { useState, useEffect } from "react";

function App() {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({
    input01: "",
    input02: "",
    input03: "",
    boolean01: false,
  });

  const fetchData = async () => {
    const response = await api.get("/api/data");
    setData(response.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await api.post("/api/data", formData);
    fetchData();
    setFormData({
      input01: "",
      input02: "",
      input03: "",
      boolean01: false,
    });
  };

  return (
    <div className="hero min-h-screen bg-base-200 mx-auto">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <Card />
        </div>
      </div>
    </div>
  );
}

export default App;
