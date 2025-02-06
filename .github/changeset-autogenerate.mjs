import { execSync } from 'child_process';
import fs from 'fs';

// Define a function to handle the commit processing
async function generateChangeset() {
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
    issueNumber = match?.[2];  // Extract issue number if any (this is not required now)
    description = match?.[3];  // Extract the description

    // Validate the commit type
    if (!validTypes.includes(changeType)) {
      console.log('⚠️ Invalid commit type.');
      return;
    }
  } else {
    console.log('⚠️ No valid commit format found.');
    return;
  }

  // Generate and write changeset if valid description found
  if (description) {
    description = description.trim() || 'No description provided.';
    // Generate changeset content
    const changesetContent = `---
'@mindfiredigital/page-builder-${issueNumber || 'unknown'}': ${changeType}
---
${description}`;

    // Write to a changeset file
    fs.writeFileSync(`.changeset/auto-${Date.now()}.md`, changesetContent);
    console.log(`✅ Changeset file created for issue: ${issueNumber || 'unknown'}`);
  } else {
    console.log('⚠️ No valid commit format found in commit message.');
  }
}

// Call the function to run the changeset generation logic
generateChangeset().catch(err => console.error('Error generating changeset:', err));
