import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  Code, 
  Database, 
  Smartphone, 
  Globe, 
  CheckCircle2, 
  Layout, 
  PenTool, 
  GraduationCap,
  Users,
  Clock,
  ThumbsUp,
  X,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import FAQSection from '../components/FAQSection';

// Assets
import heroImg from '../assets/images/kobbi_labs_hero_workspace_1790953966078.jpg';
import aboutImg from '../assets/images/kobbi_labs_dev_team_1790953983109.jpg';
import project1 from '../assets/images/mighty_ghana_ecommerce_branding_1791113855893.jpg';
import project2 from '../assets/images/project_mobile_app_thumbnail_1790954016123.jpg';
import project3 from '../assets/images/project_dashboard_thumbnail_1790954031019.jpg';
import project4 from '../assets/images/project_school_system_thumbnail_1790954049897.jpg';

import serviceWebDev from '../assets/images/service_web_dev_1791113708173.jpg';
import serviceMobileApp from '../assets/images/service_mobile_app_1791113723459.jpg';
import serviceDataAnalysis from '../assets/images/service_data_analysis_1791113737387.jpg';
import serviceBranding from '../assets/images/service_branding_1791113749847.jpg';
import serviceSoftwareSolutions from '../assets/images/service_software_solutions_1791113764337.jpg';

const services = [
  {
    title: 'Web development',
    desc: 'Modern, fast and responsive websites for your brand or business.',
    icon: Globe,
    image: serviceWebDev,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: 'Mobile app development',
    desc: 'Powerful Android & iOS apps for your ideas.',
    icon: Smartphone,
    image: serviceMobileApp,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Data analysis and visualization',
    desc: 'Turn your data into meaningful insights and smart decisions.',
    icon: Database,
    image: serviceDataAnalysis,
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Graphic design and branding',
    desc: 'Creative designs that make your brand stand out.',
    icon: PenTool,
    image: serviceBranding,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    title: 'Software solution',
    desc: 'Custom software for businesses, schools, churches and institutions.',
    icon: Layout,
    image: serviceSoftwareSolutions,
    color: 'bg-orange-100 text-orange-600',
  }
];

const projects = [
  {
    id: 'ecommerce',
    title: 'E-Commerce Website',
    category: 'Mighty Ghana',
    image: project1,
    desc: 'A robust e-commerce platform built for scale. Featuring real-time inventory management, secure Paystack integration, and a seamless user experience for shoppers in Ghana.',
    tags: ['React', 'Node.js', 'Paystack'],
    features: ['Real-time Inventory', 'Mobile-First Design', 'Secure Checkout']
  },
  {
    id: 'healthfit',
    title: 'Mobile App',
    category: 'Health & Fit App',
    image: project2,
    desc: 'A comprehensive health tracking application for iOS and Android. It monitors daily activities, suggests personalized workout routines, and helps users stay consistent.',
    tags: ['React Native', 'Firebase', 'Analytics'],
    features: ['Workout Suggester', 'Activity Tracking', 'Push Notifications']
  }
];

