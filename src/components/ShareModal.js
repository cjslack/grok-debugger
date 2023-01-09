import React, { useState, useEffect, useRef } from "react";
import { X, AlertTriangle, Copy } from "react-feather";

export const ShareModal = ({ setShowModal, pattern, sample }) => {
  const [showWarn, setShowWarn] = useState(false);
  const [url, setUrl] = useState("");

  const [copyIndicator, setCopyIndicator] = useState(false);

  const ref = useRef();

  const onLoad = async () => {
    setUrl(
      window.location.origin + "?pattern=" + encodeURIComponent(pattern) + "&sample=" + encodeURIComponent(sample)
      // + "&collections=" +
      // encodeURIComponent(JSON.stringify(collections.filter((c) => c.active)))
    );
  };

  useEffect(() => {
    onLoad();
  }, []);

  useEffect(() => {
    ref.current.select();
    if (url.length > 2000) return setShowWarn(true);
    setShowWarn(false);
  }, [url]);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(url);
    setCopyIndicator(true);
    setTimeout(() => {
      setCopyIndicator(false);
    }, 2000);
  };

  return (
    <div className="modal">
      <div className="modal-container" style={{ width: "32rem" }}>
        <div className="modal-header">
          <h3>Share</h3>
          <X size="1.25rem" onClick={() => setShowModal(null)} />
        </div>
        <form>
          <div className="modal-content">
            {showWarn && (
              <div className="notification warn">
                <AlertTriangle />
                <span>This url may be too long to work on some browsers</span>
              </div>
            )}
            <input id="urlInput" ref={ref} autoFocus={true} readOnly value={url} name="url" autoComplete="off"></input>
          </div>
          <div className="modal-footer">
            <button className={`btn ${copyIndicator ? " success" : ""}`} onClick={(e) => handleSubmit(e)}>
              <Copy />
              <span>{copyIndicator ? "Copied!" : "Copy Link"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
