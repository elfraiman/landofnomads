import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCustomAlert } from './CustomAlert';

const AlertDemo: React.FC = () => {
  const { showAlert, AlertComponent } = useCustomAlert();

  const showSimpleAlert = () => {
    showAlert('Simple Alert', 'This is a basic alert with just an OK button.');
  };

  const showConfirmAlert = () => {
    showAlert(
      'Confirmation Alert',
      'Are you sure you want to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', style: 'default', onPress: () => showAlert('Confirmed!', 'You chose to proceed.') }
      ]
    );
  };

  const showDestructiveAlert = () => {
    showAlert(
      'Destructive Action',
      'This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => showAlert('Deleted!', 'The item has been deleted.') }
      ]
    );
  };

  const showMultiButtonAlert = () => {
    showAlert(
      'Multiple Options',
      'Choose your action:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', style: 'default', onPress: () => showAlert('Saved!', 'Your progress has been saved.') },
        { text: 'Delete', style: 'destructive', onPress: () => showAlert('Deleted!', 'Everything has been deleted.') }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎨 Custom Alert Demo</Text>

      <TouchableOpacity style={styles.button} onPress={showSimpleAlert}>
        <Text style={styles.buttonText}>Simple Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showConfirmAlert}>
        <Text style={styles.buttonText}>Confirmation Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showDestructiveAlert}>
        <Text style={styles.buttonText}>Destructive Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={showMultiButtonAlert}>
        <Text style={styles.buttonText}>Multi-Button Alert</Text>
      </TouchableOpacity>

      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0d1117',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0f6fc',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#238636',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2ea043',
  },
  buttonText: {
    color: '#f0f6fc',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AlertDemo; 