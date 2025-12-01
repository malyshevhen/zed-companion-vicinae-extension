import { Clipboard, showHUD } from "@vicinae/api";
import { exec } from "child_process";

export default async function OpenWithZed() {
  const fileUrl = await Clipboard.read();
  if (fileUrl.startsWith("file://")) {
    const filePath = fileUrl.substring(7);
    exec(`zed ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      showHUD("Opened in Zed");
    });
  }
}