import { useLocation, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight, MessageCircle, Hash } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";

export function Confirmation() {
  const location = useLocation();
  const booking = location.state?.booking;

  if (!booking) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 md:py-20 flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Booking Confirmed!</h1>
          <p className="text-slate-600 mb-8">Your appointment has been successfully scheduled. You can view the details in your dashboard.</p>
          <Button asChild size="lg">
            <Link to="/client-dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12 md:py-20 flex items-center justify-center">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="bg-emerald-500 p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pattern3/1920/1080')] opacity-10 mix-blend-overlay"></div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
                className="relative z-10 h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </motion.div>
              <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white mb-2">Booking Confirmed!</h1>
              <p className="relative z-10 text-emerald-50 text-lg">Your appointment has been successfully scheduled.</p>
            </div>

            <CardContent className="p-8 md:p-12">
              <div className="mb-8 text-center">
                <p className="text-slate-600 mb-6">
                  Thank you, <span className="font-semibold text-slate-900">{booking.name}</span>. We've received your booking for <span className="font-semibold text-slate-900">{booking.service?.title}</span>.
                </p>
                
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-left">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">WhatsApp Confirmation Sent</h4>
                    <p className="text-sm text-blue-800">We've sent a confirmation message to {booking.phone}. Our team will contact you shortly before the appointment.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-200 pb-4">Booking Summary</h3>
                <div className="space-y-4">
                  {booking.ticketId && (
                    <div className="flex items-start gap-4">
                      <Hash className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-slate-500">Ticket ID</p>
                        <p className="font-medium text-slate-900">{booking.ticketId}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                    <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Date</p>
                      <p className="font-medium text-slate-900">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Time</p>
                      <p className="font-medium text-slate-900">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">Service Address</p>
                      <p className="font-medium text-slate-900">{booking.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link to="/client-dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/services">Explore More Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
