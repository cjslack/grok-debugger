import React from 'react';
import { GitHub, Mail } from 'react-feather';

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'var(--dark)',
    padding: '0 1rem',
    height: '3.5rem',
    width: '100%',
    position: 'fixed',
    boxShadow: '-2px 2px rgba(0, 0, 0, .2)',
    zIndex: 1,
  },
  navLinks: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
};

export const Navbar = () => {
  return (
    <div className="navbar" style={styles.navbar}>
      <h1>
        <span style={{ color: '#82aaff' }}>{'%{'}</span>
        <span style={{ color: '#89DDFF' }}>GROK</span>
        <span style={{ color: '#82aaff' }}>:</span>
        <span style={{ color: '#C792EA' }}>debugger</span>
        <span style={{ color: '#82aaff' }}>{'}'}</span>
        <span className="beta" style={{ color: 'silver', fontSize: '1rem' }}>
          {' beta'}
        </span>
      </h1>
      <div className="nav-links">
        <a href="https://github.com/cjslack/grok-debugger" target="_blank">
          <GitHub />
          <span>GitHub</span>
        </a>
        <a href="mailto:cjslack94@gmail.com">
          <Mail />
          <span>contact</span>
        </a>
      </div>
    </div>
  );
};
