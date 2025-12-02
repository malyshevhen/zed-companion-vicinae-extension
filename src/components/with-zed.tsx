import {
  ComponentType,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Detail, LocalStorage } from "@vicinae/api";
import { WorkspaceRepository } from "../lib/repositories/workspace-repository";
import { ZED_PATHS, CACHE_KEYS, DEFAULT_DB_VERSION } from "../lib/config";
import { logger } from "../lib/logger";
import { accessSync } from "fs";

interface ZedContextType {
  appPath: string;
  isDbSupported: boolean;
  workspaceDbVersion: number;
  dbPath: string;
}

const ZedContext = createContext<ZedContextType | undefined>(undefined);

function useZed() {
  const [appPath, setAppPath] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbInfo, setDbInfo] = useState<{
    isDbSupported: boolean;
    workspaceDbVersion: number;
  } | null>(null);
  const [dbPath, setDbPath] = useState<string>("");

  // Try to find the Zed database
  const findDbPath = () => {
    for (const path of ZED_PATHS.database) {
      try {
        accessSync(path);
        return path;
      } catch {
        // Path doesn't exist, try next
      }
    }
    return "";
  };

  useEffect(() => {
    // Find Zed executable
    for (const path of ZED_PATHS.executable) {
      try {
        accessSync(path);
        setAppPath(path);
        logger.debug("Found Zed executable", "withZed", { path });
        return;
      } catch {
        // Continue to next path
      }
    }

    // Fallback to which command
    const { exec } = require('child_process');
    exec('which zed', (error: any, stdout: any) => {
      if (!error && stdout.trim()) {
        setAppPath(stdout.trim());
        logger.debug("Found Zed via which command", "withZed", { path: stdout.trim() });
      } else {
        logger.warn("Could not find Zed executable", "withZed");
      }
    });
  }, []);

  useEffect(() => {
    if (appPath) {
      const foundDbPath = findDbPath();
      setDbPath(foundDbPath);
    }
  }, [appPath]);

  useEffect(() => {
    async function getDbInfo() {
      if (appPath && dbPath) {
        try {
          const repository = new WorkspaceRepository(dbPath);
          const dbInfo = await repository.getWorkspaceDbInfo();

          if (dbInfo.supported) {
            await LocalStorage.setItem(CACHE_KEYS.defaultDbVersion, dbInfo.version);
          }

          setDbInfo({
            isDbSupported: dbInfo.supported,
            workspaceDbVersion: dbInfo.version,
          });

          logger.debug("Database info loaded", "withZed", {
            supported: dbInfo.supported,
            version: dbInfo.version,
          });
        } catch (error) {
          logger.error("Failed to load database info", "withZed", error as Error);
          setDbInfo({
            isDbSupported: false,
            workspaceDbVersion: DEFAULT_DB_VERSION,
          });
        } finally {
          setIsLoading(false);
        }
      }
    }

    getDbInfo();
  }, [appPath, dbPath]);

  return {
    isLoading,
    appPath,
    isDbSupported: dbInfo?.isDbSupported ?? false,
    workspaceDbVersion: dbInfo?.workspaceDbVersion ?? 0,
    dbPath,
  };
}

export const withZed = <P extends object>(Component: ComponentType<P>) => {
  return (props: P) => {
    const { appPath, isDbSupported, workspaceDbVersion, dbPath, isLoading } =
      useZed();

    if (isLoading) {
      return <Detail markdown="Loading Zed configuration..." />;
    }

    if (!appPath) {
      return <Detail markdown="No Zed app detected" />;
    }

    if (!dbPath) {
      return <Detail markdown="Zed Workspaces Database file not found" />;
    }

    if (!isDbSupported) {
      return <Detail markdown="Please update Zed to the latest version" />;
    }

    return (
      <ZedContext.Provider
        value={{
          appPath,
          isDbSupported,
          workspaceDbVersion,
          dbPath,
        }}
      >
        <Component {...props} />
      </ZedContext.Provider>
    );
  };
};

export function useZedContext() {
  const context = useContext(ZedContext);

  if (!context) {
    throw new Error("useZedContext must be used within a ZedContext.Provider");
  }

  return context;
}
