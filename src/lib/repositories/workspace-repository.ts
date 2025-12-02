import { ZedWorkspace, ZedLocalWorkspace, ZedRemoteWorkspace } from "../workspaces";
import { queryDb, getZedWorkspaceDbVersion, getZedWorkspacesQuery } from "../db";
import { DEFAULT_DB_VERSION } from "../config";
import { logger } from "../logger";

export interface WorkspaceQueryResult {
  isSupported: boolean;
  version: number;
  workspaces: ZedWorkspace[];
}

export class WorkspaceRepository {
  constructor(private dbPath: string) {}

  async getWorkspaceDbInfo(): Promise<{ version: number; supported: boolean }> {
    try {
      const result = await getZedWorkspaceDbVersion(this.dbPath, DEFAULT_DB_VERSION);
      logger.debug("Retrieved workspace database info", "WorkspaceRepository", {
        version: result.version,
        supported: result.supported,
      });
      return result;
    } catch (error) {
      logger.error("Failed to get workspace database info", "WorkspaceRepository", error as Error);
      throw error;
    }
  }

  async getWorkspaces(dbVersion: number): Promise<ZedWorkspace[]> {
    try {
      const result = await queryDb(this.dbPath, getZedWorkspacesQuery(dbVersion));
      logger.debug("Raw database result", "WorkspaceRepository", { result: result.substring(0, 200) });

      const workspaces = this.parseWorkspaceData(result);

      logger.info("Successfully parsed workspaces from database", "WorkspaceRepository", {
        totalLines: result.trim().split('\n').length,
        validWorkspaces: workspaces.length,
        dbVersion,
      });

      return workspaces;
    } catch (error) {
      logger.error("Failed to retrieve workspaces", "WorkspaceRepository", error as Error, {
        dbVersion,
        dbPath: this.dbPath,
      });
      throw error;
    }
  }

  async deleteWorkspace(workspaceId: number): Promise<void> {
    try {
      await queryDb(this.dbPath, `DELETE FROM workspaces WHERE workspace_id = ${workspaceId};`);
      logger.info("Deleted workspace", "WorkspaceRepository", { workspaceId });
    } catch (error) {
      logger.error("Failed to delete workspace", "WorkspaceRepository", error as Error, {
        workspaceId,
      });
      throw error;
    }
  }

  async deleteAllWorkspaces(): Promise<void> {
    try {
      await queryDb(this.dbPath, "DELETE FROM workspaces;");
      logger.info("Deleted all workspaces", "WorkspaceRepository");
    } catch (error) {
      logger.error("Failed to delete all workspaces", "WorkspaceRepository", error as Error);
      throw error;
    }
  }

  private parseWorkspaceData(data: string): ZedWorkspace[] {
    const lines = data.trim().split('\n').filter(line => line.trim());

    return lines
      .map(line => {
        try {
          // Handle cases where SQLite output has embedded newlines
          const parts = line.split('|').filter(part => part !== '');
          if (parts.length < 3) {
            logger.warn("Skipping invalid workspace data format", "WorkspaceRepository", { line });
            return null;
          }

          const type = parts[0] as 'local' | 'remote';
          const id = parseInt(parts[1], 10);

          // Handle paths that might contain newlines or be malformed
          let paths = '';
          let timestamp = '';
          let host = '';
          let user: string | null = null;
          let port: number | null = null;

          if (type === 'local') {
            // For local workspaces: type|id|paths|timestamp
            paths = parts[2] || '';
            timestamp = parts[3] || '';
          } else {
            // For remote workspaces: type|id|paths|timestamp|host|user|port
            paths = parts[2] || '';
            timestamp = parts[3] || '';
            host = parts[4] || '';
            user = parts[5] || null;
            port = parts[6] ? parseInt(parts[6], 10) : null;
          }

          // Validate required fields
          if (!paths.trim() || !timestamp.trim()) {
            logger.warn("Skipping workspace with missing required fields", "WorkspaceRepository", {
              id, type, paths: paths.trim(), timestamp: timestamp.trim()
            });
            return null;
          }

          const parsedTimestamp = Math.floor(new Date(timestamp.trim()).getTime() / 1000);

          // Skip invalid timestamps
          if (isNaN(parsedTimestamp)) {
            logger.warn("Skipping workspace with invalid timestamp", "WorkspaceRepository", {
              id, timestamp: timestamp.trim()
            });
            return null;
          }

          if (type === 'local') {
            return {
              type,
              id,
              paths: paths.trim(),
              timestamp: parsedTimestamp,
            } as ZedLocalWorkspace;
          } else {
            return {
              type,
              id,
              paths: paths.trim(),
              timestamp: parsedTimestamp,
              host: host.trim(),
              user,
              port,
            } as ZedRemoteWorkspace;
          }
        } catch (error) {
          logger.warn("Failed to parse workspace line", "WorkspaceRepository", {
            line,
            error: error instanceof Error ? error.message : String(error)
          });
          return null;
        }
      })
      .filter((workspace): workspace is ZedWorkspace => workspace !== null);
  }
}