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
  <div className="auth-container container py-5">
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <h2 className="mb-4 text-center">🔑 Login</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button type="submit" className="btn btn-primary w-100">
                Login
              </button>
            </form>

            <p className="mt-3 text-center">
              Don’t have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

}