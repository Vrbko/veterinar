import React, { useState } from 'react';
import axios from '../api/axiosConfig';  // use the configured axios
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {jwtDecode} from 'jwt-decode';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();


const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/login', form);
    const { token } = response.data;
    if (token) {
      login(token);  // update context async
      
      // decode role directly from token
      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "vet") navigate("/vet-dashboard");
      else if (role === "owner") navigate("/user-dashboard");
      else navigate("/signup");
    }
  } catch (err) {
  if (err.response) {
    // Access the status code and the error message returned from backend JSON
    const status = err.response.status;               // e.g. 401
    const message = err.response.data.error || err.response.statusText;  // your backend sends error field
    setError(` ${message}`);
  } else {
    setError('An unexpected error occurred.');
  }
}
};

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}