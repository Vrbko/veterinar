import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { FaTrash, FaCog, FaPlus, FaSyringe } from 'react-icons/fa';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      axios.get(`/animals/user/${user.userId}`)
        .then(res => {
          setPets(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToRegistration = () => {
    navigate('/register');
  };

  const goToNewAnimal = () => {
    navigate('/pet');
  };
  const handleVaccinations = (name, id) => {
    navigate(`/vaccinations/${name}/${id}`);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return;
    try {
      await axios.delete(`/animals/${id}`);
      setPets((prevPets) => prevPets.filter((pet) => pet.id !== id));
    } catch (err) {
      console.error('Error deleting pet:', err);
    }
  };

  const handleSettings = (id) => {
    navigate(`/pet/${id}`);
  };
return (
  <div className="dashboard-container container py-4">
    {/* Header */}
    <header className="d-flex flex-wrap justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h1 className="mb-2 mb-md-0">
        🐾 Welcome Pet Owner, <span className="text-primary">{user?.username || "Guest"}</span>!
      </h1>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={goToNewAnimal}>
          ➕ New Pet
        </button>
        <button className="btn btn-secondary" onClick={goToRegistration}>
          📄 My Info
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </header>

    {/* Pets Section */}
    <section>
      <h2 className="mb-4">🐶 Your Pets</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading pets...</p>
        </div>
      ) : pets.length === 0 ? (
        <div className="alert alert-info">
          No pets registered yet. Add one using the <strong>New Pet</strong> button.
        </div>
      ) : (
        <div className="row g-4">
          {pets.map((pet) => (
            <div key={pet.id} className="col-sm-6 col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  {/* Pet Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">
                      {pet.nickname || "(No name)"}
                    </h5>
                    <div className="btn-group">
                      <FaSyringe
                        className="text-success cursor-pointer"
                        size={18}
                        title="Vaccines"
                        onClick={() => handleVaccinations(pet.nickname, pet.id)}
                      />
                      <FaCog
                        className="text-primary cursor-pointer"
                        size={18}
                        title="Edit Pet"
                        onClick={() => handleSettings(pet.id)}
                      />
                    </div>
                  </div>

                  {/* Pet Details */}
                  <ul className="list-unstyled small flex-grow-1">
                    <li><strong>Species:</strong> {pet.species}</li>
                    {pet.breed && <li><strong>Breed:</strong> {pet.breed}</li>}
                    {pet.gender && <li><strong>Gender:</strong> {pet.gender}</li>}
                    {pet.birth_date && (
                      <li>
                        <strong>Birth Date:</strong>{" "}
                        {new Date(pet.birth_date).toLocaleDateString()}
                      </li>
                    )}
                    {pet.height && <li><strong>Height:</strong> {pet.height} cm</li>}
                    {pet.weight && <li><strong>Weight:</strong> {pet.weight} kg</li>}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  </div>
);

}
