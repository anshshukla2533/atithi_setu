// Frontend hook for making requests to our live tracking backend API
export function useLocationService() {
  const baseUrl = 'http://localhost:5000/api';

  const updateLocation = async (userId: string, location: { lat: number; lng: number }, plannedRoute?: { lat: number; lng: number }[]) => {
    try {
      const response = await fetch(`${baseUrl}/user/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, location, plannedRoute })
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating location:', error);
      return { success: false, error: 'Failed to update location' };
    }
  };

  const getUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`${baseUrl}/user/${userId}/status`);
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error getting user status:', error);
      return { success: false, error: 'Failed to get user status' };
    }
  };

  return {
    updateLocation,
    getUserStatus
  };
}