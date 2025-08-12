import React, { useState, useEffect } from 'react';
import axios from '../api/axiosConfig';
import { useNavigate, useParams } from 'react-router-dom';

export default function VaccinationForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // vaccination id from /vaccinations/:id
  const [isNew, setIsNew] = useState(true);

  const [form, setForm] = useState({
    animal_id: '',
    vaccine_type: '',
    vaccine_name: '',
    vaccination_date: '',
    valid_until: ''
  });

  const [message, setMessage] = useState('');

  // Format date for input[type=date]
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return dateString.split('T')[0];
  };

  // Fetch existing vaccination if editing
  useEffect(() => {
    if (id) {
      axios.get(`/vaccinations/${id}`)
        .then(res => {
          const vax = res.data;
          setForm({
            animal_id: vax.animal_id || '',
            vaccine_type: vax.vaccine_type || '',
            vaccine_name: vax.vaccine_name || '',
            vaccination_date: formatDateForInput(vax.vaccination_date),
            valid_until: formatDateForInput(vax.valid_until)
          });
          setIsNew(false);
        })
        .catch(err => {
          console.error('Error fetching vaccination:', err);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNew) {
        await axios.post('/vaccinations', form);
        setMessage('Vaccination added successfully!');
      } else {
        await axios.put(`/vaccinations/${id}`, form);
        setMessage('Vaccination updated successfully!');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setMessage(isNew ? 'Error adding vaccination.' : 'Error updating vaccination.');
    }
  };

  return (
    <div className="form-container">
      <h2>{isNew ? 'Add Vaccination' : 'Edit Vaccination'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="animal_id">Animal ID</label>
        <input
          type="number"
          id="animal_id"
          name="animal_id"
          value={form.animal_id}
          onChange={handleChange}
          required
          disabled={!isNew}  // <-- disable if editing (not new)
        />

        <label htmlFor="vaccine_type">Vaccine Type</label>
        <input
          type="text"
          id="vaccine_type"
          name="vaccine_type"
          value={form.vaccine_type}
          onChange={handleChange}
          required
        />

        <label htmlFor="vaccine_name">Vaccine Name</label>
        <input
          type="text"
          id="vaccine_name"
          name="vaccine_name"
          value={form.vaccine_name}
          onChange={handleChange}
        />

        <label htmlFor="vaccination_date">Vaccination Date</label>
        <input
          type="date"
          id="vaccination_date"
          name="vaccination_date"
          value={form.vaccination_date}
          onChange={handleChange}
          required
        />

        <label htmlFor="valid_until">Valid Until</label>
        <input
          type="date"
          id="valid_until"
          name="valid_until"
          value={form.valid_until}
          onChange={handleChange}
        />

        <button type="submit">{isNew ? 'Add Vaccination' : 'Update Vaccination'}</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
