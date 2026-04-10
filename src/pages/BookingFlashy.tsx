import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Textarea } from "../components/ui/Textarea";
import { services } from "../data/mockData";
import { CheckCircle2, ArrowLeft, ShieldCheck, Clock, MapPin, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../contexts/AppContext";
import { useEffect } from "react";

// Stripe logic removed as system moved to Razorpay handled via Dashboard.

import { Geolocation } from "@capacitor/geolocation";

export function BookingFlashy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, createTicket, createPackage } = useAppContext();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}`);
      const data = await response.json();
      if (data.address && data.address.postcode) {
        setFormData(prev => ({ ...prev, pincode: data.address.postcode.replace(/[^0-9]/g, '').slice(0, 6) }));
      }
    } catch (err) {
      console.error("Location error:", err);
      alert("Could not detect location. Please enter manually.");
    } finally {
      setIsDetectingLocation(false);
    }
  };
  const initialServiceId = searchParams.get("service") || "";
  
  const [step, setStep] = useState(1);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [formData, setFormData] = useState({
    serviceId: initialServiceId,
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    notes: "",
    bookingType: 'single' as 'single' | 'package',
    sessionCount: 1
  });

  const selectedService = services.find(s => s.id === formData.serviceId);
  const isPhysio = selectedService?.category === "physiotherapy";

  useEffect(() => {
    if (isPhysio) {
      const now = new Date();
      const hour = now.getHours();
      const targetDate = new Date();
      
      if (hour >= 13) {
        // After 1 PM, schedule for tomorrow
        targetDate.setDate(now.getDate() + 1);
      }
      
      const dateString = targetDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateString }));
    }
  }, [formData.serviceId, isPhysio]);

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));
  
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step < 3) {
      handleNext();
    } else if (step === 3) {
      // Direct booking without upfront payment (handled via Dashboard)
      handlePaymentComplete('pending_razorpay');
    }
  };

  const handlePaymentComplete = async (paymentIntentId: string) => {
    if (!currentUser) return;
    
    if (formData.bookingType === 'package') {
      // Create a Session Package
      const pkg = await createPackage({
        clientId: currentUser.id,
        serviceType: selectedService?.title || formData.serviceId,
        totalSessions: formData.sessionCount,
        amountPaid: (selectedService?.price || 400000) * formData.sessionCount * 0.9 // 10% discount for packages
      });

      // Navigate to confirmation with package info
      navigate("/confirmation", { 
        state: { 
          booking: {
            ...formData,
            service: selectedService,
            packageId: pkg.id,
            isPackage: true
          } 
        } 
      });
    } else {
      // Single Session Ticket
      const ticket = await createTicket({
        clientId: currentUser.id,
        serviceType: selectedService?.title || formData.serviceId,
        amount: selectedService?.price || 400000, 
        requirements: `Date: ${formData.date}, Time: ${formData.time}\nAddress: ${formData.address}\nPincode: ${formData.pincode}\nNotes: ${formData.notes}`,
        pincode: formData.pincode,
        paymentIntentId: paymentIntentId
      });

      navigate("/confirmation", { 
        state: { 
          booking: {
            ...formData,
            service: selectedService,
            ticketId: ticket.id
          } 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Left Pane - Form */}
      <div className="flex-1 flex flex-col pt-24 pb-12 px-6 lg:px-20 overflow-y-auto">
        <div className="max-w-xl w-full mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-12"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Return
          </button>

          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-3">Schedule Consultation</h1>
            <p className="text-slate-500 font-light">Please provide the details below to arrange your clinical visit.</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                <div 
                  className={`h-full bg-slate-900 transition-all duration-500 ${step >= i ? 'w-full' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-900">Clinical Service</Label>
                      <select 
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-all appearance-none"
                        value={formData.serviceId}
                        onChange={e => setFormData({...formData, serviceId: e.target.value})}
                        required
                      >
                        <option value="" disabled>Select a service protocol</option>
                        {services.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </div>

                    {isPhysio && (
                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-slate-900">Booking Plan</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, bookingType: 'single', sessionCount: 1})}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.bookingType === 'single' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            <div className="font-bold text-slate-900">Single Visit</div>
                            <div className="text-xs text-slate-500">Pay as you go</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, bookingType: 'package', sessionCount: 6})}
                            className={`p-4 rounded-xl border-2 text-left transition-all ${formData.bookingType === 'package' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                          >
                            <div className="font-bold text-slate-900 italic flex items-center gap-1">Multi-Session Pack <span className="bg-emerald-100 text-emerald-700 text-[8px] px-1 rounded">-10% OFF</span></div>
                            <div className="text-xs text-slate-500">Pre-paid bundles</div>
                          </button>
                        </div>
                      </div>
                    )}

                    {formData.bookingType === 'package' && (
                      <div className="space-y-3 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <Label className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Number of Sessions</Label>
                        <div className="flex flex-wrap gap-2">
                          {[4, 6, 10, 20].map(count => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setFormData({...formData, sessionCount: count})}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.sessionCount === count ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white border border-indigo-100 text-indigo-600 hover:bg-white'}`}
                            >
                              {count} Visits
                            </button>
                          ))}
                        </div>
                        <p className="text-[10px] text-indigo-700 font-medium pt-1 italic">Advance payment required. Schedule any time from dashboard.</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-900">{formData.bookingType === 'package' ? 'Assessment Date' : 'Preferred Date'}</Label>
                        <Input 
                          type="date" 
                          required 
                          className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-900"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {isPhysio && (
                          <p className={`text-[10px] font-medium px-2 py-1 rounded ${new Date().getHours() >= 13 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                            <Clock className="inline h-3 w-3 mr-1 align-text-top" />
                            {new Date().getHours() >= 13 
                              ? "Next Day Service: Bookings after 1 PM are scheduled for tomorrow." 
                              : "Same Day Service Available: Booked before 1 PM."}
                          </p>
                        )}
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-900">{formData.bookingType === 'package' ? 'Assessment Time' : 'Preferred Time'}</Label>
                        <Input 
                          type="time" 
                          required 
                          className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-900"
                          value={formData.time}
                          onChange={e => setFormData({...formData, time: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-900">Patient Name</Label>
                        <Input 
                          required 
                          className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-900"
                          placeholder="Full legal name"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-900">Phone Number</Label>
                        <Input 
                          type="tel" 
                          required 
                          className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-900"
                          placeholder="+1 (555) 000-0000"
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-900">Email Address</Label>
                      <Input 
                        type="email" 
                        required 
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-900"
                        placeholder="patient@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-900">Service Address</Label>
                      <Textarea 
                        required 
                        className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-slate-900 resize-none"
                        placeholder="Full residential address for the visit"
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-medium text-slate-900">Service Area Pincode</Label>
                        <button 
                          type="button" 
                          onClick={detectLocation}
                          disabled={isDetectingLocation}
                          className="text-[10px] flex items-center gap-1 text-emerald-600 font-bold hover:text-emerald-700 transition-colors disabled:opacity-50"
                        >
                          <MapPin className={`w-3 h-3 ${isDetectingLocation ? 'animate-pulse' : ''}`} />
                          {isDetectingLocation ? 'Detecting...' : 'Detect location'}
                        </button>
                      </div>
                      <Input 
                        required 
                        maxLength={6}
                        className="h-12 rounded-xl border-slate-200 focus-visible:ring-slate-900 tracking-widest text-lg font-bold"
                        placeholder="6-Digit Pincode"
                        value={formData.pincode}
                        onChange={e => setFormData({...formData, pincode: e.target.value.replace(/[^0-9]/g, '')})}
                      />
                      <p className="text-xs text-slate-500">Required to match you with the nearest professional.</p>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-900">Clinical Notes (Optional)</Label>
                      <Textarea 
                        className="min-h-[100px] rounded-xl border-slate-200 focus-visible:ring-slate-900 resize-none"
                        placeholder="Any specific medical history or requirements our clinicians should be aware of."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-slate-50 p-6 rounded-2xl mb-6 text-center">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h3 className="font-semibold text-slate-900 text-xl mb-2">Almost Done!</h3>
                    <p className="text-sm text-slate-600 mb-6 font-light">
                      Your booking request is ready. No upfront payment is required today. You can pay securely from your dashboard once a provider accepts your request.
                    </p>
                    <Button onClick={() => handlePaymentComplete('pending_razorpay')} className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800">
                      Confirm Booking
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {step < 4 && (
              <div className="flex gap-4 mt-12 pt-8 border-t border-slate-100">
                {step > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="h-12 px-8 rounded-full border-slate-200 text-slate-700 hover:bg-slate-50">
                    Back
                  </Button>
                )}
                <Button type="submit" className="h-12 px-8 rounded-full bg-slate-900 text-white hover:bg-slate-800 ml-auto">
                  {step === 3 ? 'Proceed to Payment' : 'Continue'}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Right Pane - Summary (Hidden on mobile) */}
      <div className="hidden lg:flex flex-1 bg-slate-50 border-l border-slate-200 p-20 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/1920/1080')] opacity-[0.03] mix-blend-multiply pointer-events-none"></div>
        
        <div className="max-w-md relative z-10">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-8">Booking Summary</h3>
          
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mb-8">
            {selectedService ? (
              (() => {
                const Icon = selectedService.icon;
                return (
                  <>
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Icon className="h-5 w-5 text-slate-700" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{selectedService.title}</h4>
                        <p className="text-sm text-slate-500">{selectedService.pricing}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-slate-600">
                          {formData.date && formData.time ? `${formData.date} at ${formData.time}` : 'Date & Time pending'}
                        </span>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                        <span className="text-slate-600">
                          {formData.address || 'Address pending'}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-slate-500 text-sm italic py-4">Please select a service to view details.</div>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <ShieldCheck className="h-6 w-6 text-blue-600 shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="text-sm font-medium text-slate-900 mb-1">Secure & Confidential</h5>
                <p className="text-xs text-slate-500 leading-relaxed">Your medical information is encrypted and handled in strict accordance with healthcare privacy regulations.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle2 className="h-6 w-6 text-blue-600 shrink-0" strokeWidth={1.5} />
              <div>
                <h5 className="text-sm font-medium text-slate-900 mb-1">No Upfront Payment</h5>
                <p className="text-xs text-slate-500 leading-relaxed">Payment is only collected after the clinical assessment is completed and a care plan is agreed upon.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


