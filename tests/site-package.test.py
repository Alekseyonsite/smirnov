"""Verify deployment exports and filesystem boundaries using a disposable repository."""
import importlib.util
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
