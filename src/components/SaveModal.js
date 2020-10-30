import React, { useEffect, useState } from 'react';
import { Save, X, XOctagon, AlertTriangle } from 'react-feather';

export const SaveModal = ({ setShowModal, pattern, savedPatterns, setSavedPatterns }) => {
  const [title, setTitle] = useState('');
  const [showWarn, setShowWarn] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(title && pattern)) {
      return setShowError(true);
    }
    localStorage.setItem(title, pattern);
    setSavedPatterns([...savedPatterns.filter((p) => p.title !== title), { title, pattern }]);
    setShowModal(null);
  };

  useEffect(() => {
    let timeout = setTimeout(() => {
      if (savedPatterns.find((p) => p.title === title)) {
        setShowWarn(true);
      } else {
        setShowWarn(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [title]);

  return (
    <div className="modal">
      <div className="modal-container" style={{ width: '30rem' }}>
        <div className="modal-header">
          <h3>Save Pattern</h3>
          <X size="1.25rem" onClick={() => setShowModal(null)} />
        </div>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="modal-content">
            {showWarn && (
              <div className="notification warn">
                <AlertTriangle />
                <span>This title already exists. Submit to overwrite.</span>
              </div>
            )}
            {showError && (
              <div className="notification error">
                <XOctagon />
                <span>Title or pattern is blank.</span>
              </div>
            )}
            <input autoFocus={true} value={title} onChange={(e) => setTitle(e.target.value)} name="title" placeholder="title" autoComplete="off"></input>
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn">
              <Save />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
