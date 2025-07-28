// Admin Panel JavaScript
let token = localStorage.getItem('adminToken');
let currentSection = 'grounds';
let bookingsCache = [];
let selectedBookingId = null;


const BASE_API_URL = 'http://localhost:4000';

// Check if already logged in
if (token) {
    showMainContent();
} else {
    // Show login form if not logged in
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
}

// Login Form
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

        const data = await response.json();
  if (data.token) {
    token = data.token;
            localStorage.setItem('adminToken', token);
            showMainContent();
  } else {
            alert('Login failed: ' + (data.message || 'Invalid credentials'));
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login error: ' + error.message);
    }
});

function showMainContent() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'block';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userEmail').textContent = 'admin@boxcric.com';
    
    // Only load data if we have a valid token
    if (token) {
        loadGrounds();
        loadLocations();
        populateCityDropdown();
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    token = null;
    location.reload();
}

// Navigation
function showSection(section) {
    currentSection = section;
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide sections
    document.getElementById('groundsSection').style.display = section === 'grounds' ? 'block' : 'none';
    document.getElementById('locationsSection').style.display = section === 'locations' ? 'block' : 'none';
    document.getElementById('bookingsSection').style.display = section === 'bookings' ? 'block' : 'none';
    
    if (section === 'bookings') {
        loadBookings();
    }
}

// Grounds Management
function showAddGroundForm() {
    document.getElementById('addGroundForm').style.display = 'block';
    document.getElementById('groundsList').style.display = 'none';
    document.getElementById('ownerPassword').value = '';
}

function hideAddGroundForm() {
    document.getElementById('addGroundForm').style.display = 'none';
    document.getElementById('groundsList').style.display = 'block';
    document.getElementById('groundForm').reset();
}

// --- Dynamic Price Ranges Logic ---
const hourOptions = Array.from({length: 24}, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `<option value="${hour}:00">${hour}:00</option>`;
});

function setDropdownOptions(select, value) {
  select.innerHTML = hourOptions.join('');
  if (value) select.value = value;
}

function updateSecondSlot() {
  const firstStart = document.querySelector('.price-range-row[data-idx="0"] .price-range-start').value;
  const firstEnd = document.querySelector('.price-range-row[data-idx="0"] .price-range-end').value;
  const secondStart = document.querySelector('.price-range-row[data-idx="1"] .price-range-start');
  const secondEnd = document.querySelector('.price-range-row[data-idx="1"] .price-range-end');
  secondStart.value = firstEnd;
  secondEnd.value = firstStart;
}

document.addEventListener('DOMContentLoaded', () => {
  // Set dropdowns for both rows
  setDropdownOptions(document.querySelector('.price-range-row[data-idx="0"] .price-range-start'), '20:00');
  setDropdownOptions(document.querySelector('.price-range-row[data-idx="0"] .price-range-end'), '08:00');
  setDropdownOptions(document.querySelector('.price-range-row[data-idx="1"] .price-range-start'), '08:00');
  setDropdownOptions(document.querySelector('.price-range-row[data-idx="1"] .price-range-end'), '20:00');

  // Initial update
  updateSecondSlot();

  // Listen for changes on first slot
  document.querySelector('.price-range-row[data-idx="0"] .price-range-start').addEventListener('change', updateSecondSlot);
  document.querySelector('.price-range-row[data-idx="0"] .price-range-end').addEventListener('change', updateSecondSlot);
});

// --- END Dynamic Price Ranges Logic ---

// --- Edit Ground Logic ---
let editingGroundId = null;
let currentEditingPassword = ''; // Store password during editing session

