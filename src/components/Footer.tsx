
const Footer = () => {
  return (
    <footer className="bg-[#121212] border-t border-gray-700/50 py-4 sm:py-6 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Left side - Copyright with logo placeholder */}
        <div className="flex items-center mb-3 md:mb-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#FF7A00] rounded mr-2 sm:mr-3 flex items-center justify-center shadow-md">
            <span className="text-xs font-bold text-white">AC</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">
            © 2024 AI Character Chat. All Rights Reserved.
          </p>
        </div>

        {/* Right side - Privacy and Terms links */}
        <div className="flex space-x-4 sm:space-x-6">
          <a 
            href="#" 
            className="text-xs sm:text-sm text-gray-400 hover:text-[#FF7A00] transition-colors underline-offset-4 hover:underline min-h-[44px] flex items-center px-2 py-2"
          >
            Privacy Policy
          </a>
          <a 
            href="#" 
            className="text-xs sm:text-sm text-gray-400 hover:text-[#FF7A00] transition-colors underline-offset-4 hover:underline min-h-[44px] flex items-center px-2 py-2"
          >
            Terms of Use
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
