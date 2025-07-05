
const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">About Us</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">API</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help Center</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Documentation</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Community</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © 2024 AI Character Chat. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Twitter</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">LinkedIn</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
