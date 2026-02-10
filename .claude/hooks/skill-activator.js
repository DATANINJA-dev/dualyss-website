#!/usr/bin/env node
/**
 * Skill Activator Hook
 *
 * UserPromptSubmit hook that dynamically lists available skills
 * and injects a reminder for Claude to analyze and use relevant ones.
 *
 * This hook adapts automatically as new skills are added to .claude/skills/
 */

const fs = require('fs');
const path = require('path');

/**
 * Read JSON from stdin (Claude Code hook format)
 */
function readStdin() {
  try {
    const fd = fs.openSync(0, 'r');
    const buffer = Buffer.alloc(65536);
    let data = '';
    let bytesRead;

    try {
      while ((bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null)) > 0) {
        data += buffer.toString('utf8', 0, bytesRead);
      }
    } catch (e) {
      if (e.code !== 'EAGAIN' && e.code !== 'EOF') {
        // Ignore read errors
      }
    }

    return data.trim();
  } catch (e) {
    return '';
  }
}

/**
 * Get skill info from SKILL.md frontmatter
 */
function getSkillInfo(skillDir) {
  const skillPath = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillPath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(skillPath, 'utf-8');
    const lines = content.split('\n');

    // Extract name and description from frontmatter
    let inFrontmatter = false;
    let name = path.basename(skillDir);
    let description = '';

    for (const line of lines) {
      if (line.trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
          continue;
        } else {
          break; // End of frontmatter
        }
      }

      if (inFrontmatter) {
        if (line.startsWith('name:')) {
          name = line.replace('name:', '').trim().replace(/['"]/g, '');
        }
        if (line.startsWith('description:')) {
          description = line.replace('description:', '').trim().replace(/['"]/g, '');
          // Handle multi-line description with |
          if (description === '|' || description === '') {
            description = '';
          }
        } else if (description === '' && line.trim() && !line.includes(':')) {
          // Continuation of multi-line description
          description = line.trim();
        }
      }
    }

    // If no frontmatter description, get first paragraph after frontmatter
    if (!description) {
      let afterFrontmatter = false;
      let frontmatterCount = 0;
      for (const line of lines) {
        if (line.trim() === '---') {
          frontmatterCount++;
          if (frontmatterCount === 2) {
            afterFrontmatter = true;
            continue;
          }
        }
        if (afterFrontmatter && line.trim() && !line.startsWith('#')) {
          description = line.trim().substring(0, 150);
          break;
        }
      }
    }

    return { name, description: description.substring(0, 150) };
  } catch (e) {
    return { name: path.basename(skillDir), description: '' };
  }
}

/**
 * List all skills from .claude/skills directory
 */
function listSkills(projectDir) {
  const skillsDir = path.join(projectDir, '.claude', 'skills');

  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  const skills = [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillInfo = getSkillInfo(path.join(skillsDir, entry.name));
      if (skillInfo) {
        skills.push(skillInfo);
      }
    }
  }

  return skills;
}

/**
 * Main hook logic
 */
function main() {
  const stdinData = readStdin();

  if (!stdinData) {
    process.exit(0);
  }

  let hookData;
  try {
    hookData = JSON.parse(stdinData);
  } catch (e) {
    process.exit(0);
  }

  const prompt = hookData.prompt || '';
  const cwd = hookData.cwd || process.cwd();

  // Skip for very short prompts (likely commands or simple questions)
  if (prompt.length < 20) {
    process.exit(0);
  }

  // Skip for meta-questions about skills themselves
  const skipPatterns = [
    /what skills/i,
    /list skills/i,
    /show skills/i,
    /available skills/i,
    /skill activat/i
  ];

  if (skipPatterns.some(pattern => pattern.test(prompt))) {
    process.exit(0);
  }

  // Get available skills
  const skills = listSkills(cwd);

  if (skills.length === 0) {
    process.exit(0);
  }

  // Format skills list
  const skillList = skills
    .map(s => `  - **${s.name}**: ${s.description || '(no description)'}`)
    .join('\n');

  // Create the context injection
  const context = `
## 🎯 SKILL CHECK REQUIRED

Before proceeding with this task, you MUST:

1. **Review the available skills below** and identify which ones are relevant
2. **Read the SKILL.md** of relevant skills using: \`Read .claude/skills/<skill-name>/SKILL.md\`
3. **Apply patterns** from those skills in your implementation

### Available Skills (${skills.length} total):

${skillList}

### How to Use:
- For API work: Read api-design, nextjs-app-router
- For database: Read database-design, supabase-patterns
- For auth: Read security-auth, security-patterns
- For UI: Read shadcn-ui, ux-standards
- For tests: Read tdd-workflow, testing-patterns

**This is not optional.** Skills contain project-specific patterns that MUST be followed.
`;

  // Output JSON with additionalContext
  const output = {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: context
    }
  };

  console.log(JSON.stringify(output));
  process.exit(0);
}

main();
