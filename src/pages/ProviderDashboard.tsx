import React, { useState, useEffect, useMemo } from 'react';
import { formatPrice } from '../data/mockData';
import { useAppContext } from '../contexts/AppContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Clock, CheckCircle, Search, User, FileText, Banknote, AlertCircle, Timer } from 'lucide-react';

export function ProviderDashboard() {
  const [completionDate, setCompletionDate] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('UPI');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    currentUser, tickets, acceptTicket, updateTicketStatus, updatePaymentStatus, cancelTicket,
    processSplitPayment, createWithdrawalRequest, withdrawalRequests, packages 
  } = useAppContext();

  const getServiceProfessional = (serviceType: string) => {
    const s = serviceType.toLowerCase();
    if (s.includes('physio')) return 'Physiotherapist';
    if (s.includes('oxygen') || s.includes('bipap') || s.includes('cpap')) return 'Technician';
    if (s.includes('nursing')) return 'Nurse';
    return 'Specialist';
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (currentUser?.role === 'pending_provider') {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-10 text-center">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 md:p-16">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Account Pending Approval</h1>
          <p className="text-slate-600 max-w-lg mx-auto text-lg leading-relaxed">
            Your service provider account is currently being reviewed by our administration team. 
            Once approved, you will have full access to view and accept incoming service tickets.
          </p>
        </div>
      </div>
    );
  }

  const openTickets = useMemo(() => {
    return tickets.filter(t => {
      if (t.status !== 'Pending Acceptance') return false;
      const createdTime = new Date(t.createdAt).getTime();
      if (now - createdTime > 60 * 60 * 1000) return false;
      if (t.providerId && t.providerId !== currentUser?.id) return false;
      
      // Hyper-local Pincode Matching (same city/zone based on first 3-4 digits of Indian Pincode)
      if (t.pincode && currentUser?.pincode) {
        const strictMatch = t.pincode === currentUser.pincode;
        const proximityMatch = t.pincode.substring(0, 3) === currentUser.pincode.substring(0, 3);
        if (!strictMatch && !proximityMatch) return false;
      }
      
      return true;
    });
  }, [tickets, now, currentUser?.id]);

  const myAcceptedTickets = useMemo(() => {
    return tickets.filter(t => t.providerId === currentUser?.id && t.status !== 'Pending Acceptance');
  }, [tickets, currentUser?.id]);

  const handleAccept = (ticketId: string) => {
    if (!completionDate) {
      alert('Please provide an estimated completion date before accepting.');
      return;
    }
    acceptTicket(ticketId, currentUser.id, completionDate);
    setSelectedTicket(null);
    setCompletionDate('');
  };

  const handleCancelAssignment = async (ticketId: string) => {
    const isConfirm = window.confirm("Are you sure you want to cancel this assignment? This will mark the booking as Cancelled for the client.");
    if (isConfirm) {
      const reason = window.prompt("Reason for cancellation:");
      if (reason === null) return;
      await cancelTicket(ticketId, "Provider Cancelled: " + (reason || "No reason given"), 0);
    }
  };

  const myWithdrawals = useMemo(() => {
    return withdrawalRequests.filter(r => r.providerId === currentUser?.id);
  }, [withdrawalRequests, currentUser?.id]);

  const myEarnings = useMemo(() => {
    return tickets
      .filter(t => t.providerId === currentUser?.id && t.paymentStatus === 'paid')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, currentUser?.id]);

  const totalPayouts = useMemo(() => {
    return myWithdrawals
      .filter(r => r.status === 'approved')
      .reduce((acc, r) => acc + r.amount, 0);
  }, [myWithdrawals]);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInRupees = parseFloat(withdrawAmount);
    const balance = (currentUser as any).balance || 0; // balance is in paise
    const balanceInRupees = balance / 100;

    if (isNaN(amountInRupees) || amountInRupees <= 0) return alert("Enter a valid amount");
    if (amountInRupees > balanceInRupees) return alert(`Insufficient balance. Your available balance is ₹${balanceInRupees.toLocaleString('en-IN')}`);
    if (!withdrawDetails) return alert("Provide payment details (UPI ID or Bank Info)");

    setIsSubmitting(true);
    try {
      await createWithdrawalRequest({
        providerId: currentUser!.id,
        providerName: currentUser!.name,
        amount: amountInRupees * 100, // Store in paise to match balance system
        method: withdrawMethod,
        details: withdrawDetails
      });
      alert("Withdrawal request sent to admin!");
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawDetails('');
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (ticket: any) => {
    if (ticket.paymentStatus === 'paid') {
      try {
        // Use the formalized split payment helper (80/20 split logic encapsulated in AppContext)
        await processSplitPayment(ticket.id, currentUser.id, ticket.amount || 400000, ticket.serviceType); // Fallback to 4000 if amount missing
      } catch (err: any) {
        alert("Failed to process split payment: " + err.message);
        return;
      }
    }
    await updateTicketStatus(ticket.id, 'Completed');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Service Provider Dashboard</h1>
        <p className="text-slate-500 mt-2">Welcome back, {currentUser.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-1">Available Balance</h2>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl font-bold ${((currentUser as any).balance || 0) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatPrice((currentUser as any).balance || 0)}
            </p>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Ready for withdrawal (Your share)</p>
          <button 
            onClick={() => setShowWithdrawModal(true)}
            className="w-full mt-4 bg-emerald-600 text-white font-semibold py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Banknote className="w-4 h-4" /> Withdraw
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-1">Total Received</h2>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">{formatPrice(totalPayouts)}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Historical payouts transferred to you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-1">Lifetime Earnings</h2>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-indigo-600">{formatPrice(((currentUser as any).balance || 0) + totalPayouts)}</p>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Gross income earned on platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Open Tickets Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Available Tickets</h2>
          {openTickets.length === 0 ? (
            <p className="text-slate-500">No open tickets available at the moment.</p>
          ) : (
            <div className="space-y-4">
              {openTickets.map(ticket => {
                const createdTime = new Date(ticket.createdAt).getTime();
                const minutesLeft = Math.max(0, Math.floor((60 * 60 * 1000 - (now - createdTime)) / 60000));
                
                return (
                  <div key={ticket.id} className="border border-slate-200 rounded-xl p-4 relative overflow-hidden hover:border-indigo-200 transition-colors">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                      <div 
                        className={`h-full ${minutesLeft < 10 ? 'bg-red-500' : 'bg-indigo-500'} transition-all`} 
                        style={{ width: `${(minutesLeft / 60) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-start mb-2 mt-2">
                      <div>
                        <h3 className="font-semibold text-lg">{ticket.serviceType}</h3>
                        {ticket.packageId && (
                          <div className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                            Session {ticket.sessionNumber} of {packages.find(p => p.id === ticket.packageId)?.totalSessions || '?'}
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider flex items-center gap-1 ${minutesLeft < 10 ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-yellow-100 text-yellow-800'}`}>
                        <Timer className="w-3 h-3" /> {minutesLeft}m left
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">{ticket.requirements}</p>
                    
                    {selectedTicket === ticket.id ? (
                      <div className="mt-4 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <label className="block text-sm font-medium text-indigo-900 mb-1 flex items-center gap-1">
                          Estimated Completion Date
                        </label>
                        <input 
                          type="date" 
                          value={completionDate}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAccept(ticket.id)}
                            className="flex-1 bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                          >
                            Confirm Acceptance
                          </button>
                          <button 
                            onClick={() => setSelectedTicket(null)}
                            className="flex-1 bg-white text-slate-700 border border-slate-200 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                        <button 
                          onClick={() => setSelectedTicket(ticket.id)}
                          className="w-full bg-slate-900 text-white font-medium py-2.5 px-4 rounded-xl hover:bg-slate-800 transition-colors mt-2"
                        >
                          Accept {ticket.serviceType} Request
                        </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Accepted Tickets Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">My Accepted Tickets</h2>
          {myAcceptedTickets.length === 0 ? (
            <p className="text-slate-500">You haven't accepted any tickets yet.</p>
          ) : (
            <div className="space-y-4">
              {myAcceptedTickets.map(ticket => {
                const isPendingPayment = ticket.status === 'Pending Payment' && ticket.paymentStatus === 'pending';
                const acceptedTime = ticket.acceptedAt ? new Date(ticket.acceptedAt).getTime() : 0;
                const paymentTimeRemaining = Math.max(0, 15 * 60 * 1000 - (now - acceptedTime));
                const isPaymentExpired = isPendingPayment && ticket.acceptedAt && paymentTimeRemaining === 0;

                return (
                  <div key={ticket.id} className={`border rounded-xl p-4 ${isPaymentExpired ? 'border-red-200 bg-red-50/30' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{ticket.serviceType}</h3>
                        {ticket.packageId && (
                          <div className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block">
                            Session {ticket.sessionNumber} of {packages.find(p => p.id === ticket.packageId)?.totalSessions || '?'}
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                        ${isPaymentExpired ? 'bg-red-100 text-red-800' :
                        ticket.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {isPaymentExpired ? 'Payment Timeout' : ticket.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mb-3">{ticket.requirements}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 mb-4">
                      <div><span className="font-medium">Payment:</span> {isPaymentExpired ? 'Expired' : ticket.paymentStatus}</div>
                      <div><span className="font-medium">Due:</span> {ticket.estimatedCompletion ? new Date(ticket.estimatedCompletion).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    
                    {isPaymentExpired ? (
                      <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <p className="text-xs text-red-700 font-medium">The client did not complete the payment within the 15-minute window. This booking request is no longer valid.</p>
                      </div>
                    ) : ticket.status !== 'Completed' && (
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => updateTicketStatus(ticket.id, 'In Progress')}
                          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium border ${ticket.status === 'In Progress' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                        >
                          In Progress
                        </button>
                        <button 
                          onClick={() => handleComplete(ticket)}
                          disabled={ticket.paymentStatus !== 'paid'}
                          className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${ticket.paymentStatus === 'paid' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                          {ticket.paymentStatus === 'paid' ? 'Mark Complete' : 'Awaiting Payment'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>      {/* Earnings & Withdrawals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Earnings History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Earnings History</h2>
          {myEarnings.length === 0 ? (
            <p className="text-slate-500">No earnings recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 text-xs lowercase opacity-70">
                    <th className="pb-3 font-medium">Service / Date</th>
                    <th className="pb-3 font-medium text-right">Your 80% Cut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myEarnings.map(ticket => (
                    <tr key={ticket.id}>
                      <td className="py-3">
                        <div className="font-medium text-sm text-slate-900">{ticket.serviceType}</div>
                        <div className="text-[10px] text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-bold text-emerald-600">+₹{(ticket.amount || 0) * (ticket.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8)}</div>
                        <div className="text-[9px] text-slate-400">from ₹{ticket.amount}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
          {myWithdrawals.length === 0 ? (
            <p className="text-slate-500">No withdrawal requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100 text-xs lowercase opacity-70">
                    <th className="pb-3 font-medium">Date / Method</th>
                    <th className="pb-3 font-medium text-right">Status & Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {myWithdrawals.map(req => (
                    <tr key={req.id}>
                      <td className="py-3">
                        <div className="font-medium text-sm text-slate-900">{req.method}</div>
                        <div className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 text-right">
                        <div className="font-bold text-red-600">-₹{req.amount}</div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1
                          ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-red-100 text-red-700'}`}>
                          {req.status === 'approved' ? 'Received / Paid' : req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleWithdrawSubmit}>
              <div className="p-6 border-b border-slate-100 bg-emerald-50/50">
                <h2 className="text-xl font-bold text-emerald-900">Request Withdrawal</h2>
                <p className="text-sm text-emerald-700">Available: {formatPrice((currentUser as any).balance || 0)}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payout Method</label>
                  <select 
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="UPI">UPI (Immediate)</option>
                    <option value="Bank Transfer">Bank Transfer (1-2 days)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Details</label>
                  <textarea 
                    value={withdrawDetails}
                    onChange={(e) => setWithdrawDetails(e.target.value)}
                    placeholder="UPI ID, Bank A/C Number, IFSC, etc."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px]"
                    required
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all shadow-md disabled:bg-slate-300"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
