import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';

export default function AnimalForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // pet id from /pet/:id
  const [isNew, setIsNew] = useState(true);

  const [originalUserId, setOriginalUserId] = useState(''); // store original owner

  const [form, setForm] = useState({
    nickname: '',
    microchip_number: '',
    species: '',
    breed: '',
    gender: '',
    birth_date: '',
    height: '',
    weight: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  useEffect(() => {
    if (!user) return;

    if (id) {
      axios.get(`/animals/${id}`)
        .then(res => {
          const pet = res.data;

          // Authorization check
          if (pet.user_id !== user?.userId && !['admin', 'vet'].includes(user?.role)) {
            setMessage('You are not authorized to edit this pet.');
            setLoading(false);
            setTimeout(() => navigate('/user-dashboard'), 2000);
            return;
          }

          // Populate form WITHOUT changing user_id
          setForm({
            nickname: pet.nickname || '',
            microchip_number: pet.microchip_number || '',
            species: pet.species || '',
            breed: pet.breed || '',
            gender: pet.gender || '',
            birth_date: formatDateForInput(pet.birth_date),
            height: pet.height || '',
            weight: pet.weight || ''
          });

          setOriginalUserId(pet.user_id); // save original owner
          setIsNew(false);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching pet data:', err);
          setMessage('Error fetching pet data.');
          setLoading(false);
          setTimeout(() => navigate('/dashboard'), 2000);
        });
    } else {
      setLoading(false);
    }
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // NEVER update user_id on edit
      const payload = {
  ...form,
  height: parseFloat(form.height),
  weight: parseFloat(form.weight)
};

// Only include user_id when creating a new animal
if (isNew) {
  payload.user_id = user?.userId;
}
      if (isNew) {
        await axios.post('/animals', payload);
        setMessage('Animal added successfully!');
      } else {
        await axios.put(`/animals/${id}`, payload);
        setMessage('Animal updated successfully!');
      }

      // Redirect
      if (user.role === 'vet') navigate('/vet-dashboard');
      else if (user.role === 'admin') navigate('/admin-dashboard');
      else navigate('/user-dashboard');

    } catch (err) {
      console.error(err);
      setMessage(isNew ? 'Error adding pet.' : 'Error updating pet.');
    }
  };

  const prettyLabel = (str) =>
    str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  if (loading) return <p>Loading...</p>;

  return (
    <div className="form-container">
      <h2>{isNew ? 'Add New Pet' : 'Edit Pet'}</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {(!message || isNew) && (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="nickname">{prettyLabel('nickname')}</label>
            <input
              id="nickname"
              name="nickname"
              placeholder="Nickname"
              value={form.nickname}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="microchip_number">{prettyLabel('microchip_number')}</label>
            <input
              id="microchip_number"
              name="microchip_number"
              placeholder="Microchip Number"
              value={form.microchip_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="species">{prettyLabel('species')}</label>
            <input
              id="species"
              name="species"
              placeholder="Species"
              value={form.species}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="breed">{prettyLabel('breed')}</label>
            <input
              id="breed"
              name="breed"
              placeholder="Breed"
              value={form.breed}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="gender">{prettyLabel('gender')}</label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="birth_date">{prettyLabel('birth_date')}</label>
            <input
              id="birth_date"
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="height">{prettyLabel('height')} (cm)</label>
            <input
              id="height"
              type="number"
              step="0.1"
              name="height"
              placeholder="Height (cm)"
              value={form.height}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="weight">{prettyLabel('weight')} (kg)</label>
            <input
              id="weight"
              type="number"
              step="0.1"
              name="weight"
              placeholder="Weight (kg)"
              value={form.weight}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit">{isNew ? 'Add Animal' : 'Update Animal'}</button>
        </form>
      )}
    </div>
  );
}
