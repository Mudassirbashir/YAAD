import React from 'react';
import { Newspaper } from 'lucide-react';
import { APP_IMAGES } from '../../data/initialData';

interface AppPublicFooterProps {
  onOpenShopping?: () => void;
  onOpenRashan?: () => void;
  onOpenLegal?: (page: 'about' | 'terms' | 'privacy' | 'help' | 'blog' | 'legal') => void;
}

export const AppPublicFooter: React.FC<AppPublicFooterProps> = ({
  onOpenShopping,
  onOpenRashan,
  onOpenLegal,
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="app_public_footer"
      className="mt-16 border-t border-[#e5e1d8] bg-white pt-12 pb-10 px-4 sm:px-6 transition-all"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-[#e5e1d8]">
        {/* Col 1: Brand Identity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#e5e1d8] flex items-center justify-center shadow-2xs p-1">
              <img
                src={APP_IMAGES.logoTransparent || '/logo.png'}
                alt="YAAD"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-extrabold text-base text-[#1c2826] tracking-tight font-['Plus_Jakarta_Sans']">
              YAAD
            </span>
          </div>
          <p className="text-xs text-[#556960] leading-relaxed">
            Thoughtful shopping memory and monthly grocery checklists designed for real kiryana and supermarket trips.
          </p>
          <div className="pt-1">
            <a
              href="mailto:yaadapppk@gmail.com"
              className="text-xs font-semibold text-[#005039] hover:underline"
            >
              yaadapppk@gmail.com
            </a>
          </div>
        </div>

        {/* Col 2: App & Features */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
            App &amp; Features
          </h4>
          <ul className="space-y-2 text-xs text-[#556960]">
            <li>
              <button
                type="button"
                onClick={onOpenShopping}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Shopping Lists
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={onOpenRashan}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Monthly Rashan Guide
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('about')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                About YAAD
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('help')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Help &amp; FAQ
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: YAAD Blog & Guides */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Newspaper className="w-3.5 h-3.5 text-[#005039]" />
            <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
              Blog &amp; Guides
            </h4>
          </div>
          <ul className="space-y-2 text-xs text-[#556960]">
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('blog')}
                className="text-[#005039] font-bold hover:underline transition-colors cursor-pointer text-left"
              >
                Browse All Articles &rarr;
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('blog')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                5 Smart Ways to Plan Monthly Rashan
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('blog')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Understanding Pakistani Units
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('blog')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Offline Shopping in Basement Bazaars
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Privacy & Legal */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#1c2826] uppercase tracking-wider">
            Privacy &amp; Terms
          </h4>
          <ul className="space-y-2 text-xs text-[#556960]">
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('privacy')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('terms')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Terms of Service
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('legal')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Legal Information Hub
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onOpenLegal?.('help')}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left"
              >
                Customer Support
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#788880]">
        <p>&copy; {currentYear} YAAD. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onOpenLegal?.('privacy')}
            className="hover:text-[#1c2826] transition-colors cursor-pointer"
          >
            Privacy
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => onOpenLegal?.('terms')}
            className="hover:text-[#1c2826] transition-colors cursor-pointer"
          >
            Terms
          </button>
          <span>&bull;</span>
          <button
            type="button"
            onClick={() => onOpenLegal?.('blog')}
            className="hover:text-[#1c2826] transition-colors cursor-pointer"
          >
            Blog
          </button>
        </div>
      </div>
    </footer>
  );
};
