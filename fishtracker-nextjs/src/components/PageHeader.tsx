// fishtracker-nextjs/src/components/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <div className="bg-blue-600 p-4 shadow-md">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
    </div>
  );
};

export default PageHeader;
