import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import CriminalCheck from '../screens/CriminalCheck';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
}));
jest.mock('./BottomBar', () => 'BottomBar');

describe('CriminalCheck', () => {
  const route = { params: { userDetails: { name: 'Test User' } } };
  beforeEach(() => jest.clearAllMocks());

  it('renders initial view when no image stored', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { getByText } = render(<CriminalCheck route={route} />);
    await waitFor(() => expect(getByText(/criminal check/)).toBeTruthy());
  });

  it('renders image view when a stored image exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(JSON.stringify({ localUri: 'test-uri' }));
    const { getByText } = render(<CriminalCheck route={route} />);
    await waitFor(() => expect(getByText(/Looking good!/)).toBeTruthy());
  });

  it('calls pickImage when gallery button is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: false, assets: [{ uri: 'gallery-uri' }] });
    const { getByText } = render(<CriminalCheck route={route} />);
    await waitFor(() => expect(getByText(/criminal check/)).toBeTruthy());
    fireEvent.press(getByText(/Pick an image from gallery/i));
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'criminal_check_photo',
        JSON.stringify({ localUri: 'gallery-uri' })
      );
    });
  });
});