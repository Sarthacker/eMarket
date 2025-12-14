const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 text-center py-6 text-gray-500 text-sm mt-12">
      © {year} eMarket — All rights reserved.
    </footer>
  );
};

export default Footer;
