import React, { useState } from "react";
import { useAppContext } from "../contexts/AppContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Textarea } from "../components/ui/Textarea";
import { User, Mail, Phone, MapPin, Camera, Save, CheckCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db, storage } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateEmail, updateProfile as firebaseUpdateProfile } from "firebase/auth";

export function Profile() {
  const { currentUser, loading: appLoading } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.photoURL ?? null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    pincode: currentUser?.pincode || ""
  });

  if (appLoading) return null;
  if (!currentUser) return <div className="p-20 text-center text-slate-500">Please sign in to view your profile.</div>;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Proactively clear error when user picks a file
      if (error.includes("photoURL")) setError("");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Ensure we don't pass 'undefined' to Firestore
      let photoURLToSave = currentUser.photoURL || null;

      // 1. Handle Photo Upload
      if (imageFile) {
        const fileRef = ref(storage, `profile_pics/${currentUser.id}`);
        await uploadBytes(fileRef, imageFile);
        photoURLToSave = await getDownloadURL(fileRef);
      }

      // 2. Update Auth (Email and Photo)
      if (auth.currentUser) {
        if (formData.email !== auth.currentUser.email) {
          await updateEmail(auth.currentUser, formData.email);
        }
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: formData.name,
          photoURL: photoURLToSave
        });
      }

      // 3. Update Firestore - Explicitly sanitize photoURL to null if undefined
      await updateDoc(doc(db, 'users', currentUser.id), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
        photoURL: photoURLToSave ?? null
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profile Update Error:", err);
      setError(err.message || "Failed to update profile. Email changes might require a recent login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Quick Glance */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 p-8 text-center">
            <div className="relative inline-block group">
              <div className="h-32 w-32 rounded-[2rem] bg-slate-100 border-4 border-white overflow-hidden shadow-lg mx-auto">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-300">
                    <User className="h-16 w-16" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700 transition-colors border-4 border-white">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
              </label>
            </div>
            
            <div className="mt-6">
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">{formData.name}</h2>
              <p className="text-slate-500 text-sm mt-1">{formData.email}</p>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 italic">
                  {currentUser.role}
                </span>
                {currentUser.role === 'client' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest border border-teal-100 italic">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 text-left space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Security</p>
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "Your data is encrypted and protected. Profile photo is optional for identification during home visits."
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Edit Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Personal Information</h3>
                  <p className="text-slate-500 text-sm mt-1">Update your contact details and address.</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="pl-12 bg-slate-50 border-slate-200 rounded-2xl h-14 focus:ring-primary focus:border-primary text-slate-900 border-2"
                        placeholder="Your full legal name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold ml-1">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="pl-12 bg-slate-50 border-slate-200 rounded-2xl h-14 focus:ring-primary focus:border-primary text-slate-900 border-2"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="pl-12 bg-slate-50 border-slate-200 rounded-2xl h-14 focus:ring-primary focus:border-primary text-slate-900 border-2"
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Residential Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Textarea 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="pl-12 pt-4 bg-slate-50 border-slate-200 rounded-2xl min-h-[140px] focus:ring-primary focus:border-primary text-slate-900 border-2"
                      placeholder="Street, City, Building"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-700 font-bold ml-1">Location Pincode</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      maxLength={6}
                      value={formData.pincode}
                      onChange={e => setFormData({...formData, pincode: e.target.value.replace(/[^0-9]/g, '')})}
                      className="pl-12 bg-slate-50 border-slate-200 rounded-2xl h-14 focus:ring-primary focus:border-primary text-slate-900 border-2 tracking-widest"
                      placeholder="6-digit locational pincode"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 text-sm flex items-center gap-3 italic"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                  {success && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100 text-sm flex items-center gap-3 italic font-bold"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      Changes saved successfully!
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-[1.5rem] bg-slate-900 text-white font-black text-lg transition-all hover:bg-slate-800 hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest italic shadow-xl shadow-slate-200"
                >
                  {loading ? (
                    <div className="h-6 w-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="h-6 w-6" />
                      Apply Changes
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
