import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import '../styles/auth.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useParams } from 'react-router-dom';

export default function Registration() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // Owner ID from /owner/:id if accessed by vet/admin

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isNew, setIsNew] = useState(true);

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

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  useEffect(() => {
    if (!user) return;

    const fetchOwnerData = async () => {
      try {
        const ownerId = id || user.userId; // Use param if vet/admin, else logged-in user

        const res = await axios.get(`/owners/${ownerId}`);
        const ownerData = res.data;

        // Authorization: allow if this is their own record OR vet/admin
        if (ownerData.user_id !== user.userId && !['vet', 'admin'].includes(user.role)) {
          setMessage('You are not authorized to edit this owner.');
          setLoading(false);
          setTimeout(() => navigate('/'), 2000);
          return;
        }

        setForm({
          user_id: ownerData.user_id || ownerId,
          first_name: ownerData.first_name || '',
          last_name: ownerData.last_name || '',
          emso: ownerData.emso || '',
          birth_date: formatDateForInput(ownerData.birth_date),
          email: ownerData.email || '',
          phone: ownerData.phone || '',
          address: ownerData.address || ''
        });
        setIsNew(false);
      } catch (err) {
        if (err.response?.status === 404) {
          setForm((prev) => ({ ...prev, user_id: id || user.userId }));
          setIsNew(true);
        } else {
          console.error('Error fetching owner data:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerData();
  }, [user, id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await axios.post('/owners', form);
        setMessage('Data added successfully!');
      } else {
        await axios.put(`/owners/${form.user_id}`, form);
        setMessage('Data updated successfully!');
      }

      // Redirect based on role
      if (user.role === 'vet') {
        navigate('/vet-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'owner') {
        navigate('/user-dashboard');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error saving owner.');
    }
  };

  if (loading) return <div>Loading form...</div>;

  const prettyLabel = (str) =>
    str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  return (
    <div className="form-container">
      <h2>{isNew ? 'Register Owner' : 'Edit Owner Info'}</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {(!message || isNew) && (
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
      )}
    </div>
  );
}
