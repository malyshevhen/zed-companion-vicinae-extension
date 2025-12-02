import { homedir } from "os";
import { join } from "path";

export interface ZedPaths {
  executable: readonly string[];
  database: readonly string[];
}

export const ZED_PATHS: ZedPaths = {
  executable: [
    join(homedir(), ".local", "bin", "zed"),
    "/usr/bin/zed",
    "/usr/local/bin/zed",
    join(homedir(), "bin", "zed"),
  ],
  database: [
    join(homedir(), ".local", "share", "zed", "db", "0-stable", "db.sqlite"),
    join(homedir(), ".local", "share", "zed", "db", "0-global", "db.sqlite"),
    join(homedir(), ".local", "share", "zed", "db", "0-preview", "db.sqlite"),
    join(homedir(), ".config", "zed", "db"), // legacy path
  ],
} as const;

export const DEFAULT_DB_VERSION = 28;

export const CACHE_KEYS = {
  defaultDbVersion: "defaultDbVersion",
  pinnedEntries: "pinnedEntries",
  pinnedStoreVersion: "PINNED_STORE_VERSION",
} as const;

export const CACHE_VERSIONS = {
  pinnedStore: "1",
} as const;