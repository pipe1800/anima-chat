
const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Left side - Copyright with logo placeholder */}
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-6 h-6 bg-gray-400 rounded mr-3 flex items-center justify-center">
            <span className="text-xs font-bold text-white">AC</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2024 AI Character Chat. All Rights Reserved.
          </p>
        </div>

        {/* Right side - Privacy and Terms links */}
        <div className="flex space-x-6">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900 underline-offset-4 hover:underline">
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
