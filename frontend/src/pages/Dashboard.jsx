import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Users, X, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import './Dashboard.css';
import roomImage from '../assets/room_1.png';

export default function Dashboard() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [bookingData, setBookingData] = useState({
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: ''
    });

    useEffect(() => {
        axios.get('/api/rooms', { withCredentials: true })
            .then(res => setRooms(res.data))
            .catch(err => console.error(err));
    }, []);

    const handleBook = async () => {
        if (!bookingData.date || !bookingData.startTime || !bookingData.endTime || !bookingData.purpose || !bookingData.attendees) {
            alert('Please fill in all fields (Date, Time, Purpose, Attendees).');
            return;
        }

        const start = new Date(`${bookingData.date}T${bookingData.startTime}`);
        const end = new Date(`${bookingData.date}T${bookingData.endTime}`);

        if (start >= end) {
            alert('End time must be after Start time.');
            return;
        }

        try {
            await axios.post('/api/bookings', {
                roomId: selectedRoom.id,
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                purpose: bookingData.purpose,
                attendees: parseInt(bookingData.attendees)
            }, { withCredentials: true });

            alert('Booking Request Sent! Awaiting Admin Approval.');
            setSelectedRoom(null);
            setBookingData({ date: '', startTime: '', endTime: '', purpose: '', attendees: '' }); // Reset form
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Booking failed');
        }
    };

    return (
        <div style={{ minHeight: '100vh' }}> {/* Removed bg-color to allow global bg */}
            <Navbar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Available Rooms</h1>
                </div>

                <div className="room-grid">
                    {rooms.map(room => (
                        <div key={room.id} className="room-card">
                            <div className="room-image-placeholder">
                                <img src={roomImage} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div className="capacity-badge-overlay">
                                    <Users size={12} /> {room.capacity}
                                </div>
                            </div>
                            <div className="room-content">
                                <h3 className="room-name">{room.name}</h3>
                                <div className="room-detail">
                                    <MapPin size={16} /> {room.location}
                                </div>
                                <div className="room-facilities">
                                    {room.facilities.map((fac, idx) => (
                                        <span key={idx} className="facility-badge">
                                            {fac}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setSelectedRoom(room)}
                                    className="book-btn"
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedRoom && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            onClick={() => setSelectedRoom(null)}
                            className="close-modal"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="modal-title">Book {selectedRoom.name}</h2>

                        <div style={{ height: '80px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                            <img src={roomImage} alt="Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        <div className="form-group">
                            <label>Meeting Purpose</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Q3 Review"
                                value={bookingData.purpose}
                                onChange={e => setBookingData({ ...bookingData, purpose: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Number of Attendees</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder={`Max ${selectedRoom.capacity}`}
                                value={bookingData.attendees}
                                onChange={e => setBookingData({ ...bookingData, attendees: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={bookingData.date}
                                onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Start Time</label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={bookingData.startTime}
                                    onChange={e => setBookingData({ ...bookingData, startTime: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Time</label>
                                <input
                                    type="time"
                                    className="input-field"
                                    value={bookingData.endTime}
                                    onChange={e => setBookingData({ ...bookingData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleBook}
                            className="confirm-btn"
                        >
                            <CheckCircle size={20} /> Confirm Booking
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
