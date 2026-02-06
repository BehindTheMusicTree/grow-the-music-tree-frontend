#!/bin/bash

# GitHub Labels Setup Script
# This script creates all the labels for the repository using GitHub CLI

set -e

echo "🏷️  Creating GitHub labels..."

# Type labels
gh label create "bug" --color "d73a4a" --description "Something isn't working" --force
gh label create "enhancement" --color "a2eeef" --description "New feature or request" --force
gh label create "documentation" --color "0075ca" --description "Documentation improvements" --force
gh label create "question" --color "d876e3" --description "Further information is requested" --force
gh label create "feature" --color "0e8a16" --description "New feature implementation" --force
gh label create "refactor" --color "fbca04" --description "Code refactoring" --force
gh label create "performance" --color "f97316" --description "Performance improvements" --force
gh label create "accessibility" --color "7e22ce" --description "Accessibility improvements" --force
gh label create "security" --color "dc2626" --description "Security-related" --force

# Priority labels
gh label create "priority: critical" --color "b60205" --description "Requires immediate attention" --force
gh label create "priority: high" --color "d93f0b" --description "Should be addressed soon" --force
gh label create "priority: medium" --color "fbca04" --description "Normal priority" --force
gh label create "priority: low" --color "c2e0c6" --description "Nice to have" --force

# Component labels
gh label create "component: player" --color "0e8a16" --description "Audio player functionality" --force
gh label create "component: genre-tree" --color "0e8a16" --description "Genre tree visualization" --force
gh label create "component: track-list" --color "0e8a16" --description "Track list components" --force
gh label create "component: playlist" --color "0e8a16" --description "Playlist management" --force
gh label create "component: auth" --color "0e8a16" --description "Authentication" --force
gh label create "component: api" --color "0e8a16" --description "API integration" --force
gh label create "component: ui" --color "0e8a16" --description "UI components and styling" --force

# Technology labels
gh label create "react" --color "61dafb" --description "React-related" --force
gh label create "nextjs" --color "000000" --description "Next.js-related" --force
gh label create "typescript" --color "3178c6" --description "TypeScript-related" --force
gh label create "tailwind" --color "06b6d4" --description "Tailwind CSS styling" --force
gh label create "d3" --color "f9a03c" --description "D3.js visualization" --force

# Status labels
gh label create "status: needs-triage" --color "ededed" --description "Needs initial review" --force
gh label create "status: needs-info" --color "fef2c0" --description "Waiting for information" --force
gh label create "status: in-progress" --color "c5def5" --description "Currently being worked on" --force
gh label create "status: blocked" --color "e99695" --description "Blocked by dependency" --force
gh label create "status: ready" --color "c2e0c6" --description "Ready to work on" --force
gh label create "status: won't-fix" --color "ffffff" --description "Will not be addressed" --force

# Size labels
gh label create "size: xs" --color "d4c5f9" --description "Extra small (< 1 hour)" --force
gh label create "size: s" --color "c5def5" --description "Small (1-4 hours)" --force
gh label create "size: m" --color "bfdadc" --description "Medium (1-2 days)" --force
gh label create "size: l" --color "fef2c0" --description "Large (3-5 days)" --force
gh label create "size: xl" --color "e99695" --description "Extra large (> 1 week)" --force

# Special labels
gh label create "good-first-issue" --color "7057ff" --description "Good for newcomers" --force
gh label create "help-wanted" --color "008672" --description "Extra attention needed" --force
gh label create "breaking-change" --color "d73a4a" --description "Introduces breaking changes" --force
gh label create "dependencies" --color "0366d6" --description "Dependency updates" --force

# Platform labels
gh label create "browser: chrome" --color "34a853" --description "Chrome-specific" --force
gh label create "browser: firefox" --color "ff7139" --description "Firefox-specific" --force
gh label create "browser: safari" --color "006cff" --description "Safari-specific" --force
gh label create "platform: mobile" --color "fbca04" --description "Mobile-specific" --force
gh label create "platform: desktop" --color "0075ca" --description "Desktop-specific" --force

echo "✅ All labels created successfully!"
