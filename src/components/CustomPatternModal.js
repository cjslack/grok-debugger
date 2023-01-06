import React, { useEffect, useRef, useState } from "react";
import { AlertTriangle, PlusSquare, Save, X } from "react-feather";

const nameRegex = /^([A-Z0-9_]+)$/;

export const CustomPatternModal = ({
  setShowModal,
  groks,
  pattern,
  setPattern,
  patterns,
  customPatterns,
  setCustomPatterns,
}) => {
  const [name, setName] = useState("");
  const [warnMessage, setWarnMessage] = useState(null);

  const firstUpdate = useRef(true);

  useEffect(() => {
    if (pattern == "") {
      return setWarnMessage("Grok pattern cannot be blank.");
    }
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    let timeout = setTimeout(() => {
      if (!nameRegex.test(name)) {
        return setWarnMessage("Pattern name can only contain letters, numbers, or underscores.");
      }
      if (patterns.map((p) => p.id).includes(name)) {
        return setWarnMessage("This pattern name already exists in a collection. Try another name.");
      } else {
        return setWarnMessage(null);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (warnMessage) return;
    groks.createPattern(pattern, name);
    setCustomPatterns(() => [...customPatterns, { id: name, pattern }]);
    setPattern(() => `%{${name}}`);
    setShowModal(null);
  };

  return (
    <div className="modal">
      <div className="modal-container" style={{ width: "32rem" }}>
        <div className="modal-header">
          <h3>Add as Custom Pattern</h3>
          <X size="1.25rem" onClick={() => setShowModal(null)} />
        </div>
        <form>
          <div className="modal-content">
            {warnMessage && (
              <div className="notification warn">
                <AlertTriangle />
                <span>{warnMessage}</span>
              </div>
            )}
            <input
              autoFocus={true}
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              name="name"
              placeholder="NAME"
              autoComplete="off"
            />
            {/* <div style={{ marginTop: "12px", marginBottom: "12px" }}>
              <input disabled value={pattern} autoComplete="off" />
            </div> */}
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={(e) => handleSubmit(e)}>
              <PlusSquare />
              <span>Add Custom Pattern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
