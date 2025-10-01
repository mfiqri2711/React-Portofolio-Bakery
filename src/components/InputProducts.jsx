import React, { Component } from 'react';
import { Container, Row, Col, Card, Form, Button, Toast, ToastContainer } from 'react-bootstrap';
import ReactCardFlip from 'react-card-flip';
import { FaShoppingCart, FaTrash, FaUndo } from 'react-icons/fa';

class InputProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      form: { id: null, name: '', desc: '', price: '', img: '', quantity: 0 },
      file: null,
      flipped: {},
      search: '',
      showToast: false,
      toastMessage: '',
      toastBg: 'success',
      uploading: false,
    };
  }

  showToast = (message, bg = 'success') => {
    this.setState({ showToast: true, toastMessage: message, toastBg: bg });
    setTimeout(() => this.setState({ showToast: false }), 3000);
  };

  handleChange = (e) => {
    this.setState({ form: { ...this.state.form, [e.target.name]: e.target.value } });
  };

  handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    this.setState({ uploading: true });

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/upload', { method: 'POST', body: formData });
      const data = await res.json();
      this.setState({ form: { ...this.state.form, img: data.path }, uploading: false });
      this.showToast('Gambar berhasil diupload!', 'success');
    } catch (err) {
      console.error(err);

      const reader = new FileReader();
      reader.onloadend = () => {
        this.setState({ form: { ...this.state.form, img: reader.result }, uploading: false });
        this.showToast('Gambar disimpan sebagai base64!', 'warning');
      };
      reader.readAsDataURL(file);
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { form } = this.state;
    const { products, setProducts } = this.props;

    if (parseInt(form.price) < 0) {
      alert('Harga tidak boleh negatif!');
      return;
    }
    if (parseInt(form.quantity) < 0) {
      alert('Stok tidak boleh negatif!');
      return;
    }

    if (!form.id) {
      setProducts([...products, { ...form, id: Date.now() }]);
      this.showToast('Produk berhasil ditambahkan!', 'success');
    } else {
      setProducts(products.map((p) => (p.id === form.id ? form : p)));
      this.showToast('Produk berhasil diupdate!', 'info');
    }

    this.resetForm();
  };

  resetForm = () => {
    this.setState({ form: { id: null, name: '', desc: '', price: '', img: '', quantity: 0 }, file: null });
    if (this.fileInput) this.fileInput.value = '';
  };

  handleEdit = (product) => {
    this.setState({ form: product });
    this.showToast('Mode edit produk!', 'info');
  };

  handleDelete = (id) => {
    const { products, setProducts } = this.props;
    setProducts(products.filter((p) => p.id !== id));
    this.showToast('Produk dihapus!', 'danger');
  };

  handleArchive = (product) => {
    const { archivedProducts, setArchivedProducts, products, setProducts } = this.props;
    if (!archivedProducts.some((p) => p.id === product.id)) {
      setArchivedProducts([...archivedProducts, product]);
    }
    setProducts(products.filter((p) => p.id !== product.id));
    this.showToast('Produk di-archive!', 'warning');
  };

  handleFlip = (id) => {
    this.setState((prev) => ({ flipped: { ...prev.flipped, [id]: !prev.flipped[id] } }));
  };

  handleSearch = (e) => {
    this.setState({ search: e.target.value });
  };

  formatPrice = (price) => {
    if (!price) return '$ 0';
    return `$ ${parseFloat(price).toLocaleString()}`;
  };

  render() {
    const { products, user } = this.props;
    const { form, flipped, search, showToast, toastMessage, toastBg, uploading } = this.state;

    const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

    if (!user) {
      return (
        <div className="alert alert-danger text-center" role="alert">
          Anda harus login terlebih dahulu!
        </div>
      );
    }

    return (
      <Container className="my-4">
        <ToastContainer position="top-end" className="p-3">
          <Toast show={showToast} bg={toastBg} onClose={() => this.setState({ showToast: false })}>
            <Toast.Body className="text-white">{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>

        {/* Form tambah / edit produk */}
        <Row>
          <Col xs={12}>
            <Card className="p-3 shadow-sm">
              <h4>{form.id ? 'Edit Produk' : 'Tambah Produk'}</h4>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group className="mb-2">
                  <Form.Label>Nama Produk</Form.Label>
                  <Form.Control type="text" name="name" value={form.name} onChange={this.handleChange} required />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Deskripsi</Form.Label>
                  <Form.Control type="text" name="desc" value={form.desc} onChange={this.handleChange} required />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label>Harga</Form.Label>
                  <Form.Control type="number" name="price" value={form.price} onChange={this.handleChange} required />
                  <small className="text-muted">{this.formatPrice(form.price)}</small>
                </Form.Group>

                {/* ✅ Input stok produk */}
                <Form.Group className="mb-2">
                  <Form.Label>Stok Produk</Form.Label>
                  <Form.Control type="number" name="quantity" value={form.quantity} onChange={this.handleChange} min="0" required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Gambar</Form.Label>
                  <Form.Control type="file" accept="image/*" onChange={this.handleFileChange} ref={(ref) => (this.fileInput = ref)} />
                  {form.img && <img src={form.img} alt="preview" className="mt-2" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />}
                  {uploading && <small className="text-info">Uploading...</small>}
                </Form.Group>

                <Button type="submit" variant="primary" className="w-100" disabled={uploading}>
                  <FaShoppingCart className="me-2" />
                  {form.id ? 'Update Produk' : 'Tambah Produk'}
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Search produk */}
        <Row className="mt-4">
          <Col xs={12}>
            <Form.Control type="text" placeholder="Cari produk..." value={search} onChange={this.handleSearch} />
          </Col>
        </Row>

        {/* Daftar produk */}
        <Row className="mt-4">
          {filteredProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} lg={4} className="mb-3">
              <ReactCardFlip isFlipped={flipped[product.id]} flipDirection="horizontal">
                {/* Depan */}
                <div onClick={() => this.handleFlip(product.id)} style={{ cursor: 'pointer' }}>
                  <Card className="h-100 shadow-sm">
                    {product.img && <Card.Img variant="top" src={product.img} alt={product.name} style={{ height: '100px', objectFit: 'cover' }} />}
                    <Card.Body>
                      <Card.Title>{product.name}</Card.Title>
                      <p className="fw-bold text-primary">{this.formatPrice(product.price)}</p>
                      <p className="text-muted">Stok: {product.quantity ?? 0}</p>
                      <small className="text-muted">Klik untuk detail</small>
                    </Card.Body>
                  </Card>
                </div>

                {/* Belakang */}
                <div onClick={() => this.handleFlip(product.id)} style={{ cursor: 'pointer' }}>
                  <Card className="h-100 bg-primary text-white shadow-sm">
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <div>
                        <Card.Title>{product.name}</Card.Title>
                        <Card.Text>{product.desc}</Card.Text>
                        <p className="fw-bold">{this.formatPrice(product.price)}</p>
                        <p className="text-warning">Stok: {product.quantity ?? 0}</p>
                      </div>

                      <div className="d-flex justify-content-between mt-3">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleEdit(product);
                          }}
                        >
                          <FaUndo className="me-1" />
                          Edit
                        </Button>
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
                          variant="success"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            this.handleArchive(product);
                          }}
                        >
                          <FaShoppingCart className="me-1" />
                          Archive
                        </Button>
                      </div>
                      <small className="mt-2 text-light">Klik untuk kembali</small>
                    </Card.Body>
                  </Card>
                </div>
              </ReactCardFlip>
            </Col>
          ))}
        </Row>
      </Container>
    );
  }
}

export default InputProducts;
