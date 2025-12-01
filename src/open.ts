import { Clipboard, showHUD } from "@vicinae/api";
import { exec } from "child_process";
import { homedir } from "os";
import { join } from "path";

export default async function OpenWithZed() {
  const clipboardContent = await Clipboard.read();
  console.log(`Clipboard content`, clipboardContent);

  // Check if clipboard contains a file URL in text
  let filePath = clipboardContent.text;
  console.log(`File path: ${filePath}`);

  // TODO: validate file path
  // TODO: move common logic to separate file

  if (filePath) {
    const zedPath = join(homedir(), ".local", "bin", "zed");
    const cmd = `"${zedPath}" -n "${filePath}"`;
    console.log(`Executing command: ${cmd}`);

    exec(cmd, (error, _stdout, _stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      showHUD("Opened in Zed");
    });
  }
}
