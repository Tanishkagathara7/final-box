import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
// Toast system
function useToast() {
  const [toasts, setToasts] = useState([]);
  function showToast(message, type = 'info') {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000);
  }
  function Toasts() {
    return (
      <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000 }}>
        {toasts.map(t => (
          <div key={t.id} style={{ background: t.type === 'error' ? '#e53935' : '#388e3c', color: '#fff', padding: '12px 24px', borderRadius: 8, marginBottom: 10, fontWeight: 600, boxShadow: '0 2px 8px #0002', minWidth: 180 }}>{t.message}</div>
        ))}
      </div>
    );
  }
  return [Toasts, showToast];
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone: email, password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        onLogin(data.token);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '40px auto', padding: 24, border: '1px solid #ccc', borderRadius: 8, background: '#fff' }}>
      <h2>Ground Owner Login</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required style={{ width: '100%', marginBottom: 12, padding: 8 }} />
      <button type="submit" style={{ width: '100%', padding: 8 }}>Login</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}

function stringToColor(str) {
  // Simple hash to color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 60%, 60%)`;
  return color;
}

function UserAvatar({ name }) {
  if (!name) return null;
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <span style={{
      display: 'inline-block',
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: stringToColor(name),
      color: '#fff',
      fontWeight: 700,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: '32px',
      marginRight: 8
    }}>{initials}</span>
  );
}

// Helper: convert 24h time to 12h format for display
function formatTime12h(time24h) {
  const [hours, minutes] = time24h.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
}

