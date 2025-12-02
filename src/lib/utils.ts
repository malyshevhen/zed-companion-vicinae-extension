import util from "util";
import { existsSync } from "fs";
import { execFile } from "child_process";
import { showToast, Toast } from "@vicinae/api";

export const execFilePromise = util.promisify(execFile);

export function exists(p: string) {
  try {
    // Handle file:// URIs
    if (p.startsWith('file://')) {
      return existsSync(p.substring(7));
    }
    return existsSync(new URL(p));
  } catch {
    return false;
  }
}

export const showFailureToast = (error: Error, options: Toast.Options) => {
  showToast({
    ...options,
    style: Toast.Style.Failure,
    title: error.message,
  });
};
