import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, XCircle, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import './MyBookings.css';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/bookings', { withCredentials: true })
            .then(res => setBookings(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async (id) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await axios.delete(`/api/bookings/${id}`, { withCredentials: true });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b));
        } catch (err) {
            alert('Cancellation failed');
        }
    };

    const handleConfirm = async (id) => {
        try {
            await axios.patch(`/api/bookings/${id}/confirm`, {}, { withCredentials: true });
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'CONFIRMED' } : b));
            alert('Booking Confirmed!');
        } catch (err) {
            console.error(err);
            alert('Confirmation failed');
        }
    };

    return (
        <div className="my-bookings-page">
            <Navbar />
            <div className="bookings-container">
                <h1>My Bookings</h1>

                {bookings.length === 0 ? (
                    <p className="no-bookings">You haven't made any bookings yet.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>Room</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => {
                                    let statusClass = 'status-pending';
                                    let statusText = 'Pending Admin';

                                    if (booking.status === 'PENDING_ADMIN_APPROVAL') {
                                        statusClass = 'status-pending';
                                        statusText = 'Waiting Admin';
                                    } else if (booking.status === 'PENDING_EMPLOYEE_CONFIRMATION') {
                                        statusClass = 'status-action-required';
                                        statusText = 'Action Required';
                                    } else if (booking.status === 'CONFIRMED') {
                                        statusClass = 'status-confirmed';
                                        statusText = 'Confirmed';
                                    } else if (booking.status === 'CANCELLED' || booking.status === 'CANCELLED_BY_EMPLOYEE') {
                                        statusClass = 'status-cancelled';
                                        statusText = 'Cancelled';
                                    } else if (booking.status === 'REJECTED') {
                                        statusClass = 'status-rejected';
                                        statusText = 'Rejected';
                                    }

                                    return (
                                        <tr key={booking.id}>
                                            <td>{booking.room?.name || 'Unknown Room'}</td>
                                            <td>{new Date(booking.startTime).toLocaleDateString()}</td>
                                            <td>
                                                {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${statusClass}`} title={booking.rejectionReason}>
                                                    {statusText}
                                                </span>
                                                {booking.status === 'REJECTED' && booking.rejectionReason && (
                                                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', maxWidth: '150px' }}>
                                                        {booking.rejectionReason}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {booking.status === 'PENDING_EMPLOYEE_CONFIRMATION' && (
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleConfirm(booking.id)}
                                                            className="action-btn confirm-btn"
                                                        >
                                                            Confirm
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            className="action-btn cancel-btn"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                )}

                                                {(booking.status === 'PENDING_ADMIN_APPROVAL' || booking.status === 'CONFIRMED') && (
                                                    <button
                                                        onClick={() => handleCancel(booking.id)}
                                                        className="action-btn cancel-btn"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
