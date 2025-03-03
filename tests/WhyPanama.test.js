import React from 'react';
import { render, waitFor } from 'react-native-testing-library';
import WhyPanama from '../screens/WhyPanama';

// Global variable storing Pros and Cons data used in the WhyPanama screen.
global.prosAndConsData = [
  { type: "Pros", content: ["Good weather"] },
  { type: "Cons", content: ["High humidity"] },
];

// Mocking Expo Location API to prevent actual device location access.
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: () => Promise.resolve({ status: 'granted' }),
  getCurrentPositionAsync: () => Promise.resolve({ coords: { latitude: 0, longitude: 0 } }),
}));
// Mocking Expo Sensors API to prevent real accelerometer interaction.
jest.mock('expo-sensors', () => ({
  Accelerometer: { addListener: () => ({ remove: jest.fn() }) },
}));
// Mock BottomBar component to avoid rendering unnecessary dependencies in tests
jest.mock('../BottomBar', () => 'BottomBar');
// Mocking the global fetch function to return weather data without making real network requests.
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
  // Mocking route parameters to pass user details.
  const route = { params: { userDetails: { username: 'TestUser' } } }; 
  it('renders weather, time, and pros & cons sections', async () => {
    const { getByText } = render(<WhyPanama route={route} />); // Render the WhyPanama screen with mock route parameters.
    await waitFor(() => { // Wait for the content to load and verify that key UI elements are displayed.
      expect(getByText(/Your current weather/)).toBeTruthy();
      expect(getByText('Panama City')).toBeTruthy();
      expect(getByText(/Shake for next!/)).toBeTruthy();
    });
  });
});