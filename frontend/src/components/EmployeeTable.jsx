import { useEffect, useState } from "react";
import API from "../api/axios";

function EmployeeTable() {

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const response = await API.get("employees/");
      setEmployees(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      <h3>Employee List</h3>

      <table border="1">

        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>

          {employees.map((emp) => (
            <tr key={emp.employee_id}>
              <td>{emp.employee_id}</td>
              <td>{emp.username}</td>
              <td>{emp.email}</td>
              <td>{emp.role}</td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default EmployeeTable;
