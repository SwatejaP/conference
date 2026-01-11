import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, MapPin, Users, Layout, Save, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import './AdminPanel.css';

export default function AdminPanel() {
    const [rooms, setRooms] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [newRoom, setNewRoom] = useState({ name: '', capacity: '', location: '', facilities: '' });
    const [isCreating, setIsCreating] = useState(false);
    const [rejectionModal, setRejectionModal] = useState({ isOpen: false, bookingId: null, reason: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'ADMIN') {
            navigate('/dashboard');
            return;
        }
        fetchRooms();
        fetchBookings();
    }, []);

    const fetchBookings = () => {
        axios.get('/api/bookings', { withCredentials: true })
            .then(res => {
                // Filter only Pending bookings for the approval queue
                const pending = res.data.filter(b => b.status === 'PENDING_ADMIN_APPROVAL');
                setBookings(pending);
            })
            .catch(err => console.error(err));
    };

    const handleStatusUpdate = async (id, status, reason = null) => {
        try {
            await axios.patch(`/api/bookings/${id}/status`, {
                status,
                rejectionReason: reason
            }, { withCredentials: true });

            fetchBookings(); // Refresh list
            alert(`Booking ${status}`);
        } catch (err) {
            console.error(err);
            alert('Failed to update status');
        }
    };

    const submitRejection = (id, reason) => {
        if (!reason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        handleStatusUpdate(id, 'REJECTED', reason);
        setRejectionModal({ isOpen: false, bookingId: null, reason: '' });
    };

    const fetchRooms = () => {
        axios.get('/api/rooms', { withCredentials: true })
            .then(res => setRooms(res.data))
            .catch(err => console.error(err));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/rooms', {
                ...newRoom,
                facilities: newRoom.facilities.split(',').map(f => f.trim())
            }, { withCredentials: true });

            setIsCreating(false);
            setNewRoom({ name: '', capacity: '', location: '', facilities: '' });
            fetchRooms();
            alert('Room Created!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Failed to create room.');
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <div className="admin-container">
                <div className="admin-header">
                    <h1>Room Management</h1>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="add-btn"
                    >
                        <Plus size={20} /> Add New Room
                    </button>
                </div>

                {isCreating && (
                    <div className="create-room-card">
                        <h2 className="card-title">Create New Room</h2>
                        <form onSubmit={handleCreate} className="grid-2-col">
                            <div className="form-group">
                                <label>Room Name</label>
                                <div style={{ position: 'relative' }}>
                                    <Layout className="input-icon" size={16}
                                        style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="e.g. Conference Hall A"
                                        value={newRoom.name}
                                        onChange={e => setNewRoom({ ...newRoom, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <div style={{ position: 'relative' }}>
                                    <MapPin size={16}
                                        style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="e.g. Floor 2, Wing B"
                                        value={newRoom.location}
                                        onChange={e => setNewRoom({ ...newRoom, location: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Capacity</label>
                                <div style={{ position: 'relative' }}>
                                    <Users size={16}
                                        style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                                    <input
                                        type="number"
                                        className="input-field"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="e.g. 10"
                                        value={newRoom.capacity}
                                        onChange={e => setNewRoom({ ...newRoom, capacity: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Facilities (comma separated)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Projector, Whiteboard, AC"
                                    value={newRoom.facilities}
                                    onChange={e => setNewRoom({ ...newRoom, facilities: e.target.value })}
                                />
                            </div>
                            <div className="full-width">
                                <button type="submit" className="save-btn">
                                    <Save size={20} /> Save Room
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="section-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                    <h2>Pending Booking Requests</h2>
                </div>

                <div className="rooms-table-container" style={{ marginBottom: '3rem' }}>
                    {bookings.length === 0 ? (
                        <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No pending requests.</p>
                    ) : (
                        <table className="rooms-table">
                            <thead>
                                <tr>
                                    <th>Room</th>
                                    <th>User</th>
                                    <th>Purpose</th>
                                    <th>Attendees</th>
                                    <th>Date & Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => (
                                    <tr key={booking.id}>
                                        <td style={{ fontWeight: 600 }}>{booking.room?.name || 'Unknown Room'}</td>
                                        <td>{booking.user?.email || 'Unknown User'}</td>
                                        <td>{booking.purpose}</td>
                                        <td>{booking.attendees}</td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem' }}>{new Date(booking.startTime).toLocaleDateString()}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'PENDING_EMPLOYEE_CONFIRMATION')}
                                                    className="action-btn approve"
                                                    style={{ backgroundColor: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <CheckCircle size={16} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => setRejectionModal({ isOpen: true, bookingId: booking.id, reason: '' })}
                                                    className="action-btn reject"
                                                    style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                >
                                                    <XCircle size={16} /> Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Rejection Modal */}
                {rejectionModal.isOpen && (
                    <div className="modal-overlay" onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h2>Reject Booking</h2>
                                <button className="close-btn" onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}>
                                    <XCircle size={20} />
                                </button>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Reason for Rejection</label>
                                <textarea
                                    className="input-field"
                                    rows="4"
                                    placeholder="e.g. Room needed for maintenance, Conflict with priority meeting..."
                                    value={rejectionModal.reason}
                                    onChange={e => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setRejectionModal({ ...rejectionModal, isOpen: false })}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => submitRejection(rejectionModal.bookingId, rejectionModal.reason)}
                                        style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}
                                    >
                                        Reject Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="section-header">
                    <h2>Manage Rooms</h2>
                </div>

                <div className="rooms-table-container">
                    <table className="rooms-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Capacity</th>
                                <th>Facilities</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.id}>
                                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{room.name}</td>
                                    <td>{room.location}</td>
                                    <td>{room.capacity}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            {room.facilities.map((f, i) => (
                                                <span key={i} className="tag">{f}</span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
