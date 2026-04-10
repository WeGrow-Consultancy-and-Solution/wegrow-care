import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { BookingFlashy } from "./BookingFlashy";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Mail, LogIn, ShieldCheck } from "lucide-react";

export function Booking() {
  const { currentUser } = useAppContext();

  // If logged in, show the actual booking form
  if (currentUser) {
    return <BookingFlashy />;
  }

  // If NOT logged in, show inline auth gate
  return <BookingAuthGate />;
}

function BookingAuthGate() {
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
      // onAuthStateChanged in AppContext will handle the rest
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
      setError(err.message || "Failed to authenticate with Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in to continue booking</h2>
          <p className="text-slate-500">Create an account or sign in to schedule your visit</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label htmlFor="booking-email" className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                id="booking-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="patient@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="booking-password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                id="booking-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              <Mail className="h-5 w-5" />
              {loading ? "Authenticating..." : (isRegistering ? "Create Account & Continue" : "Sign In & Continue")}
            </button>
          </form>
          
          <div className="my-6 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-slate-200 after:mt-0.5 after:flex-1 after:border-t after:border-slate-200">
            <p className="mx-4 mb-0 text-center text-sm font-semibold text-slate-400">OR</p>
          </div>
          
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition-colors"
          >
            Sign in with Google
          </button>
          
          <p className="mt-6 text-center text-sm text-slate-500">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(""); }} 
              className="ml-2 text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {isRegistering ? "Sign In" : "Register"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
