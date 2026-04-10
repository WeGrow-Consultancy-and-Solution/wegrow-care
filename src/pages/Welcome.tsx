import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../contexts/AppContext";
import { Sparkles, UserCircle, LogIn, Mail, ShieldCheck } from "lucide-react";
import { auth, db, storage } from "../lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";

export function Welcome() {
  const { currentUser } = useAppContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<'client' | 'provider'>('client');
  const [providerType, setProviderType] = useState("Physiotherapist");
  const [experience, setExperience] = useState("");
  const [hasClinic, setHasClinic] = useState(false);
  const [clinicAddress, setClinicAddress] = useState("");
  const [certificationFile, setCertificationFile] = useState<File | null>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGoogleProfileForm, setShowGoogleProfileForm] = useState(false);
  const [googleUserInfo, setGoogleUserInfo] = useState<{ uid: string; email: string; name: string } | null>(null);

  useEffect(() => {
    if (currentUser && !showGoogleProfileForm) {
      if (currentUser.role === 'client') {
        navigate('/');
      } else {
        navigate(`/${currentUser.role}-dashboard`);
      }
    }
  }, [currentUser, navigate, showGoogleProfileForm]);

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address first to reset password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      if (isRegistering) {
        if (role === 'client' && !prescriptionFile) {
          setError("Please upload your medical prescription (PDF or Image) to proceed.");
          setLoading(false);
          return;
        }
        if (role === 'provider' && !certificationFile) {
          setError("Please upload your medical certification to register as a provider.");
          setLoading(false);
          return;
        }
        
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        
        let certificationUrl = null;
        if (role === 'provider' && certificationFile) {
          const fileRef = ref(storage, `certificate/${cred.user.uid}_${certificationFile.name}`);
          await uploadBytes(fileRef, certificationFile);
          certificationUrl = await getDownloadURL(fileRef);
        }

        let prescriptionUrl = null;
        if (role === 'client' && prescriptionFile) {
          const fileRef = ref(storage, `prescription/${cred.user.uid}_${prescriptionFile.name}`);
          await uploadBytes(fileRef, prescriptionFile);
          prescriptionUrl = await getDownloadURL(fileRef);
        }

        await setDoc(doc(db, 'users', cred.user.uid), {
          name: name || email.split('@')[0],
          email: cred.user.email,
          phone: phone,
          address: role === 'client' ? address : (hasClinic ? clinicAddress : 'Home Visit Only'),
          pincode: pincode,
          role: role === 'provider' ? 'pending_provider' : 'client',
          providerType: role === 'provider' ? providerType : null,
          experience: role === 'provider' ? experience : null,
          hasClinic: role === 'provider' ? hasClinic : null,
          certificationUrl: certificationUrl,
          prescriptionUrl: prescriptionUrl,
          createdAt: new Date().toISOString(),
        });
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
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      
      if (!docSnap.exists()) {
        setGoogleUserInfo({
          uid: user.uid,
          email: user.email || "",
          name: user.displayName || ""
        });
        setName(user.displayName || "");
        setShowGoogleProfileForm(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to authenticate with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUserInfo) return;
    
    setError("");
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', googleUserInfo.uid), {
        name: name,
        email: googleUserInfo.email,
        phone: phone,
        address: address,
        pincode: pincode,
        role: 'client',
        createdAt: new Date().toISOString(),
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) return null;

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl transition-all duration-300">
          {showGoogleProfileForm ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <div className="h-20 w-20 rounded-full bg-blue-600/20 flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                  <UserCircle className="h-10 w-10 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Complete Profile</h1>
                <p className="text-slate-400">Please provide a few details to get started.</p>
              </div>

              <form onSubmit={handleCompleteProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1">Complete Address</label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-24 resize-none"
                    placeholder="Street, City"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-slate-300 mb-1">Pincode</label>
                  <input
                    id="pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all tracking-widest"
                    placeholder="6-digit locational pincode"
                    required
                  />
                </div>

                {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Finish Registration"
                  )}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{isRegistering ? "Create Account" : "Sign In"}</h1>
                <p className="text-slate-400">Continue with email or Google</p>
              </div>
              
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" id="password-label" className="block text-sm font-medium text-slate-300">Password</label>
                    {!isRegistering && (
                      <button type="button" onClick={handleResetPassword} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</button>
                    )}
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {isRegistering && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-300">I am registering as a:</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('client')}
                          className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${role === 'client' ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                          Patient / Client
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('provider')}
                          className={`py-3 px-4 rounded-xl text-sm font-medium border transition-all ${role === 'provider' ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                        >
                          Medical Staff
                        </button>
                      </div>
                    </div>

                    {role === 'client' ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                          <label htmlFor="address" className="block text-sm font-medium text-slate-300 mb-1">Complete Address</label>
                          <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all h-24 resize-none"
                            placeholder="Street, City"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="pincode" className="block text-sm font-medium text-slate-300 mb-1">Service Pincode</label>
                          <input
                            id="pincode"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all tracking-widest"
                            placeholder="6-digit Pincode"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="prescription" className="block text-sm font-medium text-slate-300 mb-1">
                            Medical Prescription
                          </label>
                          <input
                            type="file"
                            id="prescription"
                            onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-slate-400 text-sm focus:outline-none"
                            accept="image/*,application/pdf"
                          />
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            Encrypted and stored for medical review.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Specialty</label>
                            <select
                              value={providerType}
                              onChange={(e) => setProviderType(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-[11px] text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
                            >
                              <option value="Physiotherapist" className="bg-slate-900 text-white">Physiotherapist</option>
                              <option value="Oxygen Supplier" className="bg-slate-900 text-white">Oxygen Supplier</option>
                              <option value="Nurse" className="bg-slate-900 text-white">Nurse</option>
                              <option value="Doctor" className="bg-slate-900 text-white">Doctor</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Years Exp.</label>
                            <input
                              type="number"
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              placeholder="e.g. 5"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 text-sm text-slate-300 mb-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={hasClinic}
                              onChange={(e) => setHasClinic(e.target.checked)}
                              className="rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                            />
                            <span>I have a physical clinic/facility</span>
                          </label>
                          {hasClinic && (
                            <input
                              type="text"
                              placeholder="Clinic Address"
                              value={clinicAddress}
                              onChange={(e) => setClinicAddress(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 animate-in fade-in slide-in-from-top-2 duration-200"
                              required
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Service Area Pincode</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="Provider Base Pincode"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 tracking-widest"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">Medical Certification</label>
                          <input
                            type="file"
                            onChange={(e) => setCertificationFile(e.target.files?.[0] || null)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-slate-400 text-sm focus:outline-none"
                            accept="image/*,application/pdf"
                            required={role === 'provider'}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      {isRegistering ? "Create Profile" : "Sign In to Platform"}
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <span className="relative px-4 bg-[#141822] text-slate-500 text-xs font-semibold">OR CONTINUE WITH</span>
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-white flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-medium mb-8"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google account
              </button>

              <p className="text-center text-slate-500 text-sm">
                {isRegistering ? "Already have an account?" : "New to the platform?"}{" "}
                <button
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-blue-400 hover:text-blue-300 font-semibold ml-1 underline transition-colors"
                >
                  {isRegistering ? "Log in here" : "Register now"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