window.editGround = async function(id) {
  try {
    const response = await fetch(`${BASE_API_URL}/api/admin/grounds`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await response.json();
    
    // Handle both array and object responses
    const grounds = Array.isArray(data) ? data : (data.grounds || []);
    const ground = grounds.find(g => g._id === id);
    
    if (!ground) {
      console.error('Ground not found:', id);
      return alert('Ground not found!');
    }
    
    // Clear previous password if editing a different ground
    if (editingGroundId !== id) {
        currentEditingPassword = '';
    }
    editingGroundId = id;
    
    // Show form
    showAddGroundForm();
    
    // Populate fields
    document.getElementById('groundName').value = ground.name || '';
    document.getElementById('groundDescription').value = ground.description || '';
    document.getElementById('groundCity').value = ground.location?.cityId || '';
    document.getElementById('groundAddress').value = ground.location?.address || '';
    document.getElementById('groundPincode').value = ground.location?.pincode || '';
    
    // Price ranges - handle both old and new format
    let ranges = [];
    if (ground.price?.ranges && Array.isArray(ground.price.ranges)) {
      ranges = ground.price.ranges;
    } else if (ground.price?.perHour) {
      // Convert old format to new format
      ranges = [
        { start: '06:00', end: '18:00', perHour: ground.price.perHour },
        { start: '18:00', end: '06:00', perHour: ground.price.perHour }
      ];
    } else {
      ranges = [{start:'',end:'',perHour:''},{start:'',end:'',perHour:''}];
    }
    
    // Ensure we have at least 2 ranges
    while (ranges.length < 2) {
      ranges.push({start:'',end:'',perHour:''});
    }
    
    setDropdownOptions(document.querySelector('.price-range-row[data-idx="0"] .price-range-start'), ranges[0].start);
    setDropdownOptions(document.querySelector('.price-range-row[data-idx="0"] .price-range-end'), ranges[0].end);
    setDropdownOptions(document.querySelector('.price-range-row[data-idx="1"] .price-range-start'), ranges[1].start);
    setDropdownOptions(document.querySelector('.price-range-row[data-idx="1"] .price-range-end'), ranges[1].end);
    document.querySelector('.price-range-row[data-idx="0"] .price-range-perHour').value = ranges[0].perHour || '';
    document.querySelector('.price-range-row[data-idx="1"] .price-range-perHour').value = ranges[1].perHour || '';
    
    // Discount
    document.getElementById('groundDiscount').value = ground.price?.discount || 0;
    
    // Images
    const images = Array.isArray(ground.images) ? ground.images : [];
    document.getElementById('groundImage1').value = images[0]?.url || '';
    document.getElementById('groundImage2').value = images[1]?.url || '';
    document.getElementById('groundImage3').value = images[2]?.url || '';
    
    // Features
    const features = ground.features || {};
    document.getElementById('groundPitchType').value = features.pitchType || '';
    document.getElementById('groundCapacity').value = features.capacity || '';
    document.getElementById('groundLighting').checked = features.lighting || false;
    document.getElementById('groundParking').checked = features.parking || false;
    document.getElementById('groundChangeRoom').checked = features.changeRoom || false;
    document.getElementById('groundWashroom').checked = features.washroom || false;
    document.getElementById('groundCafeteria').checked = features.cafeteria || false;
    document.getElementById('groundEquipment').checked = features.equipment || false;
    
    // Owner
    const owner = ground.owner || {};
    document.getElementById('ownerName').value = owner.name || '';
    document.getElementById('ownerEmail').value = owner.email || '';
    document.getElementById('ownerContact').value = owner.contact || '';
    // Restore password from current editing session if available, otherwise keep empty
    document.getElementById('ownerPassword').value = currentEditingPassword || '';
    document.getElementById('ownerUserId').value = owner.userId || '';
    
    // Rating
    const rating = ground.rating || {};
    document.getElementById('groundRating').value = rating.average || 0;
    document.getElementById('groundRatingCount').value = rating.count || 0;
    
    // Policies
    const policies = ground.policies || {};
    document.getElementById('cancellationPolicy').value = policies.cancellation || '';
    document.getElementById('advanceBooking').value = policies.advanceBooking || 30;
    document.getElementById('groundRules').value = Array.isArray(policies.rules) ? policies.rules.join('\n') : '';
    
    // Change submit button text
    document.querySelector('#groundForm button[type="submit"]').textContent = 'Update Ground';
    
    console.log('Ground loaded for editing:', ground);
  } catch (err) {
    console.error('Error loading ground for edit:', err);
    alert('Error loading ground for edit: ' + err.message);
  }
};

// Update form submission logic
const groundForm = document.getElementById('groundForm');
groundForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ... existing code to build formData ...
    const formData = {
        name: document.getElementById('groundName').value,
        description: document.getElementById('groundDescription').value,
        location: {
            cityId: document.getElementById('groundCity').value,
            address: document.getElementById('groundAddress').value,
            pincode: document.getElementById('groundPincode').value,
        },
        price: {
            ranges: [0, 1].map(idx => {
                const container = document.getElementById('priceRangesContainer');
                const row = container.querySelector(`.price-range-row[data-idx="${idx}"]`);
                const start = row.querySelector('.price-range-start').value;
                const end = row.querySelector('.price-range-end').value;
                const perHour = row.querySelector('.price-range-perHour').value;
                return { start, end, perHour: Number(perHour) };
            }),
            currency: "INR",
            discount: Number(document.getElementById('groundDiscount').value) || 0
        },
        images: [],
        amenities: [],
        features: {
            pitchType: document.getElementById('groundPitchType').value,
            capacity: Number(document.getElementById('groundCapacity').value),
            lighting: document.getElementById('groundLighting').checked,
            parking: document.getElementById('groundParking').checked,
            changeRoom: document.getElementById('groundChangeRoom').checked,
            washroom: document.getElementById('groundWashroom').checked,
            cafeteria: document.getElementById('groundCafeteria').checked,
            equipment: document.getElementById('groundEquipment').checked
        },
        owner: {
            name: document.getElementById('ownerName').value,
            email: document.getElementById('ownerEmail').value,
            contact: document.getElementById('ownerContact').value,
            password: document.getElementById('ownerPassword').value,
            verified: true,
            userId: document.getElementById('ownerUserId').value || undefined
        },
        rating: {
            average: Number(document.getElementById('groundRating').value) || 0,
            count: Number(document.getElementById('groundRatingCount').value) || 0,
            reviews: []
        },
        policies: {
            cancellation: document.getElementById('cancellationPolicy').value || "Free cancellation up to 24 hours before booking",
            advanceBooking: Number(document.getElementById('advanceBooking').value) || 30,
            rules: document.getElementById('groundRules').value.split('\n').filter(rule => rule.trim())
        }
    };
    // Images
    const image1 = document.getElementById('groundImage1').value;
    const image2 = document.getElementById('groundImage2').value;
    const image3 = document.getElementById('groundImage3').value;
    if (image1) {
        formData.images.push({ url: image1, alt: formData.name, isPrimary: true });
    }
    if (image2) {
        formData.images.push({ url: image2, alt: formData.name + " - View 2", isPrimary: false });
    }
    if (image3) {
        formData.images.push({ url: image3, alt: formData.name + " - View 3", isPrimary: false });
    }
    if (formData.images.length === 0) {
        formData.images.push({ 
            url: "https://placehold.co/400x300?text=Ground+Image", 
            alt: formData.name, 
            isPrimary: true 
        });
    }
    // Amenities
    document.querySelectorAll('input[type="checkbox"][value]').forEach(checkbox => {
        if (checkbox.checked) {
            formData.amenities.push(checkbox.value);
        }
    });
    try {
        // Store the current password value if we're editing
        if (editingGroundId) {
            currentEditingPassword = document.getElementById('ownerPassword').value;
        }
        
        let response, data;
        if (editingGroundId) {
            response = await fetch(`${BASE_API_URL}/api/admin/grounds/${editingGroundId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            data = await response.json();
        } else {
            response = await fetch(`${BASE_API_URL}/api/admin/grounds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            data = await response.json();
        }
        if (response.ok) {
            alert(editingGroundId ? 'Ground updated successfully!' : 'Ground added successfully!');
            // Clear the stored password after successful update
            currentEditingPassword = '';
            hideAddGroundForm();
            loadGrounds();
            editingGroundId = null;
            document.querySelector('#groundForm button[type="submit"]').textContent = 'Add Ground';
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Reset editing state when hiding form
const originalHideAddGroundForm = hideAddGroundForm;
hideAddGroundForm = function() {
  editingGroundId = null;
  currentEditingPassword = ''; // Clear stored password when hiding form
  document.querySelector('#groundForm button[type="submit"]').textContent = 'Add Ground';
  originalHideAddGroundForm();
};

// Add event listener to password field to store changes
document.addEventListener('DOMContentLoaded', function() {
  const passwordField = document.getElementById('ownerPassword');
  if (passwordField) {
    passwordField.addEventListener('input', function() {
      if (editingGroundId) {
        currentEditingPassword = this.value;
        console.log('Password stored for editing session:', currentEditingPassword ? '***' : '(empty)');
      }
    });
  }
});

async function loadGrounds() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/grounds`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('adminToken');
                token = null;
                location.reload();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let data = await response.json();
        console.log('Grounds response:', data);
        
        // Handle different response formats
        let grounds = [];
        if (Array.isArray(data)) {
            grounds = data;
        } else if (data && Array.isArray(data.grounds)) {
            grounds = data.grounds;
        } else if (data && data.success && Array.isArray(data.grounds)) {
            grounds = data.grounds;
        } else {
            console.error('Unexpected grounds response format:', data);
            return;
        }
        
        console.log('Processed grounds:', grounds);
        
        const tbody = document.getElementById('groundsTableBody');
        if (!tbody) {
            console.error('Grounds table body not found');
            return;
        }
        
        tbody.innerHTML = '';
        
        grounds.forEach(ground => {
            const row = document.createElement('tr');
            let priceHtml = '';
            
            // Handle different price formats
            if (Array.isArray(ground.price?.ranges) && ground.price.ranges.length > 0) {
                ground.price.ranges.forEach(range => {
                    if (range.start && range.end && range.perHour) {
                        priceHtml += `<div>${range.start} - ${range.end}: ₹${range.perHour}</div>`;
                    }
                });
            } else if (ground.price?.perHour) {
                priceHtml = `<div>₹${ground.price.perHour}/hour</div>`;
            } else {
                priceHtml = '<div>No pricing info</div>';
            }
            
            const ratingHtml = ground.rating?.average ? 
                `<div class="rating-display">
                    <span class="rating-star">★</span>
                    <span class="rating-value">${ground.rating.average}</span>
                    <span class="rating-count">(${ground.rating.count})</span>
                </div>` : 
                '<span style="color: #666;">No rating</span>';
            
            row.innerHTML = `
                <td>${ground.name || 'N/A'}</td>
                <td>${ground.location?.cityName || ground.location?.cityId || 'N/A'}</td>
                <td>${priceHtml}</td>
                <td>${ratingHtml}</td>
                <td><span class="status ${ground.status || 'pending'}">${ground.status || 'pending'}</span></td>
                <td>
                    <button onclick="editGround('${ground._id}')" class="btn-small">Edit</button>
                    <button onclick="deleteGround('${ground._id}')" class="btn-small btn-danger">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('Grounds table updated with', grounds.length, 'grounds');
    } catch (error) {
        console.error('Error loading grounds:', error);
        alert('Error loading grounds: ' + error.message);
    }
}

async function deleteGround(id) {
    if (!confirm('Are you sure you want to delete this ground?')) return;
    
    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/grounds/${id}`, {
    method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
  });
        
        if (response.ok) {
            alert('Ground deleted successfully!');
  loadGrounds();
        } else {
            alert('Error deleting ground');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Locations Management
function showAddLocationForm() {
    document.getElementById('addLocationForm').style.display = 'block';
    document.getElementById('locationsList').style.display = 'none';
}

function hideAddLocationForm() {
    document.getElementById('addLocationForm').style.display = 'none';
    document.getElementById('locationsList').style.display = 'block';
    document.getElementById('locationForm').reset();
    // Reset editing state
    document.getElementById('locationForm').dataset.editingId = '';
    document.querySelector('#locationForm button[type="submit"]').textContent = 'Add Location';
}

// Location Form Submission
document.getElementById('locationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('locationId').value,
        name: document.getElementById('locationName').value,
        state: document.getElementById('locationState').value,
        latitude: Number(document.getElementById('locationLat').value),
        longitude: Number(document.getElementById('locationLng').value),
        popular: document.getElementById('locationPopular').checked
    };

    const editingId = document.getElementById('locationForm').dataset.editingId;

    try {
        let response, data;
        
        if (editingId) {
            // Update existing location
            response = await fetch(`${BASE_API_URL}/api/admin/locations/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        } else {
            // Create new location
            response = await fetch(`${BASE_API_URL}/api/admin/locations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
        }

        data = await response.json();
        if (response.ok) {
            alert(editingId ? 'Location updated successfully!' : 'Location added successfully!');
            hideAddLocationForm();
            loadLocations();
            populateCityDropdown();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error saving location: ' + error.message);
    }
});

async function loadLocations() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('adminToken');
                token = null;
                location.reload();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let locations = await response.json();
        
        // Ensure locations is an array
        if (!Array.isArray(locations)) {
            if (locations && Array.isArray(locations.locations)) {
                locations = locations.locations;
            } else {
                console.error('Expected array of locations, got:', locations);
                return;
            }
        }
        
        console.log('Loaded locations:', locations);
        
        // Populate city dropdown
        const dropdown = document.getElementById('groundCity');
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Select City</option>';
            
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.id;
                option.textContent = `${location.name}, ${location.state}`;
                dropdown.appendChild(option);
            });
            
            console.log('City dropdown populated with', locations.length, 'cities');
        }
        
        // Populate locations table
        const tbody = document.getElementById('locationsTableBody');
        if (tbody) {
            tbody.innerHTML = '';
            
            locations.forEach(location => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${location.id || 'N/A'}</td>
                    <td>${location.name || 'N/A'}</td>
                    <td>${location.state || 'N/A'}</td>
                    <td><span class="status ${location.popular ? 'popular' : 'not-popular'}">${location.popular ? 'Yes' : 'No'}</span></td>
                    <td>
                        <button onclick="editLocation('${location.id}')" class="btn-small">Edit</button>
                        <button onclick="deleteLocation('${location.id}')" class="btn-small btn-danger">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            console.log('Locations table populated with', locations.length, 'locations');
        }
    } catch (error) {
        console.error('Error loading locations:', error);
        alert('Error loading locations: ' + error.message);
    }
}

async function populateCityDropdown() {
    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid
                localStorage.removeItem('adminToken');
                token = null;
                location.reload();
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        let locations = await response.json();
        
        // Ensure locations is an array
        if (!Array.isArray(locations)) {
            if (locations && Array.isArray(locations.locations)) {
                locations = locations.locations;
            } else {
                console.error('Expected array of locations, got:', locations);
                return;
            }
        }
        
        console.log('Populating city dropdown with locations:', locations);
        
        const dropdown = document.getElementById('groundCity');
        if (!dropdown) {
            console.error('City dropdown not found');
            return;
        }
        
        dropdown.innerHTML = '<option value="">Select City</option>';
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location.id;
            option.textContent = `${location.name}, ${location.state}`;
            dropdown.appendChild(option);
        });
        
        console.log('City dropdown populated with', locations.length, 'cities');
    } catch (error) {
        console.error('Error loading cities:', error);
        alert('Error loading cities: ' + error.message);
    }
}

// Location management functions
window.editLocation = async function(id) {
    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/locations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const locations = await response.json();
        const location = locations.find(l => l.id === id);
        
        if (!location) {
            alert('Location not found!');
            return;
        }
        
        // Populate form for editing
        document.getElementById('locationId').value = location.id;
        document.getElementById('locationName').value = location.name;
        document.getElementById('locationState').value = location.state;
        document.getElementById('locationLat').value = location.latitude;
        document.getElementById('locationLng').value = location.longitude;
        document.getElementById('locationPopular').checked = location.popular;
        
        // Show form
        showAddLocationForm();
        
        // Change submit button text
        document.querySelector('#locationForm button[type="submit"]').textContent = 'Update Location';
        
        // Store the location ID being edited
        document.getElementById('locationForm').dataset.editingId = id;
        
    } catch (error) {
        console.error('Error loading location for edit:', error);
        alert('Error loading location for edit: ' + error.message);
    }
}

window.deleteLocation = async function(id) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
        const response = await fetch(`${BASE_API_URL}/api/admin/locations/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            alert('Location deleted successfully!');
            loadLocations();
        } else {
            alert('Error deleting location');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadBookings() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    console.log('No admin token found');
    return;
  }
  try {
    console.log('Fetching bookings from admin endpoint...');
    const response = await fetch('http://localhost:3001/api/admin/bookings', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Bookings response:', data);
    if (!data.success) throw new Error(data.message || 'Failed to fetch bookings');
    bookingsCache = data.bookings;
    console.log('Loaded bookings:', bookingsCache.length);
    console.log('Latest booking dates:', bookingsCache.slice(0, 3).map(b => new Date(b.bookingDate).toLocaleDateString()));
    renderBookingsTable(bookingsCache);
  } catch (error) {
    console.error('Error loading bookings:', error);
    alert('Error loading bookings: ' + error.message);
  }
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  tbody.innerHTML = '';
  bookings.forEach(booking => {
    const userName = booking.userId && booking.userId.name ? booking.userId.name : booking.userId || '';
    const groundName = booking.groundId && booking.groundId.name ? booking.groundId.name : booking.groundId || '';
    let actionHtml = '';
    if (booking.status !== 'confirmed') {
      actionHtml = `<button class="btn-small btn-primary" data-confirm-id="${booking._id}">Confirm</button>`;
    }
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${booking.bookingId || ''}</td>
      <td>${userName}</td>
      <td>${groundName}</td>
      <td>${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : ''}</td>
      <td>${booking.timeSlot ? formatTimeRange(booking.timeSlot.startTime, booking.timeSlot.endTime) : ''}</td>
      <td>${booking.status || ''}</td>
      <td>${booking.pricing ? booking.pricing.totalAmount : ''}</td>
      <td>${actionHtml}</td>
    `;
    tbody.appendChild(tr);
  });
  // Attach event listeners for confirm buttons
  tbody.querySelectorAll('button[data-confirm-id]').forEach(btn => {
    btn.onclick = async function() {
      const id = btn.getAttribute('data-confirm-id');
      try {
        const response = await fetch(`http://localhost:3001/api/admin/bookings/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: 'confirmed' })
        });
        const data = await response.json();
        if (data.success) {
          alert('Booking confirmed!');
          loadBookings();
        } else {
          alert('Error confirming booking: ' + (data.message || ''));
        }
      } catch (err) {
        alert('Error confirming booking: ' + err.message);
      }
    };
  });
}

