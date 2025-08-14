import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/form.css';

export default function VaccinationForm() {
  const navigate = useNavigate();
  const { animalId, vaxId } = useParams();

  const isEditMode = Boolean(vaxId);
  const isAddMode = Boolean(animalId);

  const [form, setForm] = useState({
    animal_id: '',
    vaccine_type: '',
    vaccine_name: '',
    vaccination_date: '',
    valid_until: ''
  });
  const [message, setMessage] = useState('');

  const formatDateForInput = (dateString) => dateString ? dateString.split('T')[0] : '';

  useEffect(() => {
    if (isEditMode) {
      // Fetch existing vaccination data for edit
      axios.get(`/vaccinations/vacc/${vaxId}`)
        .then(res => {
          const vax = res.data; // If backend wraps, might need res.data.data
          setForm({
            animal_id: vax.animal_id || '',
            vaccine_type: vax.vaccine_type || '',
            vaccine_name: vax.vaccine_name || '',
            vaccination_date: formatDateForInput(vax.vaccination_date),
            valid_until: formatDateForInput(vax.valid_until)
          });
        })
        .catch(err => console.error('Error fetching vaccination:', err));
    } else if (isAddMode) {
      // Pre-fill animal_id for adding
      setForm(prev => ({ ...prev, animal_id: animalId }));
    }
  }, [animalId, vaxId, isEditMode, isAddMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`/vaccinations/${vaxId}`, form);
        setMessage('✅ Vaccination updated successfully!');
      } else {
        await axios.post('/vaccinations', form);
        setMessage('✅ Vaccination added successfully!');
      }
      setTimeout(() => navigate('/vaccinations'), 1000);
    } catch (err) {
      console.error(err);
      setMessage(isEditMode ? '❌ Error updating vaccination.' : '❌ Error adding vaccination.');
    }
  };

  return (
    <div className="form-container">
      <h2>{isEditMode ? '✏️ Edit Vaccination' : '➕ Add Vaccination'}</h2>
      <form onSubmit={handleSubmit} className="vaccination-form">
        
        <div className="form-group">
          <label htmlFor="animal_id">Animal ID</label>
          <input
            type="number"
            id="animal_id"
            name="animal_id"
            value={form.animal_id}
            onChange={handleChange}
            required
            disabled // Always disabled in both modes
          />
        </div>

        <div className="form-group">
          <label htmlFor="vaccine_type">Vaccine Type</label>
          <input
            type="text"
            id="vaccine_type"
            name="vaccine_type"
            value={form.vaccine_type}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vaccine_name">Vaccine Name</label>
          <input
            type="text"
            id="vaccine_name"
            name="vaccine_name"
            value={form.vaccine_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="vaccination_date">Vaccination Date</label>
          <input
            type="date"
            id="vaccination_date"
            name="vaccination_date"
            value={form.vaccination_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="valid_until">Valid Until</label>
          <input
            type="date"
            id="valid_until"
            name="valid_until"
            value={form.valid_until}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn-submit">
          {isEditMode ? '💾 Save Changes' : '💾 Add Vaccination'}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}
