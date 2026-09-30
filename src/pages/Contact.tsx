import React from 'react';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import ContactForm from '../components/ContactForm';
import FAQSection from '../components/FAQSection';

export default function Contact() {
  return (
    <div className="pt-24 pb-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JayTech Solutions Support</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Get in Touch With Our Team
          </h1>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            Have questions about custom software, web and mobile apps, or enrolling in our self-paced tech training? We are here to help you take the next step.
          </p>
        </div>

        {/* 2-Column Layout: Direct Contact Info & Secure Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          {/* Left Column: Direct Info Cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-3xl p-8 text-white shadow-xl">
              <h2 className="text-2xl font-bold mb-2">Direct Contact Channels</h2>
              <p className="text-blue-200 text-sm mb-8 leading-relaxed">
                Connect directly with our lead instructor and software engineer, <strong>Joseph Amponsah</strong>.
              </p>

              <div className="space-y-6">
                <a
                  href="https://wa.me/233245862205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10 group"
                >
                  <div className="p-3 bg-emerald-500 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-emerald-300 tracking-wider">WhatsApp Instant Chat</div>
                    <div className="text-base font-bold text-white mt-0.5">+233 24 586 2205</div>
                    <div className="text-xs text-blue-200 mt-1">Quickest response for quotes & admissions</div>
                  </div>
                </a>

                <a
                  href="tel:0204168810"
                  className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors border border-white/10 group"
                >
                  <div className="p-3 bg-blue-500 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-blue-300 tracking-wider">Direct Phone Call</div>
                    <div className="text-base font-bold text-white mt-0.5">0204168810</div>
                    <div className="text-xs text-blue-200 mt-1">Available 8:00 AM – 7:00 PM GMT</div>
                  </div>
                </a>

                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                  <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-md">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-indigo-300 tracking-wider">Official Email</div>
                    <div className="text-base font-bold text-white mt-0.5 break-all">jaytechsolutions.net@gmail.com</div>
                    <div className="text-xs text-blue-200 mt-1">Integrated SMTP dispatch & response</div>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white/10 border border-white/10">
                  <div className="p-3 bg-teal-500 rounded-xl text-white shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase font-bold text-teal-300 tracking-wider">Physical Hub Location</div>
                    <div className="text-base font-bold text-white mt-0.5">Koforidua, Eastern Region, Ghana</div>
                    <div className="text-xs text-blue-200 mt-1">Serving clients across Ghana and remotely worldwide</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Commitments */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Our Support Guarantees</span>
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Prompt response within 2–4 business hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Free initial software scoping and consultation call</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Instant Paystack payment verification & course enrollment support</span>
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
