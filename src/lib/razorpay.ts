import { API_BASE_URL } from '../config/api';

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initiateRazorpayPayment = async (
  ticket: any, 
  user: any, 
  onSuccess: (response: any) => void,
  onCancel: () => void
) => {
  try {
    const isLoaded = await loadRazorpay();
    if (!isLoaded) throw new Error("Razorpay SDK failed to load.");

    // 1. Create Order via Node.js Backend
    const amountInPaise = ticket.amount || 400000; 
    const orderRes = await fetch(`${API_BASE_URL}/api/create-razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: amountInPaise, receipt: ticket.id })
    });

    if (!orderRes.ok) throw new Error("Order creation failed on server.");
    const order = await orderRes.json();

    // 2. Open Checkout
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "CARE AT EASE",
      description: `Payment for ${ticket.serviceType}`,
      image: "/assets/logo.jpeg",
      order_id: order.id,
      handler: onSuccess,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
        contact: user?.phone || ""
      },
      theme: { color: "#0D9488" },
      modal: { ondismiss: onCancel }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  } catch (err: any) {
    console.error("Razorpay Error:", err);
    alert(err.message || "Payment initialization failed.");
    onCancel();
  }
};