// Helper: convert 24h time to 12h format for display
function formatTime12h(time24h) {
  // Add validation to ensure we're getting a proper time format
  if (!time24h || typeof time24h !== 'string') {
    console.warn('Invalid time format:', time24h);
    return time24h;
  }
  
  // Check if it's a time range (contains '-')
  if (time24h.includes('-')) {
    console.warn('Time range passed to formatTime12h, extracting start time:', time24h);
    // Extract the start time from the range
    const startTime = time24h.split('-')[0];
    return formatTime12h(startTime); // Recursively format the start time
  }
  
  const [hours, minutes] = time24h.split(':');
  if (!hours || !minutes) {
    console.warn('Invalid time format (missing hours or minutes):', time24h);
    return time24h;
  }
  
  const hour = parseInt(hours, 10);
  if (isNaN(hour) || hour < 0 || hour > 23) {
    console.warn('Invalid hour:', hour, 'from time:', time24h);
    return time24h;
  }
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
}

// Helper: format time range for display
function formatTimeRange(startTime, endTime) {
  return `${formatTime12h(startTime)} - ${formatTime12h(endTime)}`;
}

// Booking Form Functions
function showAddBookingForm() {
  document.getElementById('addBookingForm').style.display = 'block';
  document.getElementById('bookingsTable').style.display = 'none';
  populateBookingGrounds();
  setMinDate();
  resetBookingForm();
}

