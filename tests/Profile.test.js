import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import Profile from '../screens/Profile';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: (effect) => effect(),
}));
jest.mock('../BottomBar', () => 'BottomBar');

describe('Profile', () => {
  const routeMock = { params: { userDetails: { username: 'TestUser' } } };
  const navigationMock = { navigate: jest.fn() };
  beforeEach(() => jest.clearAllMocks());
  it('shows warning when no quiz data exists', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { getByText } = render(<Profile route={routeMock} navigation={navigationMock} />);
    await waitFor(() => {
      expect(getByText('❗ Please fill out the eligibility quiz first.')).toBeTruthy();
    });
  });
  it('navigates to quiz when Start Quiz is pressed', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    const { getByText } = render(<Profile route={routeMock} navigation={navigationMock} />);
    await waitFor(() => {
      expect(getByText('❗ Please fill out the eligibility quiz first.')).toBeTruthy();
    });
    fireEvent.press(getByText('Start Quiz'));
    expect(navigationMock.navigate).toHaveBeenCalledWith('EligibilityQuiz', { userDetails: routeMock.params.userDetails });
  });
});