import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

// ── Icons ────────────────────────────────────────────────
const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconOrders = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 7h8" /><path d="M8 11h5" /><path d="M8 15h3" />
  </svg>
);
const IconAddress = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconLogout = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const SIDEBAR_SECTIONS = [
  {
    title: 'MY ORDERS',
    key: 'orders',
    icon: <IconOrders />,
    hasArrow: true,
  },
  {
    title: 'ACCOUNT SETTINGS',
    key: 'account',
    icon: <IconUser />,
    links: [
      { key: 'profile', label: 'Profile Information' },
      { key: 'addresses', label: 'Manage Addresses' },
    ],
  },
  {
    title: 'MY STUFF',
    key: 'stuff',
    icon: <IconHeart />,
    links: [
      { key: 'wishlist', label: 'My Wishlist' },
    ],
  },
];

const ProfilePage = () => {
  const { user, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [addressForm, setAddressForm] = useState({
    street: '', city: '', state: '', pincode: '', country: 'India',
  });
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    setFormData({
      firstName: user.fullName?.firstName || '',
      lastName: user.fullName?.lastName || '',
      email: user.email || '',
      username: user.username || '',
    });
    if (user.addresses) {
      setAddresses(user.addresses);
    }
  }, [user, navigate]);

  // Fetch addresses from backend
  useEffect(() => {
    if (!user || activeSection !== 'addresses') return;
    setLoadingAddresses(true);
    fetch('http://localhost:5000/api/auth/users/me/addresses', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.addresses) setAddresses(data.addresses);
      })
      .catch(console.error)
      .finally(() => setLoadingAddresses(false));
  }, [user, activeSection]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileSave = async () => {
    // For now just update local context (backend doesn't have an update profile endpoint yet)
    setSavingProfile(true);
    setMessage('');
    try {
      const updatedUser = {
        ...user,
        fullName: { firstName: formData.firstName, lastName: formData.lastName },
        email: formData.email,
        username: formData.username,
      };
      login(updatedUser);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/users/me/addresses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(addressForm),
      });
      const data = await res.json();
      if (res.ok && data.address) {
        setAddresses(prev => [...prev, data.address]);
        setAddressForm({ street: '', city: '', state: '', pincode: '', country: 'India' });
        setShowAddAddress(false);
      }
    } catch (err) {
      console.error('Add address error:', err);
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/users/me/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
      });
      if (res.ok) {
        setAddresses(prev => prev.filter(a => a._id !== addressId));
      }
    } catch (err) {
      console.error('Delete address error:', err);
    }
  };

  if (!user) return null;

  const initials = `${(user.fullName?.firstName || 'U')[0]}${(user.fullName?.lastName || '')[0]}`.toUpperCase();

  return (
    <div className="profile-page">
      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className="profile-sidebar">
        <div className="profile-sidebar__user">
          <div className="profile-sidebar__avatar">{initials}</div>
          <div className="profile-sidebar__info">
            <span className="profile-sidebar__hello">Hello,</span>
            <span className="profile-sidebar__name">
              {user.fullName?.firstName} {user.fullName?.lastName}
            </span>
          </div>
        </div>

        <nav className="profile-sidebar__nav">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.key} className="profile-sidebar__section">
              <div
                className={`profile-sidebar__section-header ${section.hasArrow ? 'profile-sidebar__section-header--clickable' : ''}`}
                onClick={section.hasArrow ? () => setActiveSection(section.key) : undefined}
              >
                <span className="profile-sidebar__section-icon">{section.icon}</span>
                <span className="profile-sidebar__section-title">{section.title}</span>
                {section.hasArrow && (
                  <span className="profile-sidebar__section-arrow"><IconChevron /></span>
                )}
              </div>
              {section.links && (
                <ul className="profile-sidebar__links">
                  {section.links.map((link) => (
                    <li key={link.key}>
                      <button
                        className={`profile-sidebar__link ${activeSection === link.key ? 'profile-sidebar__link--active' : ''}`}
                        onClick={() => setActiveSection(link.key)}
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        <button className="profile-sidebar__logout" onClick={handleLogout}>
          <IconLogout />
          <span>Logout</span>
        </button>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────── */}
      <main className="profile-content">
        {/* ── Profile Information ────────── */}
        {activeSection === 'profile' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Personal Information</h2>
              <button
                className="profile-card__edit-btn"
                onClick={() => setEditing(!editing)}
              >
                <IconEdit />
                <span>{editing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            {message && <div className="profile-card__message">{message}</div>}

            <div className="profile-card__fields">
              <div className="profile-card__row">
                <div className="profile-card__field">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
                <div className="profile-card__field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="profile-card__divider" />

              <div className="profile-card__section-title">
                <h3>Email Address</h3>
              </div>
              <div className="profile-card__field profile-card__field--full">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="profile-card__divider" />

              <div className="profile-card__section-title">
                <h3>Username</h3>
              </div>
              <div className="profile-card__field profile-card__field--full">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  disabled={!editing}
                />
              </div>

              {editing && (
                <div className="profile-card__actions">
                  <button
                    className="profile-card__save-btn"
                    onClick={handleProfileSave}
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-card__divider" />

            <div className="profile-card__security">
              <div className="profile-card__security-icon"><IconShield /></div>
              <div>
                <h4>Account Security</h4>
                <p>Your account is protected with password authentication.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Manage Addresses ──────────── */}
        {activeSection === 'addresses' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>Manage Addresses</h2>
              <button
                className="profile-card__edit-btn"
                onClick={() => setShowAddAddress(!showAddAddress)}
              >
                <span>{showAddAddress ? '✕ Cancel' : '+ Add New Address'}</span>
              </button>
            </div>

            {showAddAddress && (
              <form className="profile-address-form" onSubmit={handleAddAddress}>
                <div className="profile-card__row">
                  <div className="profile-card__field">
                    <label>Street</label>
                    <input type="text" value={addressForm.street} onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })} required />
                  </div>
                  <div className="profile-card__field">
                    <label>City</label>
                    <input type="text" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required />
                  </div>
                </div>
                <div className="profile-card__row">
                  <div className="profile-card__field">
                    <label>State</label>
                    <input type="text" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required />
                  </div>
                  <div className="profile-card__field">
                    <label>Pincode</label>
                    <input type="text" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} required />
                  </div>
                </div>
                <div className="profile-card__field profile-card__field--full">
                  <label>Country</label>
                  <input type="text" value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} required />
                </div>
                <button type="submit" className="profile-card__save-btn" disabled={savingAddress}>
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            )}

            <div className="profile-address-list">
              {loadingAddresses && <p className="profile-address-list__empty">Loading addresses...</p>}
              {!loadingAddresses && addresses.length === 0 && (
                <div className="profile-address-list__empty">
                  <IconAddress />
                  <p>No addresses saved yet</p>
                  <span>Add an address for faster checkout</span>
                </div>
              )}
              {addresses.map((addr) => (
                <div key={addr._id} className="profile-address-card">
                  <div className="profile-address-card__body">
                    <p className="profile-address-card__street">{addr.street}</p>
                    <p className="profile-address-card__city">{addr.city}, {addr.state} — {addr.pincode || addr.zip}</p>
                    <p className="profile-address-card__country">{addr.country}</p>
                    {addr.isDefault && <span className="profile-address-card__default">Default</span>}
                  </div>
                  <button className="profile-address-card__delete" onClick={() => handleDeleteAddress(addr._id)}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Orders ──────────────────── */}
        {activeSection === 'orders' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>My Orders</h2>
            </div>
            <div className="profile-address-list__empty">
              <IconOrders />
              <p>No orders yet</p>
              <span>When you place orders, they will show up here</span>
            </div>
          </div>
        )}

        {/* ── Wishlist ────────────────── */}
        {activeSection === 'wishlist' && (
          <div className="profile-card">
            <div className="profile-card__header">
              <h2>My Wishlist</h2>
            </div>
            <div className="profile-address-list__empty">
              <IconHeart />
              <p>Your wishlist is empty</p>
              <span>Save items you love and come back to them later</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
