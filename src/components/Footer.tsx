import React from 'react';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Youtube, ExternalLink } from 'lucide-react';

const Footer = () => (
  <footer className="bg-gradient-to-r from-green-800 to-green-500 text-white py-12 px-4 mt-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* About */}
      <div>
        <h3 className="text-2xl font-bold mb-2">About BoxCric</h3>
        <div className="w-16 h-1 bg-white mb-4" />
        <p className="text-sm mb-6 leading-relaxed">BoxCric is your one-stop platform to discover, compare, and book the best box cricket grounds near you. Enjoy seamless booking, verified reviews, and exclusive offers for your next cricket match!</p>
        <div className="flex space-x-3">
          <a href="#" className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors duration-200" aria-label="Facebook">
            <Facebook className="w-4 h-4" />
          </a>
          <a href="#" className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors duration-200" aria-label="Instagram">
            <Instagram className="w-4 h-4" />
          </a>
          <a href="#" className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors duration-200" aria-label="Twitter">
            <Twitter className="w-4 h-4" />
          </a>
          <a href="#" className="bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors duration-200" aria-label="YouTube">
            <Youtube className="w-4 h-4" />
          </a>
        </div>
      </div>
      
      {/* Our Services */}
      <div>
        <h3 className="text-xl font-bold mb-2">Our Services</h3>
        <div className="w-12 h-1 bg-white mb-4" />
        <ul className="space-y-2 text-sm">
          <li className="hover:text-green-200 transition-colors cursor-pointer">🏏 Ground Booking</li>
          <li className="hover:text-green-200 transition-colors cursor-pointer">👥 Team Management</li>
          <li className="hover:text-green-200 transition-colors cursor-pointer">📅 Match Scheduling</li>
          <li className="hover:text-green-200 transition-colors cursor-pointer">💳 Online Payments</li>
          <li className="hover:text-green-200 transition-colors cursor-pointer">📊 Player Stats & Leaderboards</li>
          <li className="hover:text-green-200 transition-colors cursor-pointer">🏆 Tournaments</li>
        </ul>
      </div>
      
      {/* Quick Links */}
      <div>
        <h3 className="text-xl font-bold mb-2">Quick Links</h3>
        <div className="w-12 h-1 bg-white mb-4" />
        <ul className="space-y-2 text-sm">
          <li><a href="/about" className="hover:text-green-200 transition-colors flex items-center group">
            About Us <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a></li>
          <li><a href="/help" className="hover:text-green-200 transition-colors flex items-center group">
            Help & Support <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a></li>
          <li><a href="/profile" className="hover:text-green-200 transition-colors flex items-center group">
            My Bookings <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a></li>
          <li><a href="/settings" className="hover:text-green-200 transition-colors flex items-center group">
            Settings <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a></li>
          <li><a href="/" className="hover:text-green-200 transition-colors flex items-center group">
            Home <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a></li>
          <li><a href="/tournaments" className="hover:text-green-200 transition-colors flex items-center group">
            Tournaments <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a></li>
        </ul>
      </div>
      
      {/* Contact Us */}
      <div>
        <h3 className="text-xl font-bold mb-2">Contact Us</h3>
        <div className="w-12 h-1 bg-white mb-4" />
        <ul className="space-y-3 text-sm">
          <li className="flex items-center space-x-2 hover:text-green-200 transition-colors cursor-pointer">
            <Phone className="w-4 h-4" />
            <span>+91 98765 43210</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-200 transition-colors cursor-pointer">
            <Mail className="w-4 h-4" />
            <span>support@boxcric.com</span>
          </li>
          <li className="flex items-center space-x-2 hover:text-green-200 transition-colors cursor-pointer">
            <MapPin className="w-4 h-4" />
            <span>Ahmedabad, Gujarat, India</span>
          </li>
        </ul>
        
        {/* Newsletter Signup */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2">Stay Updated</h4>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-l text-white placeholder-white/60 focus:outline-none focus:border-white/40"
            />
            <button className="px-3 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-r text-sm font-medium">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div className="border-t border-white/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-white/80">
      <div>© {new Date().getFullYear()} BoxCric. All Rights Reserved.</div>
      <div className="flex space-x-6 mt-2 md:mt-0">
        <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
        <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
        <a href="/about" className="hover:text-white transition-colors">About</a>
        <a href="/cookies" className="hover:text-white transition-colors">Cookie Policy</a>
      </div>
    </div>
  </footer>
);

export default Footer; 