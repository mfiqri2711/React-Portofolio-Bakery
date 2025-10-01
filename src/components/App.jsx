import React, { Component } from 'react';
import { Container, Row, Tab } from 'react-bootstrap';
import Navbar from './Navbar';
import Footer from './Footer';
import InputProducts from './InputProducts';
import ListProducts from './ListProducts';
import DefaultProducts from './DefaultProducts';
import Login from './Login';
import Home from './Home';
import Profile from './Profile';
import ShoppingCart from './ShoppingCart';
import Notification from './Notification';
import About from './About';
import './Style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      archivedProducts: [],
      mergedDefaults: [],
      filteredHome: [],
      flippedHome: {},
      searchHome: '',
      user: null,
      cartItems: [],
      notification: {
        show: false,
        message: '',
        type: 'success',
      },
    };
  }

  // ---------- Helper: notifikasi global ----------
  showNotification = (message, type = 'success') => {
    this.setState(
      {
        notification: {
          show: true,
          message,
          type,
        },
      },
      () => {
        // autohide
        setTimeout(() => {
          this.setState({ notification: { show: false, message: '', type: 'success' } });
        }, 3000);
      }
    );
  };

  // ---------- Sync DefaultProducts.js -> localStorage & state ----------
  // Pastikan nama/desc dari file DefaultProducts selalu mengikuti file,
  // namun biarkan price/img/quantity yang disimpan user tetap apabila ada.
  syncDefaultsToState = () => {
    const savedDefaults = JSON.parse(localStorage.getItem('defaultProducts')) || [];

    // Merge: gunakan name/desc dari DefaultProducts (file), keep price/img/quantity dari saved jika ada
    const updatedDefaults = DefaultProducts.map((def) => {
      const saved = savedDefaults.find((s) => s.id === def.id) || {};
      return {
        ...def,
        price: saved.price ?? def.price,
        img: saved.img ?? def.img,
        quantity: saved.quantity ?? def.quantity ?? 10,
        isDefault: true,
      };
    });

    // Simpan hasil merge ke localStorage agar consistent di reload
    localStorage.setItem('defaultProducts', JSON.stringify(updatedDefaults));
    return updatedDefaults;
  };

  componentDidMount() {
    const CURRENT_VERSION = '1.1'; // ubah kalau ada update besar
    const savedVersion = localStorage.getItem('defaultProductsVersion');

    // ambil data lain
    const savedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const savedArchived = JSON.parse(localStorage.getItem('archivedProducts')) || [];
    const savedUser = JSON.parse(localStorage.getItem('user')) || null;
    const savedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    const savedDefaults = JSON.parse(localStorage.getItem('defaultProducts')) || [];

    // fungsi merge
    const mergeDefaults = () =>
      DefaultProducts.map((def) => {
        const saved = savedDefaults.find((s) => s.id === def.id) || {};
        return {
          ...def, // ambil img, name, desc terbaru dari file
          price: saved.price ?? def.price,
          quantity: saved.quantity ?? def.quantity ?? 10,
          isDefault: true,
        };
      });

    if (savedVersion !== CURRENT_VERSION) {
      // versi berubah → pakai data baru dari file
      const newDefaults = mergeDefaults();
      localStorage.setItem('defaultProducts', JSON.stringify(newDefaults));
      localStorage.setItem('defaultProductsVersion', CURRENT_VERSION);

      this.setState({
        products: savedProducts,
        archivedProducts: savedArchived,
        mergedDefaults: newDefaults,
        filteredHome: [...newDefaults, ...savedArchived.slice(0, 10), ...savedProducts],
        user: savedUser,
        cartItems: savedCart,
      });
      return;
    }

    // versi sama → tetap merge biar perubahan img/text dari file ikut
    const mergedDefaults = mergeDefaults();
    localStorage.setItem('defaultProducts', JSON.stringify(mergedDefaults));

    this.setState({
      products: savedProducts,
      archivedProducts: savedArchived,
      mergedDefaults,
      filteredHome: [...mergedDefaults, ...savedArchived.slice(0, 10), ...savedProducts],
      user: savedUser,
      cartItems: savedCart,
    });
  }

  componentDidUpdate(_, prevState) {
    // Simpan perubahan jika perlu (anti-lag: hanya saat berubah)
    if (prevState.products !== this.state.products) {
      localStorage.setItem('products', JSON.stringify(this.state.products));
    }
    if (prevState.archivedProducts !== this.state.archivedProducts) {
      localStorage.setItem('archivedProducts', JSON.stringify(this.state.archivedProducts));
    }
    if (prevState.mergedDefaults !== this.state.mergedDefaults) {
      localStorage.setItem('defaultProducts', JSON.stringify(this.state.mergedDefaults));
    }
    if (prevState.cartItems !== this.state.cartItems) {
      localStorage.setItem('cartItems', JSON.stringify(this.state.cartItems));
    }
  }

  // ---------- Auth ----------
  handleLogin = (username, password) => {
    if (username === 'admin' && password === '123') {
      const user = { username, role: 'admin' };
      this.setState({ user });
      localStorage.setItem('user', JSON.stringify(user));
      this.showNotification('Login berhasil sebagai admin!', 'success');
      return true;
    } else if (username === 'user' && password === '123') {
      const user = { username, role: 'user' };
      this.setState({ user });
      localStorage.setItem('user', JSON.stringify(user));
      this.showNotification('Login berhasil sebagai user!', 'success');
      return true;
    }
    this.showNotification('Username atau password salah!', 'danger');
    return false;
  };

  handleLogout = () => {
    this.setState({ user: null });
    localStorage.removeItem('user');
    this.showNotification('Anda telah logout', 'info');
    // arahkan ke home
    setTimeout(() => {
      const homeTab = document.querySelector('[data-rb-event-key="home"]');
      if (homeTab) homeTab.click();
    }, 0);
  };

  // ---------- setter produk (dipakai oleh InputProducts dll) ----------
  setProducts = (newProducts) => {
    this.setState({ products: newProducts }, this.updateFilteredHome);
  };

  setArchivedProducts = (newArchived) => {
    this.setState({ archivedProducts: newArchived }, this.updateFilteredHome);
  };

  // ---------- flip & filter ----------
  handleFlipHome = (id) => {
    this.setState((prev) => ({
      flippedHome: { ...prev.flippedHome, [id]: !prev.flippedHome[id] },
    }));
  };

  updateFilteredHome = () => {
    const { mergedDefaults, archivedProducts, products, searchHome } = this.state;
    const limitedArchived = archivedProducts.slice(0, 10); // batasi archived untuk mengurangi render lag
    const combined = [...mergedDefaults, ...limitedArchived, ...products];
    const keyword = (searchHome || '').toLowerCase();
    const filtered = combined.filter((p) => (p.name || '').toLowerCase().includes(keyword));
    this.setState({ filteredHome: filtered });
  };

  handleSearchHome = (e) => {
    this.setState({ searchHome: e.target.value }, this.updateFilteredHome);
  };

  formatPrice = (price) => {
    if (price === undefined || price === null || price === '') return '$ 0';
    return `$ ${parseFloat(price).toLocaleString()}`;
  };

  // ---------- stok global helpers ----------
  // ubah stok dengan nilai change (positif menambah, negatif mengurangi)
  updateGlobalStock = (productId, change) => {
    // safe number updates
    const upd = (arr) => arr.map((p) => (p.id === productId ? { ...p, quantity: Math.max(0, (Number(p.quantity) || 0) + Number(change)) } : p));

    const updatedProducts = upd(this.state.products);
    const updatedDefaults = upd(this.state.mergedDefaults);
    const updatedArchived = upd(this.state.archivedProducts);

    this.setState(
      {
        products: updatedProducts,
        mergedDefaults: updatedDefaults,
        archivedProducts: updatedArchived,
      },
      () => {
        localStorage.setItem('products', JSON.stringify(this.state.products));
        localStorage.setItem('defaultProducts', JSON.stringify(this.state.mergedDefaults));
        localStorage.setItem('archivedProducts', JSON.stringify(this.state.archivedProducts));
        // refresh filtered view
        this.updateFilteredHome();
      }
    );
  };

  // restore stok (biasanya saat hapus item dari cart)
  restoreStock = (productId, amount = 1) => {
    this.updateGlobalStock(productId, Number(amount));
  };

  // ---------- cart logic ----------
  handleAddToCart = (product) => {
    // only user role can add
    if (!this.state.user || this.state.user.role !== 'user') {
      this.showNotification('Anda harus login sebagai user!', 'warning');
      const loginTab = document.querySelector('[data-rb-event-key="login"]');
      if (loginTab) loginTab.click();
      return;
    }

    // cek stok global (cek mergedDefaults, products, archived)
    const findIn = (arr) => arr.find((p) => p.id === product.id);
    const pDefault = findIn(this.state.mergedDefaults);
    const pInput = findIn(this.state.products);
    const pArchived = findIn(this.state.archivedProducts);
    const currentStock = pInput?.quantity ?? pDefault?.quantity ?? pArchived?.quantity ?? 0;

    if (currentStock <= 0) {
      this.showNotification('Barang habis!', 'danger');
      return;
    }

    // kurangi 1 stok global
    this.updateGlobalStock(product.id, -1);

    // tambahkan ke cart (default quantity 1)
    const cartItem = { ...product, quantity: 1 };
    this.setState(
      (prev) => ({ cartItems: [...prev.cartItems, cartItem] }),
      () => {
        localStorage.setItem('cartItems', JSON.stringify(this.state.cartItems));
        this.showNotification('Produk ditambahkan ke keranjang!', 'success');
        // langsung navigasi ke cart
        setTimeout(() => {
          const cartTab = document.querySelector('[data-rb-event-key="shoppingcart"]');
          if (cartTab) cartTab.click();
        }, 0);
      }
    );
  };

  // hapus dari cart -> kembalikan stok sebesar quantity item yang dihapus
  handleRemoveFromCart = (id) => {
    const item = this.state.cartItems.find((c) => c.id === id);
    const qtyToRestore = item ? Number(item.quantity || 1) : 1;

    // restore stok sesuai jumlah
    if (item) this.updateGlobalStock(id, qtyToRestore);

    this.setState(
      (prev) => ({ cartItems: prev.cartItems.filter((it) => it.id !== id) }),
      () => {
        localStorage.setItem('cartItems', JSON.stringify(this.state.cartItems));
        this.showNotification('Barang dihapus dari keranjang', 'info');
      }
    );
  };

  // update cart (mis. change qty dari ShoppingCart) -> kita hitung diff dan update stok global
  handleUpdateCart = (newCart) => {
    const oldCart = this.state.cartItems;
    // buat map id -> qty
    const oldMap = {};
    oldCart.forEach((it) => (oldMap[it.id] = Number(it.quantity || 1)));
    const newMap = {};
    newCart.forEach((it) => (newMap[it.id] = Number(it.quantity || 1)));

    // untuk setiap item di union of ids, hitung diff (old - new) -> ini jumlah yang harus dikembalikan ke stok
    const ids = Array.from(new Set([...Object.keys(oldMap), ...Object.keys(newMap)]));

    ids.forEach((id) => {
      const oldQ = oldMap[id] ?? 0;
      const newQ = newMap[id] ?? 0;
      const diff = oldQ - newQ; // jika >0 => kembalikan stok; jika <0 => kurangi stok lebih
      if (diff !== 0) {
        // updateGlobalStock menambahkan change (positif menambah stok)
        this.updateGlobalStock(Number(id), diff);
      }
    });

    this.setState({ cartItems: newCart }, () => {
      localStorage.setItem('cartItems', JSON.stringify(this.state.cartItems));
    });
  };

  handleCheckout = () => {
    // saat checkout, barang dianggap terjual -> jangan restore stok
    this.showNotification('Pesanan berhasil! Terima kasih telah berbelanja', 'success');
    this.setState({ cartItems: [] }, () => {
      localStorage.removeItem('cartItems');
    });
  };

  // ---------- misc ----------
  // bridge: delete archive (permanen)
  handleDeleteArchiveFromChild = (id) => {
    const updated = this.state.archivedProducts.filter((p) => p.id !== id);
    this.setState({ archivedProducts: updated }, () => {
      localStorage.setItem('archivedProducts', JSON.stringify(this.state.archivedProducts));
      this.updateFilteredHome();
      this.showNotification('Produk dihapus dari archive!', 'danger');
    });
  };

  // bridge: reject product (kembalikan ke products) with duplicate check
  handleRejectFromChild = (product) => {
    this.setState(
      (prev) => {
        const updatedArchived = prev.archivedProducts.filter((p) => p.id !== product.id);
        const already = prev.products.some((p) => p.id === product.id);
        const updatedProducts = already ? prev.products : [...prev.products, { ...product }];
        return { archivedProducts: updatedArchived, products: updatedProducts };
      },
      () => {
        localStorage.setItem('archivedProducts', JSON.stringify(this.state.archivedProducts));
        localStorage.setItem('products', JSON.stringify(this.state.products));
        this.updateFilteredHome();
        this.showNotification('Produk dikembalikan ke daftar input!', 'success');
      }
    );
  };

  render() {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Tab.Container defaultActiveKey="home">
          <Navbar user={this.state.user} onLogout={this.handleLogout} />

          <Container fluid className="px-5 flex-grow-1">
            <Tab.Content>
              {/* HOME */}
              <Tab.Pane eventKey="home">
                <Home
                  filteredHome={this.state.filteredHome}
                  flippedHome={this.state.flippedHome}
                  searchHome={this.state.searchHome}
                  handleSearchHome={this.handleSearchHome}
                  handleFlipHome={this.handleFlipHome}
                  formatPrice={this.formatPrice}
                  user={this.state.user}
                  onAddToCart={this.handleAddToCart}
                  products={this.state.products}
                  setProducts={this.setProducts}
                  archivedProducts={this.state.archivedProducts}
                  setArchivedProducts={this.setArchivedProducts}
                  // bridges for admin actions (if needed by Home)
                  onRejectFromParent={this.handleRejectFromChild}
                  onDeleteArchiveFromParent={this.handleDeleteArchiveFromChild}
                  updateFilteredHome={this.updateFilteredHome}
                />
              </Tab.Pane>

              {/*Profile*/}
              <Tab.Pane eventKey="profile">{this.state.user ? <Profile user={this.state.user} /> : <div className="alert alert-danger text-center mt-4">Anda harus login terlebih dahulu!</div>}</Tab.Pane>

              {/* LOGIN */}
              <Tab.Pane eventKey="login">
                <Login onLogin={this.handleLogin} user={this.state.user} onLogout={this.handleLogout} />
              </Tab.Pane>

              {/* INPUT PRODUCTS */}
              <Tab.Pane eventKey="inputproducts">
                {this.state.user ? (
                  <Row>
                    <InputProducts
                      products={this.state.products}
                      setProducts={this.setProducts}
                      archivedProducts={this.state.archivedProducts}
                      setArchivedProducts={this.setArchivedProducts}
                      user={this.state.user}
                      showNotification={this.showNotification}
                    />
                  </Row>
                ) : (
                  <div className="alert alert-danger text-center mt-4">Anda harus login terlebih dahulu!</div>
                )}
              </Tab.Pane>

              {/* LIST PRODUCTS */}
              <Tab.Pane eventKey="productsform">
                <Row>
                  <ListProducts
                    products={this.state.products}
                    setProducts={this.setProducts}
                    archivedProducts={this.state.archivedProducts}
                    setArchivedProducts={this.setArchivedProducts}
                    user={this.state.user}
                    onAddToCart={this.handleAddToCart}
                    onRejectFromParent={this.handleRejectFromChild}
                    onDeleteArchiveFromParent={this.handleDeleteArchiveFromChild}
                    showNotification={this.showNotification}
                  />
                </Row>
              </Tab.Pane>

              {/*About*/}
              <Tab.Pane eventKey="about">
                <About />
              </Tab.Pane>

              {/* SHOPPING CART */}
              <Tab.Pane eventKey="shoppingcart">
                {this.state.user ? (
                  <ShoppingCart
                    cartItems={this.state.cartItems}
                    onRemove={this.handleRemoveFromCart}
                    onUpdateCart={this.handleUpdateCart}
                    onCheckout={this.handleCheckout}
                    restoreStock={this.restoreStock}
                    showNotification={this.showNotification}
                  />
                ) : (
                  <div className="alert alert-danger text-center mt-4">Anda harus login terlebih dahulu!</div>
                )}
              </Tab.Pane>
            </Tab.Content>
          </Container>
        </Tab.Container>

        <Notification show={this.state.notification.show} message={this.state.notification.message} type={this.state.notification.type} onClose={() => this.setState({ notification: { show: false, message: '', type: 'success' } })} />

        <Footer />
      </div>
    );
  }
}

export default App;
