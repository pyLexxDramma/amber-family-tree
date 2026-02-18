import React from 'react';

export const TopicTag: React.FC<{ tag: string; onClick?: () => void }> = ({ tag, onClick }) => (
  <button onClick={onClick} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors">
    #{tag}
  </button>
);
