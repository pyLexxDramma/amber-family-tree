import React from 'react';

export const BrandLogoCircle: React.FC<{ className?: string }> = ({ className }) => {
  const src = `${import.meta.env.BASE_URL}favicon.png`;
  return (
    <div className={`h-10 w-10 rounded-full overflow-hidden bg-white/60 border border-border/40 ${className ?? ''}`}>
      <img src={src} alt="" className="h-full w-full object-cover" />
    </div>
  );
};

