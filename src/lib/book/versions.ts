import { uid } from "../utils.ts";
import type { Chapter, Section, VersionSnapshot } from "./types.ts";

const MAX_VERSIONS = 20;

export function pushVersion(
  versions: VersionSnapshot[],
  content: string,
  source: VersionSnapshot["source"],
  label?: string,
): VersionSnapshot[] {
  if (!content.trim()) return versions;
  const last = versions[versions.length - 1];
  if (last && last.content === content) return versions;
  const snap: VersionSnapshot = {
    id: uid("ver"),
    createdAt: Date.now(),
    label: label ?? (source === "generate" ? "Generated" : source === "ai-action" ? "AI edit" : "Edit"),
    content,
    source,
  };
  return [...versions, snap].slice(-MAX_VERSIONS);
}

export function applyContent(
  node: Chapter | Section,
  content: string,
  source: VersionSnapshot["source"],
  label?: string,
): { content: string; versions: VersionSnapshot[]; status: "generated" | "edited" } {
  return {
    content,
    versions: pushVersion(node.versions, node.content, "edit", "Before change"),
    status: source === "edit" ? "edited" : "generated",
  };
}

export function restoreVersion(
  node: Chapter | Section,
  versionId: string,
): { content: string; versions: VersionSnapshot[]; status: "edited" } | null {
  const found = node.versions.find((v) => v.id === versionId);
  if (!found) return null;
  return {
    content: found.content,
    versions: pushVersion(node.versions, node.content, "restore", "Before restore"),
    status: "edited",
  };
}
