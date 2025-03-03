import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';
import HomeScreen from '../screens/Homescreen';

// Mock navigation object to track navigation calls
const navigationMock = { navigate: jest.fn() };
// Mock route object to simulate passing user details as params
const routeMock = { params: { userDetails: { username: 'TestUser' } } };

// Mock UI components to avoid rendering unnecessary parts of the app
jest.mock('../BottomBar', () => 'BottomBar');
jest.mock('../Cell', () => (props) => <>{props.cellContentView}</>);
jest.mock('../TableView', () => (props) => <>{props.children}</>);
jest.mock('../Section', () => (props) => <>{props.children}</>);

describe('HomeScreen', () => {
  // Clear all mock function calls before each test to ensure test isolation
  beforeEach(() => jest.clearAllMocks());
  it('renders welcome message', () => {
    const { getByText } = render(<HomeScreen route={routeMock} navigation={navigationMock} />);
    expect(getByText('Welcome, TestUser!')).toBeTruthy();
  });
  it('navigates when a cell is pressed', () => {
    const { getByText } = render(<HomeScreen route={routeMock} navigation={navigationMock} />);
    fireEvent.press(getByText('Why Panama'));
    expect(navigationMock.navigate).toHaveBeenCalledWith('WhyPanama', { userDetails: routeMock.params.userDetails });
  });
});