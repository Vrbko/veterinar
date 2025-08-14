import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import '../styles/dashboard.css';
import SearchBar from '../context/SearchBar';
import { Link } from 'react-router-dom';


export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [animals, setAnimals] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  const [statusChanges, setStatusChanges] = useState({});

  // Local search states for each table
  const [userSearch, setUserSearch] = useState('');
  const [ownerSearch, setOwnerSearch] = useState('');
  const [animalSearch, setAnimalSearch] = useState('');

  // Fetch all data on mount
  useEffect(() => {
    if (!user?.userId) return;

    setLoadingUsers(true);
    axios.get('/users')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingUsers(false));

    setLoadingOwners(true);
    axios.get('/owners')
      .then(res => setOwners(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingOwners(false));

    setLoadingAnimals(true);
    axios.get('/animals')
      .then(res => setAnimals(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoadingAnimals(false));
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleActiveChange = (userId, newStatus) => {
    setStatusChanges(prev => ({ ...prev, [userId]: newStatus }));
  };
  const handleDeleteUser = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    // Optional: Delete from backend
    await axios.delete(`/users/${userId}`);

    // Remove from local state
    setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));

    alert("User deleted successfully!");
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Failed to delete user");
  }
};
const handleDeleteOwner = async (ownerId) => {
  if (!window.confirm("Are you sure you want to delete this owner?")) return;

  try {
    await axios.delete(`/owners/${ownerId}`); // Optional API call
    setOwners(prev => prev.filter(o => o.id !== ownerId));
    alert("Owner deleted successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to delete owner");
  }
};

// Delete an animal
const handleDeleteAnimal = async (animalId) => {
  if (!window.confirm("Are you sure you want to delete this animal?")) return;

  try {
    await axios.delete(`/animals/${animalId}`); // Optional API call
    setAnimals(prev => prev.filter(a => a.id !== animalId));
    alert("Animal deleted successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to delete animal");
  }
};

 const handleViewVacc = (id, name) => {
    navigate(`/vaccinations/${name}/${id}`);
  };

  const handleSetActive = async (userId) => {
    const newStatus = statusChanges[userId];
    if (!newStatus) return alert('No change detected');

    try {
      await axios.patch(`/users/${userId}`, { active: newStatus });
      setUsers(prevUsers =>
        prevUsers.map(u => u.id === userId ? { ...u, active: newStatus } : u)
      );
      setStatusChanges(prev => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
      alert('User active status updated successfully!');
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update active status');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

const filteredOwners = owners.filter(o => {
  const fullName = `${o.first_name} ${o.last_name}`.toLowerCase();
  return fullName.includes(ownerSearch.toLowerCase());
});


const filteredAnimals = animals.filter(a => {
  const search = animalSearch.toLowerCase();
  return (
    (a.nickname?.toLowerCase().includes(search) ?? false) ||
    (a.species?.toLowerCase().includes(search) ?? false) ||
    (a.breed?.toLowerCase().includes(search) ?? false) ||
    (a.microchip_number?.toLowerCase().includes(search) ?? false)
  );
});

return (
  <div className="dashboard-container container py-4">
    {/* Header */}
    <header className="d-flex flex-wrap justify-content-between align-items-center mb-4 border-bottom pb-3">
      <h1 className="mb-2 mb-md-0">
        🛠️ Welcome to the Admin Panel,{" "}
        <span className="text-primary">{user?.username || "Guest"}</span>!
      </h1>
      <button className="btn btn-danger" onClick={handleLogout}>
        🚪 Logout
      </button>
    </header>

    <div className="row g-4">
      {/* Users Table (unchanged) */}
      <div className="col-lg-6">
        <section className="card shadow-sm h-100">
          <div className="card-body">
            <h2 className="card-title mb-3">👥 User Accounts</h2>
            <SearchBar onSearch={setUserSearch} />
            {loadingUsers ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-3">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="alert alert-info">No users found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Active?</th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(({ id, username, role, active }) => {
                      const changedStatus = statusChanges[id];
                      return (
                        <tr key={id}>
                          <td>{id}</td>
                          <td>{username}</td>
                          <td>{role}</td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={changedStatus || active}
                              onChange={(e) => handleActiveChange(id, e.target.value)}
                            >
                              <option value="yes">Yes</option>
                              <option value="no">No</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleSetActive(id)}
                              disabled={!statusChanges[id]}
                            >
                              Set
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteUser(id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Owners & Animals in second column */}
      <div className="col-lg-6">
        {/* Owners Table */}
        <section className="card shadow-sm mb-4">
          <div className="card-body">
            <h2 className="card-title mb-3">🏠 Owners</h2>
            <SearchBar onSearch={setOwnerSearch} />
            {loadingOwners ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : filteredOwners.length === 0 ? (
              <div className="alert alert-info">No owners found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Account ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>⚙️</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOwners.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.user_id}</td>
                        <td>{o.first_name}</td>
                        <td>{o.last_name}</td>
                        <td className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/register/${o.user_id}`)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteOwner(o.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Animals Table */}
        <section className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-3">🐾 Animals</h2>
            <SearchBar onSearch={setAnimalSearch} />
            {loadingAnimals ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div className="alert alert-info">No animals found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Acc ID</th>
                      <th>Nickname</th>
                      <th>Species</th>
                      <th>Gender</th>
                      <th>Microchip</th>
                      <th>💉</th>
                      <th>⚙️</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnimals.map((a) => (
                      <tr key={a.id}>
                        <td>{a.id}</td>
                        <td>{a.user_id}</td>
                        <td>{a.nickname || "(No name)"}</td>
                        <td>{a.species}</td>
                        <td>{a.gender}</td>
                        <td>{a.microchip_number}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleViewVacc(a.id, a.nickname)}
                          >
                            💉 View
                          </button>
                        </td>
                        <td className="d-flex gap-2">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/pet/${a.id}`)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteAnimal(a.id)}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  </div>
);
}