import { Activity, Heart, Wind, Stethoscope, UserCheck, Home, Shield, Clock, Zap, Phone, MapPin, Mail } from "lucide-react";

// ─── Price formatter (paise → ₹) ───
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

// ─── Service Categories ───
export const serviceCategories = [
  { id: "physiotherapy", tab: "Physiotherapy at Home", tabIcon: Activity },
  { id: "equipment", tab: "Oxygen Equipment at Home", tabIcon: Wind },
];

// ─── Services (prices in paise) ───
export const services = [
  {
    id: "physiotherapy",
    title: "Physiotherapy at Home",
    description: "Expert BPT/MPT certified physiotherapists providing personalized rehabilitation and recovery exercises at your doorstep.",
    icon: Activity,
    price: 400000, // ₹4,000
    category: "physiotherapy",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&h=600&fit=crop",
    benefits: [
      "Personalized treatment plans by certified BPT/MPT therapists",
      "Post-surgery & stroke rehabilitation programs",
      "Elderly mobility and pain management",
      "Flexible scheduling — morning, afternoon, or evening slots"
    ],
    pricing: "From ₹4,000 / 5 sessions",
    faqs: [
      { question: "How long is a typical session?", answer: "A typical physiotherapy session lasts between 45 to 60 minutes, customized to your needs." },
      { question: "Do I need any equipment?", answer: "Our physiotherapists bring all necessary equipment. We will inform you if anything specific is needed." }
    ]
  },
  {
    id: "oxygen-concentrator",
    title: "Oxygen Concentrator",
    description: "Medical-grade oxygen concentrators available for rent or purchase. Same-day delivery with full setup assistance.",
    icon: Wind,
    price: 350000, // ₹3,500
    category: "equipment",
    image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=300&fit=crop",
    benefits: [
      "Same-day delivery and installation",
      "Medical-grade equipment from top brands",
      "24/7 technical support",
      "Flexible rental durations — weekly, monthly, or long-term"
    ],
    pricing: "From ₹3,500 / month rental",
    faqs: [
      { question: "How quickly can you deliver?", answer: "We provide same-day delivery, typically within 2-4 hours." },
      { question: "Is setup included?", answer: "Yes, our technicians set up everything and demonstrate safe usage." }
    ]
  },
  {
    id: "bipap",
    title: "BiPAP Machine",
    description: "BiPAP machines for patients with sleep apnea, COPD, and respiratory conditions. Rent or buy with expert guidance.",
    icon: Stethoscope,
    price: 400000, // ₹4,000
    category: "equipment",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
    benefits: [
      "Auto-adjusting pressure for maximum comfort",
      "Suitable for sleep apnea and COPD patients",
      "Includes mask fitting and setup",
      "Regular maintenance support"
    ],
    pricing: "From ₹4,000 / month rental",
    faqs: [
      { question: "Who needs a BiPAP machine?", answer: "BiPAP is typically prescribed for patients with sleep apnea, COPD, or acute respiratory failure." },
      { question: "Can I try before buying?", answer: "Yes, we offer a rental period that can be converted to purchase." }
    ]
  },
  {
    id: "cpap",
    title: "CPAP Machine",
    description: "CPAP machines for sleep apnea management. Top brands available with humidifier options and full support.",
    icon: Wind,
    price: 350000, // ₹3,500
    category: "equipment",
    image: "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400&h=300&fit=crop",
    benefits: [
      "Continuous positive airway pressure therapy",
      "Multiple mask styles available",
      "Built-in humidifier options",
      "Compliance monitoring support"
    ],
    pricing: "From ₹3,500 / month rental",
    faqs: [
      { question: "What's the difference between CPAP and BiPAP?", answer: "CPAP delivers one constant pressure, while BiPAP delivers two different pressures for inhaling and exhaling." },
      { question: "How do I clean my CPAP?", answer: "We provide cleaning instructions and recommend daily mask cleaning." }
    ]
  },
  {
    id: "post-surgery",
    title: "Post-Surgery Recovery",
    description: "Comprehensive physiotherapy and nursing support after orthopedic, cardiac, or general surgeries for faster recovery.",
    icon: Heart,
    price: 600000, // ₹6,000
    category: "physiotherapy",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&h=300&fit=crop",
    benefits: [
      "Guided recovery programs for all surgery types",
      "Pain management and wound care",
      "Progressive mobility restoration",
      "Regular progress reporting to your surgeon"
    ],
    pricing: "From ₹6,000 / program",
    faqs: [
      { question: "When can I start post-surgery physio?", answer: "Usually within 48-72 hours after surgery, based on your surgeon's recommendation." },
      { question: "How many sessions will I need?", answer: "Typically 10-20 sessions depending on the surgery type." }
    ]
  },
  {
    id: "elderly-care",
    title: "Elderly Care at Home",
    description: "Specialized physiotherapy and daily support for elderly patients to maintain mobility, independence, and quality of life.",
    icon: UserCheck,
    price: 450000, // ₹4,500
    category: "physiotherapy",
    image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop",
    benefits: [
      "Fall prevention and balance training",
      "Joint pain and arthritis management",
      "Cognitive and physical exercises combined",
      "Compassionate, patient-centered approach"
    ],
    pricing: "From ₹4,500 / 5 sessions",
    faqs: [
      { question: "Is this suitable for bedridden patients?", answer: "Yes, we have specialized programs for patients with limited mobility." },
      { question: "Can you assist with daily activities too?", answer: "Our focus is therapeutic, but we can recommend home nursing care for daily support." }
    ]
  },
];

