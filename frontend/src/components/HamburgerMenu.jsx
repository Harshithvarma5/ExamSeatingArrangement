import React from 'react';

const HamburgerMenu = ({ isOpen, toggle }) => {
  return (
    <div className="md:hidden flex items-center justify-center mr-4">
      <button 
        onClick={toggle}
        className="focus:outline-none p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg group"
        aria-label={isOpen ? "Close Menu" : "Open Menu"}
      >
        <div className={`hamburger-label ${isOpen ? 'is-active' : ''} text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400`}>
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>
      </button>
    </div>
  );
};

export default HamburgerMenu;
