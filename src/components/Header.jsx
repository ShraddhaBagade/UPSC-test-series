import { useState } from "react";
import { Menu, X, ChevronDown, LogIn, User } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const menuItems = [
    { name: "Home", link: "/" },
    {
      name: "Dashboard",
      dropdown: [
        { name: "Student Dashboard", link: "/dashboard" },
        { name: "Progress Tracking", link: "/progress" },
        { name: "Test History", link: "/history" },
      ],
    },
    {
      name: "Test Series",
      dropdown: [
        { name: "Sectional Tests", link: "/sectional" },
        { name: "Previous Year Papers", link: "/previous" },
        { name: "Full Length Tests", link: "/fulllength" },
      ],
    },
    { name: "Pricing", link: "/pricing" },
    { name: "About", link: "/about" },
    { name: "Contact", link: "/contact" },
  ];

  return (
    <header className="bg-white text-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold text-blue-600">
            <Link to="/">UPSC CSAT</Link>
          </h1>
        </div>

        {/* Center: Nav (takes remaining space, but centered and constrained) */}
        <nav className="hidden md:flex flex-1 justify-center">
          {/* constrain nav width so spacing stays reasonable on big screens */}
          <ul className="flex w-full max-w-3xl justify-between items-center">
            {menuItems.map((item) =>
              item.dropdown ? (
                <li
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button className="flex items-center gap-1 font-medium text-gray-700 hover:text-blue-600 transition bg-transparent border-0 outline-none focus:outline-none">
                    {item.name}
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {openDropdown === item.name && (
                    // center dropdown under its parent item
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border rounded-lg shadow-lg py-2 w-48">
                      {item.dropdown.map((sub) => (
                        <Link
                          key={sub.name}
                          to={sub.link}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ) : (
                <li key={item.name}>
                  <Link
                    to={item.link}
                    className="font-medium text-gray-700 hover:text-blue-600 transition"
                  >
                    {item.name}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="flex-shrink-0 flex items-center space-x-4">
          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="flex items-center bg-gray-100 text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
            <Link
              to="/register"
              className="flex items-center bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <User className="h-4 w-4 mr-2" />
              Register
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-gray-800"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <nav className="md:hidden bg-gray-50 px-6 py-4 space-y-4 border-t">
          {menuItems.map((item) =>
            item.dropdown ? (
              <div key={item.name} className="space-y-2">
                <button
                  className="flex items-center justify-between w-full text-left font-semibold text-gray-700 hover:text-blue-600"
                  onClick={() =>
                    setOpenDropdown(openDropdown === item.name ? null : item.name)
                  }
                >
                  {item.name}
                  <ChevronDown
                    className={`h-4 w-4 transform transition ${
                      openDropdown === item.name ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openDropdown === item.name && (
                  <div className="ml-4 space-y-2">
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.name}
                        to={sub.link}
                        className="block text-gray-700 hover:text-blue-600"
                        onClick={() => setIsOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.name}
                to={item.link}
                className="block text-gray-700 font-medium hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            )
          )}
          <div className="flex flex-col space-y-2 pt-4 border-t">
            <Link
              to="/login"
              className="flex items-center justify-center bg-gray-100 text-gray-800 font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Link>
            <Link
              to="/register"
              className="flex items-center justify-center bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 mr-2" />
              Register
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
