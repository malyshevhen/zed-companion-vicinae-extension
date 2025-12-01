import {
  ComponentType,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Detail, LocalStorage } from "@vicinae/api";
import { getZedWorkspaceDbVersion } from "../lib/db";
import { homedir } from "os";
import { join } from "path";
import { exec } from "child_process";
import { accessSync } from "fs";

interface ZedContextType {
  appPath: string;
  isDbSupported: boolean;
  workspaceDbVersion: number;
  dbPath: string;
}

const ZedContext = createContext<ZedContextType | undefined>(undefined);

const defaultDbVersionKey = "defaultDbVersion";

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
    const possiblePaths = [
      join(homedir(), ".local", "share", "zed", "db", "0-stable", "db.sqlite"),
      join(homedir(), ".local", "share", "zed", "db", "0-global", "db.sqlite"),
      join(homedir(), ".local", "share", "zed", "db", "0-preview", "db.sqlite"),
      join(homedir(), ".config", "zed", "db"), // legacy path
    ];

    for (const path of possiblePaths) {
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
    async function findZed() {
      const pathsToTry = [
        join(homedir(), ".local", "bin", "zed"),
        "/usr/bin/zed",
        "/usr/local/bin/zed",
        join(homedir(), "bin", "zed"),
      ];
      for (const path of pathsToTry) {
        exec(`ls ${path}`, (error) => {
          if (!error) {
            setAppPath(path);
            return;
          }
        });
      }
    }

    findZed();
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
        const defaultDbVersion =
          await LocalStorage.getItem<number>(defaultDbVersionKey);
        const workspaceDbVersion = await getZedWorkspaceDbVersion(
          dbPath,
          defaultDbVersion,
        );

        if (workspaceDbVersion.supported) {
          await LocalStorage.setItem(
            defaultDbVersionKey,
            workspaceDbVersion.version,
          );
        }
        setDbInfo({
          isDbSupported: workspaceDbVersion.supported,
          workspaceDbVersion: workspaceDbVersion.version,
        });
        setIsLoading(false);
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
