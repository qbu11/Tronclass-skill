---
name: tronclass-academic-writer
description: |
  生成符合中文论文/作业格式的 DOCX 文档。用 python-docx 输出宋体正文、黑体标题、
  规范表格、数据分析结果。搭配 tronclass-homework 可直接提交。Use when the user
  needs to write homework, generate a report, create a DOCX assignment, or mentions
  "写作业", "生成报告", "导出文档", "论文格式", "交作业".
allowed-tools: Bash Read Write
---

# 中文学术文档生成

用 `python-docx` 生成符合中文大学作业/论文格式的 DOCX 文件。

## Requirements

```bash
pip install python-docx networkx pandas openpyxl matplotlib
```

## 文档格式规范

### 字体规则

| 元素 | 字体 | 字号 |
|------|------|------|
| 标题（heading 1） | 黑体 | 小二（18pt） |
| 二级标题（heading 2） | 黑体 | 小三（15pt） |
| 三级标题（heading 3） | 黑体 | 四号（14pt） |
| 正文 | 宋体 | 小四（12pt） |
| 表格内容 | 宋体 | 五号（10.5pt） |

### Python 生成模板

```python
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()

# 设置默认字体
style = doc.styles['Normal']
style.font.size = Pt(12)
# 注意：python-docx 对中文字体名支持有限，
# 设置 font.name 可能不生效，但生成的 docx 在 Word 中打开后可手动调整
# 或通过 style.font.name 配合 style.element.rPr 设置

# 封面信息
title = doc.add_heading('论文/作业标题', level=1)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
doc.add_paragraph('姓名：xxx    学号：xxx    日期：xxxx年x月x日')
doc.add_paragraph('')

# 正文段落
doc.add_heading('一、研究背景', level=2)
doc.add_paragraph('正文内容...')

# 数据表格
table = doc.add_table(rows=4, cols=3)
table.style = 'Table Grid'
headers = ['指标', '数值', '说明']
for j, h in enumerate(headers):
    table.cell(0, j).text = h
# 填入数据...

# 保存
doc.save('output.docx')
```

## 常见作业类型模板

### 数据分析报告

适用于：社会网络分析、统计学、数据科学等课程

```python
from docx import Document
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import networkx as nx
import numpy as np

def generate_network_analysis_report(
    title, author, student_id, date,
    networks,  # list of {name, graph, description}
    output_path
):
    doc = Document()
    doc.styles['Normal'].font.size = Pt(12)

    # 封面
    h = doc.add_heading(title, level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f'姓名：{author}    学号：{student_id}    日期：{date}')
    doc.add_paragraph('')

    for net in networks:
        G = net['graph']
        doc.add_heading(net['name'], level=2)
        doc.add_paragraph(net['description'])

        # 基本特征
        doc.add_paragraph(f'节点数：{G.number_of_nodes()}，边数：{G.number_of_edges()}')
        doc.add_paragraph(f'网络密度：{nx.density(G):.4f}')

        connected = nx.is_connected(G)
        doc.add_paragraph(f'连通性：{"连通图" if connected else "非连通图"}')

        if connected:
            doc.add_paragraph(f'直径：{nx.diameter(G)}')
            doc.add_paragraph(f'平均路径长度：{nx.average_shortest_path_length(G):.4f}')

        doc.add_paragraph(f'平均聚类系数：{nx.average_clustering(G):.4f}')
        doc.add_paragraph(f'传递性：{nx.transitivity(G):.4f}')

        # 中心性表格
        dc = nx.degree_centrality(G)
        bc = nx.betweenness_centrality(G)
        cc = nx.closeness_centrality(G)

        doc.add_heading('中心性指标', level=3)
        top_n = min(10, G.number_of_nodes())
        table = doc.add_table(rows=top_n+1, cols=4)
        table.style = 'Table Grid'
        for j, h in enumerate(['节点', '度中心性', '中间中心性', '接近中心性']):
            table.cell(0, j).text = h
        for i, (node, val) in enumerate(sorted(dc.items(), key=lambda x:-x[1])[:top_n]):
            table.cell(i+1, 0).text = str(node)
            table.cell(i+1, 1).text = f'{val:.4f}'
            table.cell(i+1, 2).text = f'{bc[node]:.4f}'
            table.cell(i+1, 3).text = f'{cc[node]:.4f}'

        doc.add_paragraph('')

    doc.save(output_path)
    return output_path
```

### 文献综述/课程论文

适用于：传播学、社会学、人文社科课程

```python
def generate_essay(title, author, student_id, date, sections, output_path):
    """
    sections: list of {heading, content, level}
    content 可以是字符串或列表（列表会变成要点）
    """
    doc = Document()
    doc.styles['Normal'].font.size = Pt(12)

    h = doc.add_heading(title, level=1)
    h.alignment = WD_ALIGN_PARAGRAPH.CENTER
    doc.add_paragraph(f'姓名：{author}    学号：{student_id}    日期：{date}')

    for sec in sections:
        doc.add_heading(sec['heading'], level=sec.get('level', 2))
        if isinstance(sec['content'], list):
            for item in sec['content']:
                doc.add_paragraph(item, style='List Bullet')
        else:
            for para in sec['content'].split('\n\n'):
                doc.add_paragraph(para.strip())

    doc.save(output_path)
    return output_path
```

## 与 TronClass 集成

生成文档后直接提交：

```bash
# 1. 生成 DOCX（由 AI 执行 Python 脚本）
# 2. 提交到 TronClass
agent-browser --session-name cuc open "https://courses.cuc.edu.cn/course/{cid}/learning-activity#/{aid}"
agent-browser --session-name cuc click "a.submit-homework"
agent-browser --session-name cuc upload "input[type=file] >> nth=5" "/path/to/output.docx"
agent-browser --session-name cuc eval "document.querySelector('.button-green.left-group-buttons')?.click()"
```

## 注意事项

- python-docx 生成的文件默认用 Calibri 字体，在 Word 中打开后会按系统字体显示中文
- 如需严格控制字体，需要操作 XML 层（`run.font.name` + `run._element.rPr`）
- 表格建议用 'Table Grid' 样式，显示边框清晰
- 图片插入用 `doc.add_picture(path, width=Cm(14))`
