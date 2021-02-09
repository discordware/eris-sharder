import Eris from "eris";
import EventEmitter from "events"

type Callback = (...args: any[]) => void;

interface ShardStats {
  id: number;
  ready: boolean;
  latency: number;
  status: "disconnected" | "connecting" | "handshaking" | "ready" | "resuming";
}

interface ClusterStatsInfo {
  guilds: number;
  users: number;
  totalRam: number;
  voice: number;
  exclusiveGuilds: number;
  largeGuilds: number;
  clusters: ClusterDataStats[];
}

interface ClusterDataStats extends Exclude<ClusterStatsInfo, "totalRam" | "clusters"> {
  cluster: number;
  shards: number;
  ram: number;
  uptime: number;
  shardStats: ShardStats;
}

interface ClusterStats {
  stats: ClusterStatsInfo;
  clustersCounted: number;
}

interface ClusterData {
  item: number;
  value: {
    id: number;
    clusterCount: number;
    name: string;
    firstShardID: number;
    lastShardID: number;
    maxShards: number;
    token: string;
    file: string;
    clientOptions: Eris.ClientOptions;
  }
}

interface ClusterMap {
  workerID: number;
  firstShardID: number;
  lastShardID: number;
}

interface Webhook {
  id: string;
  token: string;
}

interface Webhooks {
  shard?: Webhook;
  cluster?: Webhook;
}

interface ClusterManagerOptions {
  shards?: number;
  firstShardID?: number;
  lastShardID?: number;
  clusters?: number;
  clusterTimeout?: number;
  stats?: boolean;
  debug?: boolean;
  statsInterval?: number;
  name?: string;
  guildsPerShard?: number;
  webhooks?: Webhooks;
  clientOptions: Eris.ClientOptions;
}

declare class IPC extends EventEmitter {
  events: Map<string, { fn: Callback }>;
  register(event: string, callback: Callback): void;
  unregister(name: string): void;
  broadcast(name: string, message?: any): void;
  sendTo(cluster: number, name: string, message?: any): void;
  fetchUser(id: string): Promise<Eris.User>;
  fetchGuild(id: string): Promise<Eris.Guild>;
  fetchChannel(id: string): Promise<Eris.AnyChannel>;
  fetchMember(guildID: string, memberID: string): Promise<Eris.Member>;
}

declare class Cluster<T extends Base, C extends Eris.Client> {
  shards: number;
  maxShards: number;
  firstShardID: number;
  lastShardID: number;
  mainFile: string | null;
  clusterID: number;
  clusterCount: number;
  guilds: number;
  users: number;
  uptime: number;
  exclusiveGuilds: number;
  largeGuilds: number;
  voiceChannels: number;
  shardsStats: ShardStats[];
  app: T | null;
  bot: C;
  test: boolean;
  ipc: IPC;
  logOverride(message: unknown): string;
  spawn(): void;
  connect(firstShardID: number, lastShardID: number, maxShards: number, token: string, type: "connect" | "reconnect", clientOptions: Eris.ClientOptions): void;
  loadCode(bot: C): void;
  startsStats(bot: C): void;
}

class Queue extends EventEmitter {
  queue: ClusterData[];
  executeQueue(): void;
  queueItem(item: ClusterData): void;
}

declare class ClusterManager extends EventEmitter {
  shardCount: number | "auto";
  firstShardID: number;
  lastShardID: number;
  clusterCount: number;
  clusterTimeout: number;
  token: string | false;
  clusters: Map<number, ClusterMap>;
  workers: Map<number, number>;
  queue: Queue;
  callbacks: Map<string, string>;
  options: { stats: boolean; debug: boolean };
  statsInterval: number;
  mainFile: string;
  name: string;
  guildsPerShard: number;
  webhooks: Webhooks;
  clientOptions: Eris.ClientOptions;
  status: ClusterStats;
  eris: Eris.Client;
  constructor(token: string, mainFile: string, options: ClusterManagerOptions);
  isMaster(): boolean;
  startStats(): void;
  executeStats(clusters: [string, Worker][], start: number): void;
  start(clusterID: number): void;
  launch(): void;
  chunk(shards: number[], clusterCount: number): number[][];
  connectShards(): void;
  sendWebhook(type: "shard" | "cluster", embed: Eris.EmbedOptions): void;
  printLogo(): void;
  restartCluster(worker: Worker, code: number): void;
  calculateShards(): Promise<number>;
  fetchInfo(start: number, type: string, value: any): void;
  broadcast(start: number, message: any): void;
  sendTo(cluster: number, message: any): void;
}

declare module "eris-sharder" {
  export const Master: typeof ClusterManager;

  class Base {
    bot: Eris.Client;
    clusterID: number;
    ipc: IPC;
    constructor(setup: { bot: Eris.Client; clusterID: number; ipc: IPC });
    restartCluster(clusterID: number): void;
    abstract launch(): any;
  }
}
