import React from 'react';

export interface SocialProfile {
  name: string;
  url: string;
  handle: string;
  ariaLabel: string;
  icon: React.ReactNode;
  brandColor: string;
  badgeBg: string;
}

export const YAAD_SOCIAL_PROFILES: SocialProfile[] = [
  {
    name: 'Instagram',
    handle: '@yaadapppk',
    url: 'https://www.instagram.com/yaadapppk/',
    ariaLabel: 'Follow YAAD on Instagram (@yaadapppk)',
    brandColor: '#E4405F',
    badgeBg: 'hover:border-[#E4405F]/40 hover:bg-[#E4405F]/5',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    handle: 'yaadapppk',
    url: 'https://www.facebook.com/yaadapppk/',
    ariaLabel: 'Follow YAAD on Facebook (yaadapppk)',
    brandColor: '#1877F2',
    badgeBg: 'hover:border-[#1877F2]/40 hover:bg-[#1877F2]/5',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    handle: '@yaadapppk',
    url: 'https://www.youtube.com/@yaadapppk',
    ariaLabel: 'Subscribe to YAAD on YouTube (@yaadapppk)',
    brandColor: '#FF0000',
    badgeBg: 'hover:border-[#FF0000]/40 hover:bg-[#FF0000]/5',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    handle: '@yaadapppk',
    url: 'https://x.com/yaadapppk',
    ariaLabel: 'Follow YAAD on X / Twitter (@yaadapppk)',
    brandColor: '#0F1419',
    badgeBg: 'hover:border-neutral-900/40 hover:bg-neutral-900/5',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    handle: 'yaadapppk',
    url: 'https://www.linkedin.com/in/yaadapppk/',
    ariaLabel: 'Connect with YAAD on LinkedIn (yaadapppk)',
    brandColor: '#0A66C2',
    badgeBg: 'hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/5',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    handle: '@yaadapppk',
    url: 'https://www.tiktok.com/@yaadapppk',
    ariaLabel: 'Follow YAAD on TikTok (@yaadapppk)',
    brandColor: '#000000',
    badgeBg: 'hover:border-neutral-900/40 hover:bg-neutral-900/5',
    icon: (
      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.99v8.29c.02 2.01-.58 4.07-1.87 5.64-1.35 1.68-3.41 2.73-5.59 2.89-2.27.18-4.63-.5-6.38-1.95-1.89-1.55-2.99-3.88-2.93-6.32.06-2.5 1.34-4.87 3.38-6.3 1.95-1.37 4.49-1.86 6.82-1.32.02 1.48-.04 2.96-.04 4.44-1.29-.44-2.75-.38-3.95.23-.97.48-1.72 1.39-1.97 2.44-.31 1.25-.03 2.65.73 3.69.8 1.07 2.12 1.71 3.46 1.65 1.33-.03 2.59-.72 3.29-1.86.42-.67.62-1.48.61-2.27V.02h-1.07z" />
      </svg>
    ),
  },
];

export const FollowYaadBlock: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section
      aria-labelledby="follow-yaad-heading"
      className={`p-6 sm:p-8 rounded-3xl bg-[#FDF6E3]/40 border border-[#ddd7c3] shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#ddd7c3]/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#003527]" aria-hidden="true" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#005039]">
              Official Community &amp; Updates
            </span>
          </div>
          <h3 id="follow-yaad-heading" className="text-xl sm:text-2xl font-black text-[#003527] tracking-tight">
            Follow YAAD on Social Media
          </h3>
          <p className="text-xs sm:text-sm text-[#4a5c53] max-w-xl leading-relaxed">
            Stay updated with weekly grocery inflation trackers, monthly rashan checklists, mandi tips, and new YAAD features. Connect with us on your favourite platform:
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#003527] text-white text-xs font-bold shrink-0 shadow-2xs">
          <span>@yaadapppk</span>
        </div>
      </div>

      {/* Grid of 6 Social Profiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
        {YAAD_SOCIAL_PROFILES.map((profile) => (
          <a
            key={profile.name}
            href={profile.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={profile.ariaLabel}
            className={`p-3.5 rounded-2xl bg-white border border-[#ddd7c3] text-[#1c2826] transition-all duration-200 flex flex-col items-center justify-center gap-2 group hover:shadow-sm hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#003527] ${profile.badgeBg}`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors text-[#003527] group-hover:scale-105 transition-transform"
              style={{ color: profile.brandColor }}
            >
              {profile.icon}
            </div>
            <div className="text-center min-w-0">
              <span className="block font-bold text-xs text-[#1c2826] group-hover:text-[#003527] truncate">
                {profile.name}
              </span>
              <span className="block text-[10px] text-[#556960] truncate font-medium">
                {profile.handle}
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
