import { StaticBadge } from "./static.js";
import { NpmVersionBadge } from "./npm-version.js";
import { NpmDownloadsBadge } from "./npm-downloads.js";
import { NpmSizeBadge } from "./npm-size.js";
import { NpmTypesBadge } from "./npm-types.js";
import { GhStarsBadge } from "./gh-stars.js";
import { GhIssuesBadge } from "./gh-issues.js";
import { GhLastCommitBadge } from "./gh-last-commit.js";
import { TangledSpindleStatus } from "./tangled-spindle-status.js";

export const BADGES = [
  new StaticBadge(),
  new NpmVersionBadge(),
  new NpmDownloadsBadge(),
  new NpmSizeBadge(),
  new NpmTypesBadge(),
  new GhStarsBadge(),
  new GhIssuesBadge(),
  new GhLastCommitBadge(),
  new TangledSpindleStatus()
];
