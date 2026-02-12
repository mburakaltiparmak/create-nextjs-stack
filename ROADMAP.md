# Enhancement Roadmap - create-nextjs-stack

This document outlines planned improvements and features for future versions of `create-nextjs-stack`.

## 📋 Table of Contents

- [v0.2.0 - Documentation & Community](#v020---documentation--community)
- [v0.3.0 - Feature Expansion](#v030---feature-expansion)
- [v0.4.0 - Quality & Testing](#v040---quality--testing)
- [v1.0.0 - Production Hardening](#v100---production-hardening)
- [Future Considerations](#future-considerations)

---

## v0.2.0 - Documentation & Community

**Target**: 1-2 months after v0.1.0 release  
**Focus**: Improve documentation and build community

### Documentation Enhancements

#### 1. CONTRIBUTING.md

**Priority**: High  
**Effort**: Low (2-3 hours)

Create a comprehensive contributor guide:

- Code of Conduct
- Development setup instructions
- Branching strategy (e.g., `main`, `develop`, feature branches)
- Commit message conventions (Conventional Commits)
- Pull request process
- Testing requirements

**Implementation**:

```markdown
# Contributing to create-nextjs-stack

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/create-nextjs-stack.git`
3. Install dependencies: `npm install`
4. Run tests: `npm test`

## Making Changes

- Create a feature branch: `git checkout -b feature/your-feature-name`
- Follow conventional commits: `feat:`, `fix:`, `docs:`, `chore:`
- Ensure all tests pass before submitting PR
```

#### 2. Demo Video/GIF

**Priority**: Medium  
**Effort**: Medium (4-5 hours)

Create visual demonstrations:

- Record CLI usage with `asciinema` or similar tool
- Show interactive prompts and scaffolding process
- Demonstrate all three template options
- Add to README.md

**Tools**:

- `asciinema` for terminal recording
- `terminalizer` for GIF conversion
- Host on GitHub or embed directly

#### 3. Showcase Section

**Priority**: Medium  
**Effort**: Low (1-2 hours)

Add a "Built With" section to README:

- Collect example projects from users
- Display screenshots/links
- Encourage community submissions via GitHub Discussions

### Community Building

#### 4. GitHub Issue Templates

**Priority**: High  
**Effort**: Low (1 hour)

Create `.github/ISSUE_TEMPLATE/`:

- `bug_report.yml` - Structured bug reports
- `feature_request.yml` - Feature suggestions
- `question.yml` - General questions

**Example Bug Report Template**:

```yaml
name: Bug Report
description: Report a bug in create-nextjs-stack
labels: ["bug", "triage"]
body:
  - type: input
    id: version
    attributes:
      label: Version
      description: What version are you using?
      placeholder: "0.1.0"
    validations:
      required: true
  - type: dropdown
    id: template
    attributes:
      label: Template Type
      options:
        - Web
        - Admin
        - Full-Stack
```

#### 5. Pull Request Template

**Priority**: High  
**Effort**: Low (30 minutes)

Create `.github/pull_request_template.md`:

- Description of changes
- Related issue links
- Testing checklist
- Breaking changes notice

#### 6. GitHub Discussions

**Priority**: Medium  
**Effort**: Low (30 minutes)

Enable and organize:

- Q&A category
- Show and Tell (user projects)
- Feature Requests
- General discussions

---

## v0.3.0 - Feature Expansion

**Target**: 3-4 months after v0.1.0  
**Focus**: Add customization options and new features

### Template Customization

#### 7. TypeScript/JavaScript Choice

**Priority**: High  
**Effort**: High (8-10 hours)

Allow users to choose language preference:

- Add `--typescript` / `--javascript` flags
- Create JavaScript versions of templates
- Update CLI prompts to include language selection
- Maintain type safety in TypeScript version

**Implementation Steps**:

1. Duplicate templates with `.js` versions
2. Add prompt: "Which language do you prefer?"
3. Conditionally copy based on selection
4. Update `tsconfig.json` generation logic

#### 8. Styling Framework Options

**Priority**: Medium  
**Effort**: High (10-12 hours)

Support multiple CSS frameworks:

- Tailwind CSS (default)
- CSS Modules
- Styled Components
- Emotion

**CLI Flow**:

```bash
? Which styling solution do you prefer?
  ❯ Tailwind CSS (recommended)
    CSS Modules
    Styled Components
    Emotion
```

#### 9. Database Options

**Priority**: Medium  
**Effort**: Very High (15-20 hours)

Expand beyond Supabase:

- Prisma + PostgreSQL
- Prisma + MySQL
- MongoDB + Mongoose
- Firebase

**Considerations**:

- Create separate template variants
- Update service layer architecture
- Provide migration guides

### Developer Experience

#### 10. ESLint/Prettier Configuration

**Priority**: High  
**Effort**: Medium (4-5 hours)

Add code quality tooling:

- Prompt for ESLint config style (Airbnb, Standard, Google)
- Include Prettier with sensible defaults
- Add pre-commit hooks with Husky
- Configure VS Code settings

**Files to Add**:

- `.eslintrc.json`
- `.prettierrc`
- `.husky/pre-commit`
- `.vscode/settings.json`

#### 11. Deployment Guides

**Priority**: Medium  
**Effort**: Medium (6-8 hours)

Create deployment documentation:

- Vercel (one-click deploy button)
- Netlify
- Railway
- AWS Amplify
- Docker + Self-hosting

**Structure**:

```
docs/
├── deployment/
│   ├── vercel.md
│   ├── netlify.md
│   ├── railway.md
│   └── docker.md
```

---

## v0.4.0 - Quality & Testing

**Target**: 5-6 months after v0.1.0  
**Focus**: Improve code quality and testing coverage

### Testing Infrastructure

#### 12. Unit Tests for CLI Logic

**Priority**: High  
**Effort**: High (10-12 hours)

Test individual CLI functions:

- Template selection logic
- File copying utilities
- Environment variable handling
- Package.json manipulation

**Test Structure**:

```
tests/
├── unit/
│   ├── template-selection.test.ts
│   ├── file-operations.test.ts
│   └── config-updates.test.ts
└── integration/
    └── cli.test.ts (existing)
```

#### 13. E2E Tests for Generated Projects

**Priority**: Medium  
**Effort**: Very High (15-20 hours)

Verify generated projects work:

- Install dependencies in generated project
- Run build command
- Check for compilation errors
- Verify dev server starts
- Test basic functionality

**Tools**:

- Playwright for browser testing
- GitHub Actions matrix for multiple Node versions

#### 14. Code Coverage Reporting

**Priority**: Medium  
**Effort**: Low (2-3 hours)

Implement coverage tracking:

- Configure Vitest coverage
- Add Codecov integration
- Set minimum coverage thresholds (80%)
- Display badge in README

**Configuration**:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "tests/"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

### Dependency Management

#### 15. Dependabot Configuration

**Priority**: High  
**Effort**: Low (1 hour)

Automate dependency updates:

- Create `.github/dependabot.yml`
- Configure update frequency (weekly)
- Group updates by type (production, dev)
- Auto-merge patch updates

**Configuration**:

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"
```

#### 16. Security Scanning

**Priority**: High  
**Effort**: Low (2 hours)

Add security checks:

- Enable GitHub Security Advisories
- Add `npm audit` to CI pipeline
- Configure Snyk or Socket.dev
- Weekly security reports

---

## v1.0.0 - Production Hardening

**Target**: 8-12 months after v0.1.0  
**Focus**: Stability, performance, and enterprise features

### Advanced Features

#### 17. Monorepo Support

**Priority**: Medium  
**Effort**: Very High (20-25 hours)

Support workspace configurations:

- Turborepo integration
- Nx workspace option
- Shared packages structure
- Unified build pipeline

#### 18. Custom Template Support

**Priority**: High  
**Effort**: High (12-15 hours)

Allow users to use custom templates:

```bash
npx create-nextjs-stack my-app --template https://github.com/user/custom-template
```

**Features**:

- Template validation
- Schema definition for custom templates
- Template marketplace/registry

#### 19. Interactive Configuration Wizard

**Priority**: Medium  
**Effort**: High (10-12 hours)

Enhanced CLI experience:

- Multi-step wizard with progress indicator
- Preview of selected stack
- Dependency size estimation
- Setup time estimation

#### 20. Plugin System

**Priority**: Low  
**Effort**: Very High (25-30 hours)

Extensible architecture:

- Plugin API for third-party integrations
- Official plugins (Stripe, Auth0, Sentry)
- Plugin discovery and installation
- Plugin configuration management

### Documentation Site

#### 21. Dedicated Documentation Website

**Priority**: Medium  
**Effort**: High (15-20 hours)

Create comprehensive docs site:

- Use Nextra or Docusaurus
- API reference
- Interactive examples
- Video tutorials
- Search functionality

**Structure**:

```
docs-site/
├── getting-started/
├── templates/
│   ├── web.md
│   ├── admin.md
│   └── full-stack.md
├── customization/
├── deployment/
└── api-reference/
```

---

## Future Considerations

### Long-term Ideas (v2.0.0+)

1. **GUI Application**
   - Electron-based desktop app
   - Visual template customization
   - Project management dashboard

2. **Cloud Integration**
   - One-click cloud deployments
   - Automated CI/CD setup
   - Infrastructure as Code generation

3. **AI-Powered Features**
   - Smart template recommendations
   - Code generation assistance
   - Automated testing suggestions

4. **Enterprise Features**
   - Team templates
   - Organization-wide presets
   - Compliance and security templates

---

## Implementation Priority Matrix

| Feature              | Priority | Effort | Impact    | Version |
| -------------------- | -------- | ------ | --------- | ------- |
| CONTRIBUTING.md      | High     | Low    | High      | v0.2.0  |
| Issue Templates      | High     | Low    | High      | v0.2.0  |
| PR Template          | High     | Low    | Medium    | v0.2.0  |
| Demo Video           | Medium   | Medium | High      | v0.2.0  |
| TypeScript/JS Choice | High     | High   | High      | v0.3.0  |
| ESLint/Prettier      | High     | Medium | High      | v0.3.0  |
| Unit Tests           | High     | High   | High      | v0.4.0  |
| Dependabot           | High     | Low    | Medium    | v0.4.0  |
| Custom Templates     | High     | High   | Very High | v1.0.0  |
| Docs Site            | Medium   | High   | High      | v1.0.0  |

---

## Getting Started with Enhancements

To contribute to any of these enhancements:

1. Check the [GitHub Issues](https://github.com/mburakaltiparmak/create-nextjs-stack/issues) for existing discussions
2. Create a new issue if the enhancement isn't listed
3. Fork the repository and create a feature branch
4. Follow the guidelines in CONTRIBUTING.md (once created)
5. Submit a pull request with clear description

---

**Last Updated**: February 2026  
**Maintainer**: Mehmet Burak Altıparmak (@mburakaltiparmak)
