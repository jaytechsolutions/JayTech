import { motion } from 'motion/react';
import { 
  Users, 
  Target, 
  Lightbulb, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Smartphone, 
  Database,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import aboutImg from '../assets/images/kobbi_labs_dev_team_1790953983109.jpg';

const values = [
  {
    title: 'Innovation',
    desc: 'We leverage the latest technologies to build solutions that are ahead of the curve.',
    icon: Lightbulb,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Quality',
    desc: 'Excellence is our standard. We deliver robust, scalable, and secure applications.',
    icon: ShieldCheck,
    color: 'bg-emerald-100 text-emerald-600'
  },
  {
    title: 'Integrity',
    desc: 'We build trust through transparency, honesty, and consistent results.',
    icon: CheckCircle2,
    color: 'bg-purple-100 text-purple-600'
  }
];

const teamStats = [
  { label: 'Successful Projects', value: '100+' },
  { label: 'Happy Clients', value: '50+' },
  { label: 'Experts in Team', value: '15+' },
  { label: 'Years Experience', value: '3+' }
];

export default function About() {
  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <span className="section-title">About Kobbi Labs</span>
              <h1 className="text-3xl min-[400px]:text-4xl sm:text-6xl font-black text-slate-950 tracking-tight mt-4 leading-tight break-words">
                Empowering the Future Through <span className="text-primary">Innovative Code</span>
              </h1>
              <p className="mt-6 text-sm min-[400px]:text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
                Kobbi Labs is a premier technology firm based in Ghana, dedicated to transforming businesses and empowering individuals through world-class software development and professional IT training.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {teamStats.map((stat) => (
                <div key={stat.label} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
                  <div className="text-3xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                src={aboutImg} 
                alt="Kobbi Labs Team" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl z-0" />
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-accent/20 rounded-full blur-3xl z-0" />
          </motion.div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-10 bg-navy rounded-[40px] text-white shadow-2xl relative overflow-hidden"
          >
            <Target className="w-12 h-12 text-primary mb-6" />
            <h2 className="text-3xl font-black mb-4">Our Mission</h2>
            <p className="text-gray-400 font-medium leading-relaxed">
              To deliver innovative, reliable, and scalable digital solutions that solve real-world problems and drive growth for our clients across the globe.
            </p>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden"
          >
            <Users className="w-12 h-12 text-primary mb-6" />
            <h2 className="text-3xl font-black text-slate-950 mb-4">Our Vision</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              To be the leading hub for technological innovation in Africa, recognized globally for excellence in software engineering and professional tech education.
            </p>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
          </motion.div>
        </div>

        {/* Values */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="section-title">Our Values</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-4">
            The Principles That Drive Us
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {values.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all text-center group"
            >
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform", value.color)}>
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-950 mb-3">{value.title}</h3>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-[50px] p-12 md:p-20 text-white text-center relative overflow-hidden shadow-2xl"
        >
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Ready to Join the <span className="text-primary">Kobbi Labs</span> Community?
            </h2>
            <p className="text-blue-100 text-lg font-medium opacity-90">
              Whether you're looking for a world-class software solution or looking to advance your tech skills, we're here to help you succeed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <button className="bg-primary text-white px-10 py-4 rounded-full font-black shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-2">
                  Get in Touch <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/training">
                <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-10 py-4 rounded-full font-black active:scale-95 transition-all">
                  Browse Our Courses
                </button>
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-32 -mb-32" />
        </motion.div>
      </div>
    </div>
  );
}
