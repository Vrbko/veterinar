import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { FaTrash, FaCog, FaPlus, FaSyringe } from 'react-icons/fa';
import '../styles/dashboard.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function AllVaccinations() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id, name } = useParams();  // get optional id parameter
  const { user } = useAuth();

useEffect(() => {
  setLoading(true);
  if (id) {
    // Fetch all vaccinations for animal_id = id
    axios.get(`/vaccinations/${id}`)
      .then(res => {
        setVaccinations(res.data);  // res.data is already an array
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setVaccinations([]);
        setLoading(false);
      });
  } else {
    // Fetch all vaccinations for all animals
    axios.get('/vaccinations')
      .then(res => {
        setVaccinations(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setVaccinations([]);
        setLoading(false);
      });
  }
}, [id]);


  const handleDelete = async (delId) => {
    if (!window.confirm('Are you sure you want to delete this vaccination record?')) return;
    try {
      await axios.delete(`/vaccinations/${delId}`);
      setVaccinations((prev) => prev.filter(v => v.id !== delId));
    } catch (err) {
      console.error('Error deleting vaccination:', err);
    }
  };

  const handleEdit = (editId) => {
    navigate(`/vaccination/edit/${editId}`);
  };

  const handleAdd = (id) => {
    navigate(`/vaccination/add/${id}`);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>
All Vaccinations {name && `(For ${name})`} <FaSyringe className="header-icon" />
        </h1>
        {user?.role === 'vet' && (
  <button onClick={() => handleAdd(id)} className="add-button">
    <FaPlus /> Add Vaccination
  </button>
)}
      </header>

      <section className="vaccinations-section">
        {loading ? (
          <p>Loading vaccinations...</p>
        ) : vaccinations.length === 0 ? (
          <p>No vaccinations recorded yet.</p>
        ) : (
          <ul className="vaccination-list">
            {vaccinations.map(vaccine => (
              <li key={vaccine.id} className="vaccination-card">
                <div className="vaccination-header">
                  <h3>{vaccine.vaccine_name || vaccine.vaccine_type}</h3>
                          {user?.role === 'vet' && (
                  <div className="vaccination-actions">
                    <FaCog
                      className="action-icon"
                      title="Edit vaccination"
                      onClick={() => handleEdit(vaccine.id)}
                    />
                    <FaTrash
                      className="action-icon delete-icon"
                      title="Delete vaccination"
                      onClick={() => handleDelete(vaccine.id)}
                    />
                  </div>)}
                </div>
                <p><strong>Vaccine Name:</strong> {vaccine.vaccine_name || '-'}</p>
                <p><strong>Vaccine Type:</strong> {vaccine.vaccine_type}</p>
                <p><strong>Pet_id:</strong> {vaccine.animal_id}</p>
                <p><strong>Vaccination Date:</strong> {new Date(vaccine.vaccination_date).toLocaleDateString()}</p>
                {vaccine.valid_until && (
                  <p><strong>Valid Until:</strong> {new Date(vaccine.valid_until).toLocaleDateString()}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
