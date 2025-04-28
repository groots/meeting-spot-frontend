import React from 'react';

interface ColorSampleProps {
  color: string;
  name: string;
  hex: string;
}

const ColorSample: React.FC<ColorSampleProps> = ({ color, name, hex }) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-16 h-16 rounded-full mb-2 shadow-md`}
        style={{ backgroundColor: hex }}
      />
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-neutral-600">{hex}</p>
    </div>
  );
};

const ColorPalette: React.FC = () => {
  return (
    <div className="card my-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Color Palette</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            <ColorSample color="bg-primary" name="Primary" hex="#5a55a6" />
            <ColorSample color="bg-primary-hover" name="Primary Hover" hex="#4a4591" />
            <ColorSample color="bg-secondary" name="Secondary" hex="#b87ebb" />
            <ColorSample color="bg-secondary-hover" name="Secondary Hover" hex="#a76eaa" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Accent Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            <ColorSample color="bg-accent" name="Accent" hex="#02de7a" />
            <ColorSample color="bg-accent-hover" name="Accent Hover" hex="#00c46c" />
            <ColorSample color="bg-purple-light" name="Purple Light" hex="#b87ebb" />
            <ColorSample color="bg-green-light" name="Green Light" hex="#71e9a2" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Utility Colors</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
            <ColorSample color="bg-error" name="Error" hex="#e74c3c" />
            <ColorSample color="bg-success" name="Success" hex="#27ae60" />
            <ColorSample color="bg-warning" name="Warning" hex="#f39c12" />
            <ColorSample color="bg-info" name="Info" hex="#3498db" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Neutral Colors</h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
            <ColorSample color="bg-neutral-100" name="Neutral 100" hex="#f8f9fa" />
            <ColorSample color="bg-neutral-300" name="Neutral 300" hex="#dee2e6" />
            <ColorSample color="bg-neutral-500" name="Neutral 500" hex="#adb5bd" />
            <ColorSample color="bg-neutral-700" name="Neutral 700" hex="#495057" />
            <ColorSample color="bg-neutral-900" name="Neutral 900" hex="#212529" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Gradient Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-primary text-white p-4 rounded-lg text-center">
              Primary Gradient
            </div>
            <div className="bg-gradient-secondary text-white p-4 rounded-lg text-center">
              Secondary Gradient
            </div>
            <div className="bg-gradient-accent text-white p-4 rounded-lg text-center">
              Accent Gradient
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Button Examples</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-accent">Accent Button</button>
            <button className="btn-outline">Outline Button</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPalette;
