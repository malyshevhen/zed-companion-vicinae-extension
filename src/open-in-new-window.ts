import { Clipboard, showHUD, showToast, Toast } from "@vicinae/api";
import { exec } from "child_process";
import { homedir } from "os";
import { join } from "path";
import { validateFilePath } from "./lib/utils";

export default async function OpenInNewWindow() {
  const clipboardContent = await Clipboard.read();

  // Check if clipboard contains text
  if (!clipboardContent.text) {
    showToast({
      title: "No text in clipboard",
      message: "Copy a file path or text to open in Zed",
      style: Toast.Style.Failure,
    });
    return;
  }

  // Validate the file path
  const validation = validateFilePath(clipboardContent.text);

  if (!validation.isValid) {
    showToast({
      title: "Invalid file path",
      message:
        validation.error || "The clipboard content is not a valid file path",
      style: Toast.Style.Failure,
    });
    return;
  }

  // Show warning if path doesn't exist
  if (validation.error) {
    showToast({
      title: "Path not found",
      message: validation.error,
      style: Toast.Style.Animated,
    });
  }

  const zedPath = join(homedir(), ".local", "bin", "zed");
  exec(`"${zedPath}" -n "${validation.absolutePath}"`, (error) => {
    if (error) {
      console.error(`Failed to open in Zed: ${error}`);
      showToast({
        title: "Failed to open in Zed",
        message: "Check that Zed is installed and accessible",
        style: Toast.Style.Failure,
      });
      return;
    }
    showHUD("Opened in New Zed Window");
  });
}
