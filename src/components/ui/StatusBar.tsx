import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

interface StatusBarProps {
  title: string;
  value: string;
  valueColor?: string;
  percentage: number;
  fillColor: string;
  bottomText?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  title,
  value,
  valueColor = Colors.text,
  percentage,
  fillColor,
  bottomText
}) => {
  return (
    <View style={styles.sectionCompact}>
      <View style={styles.statusHeaderCompact}>
        <Text style={styles.sectionTitleCompact}>{title}</Text>
        <Text style={[styles.statusValueCompact, { color: valueColor }]}>
          {value}
        </Text>
      </View>

      <View style={styles.statusBarWrapper}>
        <View style={styles.statusBarBackgroundCompact}>
          <View
            style={[
              styles.statusBarFillCompact,
              {
                width: `${Math.max(0, Math.min(100, percentage))}%`,
                backgroundColor: fillColor
              }
            ]}
          />
        </View>
        {bottomText && (
          <Text style={styles.statusPercentageCompact}>
            {bottomText}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCompact: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,

    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleCompact: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statusValueCompact: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBarWrapper: {
    gap: 4,
  },
  statusBarBackgroundCompact: {
    height: 12,
    backgroundColor: Colors.background,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusBarFillCompact: {
    height: '100%',
    borderRadius: 6,
  },
  statusPercentageCompact: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
}); 