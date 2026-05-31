import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // If we had strict role enforcement on frontend
  // React.useEffect(() => {
  //   if (!user || user.role !== 'admin') {
  //     navigate('/');
  //   }
  // }, [user, navigate]);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/">CoupleCotton Admin</Link>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/products" className="admin-nav-item">Products</Link>
          <Link to="/admin/orders" className="admin-nav-item">Orders</Link>
          <Link to="/admin/users" className="admin-nav-item">Users</Link>
        </nav>
        <div className="admin-user">
          <p>{user?.fullName?.firstName || 'Admin'}</p>
          <button onClick={() => { logout(); navigate('/'); }} className="admin-logout-btn">Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
