import { homedir } from "os";

export function getZedDbPath() {
  return `${homedir()}/.local/share/zed/db/0-stable/db.sqlite`;
}
