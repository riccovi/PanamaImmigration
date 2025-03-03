import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import Profile from '../screens/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mocking AsyncStorage to prevent real data fetching
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
// Mocking React Navigation hooks to avoid actual navigation behavior during tests
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (effect) => effect(),
}));
// Mock BottomBar component to avoid rendering unnecessary dependencies in tests
jest.mock('../BottomBar', () => 'BottomBar');

describe('Profile', () => {
  // Mock route and navigation props
  const routeMock = { params: { userDetails: { username: 'TestUser' } } };
  const navigationMock = { navigate: jest.fn() };
  // Clear all mocked function calls before each test to ensure test independence
  beforeEach(() => jest.clearAllMocks());

  it('shows warning when no quiz data exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(null); // Simulate AsyncStorage returning no stored quiz data
    const { getByText } = render(<Profile route={routeMock} navigation={navigationMock} />); // Render the Profile component with mock navigation and route
    await waitFor(() => { // Wait for the component to render and check if the warning message is displayed
      expect(getByText('❗ Please fill out the eligibility quiz first.')).toBeTruthy();
    });
  });
  it('navigates to quiz when Start Quiz is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { getByText } = render(<Profile route={routeMock} navigation={navigationMock} />);
    await waitFor(() => {
      expect(getByText('❗ Please fill out the eligibility quiz first.')).toBeTruthy();
    });
    // Simulate pressing the "Start Quiz" button
    fireEvent.press(getByText('Start Quiz'));
    // Verify that navigation to "EligibilityQuiz" is triggered with correct user details
    expect(navigationMock.navigate).toHaveBeenCalledWith('EligibilityQuiz', { userDetails: routeMock.params.userDetails });
  });
});