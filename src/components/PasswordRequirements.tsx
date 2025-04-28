import React from 'react';
import { getPasswordRequirements } from '@/app/utils/validation';

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ 
  password,
  className = '' 
}) => {
  const requirements = getPasswordRequirements();
  
  // These regex patterns match the validation in the validatePassword function
  const requirementsMet = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  return (
    <div className={`text-xs mt-2 ${className}`}>
      <p className="font-medium mb-1 text-gray-600">Password requirements:</p>
      <ul className="space-y-1">
        <li className={`flex items-center ${requirementsMet.length ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{requirementsMet.length ? '✓' : '○'}</span>
          {requirements[0]}
        </li>
        <li className={`flex items-center ${requirementsMet.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{requirementsMet.uppercase ? '✓' : '○'}</span>
          {requirements[1]}
        </li>
        <li className={`flex items-center ${requirementsMet.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{requirementsMet.lowercase ? '✓' : '○'}</span>
          {requirements[2]}
        </li>
        <li className={`flex items-center ${requirementsMet.number ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{requirementsMet.number ? '✓' : '○'}</span>
          {requirements[3]}
        </li>
        <li className={`flex items-center ${requirementsMet.special ? 'text-green-600' : 'text-gray-500'}`}>
          <span className="mr-1">{requirementsMet.special ? '✓' : '○'}</span>
          {requirements[4]}
        </li>
      </ul>
    </div>
  );
};

export default PasswordRequirements; 