import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Registration from './pages/Registration';
import UserDashboard from './pages/Dashboard';
import VetDashboard from './pages/VetDashboard';
import AdminDashboard from './pages/Dashboard';
import AnimalForm from './pages/AnimalForm';
import VaccinationForm from './pages/VaccinationForm';
import AllVaccinations from './pages/AllVaccinations';
import ProtectedRoute from "./context/ProtectedRoutes";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<Registration />} />

        {/* Protected */}
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />


        <Route path="/vet-dashboard" element={<ProtectedRoute><VetDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        <Route path="/pet" element={<ProtectedRoute><AnimalForm /></ProtectedRoute>} />
        <Route path="/pet/:id" element={<ProtectedRoute><AnimalForm /></ProtectedRoute>} />
        <Route path="/vaccination" element={<ProtectedRoute><VaccinationForm /></ProtectedRoute>} />
        <Route path="/vaccinations" element={<ProtectedRoute><AllVaccinations /></ProtectedRoute>} />
        <Route path="/vaccinations/:id" element={<ProtectedRoute><AllVaccinations /></ProtectedRoute>} />
        <Route path="/vaccinations/:name/:id" element={<ProtectedRoute><AllVaccinations /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