function hideAddBookingForm() {
  document.getElementById('addBookingForm').style.display = 'none';
  document.getElementById('bookingsTable').style.display = 'block';
  document.getElementById('bookingForm').reset();
}

function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').min = today;
  document.getElementById('bookingDate').value = today;
}

function resetBookingForm() {
  document.getElementById('bookingForm').reset();
  setMinDate();
  document.getElementById('bookingStartTime').innerHTML = '<option value="">Select</option>';
  document.getElementById('bookingEndTime').innerHTML = '<option value="">Select</option>';
  document.getElementById('bookingStartTime').disabled = true;
  document.getElementById('bookingEndTime').disabled = true;
  document.getElementById('bookingDuration').textContent = '';
}

async function populateBookingGrounds() {
  try {
    console.log('Fetching grounds for booking...');
    
    // Use admin panel server with auth
    const response = await fetch(`${BASE_API_URL}/api/admin/grounds`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Grounds API response:', data);
    
    // Handle different response formats
    let grounds = [];
    if (Array.isArray(data)) {
      grounds = data;
    } else if (data && Array.isArray(data.grounds)) {
      grounds = data.grounds;
    } else if (data && data.success && Array.isArray(data.grounds)) {
      grounds = data.grounds;
    } else {
      console.error('Unexpected grounds response format:', data);
      throw new Error('Invalid grounds response format');
    }
    
    console.log('Processed grounds:', grounds);
    console.log('Number of grounds found:', grounds ? grounds.length : 0);
    
    if (!grounds || grounds.length === 0) {
      throw new Error('No grounds available');
    }
    
    const groundSelect = document.getElementById('bookingGroundId');
    if (!groundSelect) {
      console.error('Booking ground select not found');
      return;
    }
    
    groundSelect.innerHTML = '<option value="">Select Ground</option>';
    
    grounds.forEach(ground => {
      const option = document.createElement('option');
      option.value = ground._id;
      option.textContent = ground.name || 'Unnamed Ground';
      groundSelect.appendChild(option);
      console.log('Added ground option:', ground.name, 'with ID:', ground._id);
    });
    
    console.log('Total options added to dropdown:', groundSelect.options.length - 1); // -1 for the "Select Ground" option
  } catch (error) {
    console.error('Error loading grounds:', error);
    alert('Error loading grounds: ' + error.message);
  }
}

// Generate all 24h time slots
function getAll24hTimes() {
  const times = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
  console.log('Generated 24h times:', times);
  return times;
}

// Get available start times
function getAvailableStartTimes() {
  const times = getAll24hTimes();
  const now = new Date();
  const currentHour = now.getHours();
  const selectedDate = document.getElementById('bookingDate').value;
  const today = new Date().toISOString().split('T')[0];
  
  if (selectedDate === today) {
    return times.filter(time => parseInt(time.split(':')[0], 10) > currentHour);
  }
  return times;
}

// Get available end times for a given start time
function getAvailableEndTimes(startTime) {
  if (!startTime) return [];
  console.log('Getting end times for start time:', startTime);
  
  const allTimes = getAll24hTimes();
  const startIdx = allTimes.indexOf(startTime);
  console.log('Start time index:', startIdx);
  
  if (startIdx === -1) return [];
  
  const endTimes = [];
  for (let i = startIdx + 1; i < 24; i++) {
    endTimes.push(allTimes[i]);
  }
  console.log('Available end times:', endTimes);
  return endTimes;
}

// Calculate duration
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '';
  const st = parseInt(startTime.split(':')[0], 10);
  const et = parseInt(endTime.split(':')[0], 10);
  let dur = et - st;
  if (dur <= 0) dur += 24;
  return dur;
}

