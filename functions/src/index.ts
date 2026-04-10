import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Triggered when a new ticket is booked by a client
export const sendBookingConfirmation = functions.firestore
  .document("tickets/{ticketId}")
  .onCreate(async (snap, context) => {
    const ticketData = snap.data();
    
    functions.logger.info("New ticket created:", ticketData);

    const clientId = ticketData.clientId;
    if (!clientId) return;

    // Fetch user details to get contact info
    const userDoc = await admin.firestore().collection("users").doc(clientId).get();
    if (!userDoc.exists) return;
    
    const userData = userDoc.data();
    const userEmail = userData?.email;

    // TODO: Actually send the Email using Twilio SendGrid or NodeMailer
    if (userEmail) {
      functions.logger.info(`[MOCK EMAIL] To: ${userEmail} | Subject: Booking Received - ${ticketData.serviceType}`);
    }

    // TODO: Actually send the WhatsApp using Twilio API
    functions.logger.info(`[MOCK WHATSAPP] Notifying client about new booking...`);
});

// Triggered when a ticket's status is updated (e.g., accepted by provider)
export const sendStatusUpdateNotification = functions.firestore
  .document("tickets/{ticketId}")
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();

    // We only care if the status changes
    if (newData.status === oldData.status) return;

    functions.logger.info(`Ticket ${context.params.ticketId} status changed from ${oldData.status} to ${newData.status}`);

    const clientId = newData.clientId;
    const userDoc = await admin.firestore().collection("users").doc(clientId).get();
    if (!userDoc.exists) return;
    
    const userEmail = userDoc.data()?.email;

    // Implement messaging gateway integration here
    if (newData.status === 'accepted') {
       functions.logger.info(`[MOCK EMAIL] To: ${userEmail} | Subject: Your Booking is Accepted! Provider assigned.`);
    } else if (newData.status === 'completed') {
       functions.logger.info(`[MOCK EMAIL] To: ${userEmail} | Subject: Your Booking is Complete. How did we do?`);
    }
});

