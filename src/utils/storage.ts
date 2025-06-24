import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cross-platform storage utility
export class PlatformStorage {
  private static isWeb = Platform.OS === 'web';

  static async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.isWeb) {
        // Use localStorage directly on web for better reliability
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          console.log(`[Web Storage] Saved ${key}, size: ${value.length} characters`);
        } else {
          throw new Error('localStorage not available');
        }
      } else {
        // Use AsyncStorage on mobile
        await AsyncStorage.setItem(key, value);
        console.log(`[Mobile Storage] Saved ${key}, size: ${value.length} characters`);
      }
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      throw error;
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      if (this.isWeb) {
        // Use localStorage directly on web
        if (typeof window !== 'undefined' && window.localStorage) {
          const value = window.localStorage.getItem(key);
          console.log(`[Web Storage] Loaded ${key}:`, value ? `${value.length} characters` : 'null');
          return value;
        } else {
          console.log(`[Web Storage] localStorage not available`);
          return null;
        }
      } else {
        // Use AsyncStorage on mobile
        const value = await AsyncStorage.getItem(key);
        console.log(`[Mobile Storage] Loaded ${key}:`, value ? `${value.length} characters` : 'null');
        return value;
      }
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      if (this.isWeb) {
        // Use localStorage directly on web
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          console.log(`[Web Storage] Removed ${key}`);
        }
      } else {
        // Use AsyncStorage on mobile
        await AsyncStorage.removeItem(key);
        console.log(`[Mobile Storage] Removed ${key}`);
      }
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      if (this.isWeb) {
        // Clear only our app's data on web
        if (typeof window !== 'undefined' && window.localStorage) {
          const keys = Object.keys(window.localStorage);
          keys.forEach(key => {
            if (key.startsWith('auto_battler_')) {
              window.localStorage.removeItem(key);
            }
          });
          console.log(`[Web Storage] Cleared app data`);
        }
      } else {
        // Use AsyncStorage on mobile
        await AsyncStorage.clear();
        console.log(`[Mobile Storage] Cleared all data`);
      }
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      if (this.isWeb) {
        // Get all keys from localStorage on web
        if (typeof window !== 'undefined' && window.localStorage) {
          const keys = Object.keys(window.localStorage);
          return keys.filter(key => key.startsWith('auto_battler_'));
        }
        return [];
      } else {
        // Use AsyncStorage on mobile
        const keys = await AsyncStorage.getAllKeys();
        return [...keys]; // Convert readonly array to mutable array
      }
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  static getPlatformInfo(): string {
    return this.isWeb ? 'Web (localStorage)' : `Mobile (AsyncStorage - ${Platform.OS})`;
  }
} 