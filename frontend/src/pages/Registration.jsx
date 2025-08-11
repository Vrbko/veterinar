import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import '../styles/auth.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Registration() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(true);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0]; // YYYY-MM-DD
  };

  const [form, setForm] = useState({
    user_id: '',
    first_name: '',
    last_name: '',
    emso: '',
    birth_date: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        if (!user?.userId) return;

        const res = await axios.get(`/owners/${user.userId}`);
        if (res.data) {
          setForm({
            user_id: res.data.user_id || user.userId,
            first_name: res.data.first_name || '',
            last_name: res.data.last_name || '',
            emso: res.data.emso || '',
            birth_date: formatDateForInput(res.data.birth_date),
            email: res.data.email || '',
            phone: res.data.phone || '',
            address: res.data.address || ''
          });
          setIsNew(false);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setForm((prev) => ({ ...prev, user_id: user.userId }));
          setIsNew(true);
        } else {
          console.error('Error fetching owner data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await axios.post('/owners', form);
        setMessage('Data added successfully!');
      } else {
        await axios.put(`/owners/${user.userId}`, form);
        setMessage(
          <>
            Data updated successfully! <Link to="/dashboard">Go Back</Link>
          </>
        );
      }
    } catch (err) {
      console.error(err);
      setMessage('Error saving owner.');
    }
  };

  if (loading) return <div>Loading form...</div>;

  // Helper to prettify field names, e.g. "first_name" => "First Name"
  const prettyLabel = (str) =>
    str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div className="form-container">
      <h2>Owner Info</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(form)
          .filter((key) => key !== 'user_id')
          .map((key) => (
            <div key={key} className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor={key}>{prettyLabel(key)}</label>
              <input
                id={key}
                name={key}
                placeholder={prettyLabel(key)}
                type={key.includes('date') ? 'date' : 'text'}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        <button type="submit">{isNew ? 'Register' : 'Update'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
