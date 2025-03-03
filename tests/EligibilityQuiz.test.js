import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import EligibilityQuiz from '../screens/EligibilityQuiz'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// For NetInfo, simulate an event listener
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));

// Mock BottomBar to avoid rendering issues in tests
jest.mock('../BottomBar', () => 'BottomBar');

// If quizData is imported in EligibilityQuiz, you may want to mock it.
// This example assumes quizData is imported from '../quizData'
jest.mock('../quizData', () => ([
  {
    id: 1,
    question: 'What is your name?',
    type: 'text',
    points: 1,
  },
  {
    id: 4,
    question: 'What is your age?',
    type: 'number',
  },
]), { virtual: true });

describe('EligibilityQuiz Component', () => {
  const routeMock = { params: { userDetails: { name: 'Test User' } } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial question and disables the Next button when unanswered', async () => {
    // Simulate no saved progress
    AsyncStorage.getItem.mockResolvedValue(null);
    // Simulate an internet-connected state
    NetInfo.addEventListener.mockImplementationOnce(callback => {
      callback({ isInternetReachable: true });
      return () => {};
    });
    
    const { getByText, getByPlaceholderText } = render(<EligibilityQuiz route={routeMock} />);
    
    // Verify the first question is rendered (assuming first question is "What is your name?")
    await waitFor(() => {
      expect(getByText('What is your name?')).toBeTruthy();
    });
    // Verify the input for text type is rendered
    expect(getByPlaceholderText('Enter your answer')).toBeTruthy();
    // Check that the "Next" button is rendered and initially disabled
    expect(getByText('Next').props.disabled).toBeTruthy();
  });

  it('allows answering a text question and navigates to the next question', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    NetInfo.addEventListener.mockImplementationOnce(callback => {
      callback({ isInternetReachable: true });
      return () => {};
    });
    
    const { getByText, getByPlaceholderText } = render(<EligibilityQuiz route={routeMock} />);
    await waitFor(() => {
      expect(getByText('What is your name?')).toBeTruthy();
    });
    
    // Simulate entering an answer
    const textInput = getByPlaceholderText('Enter your answer');
    fireEvent.changeText(textInput, 'John Doe');
    
    // Now, the "Next" button should be enabled.
    const nextButton = getByText('Next');
    expect(nextButton.props.disabled).toBeFalsy();
    
    fireEvent.press(nextButton);
    // After pressing, the second question should render. Assuming second question is "What is your age?"
    await waitFor(() => {
      expect(getByText('What is your age?')).toBeTruthy();
    });
    
    // Verify that AsyncStorage.setItem was called to save progress
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('shows the result screen when finishing the quiz', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    NetInfo.addEventListener.mockImplementationOnce(callback => {
      callback({ isInternetReachable: true });
      return () => {};
    });
    
    const { getByText, getByPlaceholderText } = render(<EligibilityQuiz route={routeMock} />);
    // Answer first question
    await waitFor(() => {
      expect(getByText('What is your name?')).toBeTruthy();
    });
    fireEvent.changeText(getByPlaceholderText('Enter your answer'), 'John Doe');
    fireEvent.press(getByText('Next'));
    
    // Answer second question (age)
    await waitFor(() => {
      expect(getByText('What is your age?')).toBeTruthy();
    });
    fireEvent.changeText(getByPlaceholderText('Enter a number'), '25');
    
    // Since this is the last question in our mock quizData, the "Finish" button should appear.
    const finishButton = getByText('Finish');
    fireEvent.press(finishButton);
    
    // Wait for the result screen to appear (e.g., a text starting with "Your score:")
    await waitFor(() => {
      expect(getByText(/Your score:/)).toBeTruthy();
    });
  });

  it('renders YouTube video when internet is connected', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    // Simulate internet connected
    NetInfo.addEventListener.mockImplementationOnce(callback => {
      callback({ isInternetReachable: true });
      return () => {};
    });
    
    const { queryByText } = render(<EligibilityQuiz route={routeMock} />);
    
    await waitFor(() => {
      // Since internet is available, the placeholder text for no connection should not be rendered.
      expect(queryByText('Internet connection required to view the eligibility process video.')).toBeNull();
    });
  });

  it('renders placeholder text when internet is not connected', async () => {
    AsyncStorage.getItem.mockResolvedValue(null);
    // Simulate internet disconnected
    NetInfo.addEventListener.mockImplementationOnce(callback => {
      callback({ isInternetReachable: false });
      return () => {};
    });
    
    const { getByText } = render(<EligibilityQuiz route={routeMock} />);
    
    await waitFor(() => {
      expect(getByText('Internet connection required to view the eligibility process video.')).toBeTruthy();
    });
  });
});