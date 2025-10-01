import React, { Component } from 'react';
import { Container, Row, Col, Card, Button, Image, Table, Toast, ToastContainer } from 'react-bootstrap';
import { FaTrash, FaCheck } from 'react-icons/fa';

class ShoppingCart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showToast: false,
      toastMessage: '',
      toastBg: 'success',
    };
  }

  showToast = (message, bg = 'success') => {
    this.setState({ showToast: true, toastMessage: message, toastBg: bg });
    setTimeout(() => this.setState({ showToast: false }), 3000);
  };

  handleRemove = (id) => {
    // Kembalikan stok untuk setiap item yang dihapus
    const item = this.props.cartItems.find((item) => item.id === id);
    if (item) {
      // Kembalikan stok sesuai jumlah item
      for (let i = 0; i < item.quantity; i++) {
        this.props.restoreStock(id);
      }
    }

    // Hapus item dari keranjang
    this.props.onRemove(id);
    this.showToast('Barang berhasil dihapus dari keranjang', 'info');
  };

  handleCheckout = () => {
    this.props.onCheckout();
    this.showToast('Pesanan berhasil! Terima kasih telah berbelanja', 'success');
  };

  handleUpdateQuantity = (id, newQuantity) => {
    const { cartItems, onUpdateCart } = this.props;
    const item = cartItems.find((item) => item.id === id);

    if (!item) return;

    // Hitung selisih quantity
    const diff = item.quantity - newQuantity;

    if (diff > 0) {
      // Jika quantity berkurang, kembalikan stok
      for (let i = 0; i < diff; i++) {
        this.props.restoreStock(id);
      }
    } else if (diff < 0) {
      // Jika quantity bertambah, kurangi stok
      for (let i = 0; i < Math.abs(diff); i++) {
        this.props.restoreStock(id, -1);
      }
    }

    // Update cart
    const updatedCart = cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item));

    onUpdateCart(updatedCart);
  };

  calculateTotal = () => {
    return this.props.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  render() {
    const { cartItems } = this.props;
    const { showToast, toastMessage, toastBg } = this.state;

    if (cartItems.length === 0) {
      return (
        <Container className="my-5">
          <Row className="justify-content-center">
            <Col xs={12} md={8}>
              <Card className="text-center p-4">
                <Card.Body>
                  <h3>Keranjang Belanja Kosong</h3>
                  <p className="text-muted">Tambahkan produk ke keranjang Anda</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <ToastContainer position="top-end" className="p-3">
            <Toast show={showToast} bg={toastBg} onClose={() => this.setState({ showToast: false })}>
              <Toast.Body className="text-white">{toastMessage}</Toast.Body>
            </Toast>
          </ToastContainer>
        </Container>
      );
    }

    return (
      <Container className="my-4">
        <h2 className="mb-4">Shoping Card</h2>

        <Row>
          <Col xs={12}>
            <Card>
              <Card.Body>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Produk</th>
                      <th>Harga</th>
                      <th>Jumlah</th>
                      <th>Total</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.img && <Image src={item.img} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px' }} rounded />}
                            <div>
                              <div>{item.name}</div>
                              <small className="text-muted">{item.desc}</small>
                            </div>
                          </div>
                        </td>
                        <td>${parseFloat(item.price).toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button variant="outline-secondary" size="sm" onClick={() => this.handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                              -
                            </Button>
                            <span className="mx-2">{item.quantity}</span>
                            <Button variant="outline-secondary" size="sm" onClick={() => this.handleUpdateQuantity(item.id, item.quantity + 1)}>
                              +
                            </Button>
                          </div>
                        </td>
                        <td>${(item.price * item.quantity).toLocaleString()}</td>
                        <td>
                          <Button variant="danger" size="sm" onClick={() => this.handleRemove(item.id)}>
                            <FaTrash className="me-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-end fw-bold">
                        Total:
                      </td>
                      <td className="fw-bold">${this.calculateTotal().toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </Table>

                <div className="d-flex justify-content-end mt-3">
                  <Button variant="success" onClick={this.handleCheckout}>
                    <FaCheck className="me-2" /> Checkout
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <ToastContainer position="top-end" className="p-3">
          <Toast show={showToast} bg={toastBg} onClose={() => this.setState({ showToast: false })}>
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    );
  }
}

export default ShoppingCart;