// Update time slots when ground or date changes
async function updateBookingTimeSlots() {
  const groundId = document.getElementById('bookingGroundId').value;
  const date = document.getElementById('bookingDate').value;
  
  if (!groundId || !date) {
    document.getElementById('bookingStartTime').innerHTML = '<option value="">Select</option>';
    document.getElementById('bookingStartTime').disabled = true;
    document.getElementById('bookingEndTime').innerHTML = '<option value="">Select</option>';
    document.getElementById('bookingEndTime').disabled = true;
    return;
  }
  
  try {
    // Get available slots from server - use admin endpoint for individual time slots
    const url = `http://localhost:3001/api/admin/bookings/ground/${groundId}/${date}`;
    console.log('Calling admin availability endpoint:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Availability API response:', data);
    
    let availableSlots = [];
    if (data.success && data.availability && Array.isArray(data.availability.availableSlots)) {
      availableSlots = data.availability.availableSlots;
      console.log('Using server-provided available slots:', availableSlots);
      
      // Validate that we're getting individual times, not ranges
      const hasRanges = availableSlots.some(slot => slot.includes('-'));
      if (hasRanges) {
        console.warn('Server returned time ranges instead of individual times, using fallback');
        availableSlots = getAll24hTimes();
      }
    } else {
      console.log('No valid server data, using fallback 24h times');
      availableSlots = getAll24hTimes();
    }
    console.log('Available slots from server:', availableSlots);
    console.log('Sample slots (first 5):', availableSlots.slice(0, 5));
    
    // Filter out past times for today
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const currentHour = now.getHours();
      availableSlots = availableSlots.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0], 10);
        return slotHour > currentHour;
      });
    }
    
    // Populate start time dropdown
    const startSelect = document.getElementById('bookingStartTime');
    startSelect.innerHTML = '<option value="">Select</option>';
    availableSlots.forEach(time => {
      const option = document.createElement('option');
      option.value = time;
      console.log('Processing time slot:', time, 'Type:', typeof time, 'Length:', time.length);
      const formattedTime = formatTime12h(time);
      option.textContent = formattedTime;
      console.log(`Time slot: "${time}" -> formatted: "${formattedTime}"`);
      startSelect.appendChild(option);
    });
    startSelect.disabled = false;
    
    // Reset end time
    document.getElementById('bookingEndTime').innerHTML = '<option value="">Select</option>';
    document.getElementById('bookingEndTime').disabled = true;
    document.getElementById('bookingDuration').textContent = '';
    
  } catch (error) {
    console.error('Error loading time slots:', error);
    alert('Error loading available time slots: ' + error.message);
  }
}

