import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          UPSC Prep
        </Link>

        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/problems">Problems</Link></li>
          <li><Link to="/prelims">Prelims</Link></li>
          <li><Link to="/daily">Daily</Link></li>
          <li><Link to="/contests">Contests</Link></li>
          <li><Link to="/news">News</Link></li>
          <li><Link to="/mock-tests">Mock Tests</Link></li>
          <li><Link to="/progress">Progress</Link></li>
          <li><Link to="/discussions">Discussions</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
        </ul>

        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <span style={{ color: '#aaa' }}>Hello, {user?.username}</span>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="btn btn-primary">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
