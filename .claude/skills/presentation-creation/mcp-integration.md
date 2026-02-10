# MCP PowerPoint Integration

This document covers using MCP (Model Context Protocol) servers for PowerPoint automation within Claude Code workflows.

## When to Use MCP vs Direct python-pptx

| Scenario | MCP Server | Direct python-pptx |
|----------|------------|-------------------|
| Template + data fill | Preferred | Acceptable |
| Complex formatting | Limited | Preferred |
| AI workflow integration | Preferred | Manual scripting |
| Batch generation | Preferred | Acceptable |
| Custom layouts | Limited | Preferred |
| Cross-platform needs | Check server | Always works |

**Use MCP when**: You want Claude to directly manipulate presentations during conversation.

**Use python-pptx when**: You need complex layouts, custom shapes, or maximum control.

## Available MCP Servers

| Server | Platform | Features | Quality | Source |
|--------|----------|----------|---------|--------|
| Office-PowerPoint-MCP-Server | Cross-platform | 32 tools, python-pptx based | 9/10 | [GitHub](https://github.com/GongRzhe/Office-PowerPoint-MCP-Server) |
| PPT_MCP_Server | Windows (COM) | Full PowerPoint API | 8/10 | [GitHub](https://github.com/socamalo/PPT_MCP_Server) |
| pptx-xlsx-mcp | Cross-platform | Excel + PowerPoint | 8/10 | [MCP Directory](https://mcpservers.org) |
| mcp-ppt | Cross-platform | Natural language interface | 7/10 | [GitHub](https://github.com/seanmclemore/mcp-ppt) |

### Feature Comparison

| Feature | Office-PowerPoint-MCP | PPT_MCP_Server | pptx-xlsx-mcp |
|---------|----------------------|----------------|---------------|
| Create presentation | Yes | Yes | Yes |
| Template support | Yes | Yes | Limited |
| Add text/shapes | Yes | Yes | Yes |
| Charts/tables | Yes | Yes | Limited |
| Images | Yes | Yes | Yes |
| Animations | No | Yes (COM) | No |
| Master slides | Yes | Yes | No |
| Export PDF | Yes | Yes (COM) | No |

## Configuration

### Option 1: python-pptx Based (Cross-platform - Recommended)

Add to `.mcp.json`:

```json
{
  "mcpServers": {
    "powerpoint": {
      "command": "uvx",
      "args": ["office-powerpoint-mcp-server"],
      "env": {}
    }
  }
}
```

Or with pip installation:

```json
{
  "mcpServers": {
    "powerpoint": {
      "command": "python",
      "args": ["-m", "office_powerpoint_mcp_server"],
      "env": {}
    }
  }
}
```

### Option 2: COM-based (Windows Only)

For full PowerPoint API access on Windows:

```json
{
  "mcpServers": {
    "powerpoint": {
      "command": "python",
      "args": ["-m", "ppt_mcp_server"],
      "env": {
        "POWERPOINT_VISIBLE": "false"
      }
    }
  }
}
```

**Requirements**: Microsoft PowerPoint installed on Windows.

### Option 3: Combined Excel + PowerPoint

```json
{
  "mcpServers": {
    "office": {
      "command": "uvx",
      "args": ["pptx-xlsx-mcp"],
      "env": {}
    }
  }
}
```

## Template-Based Workflow

### Step 1: Initialize Session

```
PowerPoint:create_presentation()
```

Or open existing template:

```
PowerPoint:open_presentation(path: "template.pptx")
```

### Step 2: Enumerate Layouts

```
PowerPoint:list_slide_layouts()
```

Returns available layouts (Title Slide, Title and Content, etc.).

### Step 3: Add Slides

```
PowerPoint:add_slide(layout_index: 1)
```

Common layout indices:
- 0: Title Slide
- 1: Title and Content
- 2: Section Header
- 5: Blank
- 6: Content with Caption

### Step 4: Add Content

```
PowerPoint:add_text(
  slide_index: 0,
  text: "Quarterly Business Review",
  placeholder: "title"
)

PowerPoint:add_text(
  slide_index: 0,
  text: "Q4 2026 Results",
  placeholder: "subtitle"
)
```

### Step 5: Add Visual Elements

```
PowerPoint:add_table(
  slide_index: 1,
  rows: 4,
  cols: 3,
  data: [["Metric", "Q3", "Q4"], ["Revenue", "$1.2M", "$1.5M"], ...]
)

PowerPoint:add_chart(
  slide_index: 2,
  chart_type: "bar",
  data: {...}
)
```

### Step 6: Save and Export

```
PowerPoint:save_presentation(path: "output.pptx")

PowerPoint:export_pdf(path: "output.pdf")  # If supported
```

## Complete Example

Creating a simple status update presentation:

```
# 1. Create new presentation
PowerPoint:create_presentation()

# 2. Title slide
PowerPoint:add_slide(layout_index: 0)
PowerPoint:add_text(slide_index: 0, text: "Project Alpha Status", placeholder: "title")
PowerPoint:add_text(slide_index: 0, text: "Week 12 Update", placeholder: "subtitle")

# 3. Metrics slide
PowerPoint:add_slide(layout_index: 1)
PowerPoint:add_text(slide_index: 1, text: "Key Metrics", placeholder: "title")
PowerPoint:add_table(
  slide_index: 1,
  rows: 4,
  cols: 2,
  data: [
    ["Metric", "Value"],
    ["Sprint Velocity", "42 pts"],
    ["Bug Count", "3 critical"],
    ["Test Coverage", "87%"]
  ]
)

# 4. Save
PowerPoint:save_presentation(path: "status_update.pptx")
```

## Fallback Strategy

When MCP server is unavailable or insufficient:

### Level 1: Use document-skills:pptx

```
/skill document-skills:pptx
```

This skill provides direct PowerPoint generation capabilities.

### Level 2: Generate Structured Markdown

Create markdown that can be converted:

```markdown
---
title: "Presentation Title"
author: "Author Name"
---

# Slide 1: Title

Content here...

---

# Slide 2: Key Points

- Point 1
- Point 2
```

Convert with Marp or pandoc:
```bash
marp presentation.md -o output.pptx
```

### Level 3: Direct python-pptx Script

Generate a Python script for execution:

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title Here"
prs.save("output.pptx")
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MCP server not starting | Check `uvx` or `python` path in `.mcp.json` |
| COM error (Windows) | Ensure PowerPoint is installed and licensed |
| Permission denied | Check file path permissions |
| Template not found | Use absolute path or check working directory |
| Slide layout missing | Use `list_slide_layouts()` to see available options |

## See Also

- [python-pptx-integration.md](python-pptx-integration.md) - Direct scripting approach
- [mckinsey-templates.md](mckinsey-templates.md) - Template patterns
- [SKILL.md](SKILL.md) - Main skill documentation
