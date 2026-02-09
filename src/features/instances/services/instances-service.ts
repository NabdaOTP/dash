import type { Instance } from "../types";

// Mock data — swap with real API calls later
const mockInstances: Instance[] = [
  {
    id: "1",
    name: "Production OTP",
    status: "active",
    apiKey: "ndb_live_sk_7f8a9b2c3d4e5f6g",
    token: "tok_live_abc123def456",
    apiId: "api_prod_001",
    createdAt: "2025-01-15",
    otpSent: 12500,
    otpVerified: 12300,
  },
  {
    id: "2",
    name: "Staging Environment",
    status: "active",
    apiKey: "ndb_test_sk_1a2b3c4d5e6f7g8h",
    token: "tok_test_xyz789ghi012",
    apiId: "api_stg_002",
    createdAt: "2025-02-01",
    otpSent: 450,
    otpVerified: 440,
  },
  {
    id: "3",
    name: "Mobile App",
    status: "inactive",
    apiKey: "ndb_live_sk_9h8g7f6e5d4c3b2a",
    token: "tok_live_mno345pqr678",
    apiId: "api_mob_003",
    createdAt: "2025-01-28",
    otpSent: 8200,
    otpVerified: 8100,
  },
  {
    id: "4",
    name: "Legacy System",
    status: "error",
    apiKey: "ndb_live_sk_0z9y8x7w6v5u4t3s",
    token: "tok_live_stu901vwx234",
    apiId: "api_leg_004",
    createdAt: "2024-11-20",
    otpSent: 3200,
    otpVerified: 2900,
  },
];

export async function getInstances(): Promise<Instance[]> {
  return mockInstances;
}

export async function getInstance(id: string): Promise<Instance | undefined> {
  return mockInstances.find((i) => i.id === id);
}

export async function deleteInstance(id: string): Promise<void> {
  // TODO: API call
  console.log("Delete instance:", id);
}
