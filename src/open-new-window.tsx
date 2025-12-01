import { Clipboard, showHUD } from "@vicinae/api";
import { exec } from "child_process";
import { homedir } from "os";
import { join } from "path";

export default async function OpenNewWindow() {
  const clipboardContent = await Clipboard.read();
  console.log(`Clipboard content`, clipboardContent);

  // Check if clipboard contains a file URL in text
  let filePath = clipboardContent.text;
  console.log(`File path: ${filePath}`);

  // TODO: validate file path

  if (filePath) {
    const zedPath = join(homedir(), ".local", "bin", "zed");
    exec(`"${zedPath}" -n "${filePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      showHUD("Opened in New Zed Window");
    });
  }
}
