import React, { Component } from 'react';
import { Card, Button, Form, Col, Row, Alert } from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      error: '',
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.user && !this.props.user) {
      this.setState({ username: '', password: '', error: '' });
    }
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = this.state;
    const success = this.props.onLogin(username, password);

    if (!success) {
      this.setState({ error: 'Username atau password salah!' });
    } else {
      this.setState({ error: '' });
    }
  };

  render() {
    const { user } = this.props;
    const { username, password, error } = this.state;

    if (user) {
      return (
        <Row className="justify-content-center my-5">
          <Col xs={12} md={6} lg={4}>
            <Card className="p-4 text-center shadow-sm">
              <h4 className="mb-3">Halo, {user.username}!</h4>
              <p className="text-muted">
                Anda login sebagai <b>{user.role}</b>
              </p>
              <Button variant="danger" onClick={this.props.onLogout}>
                Logout
              </Button>
            </Card>
          </Col>
        </Row>
      );
    }

    return (
      <Row className="justify-content-center my-5">
        <Col xs={12} md={6} lg={4}>
          <Card className="p-4 shadow-sm">
            <h4 className="mb-3">Login</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={this.handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" name="username" value={username} onChange={this.handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" name="password" value={password} onChange={this.handleChange} required />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100">
                <FaSignInAlt className="me-2" /> Login
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default Login;
