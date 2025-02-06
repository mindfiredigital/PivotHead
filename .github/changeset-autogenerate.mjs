import { execSync } from 'child_process';
import fs from 'fs';

// Get the most recent commit message
const commitMessage = execSync('git log -1 --format=%s').toString().trim();

// Define valid scopes
const validScopes = ['core', 'react', 'web-component', 'release'];

// Define regex patterns for commit types and formats
const commitPatterns = {
  major: /^BREAKING CHANGE: (.+)/,
  minor: /^feat(:?\[(\d+)\])?\s*(.*)/,  // feat: [issue_number] <subject> or feat: <subject>
  patch: /^fix(:?\[(\d+)\])?\s*(.*)/,  // fix: [issue_number] <subject> or fix: <subject>
};

// Identify type, package, and description
let packageName = null;
let changeType = null;
let description = null;
let issueNumber = null;

if (commitPatterns.major.test(commitMessage)) {
  changeType = 'major';
  description = commitMessage.match(commitPatterns.major)?.[1];
} else if (commitPatterns.minor.test(commitMessage)) {
  changeType = 'minor';
  const match = commitMessage.match(commitPatterns.minor);
  issueNumber = match?.[2];  // Extract the issue number (if any)
  description = match?.[3];  // Extract the description
} else if (commitPatterns.patch.test(commitMessage)) {
  changeType = 'patch';
  const match = commitMessage.match(commitPatterns.patch);
  issueNumber = match?.[2];  // Extract the issue number (if any)
  description = match?.[3];  // Extract the description
}

// Generate and write changeset if valid package found
if (description) {
  // Extract scope from the description (if present)
  const scopeMatch = description.match(/^\[(\w+)\]/);
  if (scopeMatch) {
    const scope = scopeMatch[1];
    if (validScopes.includes(scope)) {
      packageName = scope;  // Valid scope found, set packageName
    }
  }

  // Ensure we have a valid package name and description
  if (packageName) {
    description = description.trim() || 'No description provided.';
    // Generate changeset content
    const changesetContent = `---
'@mindfiredigital/page-builder-${packageName}': ${changeType}
---
${description}
`;

    // Write to a changeset file
    fs.writeFileSync(`.changeset/auto-${Date.now()}.md`, changesetContent);
    console.log(`✅ Changeset file created for package: page-builder-${packageName}`);
  } else {
    console.log('⚠️ No valid package scope found in commit message. Valid scopes are: core, react, web-component');
  }
} else {
  console.log('⚠️ No valid commit format found.');
}
