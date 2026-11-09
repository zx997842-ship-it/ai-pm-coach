import { Link } from 'react-router-dom';

export default function BrandLogo({ className = '' }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-deep-navy-600 flex items-center justify-center shadow-soft">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-semibold text-[15px] text-ink-900 tracking-tight">AI PM Coach</span>
        <span className="text-[11px] text-ink-500 mt-0.5">能力诊断 · 精准补短板</span>
      </div>
    </Link>
  );
}
