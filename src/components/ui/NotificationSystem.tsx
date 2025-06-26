import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { Colors, ColorUtils, RPGTextStyles } from '../../utils/colors';

const { width: screenWidth } = Dimensions.get('window');

export interface Notification {
  id: string;
  type: 'item_drop' | 'level_up' | 'achievement' | 'warning' | 'success' | 'info' | 'death';
  title: string;
  message: string;
  duration?: number; // in milliseconds, default 4000
  itemDetails?: {
    name: string;
    level: number;
    rarity: string;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const NotificationItem: React.FC<{
  notification: Notification;
  onDismiss: (id: string) => void;
  index: number;
}> = ({ notification, onDismiss, index }) => {
  const [slideAnim] = useState(new Animated.Value(screenWidth));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      dismissNotification();
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, []);

  const dismissNotification = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(notification.id);
    });
  };

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'item_drop':
        return {
          backgroundColor: Colors.primaryDark,
          borderLeftColor: getRarityColor(notification.itemDetails?.rarity || 'common'),
          borderLeftWidth: 4,
        };
      case 'level_up':
        return {
          backgroundColor: Colors.surface,
          borderLeftColor: Colors.experience,
          borderLeftWidth: 4,
        };
      case 'achievement':
        return {
          backgroundColor: Colors.surface,
          borderLeftColor: Colors.gold,
          borderLeftWidth: 4,
        };
      case 'success':
        return {
          backgroundColor: Colors.surface,
          borderLeftColor: Colors.success,
          borderLeftWidth: 4,
        };
      case 'warning':
        return {
          backgroundColor: Colors.surface,
          borderLeftColor: Colors.warning,
          borderLeftWidth: 4,
        };
      case 'death':
        return {
          backgroundColor: Colors.surface,
          borderLeftColor: Colors.error,
          borderLeftWidth: 4,
        };
      case 'info':
      default:
        return {
          backgroundColor: Colors.surface,
          borderLeftColor: Colors.primary,
          borderLeftWidth: 4,
        };
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return '#9CA3AF';
      case 'uncommon': return '#10B981';
      case 'rare': return '#3B82F6';
      case 'epic': return '#8B5CF6';
      case 'legendary': return '#F59E0B';
      default: return '#9CA3AF';
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'item_drop': return '!';
      case 'level_up': return '+';
      case 'achievement': return '*';
      case 'success': return '✓';
      case 'warning': return '!';
      case 'death': return 'X';
      case 'info': return 'i';
      default: return '!';
    }
  };

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        getNotificationStyle(),
        {
          top: 60 + (index * 90), // Stack notifications
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.notificationContent}
        onPress={dismissNotification}
        activeOpacity={0.9}
      >
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getNotificationIcon()}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>

          {notification.itemDetails && (
            <View style={styles.itemDetailsContainer}>
              <Text style={[styles.itemName, { color: getRarityColor(notification.itemDetails.rarity) }]}>
                {notification.itemDetails.name}
              </Text>
              <Text style={styles.itemLevel}>
                (Level {notification.itemDetails.level})
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={dismissNotification}
        >
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onDismiss
}) => {
  const hasNotifications = notifications.length > 0;

  return (
    <Modal
      visible={hasNotifications}
      transparent={true}
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.container} pointerEvents="box-none">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
            index={index}
          />
        ))}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    pointerEvents: 'box-none',
  },
  notificationContainer: {
    position: 'absolute',
    right: 16,
    left: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...RPGTextStyles.body,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: '700',
  },
  message: {
    ...RPGTextStyles.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  itemDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  itemName: {
    ...RPGTextStyles.bodySmall,
    marginRight: 8,
    fontWeight: '700',
  },
  itemLevel: {
    ...RPGTextStyles.caption,
    color: Colors.textSecondary,
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dismissText: {
    ...RPGTextStyles.body,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
}); 