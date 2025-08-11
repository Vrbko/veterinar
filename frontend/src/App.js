import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Registration from './pages/Registration';
import Dashboard from './pages/Dashboard';
import AnimalForm from './pages/AnimalForm';
import VaccinationForm from './pages/VaccinationForm';
import AllVacinations from './pages/AllVaccinations';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pet" element={<AnimalForm />} />
        <Route path="/pet/:id" element={<AnimalForm />} />     
        <Route path="vaccination" element={<VaccinationForm />} />   

        <Route path="vaccinations" element={<AllVacinations />} />     
        <Route path="vaccinations/:id" element={<AllVacinations />} />     
      </Routes>
    </Router>
  );
}

export default App;