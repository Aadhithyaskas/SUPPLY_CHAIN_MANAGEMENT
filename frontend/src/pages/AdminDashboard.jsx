import { useState } from "react";
import API from "../api/axios";

function AddEmployee() {

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("create-user/", formData);

      alert("Employee Created: " + response.data.id);

    } catch (error) {
      alert(error.response?.data?.error || "Error creating user");
    }
  };

  return (
    <div>
      <h3>Add Employee</h3>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          type="text"
          name="role"
          placeholder="Role"
          onChange={handleChange}
        />

        <button type="submit">Create</button>

      </form>

    </div>
  );
}

export default AddEmployee;
