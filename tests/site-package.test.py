"""Verify deployment exports and filesystem boundaries using a disposable repository."""
import importlib.util
import hashlib
from pathlib import Path
import subprocess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('package_site', Path(__file__).resolve().parents[1] / 'scripts/package-site.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class SiteExportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = (Path(self.temp.name) / 'repo').resolve()
        self.root.mkdir()
        subprocess.run(['git', 'init', '-q', str(self.root)], check=True)
        self.put('index.html', '<head><script>load("https://mc.yandex.ru/metrika/tag.js");</script></head><body>Site</body>')
        self.put('robots.txt', 'User-agent: *\nAllow: /\n')
        self.put('assets/js/main.js', 'console.log("site");')
        self.put('assets/private.json', '{"secret":"do-not-deploy"}')
        self.put('docs/private.html', 'Internal notes')
        self.put('.env', 'secret')
        self.put('assets/.hidden/key.js', 'secret')
        subprocess.run(['git', 'add', '.'], cwd=str(self.root), check=True)

    def tearDown(self):
        self.temp.cleanup()

    def put(self, name, text):
        target = self.root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)

    def export(self, preview):
        output = Path(self.temp.name) / 'export'
        package.export(self.root, output, preview)
        return output

    def test_preview_omits_internal_files_and_counter(self):
        output = self.export(True)
        self.assertEqual(set(p.relative_to(output).as_posix() for p in output.rglob('*') if p.is_file()), {'index.html', 'robots.txt', 'assets/js/main.js', '.htaccess'})
        self.assertNotIn('mc.yandex.ru/metrika/tag.js', (output / 'index.html').read_text())
        self.assertIn('noindex, nofollow', (output / 'index.html').read_text())
        self.assertIn('Disallow: /', (output / 'robots.txt').read_text())

    def test_production_preserves_counter_and_robots(self):
        output = self.export(False)
        self.assertEqual((output / 'index.html').read_text(), (self.root / 'index.html').read_text())
        self.assertEqual((output / 'robots.txt').read_text(), (self.root / 'robots.txt').read_text())
        self.assertNotIn('noindex', (output / '.htaccess').read_text())

    def test_asset_urls_follow_content_without_rewriting_other_urls(self):
        self.put('utm/index.html', '<head><link href="../assets/js/main.js?v=old&amp;mode=one#part"></head>'
                 '<script src="https://example.com/assets/js/main.js?v=old"></script>'
                 '<a href="../privacy/?v=old">Privacy</a>')
        subprocess.run(['git', 'add', 'utm/index.html'], cwd=str(self.root), check=True)
        output = self.export(False)
        version = hashlib.sha256(b'console.log("site");').hexdigest()[:12]
        page = (output / 'utm/index.html').read_text()
        self.assertIn('../assets/js/main.js?mode=one&amp;v=' + version + '#part', page)
        self.assertIn('https://example.com/assets/js/main.js?v=old', page)
        self.assertIn('../privacy/?v=old', page)

    def test_changed_asset_changes_reference_but_identical_build_is_stable(self):
        self.put('index.html', '<head></head><script src="/assets/js/main.js"></script>')
        first = self.export(False)
        same = Path(self.temp.name) / 'same'
        package.export(self.root, same, False)
        self.assertEqual((first / 'index.html').read_bytes(), (same / 'index.html').read_bytes())
        self.put('assets/js/main.js', 'console.log("updated");')
        changed = Path(self.temp.name) / 'changed'
        package.export(self.root, changed, False)
        self.assertNotEqual((first / 'index.html').read_bytes(), (changed / 'index.html').read_bytes())

    def test_tracked_symlink_is_rejected_before_export(self):
        outside = Path(self.temp.name) / 'private.txt'
        outside.write_text('secret')
        link = self.root / 'assets' / 'leak.js'
        link.symlink_to(outside)
        subprocess.run(['git', 'add', 'assets/leak.js'], cwd=str(self.root), check=True)
        with self.assertRaisesRegex(ValueError, 'Unsafe public file'):
            self.export(True)
        self.assertFalse((Path(self.temp.name) / 'export').exists())

    def test_existing_output_is_not_overwritten(self):
        output = Path(self.temp.name) / 'export'
        output.mkdir()
        (output / 'keep.txt').write_text('keep')
        with self.assertRaisesRegex(ValueError, 'new directory'):
            package.export(self.root, output)
        self.assertEqual((output / 'keep.txt').read_text(), 'keep')


if __name__ == '__main__':
    unittest.main()
