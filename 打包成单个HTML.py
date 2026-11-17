# -*- coding: utf-8 -*-
"""
把 Vite 打包出来的 dist 合成一个真正的单文件 HTML。
用法：
  1. 先在终端跑 npm run build
  2. 再跑 python 打包成单个HTML.py
生成 output/知题-单文件版.html，双击就能用，不用装任何环境。
"""

import os
import re
import glob

root = os.path.dirname(os.path.abspath(__file__))
dist = os.path.join(root, 'dist')
out_dir = os.path.join(root, 'output')
out_file = os.path.join(out_dir, '知题-单文件版.html')

with open(os.path.join(dist, 'index.html'), 'r', encoding='utf-8') as f:
    html = f.read()

js_files = glob.glob(os.path.join(dist, 'assets', '*.js'))
css_files = glob.glob(os.path.join(dist, 'assets', '*.css'))
if not js_files:
    raise SystemExit('没找到打包后的 JS，请先运行 npm run build')

with open(js_files[0], 'r', encoding='utf-8') as f:
    js_code = f.read()
css_code = ''
if css_files:
    with open(css_files[0], 'r', encoding='utf-8') as f:
        css_code = f.read()

# 防止 JS 里的 </script> 提前闭合内联标签
js_code = js_code.replace('</script', '<\\/script')

# 整段替换外部 script 标签为内联代码（兼容 /assets/ 和 ./assets/ 两种路径）
html, n_js = re.subn(
    r'<script\b[^>]*\bsrc=["\'][^"\']*\.js["\'][^>]*>\s*</script>',
    lambda m: '<script type="module">\n' + js_code + '\n</script>',
    html, count=1
)
# 整段替换外部 link 标签为内联样式
html, n_css = re.subn(
    r'<link\b[^>]*\bhref=["\'][^"\']*\.css["\'][^>]*>',
    lambda m: '<style>\n' + css_code + '\n</style>',
    html, count=1
)

if n_js == 0:
    raise SystemExit('没找到 JS 引用标签，打包结构可能变了')

if not os.path.exists(out_dir):
    os.makedirs(out_dir)
with open(out_file, 'w', encoding='utf-8') as f:
    f.write(html)

print('已生成：' + out_file)
print('大小：%.1f KB' % (os.path.getsize(out_file) / 1024))
print('内联 JS 标签数：%d，内联 CSS 标签数：%d' % (n_js, n_css))
print('把这一个文件发给别人，双击即可打开。')
