# GitHub Labels Configuration

This file documents the labels used in this repository for issues and pull requests.

## Type Labels (Issue/PR Classification)

- `bug` - Something isn't working correctly
- `enhancement` - New feature or request
- `documentation` - Documentation improvements or additions
- `question` - Further information is requested
- `feature` - New feature implementation
- `refactor` - Code refactoring without changing functionality
- `performance` - Performance improvements
- `accessibility` - Accessibility improvements
- `security` - Security-related issues or improvements

## Priority Labels

- `priority: critical` - Requires immediate attention
- `priority: high` - Should be addressed soon
- `priority: medium` - Normal priority
- `priority: low` - Nice to have

## Component Labels (Frontend Areas)

- `component: player` - Audio player functionality
- `component: genre-tree` - Genre tree visualization
- `component: track-list` - Track list components
- `component: playlist` - Playlist management
- `component: auth` - Authentication (Spotify OAuth)
- `component: api` - API integration
- `component: ui` - UI components and styling

## Technology Labels

- `react` - React-related issues
- `nextjs` - Next.js-related issues
- `typescript` - TypeScript-related issues
- `tailwind` - Tailwind CSS styling
- `d3` - D3.js visualization

## Status Labels

- `status: needs-triage` - Needs initial review and categorization
- `status: needs-info` - Waiting for more information
- `status: in-progress` - Currently being worked on
- `status: blocked` - Blocked by another issue or external dependency
- `status: ready` - Ready to be worked on
- `status: won't-fix` - Will not be addressed

## Size Labels (Effort Estimation)

- `size: xs` - Extra small (< 1 hour)
- `size: s` - Small (1-4 hours)
- `size: m` - Medium (1-2 days)
- `size: l` - Large (3-5 days)
- `size: xl` - Extra large (> 1 week)

## Special Labels

- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention is needed
- `breaking-change` - Introduces breaking changes
- `dependencies` - Dependency updates
- `duplicate` - This issue or pull request already exists
- `invalid` - This doesn't seem right
- `wontfix` - This will not be worked on

## Platform Labels

- `browser: chrome` - Chrome-specific issue
- `browser: firefox` - Firefox-specific issue
- `browser: safari` - Safari-specific issue
- `platform: mobile` - Mobile-specific issue
- `platform: desktop` - Desktop-specific issue

## Automatic Labeling

This repository uses multiple automated workflows to apply labels:

### 1. PR File-based Labeling (`.github/workflows/labeler.yml`)

Automatically labels PRs based on changed files:

- Component labels (player, genre-tree, track-list, etc.)
- Technology labels (react, nextjs, typescript, etc.)
- Special labels (documentation, dependencies, infrastructure)
- Configuration: `.github/labeler.yml`

### 2. PR Size Labeling (`.github/workflows/pr-size-labeler.yml`)

Automatically calculates and labels PRs by size:

- `size: xs` - < 50 lines changed
- `size: s` - 50-199 lines
- `size: m` - 200-499 lines
- `size: l` - 500-999 lines
- `size: xl` - 1000+ lines
- Also posts a comment with detailed line counts

### 3. PR Type Labeling (`.github/workflows/pr-type-labeler.yml`)

Automatically detects PR type from title and description:

- Detects conventional commit prefixes (feat, fix, docs, refactor, perf)
- Identifies breaking changes
- Detects PR type from template checkboxes
- Applies appropriate type labels

### 4. Issue Labeling (`.github/workflows/issue-labeler.yml`)

Automatically labels new issues based on:

- Issue template type (bug report vs feature request)
- Component mentions in description
- Browser/platform information
- Priority keywords
- Security/performance/accessibility keywords

---

## Label Color Scheme

- **Type** (blue): `#0075ca`
- **Priority** (red/orange): Critical `#d73a4a`, High `#ff9800`, Medium `#ffa500`, Low `#ffeb3b`
- **Component** (green): `#0e8a16`
- **Technology** (purple): `#8b5cf6`
- **Status** (yellow): `#fef2c0`
- **Size** (gray): `#6c757d`
- **Special** (pink/red): `#e11d48`

