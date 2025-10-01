import React, { Component } from 'react';
import { Row, Col, Card, Button, Toast, ToastContainer } from 'react-bootstrap';

class About extends Component {
  render() {
    return (
      <>
        <div className="py-5 text-center bg-light alert border-dark mb-3">
          <h1 className="fw-bold">Protofolio Bakery</h1>
          <p className="text-muted">Aplikasi ini dibuat menggunakan React + Bootstrap.</p>
        </div>
        <div className="py-5 text- bg-light alert border-dark mb-3">
          <h3 className="fw-bold">INFO :</h3>
          <p className="text">Ada 2 akses login yaitu sebagai 'User' & 'Admin'.</p>
          <p className="fw-bold">1. User : Username 'user', Password '123'</p>
          <p className="text">User bisa menambahkan barang ke 'Shoping Card' & 'Chack Out Barang', barang yang stok habis/0 tidak akan bisa di tambahkan ke 'Shoping Card'</p>
          <p className="fw-bold">2. Admin : Username 'user', Password '123'</p>
          <p className="text">Admin bisa menbah, edit, hapus & reject barang/product.</p>
        </div>
      </>
    );
  }
}
export default About;
