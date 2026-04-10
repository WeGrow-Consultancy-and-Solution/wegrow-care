import { HeartPulse, Mail, MapPin, Phone, MessageCircle, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export function Footer() {
  return (
    <>
      {/* Service Coverage Section - Light Background Pre-Footer */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <h4 className="text-slate-900 text-2xl md:text-3xl font-bold mb-3">Home Healthcare Service Coverage in Delhi NCR</h4>
            <p className="text-slate-500 text-lg opacity-80">Providing medical equipment and services across the capital region</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Currently Serving Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col items-center text-center shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] hover:shadow-xl">
              <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-[#209784]" />
              </div>
              <h5 className="text-slate-800 text-2xl font-bold mb-6">Currently Serving</h5>
              <span className="px-10 py-3 bg-[#209784] text-white text-base font-extrabold rounded-full shadow-lg shadow-teal-500/20 uppercase tracking-widest">
                Delhi
              </span>
            </div>

            {/* Expanding Soon Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col items-center text-center shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] transition-all hover:scale-[1.02] hover:shadow-xl">
              <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-[#f49d25]" />
              </div>
              <h5 className="text-slate-800 text-2xl font-bold mb-6">Expanding Soon</h5>
              <div className="flex flex-wrap justify-center gap-4">
                <span className="px-8 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-full border border-slate-200">
                  Noida
                </span>
                <span className="px-8 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-full border border-slate-200">
                  Gurgaon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="bg-white py-16 border-t border-slate-200 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/3 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-6">
                  Our Headquarters
                </div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6">Visit Our Office</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  We are based in the heart of Pitampura, Delhi. Our team is ready to assist you with all your home healthcare needs.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Main Office</h4>
                      <p className="text-xs text-slate-500 mt-1">Rajdhani Enclave, Pitampura, Delhi - 110034</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary text-white hover:bg-primary-700 rounded-full h-12 font-bold shadow-lg shadow-primary/20" asChild>
                    <a href="https://maps.app.goo.gl/YourActualLink" target="_blank" rel="noopener noreferrer">
                      Get Directions <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="lg:w-2/3 w-full h-[400px] rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-2xl relative group">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3499.8!2d77.1534!3d28.7041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d0139e0000001%3A0x1!2sRajdhani+Enclave%2C+Pitampura%2C+Delhi!5e0!3m2!1sen!2sin!4v1" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="CARE AT EASE Location"
                  className="grayscale transition-all duration-700 group-hover:grayscale-0"
                ></iframe>
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/10 rounded-[2.5rem]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-300 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-white/5 pb-16">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-tight text-white uppercase">CARE AT EASE</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Providing compassionate, professional healthcare services directly to your doorstep. Your health is our priority.
            </p>
          </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Quick Links</h4>
              <ul className="space-y-4">
                <li><Link to="/" className="hover:text-white transition-colors text-sm">Home</Link></li>
                <li><Link to="/services" className="hover:text-white transition-colors text-sm">Our Services</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors text-sm">About Us</Link></li>
                <li><Link to="/booking" className="hover:text-white transition-colors text-sm">Book Appointment</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Core Services</h4>
              <ul className="space-y-4">
                <li><Link to="/services/physiotherapy" className="hover:text-white transition-colors text-sm">Physiotherapy</Link></li>
                <li><Link to="/services/oxygen-concentrator" className="hover:text-white transition-colors text-sm">Oxygen Concentrators</Link></li>
                <li><Link to="/services/bipap" className="hover:text-white transition-colors text-sm">BiPAP Machines</Link></li>
                <li><Link to="/services/elderly-care" className="hover:text-white transition-colors text-sm">Elderly Care</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-8 uppercase tracking-widest text-xs opacity-50">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:bg-primary/20">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">+91 8802594790</span>
                </li>
                <li className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:bg-[#25D366]/20">
                    <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  </div>
                  <span className="text-sm font-bold text-white tracking-wide">Contact via WhatsApp</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm text-center">
            © 2025 CARE AT EASE. All rights reserved. Managed
            by{" "}
            <a
              href="https://www.wegrowconsultancyandsolution.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9fcd25] dark:text-[#9fcd25] hover:underline transition-colors"
            >
              WeGrow Consultancy and Solution
            </a>
          </p>
          <div className="flex gap-6 mt-4">
            <Link to="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
      </footer>
    </>
  );
}
