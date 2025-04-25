#!/usr/bin/env bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the current branch name
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Validate branch name format
BRANCH_PATTERN="^(main|dev|development|feature|bug|fixes|hotFixes|docs|other|enhancement|patch)(/[0-9]+-[a-zA-Z0-9-]+)?$"
if ! echo "$CURRENT_BRANCH" | grep -Eq "$BRANCH_PATTERN"; then
  echo -e "${RED} ❌ Invalid branch name: '$CURRENT_BRANCH'${NC}"
  echo -e "${YELLOW}Branch name must be in the format: feature/bug/fixes/hotFixes/(issueNumber/ticketNumber)-(issue-description)${NC}"
  echo -e "${YELLOW}Example: feature/12345-implement-login${NC}"
  exit 1
fi
echo -e "${GREEN} ✅ Branch name and commit message are valid. Proceeding...${NC}"
exit 0
