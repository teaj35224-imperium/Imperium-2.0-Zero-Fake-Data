import React from 'react';

export const BinaryBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{
        background: 'radial-gradient(circle at 50% 12%, rgba(197,160,89,0.035) 0%, transparent 65%), linear-gradient(180deg, #0D0D0E 0%, #111113 50%, #0A0A0B 100%)'
      }}
    />
  );
};
