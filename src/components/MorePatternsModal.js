import React, { useState } from "react";
import { DownloadCloud, X, XOctagon } from "react-feather";

export const MorePatternsModal = ({ setShowModal, collections, setCollections, patterns, setPatterns, groks }) => {
  const urlRegex =
    /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  const titleRegex = /^[\w\d _-]{1,20}/;

  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    // Validation
    e.preventDefault();
    setErrorMessage("");
    if (!urlRegex.test(url)) return setErrorMessage("URL is not valid");
    if (!titleRegex.test(title))
      return setErrorMessage("Title can only contain letters, numbers, spaces, underscores, and dashes.");
    if (collections.map((c) => c.label).includes(title))
      return setErrorMessage("This title is already assigned to a set. Choose another.");
    const random = (Math.random() + 1).toString(36).substring(7);

    // Attempt to load pattern
    try {
      const newPatterns = await groks.load(url).then((ids) => {
        return ids.map((id) => {
          return { id, collection: random };
        });
      });
      if (!newPatterns.length)
        return setErrorMessage("Error loading pattern set. Make sure the url and format of set is correct.");
      setPatterns((patterns) => [...patterns, ...newPatterns.flat()]);
      const updatedCollection = [...collections, { value: random, label: title, url, active: true }].sort(
        (a, b) => a.value > b.value
      );
      setCollections(updatedCollection);
    } catch (err) {
      console.log(err);
      setErrorMessage("Error loading pattern set");
    }
  };

  const handleDelete = (value) => {
    setCollections(collections.filter((c) => c.value !== value));
    setPatterns(patterns.filter((p) => p.collection !== value));
  };

  return (
    <div className="modal">
      <div className="modal-container" style={{ width: "32rem" }}>
        <div className="modal-header">
          <h3>Download Pattern Set from URL</h3>
          <X size="1.25rem" onClick={() => setShowModal(null)} />
        </div>
        <form>
          <div className="modal-content">
            {errorMessage && (
              <div className="notification error">
                <XOctagon />
                <span>{errorMessage}</span>
              </div>
            )}
            <input
              autoFocus={true}
              name="url"
              placeholder="URL"
              autoComplete="off"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <input
              style={{ marginTop: 10 }}
              autoFocus={true}
              name="title"
              placeholder="Title"
              maxLength={20}
              autoComplete="off"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="modal-footer">
            <button className="btn" onClick={(e) => handleSubmit(e)}>
              <DownloadCloud />
              <span>Download</span>
            </button>
          </div>
          {!!collections.filter((c) => c.url).length && (
            <>
              <hr style={{ marginTop: "12px" }} />
              <div>
                <h3>Loaded Sets</h3>
                <div>
                  {collections
                    .filter((c) => c.url)
                    .map((c) => {
                      return (
                        <div className="set-item" key={c.value}>
                          <div>{c.label}</div>
                          <div className="btn delete" onClick={() => handleDelete(c.value)}>
                            <X size="1rem" />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
