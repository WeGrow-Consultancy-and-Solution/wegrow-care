import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Clock } from "lucide-react";
import { useAppContext } from "../contexts/AppContext";

// Stripe logic removed in favor of Dashboard-led Razorpay flow.

import { Geolocation } from "@capacitor/geolocation";

export function BookingAccessible() {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get("service") || "physiotherapy";
  const navigate = useNavigate();
  const { currentUser, createTicket, createPackage } = useAppContext();
  const [submitted, setSubmitted] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}`);
      const data = await response.json();
      if (data.address && data.address.postcode) {
        setPincode(data.address.postcode.replace(/[^0-9]/g, '').slice(0, 6));
      }
    } catch (err) {
      console.error("Location error:", err);
      alert("Could not detect location. Please enter manually.");
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const [service, setService] = useState(initialService);
  const [isPackage, setIsPackage] = useState(false);
  const [sessionCount, setSessionCount] = useState(6);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [ticketId, setTicketId] = useState("");
  const [clientSecret, setClientSecret] = useState<string>('');

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length < 6) return alert("Please enter a valid 6-digit pincode.");
    // Direct booking, no upfront payment
    handlePaymentComplete('pending_razorpay');
  };

  const handlePaymentComplete = async (paymentIntentId: string) => {
    if (!currentUser) {
      navigate("/");
      return;
    }
    
    const serviceName = service === 'physiotherapy' ? 'Physical Therapy' : 
                        service === 'nursing' ? 'In-Home Nursing' : 
                        'Oxygen Services';

    if (isPackage && service === 'physiotherapy') {
      const pkg = await createPackage({
        clientId: currentUser.id,
        serviceType: serviceName,
        totalSessions: sessionCount,
        amountPaid: 400000 * sessionCount * 0.9 // 10% discount
      });
      setTicketId(pkg.id);
    } else {
      const ticket = await createTicket({
        clientId: currentUser.id,
        serviceType: serviceName,
        amount: service === 'physiotherapy' ? 400000 : 350000, 
        requirements: `Patient: ${name}, Phone: ${phone}\nPincode: ${pincode}`,
        pincode: pincode,
        paymentIntentId: paymentIntentId
      });
      setTicketId(ticket.id);
    }
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#FDFBF7] min-h-screen text-[#1E293B] p-4 py-20">
        <div className="container mx-auto max-w-3xl text-center bg-white rounded-[3rem] p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100">
          <div className="h-32 w-32 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-10">
            <CheckCircle2 className="h-20 w-20 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Booking Confirmed!</h1>
          <p className="text-2xl text-slate-600 mb-6 leading-relaxed">
            Thank you. We have received your request. One of our care coordinators will call you shortly to confirm the time and details.
          </p>
          <div className="bg-slate-50 p-6 rounded-2xl mb-12 border border-slate-200 inline-block text-left">
            <p className="text-xl text-slate-700 font-medium mb-2">Ticket ID: <span className="font-bold text-slate-900">{ticketId}</span></p>
            <p className="text-lg text-slate-600">You can track this request in your dashboard.</p>
          </div>
          <br />
          <button 
            onClick={() => navigate("/client-dashboard")} 
            className="bg-blue-600 text-white text-2xl font-bold py-6 px-12 rounded-full w-full md:w-auto hover:bg-blue-700 active:scale-95 transition-transform shadow-lg shadow-blue-600/30"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFBF7] min-h-screen text-[#1E293B] pb-24">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xl text-slate-500 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" /> Go Back
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-10 text-slate-900">
          Book an Appointment
        </h1>
        
        <form onSubmit={handleProceedToPayment} className="space-y-10">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_10px_30px_-15px_rgba(0,0,0,0.08)] border border-slate-100">
            
            {/* Step 1 */}
            <div className="mb-10">
              <label className="block text-2xl font-bold mb-4 text-slate-900">1. What service do you need?</label>
              <select 
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-2xl text-2xl p-6 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none appearance-none"
              >
                <option value="physiotherapy">Physiotherapy</option>
                <option value="nursing">Nursing Care</option>
                <option value="oxygen">Oxygen Services</option>
              </select>
              {service === 'physiotherapy' && (
                <div className="mt-8 space-y-6">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsPackage(false)}
                      className={`flex-1 p-6 rounded-2xl border-4 text-2xl font-bold transition-all ${!isPackage ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    >
                      Single Visit
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPackage(true)}
                      className={`flex-1 p-6 rounded-2xl border-4 text-2xl font-bold transition-all ${isPackage ? 'border-blue-600 bg-blue-50 text-blue-900' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    >
                      Multi-Session Pack
                    </button>
                  </div>

                  {isPackage ? (
                    <div className="bg-indigo-50 p-8 rounded-[2rem] border-2 border-indigo-100 space-y-6">
                      <label className="block text-xl font-bold text-indigo-900 uppercase tracking-wide text-center">Select your session bundle (-10% Discount)</label>
                      <div className="grid grid-cols-2 gap-4">
                        {[4, 6, 10, 20].map(count => (
                          <button
                            key={count}
                            type="button"
                            onClick={() => setSessionCount(count)}
                            className={`p-6 rounded-2xl text-2xl font-bold transition-all ${sessionCount === count ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border-2 border-indigo-100 text-indigo-600'}`}
                          >
                            {count} Visits
                          </button>
                        ))}
                      </div>
                      <p className="text-indigo-700 text-lg text-center italic">Payment for all sessions is collected upfront.</p>
                    </div>
                  ) : (
                    <div className={`p-5 rounded-2xl border-2 flex items-center gap-4 ${new Date().getHours() >= 13 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                      <Clock className="h-8 w-8 shrink-0" />
                      <p className="text-xl font-medium leading-tight">
                        {new Date().getHours() >= 13 
                          ? "Next Day Service: Bookings after 1 PM are scheduled for tomorrow." 
                          : "Same Day Service Available: Booked before 1 PM."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="mb-10">
              <label className="block text-2xl font-bold mb-4 text-slate-900">2. Patient's Name</label>
              <input 
                required 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name" 
                className="w-full border-2 border-slate-200 rounded-2xl text-2xl p-6 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none" 
              />
            </div>

            {/* Step 3 */}
            <div className="mb-10">
              <label className="block text-2xl font-bold mb-4 text-slate-900">3. Phone Number</label>
              <input 
                required 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number" 
                className="w-full border-2 border-slate-200 rounded-2xl text-2xl p-6 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none" 
              />
            </div>

            {/* Step 4 */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="block text-2xl font-bold text-slate-900">4. Service Area Pincode</label>
                <button 
                  type="button" 
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="bg-emerald-100 text-emerald-800 text-lg font-extrabold py-2 px-4 rounded-xl border-2 border-emerald-200 hover:bg-emerald-200 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Clock className={`h-5 w-5 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  {isDetectingLocation ? 'Detecting...' : 'Detect location'}
                </button>
              </div>
              <input 
                required 
                type="text" 
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="6-Digit Pincode" 
                className="w-full border-2 border-slate-200 rounded-2xl text-4xl font-black p-6 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none tracking-[0.5em] text-center" 
              />
              <p className="text-xl text-slate-600 mt-2">Required for hyperlocal matching.</p>
            </div>

            {/* Submit */}
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white text-3xl font-bold py-6 rounded-full mt-4 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              Confirm Booking Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
