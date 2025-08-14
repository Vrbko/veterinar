import React, { useEffect, useState } from 'react';
import axios from '../api/axiosConfig';
import { FaTrash, FaCog, FaPlus, FaSearch } from 'react-icons/fa';
import '../styles/dashboard.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Correct import

export default function AllVaccinations() {
  const [vaccinations, setVaccinations] = useState([]);
  const [filteredVaccinations, setFilteredVaccinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id, name } = useParams();
  const { user } = useAuth();

  const hasAccess = true; // Replace with actual permission logic

  useEffect(() => {
    if (!hasAccess) return;

    const fetchVaccinations = async () => {
      setLoading(true);
      try {
        const endpoint = id ? `/vaccinations/${id}` : '/vaccinations';
        const res = await axios.get(endpoint);
        const data = res.data || [];
        setVaccinations(data);
        setFilteredVaccinations(data);
      } catch (err) {
        console.error(err);
        setVaccinations([]);
        setFilteredVaccinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, [id, hasAccess]);

  const handleDelete = async (delId) => {
    if (!window.confirm('Are you sure you want to delete this vaccination record?')) return;
    try {
      await axios.delete(`/vaccinations/${delId}`);
      setVaccinations(prev => prev.filter(v => v.id !== delId));
      setFilteredVaccinations(prev => prev.filter(v => v.id !== delId));
    } catch (err) {
      console.error('Error deleting vaccination:', err);
    }
  };

  const handleEdit = (editId) => {
    navigate(`/vaccination/edit/${editId}`);
  };

  const handleAdd = (animalId) => {
    navigate(`/vaccination/add/${animalId}`);
  };

  // Updated PDF generation using autoTable(doc, {...})
  const generateVaccinesPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vaccination Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Vaccine Name", "Type", "Pet ID", "Vaccination Date", "Valid Until", "Status"];
    const tableRows = [];

    vaccinations.forEach((vaccine) => {
      const daysLeft = vaccine.valid_until
        ? Math.ceil((new Date(vaccine.valid_until) - new Date()) / (1000 * 60 * 60 * 24))
        : null;

      let status = "";
      if (daysLeft !== null) {
        if (daysLeft <= 10 && daysLeft >= 0) status = "About to expire";
        else if (daysLeft > 10) status = "Good";
        else if (daysLeft < 0) status = "Expired";
      }

      tableRows.push([
        vaccine.vaccine_name || "-",
        vaccine.vaccine_type || "-",
        vaccine.animal_id || "-",
        new Date(vaccine.vaccination_date).toLocaleDateString(),
        vaccine.valid_until ? new Date(vaccine.valid_until).toLocaleDateString() : "-",
        status
      ]);
    });

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "striped",
      headStyles: { fillColor: [40, 116, 166] },
    });

    doc.save("vaccination_report.pdf");
  };

  const goToDashboard = () => {
    if (user.role === 'vet') navigate('/vet-dashboard');
    else if (user.role === 'admin') navigate('/admin-dashboard');
    else navigate('/user-dashboard');
  };

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    setFilteredVaccinations(
      vaccinations.filter(v =>
        (v.vaccine_name || '').toLowerCase().includes(term) ||
        (v.vaccine_type || '').toLowerCase().includes(term) ||
        (v.animal_id || '').toString().includes(term)
      )
    );
  }, [searchTerm, vaccinations]);

  if (!hasAccess) {
    return (
      <div className="dashboard-container container py-4">
        <div className="alert alert-danger">
          🚫 Access Denied — You do not have permission to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container container py-4">
      {/* Header */}
      <header className="mb-4 border-bottom pb-3">
        <div className="row g-4 align-items-center justify-content-between">
          {/* Title */}
          <div className="col-12 col-lg-10 text-lg-start text-center">
            <h1 className="mb-0">
              💉 All Vaccinations {name && <span className="text-primary">for {name}</span>}
            </h1>
          </div>

          {/* Actions */}
          <div className="col-12 col-lg-2 d-flex justify-content-lg-end justify-content-center">
            <div className="d-flex justify-content-lg-end justify-content-center gap-2" style={{ whiteSpace: "nowrap" }}>
              <button className="btn btn-outline-secondary px-3" onClick={goToDashboard}>
                🛠️ Dashboard
              </button>
              {name && (user?.role === "vet" || user?.role === "admin") && (
                <button className="btn btn-success px-3" onClick={() => handleAdd(id)}>
                  ➕ Add Vaccination
                </button>
              )}
              <button className="btn btn-primary px-3" onClick={generateVaccinesPDF}>
                📄 Download Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Vaccinations Section */}
      <section>
        {/* Centered Search */}
        <div className="d-flex justify-content-center mb-4">
          <div className="input-group" style={{ maxWidth: "50%", width: "100%" }}>
            <span className="input-group-text bg-light">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search vaccinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status" />
            <p className="mt-3">Loading vaccinations...</p>
          </div>
        ) : filteredVaccinations.length === 0 ? (
          <div className="alert alert-info">
            No vaccinations recorded yet.
          </div>
        ) : (
          <div className="row g-4">
            {filteredVaccinations.map((vaccine) => (
              <div key={vaccine.id} className="col-sm-6 col-md-4">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body d-flex flex-column">
                    {/* Card Header */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 text-primary">
                        {vaccine.vaccine_name || vaccine.vaccine_type}
                      </h5>

                      {(user?.role === "vet" || user?.role === "admin") && (
                        <div className="btn-group">
                          <FaCog
                            className="text-primary cursor-pointer"
                            size={18}
                            title="Edit vaccination"
                            onClick={() => handleEdit(vaccine.id)}
                          />
                          <FaTrash
                            className="text-danger cursor-pointer"
                            size={18}
                            title="Delete vaccination"
                            onClick={() => handleDelete(vaccine.id)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <ul className="list-unstyled small flex-grow-1">
                      <li><strong>Vaccine Name:</strong> {vaccine.vaccine_name || "-"}</li>
                      <li><strong>Vaccine Type:</strong> {vaccine.vaccine_type}</li>
                      <li><strong>Pet ID:</strong> {vaccine.animal_id}</li>
                      <li><strong>Vaccination Date:</strong> {new Date(vaccine.vaccination_date).toLocaleDateString()}</li>
                      {vaccine.valid_until && (
                        <li><strong>Valid Until:</strong> {new Date(vaccine.valid_until).toLocaleDateString()}</li>
                      )}

                      {/* Status Indicator */}
                      {vaccine.valid_until && (() => {
                        const daysLeft = Math.ceil(
                          (new Date(vaccine.valid_until) - new Date()) / (1000 * 60 * 60 * 24)
                        );
                        if (daysLeft <= 10 && daysLeft >= 0) {
                          return (
                            <li className="d-flex align-items-center mt-2">
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "10px",
                                  height: "10px",
                                  backgroundColor: "red",
                                  borderRadius: "50%",
                                  marginRight: "8px"
                                }}
                              ></span>
                              <span className="text-danger fw-bold">Vaccine about to expire</span>
                            </li>
                          );
                        } else if (daysLeft > 10) {
                          return (
                            <li className="d-flex align-items-center mt-2">
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "10px",
                                  height: "10px",
                                  backgroundColor: "green",
                                  borderRadius: "50%",
                                  marginRight: "8px"
                                }}
                              ></span>
                              <span className="text-success fw-bold">Vaccine is good</span>
                            </li>
                          );
                        }
                        return null;
                      })()}
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
