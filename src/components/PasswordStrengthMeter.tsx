import React, { useEffect, useState } from 'react';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong' | 'none';

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ 
  password, 
  className = '' 
}) => {
  const [strength, setStrength] = useState<StrengthLevel>('none');
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (!password) {
      setStrength('none');
      setScore(0);
      return;
    }

    // Calculate password strength
    let currentScore = 0;
    
    // Length check (min 8 characters)
    if (password.length >= 8) currentScore++;
    
    // Contains lowercase check
    if (/[a-z]/.test(password)) currentScore++;
    
    // Contains uppercase check
    if (/[A-Z]/.test(password)) currentScore++;
    
    // Contains number check
    if (/[0-9]/.test(password)) currentScore++;
    
    // Contains special character check
    if (/[^A-Za-z0-9]/.test(password)) currentScore++;

    setScore(currentScore);
    
    // Map score to strength level
    if (currentScore === 0) {
      setStrength('none');
    } else if (currentScore <= 2) {
      setStrength('weak');
    } else if (currentScore === 3) {
      setStrength('fair');
    } else if (currentScore === 4) {
      setStrength('good');
    } else {
      setStrength('strong');
    }
  }, [password]);

  // Color mapping for strength levels
  const getColor = (): string => {
    switch (strength) {
      case 'weak': return 'bg-red-500';
      case 'fair': return 'bg-yellow-500';
      case 'good': return 'bg-blue-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  // Text description of strength
  const getLabel = (): string => {
    switch (strength) {
      case 'weak': return 'Weak';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'strong': return 'Strong';
      default: return '';
    }
  };

  // Calculate width percentage based on score
  const getWidth = (): string => {
    if (strength === 'none') return '0%';
    return `${(score / 5) * 100}%`;
  };

  return (
    <div className={`${className} mt-1`}>
      {/* Fixed height container to prevent layout shifts */}
      <div className="h-10">
        {password && (
          <div className="space-y-1">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getColor()} transition-all duration-300 ease-in-out`} 
                style={{ width: getWidth() }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 flex justify-between">
              <span>Password strength:</span>
              <span className={`
                font-medium
                ${strength === 'weak' ? 'text-red-500' : ''}
                ${strength === 'fair' ? 'text-yellow-600' : ''}
                ${strength === 'good' ? 'text-blue-600' : ''}
                ${strength === 'strong' ? 'text-green-600' : ''}
              `}>
                {getLabel()}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter; 