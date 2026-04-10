import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ShoppingCart, Check, Phone, MessageCircle, AlertTriangle, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Button } from "../components/ui/Button";
import { services, whyChooseUs, challenges, howWeHelp, aboutData, generalFaqs, testimonials, contactInfo, physioPricing, equipmentOptions, stats, formatPrice, teamMembers } from "../data/mockData";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useCart } from "../contexts/CartContext";
import { ThreeBackground } from "../components/ThreeBackground";
import { useEffect, useRef } from "react";

// ─── Animated Counter ───
function AnimatedCounter({ value, label }: { value: string; label: string }) {
  const numericPart = parseInt(value) || 0;
  const suffix = value.replace(/[0-9]/g, '');
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (numericPart === 0) return;
    const controls = animate(0, numericPart, {
      duration: 2,
      ease: "easeOut",
      onUpdate(v) {
        if (nodeRef.current) nodeRef.current.textContent = Math.round(v) + suffix;
      },
    });
    return () => controls.stop();
  }, [numericPart, suffix]);

  return (
    <div className="text-center">
      <span ref={nodeRef} className="text-3xl md:text-4xl font-extrabold text-white">
        {value}
      </span>
      <p className="text-primary-100 text-sm mt-1">{label}</p>
    </div>
  );
}

export function HomeFlashy() {
  const { addToCart, isInCart } = useCart();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col bg-white text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      {/* ════════ HERO ════════ */}
      <section className="relative pt-[calc(5rem+var(--safe-area-inset-top))] pb-12 md:pt-36 md:pb-24 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50/30">
        <ThreeBackground />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-widest mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Trusted Home Healthcare in Delhi
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight md:leading-[1.1]" style={{ fontFamily: 'var(--font-heading)' }}>
                Professional Home{" "}
                <span className="text-gradient">Healthcare</span>{" "}
                Services
              </h1>

              <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed max-w-lg">
                Physiotherapy and oxygen equipment delivered to your home. Certified professionals, same-day service across Delhi NCR.
              </p>

              <div className="space-y-3 mb-8">
                {["Certified BPT/MPT Physiotherapists", "Same Day Service Across Delhi", "Oxygen Equipment Rental & Purchase"].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="font-medium">{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col lg:flex-row gap-4">
                <Button className="h-13 px-8 rounded-full bg-primary hover:bg-primary-700 text-white text-base font-semibold shadow-lg shadow-primary/20 transition-all" asChild>
                  <Link to="/services"><ShoppingCart className="h-4 w-4 mr-2" />Book Home Service</Link>
                </Button>
                <Button variant="outline" className="h-13 px-8 rounded-full border-2 border-primary text-primary hover:bg-primary-50 text-base font-semibold transition-all" asChild>
                  <a href={`tel:${contactInfo.phone}`}><Phone className="h-4 w-4 mr-2" />Call Now</a>
                </Button>
              </div>

              <p className="mt-4 text-sm text-primary-700 font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" /> Quick Contact: {contactInfo.phone}
              </p>
              <div className="flex gap-3 mt-4">
                {["Doctor Certified", "Qualified Therapists"].map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-semibold">
                    <CheckCircle2 className="h-3 w-3" />{b}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative block mt-8 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[500px]">
                <img 
                  src="https://careatease.com/assets/hero-image-DNhC9cwg.jpg" 
                  alt="Professional home healthcare" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/30 to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 bg-white rounded-2xl shadow-xl p-4 md:p-5 border border-slate-100 animate-float">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">500+</p>
                    <p className="text-xs text-slate-500">Sessions Completed</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ ANIMATED STATS BAR ════════ */}
      <section className="py-10 bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <AnimatedCounter key={i} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════ SERVICES (Tabbed) ════════ */}
      <ServicesTabSection addToCart={addToCart} isInCart={isInCart} />

      {/* ════════ WHY CHOOSE US ════════ */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Why Choose Us</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {whyChooseUs.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="card-3d flex items-start gap-4 p-6 rounded-2xl border border-slate-100 bg-white hover:border-primary-200 transition-colors">
                  <div className="h-12 w-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary shrink-0"><Icon className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {["Certified Professionals", "Trusted Home Healthcare", "Safe Medical Equipment"].map((tag, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold shadow-md">
                <CheckCircle2 className="h-4 w-4" />{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CHALLENGES ════════ */}
      <section className="py-20 bg-gradient-to-b from-primary-50/50 to-white">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mb-4"><MapPin className="h-7 w-7 text-primary" /></div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>We Understand Your Challenges</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Healthcare should not be stressful. We bring professional care directly to your home.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {challenges.map((c, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.3, delay: i * 0.08 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="text-sm font-medium text-slate-700">{c}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ HOW WE HELP ════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>How CARE AT EASE Helps</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Professional healthcare solutions delivered to your doorstep</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {howWeHelp.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="card-3d overflow-hidden rounded-2xl border border-slate-100 bg-white hover:border-primary-200 transition-colors">
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" loading="lazy" />
                  <div className="p-6 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-3 -mt-10 relative z-10 border-4 border-white shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ TESTIMONIALS ════════ */}
      <section className="py-16 md:py-20 bg-primary-50/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>What Our Patients Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div key={t.id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: i * 0.15 }}
                className="card-3d p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="flex gap-1 mb-4">{[...Array(t.rating)].map((_, j) => <span key={j} className="text-amber-400">★</span>)}</div>
                <p className="text-slate-600 mb-6 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold text-sm">{t.name.charAt(0)}</div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ TEAM ════════ */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Our Team</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}
                className="card-3d rounded-2xl border border-slate-100 bg-white p-6 text-center">
                <img src={member.image} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary-100" loading="lazy" />
                <h3 className="font-bold text-lg text-slate-900">{member.name}</h3>
                <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  {member.badges.map((b, j) => (
                    <span key={j} className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">{b}</span>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mb-2">{member.education}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ ABOUT ════════ */}
      <section className="py-20 bg-primary-50/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>About CARE AT EASE</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto italic">{aboutData.story}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}
              className="card-3d p-8 rounded-2xl border border-primary-200 bg-white">
              <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary mb-4"><CheckCircle2 className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h3>
              <p className="text-slate-600 leading-relaxed">{aboutData.mission}</p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.2 }}
              className="card-3d p-8 rounded-2xl border border-primary-200 bg-white">
              <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary mb-4"><MapPin className="h-6 w-6" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h3>
              <p className="text-slate-600 leading-relaxed">{aboutData.vision}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════ FAQ ════════ */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {generalFaqs.map((faq, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
                  <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                  {openFaq === i ? <ChevronUp className="h-5 w-5 text-primary shrink-0" /> : <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} transition={{ duration: 0.2 }} className="px-5 pb-5">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section id="contact" className="py-20 bg-primary-50/30">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Contact Us</h2>
            <p className="text-lg text-slate-500">Get in touch for any questions or to book a service</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="card-3d text-center p-6 rounded-2xl border border-slate-100 bg-white">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-3"><Phone className="h-5 w-5" /></div>
              <h4 className="font-bold text-slate-900 mb-1">Call Us</h4>
              <p className="text-primary font-semibold">{contactInfo.phone}</p>
            </div>
            <div className="card-3d text-center p-6 rounded-2xl border border-slate-100 bg-white">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-3"><MessageCircle className="h-5 w-5" /></div>
              <h4 className="font-bold text-slate-900 mb-1">WhatsApp</h4>
              <p className="text-primary font-semibold text-sm">{contactInfo.whatsapp}</p>
            </div>
            <div className="card-3d text-center p-6 rounded-2xl border border-slate-100 bg-white">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary mb-3"><MapPin className="h-5 w-5" /></div>
              <h4 className="font-bold text-slate-900 mb-1">Location</h4>
              <p className="text-sm text-slate-600">{contactInfo.address}</p>
            </div>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm text-slate-500 mb-3">Currently serving</p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {contactInfo.servingAreas.map((area, i) => <span key={i} className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-semibold">{area}</span>)}
            </div>
            <p className="text-sm text-slate-400">Expanding to: {contactInfo.expandingTo.join(", ")}</p>
          </div>
        </div>
      </section>

      {/* ════════ CTA BANNER ════════ */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Book Home Healthcare Now</h2>
          <p className="text-primary-100 mb-8 text-lg">Professional care, at your doorstep, when you need it most.</p>
          <Button className="h-13 px-10 rounded-full bg-white text-primary hover:bg-primary-50 text-base font-bold shadow-xl transition-all" asChild>
            <Link to="/services">Browse Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ════════ FLOATING ACTION BUTTONS ════════ */}
      <a href={`tel:${contactInfo.phone}`} className="fab-phone" aria-label="Call us"><Phone className="h-6 w-6" /></a>
      <a href={`https://wa.me/${contactInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="fab-whatsapp" aria-label="WhatsApp"><MessageCircle className="h-6 w-6" /></a>
    </div>
  );
}

// ─── Tabbed Services ───
function ServicesTabSection({ addToCart, isInCart }: { addToCart: (id: string, title: string, price: number) => void; isInCart: (id: string) => boolean }) {
  const [activeTab, setActiveTab] = useState<"physiotherapy" | "equipment">("physiotherapy");
  const filtered = services.filter(s => s.category === activeTab);

  return (
    <section id="services" className="py-20 bg-primary-50/30">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Our Services</h2>
          <p className="text-lg text-slate-500 mb-8">Comprehensive home healthcare services across Delhi NCR</p>
          <div className="inline-flex rounded-full border border-slate-200 p-1 bg-white">
            <button onClick={() => setActiveTab("physiotherapy")} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "physiotherapy" ? "bg-primary text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}>
              Physiotherapy at Home
            </button>
            <button onClick={() => setActiveTab("equipment")} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "equipment" ? "bg-primary text-white shadow-md" : "text-slate-600 hover:text-slate-900"}`}>
              Oxygen Equipment
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {filtered.map((service, i) => {
            const Icon = service.icon;
            const inCart = isInCart(service.id);
            return (
              <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="card-3d bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col">
                <img src={service.image} alt={service.title} className="w-full h-40 object-cover" loading="lazy" />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary"><Icon className="h-5 w-5" /></div>
                    <h3 className="text-lg font-bold text-slate-900">{service.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4 flex-1">{service.description.substring(0, 100)}...</p>
                  <p className="text-primary font-bold mb-4">{service.pricing}</p>
                  <div className="flex gap-2">
                    <Link to={`/services/${service.id}`} className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-700 transition-colors shadow-sm">
                      View Pricing Options
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {activeTab === "physiotherapy" && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Session Packages</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {physioPricing.map((tier, i) => (
                <div key={i} className="card-3d relative bg-white rounded-2xl border border-slate-100 p-6 text-center">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">{tier.discount}% OFF</span>
                  <p className="text-slate-500 text-sm mb-2 mt-2">{tier.sessions} Sessions</p>
                  <p className="text-3xl font-extrabold text-slate-900">{formatPrice(tier.price)}</p>
                  <p className="text-sm text-slate-400 line-through">{formatPrice(tier.originalPrice)}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatPrice(tier.perSession)}/session</p>
                  <button onClick={() => addToCart(`physio-${tier.sessions}`, `Physiotherapy ${tier.sessions} Sessions`, tier.price)}
                    disabled={isInCart(`physio-${tier.sessions}`)}
                    className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${isInCart(`physio-${tier.sessions}`) ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white hover:bg-primary-700"}`}>
                    {isInCart(`physio-${tier.sessions}`) ? "Added ✓" : "Add to Cart"}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "equipment" && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 space-y-16">
            {equipmentOptions.map((equipment, idx) => (
              <div key={idx}>
                <h3 className="text-2xl font-bold text-center text-slate-900 mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                  {equipment.title}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {/* Rental Column */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h4 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider text-center">Rental</h4>
                    <div className="space-y-4">
                      {equipment.rentals.map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-primary-300 transition-colors shadow-sm">
                          <div className="text-center sm:text-left">
                            <h5 className="font-bold text-slate-800">{item.name}</h5>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                              <p className="text-primary font-bold text-lg">{formatPrice(item.price)}<span className="text-xs text-slate-500 font-normal">/{item.period}</span></p>
                              {item.originalPrice > item.price && (
                                <p className="text-xs text-slate-400 line-through">{formatPrice(item.originalPrice)}</p>
                              )}
                            </div>
                          </div>
                          <button onClick={() => addToCart(item.id, `${equipment.title} - ${item.name} (Rental)`, item.price)}
                            disabled={isInCart(item.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all w-full sm:w-auto shrink-0 ${isInCart(item.id) ? "bg-emerald-100 text-emerald-700" : "bg-primary text-white hover:bg-primary-700"}`}>
                            {isInCart(item.id) ? "Added ✓" : "Add to Cart"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purchase Column */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider text-center">Purchase</h4>
                    <div className="space-y-4">
                      {equipment.purchases.map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-slate-300 transition-colors shadow-sm">
                          <div className="text-center sm:text-left">
                            <h5 className="font-bold text-slate-800">{item.name}</h5>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
                              <p className="text-slate-900 font-bold text-lg">{formatPrice(item.price)}</p>
                              {item.originalPrice > item.price && (
                                <p className="text-xs text-slate-400 line-through">{formatPrice(item.originalPrice)}</p>
                              )}
                            </div>
                            {item.subtext && <p className="text-xs text-slate-500 mt-1">{item.subtext}</p>}
                          </div>
                          <button onClick={() => addToCart(item.id, `${equipment.title} - ${item.name} (Purchase)`, item.price)}
                            disabled={isInCart(item.id)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all w-full sm:w-auto shrink-0 ${isInCart(item.id) ? "bg-emerald-100 text-emerald-700" : "bg-slate-800 text-white hover:bg-slate-900"}`}>
                            {isInCart(item.id) ? "Added ✓" : "Buy Now"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-10">
          <Button className="h-12 px-8 rounded-full bg-primary hover:bg-primary-700 text-white font-semibold shadow-lg shadow-primary/20" asChild>
            <Link to="/services">View All Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
