import React, { Component } from 'react';
import { Nav, NavLink } from 'react-bootstrap';
import { FaHome, FaSignInAlt, FaBoxOpen, FaList, FaShoppingCart, FaUser, FaInfoCircle, FaSignOutAlt } from 'react-icons/fa';

class Navbar extends Component {
  render() {
    const { user, onLogout } = this.props;

    return (
      <Nav variant="pills" className="justify-content-center bg-dark py-2 mb-2">
        <Nav.Item>
          <Nav.Link eventKey="home" className="text-white">
            <FaHome className="me-2" /> Home
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="productsform" className="text-white">
            <FaList className="me-2" /> List Products
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link eventKey="about" className="text-white">
            <FaInfoCircle className="me-2" /> About
          </Nav.Link>
        </Nav.Item>

        {/* Admin → Input Products */}
        {user?.role === 'admin' && (
          <Nav.Item>
            <Nav.Link eventKey="inputproducts" className="text-white">
              <FaBoxOpen className="me-2" /> Input Product
            </Nav.Link>
          </Nav.Item>
        )}

        {/* User → Shopping Cart */}
        {user?.role === 'user' && (
          <Nav.Item>
            <Nav.Link eventKey="shoppingcart" className="text-white">
              <FaShoppingCart className="me-2" />
              Shopping Card
            </Nav.Link>
          </Nav.Item>
        )}

        {/* Profile jika login */}
        {user && (
          <Nav.Item>
            <Nav.Link eventKey="profile" className="text-white">
              <FaUser className="me-2" /> Profile
            </Nav.Link>
          </Nav.Item>
        )}

        {/* Login atau Logout */}
        <Nav.Item>
          {user ? (
            <Nav.Link onClick={onLogout} className="logout-link d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
              <FaSignOutAlt className="me-2" /> Logout ({user.username})
            </Nav.Link>
          ) : (
            <Nav.Link eventKey="login" className="text-white d-flex align-items-center gap-2">
              <FaSignInAlt className="me-2" /> Login
            </Nav.Link>
          )}
        </Nav.Item>
      </Nav>
    );
  }
}

export default Navbar;
