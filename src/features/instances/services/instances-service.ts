import { api } from "@/lib/api-client";
import type { Instance } from "../types";

export async function getMyInstances(): Promise<Instance[]> {
  return api.get<Instance[]>("/api/v1/instances/me");
}

export async function getCurrentInstance(): Promise<Instance> {
  return api.get<Instance>("/api/v1/instances/me/current");
}

export async function getInstance(id: string): Promise<Instance> {
  return api.get<Instance>(`/api/v1/instances/${id}`);
}

export async function createInstance(): Promise<Instance> {
  return api.post<Instance>("/api/v1/instances");
}

export async function updateInstance(
  id: string,
  data: { name: string }
): Promise<Instance> {
  return api.put<Instance>(`/api/v1/instances/${id}`, data);
}

export async function deleteInstance(id: string): Promise<void> {
  return api.delete<void>(`/api/v1/instances/${id}`);
}

export async function rotateApiKey(): Promise<{ apiKey: string }> {
  return api.post<{ apiKey: string }>("/api/v1/api-keys/rotate");
}
