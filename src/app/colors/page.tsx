import React from 'react';
import ColorPalette from '../components/ColorPalette';

export default function ColorsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">
        <span className="text-gradient">Find a Meeting Spot</span> Color System
      </h1>
      <p className="text-center max-w-2xl mx-auto mb-12 text-neutral-700">
        Our color system is designed to be professional yet fun, creating a consistent and engaging user experience across the application.
        These colors are available as CSS variables and Tailwind classes.
      </p>
      
      <ColorPalette />
      
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">How to Use These Colors</h2>
        <div className="card max-w-2xl mx-auto text-left">
          <h3 className="text-lg font-semibold mb-2">CSS Variables</h3>
          <pre className="bg-neutral-100 p-4 rounded-md overflow-x-auto text-sm mb-6">
            {`color: var(--primary);
background-color: var(--accent);
border-color: var(--secondary);`}
          </pre>
          
          <h3 className="text-lg font-semibold mb-2">Tailwind Classes</h3>
          <pre className="bg-neutral-100 p-4 rounded-md overflow-x-auto text-sm mb-6">
            {`<div className="text-primary bg-accent border-secondary">
  Content here
</div>`}
          </pre>
          
          <h3 className="text-lg font-semibold mb-2">Custom Classes</h3>
          <pre className="bg-neutral-100 p-4 rounded-md overflow-x-auto text-sm">
            {`<button className="btn-primary">Primary Button</button>
<div className="bg-gradient-accent">Gradient Background</div>
<h2 className="text-gradient">Gradient Text</h2>`}
          </pre>
        </div>
      </div>
    </div>
  );
} 