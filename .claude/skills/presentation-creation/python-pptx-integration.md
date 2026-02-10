# python-pptx Integration

> Programmatic PowerPoint generation using the industry-standard python-pptx library.
> Source: Audit 2026-01-19T16-45-00-pres

## Installation

```bash
pip install python-pptx
```

## Template-Based Workflow

The recommended approach is template-based generation:

### 1. Prepare Template
- Create a .pptx file with your desired theme/branding
- Delete all slides (keep only the slide master with layouts)
- Save as `template.pptx`

### 2. Discover Layouts
Analyze available slide layouts in your template:

```python
from pptx import Presentation

prs = Presentation('template.pptx')
for i, layout in enumerate(prs.slide_layouts):
    print(f"Layout {i}: {layout.name}")
    for shape in layout.placeholders:
        print(f"  - Placeholder {shape.placeholder_format.idx}: {shape.name}")
```

### 3. Map Content to Placeholders
Create a JSON structure mapping your content to placeholder indices:

```json
{
  "template": "template.pptx",
  "slides": [
    {
      "layout_index": 0,
      "content": {
        "title": "Q3 Sales Exceeded Target by 15%",
        "subtitle": "Executive Summary - October 2026"
      }
    },
    {
      "layout_index": 1,
      "content": {
        "title": "Three Factors Drove Outperformance",
        "body": [
          "New enterprise accounts (+$2.3M)",
          "Reduced churn rate (8% to 5%)",
          "Upsell revenue growth (+18%)"
        ]
      }
    }
  ]
}
```

### 4. Generate Presentation

```python
from pptx import Presentation
from pptx.util import Inches, Pt

def generate_presentation(template_path, content, output_path):
    """Generate PowerPoint from template and content mapping."""
    prs = Presentation(template_path)

    for slide_data in content['slides']:
        layout = prs.slide_layouts[slide_data['layout_index']]
        slide = prs.slides.add_slide(layout)

        # Fill title (shortcut access)
        if 'title' in slide_data['content']:
            slide.shapes.title.text = slide_data['content']['title']

        # Fill subtitle/body via placeholder index
        if 'subtitle' in slide_data['content']:
            slide.placeholders[1].text = slide_data['content']['subtitle']

        # Fill body text (bullet points)
        if 'body' in slide_data['content']:
            body = slide.placeholders[1]
            tf = body.text_frame
            for i, point in enumerate(slide_data['content']['body']):
                if i == 0:
                    tf.text = point
                else:
                    p = tf.add_paragraph()
                    p.text = point

    prs.save(output_path)
    return output_path

# Usage
content_mapping = {
    "slides": [
        {"layout_index": 0, "content": {"title": "Q3 Results", "subtitle": "October 2026"}}
    ]
}
generate_presentation('template.pptx', content_mapping, 'Q3_Sales_Report.pptx')
```

## Placeholder Access Patterns

### Title Shortcut
```python
slide.shapes.title.text = "Your Action Title"
```

### Index-Based Access
```python
# Access by placeholder index (stable across templates)
subtitle = slide.placeholders[1]
body = slide.placeholders[2]
```

### Important: Reference Invalidation
After inserting content into certain placeholders, the original reference becomes invalid:

```python
# WRONG - reference may be invalid after insert
picture_placeholder = slide.placeholders[10]
picture_placeholder.insert_picture('chart.png')
picture_placeholder.width = Inches(5)  # May fail!

# CORRECT - use returned reference
picture_placeholder = slide.placeholders[10]
picture = picture_placeholder.insert_picture('chart.png')
picture.width = Inches(5)  # Works!
```

## Advanced: Data Pipeline Integration

Combine with pandas and matplotlib for data-driven presentations:

```python
import pandas as pd
import matplotlib.pyplot as plt
from pptx import Presentation
from pptx.util import Inches
import io

# Generate chart from data
df = pd.DataFrame({'Quarter': ['Q1', 'Q2', 'Q3'], 'Sales': [100, 120, 138]})
fig, ax = plt.subplots()
df.plot(kind='bar', x='Quarter', y='Sales', ax=ax)
ax.set_title('Quarterly Sales')

# Save chart to bytes
img_stream = io.BytesIO()
fig.savefig(img_stream, format='png', dpi=150, bbox_inches='tight')
img_stream.seek(0)

# Add to presentation
prs = Presentation('template.pptx')
slide = prs.slides.add_slide(prs.slide_layouts[5])  # Blank layout
slide.shapes.add_picture(img_stream, Inches(1), Inches(1.5), width=Inches(8))
prs.save('data_report.pptx')
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `KeyError` on placeholder access | Use `slide.placeholders[idx]` with correct index from layout analysis |
| Chart/picture appears wrong size | Use returned reference after `insert_picture()` to set dimensions |
| Text formatting lost | Set paragraph formatting after adding text, not before |
| Layout not found | Check available layouts with discovery script above |

## References

- [python-pptx Documentation](https://python-pptx.readthedocs.io/)
- [Working with Placeholders](https://python-pptx.readthedocs.io/en/latest/user/placeholders-using.html)
- [Practical Business Python Tutorial](https://pbpython.com/creating-powerpoint.html)
