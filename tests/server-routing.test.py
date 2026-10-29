"""Exercise exported production rules with a disposable local Apache, never Timeweb."""
import importlib.util
import http.client
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import unittest

spec = importlib.util.spec_from_file_location('package_site', Path(__file__).resolve().parents[1] / 'scripts/package-site.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)
MODULES = Path('/usr/libexec/apache2')


@unittest.skipUnless(shutil.which('httpd') and (MODULES / 'mod_rewrite.so').exists(), 'Local Apple Apache modules unavailable')
class ProductionRoutingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='smirnov-routing-')
        cls.base = Path(cls.temp.name).resolve()
        repo = cls.base / 'repo'
        repo.mkdir()
        subprocess.run(['git', 'init', '-q', str(repo)], check=True)
        for name, text in {'index.html': '<h1>Home</h1>', 'privacy/index.html': '<h1>Privacy</h1>',
                           'privacy/space dir/index.html': '<h1>Encoded path</h1>',
                           '404.html': '<h1>Custom not found</h1>'}.items():
            target = repo / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text)
        subprocess.run(['git', 'add', '.'], cwd=repo, check=True)
        cls.site = cls.base / 'site'
        package.export(repo, cls.site, False)
        preview = cls.base / 'preview'
        package.export(repo, preview, True)
        token = cls.site / '.well-known/acme-challenge/audit-token'
        token.parent.mkdir(parents=True)
        token.write_text('existing-challenge')
        (cls.site / 'index.htm').write_text('old-host-placeholder')
        with socket.socket() as sock:
            sock.bind(('127.0.0.1', 0))
            cls.port = sock.getsockname()[1]
        modules = ['mpm_prefork', 'unixd', 'authz_core', 'authz_host', 'dir', 'mime', 'headers', 'rewrite']
        config = '\n'.join([
            'ServerRoot "' + str(cls.base) + '"',
            'Listen 127.0.0.1:' + str(cls.port),
            'ServerName http://smirnovads.com:' + str(cls.port),
            'PidFile "' + str(cls.base / 'httpd.pid') + '"',
            'ErrorLog "' + str(cls.base / 'error.log') + '"',
            *['LoadModule ' + module + '_module "' + str(MODULES / ('mod_' + module + '.so')) + '"' for module in modules],
            'DocumentRoot "' + str(cls.site) + '"',
            '<Directory "' + str(cls.base) + '">',
            'AllowOverride All', 'Require all granted', '</Directory>',
            '<VirtualHost 127.0.0.1:' + str(cls.port) + '>',
            'ServerName smirnovads.com', 'ServerAlias www.smirnovads.com',
            'DocumentRoot "' + str(cls.site) + '"', '</VirtualHost>',
            '<VirtualHost 127.0.0.1:' + str(cls.port) + '>',
            'ServerName preview.smirnovads.com',
            'DocumentRoot "' + str(preview) + '"', '</VirtualHost>',
        ])
        cls.conf = cls.base / 'httpd.conf'
        cls.conf.write_text(config)
        subprocess.run(['httpd', '-t', '-f', str(cls.conf)], check=True, capture_output=True)
        cls.process = subprocess.Popen(['httpd', '-X', '-f', str(cls.conf)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        cls.addClassCleanup(cls.stop_server)
        for _ in range(50):
            try:
                cls.request('/')
                break
            except OSError:
                if cls.process.poll() is not None:
                    raise RuntimeError((cls.base / 'error.log').read_text())
                time.sleep(.05)
        else:
            raise RuntimeError('Local Apache did not become ready')

    @classmethod
    def stop_server(cls):
        cls.process.terminate()
        cls.process.wait(timeout=5)
        cls.temp.cleanup()

    @classmethod
    def request(cls, path, host='smirnovads.com'):
        conn = http.client.HTTPConnection('127.0.0.1', cls.port, timeout=3)
        conn.request('GET', path, headers={'Host': host})
        response = conn.getresponse()
        result = response.status, dict((k.lower(), v) for k, v in response.getheaders()), response.read().decode()
        conn.close()
        return result

    def test_directory_redirect_uses_https_and_preserves_query(self):
        status, headers, _ = self.request('/privacy?utm_source=telegram&next=%2Foffer%3Fa%3D1')
        self.assertEqual(status, 301)
        self.assertEqual(headers['location'], 'https://smirnovads.com/privacy/?utm_source=telegram&next=%2Foffer%3Fa%3D1')

    def test_www_redirect_preserves_path_and_query(self):
        status, headers, _ = self.request('/privacy/?utm_source=telegram', 'www.smirnovads.com')
        self.assertEqual(status, 301)
        self.assertEqual(headers['location'], 'https://smirnovads.com/privacy/?utm_source=telegram')

    def test_internal_directory_index_does_not_redirect(self):
        status, headers, body = self.request('/privacy/')
        self.assertEqual(status, 200)
        self.assertNotIn('location', headers)
        self.assertIn('<h1>Privacy</h1>', body)

    def test_explicit_index_redirect_does_not_capture_query_paths(self):
        status, headers, _ = self.request('/privacy/index.html?next=/other/index.html')
        self.assertEqual(status, 301)
        self.assertEqual(headers['location'], 'https://smirnovads.com/privacy/?next=/other/index.html')

    def test_encoded_directory_path_is_not_double_encoded(self):
        status, headers, _ = self.request('/privacy/space%20dir?value=a%26b')
        self.assertEqual(status, 301)
        self.assertEqual(headers['location'], 'https://smirnovads.com/privacy/space%20dir/?value=a%26b')

    def test_www_and_index_redirects_preserve_encoded_path(self):
        for path, host in [('/privacy/space%20dir/?value=a%26b', 'www.smirnovads.com'),
                           ('/privacy/space%20dir/index.html?value=a%26b', 'smirnovads.com')]:
            status, headers, _ = self.request(path, host)
            self.assertEqual(status, 301)
            self.assertEqual(headers['location'], 'https://smirnovads.com/privacy/space%20dir/?value=a%26b')

    def test_unknown_nested_url_uses_custom_404_with_404_status(self):
        status, _, body = self.request('/unknown/nested/path')
        self.assertEqual(status, 404)
        self.assertIn('Custom not found', body)

    def test_acme_is_not_redirected_even_on_www(self):
        status, headers, body = self.request('/.well-known/acme-challenge/audit-token', 'www.smirnovads.com')
        self.assertEqual((status, body), (200, 'existing-challenge'))
        self.assertNotIn('location', headers)

    def test_host_placeholder_redirects_without_deleting_the_file(self):
        status, headers, _ = self.request('/index.htm?utm_source=test')
        self.assertEqual(status, 301)
        self.assertEqual(headers['location'], 'https://smirnovads.com/?utm_source=test')
        self.assertTrue((self.site / 'index.htm').exists())

    def test_preview_does_not_redirect_to_main_domain(self):
        status, headers, body = self.request('/', 'preview.smirnovads.com')
        self.assertEqual(status, 200)
        self.assertNotIn('location', headers)
        self.assertEqual(headers['x-robots-tag'], 'noindex, nofollow')
        self.assertIn('<h1>Home</h1>', body)


if __name__ == '__main__':
    unittest.main()
