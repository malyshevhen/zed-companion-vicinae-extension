import util from "util";
import { existsSync, statSync } from "fs";
import { execFile } from "child_process";
import { homedir } from "os";
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

export function validateFilePath(path: string): { isValid: boolean; absolutePath: string; error?: string } {
  if (!path || typeof path !== 'string') {
    return { isValid: false, absolutePath: '', error: 'No path provided' };
  }

  // Trim whitespace
  const trimmedPath = path.trim();
  if (!trimmedPath) {
    return { isValid: false, absolutePath: '', error: 'Empty path' };
  }

  // Handle file:// URLs
  let absolutePath = trimmedPath;
  if (trimmedPath.startsWith('file://')) {
    absolutePath = trimmedPath.substring(7);
  }

  // Expand ~ to home directory
  if (absolutePath.startsWith('~')) {
    absolutePath = absolutePath.replace(/^~/, homedir());
  }

  // Basic path validation - should contain at least one path separator or be an absolute path
  const hasPathSeparators = absolutePath.includes('/') || absolutePath.includes('\\');
  const isAbsolute = absolutePath.startsWith('/') || absolutePath.match(/^[A-Za-z]:/);

  if (!hasPathSeparators && !isAbsolute) {
    return {
      isValid: false,
      absolutePath,
      error: 'Invalid path format - should be an absolute path or contain path separators'
    };
  }

  // Check if the path exists (for files/directories)
  try {
    const stats = statSync(absolutePath);
    return {
      isValid: true,
      absolutePath,
      error: undefined
    };
  } catch (error) {
    // Path doesn't exist - this is still valid for Zed to create new files
    // but we'll warn the user
    return {
      isValid: true,
      absolutePath,
      error: 'Path does not exist - Zed will create it if you save'
    };
  }
}
