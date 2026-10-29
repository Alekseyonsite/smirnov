#!/usr/bin/env python3
"""Export tracked public files; preview is the default deployment mode."""
import argparse
import hashlib
import html
from pathlib import Path
import posixpath
import re
import subprocess
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT_FILES = {'index.html', '404.html', 'favicon.ico', 'favicon.svg', 'robots.txt', 'sitemap.xml'}
PAGE_DIRS = {'blog', 'cases', 'en', 'privacy', 'utm', 'prompts'}
ASSET_EXTENSIONS = {'.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2', '.gif', '.avif'}


def version_asset_urls(text, page, versions):
    """Invalidate HTML-linked local CSS/JS when their exported bytes change."""
    def replace(match):
        raw_url = html.unescape(match.group(3))
        url = urlsplit(raw_url)
        if url.scheme or url.netloc:
            return match.group(0)
        name = posixpath.normpath(posixpath.join(posixpath.dirname(page), url.path))
        if url.path.startswith('/'):
            name = posixpath.normpath(url.path).lstrip('/')
        if name not in versions:
            return match.group(0)
        query = [(key, value) for key, value in parse_qsl(url.query, keep_blank_values=True) if key != 'v']
        query.append(('v', versions[name]))
        updated = urlunsplit(('', '', url.path, urlencode(query), url.fragment))
        return match.group(1) + match.group(2) + html.escape(updated, quote=True) + match.group(2)

    return re.sub(r'''(\b(?:src|href)\s*=\s*)(["'])([^"']*)\2''', replace, text)


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
    contents = {name: (root / name).read_bytes() for name in selected}
    versions = {name: hashlib.sha256(data).hexdigest()[:12] for name, data in contents.items()
                if name.startswith('assets/') and Path(name).suffix in {'.css', '.js', '.mjs'}}
    destination.mkdir(parents=True)
    for name in selected:
        data = contents[name]
        if name.endswith('.html'):
            data = version_asset_urls(data.decode('utf-8'), name, versions).encode('utf-8')
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
    if not preview:
        headers.extend([
            'ErrorDocument 404 /404.html',
            '<IfModule mod_rewrite.c>',
            '  RewriteEngine On',
            # Do not intercept certificate validation, including www challenges.
            r'  RewriteRule ^\.well-known/acme-challenge(?:/|$) - [END]',
            r'  RewriteCond %{HTTP_HOST} ^www\.smirnovads\.com(?::[0-9]+)?$ [NC]',
            '  RewriteRule ^ https://smirnovads.com%{REQUEST_URI} [R=301,L]',
            r'  RewriteRule ^index\.htm$ https://smirnovads.com/ [R=301,L]',
            # THE_REQUEST distinguishes explicit URLs from internal DirectoryIndex resolution.
            r'  RewriteCond %{THE_REQUEST} \s[^?\s]*/index\.html[?\s]',
            r'  RewriteCond %{REQUEST_URI} ^(.*/)index\.html$',
            '  RewriteRule ^ https://smirnovads.com%1 [R=301,L]',
            # Avoid mod_dir constructing an http:// Location behind the HTTPS reverse proxy.
            '  RewriteCond %{REQUEST_FILENAME} -d',
            '  RewriteCond %{REQUEST_URI} !/$',
            '  RewriteRule ^ https://smirnovads.com%{REQUEST_URI}/ [R=301,L]',
            '</IfModule>',
        ])
    (destination / '.htaccess').write_text('\n'.join(headers) + '\n')
    print('Exported {} public files ({}).'.format(len(selected), 'preview' if preview else 'production'))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    parser.add_argument('--production', action='store_true')
    args = parser.parse_args()
    export(Path(__file__).resolve().parents[1], Path(args.output).absolute(), not args.production)
