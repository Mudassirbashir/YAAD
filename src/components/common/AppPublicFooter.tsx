import React from 'react';
import { Newspaper } from 'lucide-react';
import { APP_IMAGES } from '../../data/initialData';

interface AppPublicFooterProps {
  onOpenShopping?: () => void;
  onOpenRashan?: () => void;
  onOpenLegal?: (page: 'about' | 'terms' | 'privacy' | 'help' | 'blog' | 'legal' | 'features' | 'how_it_works') => void;
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
            Explore YAAD
          </h4>
          <ul className="space-y-2 text-xs text-[#556960]">
            <li>
              <a
                href="/features"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('features');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Explore YAAD features
              </a>
            </li>
            <li>
              <a
                href="/how-it-works"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('how_it_works');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                See how YAAD works
              </a>
            </li>
            <li>
              <a
                href="/about"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('about');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Learn about YAAD
              </a>
            </li>
            <li>
              <a
                href="/faq"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('help');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Read frequently asked questions
              </a>
            </li>
            <li>
              <a
                href="/rashan-list"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenRashan?.();
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block font-medium text-[#005039]"
              >
                Monthly Rashan Guide
              </a>
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
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('blog');
                }}
                className="text-[#005039] font-bold hover:underline transition-colors cursor-pointer text-left block"
              >
                Browse All Articles &rarr;
              </a>
            </li>
            <li>
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('blog');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                5 Smart Ways to Plan Monthly Rashan
              </a>
            </li>
            <li>
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('blog');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Understanding Pakistani Units
              </a>
            </li>
            <li>
              <a
                href="/blog"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('blog');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Offline Shopping in Basement Bazaars
              </a>
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
              <a
                href="/privacy"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('privacy');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('terms');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Terms of Service
              </a>
            </li>
            <li>
              <a
                href="/legal"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('legal');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Legal Information Hub
              </a>
            </li>
            <li>
              <a
                href="/help"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal?.('help');
                }}
                className="hover:text-[#005039] transition-colors cursor-pointer text-left block"
              >
                Customer Support &amp; FAQs
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#788880]">
        <p>&copy; 2026 YAAD (yaadapppk). All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="/privacy"
            onClick={(e) => {
              e.preventDefault();
              onOpenLegal?.('privacy');
            }}
            className="hover:text-[#1c2826] transition-colors cursor-pointer"
          >
            Privacy
          </a>
          <span>&bull;</span>
          <a
            href="/terms"
            onClick={(e) => {
              e.preventDefault();
              onOpenLegal?.('terms');
            }}
            className="hover:text-[#1c2826] transition-colors cursor-pointer"
          >
            Terms
          </a>
          <span>&bull;</span>
          <a
            href="/blog"
            onClick={(e) => {
              e.preventDefault();
              onOpenLegal?.('blog');
            }}
            className="hover:text-[#1c2826] transition-colors cursor-pointer"
          >
            Blog
          </a>
        </div>
      </div>
    </footer>
  );
};
