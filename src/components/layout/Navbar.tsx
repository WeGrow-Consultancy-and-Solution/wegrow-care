import { Link, useNavigate } from "react-router-dom";
import { HeartPulse, Menu, X, UserCircle, LogOut, LogIn, ShoppingCart, Phone } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../../contexts/AppContext";
import { useCart } from "../../contexts/CartContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAppContext();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const cartCount = getItemCount();

  const isLoggedIn = !!currentUser;
  const isStaff = isLoggedIn && (currentUser.role === 'provider' || currentUser.role === 'admin');

  const handleSignOut = async () => {
    try { await logout(); navigate('/'); } catch {}
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/';
    return `/${currentUser.role}-dashboard`;
  };

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    // Small delay to allow menu animation to start closing before scrolling
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        navigate(`/#${id}`);
      }
    }, 150);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/20" style={{ paddingTop: 'var(--safe-area-inset-top)' }}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <img 
              src="/assets/logo.jpeg" 
              alt="CARE AT EASE Logo" 
              className="h-10 w-auto rounded-lg object-contain"
            />
            <span className="text-lg font-bold text-slate-900 hidden lg:block uppercase" style={{ fontFamily: 'var(--font-heading)' }}>
              CARE AT EASE
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            {!isStaff && (
              <>
                <Link to="/services" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Services</Link>
                <button onClick={() => scrollToSection('services')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Pricing</button>
                <button onClick={() => scrollToSection('blog')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Blog</button>
                <button onClick={() => scrollToSection('faq')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">FAQ</button>
                <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Contact</button>
              </>
            )}

            {isLoggedIn && (
              <Link to={getDashboardLink()} className="text-sm font-medium text-primary hover:text-primary-700 transition-colors">Dashboard</Link>
            )}

            {currentUser && (
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200 transition-all">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <UserCircle className="h-4 w-4" />
                )}
                {currentUser.name.split(' ')[0]}
              </Link>
            )}

            {/* Cart — for non-staff */}
            {!isStaff && (
              <Link to="/checkout" className="relative flex items-center justify-center h-10 w-10 rounded-full bg-primary-50 text-primary hover:bg-primary-100 transition-colors">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Call button */}
            {!isStaff && (
              <Button className="bg-white border-2 border-primary text-primary hover:bg-primary-50 rounded-full px-4 h-9 text-sm font-semibold" asChild>
                <a href="tel:+918802594790">
                  <Phone className="h-3.5 w-3.5 mr-1.5" />
                  Call Us
                </a>
              </Button>
            )}

            {/* Auth buttons */}
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Button className="bg-primary text-white hover:bg-primary-700 rounded-full px-5 h-9 text-sm font-semibold shadow-md shadow-primary/20" asChild>
                <Link to="/login">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile: Cart + Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            {!isStaff && (
              <Link to="/checkout" className="relative flex items-center justify-center h-9 w-9 rounded-full bg-primary-50 text-primary">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
            <button className="p-2 text-slate-600 rounded-full hover:bg-slate-100 transition-colors" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-white border-t border-slate-100"
          >
            <div className="px-6 py-4 space-y-3">
              {!isStaff && (
                <>
                  <Link to="/services" onClick={() => setIsOpen(false)} className="block text-slate-700 font-medium py-2">Services</Link>
                  <button onClick={() => scrollToSection('services')} className="block w-full text-left text-slate-700 font-medium py-2">Pricing</button>
                  <button onClick={() => scrollToSection('blog')} className="block w-full text-left text-slate-700 font-medium py-2">Blog</button>
                  <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-slate-700 font-medium py-2">FAQ</button>
                  <button onClick={() => scrollToSection('contact')} className="block w-full text-left text-slate-700 font-medium py-2">Contact</button>
                </>
              )}
              {isLoggedIn && (
                <>
                  <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="block text-primary font-medium py-2">Dashboard</Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="block text-slate-700 font-medium py-2">My Profile</Link>
                </>
              )}
              <div className="pt-3 border-t border-slate-100">
                {isLoggedIn ? (
                  <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="flex items-center gap-2 text-red-500 font-medium py-2">
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-primary font-semibold py-2">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
