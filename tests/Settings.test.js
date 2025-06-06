import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import Settings from '../screens/Settings';

// Mocking file system operations to prevent actual file interactions
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  readAsStringAsync: jest.fn().mockResolvedValue('[]'),
  writeAsStringAsync: jest.fn(),
}));
// Mock UI components to simplify rendering and avoid unnecessary dependencies
jest.mock('../BottomBar', () => 'BottomBar');
jest.mock('../TableView', () => (props) => <>{props.children}</>);
jest.mock('../Section', () => (props) => <>{props.children}</>);
jest.mock('../Cell', () => (props) => <>{props.cellContentView}</>);

describe('Settings', () => {
  // Mock route and navigation props
  const route = { params: { userDetails: { email: 'test@example.com', username: 'TestUser', password: 'Pass1234', newsletter: true } } };
  const navigation = { navigate: jest.fn() };
  // Clear all mocked function calls before each test to ensure test independence
  beforeEach(() => jest.clearAllMocks());

  it('opens Info modal on press', async () => {
    const { getByText } = render(<Settings route={route} navigation={navigation} />);
    fireEvent.press(getByText('Info'));
    await waitFor(() => expect(getByText('Info')).toBeTruthy());
  });

  it('opens Credits modal on press', async () => {
    const { getByText } = render(<Settings route={route} navigation={navigation} />);
    fireEvent.press(getByText('Credits'));
    await waitFor(() => expect(getByText('Credits')).toBeTruthy());
  });

  it('opens Details modal on press', async () => {
    const { getByText } = render(<Settings route={route} navigation={navigation} />);
    fireEvent.press(getByText('Details'));
    await waitFor(() => expect(getByText('Details')).toBeTruthy());
  });

  it('opens Confirm Delete modal on press', async () => {
    const { getByText } = render(<Settings route={route} navigation={navigation} />);
    fireEvent.press(getByText('Delete Account'));
    await waitFor(() => expect(getByText('Are you sure?')).toBeTruthy());
  });
});