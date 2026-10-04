import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  ExternalLink, 
  Code, 
  Layout, 
  Smartphone, 
  Database, 
  CheckCircle2, 
  Globe,
  Monitor,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

// Assets
import project1 from '../assets/images/mighty_ghana_ecommerce_branding_1791113855893.jpg';
import project2 from '../assets/images/project_mobile_app_thumbnail_1790954016123.jpg';
import project3 from '../assets/images/project_dashboard_thumbnail_1790954031019.jpg';
import project4 from '../assets/images/project_school_system_thumbnail_1790954049897.jpg';

const projects = [
  {
    id: 'ecommerce',
    title: 'Mighty Ghana',
    category: 'E-Commerce Platform',
    image: project1,
    desc: 'A full-featured e-commerce solution with real-time inventory management, secure payment gateway integration, and a robust administrative dashboard.',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Paystack'],
    features: [
      'Multi-vendor support system',
      'Advanced product filtering and search',
      'Real-time order tracking',
      'Inventory automated alerts'
    ],
    client: 'Mighty Ghana Group',
    duration: '3 Months'
  },
  {
    id: 'healthfit',
    title: 'Health & Fit App',
    category: 'Mobile Application',
    image: project2,
    desc: 'A cross-platform mobile application designed to track fitness goals, monitor nutrition, and connect users with certified personal trainers.',
    tags: ['React Native', 'Firebase', 'Google Fit API', 'Tailwind'],
    features: [
      'Personalized workout plans',
      'Calorie and macro tracking',
      'Live chat with trainers',
      'Progress visualization charts'
    ],
    client: 'FitLife Ghana',
    duration: '4 Months'
  }
];

export default function Portfolio() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 md:mb-20 text-center max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="section-title"
          >
            Our Portfolio
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-4 leading-tight"
          >
            Delivering Excellence <br />
            Through <span className="text-primary">Innovative Code</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed font-medium"
          >
            Explore our curated showcase of high-performance websites, mobile applications, and data solutions crafted for clients who demand the best in technology.
          </motion.p>
        </div>

        {/* Project List */}
        <div className="space-y-24 md:space-y-32">
          {projects.map((project, i) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 items-center",
                i % 2 !== 0 && "lg:flex-row-reverse"
              )}
            >
              {/* Project Image */}
              <div className={cn(
                "lg:col-span-7 relative group",
                i % 2 !== 0 && "lg:order-2"
              )}>
                <div className="absolute inset-0 bg-primary/20 rounded-[32px] md:rounded-[40px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] shadow-2xl border border-gray-100 aspect-[16/10]">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Project Content */}
              <div className={cn(
                "lg:col-span-5 space-y-6 md:space-y-8",
                i % 2 !== 0 && "lg:order-1"
              )}>
                <div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
                    <Zap className="w-4 h-4" />
                    {project.category}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mb-4">
                    {project.title}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed italic font-medium">
                    "{project.desc}"
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6 p-5 md:p-6 bg-gray-50 rounded-2xl md:rounded-3xl border border-gray-100">
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Client</div>
                    <div className="text-xs sm:text-sm font-black text-slate-950">{project.client}</div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Duration</div>
                    <div className="text-xs sm:text-sm font-black text-slate-950">{project.duration}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Key Features</div>
                  {project.features.map(feature => (
                    <div key={feature} className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-bold">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button className="w-full sm:w-auto bg-primary text-white rounded-full px-8 py-4 text-xs sm:text-sm font-black group shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    View Project Case Study
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-24 md:mt-32 p-10 md:p-16 bg-navy rounded-[40px] md:rounded-[50px] text-white text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full -ml-48 -mb-48 blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Start Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Success Story?</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-lg font-medium">
              Our engineering team is ready to transform your vision into a world-class digital reality. Let's build something exceptional together.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="w-full sm:w-auto">
                <button className="w-full bg-primary text-white rounded-full px-10 py-4 text-xs sm:text-sm font-black shadow-lg shadow-primary/20 active:scale-95 transition-all">
                  Get a Custom Quote
                </button>
              </Link>
              <Link to="/services" className="w-full sm:w-auto">
                <button className="w-full px-10 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-xs sm:text-sm font-bold transition-all active:scale-95">
                  View All Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
