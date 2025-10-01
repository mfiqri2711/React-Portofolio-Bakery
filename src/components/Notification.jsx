import React, { Component } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

class Notification extends Component {
  render() {
    const { show, message, type, onClose } = this.props;

    return (
      <ToastContainer
        position="top-end"
        className="p-3"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
        }}
      >
        <Toast show={show} bg={type} onClose={onClose} delay={3000} autohide>
          <Toast.Body className="text-white">{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    );
  }
}

export default Notification;
