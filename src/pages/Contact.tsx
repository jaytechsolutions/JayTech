import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import FAQSection from '../components/FAQSection';

export default function Contact() {
  return (
    <div className="pt-28 sm:pt-40 pb-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-primary rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-3 sm:mb-4 border border-blue-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kobbi Labs Support</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Get in Touch With Our Team
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-slate-900 font-bold leading-relaxed">
            Have questions about custom software, web and mobile apps, or enrolling in our training? We are here to help you take the next step.
          </p>
        </div>

        {/* 2-Column Layout: Direct Contact Info & Secure Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start mb-20">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-navy rounded-[32px] md:rounded-[40px] p-8 md:p-10 text-white shadow-2xl border border-gray-800">
              <h2 className="text-xl md:text-2xl font-bold mb-2">Direct Contact Channels</h2>
              <p className="text-gray-400 text-xs md:text-sm mb-10 leading-relaxed break-words">
                Connect directly with the <strong>Kobbi Labs</strong> engineering and instructor desk.
              </p>

              <div className="space-y-4 md:space-y-6">
                <a
                  href="https://wa.me/233245862205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 group"
                >
                  <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-emerald-300 tracking-wider">WhatsApp Instant Chat</div>
                    <div className="text-sm md:text-base font-black text-white mt-1">+233 24 586 2205</div>
                    <div className="text-[10px] text-gray-400 mt-1">Quickest response for quotes & admissions</div>
                  </div>
                </a>

                <a
                  href="tel:0204168810"
                  className="flex items-start space-x-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/10 group"
                >
                  <div className="p-3 bg-primary rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-blue-300 tracking-wider">Direct Phone Call</div>
                    <div className="text-sm md:text-base font-black text-white mt-1">0204168810</div>
                    <div className="text-[10px] text-gray-400 mt-1">Available 8:00 AM – 7:00 PM GMT</div>
                  </div>
                </a>

                <div className="flex items-start space-x-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5">
                  <div className="p-3 bg-blue-600 rounded-xl text-white shadow-md">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-blue-300 tracking-wider">Official Email</div>
                    <div className="text-sm md:text-base font-black text-white mt-1 break-all">kobbilabs@gmail.com</div>
                    <div className="text-[10px] text-gray-400 mt-1">Integrated SMTP dispatch & response</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/10 border border-white/10">
                  <div className="p-3 bg-teal-500 rounded-xl text-white shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black text-teal-300 tracking-wider">Physical Hub Location</div>
                    <div className="text-sm md:text-base font-black text-white mt-0.5">Koforidua, Eastern Region, Ghana</div>
                    <div className="text-[10px] text-blue-200 mt-1">Serving clients across Ghana and remotely worldwide</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Commitments */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-black text-gray-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Our Support Guarantees</span>
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Prompt response within 2–4 business hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Free initial software scoping and consultation call</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Instant Paystack payment verification & course enrollment support</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Secure Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>

        {/* Embedded Interactive FAQ Section */}
        <FAQSection />
      </div>
    </div>
  );
}
