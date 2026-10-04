import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  features?: string[];
  color?: string;
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
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-[24px] sm:rounded-[32px] border border-gray-100 hover:shadow-2xl transition-all group flex flex-col h-full overflow-hidden"
    >
      {service.image && (
        <div className="h-32 sm:h-48 overflow-hidden relative">
          <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className={cn(
            "absolute bottom-3 left-4 sm:bottom-4 sm:left-6 p-2 sm:p-3 rounded-xl transition-transform group-hover:scale-110 shadow-lg",
            service.color || "bg-white/95 text-primary backdrop-blur-sm"
          )}>
            <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
        </div>
      )}

      <div className="p-5 sm:p-8 flex-grow flex flex-col">
        {!service.image && (
          <div className={cn(
            "p-3 sm:p-4 rounded-2xl w-fit mb-6 sm:mb-8 transition-transform group-hover:scale-110",
            service.color || "bg-blue-50 text-blue-600"
          )}>
            <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
        )}

        <h3 className="text-lg sm:text-xl font-black text-slate-950 mb-2 sm:mb-3 tracking-tight">{service.title}</h3>
        <p className="text-slate-600 mb-6 sm:mb-8 flex-grow leading-relaxed font-medium text-xs sm:text-base">{service.desc}</p>

        {service.features && service.features.length > 0 && (
          <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {service.features.map((feature, i) => (
              <li key={i} className="flex items-center text-[9px] sm:text-xs font-black text-slate-500 uppercase tracking-wide">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mr-1.5 sm:mr-2 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="pt-4 sm:pt-6 border-t border-gray-50 mt-auto">
          {onOrder ? (
            <button
              onClick={() => onOrder(service)}
              className="text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 hover:gap-3 transition-all group/btn"
            >
              Order Now <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          ) : (
            <Link 
              to={exploreLink || "/services"} 
              className="text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 hover:gap-3 transition-all group/btn"
            >
              Learn More <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
