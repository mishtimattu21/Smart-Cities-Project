import { Link, useLocation } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { label: "Home", link: "/" },
    { label: "Prediction", link: "/prediction" },
    { label: "Knowledge Center", link: "/knowledge" },
  ];

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border fixed w-full top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            AgriPredict
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.link}
                to={item.link}
                className={`relative text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === item.link
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
                {location.pathname === item.link && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;