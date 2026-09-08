import React, { useEffect, useRef, useState } from 'react';

interface GrowingTreeProps {
  size?: number;
  delay?: number;
  className?: string;
  variant?: 'emerald' | 'lime' | 'pink';
}

const CANOPY_COLORS: Record<NonNullable<GrowingTreeProps['variant']>, [string, string, string]> = {
  emerald: ['#059669', '#10B981', '#34D399'],
  lime: ['#4D7C0F', '#84CC16', '#A3E635'],
  pink: ['#BE185D', '#E81A7F', '#FF6FB0'],
};

// Decorative "cây mọc lên" accent: the trunk draws itself upward, then the
// canopy springs in — plays once, the first time it scrolls into view.
export const GrowingTree: React.FC<GrowingTreeProps> = ({
  size = 56,
  delay = 0,
  className = '',
  variant = 'emerald',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const [c1, c2, c3] = CANOPY_COLORS[variant];

  return (
    <div ref={ref} className={`inline-block ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 80" width={size} height={size} fill="none" aria-hidden="true">
        <path
          d="M32 78 L32 32"
          stroke="#8B5E34"
          strokeWidth={5}
          strokeLinecap="round"
          style={{
            strokeDasharray: 46,
            strokeDashoffset: inView ? 0 : 46,
            transition: `stroke-dashoffset 900ms ease-out ${delay}ms`,
          }}
        />
        <g
          style={{
            transformOrigin: '32px 26px',
            transform: inView ? 'scale(1) translateY(0px)' : 'scale(0) translateY(8px)',
            opacity: inView ? 1 : 0,
            transition: `transform 650ms cubic-bezier(0.34,1.56,0.64,1) ${delay + 780}ms, opacity 400ms ease ${delay + 780}ms`,
          }}
        >
          <circle cx="32" cy="20" r="16" fill={c2} />
          <circle cx="18" cy="30" r="11" fill={c1} />
          <circle cx="46" cy="30" r="11" fill={c3} />
        </g>
      </svg>
    </div>
  );
};
