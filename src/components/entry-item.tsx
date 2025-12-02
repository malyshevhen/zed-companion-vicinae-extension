import { useEffect, useState } from "react";
import { Color, List, Toast, showToast, Icon } from "@vicinae/api";
import { Entry } from "../lib/entry";
import { getGitBranch } from "../lib/git";
import { showFailureToast } from "../lib/utils";

export interface EntryItemProps extends Pick<
  List.Item.Props,
  "icon" | "actions"
> {
  entry: Entry;
}

function useGitBranch(path: string) {
  const [branch, setBranch] = useState<string | null>(null);

  useEffect(() => {
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
  }, [path]);

  return branch;
}

export const EntryItem = ({ entry, ...props }: EntryItemProps) => {
  let branch =
    entry.type === "local" && entry.path ? useGitBranch(entry.path) : undefined;

  // Truncate branch name if it's too long
  if (branch && branch.length > 15) {
    branch = branch.substring(0, 15) + "..";
  }

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
                  source: "git.svg",
                  tintColor: Color.SecondaryText,
                },
                tooltip: `Git Branch: ${branch}`,
              },
            ]
          : []
      }
      icon={entry.type === "remote" ? "globe.svg" : entry.path}
      {...props}
    />
  );
};