// Update end time options when start time changes
function updateBookingEndTimes() {
  const startTime = document.getElementById('bookingStartTime').value;
  const endSelect = document.getElementById('bookingEndTime');
  
  if (!startTime) {
    endSelect.innerHTML = '<option value="">Select</option>';
    endSelect.disabled = true;
    document.getElementById('bookingDuration').textContent = '';
    return;
  }
  
  const endTimes = getAvailableEndTimes(startTime);
  endSelect.innerHTML = '<option value="">Select</option>';
  endTimes.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    const formattedTime = formatTime12h(time);
    option.textContent = formattedTime;
    console.log(`End time slot: "${time}" -> formatted: "${formattedTime}"`);
    endSelect.appendChild(option);
  });
  endSelect.disabled = false;
}

// Update duration display
function updateBookingDuration() {
  const startTime = document.getElementById('bookingStartTime').value;
  const endTime = document.getElementById('bookingEndTime').value;
  
  if (startTime && endTime) {
    const duration = calculateDuration(startTime, endTime);
    const durationText = `${duration} hour(s) (${formatTimeRange(startTime, endTime)})`;
    document.getElementById('bookingDuration').textContent = durationText;
  } else {
    document.getElementById('bookingDuration').textContent = '';
  }
}

// Handle booking form submission
async function handleBookingFormSubmit(e) {
  e.preventDefault();
  
  const formData = {
    groundId: document.getElementById('bookingGroundId').value,
    bookingDate: document.getElementById('bookingDate').value,
    startTime: document.getElementById('bookingStartTime').value,
    endTime: document.getElementById('bookingEndTime').value,
    teamName: document.getElementById('bookingTeamName').value,
    playerCount: parseInt(document.getElementById('bookingPlayerCount').value),
    contactName: document.getElementById('bookingContactName').value,
    contactPhone: document.getElementById('bookingContactPhone').value,
    contactEmail: document.getElementById('bookingContactEmail').value,
    requirements: document.getElementById('bookingRequirements').value
  };
  
  // Validation
  if (!formData.groundId || !formData.bookingDate || !formData.startTime || !formData.endTime) {
    alert('Please fill in all required fields');
    return;
  }
  
  if (formData.playerCount < 1) {
    alert('Number of players must be at least 1');
    return;
  }
  
  if (!formData.contactName || !formData.contactPhone) {
    alert('Contact person name and phone are required');
    return;
  }
  
  try {
    const bookingData = {
      groundId: formData.groundId,
      bookingDate: formData.bookingDate,
      timeSlot: `${formData.startTime}-${formData.endTime}`,
      playerDetails: {
        teamName: formData.teamName || undefined,
        playerCount: formData.playerCount,
        contactPerson: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail || undefined
        }
      },
      requirements: formData.requirements || undefined
    };
    
    console.log('Sending booking data:', bookingData);
    console.log('Booking date being sent:', formData.bookingDate);
    console.log('Current date:', new Date().toISOString().split('T')[0]);
    
    const response = await fetch('http://localhost:3001/api/admin/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingData)
    });
    
    const data = await response.json();
    console.log('Booking creation response:', data);
    if (data.success) {
      alert('Booking created successfully!');
      hideAddBookingForm();
      console.log('Refreshing bookings list...');
      await loadBookings(); // Refresh the bookings list
      console.log('Bookings list refreshed');
    } else {
      alert('Error creating booking: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    alert('Error creating booking: ' + error.message);
  }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Booking form event listeners
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBookingFormSubmit);
  }
  
  // Ground selection change
  const bookingGroundSelect = document.getElementById('bookingGroundId');
  if (bookingGroundSelect) {
    bookingGroundSelect.addEventListener('change', updateBookingTimeSlots);
  }
  
  // Date change
  const bookingDateInput = document.getElementById('bookingDate');
  if (bookingDateInput) {
    bookingDateInput.addEventListener('change', updateBookingTimeSlots);
  }
  
  // Start time change
  const bookingStartTimeSelect = document.getElementById('bookingStartTime');
  if (bookingStartTimeSelect) {
    bookingStartTimeSelect.addEventListener('change', function() {
      updateBookingEndTimes();
      updateBookingDuration();
    });
  }
  
  // End time change
  const bookingEndTimeSelect = document.getElementById('bookingEndTime');
  if (bookingEndTimeSelect) {
    bookingEndTimeSelect.addEventListener('change', updateBookingDuration);
  }
});

