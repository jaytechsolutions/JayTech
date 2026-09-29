import { motion } from 'motion/react';
import { ArrowRight, Code, Database, Smartphone, Globe, Target, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewSection from '../components/ReviewSection';
import FAQSection from '../components/FAQSection';
import ServiceCard, { ServiceItem } from '../components/ServiceCard';

import heroImg from '../assets/images/hero_tech_innovation_1790257487363.jpg';
import webDevImg from '../assets/images/web_dev_service_1790442249672.jpg';
import webAppImg from '../assets/images/web_app_service_1790442260815.jpg';
import mobileAppImg from '../assets/images/mobile_apps_service_1790442271604.jpg';

const featuredServices: ServiceItem[] = [
  {
    id: 'web-dev',
    title: 'Website Development',
    desc: 'High-performance, responsive websites tailored to elevate your business presence.',
    icon: Globe,
    image: webDevImg,
    features: ['Custom Design', 'SEO Optimized', 'Mobile Responsive', 'Contact Forms']
  },
  {
    id: 'web-app',
    title: 'Web Application Development',
    desc: 'Complex, scalable web software systems built with cutting-edge architectures.',
    icon: Code,
    image: webAppImg,
    features: ['User Authentication', 'Database Integration', 'API Development', 'Admin Controls']
  },
  {
    id: 'mobile-app',
    title: 'Mobile App Engineering',
    desc: 'Native-feel cross-platform applications for iOS and Android ecosystems.',
    icon: Smartphone,
    image: mobileAppImg,
    features: ['Cross-platform', 'Push Notifications', 'App Store Ready', 'Offline Support']
  }
];

export default function Home() {
  const whyChooseUs = [
    { icon: Globe, title: 'Web Development', desc: 'Custom websites built with modern technologies.' },
    { icon: Code, title: 'Web Application Development', desc: 'Powerful, scalable web-based software solutions.' },
    { icon: Smartphone, title: 'Mobile Apps', desc: 'Seamless mobile experiences for iOS and Android.' },
    { icon: Database, title: 'Data Management', desc: 'Secure and efficient database solutions.' },
  ];

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Tech Hero"
            className="w-full h-full object-cover brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold mb-6"
          >
            Empowering Your <br />
            <span className="text-blue-400">Digital Future</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 max-w-2xl mb-10"
          >
            JayTech Solutions provides professional software development, data solutions, and tech training to help you thrive in the digital age.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link 
              to="/services" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center group shadow-lg shadow-blue-600/30"
            >
              Our Services
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/training" 
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold text-lg transition-all"
            >
              Tech Training
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Service Cards Showcase */}
      <section className="py-24 bg-gray-50/70 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16">
            <div>
              <span className="text-blue-600 font-bold text-sm tracking-wider uppercase">What We Build</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
                Main Services & Solutions
              </h2>
            </div>
            <Link 
              to="/services"
              className="mt-4 md:mt-0 inline-flex items-center text-blue-600 font-bold hover:text-blue-700 transition-colors group"
            >
              <span>View All 6 Services</span>
              <ArrowRight className="ml-1.5 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredServices.map((service, idx) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={idx}
                exploreLink="/services"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-blue-50/80 p-10 rounded-3xl border border-blue-100/50"
            >
              <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-blue-600/20">
                <Target className="text-white w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To deliver innovative, high-quality software solutions that solve real-world problems and empower businesses and individuals through expert-led technology training and data management.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-teal-50/80 p-10 rounded-3xl border border-teal-100/50"
            >
              <div className="bg-teal-600 w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-teal-600/20">
                <ShieldCheck className="text-white w-6 h-6" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Vision</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To be a leading global hub for technology excellence, recognized for transforming lives through software innovation and creating a bridge between complex technology and human success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Services Capabilities */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We combine technical expertise with a passion for excellence to deliver results that matter.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((service, idx) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="service-card-dark-hover bg-white/5 border border-white/10 p-8 rounded-2xl hover:bg-white/10 hover:border-blue-400/40 transition-all group relative overflow-hidden flex flex-col"
              >
                <div 
                  aria-hidden="true" 
                  className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                />
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 group-hover:border-blue-400/40 transition-all duration-300">
                  <service.icon className="w-7 h-7 text-blue-400 group-hover:text-blue-300 transition-colors" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-300 transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">{service.desc}</p>
                <Link
                  to="/services"
                  className="inline-flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors mt-auto"
                >
                  Explore Service
                  <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewSection />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}