## Creating Labels via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh

# Create type labels
gh label create "bug" --color "d73a4a" --description "Something isn't working"
gh label create "enhancement" --color "a2eeef" --description "New feature or request"
gh label create "documentation" --color "0075ca" --description "Documentation improvements"
gh label create "question" --color "d876e3" --description "Further information is requested"
gh label create "feature" --color "0e8a16" --description "New feature implementation"
gh label create "refactor" --color "fbca04" --description "Code refactoring"
gh label create "performance" --color "f97316" --description "Performance improvements"
gh label create "accessibility" --color "7e22ce" --description "Accessibility improvements"
gh label create "security" --color "dc2626" --description "Security-related"

# Create priority labels
gh label create "priority: critical" --color "b60205" --description "Requires immediate attention"
gh label create "priority: high" --color "d93f0b" --description "Should be addressed soon"
gh label create "priority: medium" --color "fbca04" --description "Normal priority"
gh label create "priority: low" --color "c2e0c6" --description "Nice to have"

# Create component labels
gh label create "component: player" --color "0e8a16" --description "Audio player functionality"
gh label create "component: genre-tree" --color "0e8a16" --description "Genre tree visualization"
gh label create "component: track-list" --color "0e8a16" --description "Track list components"
gh label create "component: playlist" --color "0e8a16" --description "Playlist management"
gh label create "component: auth" --color "0e8a16" --description "Authentication"
gh label create "component: api" --color "0e8a16" --description "API integration"
gh label create "component: ui" --color "0e8a16" --description "UI components and styling"

# Create technology labels
gh label create "react" --color "61dafb" --description "React-related"
gh label create "nextjs" --color "000000" --description "Next.js-related"
gh label create "typescript" --color "3178c6" --description "TypeScript-related"
gh label create "tailwind" --color "06b6d4" --description "Tailwind CSS styling"
gh label create "d3" --color "f9a03c" --description "D3.js visualization"

# Create status labels
gh label create "status: needs-triage" --color "ededed" --description "Needs initial review"
gh label create "status: needs-info" --color "fef2c0" --description "Waiting for information"
gh label create "status: in-progress" --color "c5def5" --description "Currently being worked on"
gh label create "status: blocked" --color "e99695" --description "Blocked by dependency"
gh label create "status: ready" --color "c2e0c6" --description "Ready to work on"
gh label create "status: won't-fix" --color "ffffff" --description "Will not be addressed"

# Create size labels
gh label create "size: xs" --color "d4c5f9" --description "Extra small (< 1 hour)"
gh label create "size: s" --color "c5def5" --description "Small (1-4 hours)"
gh label create "size: m" --color "bfdadc" --description "Medium (1-2 days)"
gh label create "size: l" --color "fef2c0" --description "Large (3-5 days)"
gh label create "size: xl" --color "e99695" --description "Extra large (> 1 week)"

# Create special labels
gh label create "good-first-issue" --color "7057ff" --description "Good for newcomers"
gh label create "help-wanted" --color "008672" --description "Extra attention needed"
gh label create "breaking-change" --color "d73a4a" --description "Introduces breaking changes"
gh label create "dependencies" --color "0366d6" --description "Dependency updates"

# Create platform labels
gh label create "browser: chrome" --color "34a853" --description "Chrome-specific"
gh label create "browser: firefox" --color "ff7139" --description "Firefox-specific"
gh label create "browser: safari" --color "006cff" --description "Safari-specific"
gh label create "platform: mobile" --color "fbca04" --description "Mobile-specific"
gh label create "platform: desktop" --color "0075ca" --description "Desktop-specific"
```

## Creating All Labels at Once

```bash
# Run all label creation commands
bash .github/scripts/create-labels.sh
```
