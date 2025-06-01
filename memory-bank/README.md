# Memory Bank

This directory contains Cline's Memory Bank - a structured documentation system that preserves project context across sessions.

## File Structure

### Core Files (Required)
1. **projectbrief.md** - Foundation document defining project scope and requirements
2. **productContext.md** - Why the project exists and how it should work
3. **systemPatterns.md** - Architecture and technical patterns
4. **techContext.md** - Technology stack and development setup
5. **activeContext.md** - Current work focus and recent changes
6. **progress.md** - What's complete, what's left, and current status

### File Dependencies
```
projectbrief.md
├── productContext.md
├── systemPatterns.md
└── techContext.md
    └── activeContext.md
        └── progress.md
```

## Usage

### At Session Start
Cline MUST read ALL memory bank files to understand:
- Project goals and scope
- Current state and progress
- Technical patterns and decisions
- Next steps and priorities

### During Development
Update files when:
- Discovering new project patterns
- After implementing significant changes
- When context needs clarification
- When user requests "update memory bank"

### Key Principles
- Files build upon each other hierarchically
- Each file has a specific purpose and scope
- Documentation must be precise and actionable
- Templates are filled in as project develops

## Status
- **Created:** 2025-05-29
- **Status:** Initialized with templates
- **Next:** Await project definition to populate templates

---
*This Memory Bank structure ensures continuity across Cline's memory resets*
