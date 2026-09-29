import { Facebook, Instagram, Youtube, Mail, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const TikTokIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.88-.64-1.61-1.46-2.11-2.42-.02 2.34.02 12.18-.01 14.51-.1 1.86-.81 3.72-2.33 4.86-1.58 1.2-3.83 1.55-5.77 1.01-1.94-.53-3.73-2.07-4.32-3.99-.78-2.48-.12-5.49 1.77-7.23 1.34-1.25 3.22-1.89 5.02-1.76v4.05c-1.12-.13-2.33.15-3.15.96-.82.81-1.14 2.05-.75 3.13.39 1.06 1.56 1.82 2.68 1.8 1.12-.01 2.22-.73 2.59-1.78.14-.38.19-.79.18-1.2V.02z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">JayTech Solutions</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Building cutting-edge software solutions and empowering the next generation of tech leaders through professional training. Located in Koforidua, Ghana.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com/JayTechSolutions" className="hover:text-blue-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://instagram.com/JayTechSolutions" className="hover:text-pink-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/JayTech" className="hover:text-red-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://tiktok.com/@JayTech" className="hover:text-white transition-colors">
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Services</Link></li>
              <li><Link to="/training" className="hover:text-blue-400 transition-colors">Course</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Web Development</Link></li>
              <li><Link to="/services" className="hover:text-blue-400 transition-colors">Mobile Apps</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:jaytechsolutions.net@gmail.com" className="hover:text-blue-400">jaytechsolutions.net@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
          <p>© {new Date().getFullYear()} JayTech Solutions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
