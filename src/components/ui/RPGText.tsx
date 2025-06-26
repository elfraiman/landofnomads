import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { RPGTextStyles, Typography } from '../../utils/colors';

// Custom Text component that uses RPG typography by default
interface RPGTextProps extends TextProps {
  variant?: keyof typeof RPGTextStyles;
  children: React.ReactNode;
}

export const RPGText: React.FC<RPGTextProps> = ({ 
  variant = 'body', 
  style, 
  children, 
  ...props 
}) => {
  const baseStyle: TextStyle = {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.normal,
  };

  const variantStyle = variant ? RPGTextStyles[variant] : {};
  
  const combinedStyle = [
    baseStyle,
    variantStyle,
    style
  ];

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};

export default RPGText; 