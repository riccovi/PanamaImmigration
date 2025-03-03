import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import CriminalCheck from '../screens/CriminalCheck';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

// Mock AsyncStorage to prevent actual storage operations during testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(), 
  setItem: jest.fn(), 
  removeItem: jest.fn(), 
}));
// Mock ImagePicker to prevent real device interactions
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(), 
  launchImageLibraryAsync: jest.fn(), 
  requestCameraPermissionsAsync: jest.fn(), 
  launchCameraAsync: jest.fn(), 
  MediaTypeOptions: { Images: 'Images' }, 
}));
// Mock BottomBar component to avoid rendering unnecessary dependencies in tests
jest.mock('./BottomBar', () => 'BottomBar');

describe('CriminalCheck', () => {
  // Define a mock route with user details
  const route = { params: { userDetails: { name: 'Test User' } } };
  // Clear all mocked function calls before each test to ensure test independence
  beforeEach(() => jest.clearAllMocks());

  // Simulate no stored image in AsyncStorage
  it('renders initial view when no image stored', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { getByText } = render(<CriminalCheck route={route} />); 
    await waitFor(() => expect(getByText(/criminal check/)).toBeTruthy());
  });
  // Simulate a previously stored image in AsyncStorage
  it('renders image view when a stored image exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ localUri: 'test-uri' }));
    const { getByText } = render(<CriminalCheck route={route} />);
    await waitFor(() => expect(getByText(/Looking good!/)).toBeTruthy());
  });

  it('calls pickImage when gallery button is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue(null); // Simulate no stored image initially
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true }); // Simulate user granting permission to access the gallery
    // Simulate user selecting an image from the gallery
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'gallery-uri' }] });
    const { getByText } = render(<CriminalCheck route={route} />);
    await waitFor(() => expect(getByText(/criminal check/)).toBeTruthy());
    // Simulate a press event on the "Pick an image from gallery" button
    fireEvent.press(getByText(/Pick an image from gallery/i));
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'criminal_check_photo',
        JSON.stringify({ localUri: 'gallery-uri' })
      );
    });
  });
});