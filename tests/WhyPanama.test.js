import React from 'react';
import { render, waitFor } from 'react-native-testing-library';
import WhyPanama from '../screens/WhyPanama';

global.prosAndConsData = [
  { type: "Pros", content: ["Good weather"] },
  { type: "Cons", content: ["High humidity"] },
];

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  getCurrentPositionAsync: () => Promise.resolve({ coords: { latitude: 0, longitude: 0 } }),
}));
jest.mock('expo-sensors', () => ({
  Accelerometer: { addListener: () => ({ remove: jest.fn() }) },
}));
jest.mock('../BottomBar', () => 'BottomBar');

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({
      weather: [{ icon: '01d', description: 'clear sky' }],
      main: { temp: 25, humidity: 50 },
      wind: { speed: 3 }
    }),
  })
);

describe('WhyPanama', () => {
  const route = { params: { userDetails: { username: 'TestUser' } } };
  it('renders weather, time, and pros & cons sections', async () => {
    const { getByText } = render(<WhyPanama route={route} />);
    await waitFor(() => {
      expect(getByText(/Your current weather/)).toBeTruthy();
      expect(getByText('Panama City')).toBeTruthy();
      expect(getByText(/Shake for next!/)).toBeTruthy();
    });
  });
});