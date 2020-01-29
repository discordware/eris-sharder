import { EventEmitter } from "events";
import { User, Guild, Channel, Client, ClientOptions } from "eris";

declare namespace ErisSharder {
  interface Sharder extends EventEmitter {
    shardCount: number;
    firstShardID: number;
    lastShardID: number;
    clusterCount: number;
    clusterTimeout: number;
    token: string | false;
    clusters: Map<>;
    workers: Map<>;
    queue: ErisSharderQueue;
    eris: Client;
    options: {
      stats: ErisSharderStats;
    };
    statsInterval: number;
    mainFile: unknown;
    name: string;
    guildsPerShard: number;
    webhooks: {
      cluster?: unknown;
      shard?: unknown;
    };
    debug: boolean;
    clientOptions: ClientOptions;
		callbacks: Map<>;
		isMaster(): boolean;
		startStats(): void;
		executeStats(clusters: unknown[], start: number): void;
		start(clusterID: number): void;
		launch(): void;
		chunk(shards: unknown, clusterCount: number): unknown[]
		connectShards(): void;
		sendWebhook(type: string, embed): void;
		printLogo(): void;
		restartCluster(worker: unknown, code: unknown): void;
		calculateShards(): Promise<unknown>;
		fetchInfo(start: number, type: unknown, value: unknown): void;
		broadcast(start: number, message: unknown): void;
		sendTo(cluster: unknown, message: unknown): void;
  }

  interface Base {
    bot: boolean;
    clusterID: number;
    ipc: ErisSharderIPC;
    restartCluster(clusterID: number): void;
  }

  interface ErisSharderIPC extends EventEmitter {
    events: Map<string, ErisSharderEvent>;
    register(event: string, callback: Function): void;
    unregister(name: string): void;
    broadcast(name: string, message?: unknown): void;
    sendTo(cluster: number, name: string, message?: unknown): void;
    fetchUser(id: string): Promise<User>;
    fetchGuild(id: string): Promise<Guild>;
    fetchChannel(id: string): Promise<Channel>;
  }

  interface ErisSharderEvent {
    fn: (msg: unknown) => void;
  }

  interface ErisSharderStats {
    stats: {
      guilds: number;
      users: number;
      totalRam: number;
      voice: number;
      exclusiveGuilds: number;
      largeGuilds: number;
      clusters: unknown[];
    };
    clustersCounted: number;
  }
}
