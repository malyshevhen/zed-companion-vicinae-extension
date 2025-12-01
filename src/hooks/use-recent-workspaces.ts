import { useState, useEffect } from "react";
import { Alert, confirmAlert, Icon, showToast, Toast } from "@vicinae/api";
import {
  DEFAULT_WORKSPACE_DB_VERSION,
  getZedWorkspacesQuery,
  queryDb,
} from "../lib/db";
import { ZedWorkspace, ZedLocalWorkspace, ZedRemoteWorkspace, Workspace, parseZedWorkspace } from "../lib/workspaces";
import { showFailureToast } from "../utils";

export type Workspaces = Record<string, Workspace>;

interface RecentWorkspaces {
  workspaces: Workspaces;
  isLoading?: boolean;
  error?: Error;
  removeEntry: (id: number) => Promise<void>;
  removeAllEntries: () => Promise<void>;
}

async function fetchWorkspaces(dbPath: string, dbVersion: number): Promise<ZedWorkspace[]> {
  try {
    const result = await queryDb(dbPath, getZedWorkspacesQuery(dbVersion));
    const lines = result.trim().split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split('|');
      const type = parts[0] as 'local' | 'remote';
      const id = parseInt(parts[1], 10);
      const paths = parts[2] || '';
      const timestamp = Math.floor(new Date(parts[3]).getTime() / 1000);

      if (type === 'local') {
        return {
          type,
          id,
          paths,
          timestamp,
        } as ZedLocalWorkspace;
      } else {
        return {
          type,
          id,
          paths,
          timestamp,
          host: parts[4] || '',
          user: parts[5] || null,
          port: parts[6] ? parseInt(parts[6], 10) : null,
        } as ZedRemoteWorkspace;
      }
    });
  } catch (error) {
    throw error;
  }
}

export function useRecentWorkspaces(
  dbPath: string,
  dbVersion: number = DEFAULT_WORKSPACE_DB_VERSION,
): RecentWorkspaces {
  const [data, setData] = useState<ZedWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const mutate = async (operation: Promise<any>, options?: { shouldRevalidateAfter?: boolean }) => {
    try {
      await operation;
      if (options?.shouldRevalidateAfter) {
        setIsLoading(true);
        setError(undefined);
        const newData = await fetchWorkspaces(dbPath, dbVersion);
        setData(newData);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces(dbPath, dbVersion)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [dbPath, dbVersion]);

  async function removeEntry(id: number) {
    try {
      await mutate(deleteEntryById(dbPath, id), {
        shouldRevalidateAfter: true,
      });
      showToast(Toast.Style.Success, "Entry removed");
    } catch (error) {
      showFailureToast(error as Error, { title: "Failed to remove entry" });
    }
  }

  async function removeAllEntries() {
    try {
      if (
        await confirmAlert({
          icon: Icon.Trash,
          title: "Remove all recent entries?",
          message: "This cannot be undone.",
          dismissAction: {
            title: "Cancel",
            style: Alert.ActionStyle.Cancel,
          },
          primaryAction: {
            title: "Remove",
            style: Alert.ActionStyle.Destructive,
          },
        })
      ) {
        await mutate(deleteAllWorkspaces(dbPath), {
          shouldRevalidateAfter: true,
        });
        showToast(Toast.Style.Success, "All entries removed");
      }
    } catch (error) {
      showFailureToast(error as Error, {
        title: "Failed to remove entries",
      });
    }
  }

  return {
    workspaces: data
      ? data.reduce<Workspaces>((acc, zedWorkspace) => {
          const workspace = parseZedWorkspace(zedWorkspace);
          if (!workspace) {
            return acc;
          }

          const existing = acc[workspace.uri];
          if (existing && existing.lastOpened > workspace.lastOpened) {
            return acc;
          }

          return { ...acc, [workspace.uri]: workspace };
        }, {})
      : {},
    isLoading,
    error,
    removeAllEntries,
    removeEntry,
  };
}

async function deleteEntryById(dbPath: string, id: number) {
  await queryDb(dbPath, `DELETE FROM workspaces WHERE workspace_id = ${id};`);
}

async function deleteAllWorkspaces(dbPath: string) {
  await queryDb(dbPath, "DELETE FROM workspaces;");
}
