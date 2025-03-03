import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import { Alert } from 'react-native';
import LogIn from '../screens/Login';

// Mocking expo-file-system to avoid actual file system interactions in tests
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

// Spy on Alert.alert to prevent real alert pop-ups during testing
jest.spyOn(Alert, 'alert');

describe('LogIn Component', () => {
   // Mock navigation object to simulate screen navigation
  const navigation = { navigate: jest.fn() };

  it('opens Sign Up modal when "Sign Up" button is pressed', async () => {
    const { getByText, queryByText } = render(<LogIn navigation={navigation} />); // Render the LogIn component with mock navigation
    expect(queryByText('Sign Up')).toBeNull(); // Ensure "Sign Up" modal is not visible initially
    fireEvent.press(getByText('Sign Up')); // Simulate pressing the "Sign Up" button
    await waitFor(() => expect(getByText('Sign Up')).toBeTruthy()); // Wait for the modal to appear and verify it is now rendered
  });

  it('opens Log In modal when "Log in" button is pressed', async () => {
    const { getByText, queryByText } = render(<LogIn navigation={navigation} />);
    expect(queryByText('Log In')).toBeNull();
    fireEvent.press(getByText('Log in'));
    await waitFor(() => expect(getByText('Log In')).toBeTruthy());
  });
});