import React, { Component } from 'react';
import { Card } from 'react-bootstrap';

class Profile extends Component {
  render() {
    const { user } = this.props;

    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="shadow-sm p-4" style={{ width: '400px' }}>
          <Card.Body>
            <Card.Title className="text-center mb-4">Profile Pengguna</Card.Title>

            {user ? (
              <>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
              </>
            ) : (
              <p className="text-muted text-center">Silakan login untuk melihat profil Anda.</p>
            )}
          </Card.Body>
        </Card>
      </div>
    );
  }
}

export default Profile;