// ─── Physiotherapy Pricing Tiers (prices in paise) ───
export const physioPricing = [
  { sessions: 5, price: 400000, perSession: 80000, originalPrice: 500000, discount: 20 },
  { sessions: 10, price: 750000, perSession: 75000, originalPrice: 1000000, discount: 25 },
  { sessions: 20, price: 1400000, perSession: 70000, originalPrice: 2000000, discount: 30 },
  { sessions: 50, price: 3300000, perSession: 66000, originalPrice: 5000000, discount: 35 },
];

// ─── Equipment Pricing (Rent vs Buy) ───
export const equipmentOptions = [
  {
    title: "Oxygen Concentrator",
    rentals: [
      { id: "ox-rent-tch6", name: "TCH/YS500 6LPM", price: 350000, originalPrice: 400000, period: "month" },
      { id: "ox-rent-philips5", name: "Philips Everflow 5LPM", price: 400000, originalPrice: 450000, period: "month" },
      { id: "ox-rent-devilbiss10", name: "DeVilbiss 10LPM", price: 700000, originalPrice: 750000, period: "month" },
      { id: "ox-rent-longfian10", name: "Longfian 10LPM", price: 700000, originalPrice: 750000, period: "month" },
    ],
    purchases: [
      { id: "ox-buy-tch6", name: "TCH 6LPM", price: 2700000, originalPrice: 2950000, subtext: "Warranty: 1 Year" },
      { id: "ox-buy-longfian5", name: "Longfian 5LPM", price: 2700000, originalPrice: 2900000, subtext: "Warranty: 2 Years" },
      { id: "ox-buy-gene5", name: "Gene O2 5L", price: 3200000, originalPrice: 3500000, subtext: "Warranty: 3 Years" },
      { id: "ox-buy-oxymed5", name: "Oxymed MaOxy05", price: 3800000, originalPrice: 4200000, subtext: "Warranty: 3 Years" },
    ]
  },
  {
    title: "BiPAP Machine",
    rentals: [
      { id: "bipap-rent", name: "Rental", price: 400000, originalPrice: 450000, period: "month" }
    ],
    purchases: [
      { id: "bipap-buy-aeonmed", name: "Aeonmed", price: 4000000, originalPrice: 4500000, subtext: "" },
      { id: "bipap-buy-resmed", name: "ResMed", price: 5000000, originalPrice: 5500000, subtext: "" },
    ]
  },
  {
    title: "CPAP Machine",
    rentals: [
      { id: "cpap-rent", name: "Rental", price: 400000, originalPrice: 450000, period: "month" }
    ],
    purchases: [
      { id: "cpap-buy-philips", name: "Philips Respironics", price: 4000000, originalPrice: 4500000, subtext: "" },
      { id: "cpap-buy-resmed", name: "ResMed", price: 5000000, originalPrice: 5500000, subtext: "" },
    ]
  }
];

// ─── Why Choose Us ───
export const whyChooseUs = [
  { icon: Home, title: "Home Service Convenience", description: "Treatment at your doorstep — no hospital visits needed" },
  { icon: Shield, title: "Trusted Professionals", description: "Background-checked, certified healthcare experts" },
  { icon: Zap, title: "Quick Service & Support", description: "Same-day service with prompt response times" },
  { icon: Clock, title: "24/7 Patient Support", description: "Round-the-clock assistance whenever you need help" },
];

