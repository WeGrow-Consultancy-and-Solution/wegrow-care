import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, onSnapshot, query, where, addDoc, deleteDoc, increment } from 'firebase/firestore';
import { NotificationService } from '../lib/notifications';
import { PDFService } from '../lib/pdf';
import { formatPrice } from '../data/mockData';

export type UserRole = 'client' | 'provider' | 'admin' | 'pending_provider';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone?: string;
  address?: string;
  pincode?: string;
  createdAt?: string;
  providerType?: string | null;
  experience?: string | null;
  hasClinic?: boolean | null;
  certificationUrl?: string | null;
  prescriptionUrl?: string | null;
  photoURL?: string | null;
  averageRating?: number;
  reviewCount?: number;
  balance?: number;
}

export type TicketStatus = 'Pending Acceptance' | 'Pending Payment' | 'In Progress' | 'Completed' | 'Cancelled' | 'Failed';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Ticket {
  id: string;
  clientId: string;
  providerId?: string;
  serviceType: string;
  requirements: string;
  pincode?: string;
  status: TicketStatus;
  paymentStatus: PaymentStatus;
  paymentIntentId?: string;
  orderNumber?: string;
  amount?: number;
  createdAt: string;
  estimatedCompletion?: string;
  razorpayPaymentId?: string;
  acceptedAt?: string;
  cancellationReason?: string;
  cancellationFee?: number;
  cancelledAt?: string;
  packageId?: string;
  sessionNumber?: number;
}

export interface SessionPackage {
  id: string;
  clientId: string;
  serviceType: string;
  totalSessions: number;
  remainingSessions: number;
  providerId?: string;
  amountPaid: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  providerId: string;
  providerName: string;
  amount: number;
  method: string;
  details: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  completedAt?: string;
}

