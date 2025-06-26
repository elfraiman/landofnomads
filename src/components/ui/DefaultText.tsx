import React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import { DefaultTextStyle } from '../../utils/colors';

// Enhanced Text component that uses our RPG typography by default
export const Text: React.FC<TextProps> = ({ style, ...props }) => {
  const combinedStyle = [DefaultTextStyle, style];
  
  return <RNText style={combinedStyle} {...props} />;
};

export default Text; 