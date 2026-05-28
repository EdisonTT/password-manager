export interface ElectronAPI {
  exportVault: (data: string) => Promise<{ success: boolean; error?: string }>;
  importVault: () => Promise<{ success: boolean; data?: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
