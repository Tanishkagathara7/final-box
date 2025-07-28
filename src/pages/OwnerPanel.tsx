import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Ground {
  _id: string;
  name: string;
  description: string;
  location: { address: string; cityName: string };
  price: { currency: string; ranges: any[] };
  status: string;
}

interface Booking {
  _id: string;
  bookingId: string;
  userId: { name: string; email: string };
  groundId: string;
  bookingDate: string;
  timeSlot: { startTime: string; endTime: string };
  status: string;
}

const API = "http://localhost:3001";

function getToken() {
  return localStorage.getItem("token");
}

function OwnerPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");

  // Fetch user info from token (assume /auth/me endpoint exists)
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.role === "ground_owner") {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch grounds and bookings if user is ground_owner
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const token = getToken();
    Promise.all([
      fetch(`${API}/grounds/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch(`${API}/bookings/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([groundsRes, bookingsRes]) => {
        if (groundsRes.success) setGrounds(groundsRes.grounds);
        if (bookingsRes.success) setBookings(bookingsRes.bookings);
        setLoading(false);
      })
      .catch((e) => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [user]);

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginForm),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          window.location.reload();
        } else {
          setLoginError(data.message || "Login failed");
        }
      })
      .catch(() => setLoginError("Login failed"));
  };

  // Approve booking
  const approveBooking = (id: string) => {
    const token = getToken();
    fetch(`${API}/bookings/${id}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBookings((prev) =>
            prev.map((b) => (b._id === id ? { ...b, status: "confirmed" } : b))
          );
        } else {
          alert(data.message || "Failed to approve booking");
        }
      })
      .catch(() => alert("Failed to approve booking"));
  };

  if (loading) return <div style={{ padding: 32 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, border: "1px solid #ccc", borderRadius: 8 }}>
        <h2>Ground Owner Login</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 12 }}>
            <label>Email<br />
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} required style={{ width: "100%" }} />
            </label>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Password<br />
              <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required style={{ width: "100%" }} />
            </label>
          </div>
          {loginError && <div style={{ color: "red", marginBottom: 8 }}>{loginError}</div>}
          <button type="submit" style={{ width: "100%", padding: 8 }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h2>Welcome, {user.name} (Ground Owner)</h2>
      <h3>Your Grounds</h3>
      {grounds.length === 0 ? <div>No grounds found.</div> : (
        <ul>
          {grounds.map(g => (
            <li key={g._id} style={{ marginBottom: 12, padding: 12, border: "1px solid #eee", borderRadius: 6 }}>
              <b>{g.name}</b> ({g.status})<br />
              {g.description}<br />
              {g.location.address}, {g.location.cityName}
            </li>
          ))}
        </ul>
      )}
      <h3>Bookings</h3>
      {bookings.length === 0 ? <div>No bookings found.</div> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id} style={{ borderBottom: "1px solid #eee" }}>
                <td>{b.bookingId}</td>
                <td>{b.userId?.name} <br /> {b.userId?.email}</td>
                <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                <td>{b.timeSlot.startTime} - {b.timeSlot.endTime}</td>
                <td>{b.status}</td>
                <td>
                  {b.status === "pending" ? (
                    <button onClick={() => approveBooking(b._id)} style={{ padding: 6 }}>Approve</button>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
    </div>
  );
}

export default OwnerPanel; 