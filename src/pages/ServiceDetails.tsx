import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, HelpCircle, ShoppingCart, Check } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { services } from "../data/mockData";
import { useCart } from "../contexts/CartContext";

export function ServiceDetails() {
  const { id } = useParams();
  const { addToCart, isInCart } = useCart();
  const service = services.find(s => s.id === id);

  if (!service) {
    return <Navigate to="/services" replace />;
  }

  const Icon = service.icon;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-primary pt-20 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pattern2/1920/1080')] opacity-10 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <Link to="/services" className="inline-flex items-center text-primary-50 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0">
              <Icon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{service.title}</h1>
              <p className="text-xl text-blue-100 max-w-2xl leading-relaxed">
                {service.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 md:px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Benefits & Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {service.faqs.map((faq, index) => (
                  <div key={index} className="border-b border-slate-100 last:border-0 pb-6 last:pb-0">
                    <h4 className="flex items-start gap-3 text-lg font-semibold text-slate-900 mb-2">
                      <HelpCircle className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                      {faq.question}
                    </h4>
                    <p className="text-slate-600 pl-9 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <Card className="border-none shadow-xl border-t-4 border-t-primary">
                <CardHeader className="bg-slate-50 border-b border-slate-100">
                  <CardTitle className="text-xl">Service Pricing</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center mb-8">
                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">Starting From</p>
                    <p className="text-4xl font-bold text-slate-900">{service.pricing.split(' ')[1]}</p>
                    <p className="text-slate-500 mt-1">{service.pricing.split(' / ')[1]}</p>
                  </div>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span>No hidden charges</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span>Flexible payment options</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span>Free initial consultation</span>
                    </li>
                  </ul>
                  <Button 
                    size="lg" 
                    className={`w-full text-lg h-14 ${isInCart(service.id) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    onClick={() => addToCart(service.id, service.title, service.price)}
                    disabled={isInCart(service.id)}
                  >
                    {isInCart(service.id) ? (
                      <><Check className="h-5 w-5 mr-2" /> Added to Cart</>
                    ) : (
                      <><ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart</>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-500 mt-4">
                    Secure booking. Cancel anytime up to 24h before.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
