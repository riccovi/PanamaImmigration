import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';
import HomeScreen from '../screens/Homescreen';

const navigationMock = { navigate: jest.fn() };
const routeMock = { params: { userDetails: { username: 'TestUser' } } };

jest.mock('../BottomBar', () => 'BottomBar');
jest.mock('../Cell', () => (props) => <>{props.cellContentView}</>);
jest.mock('../TableView', () => (props) => <>{props.children}</>);
jest.mock('../Section', () => (props) => <>{props.children}</>);

describe('HomeScreen', () => {
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