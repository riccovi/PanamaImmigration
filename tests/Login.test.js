import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import { Alert } from 'react-native';
import LogIn from '../screens/Login';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: false }),
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

describe('LogIn Component', () => {
  const navigation = { navigate: jest.fn() };

  it('opens Sign Up modal when "Sign Up" button is pressed', async () => {
    const { getByText, queryByText } = render(<LogIn navigation={navigation} />);
    expect(queryByText('Sign Up')).toBeNull();
    fireEvent.press(getByText('Sign Up'));
    await waitFor(() => expect(getByText('Sign Up')).toBeTruthy());
  });

  it('opens Log In modal when "Log in" button is pressed', async () => {
    const { getByText, queryByText } = render(<LogIn navigation={navigation} />);
    expect(queryByText('Log In')).toBeNull();
    fireEvent.press(getByText('Log in'));
    await waitFor(() => expect(getByText('Log In')).toBeTruthy());
  });
});