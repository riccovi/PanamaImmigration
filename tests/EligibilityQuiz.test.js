import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import EligibilityQuiz from '../screens/EligibilityQuiz';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mock AsyncStorage to prevent real storage operations
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));
// Mock NetInfo to prevent actual network calls
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));
// Mock BottomBar component to avoid rendering unnecessary dependencies in tests
jest.mock('../BottomBar', () => 'BottomBar');
// Mock quizData to provide test questions instead of using real quiz data
jest.mock('../quizData', () => ([
  { id: 1, question: 'What is your name?', type: 'text' },
  { id: 4, question: 'What is your age?', type: 'number' },
]), { virtual: true });

describe('EligibilityQuiz', () => {
  // Define a mock route with user details
  const route = { params: { userDetails: { name: 'Test User' } } };
  // Clear all mocked function calls before each test to ensure test independence
  beforeEach(() => jest.clearAllMocks());

  it('renders initial question with disabled Next button', async () => {
    // Simulate no stored quiz progress in AsyncStorage
    AsyncStorage.getItem.mockResolvedValue(null); 
    // Simulate a network connection being available
    NetInfo.addEventListener.mockImplementationOnce(cb => { cb({ isInternetReachable: true }); return () => {}; }); 
    const { getByText, getByPlaceholderText } = render(<EligibilityQuiz route={route} />);
    await waitFor(() => expect(getByText('What is your name?')).toBeTruthy());
    expect(getByPlaceholderText('Enter your answer')).toBeTruthy();
    expect(getByText('Next').props.disabled).toBeTruthy();
  });


  it('allows answering and navigates to the next question', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    NetInfo.addEventListener.mockImplementationOnce(cb => { cb({ isInternetReachable: true }); return () => {}; });
    const { getByText, getByPlaceholderText } = render(<EligibilityQuiz route={route} />);
    await waitFor(() => expect(getByText('What is your name?')).toBeTruthy());
    // Simulate entering an answer in the input field
    fireEvent.changeText(getByPlaceholderText('Enter your answer'), 'John Doe');
    // Verify that the "Next" button is now enabled
    expect(getByText('Next').props.disabled).toBeFalsy();
    // Simulate pressing the "Next" button
    fireEvent.press(getByText('Next'));
    // Wait for and verify that the second question appears
    await waitFor(() => expect(getByText('What is your age?')).toBeTruthy());
  });

  it('shows result screen when finishing the quiz', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    NetInfo.addEventListener.mockImplementationOnce(cb => { cb({ isInternetReachable: true }); return () => {}; });
    const { getByText, getByPlaceholderText } = render(<EligibilityQuiz route={route} />);
    await waitFor(() => expect(getByText('What is your name?')).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText('Enter your answer'), 'John Doe');
    fireEvent.press(getByText('Next'));
    await waitFor(() => expect(getByText('What is your age?')).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText('Enter a number'), '25');
    // Simulate pressing the "Finish" button to complete the quiz
    fireEvent.press(getByText('Finish'));
    // Wait for and verify that the result screen appears
    await waitFor(() => expect(getByText(/Your score:/)).toBeTruthy());
  });
});