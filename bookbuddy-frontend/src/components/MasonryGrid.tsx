import { ReactNode, useEffect, useState } from 'react';
import '../css/MasonryGrid.css';

interface MasonryGridProps {
  children: ReactNode[];
  columns?: number;
  gap?: number;
}

export default function MasonryGrid({ children, columns: initialColumns = 4, gap = 20 }: MasonryGridProps) {
  const [columns, setColumns] = useState(initialColumns);

  // Responsive columns
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width > 1200) {
        setColumns(initialColumns >= 4 ? 4 : initialColumns);
      } else if (width > 768) {
        setColumns(initialColumns >= 3 ? 3 : initialColumns);
      } else {
        setColumns(2);
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [initialColumns]);

  return (
    <div 
      className="masonry-grid" 
      style={{ 
        columnCount: columns,
        columnGap: `${gap}px`
      } as React.CSSProperties}
    >
      {children.map((child, index) => (
        <div key={index} className="masonry-item">
          {child}
        </div>
      ))}
    </div>
  );
}

