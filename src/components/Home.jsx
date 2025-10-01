import React, { Component } from 'react';
import { Row, Col, Card, Button, Toast, ToastContainer, Carousel } from 'react-bootstrap'; // ⬅️ tambah Carousel
import ReactCardFlip from 'react-card-flip';
import { FaShoppingCart, FaTrash, FaUndo } from 'react-icons/fa';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockMap: {},
      showToast: false,
      toastMessage: '',
      toastBg: 'success',
    };
  }

  componentDidMount() {
    this.updateStockMap();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filteredHome !== this.props.filteredHome || prevProps.archivedProducts !== this.props.archivedProducts) {
      this.updateStockMap();
    }
  }

  updateStockMap = () => {
    const { filteredHome } = this.props;
    const stockMap = {};
    filteredHome.forEach((p) => {
      stockMap[p.id] = p.quantity ?? 10;
    });
    this.setState({ stockMap });
  };

  showToast = (message, bg = 'success') => {
    this.setState({ showToast: true, toastMessage: message, toastBg: bg });
    setTimeout(() => this.setState({ showToast: false }), 3000);
  };

  handleAddToCart = (product) => {
    const { stockMap } = this.state;
    if (stockMap[product.id] > 0) {
      this.setState(
        (prev) => ({
          stockMap: { ...prev.stockMap, [product.id]: prev.stockMap[product.id] - 1 },
        }),
        () => {
          this.props.onAddToCart({ ...product, quantity: 1 });
        }
      );
    } else {
      this.showToast('Barang habis!!', 'danger');
    }
  };

  handleDelete = (id) => {
    const updatedArchived = this.props.archivedProducts.filter((p) => p.id !== id);
    this.props.setArchivedProducts(updatedArchived);
    this.showToast('Produk dihapus dari archive!', 'danger');
  };

  handleReject = (product) => {
    const updatedArchived = this.props.archivedProducts.filter((p) => p.id !== product.id);
    const updatedProducts = [...(this.props.products || []), product];
    this.props.setArchivedProducts(updatedArchived);
    this.props.setProducts(updatedProducts);
    this.showToast('Produk dikembalikan ke daftar input!', 'success');
    setTimeout(() => {
      this.props.updateFilteredHome();
    }, 100);
  };

  render() {
    const { filteredHome, flippedHome, searchHome, handleSearchHome, handleFlipHome, formatPrice, user, archivedProducts } = this.props;
    const { stockMap, showToast, toastMessage, toastBg } = this.state;

    return (
      <>
        <ToastContainer position="top-end" className="p-3">
          <Toast show={showToast} bg={toastBg} onClose={() => this.setState({ showToast: false })}>
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>

        {/* ✅ Slideshow Carousel */}
        <Carousel className="mb-4 shadow-sm">
          <Carousel.Item>
            <img className="d-block w-100" src="/foto/b4.jpg" alt="Slide 1" style={{ maxHeight: '550px', objectFit: 'cover' }} />
          </Carousel.Item>
          <Carousel.Item>
            <img className="d-block w-100" src="/foto/b3.jpg" alt="Slide 2" style={{ maxHeight: '550px', objectFit: 'cover' }} />
          </Carousel.Item>
        </Carousel>

        {/* Search bar */}
        <Row className="my-4">
          <Col xs={12}>
            <input type="text" placeholder="Cari produk..." value={searchHome} onChange={handleSearchHome} className="form-control" />
          </Col>
        </Row>

        {/* Produk list tetap sama */}
        <Row className="mt-4">
          {filteredHome.map((product) => {
            const stock = stockMap[product.id] ?? product.quantity ?? 0;
            const isArchived = archivedProducts.some((p) => p.id === product.id);

            return (
              <Col key={product.id} xs={12} sm={6} lg={4} className="mb-3">
                <ReactCardFlip isFlipped={flippedHome[product.id]} flipDirection="horizontal">
                  <div onClick={() => handleFlipHome(product.id)} style={{ cursor: 'pointer' }}>
                    <Card className="h-100 shadow-sm">
                      {product.img && <Card.Img variant="top" src={product.img} alt={product.name} style={{ height: '200px', objectFit: 'cover' }} />}
                      <Card.Body>
                        <Card.Title>{product.name}</Card.Title>
                        <p className="fw-bold text-primary">{formatPrice(product.price)}</p>
                        <p className="text-muted">Stok: {stock}</p>
                        <small className="text-muted">Klik untuk detail</small>
                      </Card.Body>
                    </Card>
                  </div>

                  <div onClick={() => handleFlipHome(product.id)} style={{ cursor: 'pointer' }}>
                    <Card className="h-100 bg-dark text-white shadow-sm">
                      <Card.Body className="d-flex flex-column justify-content-between">
                        <div>
                          <Card.Title>{product.name}</Card.Title>
                          <Card.Text>{product.desc}</Card.Text>
                          <p className="fw-bold">{formatPrice(product.price)}</p>
                          <p className="text-warning">Stok: {stock}</p>
                        </div>

                        {user && user.role === 'admin' ? (
                          isArchived && !product.isDefault ? (
                            <div className="d-flex justify-content-between mt-3">
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
                            </div>
                          ) : null
                        ) : (
                          <div className="d-flex justify-content-center mt-3">
                            <Button
                              className="btn btn-warning btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                this.handleAddToCart(product);
                              }}
                            >
                              <FaShoppingCart className="me-1" />
                            </Button>
                          </div>
                        )}

                        <small className="mt-2 text-light text-center">Klik untuk kembali</small>
                      </Card.Body>
                    </Card>
                  </div>
                </ReactCardFlip>
              </Col>
            );
          })}
        </Row>
      </>
    );
  }
}

export default Home;
