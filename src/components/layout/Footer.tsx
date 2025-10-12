import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-primary/5 to-secondary/10 mt-20 py-16 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">AgriPredict</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Empowering farmers with AI-powered insights, real-time market data, and comprehensive agricultural knowledge to make informed decisions.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">Home</Link></li>
              <li><Link to="/prediction" className="text-muted-foreground hover:text-primary transition-colors text-sm">Price Prediction</Link></li>
              <li><Link to="/knowledge" className="text-muted-foreground hover:text-primary transition-colors text-sm">Knowledge Center</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li><span className="text-muted-foreground text-sm">AI Price Predictions</span></li>
              <li><span className="text-muted-foreground text-sm">Weather Analytics</span></li>
              <li><span className="text-muted-foreground text-sm">Market Intelligence</span></li>
              <li><span className="text-muted-foreground text-sm">Government Schemes Info</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">info@agripredict.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground text-sm">Tamil Nadu, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm text-center md:text-left">
              © 2025 AgriPredict. All rights reserved. Empowering Farmers with Insights.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</Link>
              <Link to="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;