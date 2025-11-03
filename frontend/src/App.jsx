import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/applications';

function App() {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied',
    date_applied: '',
    job_url: '',
    location: '',
    salary_range: '',
    contact_name: '',
    contact_email: '',
    notes: '',
    follow_up_date: ''
  });

  const statuses = ['Applied', 'Interview Scheduled', 'Interviewed', 'Offer', 'Rejected', 'Withdrawn'];

  // Fetch all applications
  useEffect(() => {
    fetchApplications();
  }, []);

  // Filter applications
  useEffect(() => {
    let filtered = applications;
    
    if (filterStatus !== 'All') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredApps(filtered);
  }, [applications, filterStatus, searchTerm]);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(API_URL);
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Error loading applications');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, formData);
      } else {
        await axios.post(API_URL, formData);
      }
      
      fetchApplications();
      resetForm();
    } catch (error) {
      console.error('Error saving application:', error);
      alert('Error saving application');
    }
  };

  const handleEdit = (app) => {
    setFormData({
      company: app.company,
      position: app.position,
      status: app.status,
      date_applied: app.date_applied || '',
      job_url: app.job_url || '',
      location: app.location || '',
      salary_range: app.salary_range || '',
      contact_name: app.contact_name || '',
      contact_email: app.contact_email || '',
      notes: app.notes || '',
      follow_up_date: app.follow_up_date || ''
    });
    setEditingId(app.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchApplications();
      } catch (error) {
        console.error('Error deleting application:', error);
        alert('Error deleting application');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      status: 'Applied',
      date_applied: '',
      job_url: '',
      location: '',
      salary_range: '',
      contact_name: '',
      contact_email: '',
      notes: '',
      follow_up_date: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': '#3b82f6',
      'Interview Scheduled': '#f59e0b',
      'Interviewed': '#8b5cf6',
      'Offer': '#10b981',
      'Rejected': '#ef4444',
      'Withdrawn': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🎯 Job Application Tracker</h1>
        <button className="add-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Application'}
        </button>
      </header>

      {showForm && (
        <div className="form-container">
          <h2>{editingId ? 'Edit Application' : 'New Application'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Company *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Position *</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date Applied</label>
                <input
                  type="date"
                  name="date_applied"
                  value={formData.date_applied}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                />
              </div>

              <div className="form-group">
                <label>Salary Range</label>
                <input
                  type="text"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleInputChange}
                  placeholder="e.g., $80k-$100k"
                />
              </div>

              <div className="form-group">
                <label>Job URL</label>
                <input
                  type="url"
                  name="job_url"
                  value={formData.job_url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label>Follow-up Date</label>
                <input
                  type="date"
                  name="follow_up_date"
                  value={formData.follow_up_date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingId ? 'Update' : 'Add'} Application
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search company or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filters">
          <button
            className={filterStatus === 'All' ? 'active' : ''}
            onClick={() => setFilterStatus('All')}
          >
            All ({applications.length})
          </button>
          {statuses.map(status => (
            <button
              key={status}
              className={filterStatus === status ? 'active' : ''}
              onClick={() => setFilterStatus(status)}
            >
              {status} ({applications.filter(app => app.status === status).length})
            </button>
          ))}
        </div>
      </div>

      <div className="applications-grid">
        {filteredApps.length === 0 ? (
          <div className="empty-state">
            <p>No applications found. Add your first one!</p>
          </div>
        ) : (
          filteredApps.map(app => (
            <div key={app.id} className="app-card">
              <div className="card-header">
                <div>
                  <h3>{app.company}</h3>
                  <p className="position">{app.position}</p>
                </div>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(app.status) }}
                >
                  {app.status}
                </span>
              </div>

              <div className="card-body">
                {app.location && <p>📍 {app.location}</p>}
                {app.salary_range && <p>💰 {app.salary_range}</p>}
                {app.date_applied && <p>📅 Applied: {app.date_applied}</p>}
                {app.follow_up_date && <p>⏰ Follow-up: {app.follow_up_date}</p>}
                {app.contact_name && <p>👤 {app.contact_name}</p>}
                {app.contact_email && <p>✉️ {app.contact_email}</p>}
                {app.notes && <p className="notes">📝 {app.notes}</p>}
                {app.job_url && (
                  <a href={app.job_url} target="_blank" rel="noopener noreferrer" className="job-link">
                    View Job Posting →
                  </a>
                )}
              </div>

              <div className="card-actions">
                <button className="edit-btn" onClick={() => handleEdit(app)}>
                  Edit
                </button>
                <button className="delete-btn" onClick={() => handleDelete(app.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;