import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const toggleMobile = () => {
    setMobileOpen((prev) => !prev);
    setServicesOpen(false);
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setServicesOpen(false);
  };

  const serviceLinks = [
    { to: '/?category=SoundcloudBoost', label: 'SoundCloud Boost' },
    { to: '/?category=GraphicDesign', label: 'Graphic Design' },
    { to: '/?category=VideoEditing', label: 'Video Editing' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-dark border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex-shrink-0" onClick={closeMobile}>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              SoundCloudBoost
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => setServicesOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/services')
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Services
                <FaChevronDown
                  className={`text-xs transition-transform ${
                    servicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setServicesOpen(false)}
                      className={`block px-4 py-3 text-sm transition-colors ${
                        isActive(link.to)
                          ? 'text-primary bg-primary/10'
                          : 'text-gray-300 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/orders"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/orders')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Track Order
            </Link>
          </div>

          {/* Admin Link (desktop) */}
          <div className="hidden md:flex items-center">
            <Link
              to="/admin/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={toggleMobile}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-dark">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              onClick={closeMobile}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Home
            </Link>

            {/* Mobile Services */}
            <button
              onClick={() => setServicesOpen((prev) => !prev)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith('/services')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Services
              <FaChevronDown
                className={`text-xs transition-transform ${
                  servicesOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {servicesOpen && (
              <div className="ml-4 space-y-1">
                {serviceLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobile}
                    className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                      isActive(link.to)
                        ? 'text-primary bg-primary/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            <Link
              to="/orders"
              onClick={closeMobile}
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive('/orders')
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              Track Order
            </Link>

            <div className="border-t border-gray-800 pt-2 mt-2">
              <Link
                to="/admin/login"
                onClick={closeMobile}
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-primary transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
