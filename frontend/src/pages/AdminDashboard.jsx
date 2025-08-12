import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';
import '../styles/dashboard.css';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Users state and loading
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [statusChanges, setStatusChanges] = useState({});

  // Owners and animals states
  const [owners, setOwners] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [loadingAnimals, setLoadingAnimals] = useState(true);

  // Fetch users
  useEffect(() => {
    if (!user?.userId) return;

    setLoadingUsers(true);
    axios.get('/users')
      .then(res => {
        setUsers(res.data);
        setLoadingUsers(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingUsers(false);
      });
  }, [user]);

  // Fetch owners and animals
  useEffect(() => {
    setLoadingOwners(true);
    setLoadingAnimals(true);

    axios.get('/owners')
      .then(res => {
        setOwners(res.data);
        setLoadingOwners(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingOwners(false);
      });

    axios.get('/animals')
      .then(res => {
        setAnimals(res.data);
        setLoadingAnimals(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingAnimals(false);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleActiveChange = (userId, newStatus) => {
    setStatusChanges(prev => ({
      ...prev,
      [userId]: newStatus
    }));
  };

const handleSetActive = async (userId) => {
  const newStatus = statusChanges[userId];
  if (!newStatus) {
    alert('No change detected');
    return;
  }
  try {
    await axios.patch(`/users/${userId}`, { active: newStatus });
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u.id === userId ? { ...u, active: newStatus } : u
      )
    );
    setStatusChanges(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
    alert('User active status updated successfully!');  // Success popup
  } catch (err) {
    console.error('Error updating user active status:', err);
    alert('Failed to update active status');  // Failure popup
  }
};


  return (
    <div className="dashboard-container">
      <header>
        <h1>Welcome Admin, {user?.username || 'Guest'}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
    <div className="ui-container">

      <div className="side-panel users-panel">
        <section>
          <h2>Users</h2>
          {loadingUsers ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Active Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(({ id, username, role, active }) => {
                  const changedStatus = statusChanges[id];
                  return (
                    <tr key={id}>
                      <td>{username}</td>
                      <td>{role}</td>
                      <td>
                        <select
                          value={changedStatus || active}
                          onChange={e => handleActiveChange(id, e.target.value)}
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleSetActive(id)}
                          disabled={!statusChanges[id]}
                        >
                          Set
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <div className="side-panel right-panel">
        <div className="owners-box">
          <h2>Owners</h2>
          {loadingOwners ? <p>Loading owners...</p> : (
            <ul>
              {owners.map(o => (
                <li key={o.id}>{o.username}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="animals-box">
          <h2>Animals</h2>
          {loadingAnimals ? <p>Loading animals...</p> : (
            <ul>
              {animals.map(a => (
                <li key={a.id}>
                  {a.nickname || '(No name)'} — {a.species}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
