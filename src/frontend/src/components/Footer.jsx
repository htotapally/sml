import React from 'react'

function Footer() {

  return (
    <footer className="bg-gray-200 text-gray-700 py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Storov. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
