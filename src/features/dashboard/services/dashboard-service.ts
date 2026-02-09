export interface DashboardStats {
  activeSessions: number;
  apiCallsToday: number;
  successRate: number;
}

export interface ConnectionStatus {
  phone: string;
  sessionExpiresIn: string;
  isConnected: boolean;
}

// Mock data — swap with real API calls later
export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    activeSessions: 12,
    apiCallsToday: 2847,
    successRate: 98.5,
  };
}

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  return {
    phone: "+966 **** 1234",
    sessionExpiresIn: "23h",
    isConnected: true,
  };
}
