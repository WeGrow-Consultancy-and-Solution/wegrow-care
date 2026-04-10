import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Clock, CreditCard, RefreshCw, AlertCircle, CheckCircle2, XCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { initiateRazorpayPayment } from '../lib/razorpay';
import { formatPrice } from '../data/mockData';

export function ClientDashboard() {
  const { 
    currentUser, tickets, users, updatePaymentStatus, deleteTicket, 
    updateTicketStatus, cancelTicket, submitRating, packages, bookPackageSession 
  } = useAppContext();
  const [now, setNow] = useState(Date.now());
  const [payingTicketId, setPayingTicketId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Update timer every second to calculate expiries and countdowns
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const myTickets = useMemo(() => {
    if (!currentUser) return [];
    return tickets.filter(t => t.clientId === currentUser.id);
  }, [tickets, currentUser]);

  const myPackages = useMemo(() => {
    if (!currentUser) return [];
    return packages.filter(p => p.clientId === currentUser.id && p.status === 'active');
  }, [packages, currentUser]);

  const [schedulingPackageId, setSchedulingPackageId] = useState<string | null>(null);
  const [scheduleData, setScheduleData] = useState({
    date: "",
    time: "",
    address: currentUser?.address || "",
    pincode: currentUser?.pincode || "",
    notes: ""
  });

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingPackageId) return;
    
    try {
      await bookPackageSession(
        schedulingPackageId,
        scheduleData.date,
        scheduleData.time,
        scheduleData.address,
        scheduleData.pincode,
        scheduleData.notes
      );
      setSchedulingPackageId(null);
      alert("Session scheduled successfully!");
    } catch (err) {
      alert("Failed to schedule session. Please try again.");
    }
  };

  const getServiceProfessional = (serviceType: string) => {
    const s = serviceType.toLowerCase();
    if (s.includes('physio')) return 'Physiotherapist';
    if (s.includes('oxygen') || s.includes('bipap') || s.includes('cpap')) return 'Technician';
    if (s.includes('nursing')) return 'Nurse';
    return 'Specialist';
  };

  const getProviderName = (providerId?: string) => {
    if (!providerId) return 'Any Available Provider';
    const provider = users.find(u => u.id === providerId);
    return provider ? provider.name : 'Unknown Provider';
  };

  const handlePayNow = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    setPayingTicketId(ticketId);
    
    // Use centralized Razorpay initiator (handles order creation + modal)
    await initiateRazorpayPayment(
      ticket,
      currentUser,
      async (response) => {
        await updatePaymentStatus(ticketId, 'paid', response.razorpay_payment_id);
        setPayingTicketId(null);
        alert(`Success! Payment Received. Reference: ${response.razorpay_payment_id}`);
      },
      () => {
        setPayingTicketId(null);
      }
    );
  };

  const handleCancelTicket = async (ticket: any) => {
    let fee = 0;
    
    // Check if grace period applies
    if (ticket.status === 'In Progress' || ticket.paymentStatus === 'paid') {
      const acceptedTime = ticket.acceptedAt ? new Date(ticket.acceptedAt).getTime() : new Date(ticket.createdAt).getTime();
      const minutesSinceAcceptance = (Date.now() - acceptedTime) / (1000 * 60);

      if (minutesSinceAcceptance <= 3) {
        // Within grace period
        fee = 0;
      } else {
        // Post grace period
        fee = 500;
        const confirmFee = window.confirm(`A cancellation fee of ₹500 will apply since the 3-minute grace period has passed. Do you wish to proceed?`);
        if (!confirmFee) return;
      }
    }

    const reason = window.prompt("Please provide a reason for cancelling this booking:");
    if (reason === null) return; // User pressed cancel on prompt

    await cancelTicket(ticket.id, reason || "No reason given", fee);
  };

  const handleReschedule = async (ticketId: string) => {
    if (window.confirm("This will cancel your expired request so you can book a new one. Continue?")) {
      await deleteTicket(ticketId);
      navigate('/services');
    }
  };

  const handlePrintReceipt = (ticket: any) => {
    if (!currentUser) return;
    const providerName = getProviderName(ticket.providerId);
    
    const receiptHtml = `
      <html>
        <head>
          <title>Payment Receipt - ${ticket.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 40px; line-height: 1.5; }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .title { font-size: 20px; color: #64748b; margin-top: 5px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
            .label { font-weight: 600; color: #475569; }
            .value { color: #0f172a; text-align: right; }
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">CARE AT EASE Consultancy</div>
            <div class="title">Official Payment Receipt</div>
          </div>
          <div class="details">
            <div class="row"><span class="label">Order ID</span><span class="value">${ticket.orderNumber || ticket.id.toUpperCase()}</span></div>
            <div class="row"><span class="label">Date Issued</span><span class="value">${new Date().toLocaleDateString()}</span></div>
            <div class="row"><span class="label">Patient Name</span><span class="value">${currentUser.name}</span></div>
            <div class="row"><span class="label">Service Protocol</span><span class="value">${ticket.serviceType}</span></div>
            <div class="row"><span class="label">Assigned ${getServiceProfessional(ticket.serviceType)}</span><span class="value">${providerName}</span></div>
            <div class="row"><span class="label">Amount Paid</span><span class="value" style="font-weight: bold;">${formatPrice(ticket.amount || 0)}</span></div>
            <div class="row"><span class="label">Payment Status</span><span class="value" style="color: #10b981; font-weight: bold;">PAID IN FULL</span></div>
          </div>
          <div class="footer">
            <p>Thank you for choosing CARE AT EASE for your clinical needs.</p>
            <p>If you have any questions or require support, please contact us via Call or WhatsApp at +91 8802594790</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleRateProvider = async (providerId: string | undefined) => {
    if (!providerId) return;
    const score = window.prompt("Rate your experience with the provider (1-5 stars):", "5");
    if (score === null) return;
    const ratingNum = parseInt(score, 10);
    if (!isNaN(ratingNum) && ratingNum >= 1 && ratingNum <= 5) {
      try {
        await submitRating(providerId, ratingNum);
        alert("Thank you! Your feedback has been recorded.");
      } catch (e) {
        alert("Failed to submit rating.");
      }
    } else {
      alert("Please enter a valid number from 1 to 5.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome, {currentUser.name}</h1>
        <p className="text-slate-500 text-lg font-light">Monitor your clinical requests and treatment plans.</p>
      </header>

      {/* Packages Section */}
      {myPackages.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-indigo-600 rounded-full" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Treatment Packages</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPackages.map(pkg => (
              <div key={pkg.id} className="bg-white border-2 border-indigo-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">{pkg.serviceType}</h3>
                    <p className="text-xs text-slate-400 font-mono">PKG-{pkg.id.slice(0,8).toUpperCase()}</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Active
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-indigo-600">{pkg.totalSessions - pkg.remainingSessions} / {pkg.totalSessions} sessions</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-600 transition-all duration-1000" 
                      style={{ width: `${((pkg.totalSessions - pkg.remainingSessions) / pkg.totalSessions) * 100}%` }}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setSchedulingPackageId(pkg.id)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="w-5 h-5" /> Schedule Next Visit
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1 bg-slate-900 rounded-full" />
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Requests</h2>
      </div>

      <div className="space-y-6">
        {myTickets.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <p className="text-slate-500 text-lg">You haven't booked any sessions yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myTickets.map(ticket => {
              const createdTime = new Date(ticket.createdAt).getTime();
              const isProviderRequestExpired = ticket.status === 'Pending Acceptance' && (now - createdTime > 60 * 60 * 1000);
              
              const isPendingPayment = ticket.status === 'Pending Payment' && ticket.paymentStatus === 'pending';
              const acceptedTime = ticket.acceptedAt ? new Date(ticket.acceptedAt).getTime() : 0;
              const paymentTimeRemaining = Math.max(0, 15 * 60 * 1000 - (now - acceptedTime));
              const isPaymentExpired = isPendingPayment && ticket.acceptedAt && paymentTimeRemaining === 0;
              const isPaymentRequired = isPendingPayment && !isPaymentExpired;
              
              const formatTimeRemaining = (ms: number) => {
                const mins = Math.floor(ms / 60000);
                const secs = Math.floor((ms % 60000) / 1000);
                return `${mins}:${secs.toString().padStart(2, '0')}`;
              };

              let statusBadge = (
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Pending Provider
                </span>
              );

              if (isProviderRequestExpired) {
                statusBadge = (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Expired (No Accept)
                  </span>
                );
              } else if (isPaymentExpired) {
                statusBadge = (
                  <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Payment Timeout
                  </span>
                );
              } else if (isPaymentRequired) {
                statusBadge = (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer animate-pulse">
                    <CreditCard className="w-3 h-3" /> Pay in {formatTimeRemaining(paymentTimeRemaining)}
                  </span>
                );
              } else if (ticket.paymentStatus === 'paid') {
                 statusBadge = (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Confirmed
                  </span>
                );               
              } else if (ticket.status === 'Completed') {
                statusBadge = (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    Completed
                  </span>
                );
              } else if (ticket.status === 'In Progress') {
                statusBadge = (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
                    In Progress
                  </span>
                );
              } else if (ticket.status === 'Cancelled') {
                statusBadge = (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Cancelled
                  </span>
                );
              }

              return (
                <div key={ticket.id} className={`border rounded-xl p-5 transition-colors ${isPaymentRequired ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 hover:border-indigo-200'}`}>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">{ticket.serviceType}</h3>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider">{ticket.orderNumber || ticket.id}</span>
                    </div>
                    {statusBadge}
                  </div>
                  
                  <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-wrap">{ticket.requirements}</p>
                  
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <div><span className="font-medium text-slate-700">Assigned {getServiceProfessional(ticket.serviceType)}:</span> {getProviderName(ticket.providerId)}</div>
                    <div><span className="font-medium text-slate-700">Requested:</span> {new Date(ticket.createdAt).toLocaleString()}</div>
                    {ticket.estimatedCompletion && (
                      <div><span className="font-medium text-slate-700">Scheduled For:</span> {ticket.estimatedCompletion}</div>
                    )}
                  </div>
                  
                  {isPaymentRequired && (
                    <div className="mt-5 pt-5 border-t border-amber-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Provider accepted! Secure your booking within {formatTimeRemaining(paymentTimeRemaining)}.
                      </p>
                      <button 
                        onClick={() => handlePayNow(ticket.id)}
                        disabled={payingTicketId === ticket.id}
                        className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
                      >
                        <CreditCard className="w-4 h-4" />
                        {payingTicketId === ticket.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  )}

                  {['Pending Acceptance', 'Pending Payment', 'In Progress'].includes(ticket.status) && !isProviderRequestExpired && !isPaymentExpired && (
                    <div className="mt-5 pt-5 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={() => handleCancelTicket(ticket)}
                        className="px-5 py-2 hover:bg-red-50 text-red-600 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Booking
                      </button>
                    </div>
                  )}

                  {isProviderRequestExpired && (
                    <div className="mt-5 pt-5 border-t border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> This request expired because no provider accepted it within 60 minutes.
                      </p>
                      <button 
                        onClick={() => handleReschedule(ticket.id)}
                        className="w-full sm:w-auto px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" /> Reschedule
                      </button>
                    </div>
                  )}

                  {isPaymentExpired && (
                    <div className="mt-5 pt-5 border-t border-red-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> This booking expired because payment was not completed within 15 minutes.
                      </p>
                      <button 
                        onClick={() => handleReschedule(ticket.id)}
                        className="w-full sm:w-auto px-5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <RefreshCw className="w-4 h-4" /> Book Again
                      </button>
                    </div>
                  )}
                
                {ticket.paymentStatus === 'paid' && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-3 flex-wrap">
                    {ticket.status === 'Completed' && (
                      <button 
                        onClick={() => handleRateProvider(ticket.providerId)}
                        className="px-4 py-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Star className="w-4 h-4" /> Rate Service
                      </button>
                    )}
                    <button 
                      onClick={() => handlePrintReceipt(ticket)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Download Receipt
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Scheduling Modal */}
      {schedulingPackageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Schedule Visit</h2>
            <p className="text-slate-500 mb-8">Select your preferred slot for this pre-paid session.</p>
            
            <form onSubmit={handleBookSession} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Date</label>
                  <input 
                    type="date" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={scheduleData.date}
                    onChange={e => setScheduleData({...scheduleData, date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Time</label>
                  <input 
                    type="time" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                    value={scheduleData.time}
                    onChange={e => setScheduleData({...scheduleData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Service Address</label>
                <input 
                  type="text" 
                  required
                  placeholder="Street address"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={scheduleData.address}
                  onChange={e => setScheduleData({...scheduleData, address: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Notes for Professional</label>
                <textarea 
                  placeholder="Any specific instructions..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 outline-none min-h-[100px]"
                  value={scheduleData.notes}
                  onChange={e => setScheduleData({...scheduleData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setSchedulingPackageId(null)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-slate-900 shadow-lg shadow-indigo-600/20 transition-all"
                >
                  Confirm Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