// ─── Patient Challenges ───
export const challenges = [
  "Difficulty visiting hospitals frequently",
  "Post-surgery recovery challenges",
  "Breathing problems due to COPD or asthma",
  "Lack of reliable physiotherapy at home",
  "Elderly patients needing support at home",
  "Emergency need for oxygen support at home",
];

// ─── How We Help ───
export const howWeHelp = [
  { icon: Activity, title: "Home Physiotherapy", description: "Expert physio sessions at your doorstep", image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop" },
  { icon: Wind, title: "Oxygen Equipment Rental & Purchase", description: "Concentrators, BiPAP, CPAP machines", image: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=300&h=200&fit=crop" },
  { icon: Stethoscope, title: "Respiratory Support Equipment", description: "Complete respiratory care solutions", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=300&h=200&fit=crop" },
  { icon: Heart, title: "Post-Surgery Recovery", description: "Guided recovery programs at home", image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=300&h=200&fit=crop" },
];

// ─── Team Members ───
export const teamMembers = [
  {
    name: "Dr. Sarah Mitchell",
    role: "Founder & Medical Director",
    badges: ["Licensed Physician", "Healthcare Professional"],
    education: "MD — Johns Hopkins School of Medicine",
    experience: ["5 years — Internal Medicine at Mayo Clinic", "3 years — Home Healthcare Innovation", "Board Certified in Rehabilitation Medicine"],
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
  },
  {
    name: "James Rivera",
    role: "Co-Founder & Operations",
    badges: ["Healthcare Professional"],
    education: "MBA — Wharton School of Business",
    experience: ["Director of Operations — Regional Health Network", "VP Strategy — MedTech Solutions Inc.", "Healthcare Innovation Fellow"],
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
  },
];

// ─── About / Mission / Vision ───
export const aboutData = {
  story: "CARE AT EASE was founded with the vision of making professional healthcare accessible at home. We started to provide easy home healthcare medical services for post-hospital discharge patients.",
  mission: "To provide quality healthcare at the comfort of your home, ensuring every patient gets the care they deserve.",
  vision: "Making professional healthcare accessible and affordable for every household across India.",
};

// ─── FAQs ───
export const generalFaqs = [
  { question: "How do I book a home physiotherapy session?", answer: "Simply add the physiotherapy service to your cart, proceed to checkout, and choose your preferred time slot. Our team will confirm within 2 hours." },
  { question: "Are your physiotherapists certified?", answer: "Yes, all our physiotherapists hold BPT/MPT degrees and are fully licensed with verified credentials and background checks." },
  { question: "What areas do you currently serve?", answer: "We currently serve Delhi NCR. Enter your pin code during booking to confirm availability in your location." },
  { question: "Can I cancel or reschedule my booking?", answer: "Yes, you can cancel or reschedule up to 24 hours before your appointment without any penalty." },
  { question: "How does equipment rental work?", answer: "Choose your equipment, select rental duration, and we'll deliver and set it up within the same day. Monthly billing with flexible terms." },
  { question: "Do you provide equipment training?", answer: "Absolutely. Our delivery technicians provide full setup, demonstration, and a quick-reference guide for all equipment." },
  { question: "Is there a minimum rental period?", answer: "The minimum rental period is 1 week for most equipment. Monthly rentals offer better value." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit/debit cards, UPI, net banking, and online payments through our secure payment gateway." },
];

// ─── Testimonials ───
export const testimonials = [
  { id: 1, name: "Priya Sharma", role: "Daughter of Patient", content: "The physiotherapy care provided for my mother was exceptional. The therapist was kind, professional, and made us feel completely at ease during her recovery.", rating: 5 },
  { id: 2, name: "Rajesh Kumar", role: "Recovering Patient", content: "Having physiotherapy at home saved me so much pain and hassle after my knee surgery. The equipment delivery was same-day. Highly recommend!", rating: 5 },
  { id: 3, name: "Anita Desai", role: "Wife of Patient", content: "Prompt oxygen concentrator delivery during an emergency. The team was very supportive and explained everything clearly. Truly professional service.", rating: 5 },
];

// ─── Stats ───
export const stats = [
  { value: "500+", label: "Sessions Completed" },
  { value: "50+", label: "Certified Professionals" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "24/7", label: "Support Available" },
];

// ─── Contact ───
export const contactInfo = {
  phone: "+91 8802594790",
  whatsapp: "+918802594790",
  address: "Delhi, India",
  servingAreas: ["Delhi"],
  expandingTo: ["Noida", "Gurgaon"],
};
