import React, { Component } from 'react';
import { Container, Row, Col, Card, Button, Form, Toast, ToastContainer } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import DefaultProducts from './DefaultProducts';
import { FaShoppingCart, FaTrash, FaUndo } from 'react-icons/fa';

class ListProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flipped: {},
      search: '',
      showToast: false,
      toastMessage: '',
      toastBg: 'success',
      stockMap: {}, // simpan stok produk di state
    };
  }

  componentDidMount() {
    this.updateStockMap();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.archivedProducts !== this.props.archivedProducts) {
      this.updateStockMap();
    }
  }

  updateStockMap = () => {
    const savedDefaults = JSON.parse(localStorage.getItem('defaultProducts')) || [];
    const defaultProducts = DefaultProducts.map((def) => {
      const saved = savedDefaults.find((s) => s.id === def.id) || {};
      return {
        ...def,
        ...saved,
        img: saved.img || def.img,
        quantity: saved.quantity ?? 10,
      };
    });

    const allProducts = [...defaultProducts, ...this.props.archivedProducts];
    const stockMap = {};
    allProducts.forEach((p) => {
      stockMap[p.id] = p.quantity ?? 1;
    });

    this.setState({ stockMap });
  };

  showToast = (message, bg = 'success') => {
    this.setState({ showToast: true, toastMessage: message, toastBg: bg });
    setTimeout(() => this.setState({ showToast: false }), 3000);
  };

  handleFlip = (id) => {
    this.setState((prev) => ({
      flipped: { ...prev.flipped, [id]: !prev.flipped[id] },
    }));
  };

  handleDelete = (id) => {
    const updatedArchived = this.props.archivedProducts.filter((p) => p.id !== id);
    this.props.setArchivedProducts(updatedArchived);
    this.showToast('Produk dihapus dari archive!', 'danger');
  };

  handleReject = (product) => {
    // Hapus produk dari archivedProducts
    const updatedArchived = this.props.archivedProducts.filter((p) => p.id !== product.id);

    // Tambahkan produk ke products (daftar input)
    const updatedProducts = [...(this.props.products || []), product];

    // Update state di App.jsx melalui props
    this.props.setArchivedProducts(updatedArchived);
    this.props.setProducts(updatedProducts);

    // Tampilkan notifikasi
    this.showToast('Produk dikembalikan ke daftar input!', 'success');
  };

  handleSearchChange = (e) => {
    this.setState({ search: e.target.value });
  };

  formatPrice = (price) => {
    if (!price) return '$ 0';
    return `$ ${parseFloat(price).toLocaleString()}`;
  };

  handleAddToCart = (product) => {
    const { stockMap } = this.state;
    if (stockMap[product.id] > 0) {
      // Update stok lokal di ListProducts
      this.setState(
        (prev) => ({
          stockMap: { ...prev.stockMap, [product.id]: prev.stockMap[product.id] - 1 },
        }),
        () => {
          // Panggil onAddToCart dari props (di App.jsx) yang akan update stok global
          this.props.onAddToCart({ ...product, quantity: 1 });
        }
      );
    } else {
      this.showToast('Barang habis!!', 'danger');
    }
  };

  render() {
    const { archivedProducts, user } = this.props;
    const { flipped, search, showToast, toastMessage, toastBg, stockMap } = this.state;

    const savedDefaults = JSON.parse(localStorage.getItem('defaultProducts')) || [];

    const defaultProducts = DefaultProducts.map((def) => {
      const saved = savedDefaults.find((s) => s.id === def.id) || {};
      return {
        ...def,
        ...saved,
        img: saved.img || def.img,
        quantity: saved.quantity ?? 10,
      };
    });

    const combinedProducts = [...defaultProducts, ...archivedProducts];
    const filteredProducts = combinedProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
      <Container className="my-4">
        <ToastContainer position="top-end" className="p-3">
          <Toast show={showToast} bg={toastBg} onClose={() => this.setState({ showToast: false })}>
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>

        <h4 className="mb-3">List Products</h4>

        <Form.Control type="text" placeholder="Cari produk..." className="mb-3" value={search} onChange={this.handleSearchChange} />

        <Row>
          {filteredProducts.map((product) => {
            const isArchived = archivedProducts.some((p) => p.id === product.id);
            const isDefault = product.isDefault;
            const stock = stockMap[product.id] ?? product.quantity ?? 0;

            return (
              <Col key={product.id} xs={12} sm={6} lg={4} className="mb-3">
                <ReactCardFlip isFlipped={flipped[product.id]} flipDirection="horizontal">
                  <div onClick={() => this.handleFlip(product.id)} style={{ cursor: 'pointer' }}>
                    <Card className="h-100 shadow-sm">
                      {product.img && <Card.Img variant="top" src={product.img} alt={product.name} style={{ height: '100px', objectFit: 'cover' }} />}
                      <Card.Body>
                        <Card.Title>{product.name}</Card.Title>
                        <p className="fw-bold text-primary">{this.formatPrice(product.price)}</p>
                        <p className="text-muted">Stok: {stock}</p>
                        <small className="text-muted">Klik untuk detail</small>
                      </Card.Body>
                    </Card>
                  </div>

                  <div onClick={() => this.handleFlip(product.id)} style={{ cursor: 'pointer' }}>
                    <Card className="h-100 bg-dark text-white shadow-sm">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title>{product.name}</Card.Title>
                          <Card.Text>{product.desc}</Card.Text>
                          <p className="fw-bold">{this.formatPrice(product.price)}</p>
                          <p className="text-warning">Stok: {stock}</p>
                        </div>

                        {user && user.role === 'admin' ? (
                          <div className="d-flex justify-content-between mt-3">
                            {isArchived && !isDefault ? (
                              <>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleDelete(product.id);
                                  }}
                                >
                                  <FaTrash className="me-1" />
                                </Button>
                                <Button
                                  variant="warning"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    this.handleReject(product);
                                  }}
                                >
                                  <FaUndo className="me-1" /> Reject
                                </Button>
                              </>
                            ) : null}
                          </div>
                        ) : (
                          <div className="d-flex justify-content-center mt-3">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleAddToCart(product);
                              }}
                            >
                              <FaShoppingCart className="me-1" />
                            </Button>
                          </div>
                        )}

                        <div className="d-flex justify-content-center mt-3">
                          <small className="text-light">Klik untuk kembali</small>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                </ReactCardFlip>
              </Col>
            );
          })}
        </Row>
      </Container>
    );
  }
}

export default ListProducts;
