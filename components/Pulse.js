export default function Pulse() {
  return (
    <svg className="pulse" viewBox="0 0 400 16" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="pulsegrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FF7A66" />
          <stop offset="1" stopColor="#FFB65C" />
        </linearGradient>
      </defs>
      <path d="M0 8 H150 L162 8 168 2 176 14 184 4 190 8 H400" stroke="url(#pulsegrad)" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
