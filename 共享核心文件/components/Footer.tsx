
import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-800 text-slate-400 py-6 text-center mt-12">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} 幻境之旅生成器. 由AI强力驱动.</p>
        <p className="text-sm mt-1">所有生成内容均为虚构，仅供娱乐和创意启发。</p>
      </div>
    </footer>
  );
};