const SUPER_ADMIN_EMAIL = 'super@wegrow.com';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  tickets: Ticket[];
  isSuperAdmin: boolean;
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => Promise<Ticket>;
  acceptTicket: (ticketId: string, providerId: string, estimatedCompletion: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
  cancelTicket: (ticketId: string, reason: string, fee: number) => Promise<void>;
  updatePaymentStatus: (ticketId: string, status: PaymentStatus, razorpayPaymentId?: string) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  processSplitPayment: (ticketId: string, providerId: string, amount: number, serviceType: string) => Promise<void>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  approveProvider: (userId: string) => Promise<void>;
  rejectProvider: (userId: string) => Promise<void>;
  submitRating: (providerId: string, rating: number) => Promise<void>;
  createWithdrawalRequest: (request: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateWithdrawalStatus: (requestId: string, status: 'approved' | 'rejected') => Promise<void>;
  createPackage: (pkg: Omit<SessionPackage, 'id' | 'createdAt' | 'status' | 'remainingSessions'>) => Promise<SessionPackage>;
  bookPackageSession: (packageId: string, date: string, time: string, address: string, pincode: string, notes: string) => Promise<void>;
  withdrawalRequests: WithdrawalRequest[];
  packages: SessionPackage[];
  logout: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [packages, setPackages] = useState<SessionPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  // Authentication & Auth User State Sync
  useEffect(() => {
    // Phase 11: Logout on Refresh logic
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'reload') {
      // Use the imported firebaseSignOut function
      firebaseSignOut(auth).then(() => {
        setCurrentUser(null);
        localStorage.clear(); // Clear all local state on refresh
        window.location.href = '/';
      }).catch(error => {
        console.error("Error signing out on refresh:", error);
      });
      // Prevent further execution of the auth state listener if we're redirecting
      return () => {}; // Return an empty cleanup function
    }
  }, []); // This useEffect only handles the reload logic

  useEffect(() => {
    let unsubDoc: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (unsubDoc) unsubDoc(); // Unsubscribe previous user doc listener if it exists

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubDoc = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setCurrentUser({ id: firebaseUser.uid, ...snap.data() } as User);
          } else {
            const role: UserRole = firebaseUser.email === SUPER_ADMIN_EMAIL ? 'admin' : 'client';
            const userData = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'New User',
              email: firebaseUser.email || '',
              phone: '',
              address: '',
              role,
              createdAt: new Date().toISOString(),
              balance: 0, // Initialize balance for new users
            };
            setDoc(userRef, {
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              address: userData.address,
              role: userData.role,
              createdAt: userData.createdAt,
              balance: userData.balance,
            });
            setCurrentUser(userData);
          }
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe(); // Unsubscribe auth state listener
      if (unsubDoc) unsubDoc(); // Unsubscribe user doc listener
    };
  }, []); // This useEffect handles the auth state and live user doc sync

  // Sync Users
  useEffect(() => {
    if (!currentUser) return;
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData: User[] = [];
      snapshot.forEach(docSnap => {
        usersData.push({ id: docSnap.id, ...docSnap.data() } as User);
      });
      setUsers(usersData);
    });
    return () => unsubUsers();
  }, [currentUser]);

  // Sync Tickets
  useEffect(() => {
    if (!currentUser) { setTickets([]); return; }
    const ticketsRef = collection(db, 'tickets');
    
    // DEBUG: Pull EVERYTHING for any authenticated user
    const unsub = onSnapshot(query(ticketsRef), (snap) => {
      const data: Ticket[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as Ticket));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      console.log(`SYNCED ${data.length} TICKETS`); // Keeping this simple
      setTickets(data);
    }, (err) => {
      console.error("FIRESTORE TICKETS ERROR:", err);
    });
    
    return () => unsub();
  }, [currentUser]);

  // Sync Withdrawal Requests
  useEffect(() => {
    if (!currentUser) { setWithdrawalRequests([]); return; }
    const unsub = onSnapshot(collection(db, 'withdrawals'), (snap) => {
      const data: WithdrawalRequest[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as WithdrawalRequest));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setWithdrawalRequests(data);
    });
    return () => unsub();
  }, [currentUser]);

  // Sync Packages
  useEffect(() => {
    if (!currentUser) { setPackages([]); return; }
    const unsub = onSnapshot(collection(db, 'packages'), (snap) => {
      const data: SessionPackage[] = [];
      snap.forEach(d => data.push({ id: d.id, ...d.data() } as SessionPackage));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPackages(data);
    });
    return () => unsub();
  }, [currentUser]);

  const createTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => {
    const newTicket = {
      ...ticketData,
      providerId: ticketData.providerId || null, 
      status: 'Pending Acceptance' as TicketStatus,
      paymentStatus: 'pending' as PaymentStatus,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'tickets'), newTicket);
    
    NotificationService.sendEmail('providers-alert@careatease.com', 'New Service Request Available', `A new request for ${ticketData.serviceType} has been created and is pending provider acceptance.`);
    NotificationService.sendSMS('+91 8802594790', `CARE AT EASE: New ${ticketData.serviceType} request is available. Check your provider dashboard.`);
    
    return { id: docRef.id, ...newTicket };
  };

  const acceptTicket = async (ticketId: string, providerId: string, estimatedCompletion: string) => {
    const acceptedAt = new Date().toISOString();
    await updateDoc(doc(db, 'tickets', ticketId), { providerId, status: 'Pending Payment', estimatedCompletion, acceptedAt });
    
    // We can confidently notify because we are mutating the ticket now
    NotificationService.sendEmail('system@careatease.com', 'Ticket Accepted', `Ticket ${ticketId} accepted by provider ${providerId}. Awaiting Payment.`);
    NotificationService.sendSMS('+91 8802594790', `CARE AT EASE: Ticket ${ticketId} has been accepted by a provider. Awaiting client payment.`);
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    await updateDoc(doc(db, 'tickets', ticketId), { status });
    if (status === 'Completed') {
      NotificationService.sendEmail('system@careatease.com', 'Service Completed', `Ticket ${ticketId} has been successfully completed by the provider.`);
    }
  };

  const cancelTicket = async (ticketId: string, reason: string, fee: number) => {
    await updateDoc(doc(db, 'tickets', ticketId), { 
      status: 'Cancelled',
      cancellationReason: reason,
      cancellationFee: fee,
      cancelledAt: new Date().toISOString()
    });
  };

  const updatePaymentStatus = async (ticketId: string, paymentStatus: 'pending' | 'paid' | 'refunded', razorpayPaymentId?: string) => {
    const ticketRef = doc(db, 'tickets', ticketId);
    const snap = await getDoc(ticketRef);
    if (!snap.exists()) return;
    
    const ticket = snap.data() as Ticket;
    const oldStatus = ticket.paymentStatus;
    
    const updateData: any = { paymentStatus };
    if (razorpayPaymentId) updateData.razorpayPaymentId = razorpayPaymentId;
    
    await updateDoc(ticketRef, updateData);

    // If status changed to paid, increment provider balance (80%)
    if (paymentStatus === 'paid' && oldStatus !== 'paid' && ticket.providerId) {
      const amount = ticket.amount || 0;
      const providerSharePercent = ticket.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8;
      const providerShare = amount * providerSharePercent;
      await updateDoc(doc(db, 'users', ticket.providerId), {
        balance: increment(providerShare)
      });
      
      // Professional Appointment Confirmed Notifications with PDF Attachment
      const client = users.find(u => u.id === ticket.clientId);
      const pdfBlob = PDFService.generateAppointmentReceipt(ticket, client);
      
      NotificationService.sendEmail(
        client?.email || 'client@careatease.com', 
        'Appointment Confirmed - CARE AT EASE', 
        `Your appointment for ${ticket.serviceType} has been successfully confirmed. Your professional is scheduled for ${ticket.estimatedCompletion}. Please find your receipt attached.`,
        pdfBlob,
        {
          serviceType: ticket.serviceType,
          date: ticket.estimatedCompletion || 'TBD',
          providerName: users.find(u => u.id === ticket.providerId)?.name || 'Assigned Professional',
          amount: formatPrice(ticket.amount || 0),
          orderId: ticket.orderNumber || ticket.id
        }
      );
      
      NotificationService.sendSMS('+91 8802594790', `CARE AT EASE: Verified! Your ${ticket.serviceType} appointment is confirmed for ${ticket.estimatedCompletion}. Receipt sent to email.`);
    }
    // If status changed from paid (e.g. refunded), decrement provider balance
    else if (oldStatus === 'paid' && paymentStatus !== 'paid' && ticket.providerId) {
      const amount = ticket.amount || 0;
      const providerSharePercent = ticket.serviceType.toLowerCase().includes('physio') ? 0.78 : 0.8;
      const providerShare = amount * providerSharePercent;
      await updateDoc(doc(db, 'users', ticket.providerId), {
        balance: increment(-providerShare)
      });
    }
  };

  const processSplitPayment = async (ticketId: string, providerId: string, amount: number, serviceType: string) => {
    const isPhysio = serviceType.toLowerCase().includes('physio');
    const providerSharePercent = isPhysio ? 0.78 : 0.8;
    const providerCut = amount * providerSharePercent;
    const adminCut = amount * (1 - providerSharePercent);
    await updateDoc(doc(db, 'users', providerId), { balance: increment(providerCut) });
    NotificationService.sendEmail('billing@careatease.com', `Payment Split: Ticket ${ticketId}`, `Processed ${formatPrice(amount)} -> Provider: ${formatPrice(providerCut)}, Platform Fee: ${formatPrice(adminCut)}`);
  };

  const deleteTicket = async (ticketId: string) => {
    await deleteDoc(doc(db, 'tickets', ticketId));
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    await updateDoc(doc(db, 'users', userId), { role: newRole });
  };

  const approveProvider = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { role: 'provider' });
  };

  const rejectProvider = async (userId: string) => {
    await updateDoc(doc(db, 'users', userId), { role: 'client' });
  };

  const submitRating = async (providerId: string, newRating: number) => {
    const providerRef = doc(db, 'users', providerId);
    const providerSnap = await getDoc(providerRef);
    if (!providerSnap.exists()) return;
    const providerData = providerSnap.data() as User;
    
    const currentTotal = (providerData.averageRating || 5) * (providerData.reviewCount || 1);
    const newCount = (providerData.reviewCount || 1) + 1;
    const newAverage = (currentTotal + newRating) / newCount;
    
    await updateDoc(providerRef, {
      averageRating: newAverage,
      reviewCount: newCount
    });
  };

  const createWithdrawalRequest = async (requestData: Omit<WithdrawalRequest, 'id' | 'createdAt' | 'status'>) => {
    await addDoc(collection(db, 'withdrawals'), {
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  const updateWithdrawalStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    const requestRef = doc(db, 'withdrawals', requestId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) return;
    
    const request = snap.data() as WithdrawalRequest;
    
    if (status === 'approved') {
      // Re-fetch provider's current balance to prevent double-charging or negative balances
      const providerRef = doc(db, 'users', request.providerId);
      const providerSnap = await getDoc(providerRef);
      
      if (!providerSnap.exists()) return alert("Provider account not found.");
      
      const providerData = providerSnap.data() as any;
      const currentBalance = providerData.balance || 0;
      
      if (currentBalance < request.amount) {
        alert(`Insufficient Funds: Provider only has ${formatPrice(currentBalance)} but requested ${formatPrice(request.amount)}.`);
        return; // Abort approval
      }

      // Safe to deduct
      await updateDoc(providerRef, { balance: increment(-request.amount) });
    }
    
    await updateDoc(requestRef, { status, completedAt: new Date().toISOString() });
  };

  const createPackage = async (pkgData: Omit<SessionPackage, 'id' | 'createdAt' | 'status' | 'remainingSessions'>) => {
    const pkg: any = {
      ...pkgData,
      status: 'active',
      remainingSessions: pkgData.totalSessions,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'packages'), pkg);
    return { id: docRef.id, ...pkg } as SessionPackage;
  };

  const bookPackageSession = async (packageId: string, date: string, time: string, address: string, pincode: string, notes: string) => {
    const pkgRef = doc(db, 'packages', packageId);
    const snap = await getDoc(pkgRef);
    if (!snap.exists()) return;
    
    const pkg = snap.data() as SessionPackage;
    if (pkg.remainingSessions <= 0) return alert("No sessions remaining in this package");
    
    // Create pre-paid ticket
    await addDoc(collection(db, 'tickets'), {
      clientId: pkg.clientId,
      providerId: pkg.providerId, // Link to same provider for continuity
      serviceType: pkg.serviceType,
      requirements: `Package Session ${pkg.totalSessions - pkg.remainingSessions + 1} of ${pkg.totalSessions}.\nDate: ${date}, Time: ${time}\nAddress: ${address}\nPincode: ${pincode}\nNotes: ${notes}`,
      pincode,
      status: 'Pending Acceptance',
      paymentStatus: 'paid', // Pre-paid
      packageId: packageId,
      sessionNumber: pkg.totalSessions - pkg.remainingSessions + 1,
      createdAt: new Date().toISOString()
    });
    
    // Deduct credit
    await updateDoc(pkgRef, {
      remainingSessions: increment(-1),
      status: pkg.remainingSessions === 1 ? 'completed' : 'active'
    });
  };



  const logout = async () => {
    try { await auth.signOut(); } catch {}
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, tickets, isSuperAdmin,
      createTicket, acceptTicket, updateTicketStatus, cancelTicket, updatePaymentStatus, deleteTicket,
      processSplitPayment, updateUserRole, approveProvider, rejectProvider, submitRating, logout, loading,
      createWithdrawalRequest, updateWithdrawalStatus, withdrawalRequests, createPackage, bookPackageSession, packages
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
