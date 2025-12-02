import { useState, useEffect } from "react";
import { Alert, confirmAlert, Icon, showToast, Toast } from "@vicinae/api";
import { WorkspaceRepository } from "../lib/repositories/workspace-repository";
import { ZedWorkspace, Workspace, parseZedWorkspace } from "../lib/workspaces";
import { showFailureToast } from "../lib/utils";
import { logger } from "../lib/logger";

export type Workspaces = Record<string, Workspace>;

interface RecentWorkspaces {
  workspaces: Workspaces;
  isLoading?: boolean;
  error?: Error;
  removeEntry: (id: number) => Promise<void>;
  removeAllEntries: () => Promise<void>;
}

export function useRecentWorkspaces(
  dbPath: string,
  dbVersion: number,
): RecentWorkspaces {
  const [data, setData] = useState<ZedWorkspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  const repository = new WorkspaceRepository(dbPath);

  const mutate = async (operation: Promise<any>, options?: { shouldRevalidateAfter?: boolean }) => {
    try {
      await operation;
      if (options?.shouldRevalidateAfter) {
        setIsLoading(true);
        setError(undefined);
        const newData = await repository.getWorkspaces(dbVersion);
        setData(newData);
        setIsLoading(false);
      }
    } catch (err) {
      const error = err as Error;
      setError(error);
      setIsLoading(false);
      logger.error("Failed to mutate workspace data", "useRecentWorkspaces", error);
    }
  };

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        setIsLoading(true);
        setError(undefined);
        const workspaces = await repository.getWorkspaces(dbVersion);
        setData(workspaces);
      } catch (err) {
        const error = err as Error;
        setError(error);
        logger.error("Failed to load workspaces", "useRecentWorkspaces", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaces();
  }, [dbPath, dbVersion]);

  async function removeEntry(id: number) {
    try {
      await repository.deleteWorkspace(id);
      // Reload data after deletion
      const workspaces = await repository.getWorkspaces(dbVersion);
      setData(workspaces);
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
        await repository.deleteAllWorkspaces();
        // Reload data after deletion
        const workspaces = await repository.getWorkspaces(dbVersion);
        setData(workspaces);
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


