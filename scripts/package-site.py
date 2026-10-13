#!/usr/bin/env python3
"""Export tracked public files; preview is the default deployment mode."""
import argparse
from pathlib import Path
import re
import subprocess

ROOT_FILES = {'index.html', '404.html', 'favicon.ico', 'favicon.svg', 'robots.txt', 'sitemap.xml'}
PAGE_DIRS = {'blog', 'cases', 'en', 'privacy', 'utm', 'prompts'}
ASSET_EXTENSIONS = {'.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2', '.gif', '.avif'}


def public_file(name):
    path = Path(name)
    if path.is_absolute() or any(part.startswith('.') for part in path.parts):
        return False
    if name in ROOT_FILES:
        return True
    if path.parts[0] in PAGE_DIRS:
        return path.suffix == '.html'
    return path.parts[0] == 'assets' and path.suffix.lower() in ASSET_EXTENSIONS


def export(root, destination, preview=True):
    if destination.exists():
        raise ValueError('Output must be a new directory')
    names = subprocess.check_output(['git', 'ls-files', '-z'], cwd=str(root)).decode().split('\0')
    selected = [name for name in names if name and public_file(name)]
    if 'index.html' not in selected:
        raise ValueError('Missing tracked index.html')
    # Validate before writing: do not follow symlinks or copy out-of-repo files.
    for name in selected:
        source = root / name
        if not source.is_file() or source.resolve() != source.absolute():
            raise ValueError('Unsafe public file: ' + name)
    destination.mkdir(parents=True)
    for name in selected:
        data = (root / name).read_bytes()
        if preview and name.endswith('.html'):
            text = data.decode('utf-8')
            text = re.sub(r'<script\b[^>]*>[\s\S]*?</script>', lambda match: '' if 'mc.yandex.ru/metrika/tag.js' in match.group() else match.group(), text)
            text = re.sub(r'<noscript\b[^>]*>[\s\S]*?</noscript>', lambda match: '' if 'mc.yandex.ru/watch/' in match.group() else match.group(), text)
            text = text.replace('</head>', '<meta name="robots" content="noindex, nofollow">\n</head>')
            data = text.encode('utf-8')
        if preview and name == 'robots.txt':
            data = b'User-agent: *\nDisallow: /\n'
        target = destination / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    headers = ['DirectoryIndex index.html', '<IfModule mod_headers.c>', '  Header always set X-Content-Type-Options "nosniff"', '  Header always set X-Frame-Options "DENY"', '  Header always set Referrer-Policy "strict-origin-when-cross-origin"']
    if preview:
        headers.append('  Header always set X-Robots-Tag "noindex, nofollow"')
    headers.append('</IfModule>')
    (destination / '.htaccess').write_text('\n'.join(headers) + '\n')
    print('Exported {} public files ({}).'.format(len(selected), 'preview' if preview else 'production'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    parser.add_argument('--production', action='store_true')
    args = parser.parse_args()
    export(Path(__file__).resolve().parents[1], Path(args.output).absolute(), not args.production)
