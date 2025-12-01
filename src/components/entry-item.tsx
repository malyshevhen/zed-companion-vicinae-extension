import { useEffect, useState } from "react";
import { Color, List, Toast, showToast, Icon } from "@vicinae/api";
import { Entry } from "../lib/entry";
import { getGitBranch } from "../lib/git";
import { showGitBranch } from "../lib/preferences";
import { showFailureToast } from "../utils";

export interface EntryItemProps
  extends Pick<List.Item.Props, "icon" | "actions"> {
  entry: Entry;
}

function useGitBranch(path: string) {
  const [branch, setBranch] = useState<string | null>(null);

  useEffect(() => {
    if (showGitBranch) {
      async function fetchGitBranch() {
        if (path) {
          try {
            const branch = await getGitBranch(path);
            setBranch(branch);
           } catch (error) {
             showFailureToast(error as Error, {
               title: "Failed to get Git branch",
             });
           }
        }
      }

      fetchGitBranch();
    }
  }, [path]);

  return branch;
}

export const EntryItem = ({ entry, ...props }: EntryItemProps) => {
  const branch =
    entry.type === "local" && entry.path ? useGitBranch(entry.path) : undefined;

  return (
    <List.Item
      title={entry.title}
      subtitle={entry.subtitle}
      // detail
      accessories={
        branch
          ? [
              {
                tag: branch,
                icon: {
                  source: "git-branch.svg",
                  tintColor: Color.SecondaryText,
                },
                tooltip: `Git Branch: ${branch}`,
              },
            ]
          : []
      }
      icon={
        entry.type === "remote"
          ? "remote.svg"
          : entry.path
      }
      {...props}
    />
  );
};
