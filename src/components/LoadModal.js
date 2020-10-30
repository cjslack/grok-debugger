import React from 'react';
import { X, Edit2 } from 'react-feather';

export const LoadModal = ({ setShowModal, savedPatterns, setSavedPatterns, setPattern }) => {
  const handleDelete = (key) => {
    localStorage.removeItem(key);
    setSavedPatterns(savedPatterns.filter((p) => p.title !== key));
  };

  const handleEdit = (key) => {
    const val = localStorage.getItem(key);
    setPattern(val);
    setShowModal(null);
  };

  return (
    <div className="modal">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Load Pattern</h3>
          <X size="1.25rem" onClick={() => setShowModal(null)} />
        </div>
        <div className="modal-content" style={{ boxShadow: '2px 2px rgba(0, 0, 0, 0.6)', borderRadius: '5px' }}>
          <div className="pattern-grid">
            <div className="grid-headers">
              <div>Title</div>
              <div>Pattern</div>
            </div>
            <div className="grid-body">
              {savedPatterns.map((pattern) => {
                return (
                  <div className="row" key={pattern.title}>
                    <div>{pattern.title}</div>
                    <div>{pattern.pattern}</div>
                    <div className="btn edit">
                      <Edit2 size="1rem" onClick={() => handleEdit(pattern.title)} />
                    </div>
                    <div className="btn delete" onClick={() => handleDelete(pattern.title)}>
                      <X size="1rem" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
