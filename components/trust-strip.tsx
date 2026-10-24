import React from 'react';
import { ShieldCheck, Eye, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TrustStrip({ className }: { className?: string }) {
  const items = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#81141f] shrink-0 mt-0.5" />,
      title: 'Verified listings',
      description: 'Every car and property checked',
    },
    {
      icon: <Eye className="w-5 h-5 text-[#81141f] shrink-0 mt-0.5" />,
      title: 'Inspect before you pay',
      description: 'Test drives and viewings on request',
    },
    {
      icon: (
        <span className="text-[#81141f] font-bold text-lg leading-none shrink-0 mt-0.5">
          ¥
        </span>
      ),
      title: 'Clear RMB rates',
      description: 'Both rates shown upfront',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-[#81141f] shrink-0 mt-0.5" />,
      title: 'Real people on WhatsApp',
      description: 'Talk to the team directly',
    },
  ];

  return (
    <div
      className={cn(
        'w-full bg-white border-b border-[#eae3e4] py-8',
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 lg:px-[120px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="group flex items-start gap-3 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <div className="flex flex-col">
                <h4 className="text-[14px] font-bold text-[#1b1416] leading-snug transition-colors group-hover:text-[#81141f]">
                  {item.title}
                </h4>
                <p className="text-[12px] text-[#716769] leading-tight mt-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
