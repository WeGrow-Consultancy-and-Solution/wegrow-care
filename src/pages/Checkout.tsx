import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { useAppContext } from "../contexts/AppContext";
import { formatPrice } from "../data/mockData";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Lock, UserCircle, Mail, ShieldCheck, ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "../components/ui/Button";

export function Checkout() {
  const { items, updateQuantity, removeFromCart, getTotal, clearCart, getItemCount } = useCart();
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const [paymentStep, setPaymentStep] = useState<'cart' | 'paying' | 'success'>('cart');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const total = getTotal();
  const itemCount = getItemCount();

  const { users, createTicket } = useAppContext();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const handleBookService = async () => {
    if (!currentUser) return;
    if (!selectedDate || !selectedTime) {
      setPaymentError("Please select a date and time for your booking.");
      return;
    }
    setPaymentLoading(true);
    setPaymentError('');
    
    try {
      for (const item of items) {
        // Generate Human-Readable Order ID (e.g., PHY-12345)
        const prefix = item.title.toLowerCase().includes('physio') ? 'PHY' : 
                       item.title.toLowerCase().includes('oxygen') ? 'OX' :
                       item.title.toLowerCase().includes('bipap') ? 'BIP' :
                       item.title.toLowerCase().includes('cpap') ? 'CPA' :
                       item.title.toLowerCase().includes('surgery') ? 'SUR' : 'GEN';
        const orderNumber = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

        await createTicket({
          clientId: currentUser.id,
          providerId: null, // Firestore requires null instead of undefined
          serviceType: item.title,
          orderNumber: orderNumber,
          amount: item.price * item.quantity,
          requirements: `Scheduled for ${selectedDate} at ${selectedTime}\nPrice: ${formatPrice(item.price)} x ${item.quantity}\nBase instructions: ${item.serviceId}`,
          estimatedCompletion: selectedDate,
        });
      }
      
      setPaymentStep('success');
      clearCart();
    } catch (err: any) {
      setPaymentError(err.message || 'Booking failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ─── Empty Cart ───
  if (items.length === 0 && paymentStep !== 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-8">Browse our services and add them to your cart to get started.</p>
          <Button asChild className="rounded-full px-8 h-12 bg-slate-900 hover:bg-slate-800">
            <Link to="/services">Browse Services</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ─── Payment Success ───
  if (paymentStep === 'success') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="text-center"
        >
          <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Booking Requested!</h2>
          <p className="text-slate-500 mb-8 max-w-md">Your services have been requested successfully. A provider will confirm within 30 minutes. Once confirmed, you can securely pay from your dashboard.</p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="rounded-full px-8 h-12 bg-slate-900 hover:bg-slate-800">
              <Link to="/client-dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" asChild className="rounded-full px-8 h-12">
              <Link to="/services">Book More Services</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Main Checkout Layout ───
  return (
    <div className="flex-1 py-8 px-4 md:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <span className="bg-slate-100 text-slate-600 text-sm font-medium px-3 py-1 rounded-full">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* ─── LEFT: Auth / User Info ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-28">
              {currentUser ? (
                <LoggedInUserCard user={currentUser} />
              ) : (
                <CheckoutAuthForm />
              )}
            </div>
          </div>

          {/* ─── RIGHT: Cart Summary + Payment ─── */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Cart Items */}
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Order Summary</h3>
                {items.map((item) => (
                  <div key={item.serviceId} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                      <p className="text-sm text-slate-500">{formatPrice(item.price)} each</p>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button 
                          onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                          className="p-2 hover:bg-slate-50 transition-colors rounded-l-lg"
                        >
                          <Minus className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                          className="p-2 hover:bg-slate-50 transition-colors rounded-r-lg"
                        >
                          <Plus className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                      </div>
                      
                      <span className="w-24 text-right font-semibold text-slate-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      
                      <button 
                        onClick={() => removeFromCart(item.serviceId)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Booking Configuration area */}
              <div className="bg-slate-50 p-6 space-y-5 border-t border-slate-200">
                <h3 className="font-semibold text-slate-900">Schedule Your Service</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> Date
                    </label>
                    <input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Time
                    </label>
                    <input 
                      type="time" 
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-slate-900">Total</span>
                    <span className="text-lg font-bold text-slate-900">{formatPrice(total)}</span>
                  </div>
                </div>

                {paymentError && (
                  <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{paymentError}</p>
                )}

                <button
                  onClick={handleBookService}
                  disabled={!currentUser || paymentLoading || !selectedDate || !selectedTime}
                  className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-base transition-all mt-2 ${
                    currentUser && selectedDate && selectedTime 
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                  {paymentLoading ? 'Processing...' : !currentUser ? 'Sign in to book' : `Request Booking • ${formatPrice(total)}`}
                </button>

                <div className="flex items-center justify-center gap-3 mt-4 text-center">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                  <span className="text-xs text-slate-500">No payment required until a provider confirms your slot.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Logged-in User Card Component ───
function LoggedInUserCard({ user }: { user: any }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center">
          <UserCircle className="h-8 w-8 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{user.name}</h3>
          <p className="text-sm text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-emerald-800">Ready to checkout</p>
          <p className="text-xs text-emerald-600">Your account is verified. Proceed to payment on the right.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Auth Form for Checkout ───
function CheckoutAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Lock className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{isRegistering ? 'Create Account' : 'Sign In'}</h3>
          <p className="text-xs text-slate-500">to complete your booking</p>
        </div>
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-3">
        <div>
          <label htmlFor="checkout-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            id="checkout-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="checkout-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            id="checkout-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors"
        >
          <Mail className="h-4 w-4" />
          {loading ? "..." : isRegistering ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div className="my-4 flex items-center before:flex-1 before:border-t before:border-slate-200 after:flex-1 after:border-t after:border-slate-200">
        <span className="mx-3 text-xs font-medium text-slate-400">OR</span>
      </div>

      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 text-sm transition-colors"
      >
        Sign in with Google
      </button>

      <p className="mt-4 text-center text-xs text-slate-500">
        {isRegistering ? "Have an account?" : "New here?"}
        <button onClick={() => { setIsRegistering(!isRegistering); setError(""); }} className="ml-1 text-indigo-600 font-medium">
          {isRegistering ? "Sign In" : "Register"}
        </button>
      </p>
    </div>
  );
}
