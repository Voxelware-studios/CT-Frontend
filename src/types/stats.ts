export interface StatsOverview {
  totalServers: number;
  activeServers: number;
  recordServers: number;
  totalPlayers: number;
  recordPlayers: number;
}

export interface HistoryPoint {
  date: string;
  count: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface PlatformStats {
  serverSoftware: DistributionItem[];
  minecraftVersion: DistributionItem[];
  javaVersion: DistributionItem[];
  coretuffVersion: DistributionItem[];
}

export interface ModuleStats {
  modules: DistributionItem[];
}

export interface IntegrationStats {
  integrations: DistributionItem[];
}

export interface EnvironmentStats {
  onlineMode: DistributionItem[];
  foliaDistribution: DistributionItem[];
}