// Search functionality
const bookingSearchInput = document.getElementById('bookingSearchInput');
if (bookingSearchInput) {
  bookingSearchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filtered = bookingsCache.filter(b => {
      const userName = b.userId && b.userId.name ? b.userId.name : b.userId || '';
      const groundName = b.groundId && b.groundId.name ? b.groundId.name : b.groundId || '';
      return (
        (b.bookingId && b.bookingId.toLowerCase().includes(query)) ||
        (userName && userName.toLowerCase().includes(query)) ||
        (groundName && groundName.toLowerCase().includes(query)) ||
        (b.status && b.status.toLowerCase().includes(query))
      );
    });
    renderBookingsTable(filtered);
  });
}

// View Booking
window.viewBooking = function(id) {
  const booking = bookingsCache.find(b => b._id === id);
  if (!booking) return;
  selectedBookingId = id;
  const userName = booking.userId && booking.userId.name ? booking.userId.name : booking.userId || '';
  const groundName = booking.groundId && booking.groundId.name ? booking.groundId.name : booking.groundId || '';
  const statusOptions = ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'];
  const details = `
    <p><b>Booking ID:</b> ${booking.bookingId}</p>
    <p><b>User:</b> ${userName}</p>
    <p><b>Ground:</b> ${groundName}</p>
    <p><b>Date:</b> ${booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : ''}</p>
    <p><b>Time Slot:</b> ${booking.timeSlot ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}` : ''}</p>
    <p><b>Status:</b> <select id="bookingStatusSelect">${statusOptions.map(opt => `<option value="${opt}" ${booking.status===opt?'selected':''}>${opt}</option>`).join('')}</select></p>
    <p><b>Total Amount:</b> ${booking.pricing ? booking.pricing.totalAmount : ''}</p>
    <p><b>Player Details:</b> ${booking.playerDetails ? JSON.stringify(booking.playerDetails) : ''}</p>
    <p><b>Payment:</b> ${booking.payment ? JSON.stringify(booking.payment) : ''}</p>
    <button id="editBookingBtn" class="btn-primary">Edit</button>
    <button id="deleteBookingBtn" class="btn-danger">Delete</button>
  `;
  document.getElementById('bookingDetailsContent').innerHTML = details;
  document.getElementById('bookingModal').style.display = 'block';
  // Status change handler
  document.getElementById('bookingStatusSelect').onchange = async function() {
    const newStatus = this.value;
    try {
      const response = await fetch(`${BASE_API_URL}/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        alert('Status updated!');
        document.getElementById('bookingModal').style.display = 'none';
        loadBookings();
      } else {
        alert('Error updating status: ' + (data.message || ''));
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };
  // Attach modal button handlers
  document.getElementById('editBookingBtn').onclick = function() {
    // Show edit form in modal
    const editFormHtml = `
      <form id="editBookingForm">
        <label>Status:
          <select name="status" id="editStatus">
            ${statusOptions.map(opt => `<option value="${opt}" ${booking.status===opt?'selected':''}>${opt}</option>`).join('')}
          </select>
        </label><br>
        <label>Date:
          <input type="date" id="editDate" value="${booking.bookingDate ? new Date(booking.bookingDate).toISOString().split('T')[0] : ''}" />
        </label><br>
        <label>Start Time:
          <input type="text" id="editStartTime" value="${booking.timeSlot ? booking.timeSlot.startTime : ''}" placeholder="e.g. 10:00" />
        </label><br>
        <label>End Time:
          <input type="text" id="editEndTime" value="${booking.timeSlot ? booking.timeSlot.endTime : ''}" placeholder="e.g. 12:00" />
        </label><br>
        <label>Player Details (JSON):
          <textarea id="editPlayerDetails" rows="3">${booking.playerDetails ? JSON.stringify(booking.playerDetails, null, 2) : ''}</textarea>
        </label><br>
        <button type="submit" class="btn-primary">Save</button>
        <button type="button" id="cancelEditBtn" class="btn-secondary">Cancel</button>
      </form>
    `;
    document.getElementById('bookingDetailsContent').innerHTML = editFormHtml;
    document.getElementById('editBookingForm').onsubmit = async function(e) {
      e.preventDefault();
      const status = document.getElementById('editStatus').value;
      const bookingDate = document.getElementById('editDate').value;
      const startTime = document.getElementById('editStartTime').value;
      const endTime = document.getElementById('editEndTime').value;
      let playerDetails;
      try {
        playerDetails = JSON.parse(document.getElementById('editPlayerDetails').value);
      } catch (err) {
        alert('Player Details must be valid JSON');
        return;
      }
      const update = {
        status,
        bookingDate,
        timeSlot: { startTime, endTime },
        playerDetails
      };
      try {
        const response = await fetch(`${BASE_API_URL}/api/admin/bookings/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(update)
        });
        const data = await response.json();
        if (data.success) {
          alert('Booking updated!');
          document.getElementById('bookingModal').style.display = 'none';
          loadBookings();
        } else {
          alert('Error updating booking: ' + (data.message || ''));
        }
      } catch (err) {
        alert('Error updating booking: ' + err.message);
      }
    };
    document.getElementById('cancelEditBtn').onclick = function() {
      window.viewBooking(id);
    };
  };
  document.getElementById('deleteBookingBtn').onclick = function() {
    document.getElementById('bookingModal').style.display = 'none';
    document.getElementById('deleteBookingModal').style.display = 'block';
  };
};

window.closeBookingModal = function() {
  document.getElementById('bookingModal').style.display = 'none';
};

// Delete Booking
window.showDeleteBookingModal = function(id) {
  selectedBookingId = id;
  document.getElementById('deleteBookingModal').style.display = 'block';
};

window.closeDeleteBookingModal = function() {
  document.getElementById('deleteBookingModal').style.display = 'none';
};

document.getElementById('confirmDeleteBookingBtn').onclick = async function() {
  if (!selectedBookingId) return;
  try {
    const response = await fetch(`${BASE_API_URL}/api/admin/bookings/${selectedBookingId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (data.success) {
      alert('Booking deleted successfully!');
      document.getElementById('deleteBookingModal').style.display = 'none';
      loadBookings();
    } else {
      alert('Error deleting booking: ' + (data.message || ''));
    }
  } catch (err) {
    alert('Error deleting booking: ' + err.message);
  }
};

// Refresh bookings function
async function refreshBookings() {
  console.log('Manual refresh of bookings...');
  try {
    await loadBookings();
    console.log('Bookings refreshed successfully');
  } catch (error) {
    console.error('Error refreshing bookings:', error);
    alert('Error refreshing bookings: ' + error.message);
  }
}

// Make it available globally
window.refreshBookings = refreshBookings;