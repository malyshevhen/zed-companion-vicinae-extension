import { Action, ActionPanel, Icon, List, showHUD } from "@vicinae/api";
import { useZedContext, withZed } from "./components/with-zed";
import { exists } from "./lib/utils";
import { Entry, getEntry } from "./lib/entry";
import { ProjectEntry } from "./components/project-entry";
import { usePinnedEntries } from "./hooks/use-pinned-entries";
import { useRecentWorkspaces } from "./hooks/use-recent-workspaces";
import { exec } from "child_process";

export function Command() {
  const { appPath, dbPath, workspaceDbVersion } = useZedContext();
  const { workspaces, isLoading, error, removeEntry, removeAllEntries } =
    useRecentWorkspaces(dbPath, workspaceDbVersion);
  const {
    pinnedEntries,
    pinEntry,
    unpinEntry,
    unpinAllEntries,
    moveUp,
    moveDown,
  } = usePinnedEntries();

  const pinned = Object.values(pinnedEntries)
    .filter((e) => e.type === "remote" || exists(e.uri))
    .sort((a, b) => a.order - b.order);

  const removeAndUnpinEntry = async (entry: Pick<Entry, "id" | "uri">) => {
    await removeEntry(entry.id);
    unpinEntry(entry);
  };

  const removeAllAndUnpinEntries = async () => {
    await removeAllEntries();
    unpinAllEntries();
  };

  const openInZed = (uri: string) => {
    const path = uri.startsWith("file://") ? uri.substring(7) : uri;
    const zedPath = appPath || "/home/evhen/.local/bin/zed"; // Fallback to known path

    if (!zedPath) {
      console.error("Zed executable not found");
      return;
    }

    exec(`"${zedPath}" "${path}"`, (error) => {
      if (error) {
        console.error(`Failed to open in Zed: ${error}`);
      } else {
        showHUD("Opened in Zed");
      }
    });
  };

  return (
    <List isLoading={isLoading}>
      <List.EmptyView
        title="No Recent Projects"
        description={error ? "Check that Zed is up-to-date" : undefined}
        icon="no-view.png"
      />
      <List.Section title="Pinned Projects">
        {pinned.map((entry) => {
          if (!entry) {
            return null;
          }

          return (
            <ProjectEntry
              key={entry.uri}
              entry={entry}
              isPinned={true}
              actions={
                <ActionPanel>
                  <Action
                    title="Open in Zed"
                    onAction={() => openInZed(entry.uri)}
                    icon={Icon.Window}
                  />
                  {entry.type === "local" && (
                    <Action
                      title="Show in File Manager"
                      onAction={() => exec(`xdg-open ${entry.path}`)}
                    />
                  )}
                  <Action
                    title="Unpin Entry"
                    icon={Icon.PinDisabled}
                    onAction={() => unpinEntry(entry)}
                    shortcut={{ modifiers: ["ctrl", "shift"], key: "p" }}
                  />
                  {entry.order > 0 ? (
                    <Action
                      title="Move up"
                      icon={Icon.ArrowUp}
                      onAction={() => moveUp(entry)}
                      shortcut={{
                        modifiers: ["ctrl", "shift"],
                        key: "arrowUp",
                      }}
                    />
                  ) : null}
                  {entry.order < pinned.length - 1 ? (
                    <Action
                      title="Move Down"
                      icon={Icon.ArrowDown}
                      onAction={() => moveDown(entry)}
                      shortcut={{
                        modifiers: ["ctrl", "shift"],
                        key: "arrowDown",
                      }}
                    />
                  ) : null}
                  <RemoveActionSection
                    onRemoveEntry={() => removeAndUnpinEntry(entry)}
                    onRemoveAllEntries={removeAllAndUnpinEntries}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>

      <List.Section title="Recent Projects">
        {Object.values(workspaces)
          .filter((e) => !pinnedEntries[e.uri] && (!!e.host || exists(e.uri)))
          .sort((a, b) => (b.lastOpened || 0) - (a.lastOpened || 0))
          .map((e) => {
            const entry = getEntry(e);

            if (!entry) {
              return null;
            }

            return (
              <ProjectEntry
                key={entry.uri}
                entry={entry}
                actions={
                  <ActionPanel>
                    <Action
                      title="Open in Zed"
                      onAction={() => openInZed(entry.uri)}
                      icon={Icon.Window}
                    />
                    {entry.type === "local" && (
                      <Action
                        title="Show in File Manager"
                        onAction={() => exec(`xdg-open ${entry.path}`)}
                      />
                    )}
                    <Action
                      title="Pin Entry"
                      icon={Icon.Pin}
                      onAction={() => pinEntry(entry)}
                      shortcut={{ modifiers: ["ctrl", "shift"], key: "p" }}
                    />
                    <RemoveActionSection
                      onRemoveEntry={() => removeAndUnpinEntry(entry)}
                      onRemoveAllEntries={removeAllAndUnpinEntries}
                    />
                  </ActionPanel>
                }
              />
            );
          })}
      </List.Section>
    </List>
  );
}

function RemoveActionSection({
  onRemoveEntry,
  onRemoveAllEntries,
}: {
  onRemoveEntry: () => void;
  onRemoveAllEntries: () => void;
}) {
  return (
    <ActionPanel.Section>
      <Action
        icon={Icon.Trash}
        title="Remove from Recent Projects"
        style={Action.Style.Destructive}
        onAction={() => onRemoveEntry()}
        shortcut={{ modifiers: ["ctrl"], key: "x" }}
      />

      <Action
        icon={Icon.Trash}
        title="Remove All Recent Projects"
        style={Action.Style.Destructive}
        onAction={() => onRemoveAllEntries()}
        shortcut={{ modifiers: ["ctrl", "shift"], key: "x" }}
      />
    </ActionPanel.Section>
  );
}

export default withZed(Command);
