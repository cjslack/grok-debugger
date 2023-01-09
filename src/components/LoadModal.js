import React from "react";
import { X, Edit2, Trash2 } from "react-feather";

export const LoadModal = ({ setShowModal, customPatterns, setCustomPatterns, setPattern }) => {
  const handleDelete = (id) => {
    const updatedCustomPatterns = customPatterns.filter((p) => p.id !== id);
    setCustomPatterns(updatedCustomPatterns);
  };

  const handleEdit = (id) => {
    const pattern = customPatterns.find((p) => p.id === id);
    setPattern(pattern.pattern);
    setShowModal(null);
  };

  return (
    <div className="modal">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Edit Custom Patterns</h3>
          <X size="1.25rem" onClick={() => setShowModal(null)} />
        </div>
        <div className="modal-content" style={{ boxShadow: "2px 2px rgba(0, 0, 0, 0.6)" }}>
          {!!customPatterns.length ? (
            <div className="pattern-grid">
              <div className="grid-headers">
                <div>Name</div>
                <div>Pattern</div>
              </div>
              <div className="grid-body">
                {customPatterns.map((pattern) => {
                  return (
                    <div className="row" key={pattern.title}>
                      <div>{pattern.id}</div>
                      <div>{pattern.pattern}</div>
                      <div className="btn edit" onClick={() => handleEdit(pattern.id)}>
                        <Edit2 size="1rem" />
                      </div>
                      <div className="btn delete" onClick={() => handleDelete(pattern.id)}>
                        <Trash2 size="1rem" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <h4>No custom patterns yet</h4>
          )}
        </div>
      </div>
    </div>
  );
};
