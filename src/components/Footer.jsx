import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
   <footer className="border-t border-white/15 bg-[linear-gradient(90deg,_rgba(15,23,42,0.96),_rgba(30,64,175,0.94),_rgba(14,116,144,0.9))] text-white shadow-[0_-10px_28px_rgba(15,23,42,0.16)]">
  <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-3 text-center text-sm">
    <p className="font-semibold tracking-wide text-white">
      &copy; {year} <span className="text-sky-200">Job Match</span>. All rights reserved.
    </p>
  </div>
</footer>
  );
};

export default Footer;
