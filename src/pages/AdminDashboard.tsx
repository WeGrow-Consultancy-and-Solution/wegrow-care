import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../data/mockData';
import { useAppContext, User } from '../contexts/AppContext';
import { NotificationService } from '../lib/notifications';
import { Users, UserCheck, UserX, Shield, Clock, CheckCircle2, XCircle, AlertTriangle, Search, Mail, Phone, FileText, HeartHandshake, Banknote, Send, ChevronDown, ChevronUp, History } from 'lucide-react';

export function AdminDashboard() {
  const { 
    currentUser, users, tickets, withdrawalRequests, 
    updateTicketStatus, updatePaymentStatus, deleteTicket, 
    updateUserRole, approveProvider, rejectProvider, updateWithdrawalStatus, isSuperAdmin 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'tickets' | 'users' | 'approvals' | 'withdrawals' | 'finance'>('tickets');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [expandedProviderId, setExpandedProviderId] = useState<string | null>(null);

  const getServiceProfessional = (serviceType: string) => {
    const s = serviceType.toLowerCase();
    if (s.includes('physio')) return 'Physiotherapist';
    if (s.includes('oxygen') || s.includes('bipap') || s.includes('cpap')) return 'Technician';
    if (s.includes('nursing')) return 'Nurse';
    return 'Specialist';
  };

  if (!currentUser) return null;

  const pendingApprovals = useMemo(() => users.filter(u => u.role === 'pending_provider'), [users]);
  const pendingWithdrawals = useMemo(() => withdrawalRequests.filter(r => r.status === 'pending'), [withdrawalRequests]);

  const stats = useMemo(() => {
    const totalRevenue = tickets
      .filter(t => t.paymentStatus === 'paid')
      .reduce((acc, t) => acc + (t.amount || 0), 0);
    
    const platformFees = totalRevenue * 0.2; // Assuming 20% platform fee
    const totalPayouts = withdrawalRequests
      .filter(r => r.status === 'approved')
      .reduce((acc, r) => acc + r.amount, 0);

    return {
      totalRevenue,
      platformFees,
      totalPayouts,
      ticketsCount: tickets.length,
      usersCount: users.length,
      pendingApprovals: pendingApprovals.length,
      pendingWithdrawals: pendingWithdrawals.length,
      clientCount: users.filter(u => u.role === 'client').length,
      providerCount: users.filter(u => u.role === 'provider').length,
      adminCount: users.filter(u => u.role === 'admin').length,
      openTicketsCount: tickets.filter(t => t.status === 'Pending Acceptance').length,
    };
  }, [tickets, users, pendingApprovals, withdrawalRequests, pendingWithdrawals]);

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => roleFilter === 'all' || u.role === roleFilter)
      .filter(u =>
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearch))
      )
      .sort((a, b) => {
        // Sort by role first, then alphabetically by name
        if (a.role < b.role) return -1;
        if (a.role > b.role) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [users, roleFilter, userSearch]);

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      provider: 'bg-blue-100 text-blue-800',
      client: 'bg-slate-100 text-slate-800',
      pending_provider: 'bg-amber-100 text-amber-800',
    };
    return styles[role] || 'bg-slate-100 text-slate-800';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      provider: 'Provider',
      client: 'Client',
      pending_provider: 'Pending Approval',
    };
    return labels[role] || role;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 pt-[calc(5rem+var(--safe-area-inset-top))] pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-heading)' }}>
            {isSuperAdmin ? '🛡️ Super Admin Dashboard' : 'Admin Dashboard'}
          </h1>
          <p className="text-slate-500 mt-1">Logged in as {currentUser.name} ({currentUser.email})</p>
        </div>
        {isSuperAdmin && (
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">SUPER ADMIN</span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {[
          { label: 'Total Users', value: stats.usersCount, icon: Users, color: 'slate' },
          { label: 'Clients', value: stats.clientCount, icon: UserCheck, color: 'blue' },
          { label: 'Providers', value: stats.providerCount, icon: Shield, color: 'emerald' },
          { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'amber' },
          { label: 'Open Tickets', value: stats.openTicketsCount, icon: AlertTriangle, color: 'indigo' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  s.color === 'slate' ? 'bg-slate-100' : 
                  s.color === 'blue' ? 'bg-blue-50' : 
                  s.color === 'emerald' ? 'bg-emerald-50' : 
                  s.color === 'amber' ? 'bg-amber-50' : 'bg-indigo-50'
                }`}>
                  <Icon className={`h-5 w-5 ${
                    s.color === 'slate' ? 'text-slate-600' : 
                    s.color === 'blue' ? 'text-blue-600' : 
                    s.color === 'emerald' ? 'text-emerald-600' : 
                    s.color === 'amber' ? 'text-amber-600' : 'text-indigo-600'
                  }`} />
                </div>
                <div>
                  <p className={`text-xl md:text-2xl font-bold ${
                    s.color === 'slate' ? 'text-slate-900' : 
                    s.color === 'blue' ? 'text-blue-600' : 
                    s.color === 'emerald' ? 'text-emerald-600' : 
                    s.color === 'amber' ? 'text-amber-600' : 'text-indigo-600'
                  }`}>{s.value}</p>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
        <div className="flex min-w-max">
          <button onClick={() => setActiveTab('tickets')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'tickets' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Tickets ({stats.ticketsCount})
            {activeTab === 'tickets' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
          </button>
          <button onClick={() => setActiveTab('users')}
            className={`pb-4 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'users' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
            Users ({stats.usersCount})
            {activeTab === 'users' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
          </button>
          {(isSuperAdmin || currentUser.role === 'admin') && (
            <>
              <button onClick={() => setActiveTab('approvals')}
                className={`pb-4 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'approvals' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Approvals
                {stats.pendingApprovals > 0 && <span className="ml-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 min-w-[16px] h-4 flex items-center justify-center font-bold">{stats.pendingApprovals}</span>}
                {activeTab === 'approvals' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
              </button>
              <button onClick={() => setActiveTab('withdrawals')}
                className={`pb-4 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'withdrawals' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Withdrawals
                {stats.pendingWithdrawals > 0 && <span className="ml-2 bg-amber-500 text-white text-[10px] rounded-full px-1.5 min-w-[16px] h-4 flex items-center justify-center font-bold">{stats.pendingWithdrawals}</span>}
                {activeTab === 'withdrawals' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
              </button>
              <button onClick={() => setActiveTab('finance')}
                className={`pb-4 px-4 text-sm font-semibold transition-colors relative ${activeTab === 'finance' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
                Finance
                {activeTab === 'finance' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ═══════ TICKETS TAB ═══════ */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">All Service Tickets</h2>
          </div>
        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {tickets.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400 font-medium">No tickets yet</div>
          ) : (
            tickets.map(ticket => {
              const client = users.find(u => u.id === ticket.clientId);
              const provider = users.find(u => u.id === ticket.providerId);
              return (
                <div key={ticket.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ticket.serviceType}</span>
                        {ticket.orderNumber && <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500 font-mono">{ticket.orderNumber}</span>}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Client: {client?.name || 'Unknown'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-medium uppercase">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                      <div className="text-xs font-bold text-primary mt-1">₹{ticket.amount || 0}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Status</div>
                      <select value={ticket.status} onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                        className={`block w-full text-[10px] font-bold rounded-lg px-2 py-1 appearance-none border-0 cursor-pointer
                          ${ticket.status === 'Pending Acceptance' ? 'bg-yellow-100 text-yellow-800' : ticket.status === 'Pending Payment' ? 'bg-amber-100 text-amber-800' : ticket.status === 'Completed' ? 'bg-green-100 text-green-800' : ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                        <option value="Pending Acceptance">Pending Acceptance</option>
                        <option value="Pending Payment">Pending Payment</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[9px] text-slate-400 font-bold uppercase mb-1">Payment</div>
                      <select value={ticket.paymentStatus} onChange={(e) => updatePaymentStatus(ticket.id, e.target.value as any)}
                        className={`block w-full text-[10px] font-bold rounded-lg px-2 py-1 appearance-none border-0 cursor-pointer
                          ${ticket.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : ticket.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                        {(provider?.name || 'U').charAt(0)}
                      </div>
                      <span className="text-[10px] text-slate-600 font-medium">
                        {provider ? provider.name : 'Unassigned'}
                      </span>
                    </div>
                    <button onClick={() => { if (window.confirm('Delete this ticket?')) deleteTicket(ticket.id); }}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider">Delete</button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-5 py-3">Service Details</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Assigned Professional</th>
                <th className="px-5 py-3">Status & Payment</th>
                <th className="px-5 py-3">Timeline</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No tickets yet</td></tr>
              ) : (
                tickets.map(ticket => {
                  const client = users.find(u => u.id === ticket.clientId);
                  const provider = users.find(u => u.id === ticket.providerId);
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-900">{ticket.serviceType}</div>
                          {ticket.orderNumber && <span className="text-[9px] bg-slate-100 px-1 rounded text-slate-500 font-mono">{ticket.orderNumber}</span>}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5 truncate">{ticket.requirements}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium">{client?.name || 'Unknown'}</div>
                        <div className="text-slate-500 text-xs">{client?.email}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-[10px] text-slate-400 mb-1 font-medium tracking-tight uppercase">{getServiceProfessional(ticket.serviceType)}</div>
                        {provider ? (
                          <div><div className="font-medium">{provider.name}</div><div className="text-slate-500 text-xs">{provider.email}</div></div>
                        ) : <span className="text-slate-400 italic text-xs">Unassigned</span>}
                      </td>
                      <td className="px-5 py-3 space-y-1.5">
                        <select value={ticket.status} onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                          className={`block w-full text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer
                            ${ticket.status === 'Pending Acceptance' ? 'bg-yellow-100 text-yellow-800' : ticket.status === 'Pending Payment' ? 'bg-amber-100 text-amber-800' : ticket.status === 'Completed' ? 'bg-green-100 text-green-800' : ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                          <option value="Pending Acceptance">Pending Acceptance</option>
                          <option value="Pending Payment">Pending Payment</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Failed">Failed</option>
                        </select>
                        <select value={ticket.paymentStatus} onChange={(e) => updatePaymentStatus(ticket.id, e.target.value as any)}
                          className={`block w-full text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer
                            ${ticket.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : ticket.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        {(ticket as any).razorpayPaymentId && (
                          <div className="text-[9px] text-slate-400 font-mono mt-1 select-all px-1" title="Razorpay Payment ID">
                            Ref: {(ticket as any).razorpayPaymentId}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-500">
                        <div>{new Date(ticket.createdAt).toLocaleDateString()}</div>
                        {ticket.estimatedCompletion && <div className="mt-0.5">Due: {new Date(ticket.estimatedCompletion).toLocaleDateString()}</div>}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => { if (window.confirm('Delete this ticket?')) deleteTicket(ticket.id); }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* ═══════ ALL USERS TAB ═══════ */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">All Registered Users</h2>
              <p className="text-xs text-slate-500 mt-0.5">{filteredUsers.length} users found</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all">All Roles</option>
                <option value="client">Clients</option>
                <option value="provider">Service Providers</option>
                <option value="pending_provider">Pending Providers</option>
                <option value="admin">Admins</option>
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm w-full sm:w-64 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>
          </div>
        {/* Mobile View */}
        <div className="lg:hidden divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="px-5 py-12 text-center text-slate-400 font-medium">No users found</div>
          ) : (
            filteredUsers.map(user => {
              const isFixed = user.email === 'super@careatease.com';
              const isExpanded = expandedProviderId === user.id;
              const providerTickets = user.role === 'provider' ? tickets.filter(t => t.providerId === user.id && (t.status === 'Completed' || t.paymentStatus === 'paid')) : [];
              const providerWithdrawals = user.role === 'provider' ? withdrawalRequests.filter(r => r.providerId === user.id && r.status === 'approved') : [];
              
              const totalEarned = providerTickets.reduce((acc, t) => {
                const sharePercent = t.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8;
                return acc + (t.amount || 400000) * sharePercent;
              }, 0);
              
              const totalWithdrawn = providerWithdrawals.reduce((acc, r) => acc + r.amount, 0);

              return (
                <div key={user.id} className={`p-4 space-y-4 transition-colors ${isExpanded ? 'bg-indigo-50/20' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${user.role === 'admin' ? 'bg-slate-800' : user.role === 'provider' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-none mb-1">{user.name}</div>
                        <div className="text-[10px] text-slate-500">{user.email}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>

                  {(user.role === 'provider' || user.role === 'pending_provider') && (
                    <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-3 border border-slate-100">
                      <div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Experience</div>
                        <div className="text-xs font-semibold text-slate-700">{user.experience || '0'} Years</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Certification</div>
                        {user.certificationUrl ? (
                          <a href={user.certificationUrl} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 font-bold flex items-center justify-end gap-1">
                            <FileText className="w-3 h-3" /> View
                          </a>
                        ) : <span className="text-[10px] text-red-500 font-bold italic">Missing</span>}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2">
                      {user.role === 'pending_provider' ? (
                        <>
                          <button onClick={() => approveProvider(user.id)} className="px-3 py-1.5 text-[10px] font-bold bg-emerald-600 text-white rounded-lg shadow-sm">Approve</button>
                          <button onClick={() => rejectProvider(user.id)} className="px-3 py-1.5 text-[10px] font-bold bg-white border border-red-200 text-red-600 rounded-lg">Reject</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setSelectedUser(user)} className="p-2 bg-slate-100 text-slate-600 rounded-lg" title="View Profile">
                            <FileText className="w-4 h-4" />
                          </button>
                          {isSuperAdmin && (
                            user.role === 'admin' ? (
                              <button onClick={() => updateUserRole(user.id, 'client')} disabled={isFixed} className="p-2 bg-red-50 text-red-500 rounded-lg" title="Demote">
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => updateUserRole(user.id, 'admin')} className="p-2 bg-purple-50 text-purple-600 rounded-lg" title="Promote">
                                <Shield className="w-4 h-4" />
                              </button>
                            )
                          )}
                        </>
                      )}
                    </div>
                    {user.role === 'provider' && (
                      <button 
                        onClick={() => setExpandedProviderId(isExpanded ? null : user.id)}
                        className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 uppercase tracking-wider"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <History className="w-4 h-4" />}
                        {isExpanded ? 'Hide History' : 'History'}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-inner space-y-4 mt-2">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total Earnings</p>
                              <p className="text-sm font-bold text-emerald-600">{formatPrice(totalEarned)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Withdrawn</p>
                              <p className="text-sm font-bold text-indigo-600">{formatPrice(totalWithdrawn)}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                              <HeartHandshake className="w-3 h-3 text-indigo-500" /> Completed Services
                            </p>
                            {providerTickets.slice(0, 3).map(t => (
                              <div key={t.id} className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center text-[10px]">
                                <div>
                                  <div className="font-bold">{t.serviceType}</div>
                                  <div className="text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="font-bold text-emerald-600">+{formatPrice((t.amount || 400000) * (t.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8))}</div>
                              </div>
                            ))}
                            {providerTickets.length > 3 && <div className="text-center text-[9px] text-slate-400 font-medium">+{providerTickets.length - 3} more services</div>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Type / Experience</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Clinic / Address</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider">Verification</th>
                {isSuperAdmin && <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">Manage</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isFixed = user.email === 'super@careatease.com';
                const isExpanded = expandedProviderId === user.id;
                
                // Calculate Provider Stats if applicable
                const providerTickets = user.role === 'provider' ? tickets.filter(t => t.providerId === user.id && (t.status === 'Completed' || t.paymentStatus === 'paid')) : [];
                const providerWithdrawals = user.role === 'provider' ? withdrawalRequests.filter(r => r.providerId === user.id && r.status === 'approved') : [];
                
                const totalEarned = providerTickets.reduce((acc, t) => {
                  const sharePercent = t.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8;
                  return acc + (t.amount || 400000) * sharePercent;
                }, 0);
                
                const totalWithdrawn = providerWithdrawals.reduce((acc, r) => acc + r.amount, 0);

                return (
                  <React.Fragment key={user.id}>
                    <tr className={`hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${user.role === 'admin' ? 'bg-slate-800' : user.role === 'provider' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 leading-none mb-1">{user.name}</div>
                            <div className="text-xs text-slate-500">{user.email}</div>
                            {user.role === 'provider' && (
                              <button 
                                onClick={() => setExpandedProviderId(isExpanded ? null : user.id)}
                                className="mt-2 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider flex items-center gap-1"
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <History className="w-3 h-3" />}
                                {isExpanded ? 'Close History' : 'View Service History'}
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {(user.role === 'provider' || user.role === 'pending_provider') ? (
                          <>
                            <div className="text-slate-900 font-medium">{user.providerType || 'General'}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">{user.experience || '0'} Years Exp.</div>
                          </>
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-slate-900 text-xs truncate max-w-[150px]">{user.address || 'No address'}</div>
                        {user.hasClinic && <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Owns Clinic</div>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {(user.role === 'provider' || user.role === 'pending_provider') ? (
                          <div className="flex items-center gap-2">
                            {user.certificationUrl ? (
                              <a href={user.certificationUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium">
                                <FileText className="w-3 h-3" /> Certs
                              </a>
                            ) : <span className="text-[10px] text-red-500 font-bold">No Certs</span>}
                          </div>
                        ) : <span className="text-slate-400 italic">Self Verified</span>}
                      </td>
                      {isSuperAdmin && (
                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {user.role === 'pending_provider' ? (
                              <div className="flex gap-1">
                                <button onClick={() => approveProvider(user.id)} className="p-1 px-2 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700">Approve</button>
                                <button onClick={() => rejectProvider(user.id)} className="p-1 px-2 text-xs font-bold bg-red-600 text-white rounded hover:bg-red-700">X</button>
                              </div>
                            ) : (
                              <>
                                <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View Profile">
                                  <FileText className="w-4 h-4" />
                                </button>
                                {user.role === 'admin' ? (
                                  <button onClick={() => updateUserRole(user.id, 'client')} disabled={isFixed} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Demote to Client">
                                    <UserX className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button onClick={() => updateUserRole(user.id, 'admin')} className="p-2 text-slate-400 hover:text-purple-600 transition-colors" title="Promote to Admin">
                                    <Shield className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>

                    {/* Collapsible History Row (Desktop) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr className="hidden lg:table-row">
                          <td colSpan={isSuperAdmin ? 6 : 5} className="p-0 border-0">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50">
                              <div className="p-8 border-b border-indigo-100">
                                <div className="grid grid-cols-3 gap-6 mb-8">
                                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Wallet</p>
                                    <p className="text-2xl font-bold text-slate-900">{formatPrice(user.balance || 0)}</p>
                                  </div>
                                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm font-medium">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Lifetime Earnings</p>
                                    <p className="text-2xl font-bold text-emerald-600">{formatPrice(totalEarned)}</p>
                                  </div>
                                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm font-medium">
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Total Withdrawn</p>
                                    <p className="text-2xl font-bold text-indigo-600">{formatPrice(totalWithdrawn)}</p>
                                  </div>
                                </div>

                                <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                  <HeartHandshake className="w-4 h-4 text-indigo-600" />
                                  Successfully Completed Services
                                </h4>
                                
                                {providerTickets.length === 0 ? (
                                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                                    <p className="text-slate-400 text-sm italic">No completed services found for this provider.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {providerTickets.map(t => (
                                      <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900">{t.serviceType}</span>
                                            <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">{t.id.slice(-6).toUpperCase()}</span>
                                          </div>
                                          <div className="text-xs text-slate-500 mt-1">
                                            {new Date(t.createdAt).toLocaleDateString()} • Client: {users.find(u => u.id === t.clientId)?.name}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-sm font-bold text-emerald-600">+{formatPrice((t.amount || 400000) * (t.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8))}</div>
                                          <div className="text-[10px] text-slate-400">Total Ticket: {formatPrice(t.amount || 400000)}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        </div>
      )}

      {/* ═══════ PENDING APPROVALS TAB (Admin & Super Admin) ═══════ */}
      {activeTab === 'approvals' && (isSuperAdmin || currentUser.role === 'admin') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Pending Provider Approvals</h2>
            <p className="text-xs text-slate-500 mt-0.5">Users who registered as service providers and need approval</p>
          </div>
          {pendingApprovals.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-emerald-300" />
              <p>No pending approvals — all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingApprovals.map(user => (
                <div key={user.id} className="p-5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Registered: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors">
                      <FileText className="h-4 w-4 text-slate-400" /> View Details
                    </button>
                    <button onClick={() => approveProvider(user.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                      <CheckCircle2 className="h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => rejectProvider(user.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════ MODAL: USER DETAILS ══════ */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${selectedUser.role === 'admin' ? 'bg-slate-800' : selectedUser.role === 'provider' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedUser.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getRoleBadge(selectedUser.role)}`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <XCircle className="h-6 w-6 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Contact Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Mail className="h-4 w-4 text-slate-400" /> 
                      <span className="truncate">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <Phone className="h-4 w-4 text-slate-400" /> {selectedUser.phone}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Location / Clinic</h4>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded mb-3 inline-block ${selectedUser.hasClinic ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {selectedUser.hasClinic ? 'Private Clinic' : 'Home-Visit Service'}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-3">{selectedUser.address || 'No specific address provided'}</p>
                  </div>
                </div>
              </div>

              {/* Provider Specifics */}
              <div className="space-y-6">
                {(selectedUser.role === 'provider' || selectedUser.role === 'pending_provider') && (
                  <>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Professional Profile</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Type</div>
                          <div className="text-xs font-semibold text-slate-900">{selectedUser.providerType || 'General'}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Experience</div>
                          <div className="text-xs font-semibold text-slate-900">{selectedUser.experience || '0'} Years</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Certification Documents</h4>
                      <div className="relative aspect-video bg-slate-900 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center overflow-hidden group shadow-inner">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-40" />
                        
                        <div className="relative z-10 text-center p-4">
                          <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                            <FileText className={`h-5 w-5 ${selectedUser.certificationUrl ? 'text-indigo-300' : 'text-slate-500'}`} />
                          </div>
                          <p className="text-[10px] text-white/90 font-bold tracking-wider mb-1">
                            {selectedUser.certificationUrl ? `CERTIFICATE_${selectedUser.id.slice(0, 4)}.PDF` : 'NO DOCUMENT UPLOADED'}
                          </p>
                          <div className="flex gap-2 justify-center mt-4">
                            <button 
                              onClick={() => selectedUser.certificationUrl ? window.open(selectedUser.certificationUrl, '_blank') : alert('No certification document available.')}
                              className={`px-4 py-2 rounded-lg text-white text-[10px] font-bold transition-all border backdrop-blur-sm ${selectedUser.certificationUrl ? 'bg-white/10 hover:bg-white/20 border-white/20' : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'}`}
                              disabled={!selectedUser.certificationUrl}
                            >
                              Preview
                            </button>
                            <button 
                              onClick={() => {
                                if (selectedUser.certificationUrl) {
                                  const link = document.createElement('a');
                                  link.href = selectedUser.certificationUrl;
                                  link.download = `Certification_${selectedUser.name.replace(/\s+/g, '_')}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-white text-[10px] font-bold transition-all shadow-lg ${selectedUser.certificationUrl ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
                              disabled={!selectedUser.certificationUrl}
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedUser.role === 'client' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Patient Prescriptions</h4>
                      {selectedUser.prescriptionUrl ? (
                         <div className="relative aspect-video bg-slate-900 rounded-2xl border-2 border-slate-200 flex flex-col items-center justify-center overflow-hidden group shadow-inner">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-30" />
                            <div className="relative z-10 text-center p-4">
                              <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                                <FileText className="h-5 w-5 text-emerald-300" />
                              </div>
                              <p className="text-[10px] text-white/90 font-bold tracking-wider mb-1">PRESCRIPTION_{selectedUser.id.slice(0, 4)}.PDF</p>
                              <div className="flex gap-2 justify-center mt-4">
                                <button onClick={() => window.open(selectedUser.prescriptionUrl!, '_blank')}
                                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all border border-white/20 backdrop-blur-sm">
                                  Preview
                                </button>
                                <button onClick={() => {
                                  if (selectedUser.prescriptionUrl) {
                                    const link = document.createElement('a');
                                    link.href = selectedUser.prescriptionUrl!;
                                    link.download = `Prescription_${selectedUser.name.replace(/\s+/g, '_')}.pdf`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }} className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all shadow-lg shadow-emerald-500/30">
                                  Download
                                </button>
                              </div>
                            </div>
                         </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                          <div>
                            <HeartHandshake className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 italic">No prescription documents found.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => setSelectedUser(null)} className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              {selectedUser.role === 'pending_provider' && (
                <button onClick={() => { approveProvider(selectedUser.id); setSelectedUser(null); }} className="px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-shadow shadow-lg shadow-emerald-200">
                  Approve Application
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* ═══════ WITHDRAWALS TAB ═══════ */}
      {activeTab === 'withdrawals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Provider Withdrawal Requests</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pending requests awaiting manual payout</p>
            </div>
            {/* Mobile View */}
            <div className="lg:hidden divide-y divide-slate-100">
              {withdrawalRequests.length === 0 ? (
                <div className="px-5 py-12 text-center text-slate-400">No requests found</div>
              ) : (
                withdrawalRequests.map(req => (
                  <div key={req.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900">{req.providerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{req.providerId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-600">{formatPrice(req.amount)}</div>
                        <div className="text-[9px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-2.5 flex items-center gap-3 border border-slate-100">
                      <div className="text-[9px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded shadow-sm">{req.method}</div>
                      <div className="text-[10px] text-slate-600 truncate">{req.details}</div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      {req.status === 'pending' ? (
                        <>
                          <button onClick={async () => { if(confirm('Approve?')) await updateWithdrawalStatus(req.id, 'approved'); }}
                            className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                            Approve
                          </button>
                          <button onClick={() => { if(confirm('Reject?')) updateWithdrawalStatus(req.id, 'rejected'); }}
                            className="bg-white border border-red-200 text-red-600 px-4 py-1.5 rounded-lg text-xs font-bold">
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${req.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Payout Method & Details</th>
                    <th className="px-5 py-3">Requested Date</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {withdrawalRequests.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No requests found</td></tr>
                  ) : (
                    withdrawalRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-3">
                          <div className="font-medium text-slate-900">{req.providerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono tracking-tight">{req.providerId}</div>
                        </td>
                        <td className="px-5 py-3 font-bold text-emerald-600">{formatPrice(req.amount)}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded mr-2">{req.method}</span>
                          <span className="text-xs text-slate-600">{req.details}</span>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {new Date(req.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={async () => { 
                                if(confirm('Approve and mark as paid?')) {
                                  try {
                                    await updateWithdrawalStatus(req.id, 'approved');
                                  } catch (e: any) {
                                    alert(e.message || 'Error approving withdrawal');
                                  }
                                } 
                              }}
                                className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all">
                                Approve
                              </button>
                              <button onClick={() => { if(confirm('Reject this request?')) updateWithdrawalStatus(req.id, 'rejected'); }}
                                className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-100 transition-all">
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[10px] font-bold uppercase ${req.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {req.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ FINANCE TAB ═══════ */}
      {activeTab === 'finance' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Banknote className="w-5 h-5" /></div>
                <h3 className="font-semibold text-slate-600">Total Platform Revenue</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-xs text-slate-400 mt-2">Gross amount received from all service payments</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Banknote className="w-5 h-5" /></div>
                <h3 className="font-semibold text-slate-600">Total Lifetime Payouts</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{formatPrice(stats.totalPayouts)}</p>
              <p className="text-xs text-slate-400 mt-2">Total funds manually disbursed to providers</p>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold mb-2">Liquidity Status</h3>
                <p className="text-slate-400 max-w-md text-xs md:text-sm">The platform has successfully processed {formatPrice(stats.totalPayouts)} in manual payouts to service providers.</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-slate-400 text-[10px] md:text-sm font-medium mb-1 uppercase tracking-wider">Total Payouts Done</p>
                <p className="text-3xl md:text-5xl font-black text-emerald-400">{formatPrice(stats.totalPayouts)}</p>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>
          </div>

        </div>
      )}
    </div>
  );
}
