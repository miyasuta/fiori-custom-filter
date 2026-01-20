# Project Documentation for AI Coding Assistants

This document provides essential rules and guidance for AI coding assistants working on CAP (Cloud Application Programming Model) projects.

## Working Style (MANDATORY)

**Always follow this workflow**:
1. **Understand** - Read relevant files and documentation first
2. **Plan** - Create a detailed checklist of all changes needed
3. **Get Approval** - Present the plan and wait for user confirmation
4. **Execute** - Implement changes step by step, following the plan
5. **Verify** - Run tests and confirm everything works

**NEVER**:
- Make code changes without presenting a plan first
- Modify files before getting user approval
- Skip the planning phase "to save time"

## Documentation Structure

- **AGENTS.md** (this file): Essential rules and references to detailed guides
- **CLAUDE.md**: Claude Code-specific reference (points to this file)
- **docs/guides/**: Detailed development guides (read these for specifics)
- **docs/project/**: Project-specific implementation details

## Project Type

<!-- Update this section based on your project -->
**Framework**: SAP Cloud Application Programming Model (CAP)
**Runtime**: [ ] Java [ ] Node.js
**Features**: [ ] Fiori Elements [ ] Draft [ ] Custom Services

## Critical Rules (Always Follow)

### 1. MCP Server Usage (MANDATORY)

**CAP MCP Server (@cap-js/mcp-server)**:
- **MUST** search cds-mcp BEFORE reading .cds files
- **MUST** search cds-mcp BEFORE modifying CDS models or using CAP APIs
- Only read .cds files if MCP search fails

**Fiori MCP Server (@sap-ux/fiori-mcp-server)**:
- Use for Fiori elements apps
- Follow: list-functionality → get-functionality-details → execute-functionality

**UI5 MCP Server (@ui5/mcp-server)**:
- **MUST** call get_guidelines BEFORE any UI5 work
- Run linter after changes

### 2. Git Workflow (MANDATORY)

- **Always** work on new branch (never commit to main)
- **Single-line** commit messages (imperative mood)
- **Delete** branch after merge

See [Git Workflow Guide](docs/guides/git-workflow.md) for details.

### 3. Debugging: Stream Redirection (MANDATORY)

**ALWAYS use `2>&1` when capturing logs** (CAP logs to stderr):

```bash
# BEST PRACTICE: Redirect to file first, then grep
# This avoids issues with tee and allows multiple grep operations

# ✅ CORRECT - Use project tmp/ directory
mkdir -p tmp
mvn test > tmp/test.log 2>&1      # Java
node --test > tmp/test.log 2>&1   # Node.js

# ❌ WRONG - Misses all application logs
mvn test | grep "pattern"
node --test | grep "pattern"
```

**Note**: The `tmp/` directory is created by init-claude.sh and added to `.gitignore`.
See [Debugging Guide](docs/guides/debugging-guide.md) for details.

### 4. Test-Driven Development (MANDATORY)

**Always follow TDD**:
1. Write test first
2. Confirm test fails
3. Implement feature
4. Verify test passes

**Use protocol-level tests** (HTTP/OData) unless specified otherwise.

See [Test Strategy Guide](docs/guides/test-strategy.md) for details.

### 5. CAP Java Type Safety (MANDATORY for Java)

- **Never** use `Map<String, Object>` - use typed entity classes
- **Never** use generic `CdsService` - use generated service interfaces
- **Never** hardcode strings - use metamodel constants

See [Java Development Guide](docs/guides/java/development-guide.md) for details.

## Detailed Guides

Read these guides for complete information:

### For All Projects
- [Git Workflow](docs/guides/git-workflow.md) - Branch rules, commit messages
- [Debugging Guide](docs/guides/debugging-guide.md) - Log capture, debug logging
- [Test Strategy](docs/guides/test-strategy.md) - TDD workflow, test patterns

### For CAP Java Projects
- [Java Development Guide](docs/guides/java/development-guide.md) - Type safety, Maven, database operations

### Project-Specific
- `docs/project/architecture.md` - System structure, components
- `docs/project/implementation-notes.md` - Design decisions, lessons learned

## Quick Reference

<!-- Update paths based on your project -->

### Build and Test

**Java**:
```bash
cd /path/to/project
mvn clean install
mvn test
mvn test -Dtest=TestClass#method
```

**Node.js**:
```bash
cd /path/to/project
npm install
node --test
node --test path/to/test.js
```

### Capture Logs (CRITICAL: use 2>&1)

```bash
mkdir -p tmp
mvn test > tmp/test.log 2>&1       # Java
node --test > tmp/test.log 2>&1    # Node.js
grep "pattern" tmp/test.log
```

## Assistant Behavior

**BEFORE making changes**:
1. Search MCP servers for CAP/UI5 documentation
2. Read relevant guide from `docs/guides/`
3. Check `docs/project/` for project-specific patterns

**ALWAYS**:
- Use `2>&1` when capturing logs
- Follow TDD (test first)
- Work on new branch
- Single-line commit messages

**NEVER**:
- Modify code without checking MCP first
- Skip writing tests
- Use Map/string literals (Java)
- Commit to main directly

## Resources

- CAP Documentation: https://cap.cloud.sap/docs/
- CAP Java SDK: https://cap.cloud.sap/docs/java/
- CAP Node.js SDK: https://cap.cloud.sap/docs/node.js/
- Fiori Elements: https://ui5.sap.com/test-resources/sap/fe/demokit/index.html
- UI5 Documentation: https://ui5.sap.com/

---

**Note**: This file contains essential rules only. For detailed guidance, see the guides in `docs/guides/`.
