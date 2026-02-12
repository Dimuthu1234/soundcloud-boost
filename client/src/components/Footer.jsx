import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              SoundCloudBoost
            </span>
            <p className="mt-3 text-gray-400 text-sm leading-relaxed">
              Boost your SoundCloud presence with our professional promotion
              services, graphic design, and video editing.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=SoundcloudBoost"
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  SoundCloud Boost
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=GraphicDesign"
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Graphic Design
                </Link>
              </li>
              <li>
                <Link
                  to="/?category=VideoEditing"
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Video Editing
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/orders"
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                >
                  Track Your Order
                </Link>
              </li>
              <li>
                <span className="text-gray-400 text-sm">
                  support@soundcloudboost.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2025 SoundCloudBoost. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
