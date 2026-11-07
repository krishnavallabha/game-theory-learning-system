"""Concatenate dashboard sources into one self-contained HTML file."""
import io, os, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(ROOT, 'src')
rd = lambda f: io.open(os.path.join(D, f), encoding='utf-8').read()
# Order matters: helpers and registries first, then week content, then PYQs/reference data, then the app.
# To add a week, create src/data_w5.js (etc.) and insert it after data_w4.js.
JS = ['helpers.js', 'data_core.js',
      'data_w1.js', 'data_w2.js', 'data_w3.js', 'data_w4.js',
      'data_pyq.js', 'data_extra.js', 'app.js']
html = rd('index.tpl.html').replace('/*__CSS__*/', rd('styles.css')).replace('/*__JS__*/', '\n'.join(rd(f) for f in JS))
assert '</script' not in '\n'.join(rd(f) for f in JS).lower(), 'a source contains </script'
os.makedirs(os.path.join(ROOT, 'public'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'index.html')
io.open(out, 'w', encoding='utf-8').write(html)
print('wrote', os.path.normpath(out), len(html.encode('utf-8')), 'bytes')
