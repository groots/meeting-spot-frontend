'use client';

import { useState } from 'react';
import {
  UtensilsCrossedIcon,
  CoffeeIcon,
  BeerIcon,
  BuildingIcon,
  LandmarkIcon,
  TreesIcon,
  BookIcon,
  MoreHorizontalIcon
} from 'lucide-react';

// Define location types with icons and descriptions
const locationTypes = [
  {
    key: "Restaurant / Food",
    icon: UtensilsCrossedIcon,
    label: "Restaurant",
    description: "A food establishment serving sit-down meals"
  },
  {
    key: "Cafe",
    icon: CoffeeIcon,
    label: "Cafe",
    description: "A place primarily serving coffee and light refreshments"
  },
  {
    key: "Bar",
    icon: BeerIcon,
    label: "Bar",
    description: "A place serving alcoholic beverages"
  },
  {
    key: "Meeting Space",
    icon: BuildingIcon,
    label: "Meeting Space",
    description: "A shared office or meeting room"
  },
  {
    key: "Hotel",
    icon: LandmarkIcon,
    label: "Hotel",
    description: "Accommodation with meeting facilities"
  },
  {
    key: "Park",
    icon: TreesIcon,
    label: "Park",
    description: "An outdoor recreational area or garden"
  },
  {
    key: "Library",
    icon: BookIcon,
    label: "Library",
    description: "A quiet public space with study areas"
  },
  {
    key: "Other",
    icon: MoreHorizontalIcon,
    label: "Other",
    description: "Any other type of meeting location"
  }
];

interface LocationTypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
  disabled?: boolean;
}

export default function LocationTypeSelector({
  selectedType,
  onChange,
  disabled = false
}: LocationTypeSelectorProps) {

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {locationTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = type.key === selectedType;

          return (
            <button
              key={type.key}
              type="button"
              onClick={() => onChange(type.key)}
              disabled={disabled}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors
                ${isSelected
                  ? 'border-lime-500 bg-lime-50 text-lime-700'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-lime-600' : 'text-gray-500'}`} />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* Description of selected type */}
      {selectedType && (
        <p className="text-sm text-gray-500 mt-2">
          {locationTypes.find(t => t.key === selectedType)?.description}
        </p>
      )}
    </div>
  );
}
