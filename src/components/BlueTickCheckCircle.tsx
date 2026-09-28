import React from 'react';
import { CelebrationCheckbox, CelebrationCheckboxProps } from './CelebrationCheckbox';

export interface BlueTickCheckCircleProps extends CelebrationCheckboxProps {}

/**
 * Re-exports the user's celebration completion checkmark for backwards compatibility.
 */
export const BlueTickCheckCircle: React.FC<BlueTickCheckCircleProps> = (props) => {
  return <CelebrationCheckbox {...props} />;
};

export { CelebrationCheckbox };