// Helper: format time range for display
function formatTimeRange(startTime, endTime) {
  return `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
}

function downloadCSV(data, filename) {
  const csvRows = [];
  const headers = ['Booking ID', 'User', 'Phone', 'Ground', 'Date', 'Time', 'Advance Paid', 'Status'];
  csvRows.push(headers.join(','));
  data.forEach(b => {
    csvRows.push([
      b.bookingId,
      b.userId?.name || '',
      b.playerDetails?.contactPerson?.phone || '',
      b.groundId?.name || '',
      new Date(b.bookingDate).toLocaleDateString(),
      formatTimeRange(b.timeSlot.startTime, b.timeSlot.endTime),
      b.pricing?.totalAmount || '',
      b.status
    ].map(x => `"${x}"`).join(','));
  });
  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function getBookingsPerMonth(bookings) {
  const months = {};
  bookings.forEach(b => {
    const d = new Date(b.bookingDate);
    const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    months[key] = (months[key] || 0) + 1;
  });
  return months;
}

// Custom confirmation dialog component
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0007', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 32, minWidth: 320, boxShadow: '0 4px 32px #0003', textAlign: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>{message}</div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          <button onClick={onConfirm} style={{ padding: '10px 28px', background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #43a04722', transition: 'background 0.2s' }}>Confirm</button>
          <button onClick={onCancel} style={{ padding: '10px 28px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #bdbdbd22', transition: 'background 0.2s' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function BookingDetailsModal({ booking, onClose, onStatusChange }) {
  const [confirm, setConfirm] = useState({ open: false, action: '', label: '' });
  if (!booking) return null;
  // Show custom confirmation dialog
  const handleAction = (action, label) => {
    setConfirm({ open: true, action, label });
  };
  const handleConfirm = () => {
    setConfirm({ open: false, action: '', label: '' });
    onStatusChange(confirm.action);
  };
  const handleCancel = () => {
    setConfirm({ open: false, action: '', label: '' });
  };
  return (
    <>
      <ConfirmDialog
        open={confirm.open}
        message={`Are you sure you want to ${confirm.label} this booking?`}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 400, maxWidth: 600, boxShadow: '0 4px 32px #0003', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Booking Details</h2>
          <div style={{ marginBottom: 16 }}>
            <b>Booking ID:</b> {booking.bookingId}<br />
            <b>Status:</b> {booking.status}<br />
            <b>Date:</b> {new Date(booking.bookingDate).toLocaleDateString()}<br />
            <b>Time:</b> {formatTimeRange(booking.timeSlot.startTime, booking.timeSlot.endTime)}<br />
            <b>Ground:</b> {booking.groundId?.name} <br /> <span style={{ color: '#888' }}>{booking.groundId?.location?.address}</span><br />
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>User:</b> {booking.userId?.name} <br /> <b>Email:</b> {booking.userId?.email}<br />
            <b>Phone:</b> {booking.playerDetails?.contactPerson?.phone || '-'}
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>Team Name:</b> {booking.playerDetails?.teamName || '-'}<br />
            <b>Players:</b> {booking.playerDetails?.playerCount || '-'}<br />
            <b>Requirements:</b> {booking.playerDetails?.requirements || '-'}
          </div>
          <div style={{ marginBottom: 16 }}>
            <b>Advance Paid:</b> ₹{booking.pricing?.totalAmount || '-'}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 18, justifyContent: 'center' }}>
            {booking.status === 'pending' && (
              <button
                onClick={() => handleAction('confirmed', 'approve')}
                style={{ padding: '10px 22px', background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #43a04722', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#388e3c'}
                onMouseOut={e => e.currentTarget.style.background = '#43a047'}
              >
                ✔️ Approve
              </button>
            )}
            {booking.status !== 'completed' && (
              <button
                onClick={() => handleAction('completed', 'mark as completed')}
                style={{ padding: '10px 22px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #1976d222', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#1565c0'}
                onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
              >
                ✅ Mark Completed
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => handleAction('cancelled', 'cancel')}
                style={{ padding: '10px 22px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #e5393522', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#b71c1c'}
                onMouseOut={e => e.currentTarget.style.background = '#e53935'}
              >
                ❌ Cancel
              </button>
            )}
            <button
              onClick={() => window.print()}
              style={{ padding: '10px 22px', background: '#fff', color: '#388e3c', border: '2px solid #388e3c', borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #388e3c22', display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#e8f5e9'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              ⬇️ Download Invoice
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Dashboard({ token, onLogout }) {
  const [owner, setOwner] = useState(null);
  const [grounds, setGrounds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [Toasts, showToast] = useToast();
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', notifications: true });
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [addBookingData, setAddBookingData] = useState({
    groundId: '',
    date: '',
    startTime: '',
    endTime: '',
    teamName: '',
    playerCount: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    requirements: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [addBookingError, setAddBookingError] = useState('');
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastBookingCount, setLastBookingCount] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Audio notification function
  const playNotificationSound = () => {
    if (!audioEnabled) return;
    
    try {
      // Create a simple notification sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio notification failed:', error);
    }
  };

  // Browser notification function
  const showBrowserNotification = (title, message) => {
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'booking-notification'
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'booking-notification'
          });
        }
      });
    }
  };

  // Validation helpers
  function isValidEmail(email) {
    return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isValidPhone(phone) {
    return /^\d{8,15}$/.test(phone.replace(/\D/g, ''));
  }
  function isPositiveInt(val) {
    return /^\d+$/.test(val) && parseInt(val) > 0;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('Fetching user data with token:', token ? 'Token exists' : 'No token');
        const meRes = await fetch('http://localhost:3001/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        const me = await meRes.json();
        console.log('Auth me response:', me);
        
        if (!me.success) {
          throw new Error('Failed to get user data: ' + (me.message || 'Unknown error'));
        }
        
        if (!me.user) {
          throw new Error('No user data received');
        }
        
        console.log('User role:', me.user.role);
        if (me.user.role !== 'ground_owner') {
          throw new Error('Not a ground owner. User role: ' + me.user.role);
        }
        
        setOwner(me.user);
        const groundsRes = await fetch('http://localhost:3001/api/grounds/owner', { headers: { Authorization: `Bearer ${token}` } });
        const groundsData = await groundsRes.json();
        setGrounds(groundsData.grounds || []);
        const bookingsRes = await fetch('http://localhost:3001/api/bookings/owner', { headers: { Authorization: `Bearer ${token}` } });
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings || []);
        setLastBookingCount(bookingsData.bookings?.length || 0);
        
        // Request notification permission
        if ("Notification" in window && Notification.permission === "default") {
          Notification.requestPermission();
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
        setError('Failed to load dashboard: ' + err.message);
      }
    }
    fetchData();
  }, [token]);

  useEffect(() => {
    if (owner) {
      setProfile({
        name: owner.name || '',
        email: owner.email || '',
        phone: owner.phone || '',
        notifications: true,
      });
    }
  }, [owner]);

  // Check for new bookings and notifications
  useEffect(() => {
    if (!owner) return;
    
    const checkForNewBookings = async () => {
      try {
        const bookingsRes = await fetch('http://localhost:3001/api/bookings/owner', { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const bookingsData = await bookingsRes.json();
        const currentBookings = bookingsData.bookings || [];
        
        console.log('Checking for new bookings:', {
          currentCount: currentBookings.length,
          lastCount: lastBookingCount,
          hasNewBookings: currentBookings.length > lastBookingCount
        });
        
        // Check if there are new bookings
        if (currentBookings.length > lastBookingCount && lastBookingCount > 0) {
          const newBookings = currentBookings.slice(0, currentBookings.length - lastBookingCount);
          console.log('New bookings detected:', newBookings.length, newBookings);
          
          newBookings.forEach(booking => {
            const ground = grounds.find(g => g._id === booking.groundId);
            console.log('Processing new booking:', {
              bookingId: booking.bookingId,
              groundName: ground?.name,
              user: booking.userId?.name,
              date: booking.bookingDate,
              timeSlot: booking.timeSlot
            });
            
            // Create detailed notification message with booking information
            const userInfo = booking.userId?.name || 'Unknown User';
            const teamName = booking.playerDetails?.teamName || 'No team name';
            const playerCount = booking.playerDetails?.playerCount || 0;
            const contactPhone = booking.playerDetails?.contactPerson?.phone || 'No phone';
            const contactEmail = booking.playerDetails?.contactPerson?.email || 'No email';
            const requirements = booking.playerDetails?.requirements || 'No special requirements';
            const amount = booking.pricing?.totalAmount || 0;
            
            const detailedMessage = `New booking from ${userInfo} for ${ground?.name || 'your ground'} on ${new Date(booking.bookingDate).toLocaleDateString()} at ${formatTimeRange(booking.timeSlot.startTime, booking.timeSlot.endTime)}. Team: ${teamName}, Players: ${playerCount}, Contact: ${contactPhone}, Amount: ₹${amount}`;
            
            console.log('Creating notification with message:', detailedMessage);
            
            const notification = {
              id: Date.now() + Math.random(),
              type: 'new_booking',
              title: 'New Booking Received!',
              message: detailedMessage,
              booking: booking,
              timestamp: new Date(),
              read: false
            };
            setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
            setUnreadCount(prev => prev + 1);
            showToast(`New booking received for ${ground?.name || 'your ground'}!`, 'info');
            playNotificationSound(); // Play sound for new bookings
            showBrowserNotification('New Booking Received!', detailedMessage);
          });
        }
        
        setBookings(currentBookings);
        setLastBookingCount(currentBookings.length);
      } catch (error) {
        console.error('Error checking for new bookings:', error);
      }
    };
    
    // Check immediately
    checkForNewBookings();
    
    // Set up polling every 10 seconds
    const interval = setInterval(checkForNewBookings, 10000);
    
    return () => clearInterval(interval);
  }, [owner, token, grounds, lastBookingCount]);

  // Update browser tab title with notification badge
  useEffect(() => {
    const originalTitle = 'Ground Owner Dashboard';
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  }, [unreadCount]);

  // Handle click outside notification panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications) {
        const notificationPanel = document.querySelector('[data-notification-panel]');
        const notificationButton = document.querySelector('[data-notification-button]');
        
        if (notificationPanel && 
            !notificationPanel.contains(event.target) && 
            notificationButton && 
            !notificationButton.contains(event.target)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/api/bookings/${id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings => bookings.map(b => b._id === id ? { ...b, status: 'confirmed' } : b));
        showToast('Booking approved.', 'info');
        showBrowserNotification('Booking Approved!', 'Your booking has been approved.');
      } else {
        showToast(data.message || 'Failed to approve', 'error');
      }
    } catch {
      showToast('Failed to approve', 'error');
    }
  };

  const handleStatusChange = async (status, bookingOverride) => {
    const booking = bookingOverride || selectedBooking;
    if (!booking) return;
    try {
      const res = await fetch(`http://localhost:3001/api/bookings/${booking._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setBookings(bookings => bookings.map(b => b._id === booking._id ? { ...b, status } : b));
        setSelectedBooking(null);
        showToast(`Booking marked as ${status}.`, 'info');
        showBrowserNotification(`Booking Status Updated!`, `Your booking status has been updated to ${status.charAt(0).toUpperCase() + status.slice(1)}.`);
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  function handleSendReminder(booking) {
    showToast(`Reminder sent to ${booking.playerDetails?.contactPerson?.phone || 'user'}.`, 'info');
    showBrowserNotification('Reminder Sent!', `Reminder sent to ${booking.playerDetails?.contactPerson?.phone || 'user'}.`);
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      showToast('Profile updated!', 'info');
      setShowProfile(false);
    }, 800);
  }

  // Filtering logic (add search)
  const filteredBookings = bookings.filter(b => {
    let match = true;
    
    // Status filter
    if (statusFilter && b.status !== statusFilter) {
      match = false;
    }
    
    // Date filter
    if (dateFilter) {
      const bookingDate = new Date(b.bookingDate);
      const bookingDateStr = bookingDate.toISOString().slice(0, 10);
      if (bookingDateStr !== dateFilter) {
        match = false;
      }
    }
    
    // User filter
    if (userFilter && b.userId && b.userId.name) {
      if (!b.userId.name.toLowerCase().includes(userFilter.toLowerCase())) {
        match = false;
      }
    }
    
    // Search filter
    if (search) {
      const s = search.toLowerCase();
      const searchableFields = [
        b.userId?.name || '',
        b.playerDetails?.contactPerson?.phone || '',
        b.bookingId || '',
        b.groundId?.name || '',
        b.playerDetails?.teamName || ''
      ];
      
      const hasMatch = searchableFields.some(field => 
        field.toLowerCase().includes(s)
      );
      
      if (!hasMatch) {
        match = false;
      }
    }
    
    return match;
  });
  


  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, userFilter, search]);

  // Pagination calculations
  const paginatedBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filteredBookings.length / pageSize);

  // Analytics
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const bookingsPerMonth = getBookingsPerMonth(bookings);
  const monthsSorted = Object.keys(bookingsPerMonth).sort();

  // Fetch available slots when ground or date changes
  useEffect(() => {
    async function fetchSlots() {
      setAvailableSlots([]);
      setAddBookingData(d => ({ ...d, startTime: '', endTime: '' }));
      if (!addBookingData.groundId || !addBookingData.date) return;
      setIsLoadingSlots(true);
      try {
        const dateStr = addBookingData.date;
        const res = await fetch(`http://localhost:3001/api/bookings/ground/${addBookingData.groundId}/${dateStr}`);
        const data = await res.json();
        if (data.success && data.availability) {
          setAvailableSlots(data.availability.availableSlots);
        } else {
          setAvailableSlots([]);
        }
      } catch {
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    fetchSlots();
    // eslint-disable-next-line
  }, [addBookingData.groundId, addBookingData.date]);

  // Helper: get all 24h times
  function getAll24hTimes() {
    return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  }

  // Helper: get display label for time (12h format)
  function getTimeDisplayLabel(time24h) {
    return formatTime12h(time24h);
  }
  // Helper: get booked slot ranges
  function getBookedRanges() {
    // availableSlots contains only available slots, so booked slots are the complement
    const allSlots = Array.from({ length: 24 }, (_, i) => {
      const start = `${i.toString().padStart(2, '0')}:00`;
      const end = `${((i + 1) % 24).toString().padStart(2, '0')}:00`;
      return `${start}-${end}`;
    });
    const availableSet = new Set(availableSlots);
    return allSlots.filter(slot => !availableSet.has(slot));
  }
  // Helper: get IST date string (yyyy-MM-dd)
  function getISTDateString(date = new Date()) {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const ist = new Date(utc + istOffset);
    return ist.toISOString().slice(0, 10);
  }
  // Helper: get IST hour
  function getISTHour(date = new Date()) {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    const ist = new Date(utc + istOffset);
    return ist.getHours();
  }
  // Helper: get available start times (cannot start in a booked slot)
  function getAvailableStartTimes() {
    const booked = getBookedRanges().map(slot => slot.split('-')[0]);
    let times = getAll24hTimes().filter(time => !booked.includes(time));
    // Hide past times for today (IST)
    if (addBookingData.date && addBookingData.date === getISTDateString()) {
      const currentHour = getISTHour();
      times = times.filter(time => parseInt(time.split(':')[0], 10) > currentHour);
    }
    return times;
  }
  // Helper: get available end times for a given start time (must not overlap with any booked slot)
  function getAvailableEndTimes(startTime) {
    if (!startTime) return [];
    const startIdx = getAll24hTimes().indexOf(startTime);
    if (startIdx === -1) return [];
    const endTimes = [];
    
    // Get all booked time ranges
    const bookedRanges = getBookedRanges().map(slot => {
      const [start, end] = slot.split('-');
      return {
        start: new Date(`2000-01-01 ${start}`),
        end: new Date(`2000-01-01 ${end}`)
      };
    });
    
    const startTimeDate = new Date(`2000-01-01 ${startTime}`);
    
    for (let i = startIdx + 1; i <= 24; i++) {
      if (i === 24) break;
      const endTime = getAll24hTimes()[i % 24];
      const endTimeDate = new Date(`2000-01-01 ${endTime}`);
      
      // Check if this time range overlaps with any booked range
      let hasOverlap = false;
      for (const bookedRange of bookedRanges) {
        if (startTimeDate < bookedRange.end && endTimeDate > bookedRange.start) {
          hasOverlap = true;
          break;
        }
      }
      
      if (hasOverlap) break;
      endTimes.push(endTime);
    }
    
    return endTimes;
  }
  // Helper: show duration
  function getDuration(start, end) {
    if (!start || !end) return '';
    const st = parseInt(start.split(':')[0], 10);
    const et = parseInt(end.split(':')[0], 10);
    let dur = et - st;
    if (dur <= 0) dur += 24;
    return dur;
  }

  // Helper: get slot label
  function getSlotLabel(start, end) {
    return `${start} - ${end}`;
  }

  // Helper to refresh slots
  async function refreshAvailableSlots(groundId, date) {
    if (!groundId || !date) return;
    setIsLoadingSlots(true);
    try {
      const res = await fetch(`http://localhost:3001/api/bookings/ground/${groundId}/${date}`);
      const data = await res.json();
      if (data.success && data.availability) {
        setAvailableSlots(data.availability.availableSlots);
      } else {
        setAvailableSlots([]);
      }
    } catch {
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }

  // Booking form submit handler
  async function handleAddBookingSubmit(e) {
    e.preventDefault();
    setAddBookingError('');
    // Validation
    if (!addBookingData.groundId || !addBookingData.date || !addBookingData.startTime || !addBookingData.endTime || !addBookingData.playerCount || !addBookingData.contactName || !addBookingData.contactPhone) {
      setAddBookingError('Please fill all required fields.');
      return;
    }
    if (!isPositiveInt(addBookingData.playerCount)) {
      setAddBookingError('Number of players must be a positive integer.');
      return;
    }
    if (!isValidPhone(addBookingData.contactPhone)) {
      setAddBookingError('Please enter a valid phone number (8-15 digits).');
      return;
    }
    if (!isValidEmail(addBookingData.contactEmail)) {
      setAddBookingError('Please enter a valid email address.');
      return;
    }
    // End time must be after start time
    const st = addBookingData.startTime.split(':').map(Number);
    const et = addBookingData.endTime.split(':').map(Number);
    if (et[0] < st[0] || (et[0] === st[0] && et[1] <= st[1])) {
      setAddBookingError('End time must be after start time.');
      return;
    }
    setIsCreatingBooking(true);
    try {
      const payload = {
        groundId: addBookingData.groundId,
        bookingDate: addBookingData.date,
        timeSlot: `${addBookingData.startTime}-${addBookingData.endTime}`,
        playerDetails: {
          teamName: addBookingData.teamName || undefined,
          playerCount: parseInt(addBookingData.playerCount),
          contactPerson: {
            name: addBookingData.contactName,
            phone: addBookingData.contactPhone,
            email: addBookingData.contactEmail || undefined,
          },
        },
        requirements: addBookingData.requirements || undefined,
      };
      const res = await fetch('http://localhost:3001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddBooking(false);
        setAddBookingData({ groundId: '', date: '', startTime: '', endTime: '', teamName: '', playerCount: '', contactName: '', contactPhone: '', contactEmail: '', requirements: '' });
        setBookings(bks => [data.booking, ...bks]);
        showToast('Booking created!', 'info');
        showBrowserNotification('Booking Created!', 'Your new booking has been created.');
        // Refresh slots for the same ground and date
        await refreshAvailableSlots(payload.groundId, payload.bookingDate);
      } else {
        setAddBookingError(data.message || 'Failed to create booking.');
        // Refresh slots in case of race condition
        await refreshAvailableSlots(payload.groundId, payload.bookingDate);
      }
    } catch {
      setAddBookingError('Failed to create booking.');
    } finally {
      setIsCreatingBooking(false);
    }
  }

  if (error) return <div style={{ color: 'red', padding: 32 }}>{error}</div>;
  if (!owner) return <div style={{ padding: 32 }}>Loading...</div>;

  // Unique statuses and users for filter dropdowns
  const uniqueStatuses = Array.from(new Set(bookings.map(b => b.status)));
  const uniqueUsers = Array.from(new Set(bookings.map(b => b.userId?.name).filter(Boolean)));

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          
          @keyframes slideIn {
            from { 
              transform: translateY(20px);
              opacity: 0;
            }
            to { 
              transform: translateY(0);
              opacity: 1;
            }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          .animate-slide-in {
            animation: slideIn 0.6s ease-out;
          }
          
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
          
          .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .hover-lift:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
      <div style={{ 
        maxWidth: 1200, 
        margin: '40px auto', 
        padding: 0, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        borderRadius: 20, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)', 
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh'
      }}>
        <Toasts />
      
      {/* Enhanced Header */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '24px 40px',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}>
            🏏
          </div>
          <div>
            <h2 style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: '#1a1a1a', 
              margin: 0,
              letterSpacing: '-0.5px'
            }}>
              Welcome back, {owner.name}
            </h2>
            <p style={{ 
              fontSize: 14, 
              color: '#666', 
              margin: 0,
              fontWeight: 500
            }}>
              Ground Owner Dashboard
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            data-notification-button
            style={{ 
              padding: '12px 20px', 
              borderRadius: 12, 
              border: 'none', 
              background: unreadCount > 0 
                ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' 
                : 'rgba(255, 255, 255, 0.9)', 
              color: unreadCount > 0 ? '#fff' : '#666', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer', 
              boxShadow: unreadCount > 0 ? '0 4px 15px rgba(255, 107, 107, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = unreadCount > 0 ? '0 6px 20px rgba(255, 107, 107, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = unreadCount > 0 ? '0 4px 15px rgba(255, 107, 107, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -6,
                right: -6,
                background: '#fff',
                color: '#ff6b6b',
                borderRadius: '50%',
                width: 20,
                height: 20,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                animation: 'pulse 2s infinite'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setShowAddBooking(true)} 
            style={{ 
              padding: '12px 24px', 
              borderRadius: 12, 
              border: 'none', 
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
              color: '#fff', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer', 
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
            }}
          >
            ➕ Add Booking
          </button>
          
          <button 
            onClick={() => setShowProfile(p => !p)} 
            style={{ 
              padding: '12px 20px', 
              borderRadius: 12, 
              border: 'none', 
              background: 'rgba(255, 255, 255, 0.9)', 
              color: '#666', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer', 
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.background = 'rgba(255, 255, 255, 1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.background = 'rgba(255, 255, 255, 0.9)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            ⚙️ Settings
          </button>
          
          <button 
            onClick={onLogout} 
            style={{ 
              padding: '12px 20px', 
              borderRadius: 12, 
              border: 'none', 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', 
              color: '#fff', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer', 
              boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>
      
      {/* Notification Panel */}
      {showNotifications && (
        <div style={{ 
          position: 'fixed', 
          top: 100, 
          right: 40, 
          width: 400, 
          maxHeight: 500, 
          background: '#fff', 
          borderRadius: 12, 
          boxShadow: '0 4px 20px #0003', 
          zIndex: 2000, 
          border: '1px solid #e0e0e0',
          overflow: 'hidden'
        }} data-notification-panel>
          <div style={{ 
            padding: '16px 20px', 
            borderBottom: '1px solid #e0e0e0', 
            background: '#f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#333' }}>
                🔔 Notifications ({notifications.length})
              </h3>
              {unreadCount > 0 && (
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                onClick={() => setAudioEnabled(!audioEnabled)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: audioEnabled ? '#1976d2' : '#999', 
                  cursor: 'pointer', 
                  fontSize: 16,
                  padding: 4
                }}
                title={audioEnabled ? 'Disable sound notifications' : 'Enable sound notifications'}
              >
                {audioEnabled ? '🔊' : '🔇'}
              </button>
              <button 
                onClick={() => {
                  setNotifications([]);
                  setUnreadCount(0);
                }}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#666', 
                  cursor: 'pointer', 
                  fontSize: 14,
                  textDecoration: 'underline'
                }}
              >
                Clear All
              </button>
            </div>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#666' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
                <div>No notifications yet</div>
                <div style={{ fontSize: 14, marginTop: 8 }}>You'll see new booking notifications here</div>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  style={{ 
                    padding: '16px 20px', 
                    borderBottom: index < notifications.length - 1 ? '1px solid #f0f0f0' : 'none',
                    background: notification.read ? '#fff' : '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => {
                    setNotifications(prev => 
                      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    if (notification.booking) {
                      setSelectedBooking(notification.booking);
                    }
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                    <div style={{ 
                      fontWeight: notification.read ? 400 : 600, 
                      fontSize: 16, 
                      color: '#333',
                      marginBottom: 4
                    }}>
                      {notification.title}
                    </div>
                    {!notification.read && (
                      <div style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%', 
                        background: '#1976d2',
                        flexShrink: 0,
                        marginTop: 4
                      }} />
                    )}
                  </div>
                  <div style={{ 
                    fontSize: 14, 
                    color: '#666', 
                    lineHeight: 1.4,
                    marginBottom: 8
                  }}>
                    {notification.message}
                  </div>
                  
                  {/* Show additional booking details if available */}
                  {notification.booking && (
                    <div style={{
                      background: '#f8f9fa',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ fontSize: 12, color: '#495057', marginBottom: 4 }}>
                        <strong>Booking ID:</strong> {notification.booking.bookingId}
                      </div>
                      {notification.booking.playerDetails?.teamName && (
                        <div style={{ fontSize: 12, color: '#495057', marginBottom: 4 }}>
                          <strong>Team:</strong> {notification.booking.playerDetails.teamName}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: '#495057', marginBottom: 4 }}>
                        <strong>Players:</strong> {notification.booking.playerDetails?.playerCount || 0}
                      </div>
                      <div style={{ fontSize: 12, color: '#495057', marginBottom: 4 }}>
                        <strong>Contact:</strong> {notification.booking.playerDetails?.contactPerson?.phone || 'N/A'}
                      </div>
                      <div style={{ fontSize: 12, color: '#495057' }}>
                        <strong>Amount:</strong> ₹{notification.booking.pricing?.totalAmount || 0}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ 
                    fontSize: 12, 
                    color: '#999',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{notification.timestamp.toLocaleTimeString()}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {notification.type === 'new_booking' && (
                        <span style={{ 
                          background: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '2px 8px', 
                          borderRadius: 12, 
                          fontSize: 11,
                          fontWeight: 500
                        }}>
                          New Booking
                        </span>
                      )}
                      {notification.booking && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(notification.booking);
                            setShowNotifications(false);
                          }}
                          style={{
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 8px',
                            fontSize: 11,
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#1565c0'}
                          onMouseLeave={(e) => e.target.style.background = '#1976d2'}
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {showAddBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 0, minWidth: 340, maxWidth: 480, width: '95vw', maxHeight: '90vh', boxShadow: '0 4px 32px #0003', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => setShowAddBooking(false)} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', zIndex: 2 }}>&times;</button>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: '32px 0 18px 0', textAlign: 'center' }}>Add New Booking</h2>
            <form onSubmit={handleAddBookingSubmit} style={{ overflowY: 'auto', padding: '0 32px 32px 32px', flex: 1 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Ground *</label><br />
                <select value={addBookingData.groundId} onChange={e => setAddBookingData(d => ({ ...d, groundId: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required>
                  <option value="">Select Ground</option>
                  {grounds.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Date *</label><br />
                <input type="date" value={addBookingData.date} min={format(new Date(), 'yyyy-MM-dd')} onChange={e => setAddBookingData(d => ({ ...d, date: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required />
              </div>
              <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600 }}>Start Time *</label><br />
                  <select value={addBookingData.startTime} onChange={e => setAddBookingData(d => ({ ...d, startTime: e.target.value, endTime: '' }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required disabled={isLoadingSlots || !availableSlots.length}>
                    <option value="">Select</option>
                    {getAvailableStartTimes().map(time => (
                      <option key={time} value={time}>{getTimeDisplayLabel(time)}</option>
                    ))}
                  </select>
                  {(!isLoadingSlots && availableSlots.length === 0) && (
                    <div style={{ color: '#e53935', fontSize: 14, marginTop: 4 }}>No available slots for this ground and date.</div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: 600 }}>End Time *</label><br />
                  <select value={addBookingData.endTime} onChange={e => setAddBookingData(d => ({ ...d, endTime: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required disabled={!addBookingData.startTime}>
                    <option value="">Select</option>
                    {getAvailableEndTimes(addBookingData.startTime).map(time => (
                      <option key={time} value={time}>{getTimeDisplayLabel(time)}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Show duration */}
              {addBookingData.startTime && addBookingData.endTime && (
                <div style={{ marginBottom: 12, color: '#388e3c', fontWeight: 600 }}>
                  Duration: {getDuration(addBookingData.startTime, addBookingData.endTime)} hour(s) ({formatTimeRange(addBookingData.startTime, addBookingData.endTime)})
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Team Name</label><br />
                <input type="text" value={addBookingData.teamName} onChange={e => setAddBookingData(d => ({ ...d, teamName: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Number of Players *</label><br />
                <input type="number" min={1} value={addBookingData.playerCount} onChange={e => setAddBookingData(d => ({ ...d, playerCount: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Contact Name *</label><br />
                <input type="text" value={addBookingData.contactName} onChange={e => setAddBookingData(d => ({ ...d, contactName: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Contact Phone *</label><br />
                <input type="tel" value={addBookingData.contactPhone} onChange={e => setAddBookingData(d => ({ ...d, contactPhone: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Contact Email</label><br />
                <input type="email" value={addBookingData.contactEmail} onChange={e => setAddBookingData(d => ({ ...d, contactEmail: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 600 }}>Special Requirements</label><br />
                <textarea value={addBookingData.requirements} onChange={e => setAddBookingData(d => ({ ...d, requirements: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} rows={2} />
              </div>
              {/* Validation errors */}
              {addBookingError && <div style={{ color: 'red', marginBottom: 12 }}>{addBookingError}</div>}
              <button type="submit" disabled={isCreatingBooking} style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: '#43a047', color: '#fff', fontWeight: 700, fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #43a04722', marginTop: 8 }}>{isCreatingBooking ? 'Creating...' : 'Create Booking'}</button>
            </form>
          </div>
        </div>
      )}
      {showProfile && (
        <form onSubmit={handleProfileSave} style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 12px #0001', padding: 32, margin: '32px 40px', maxWidth: 500 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#388e3c', marginBottom: 18 }}>Profile & Settings</h3>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Name:<br />
            <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Email:<br />
            <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} />
          </label>
          <label style={{ display: 'block', marginBottom: 12 }}>
            Phone:<br />
            <input type="text" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #bdbdbd', fontSize: 16 }} />
          </label>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
            <input type="checkbox" checked={profile.notifications} onChange={e => setProfile(p => ({ ...p, notifications: e.target.checked }))} style={{ marginRight: 8 }} />
            Receive notifications for new bookings
          </label>
          <button type="submit" style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#388e3c', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px #388e3c22' }}>Save</button>
        </form>
      )}
      {/* Enhanced Analytics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 24, 
        margin: '32px 40px', 
        alignItems: 'stretch'
      }}>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: 20, 
          padding: 32, 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20
            }}>
              📊
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 500, marginBottom: 4 }}>Total Bookings</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a' }}>{totalBookings}</div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: 20, 
          padding: 32, 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20
            }}>
              💰
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 500, marginBottom: 4 }}>Total Revenue</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a' }}>₹{totalRevenue}</div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: 20, 
          padding: 32, 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20
            }}>
              ⏳
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 500, marginBottom: 4 }}>Pending Bookings</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a' }}>
                {pendingCount}
                {pendingCount > 0 && (
                  <span style={{ 
                    display: 'inline-block', 
                    background: '#ff9800', 
                    color: '#fff', 
                    borderRadius: '50%', 
                    fontSize: 14, 
                    fontWeight: 700, 
                    padding: '4px 8px', 
                    marginLeft: 12,
                    animation: 'pulse 2s infinite'
                  }}>!</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(10px)',
          borderRadius: 20, 
          padding: 32, 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer'
        }} 
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.15)';
        }} 
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20
            }}>
              📈
            </div>
            <div>
              <div style={{ fontSize: 14, color: '#666', fontWeight: 500, marginBottom: 4 }}>Monthly Trend</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Bookings per Month</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
            {monthsSorted.map(month => (
              <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: 60 }}>
                <div style={{ 
                  width: 20, 
                  height: Math.max(bookingsPerMonth[month] * 8, 4), 
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)', 
                  borderRadius: 10, 
                  marginBottom: 8, 
                  transition: 'height 0.3s ease'
                }}></div>
                <div style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>{month.slice(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Enhanced Search and Export Bar */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: 20, 
        padding: 24, 
        margin: '32px 40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Search by user, phone, or booking ID..."
              style={{ 
                width: '100%',
                padding: '12px 16px', 
                borderRadius: 12, 
                border: '1px solid rgba(0, 0, 0, 0.1)', 
                fontSize: 16,
                background: 'rgba(255, 255, 255, 0.8)',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={() => downloadCSV(filteredBookings, 'bookings.csv')}
            style={{ 
              padding: '12px 24px', 
              borderRadius: 12, 
              border: 'none', 
              background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', 
              color: '#fff', 
              fontWeight: 600, 
              fontSize: 14, 
              cursor: 'pointer', 
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)';
            }}
          >
            📥 Export CSV
          </button>
        </div>
      </div>
      {/* Enhanced Grounds Section */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: 20, 
        padding: 32, 
        margin: '32px 40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h3 style={{ 
          fontSize: 24, 
          fontWeight: 700, 
          color: '#1a1a1a', 
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          🏟️ Your Grounds
        </h3>
        {grounds.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px', 
            color: '#666',
            background: 'rgba(0, 0, 0, 0.02)',
            borderRadius: 16
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No grounds found</div>
            <div style={{ fontSize: 14, color: '#888' }}>Add your cricket grounds to start receiving bookings</div>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: 24
          }}>
            {grounds.map(g => (
              <div key={g._id} style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                borderRadius: 16, 
                padding: 24, 
                border: '1px solid rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer'
              }} 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
              }} 
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 700
                  }}>
                    🏏
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{g.name}</div>
                    <div style={{ 
                      fontSize: 12, 
                      color: g.status === 'active' ? '#4CAF50' : '#ff9800', 
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {g.status}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 1.5 }}>{g.description}</div>
                <div style={{ fontSize: 13, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📍 {g.location.address}, {g.location.cityName}
                </div>
              </div>
            ))}
          </div>
                  )}
       </div>
       
       {/* Enhanced Bookings Section */}
       <div style={{ 
         background: 'rgba(255, 255, 255, 0.95)', 
         backdropFilter: 'blur(10px)',
         borderRadius: 20, 
         padding: 32, 
         margin: '32px 40px',
         boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
         border: '1px solid rgba(255, 255, 255, 0.2)'
       }}>
         <h3 style={{ 
           fontSize: 24, 
           fontWeight: 700, 
           color: '#1a1a1a', 
           marginBottom: 24,
           display: 'flex',
           alignItems: 'center',
           gap: 12
         }}>
           📋 All Bookings for Your Grounds
           {filteredBookings.length !== bookings.length && (
             <span style={{ 
               fontSize: 16, 
               fontWeight: 500, 
               color: '#666',
               background: 'rgba(102, 126, 234, 0.1)',
               padding: '4px 12px',
               borderRadius: 12,
               marginLeft: 12
             }}>
               Showing {filteredBookings.length} of {bookings.length} bookings
             </span>
           )}
         </h3>
                  {/* Enhanced Filter Controls */}
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            margin: '24px 0 28px 0', 
            alignItems: 'center', 
            background: 'rgba(102, 126, 234, 0.05)', 
            borderRadius: 16, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              fontWeight: 600, 
              color: '#667eea', 
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              🔍 Filter:
            </span>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, gap: 8 }}>
              <span>Status</span>
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 14,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All</option>
                {uniqueStatuses.map(status => <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, gap: 8 }}>
              <span>Date</span>
              <input 
                type="date" 
                value={dateFilter} 
                onChange={e => setDateFilter(e.target.value)} 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 14,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 500, gap: 8 }}>
              <span>User</span>
              <select 
                value={userFilter} 
                onChange={e => setUserFilter(e.target.value)} 
                style={{ 
                  padding: '8px 12px', 
                  borderRadius: 8, 
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  fontSize: 14,
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">All</option>
                {uniqueUsers.map(user => <option key={user} value={user}>{user}</option>)}
              </select>
            </label>
            <button 
              onClick={() => { 
                setStatusFilter(''); 
                setDateFilter(''); 
                setUserFilter(''); 
                setSearch('');
              }} 
              style={{ 
                padding: '8px 16px', 
                borderRadius: 8, 
                border: '1px solid rgba(0, 0, 0, 0.1)', 
                background: 'rgba(255, 255, 255, 0.9)', 
                color: '#667eea', 
                fontWeight: 600, 
                fontSize: 14, 
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 1)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🗑️ Clear All Filters
            </button>
          </div>
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', margin: '48px 0', color: '#888' }}>
            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg" alt="No bookings" style={{ width: 80, marginBottom: 16, opacity: 0.7 }} />
            <div style={{ fontSize: 20, fontWeight: 500 }}>No bookings found.</div>
            <div style={{ fontSize: 15, color: '#aaa', marginTop: 4 }}>Try adjusting your filters or check back later.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', borderRadius: 12, boxShadow: '0 1px 8px #0001', fontSize: 15 }}>
              <thead style={{ background: '#e8f5e9', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Booking ID</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>User</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Phone</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Ground</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Date</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Time</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Advance Paid</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Status</th>
                  <th style={{ padding: 14, borderBottom: '2px solid #c8e6c9', fontWeight: 700, color: '#1b5e20', background: '#e8f5e9' }}>Action</th>
            </tr>
          </thead>
          <tbody>
                {paginatedBookings.map((b, i) => (
                  <tr key={b._id} style={{ background: i % 2 === 0 ? '#f9fbe7' : '#fff', borderBottom: '1px solid #e0e0e0', transition: 'background 0.2s', cursor: 'pointer' }}
                    onClick={() => setSelectedBooking(b)}>
                    <td style={{ padding: 12 }}>{b.bookingId}</td>
                    <td style={{ padding: 12, display: 'flex', alignItems: 'center' }}>
                      <UserAvatar name={b.userId?.name || ''} />
                      <span>{b.userId?.name}<br /><span style={{ color: '#888', fontSize: 13 }}>{b.userId?.email}</span></span>
                    </td>
                    <td style={{ padding: 12 }}>{b.playerDetails?.contactPerson?.phone || '-'}</td>
                    <td style={{ padding: 12 }}>{b.groundId?.name} <br /> <span style={{ color: '#888', fontSize: 13 }}>{b.groundId?.location?.address}</span></td>
                    <td style={{ padding: 12 }}>{new Date(b.bookingDate).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>{formatTimeRange(b.timeSlot.startTime, b.timeSlot.endTime)}</td>
                    <td style={{ padding: 12, fontWeight: 600, color: '#2e7d32' }}>₹{b.pricing?.totalAmount || '-'}</td>
                    <td style={{ padding: 12 }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 12,
                        background: b.status === 'pending' ? '#fffde7' : b.status === 'confirmed' ? '#e3fcec' : '#e0e0e0',
                        color: b.status === 'pending' ? '#fbc02d' : b.status === 'confirmed' ? '#388e3c' : '#888',
                        fontWeight: 700,
                        fontSize: 15
                      }}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    </td>
                    <td style={{ padding: 12 }}>
                      {b.status === 'pending' && (
                        <button onClick={() => handleApprove(b._id)} style={{ padding: '7px 16px', background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #43a04722', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span role="img" aria-label="approve">✔️</span> Approve
                        </button>
                      )}
                      {b.status !== 'completed' && (
                        <button onClick={() => handleStatusChange('completed', b)} style={{ padding: '7px 16px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #1976d222', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span role="img" aria-label="complete">✅</span> Mark Completed
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => handleStatusChange('cancelled', b)} style={{ padding: '7px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #e5393522', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span role="img" aria-label="cancel">❌</span> Cancel
                        </button>
                      )}
                      <button onClick={() => handleSendReminder(b)} style={{ padding: '7px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #6c757d22', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span role="img" aria-label="reminder">⚠️</span> Send Reminder
                      </button>
                      <button onClick={() => {}} style={{ padding: '7px 16px', background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 1px 4px #43a04722', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span role="img" aria-label="download">⬇️</span> Download Invoice
                      </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '24px 0' }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #bdbdbd', background: page === 1 ? '#eee' : '#fff', color: '#388e3c', fontWeight: 600, fontSize: 15, cursor: page === 1 ? 'not-allowed' : 'pointer', marginRight: 8 }}>Prev</button>
              <span style={{ fontWeight: 600, fontSize: 16 }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #bdbdbd', background: page === totalPages ? '#eee' : '#fff', color: '#388e3c', fontWeight: 600, fontSize: 15, cursor: page === totalPages ? 'not-allowed' : 'pointer', marginLeft: 8 }}>Next</button>
            </div>
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </div>
      {/* Booking Details Modal */}
      {selectedBooking && <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} onStatusChange={handleStatusChange} />}
    </div>
    </>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('boxcric_token') || '');

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('boxcric_token', token);
  };
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('boxcric_token');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {!token ? <Login onLogin={handleLogin} /> : <Dashboard token={token} onLogout={handleLogout} />}
    </div>
  );
}

export default App;
