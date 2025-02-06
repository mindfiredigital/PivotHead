import { execSync } from 'child_process';
import fs from 'fs';

// Get the most recent commit message
const commitMessage = execSync('git log -1 --format=%s').toString().trim();

// Define valid types for commit messages
const validTypes = ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'patch'];

// Define regex patterns for commit types and formats
const commitPatterns = {
  major: /^BREAKING CHANGE: (.+)/,
  generalType: /^([a-z]+)(?::\[(\d+)\])?\s*(.*)/,  // Handles type (e.g., feat, fix) and optional issue numbers in brackets
};

// Identify type, package (scope), and description
let issueNumber = null;
let changeType = null;
let description = null;

// Check if the commit message matches one of the predefined types
if (commitPatterns.major.test(commitMessage)) {
  changeType = 'major';
  description = commitMessage.match(commitPatterns.major)?.[1];
} else if (commitPatterns.generalType.test(commitMessage)) {
  const match = commitMessage.match(commitPatterns.generalType);
  changeType = match?.[1];  // Type (e.g., feat, fix, etc.)
  issueNumber = match?.[2];  // Extract issue number if any
  description = match?.[3];  // Extract the description

  // Validate the commit type
  if (!validTypes.includes(changeType)) {
    console.log('⚠️ Invalid commit type.');
    return;
  }

  // Ensure subject (description) starts with a capital letter and doesn't end with a period
  if (description && description[0] === description[0].toLowerCase()) {
    console.log('⚠️ The commit subject must start with a capital letter.');
    return;
  }

  if (description && description.endsWith('.')) {
    console.log('⚠️ The commit subject must not end with a period.');
    return;
  }
} else {
  console.log('⚠️ No valid commit format found.');
  return;
}

// Ensure we have a valid issue number for the scope
if (!issueNumber) {
  console.log('⚠️ No valid issue number found in the commit message. Example: feat:[27] Add user registration endpoint');
  return;
}

// Ensure the issue number is a positive integer
if (!/^\d+$/.test(issueNumber)) {
  console.log('⚠️ Invalid issue number. It must be a positive integer.');
  return;
}

// Generate and write changeset if valid issue number found
if (description) {
  description = description.trim() || 'No description provided.';
  // Generate changeset content
  const changesetContent = `---
'@mindfiredigital/page-builder-${issueNumber}': ${changeType}
---
${description}`;

  // Write to a changeset file
  fs.writeFileSync(`.changeset/auto-${Date.now()}.md`, changesetContent);
  console.log(`✅ Changeset file created for issue: ${issueNumber}`);
} else {
  console.log('⚠️ No valid commit format found in commit message.');
}
