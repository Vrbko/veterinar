import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import { FaTrash, FaCog, FaPlus, FaSyringe } from 'react-icons/fa';
import '../styles/dashboard.css';
import SearchBar from '../context/SearchBar';
import '../styles/searchbar.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.userId) {
      axios.get(`/animals/`)
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

    const handleSearch = (query) => {
    console.log('Search query:', query);
    // Add your filtering logic here
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

 
  const goToVaccinations = () => {
    navigate('/vaccinations');
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
    <div className="dashboard-container">
      <header>
        <h1>Welcome vet, {user?.username || 'Guest'}!</h1>
         
     

        <div className="buttons">
          <button onClick={goToVaccinations}>Vaccinations</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>
 <SearchBar onSearch={handleSearch} />
      <section className="pets-section">
        <h2>All the pets in your clinic</h2>

     
        {loading ? (
          <p>Loading pets...</p>
        ) : pets.length === 0 ? (
          <p>No pets registered yet.</p>
        ) : (
          <ul className="pet-list">
            {pets.map((pet) => (
              <li key={pet.id} className="pet-card">
                <div className="pet-header">
                  <h3>{pet.nickname || '(No name)'}</h3>
                 <div className="pet-actions">

                    <FaSyringe
  className="action-icon add-icon"
  title="Vaccines"
  onClick={() => handleVaccinations(pet.nickname,pet.id)}
/>
                    <FaCog
                      className="action-icon"
                      title="Edit pet"
                      onClick={() => handleSettings(pet.id)}
                    />
  
              
                    <FaTrash
                      className="action-icon delete-icon"
                      title="Delete pet"
                      onClick={() => handleDelete(pet.id)}
                    />
                  </div>
                </div>
                <p><strong>Species:</strong> {pet.species}</p>
                {pet.breed && <p><strong>Breed:</strong> {pet.breed}</p>}
                {pet.gender && <p><strong>Gender:</strong> {pet.gender}</p>}
                {pet.birth_date && (
                  <p><strong>Birth Date:</strong> {new Date(pet.birth_date).toLocaleDateString()}</p>
                )}
                {pet.height && <p><strong>Height:</strong> {pet.height} cm</p>}
                {pet.weight && <p><strong>Weight:</strong> {pet.weight} kg</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