const stats = [
  { label: 'Projects Completed', value: '100+', icon: Code },
  { label: 'Happy Clients', value: '50+', icon: Users },
  { label: 'Years of Experience', value: '3+', icon: Clock },
  { label: 'Client Satisfaction', value: '98%', icon: ThumbsUp }
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 lg:pt-48 lg:pb-32 bg-navy overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImg} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6"
              >
                <span className="text-primary text-[10px] font-bold uppercase tracking-wider">Kobbi Labs</span>
                <span className="text-gray-400 text-[10px] uppercase tracking-wider hidden sm:inline">• Your Vision + Our Technology = Real Solutions</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-5xl md:text-6xl font-black text-white leading-[1.2] mb-6 tracking-tight"
              >
                We Build Powerful <br />
                Digital Solutions <br />
                for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Smarter Tomorrow</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 text-sm sm:text-lg mb-10 max-w-xl leading-relaxed font-medium"
              >
                Kobbi Labs is a Ghana-based tech company focused on building innovative web and mobile applications, data solutions and digital tools that help businesses, institutions and individuals grow.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/services" className="btn-primary rounded-full px-8 py-4 w-full sm:w-auto text-center justify-center font-black">
                  Explore Our Services <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Hero Right Features */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="space-y-6">
                {[
                  { title: 'Web Development', desc: 'Modern & Responsive', icon: Code, color: 'bg-blue-600' },
                  { title: 'Mobile Apps', desc: 'Android & iOS', icon: Smartphone, color: 'bg-emerald-600' },
                  { title: 'Data Analysis', desc: 'Insights for Growth', icon: Database, color: 'bg-orange-600' },
                  { title: 'Software Solutions', desc: 'Custom & Scalable', icon: Layout, color: 'bg-purple-600' }
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (i * 0.1) }}
                    className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <div className={cn("p-3 rounded-xl", feature.color)}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                      <p className="text-gray-400 text-xs">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-4">
              <span className="section-title">Our Services</span>
              <h2 className="section-headline text-2xl sm:text-4xl">We Offer a Wide Range of Tech Solutions</h2>
              <p className="text-slate-600 mb-8 font-medium text-sm sm:text-base">
                From websites to mobile apps, data analytics and more — we turn your ideas into smart, scalable and results-driven solutions.
              </p>
              <Link to="/services" className="inline-flex items-center gap-2 text-primary font-black hover:gap-3 transition-all border-b-2 border-primary/20 pb-1 text-sm">
                View All Services <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service, i) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-[32px] border border-gray-100 hover:shadow-xl transition-all group overflow-hidden flex flex-col"
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className={cn("absolute bottom-4 left-6 p-2.5 rounded-xl transition-transform group-hover:scale-110", service.color)}>
                        <service.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-lg font-black text-slate-950 mb-2">{service.title}</h3>
                      <p className="text-sm text-slate-600 mb-6 line-clamp-2 font-medium">{service.desc}</p>
                      <div className="mt-auto pt-2">
                        <Link to="/services" className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                          Learn More <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5">
              <div className="relative px-4 sm:px-0">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  className="rounded-[40px] overflow-hidden shadow-2xl relative z-10"
                >
                  <img src={aboutImg} alt="Dev Team" className="w-full aspect-[4/5] object-cover" loading="lazy" />
                </motion.div>
                {/* Decorative Elements */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-10 right-10 z-20 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 animate-bounce hidden sm:block">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-primary">3+</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Years Exp.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7">
              <span className="section-title">About Kobbi Labs</span>
              <h2 className="section-headline text-2xl sm:text-4xl">Innovation. Quality. Results.</h2>
              <p className="text-slate-600 mb-10 text-sm sm:text-lg leading-relaxed font-medium">
                We are a Ghana-based tech company passionate about creating innovative digital solutions. Our team builds websites, mobile apps, data solutions and provides IT training to help individuals, businesses and institutions thrive in the digital world.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, i) => (
                  <div key={stat.label} className="text-center md:text-left">
                    <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                      <stat.icon className="w-5 h-5 text-primary" />
                      <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 sm:p-8 bg-gray-50 rounded-[32px] border border-gray-100 mb-10">
                <h4 className="font-bold text-slate-900 mb-4 text-sm sm:text-base">Why Choose Kobbi Labs?</h4>
                <ul className="space-y-3">
                  {[
                    'Experienced & skilled team',
                    'Quality and reliable solutions',
                    'Affordable and flexible pricing',
                    'Ongoing support and maintenance',
                    'Client-focused approach'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/contact">
                <button className="btn-primary rounded-full px-10 py-4 font-black">
                  Get a Quote <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="section-title">Our Work</span>
              <h2 className="section-headline text-2xl sm:text-4xl">Featured Projects</h2>
              <p className="text-slate-600 max-w-xl font-medium text-xs sm:text-base">
                Take a look at some of our recent projects and see how we've helped businesses and individuals achieve their goals.
              </p>
            </div>
            <Link to="/portfolio" className="btn-primary rounded-full w-full sm:w-auto text-center justify-center font-black">
              View All Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{project.title}</h3>
                  <p className="text-xs text-primary font-bold">{project.category}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial Section */}
          <div className="max-w-4xl mx-auto">
             <div className="text-center mb-12">
               <span className="section-title">What Clients Say</span>
               <h2 className="section-headline text-2xl sm:text-4xl">Trusted by Clients</h2>
             </div>
             
             <div className="bg-white p-8 md:p-16 rounded-[40px] shadow-xl border border-gray-100 relative">
                <div className="relative z-10">
                  <p className="text-lg md:text-2xl font-medium text-slate-700 italic leading-relaxed mb-10 text-center">
                    "Kobbi Labs delivered an excellent website for our business. Their team is professional, creative and always ready to help. Highly recommended!"
                  </p>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 overflow-hidden">
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">SD</div>
                    </div>
                    <h5 className="font-bold text-slate-900">Samuel Darko</h5>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">CEO, BrightTech Solutions</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-gray-100"
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-slate-900 rounded-full bg-gray-100 hover:bg-gray-200 transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-6 left-8">
                  <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-2 bg-white/90 px-3 py-1 rounded-full w-fit">
                    <Zap className="w-3.5 h-3.5" />
                    {selectedProject.category}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{selectedProject.title}</h3>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedProject.desc}
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedProject.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Key Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedProject.features.map((feature: string) => (
                      <div key={feature} className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-gray-50 p-3 rounded-2xl border border-gray-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Link to="/contact" className="flex-1">
                    <button className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                      Get a Quote for Similar Project <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  );
}
