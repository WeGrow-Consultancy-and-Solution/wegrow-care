import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingCart, Check, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { services, physioPricing, equipmentOptions, formatPrice } from "../data/mockData";
import { useCart } from "../contexts/CartContext";

export function Services() {
  const { addToCart, isInCart } = useCart();
  const [activeTab, setActiveTab] = useState<"physiotherapy" | "equipment">("physiotherapy");

  const filteredServices = services.filter(s => s.category === activeTab);

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Our Healthcare Services
          </h1>
          <p className="text-lg text-slate-500">
            Comprehensive home healthcare services — physiotherapy and medical equipment delivered to your doorstep.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-full border border-slate-200 p-1 bg-white shadow-sm">
            <button
              onClick={() => setActiveTab("physiotherapy")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === "physiotherapy"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Physiotherapy at Home
            </button>
            <button
              onClick={() => setActiveTab("equipment")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === "equipment"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Oxygen Equipment
            </button>
          </div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredServices.map((service, index) => {
            const Icon = service.icon;
            const inCart = isInCart(service.id);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card-3d bg-white rounded-2xl border border-slate-100 p-6 flex flex-col shadow-sm"
              >
                <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.title}</h3>
                <p className="text-sm text-slate-500 mb-4 flex-1 leading-relaxed">{service.description}</p>
                
                <ul className="space-y-2 mb-6">
                  {service.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-lg font-bold text-primary mb-4">{service.pricing}</p>
                  <div className="flex gap-2">
                    <Link
                      to={`/services/${service.id}`}
                      className="w-full text-center px-4 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      View Pricing Options
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pricing Section */}
        {activeTab === "physiotherapy" && (
          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
              Physiotherapy Session Packages
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {physioPricing.map((tier, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="card-3d relative bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-sm"
                >
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-md">
                    {tier.discount}% OFF
                  </span>
                  <p className="text-slate-500 text-sm mb-3 mt-2">{tier.sessions} Sessions</p>
                  <p className="text-3xl font-extrabold text-slate-900">{formatPrice(tier.price)}</p>
                  <p className="text-sm text-slate-400 line-through">{formatPrice(tier.originalPrice)}</p>
                  <p className="text-xs text-slate-500 mt-1">{formatPrice(tier.perSession)}/session</p>
                  <button
                    onClick={() => addToCart(`physio-${tier.sessions}`, `Physiotherapy ${tier.sessions} Sessions`, tier.price)}
                    disabled={isInCart(`physio-${tier.sessions}`)}
                    className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isInCart(`physio-${tier.sessions}`)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-primary text-white hover:bg-primary-700"
                    }`}
                  >
                    {isInCart(`physio-${tier.sessions}`) ? "Added ✓" : "Add to Cart"}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "equipment" && (
          <div className="max-w-6xl mx-auto mb-16 space-y-16">
            {equipmentOptions.map((equipment, idx) => (
              <div key={idx}>
                <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-8" style={{ fontFamily: 'var(--font-heading)' }}>
                  {equipment.title}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Rental Column */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
                    <h3 className="text-xl font-bold text-primary mb-6 uppercase tracking-wider text-center">Rental</h3>
                    <div className="space-y-4">
                      {equipment.rentals.map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-primary-300 transition-colors shadow-sm">
                          <div className="text-center sm:text-left">
                            <h4 className="font-bold text-slate-800">{item.name}</h4>
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
                    <h3 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider text-center">Purchase</h3>
                    <div className="space-y-4">
                      {equipment.purchases.map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-slate-300 transition-colors shadow-sm">
                          <div className="text-center sm:text-left">
                            <h4 className="font-bold text-slate-800">{item.name}</h4>
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
          </div>
        )}
      </div>
    </div>
  );
}
