import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  features: string[];
}

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
  onOrder?: (service: ServiceItem) => void;
  exploreLink?: string;
}

export default function ServiceCard({ service, index, onOrder, exploreLink }: ServiceCardProps) {
  const Icon = service.icon;

  return (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ 
        delay: Math.min(index * 0.08, 0.4), 
        duration: 0.45, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={`service-card-hover service-card-entrance group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:border-blue-200/80 service-stagger-${(index % 6) + 1}`}
    >
      {/* Subtle top ambient indicator */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" 
      />

      {/* Media Container with Smooth Subtle Zoom */}
      <div className="h-48 overflow-hidden relative bg-gray-100">
        <img 
          src={service.image} 
          alt={service.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Floating Icon Badge with subtle lift & responsive color change */}
        <div className="absolute bottom-4 left-6">
          <div className="bg-white/95 p-3 rounded-xl shadow-md backdrop-blur-sm group-hover:bg-blue-600 group-hover:scale-105 transition-all duration-300">
            <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-8 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
          {service.title}
        </h3>
        <p className="text-gray-600 mb-6 flex-grow leading-relaxed text-sm sm:text-base">
          {service.desc}
        </p>

        {/* Feature List */}
        <ul className="space-y-2.5 mb-8">
          {service.features.map((feature, i) => (
            <li key={i} className="flex items-center text-sm text-gray-500 font-medium group-hover:text-gray-700 transition-colors">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2.5 shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Action Button */}
        <div className="flex items-center justify-end mt-auto pt-6 border-t border-gray-100">
          {onOrder ? (
            <button
              type="button"
              onClick={() => onOrder(service)}
              className="w-full bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all duration-200 shadow-md shadow-gray-900/10 hover:shadow-blue-500/25 flex items-center justify-center group/btn active:scale-[0.99] cursor-pointer"
            >
              <span>Order Service</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </button>
          ) : exploreLink ? (
            <Link
              to={exploreLink}
              className="w-full bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-all duration-200 shadow-md shadow-gray-900/10 hover:shadow-blue-500/25 flex items-center justify-center group/btn active:scale-[0.99]"
            >
              <span>Explore Service</span>
              <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
            </Link>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}
