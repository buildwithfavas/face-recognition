import { useState, useEffect, useCallback } from 'react';
import { Modal, Button, ListGroup, Badge, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { getKnownFaces, deleteFaceByIndex, clearAllFaces, invalidateCache, type KnownFace } from '../features/faces/Recognition';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

type Props = {
  show: boolean;
  onHide: () => void;
  onFacesChanged?: () => void;
};

export default function ManageFacesModal({ show, onHide, onFacesChanged }: Props) {
  const [faces, setFaces] = useState<KnownFace[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingFace, setEditingFace] = useState<{ face: KnownFace; index: number } | null>(null);

  useEffect(() => {
    if (show) {
      setFaces(getKnownFaces());
    }
  }, [show]);

  const handleDelete = useCallback((indexToDelete: number) => {
    if (confirm('Are you sure you want to delete this registered face?')) {
      try {
        deleteFaceByIndex(indexToDelete);
        // Refresh the list after deletion
        setFaces(getKnownFaces());
        // Notify parent to refresh detections
        onFacesChanged?.();
      } catch (error) {
        console.error('Failed to delete face:', error);
        toast.error('Failed to delete face. Please try again.');
      }
    }
  }, [onFacesChanged]);

  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to delete ALL registered faces? This cannot be undone.')) {
      try {
        clearAllFaces();
        setFaces([]);
        // Notify parent to refresh detections
        onFacesChanged?.();
      } catch (error) {
        console.error('Failed to clear faces:', error);
        toast.error('Failed to clear faces. Please try again.');
      }
    }
  }, [onFacesChanged]);

  const handleUserAdded = useCallback(() => {
    // Refresh the face list
    setFaces(getKnownFaces());
    // Notify parent
    onFacesChanged?.();
  }, [onFacesChanged]);

  const handleEdit = useCallback((face: KnownFace, index: number) => {
    setEditingFace({ face, index });
    setShowEditUser(true);
  }, []);

  const handleUserUpdated = useCallback(() => {
    // Refresh the face list
    setFaces(getKnownFaces());
    // Notify parent
    onFacesChanged?.();
    // Clear editing state
    invalidateCache();
  }, [onFacesChanged]);

  return (
    <>
      <AddUserModal
        show={showAddUser}
        onHide={() => setShowAddUser(false)}
        onUserAdded={handleUserAdded}
      />
      <EditUserModal
        show={showEditUser}
        onHide={() => {
          setShowEditUser(false);
          setEditingFace(null);
        }}
        face={editingFace?.face || null}
        faceIndex={editingFace?.index || -1}
        onUserUpdated={handleUserUpdated}
      />
    <Modal 
      show={show} 
      onHide={onHide}
      size="lg"
      centered
      contentClassName="border-0"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <Modal.Header 
        closeButton 
        style={{ 
          backgroundColor: 'var(--bg-card)', 
          borderBottom: '1px solid var(--border-color)',
          color: 'var(--text-primary)'
        }}
      >
        <Modal.Title>Manage Users</Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}>
        {/* Add User Button */}
        <Button
          className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
          onClick={() => setShowAddUser(true)}
          style={{
            backgroundColor: 'var(--accent-blue)',
            border: 'none',
            padding: '10px',
            borderRadius: '6px',
            fontWeight: '600'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Add User
        </Button>

        {faces.length === 0 ? (
          <Alert 
            variant="info" 
            style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)'
            }}
          >
            No faces registered yet. Start the webcam and click "Register Face" when you detect someone.
          </Alert>
        ) : (
          <>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <p className="mb-0" style={{ color: 'var(--text-secondary)' }}>
                Total registered: <Badge bg="primary">{faces.length}</Badge>
              </p>
              <Button 
                variant="danger" 
                size="sm"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            </div>
            
            <ListGroup variant="flush">
              {faces.map((face, idx) => (
                <ListGroup.Item 
                  key={idx}
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    borderRadius: '6px'
                  }}
                >
                  <div>
                    <strong>{face.name}</strong>
                    <br />
                    <small style={{ color: 'var(--text-secondary)' }}>
                      Descriptor: {face.descriptor.length} features
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEdit(face, idx)}
                      style={{ fontSize: '13px' }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(idx)}
                      style={{ fontSize: '13px' }}
                    >
                      Delete
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        )}
      </Modal.Body>
    </Modal>
    </>
  );
}
