#!/usr/bin/env python3
"""Offline, standard-library EPUB-spine / TXT-in-ZIP reader for TB-004.

Never extracts archive paths or executes book content. Keep original archives too.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path, PurePosixPath
import posixpath
import re
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET
import zipfile


def digest(b):
    return hashlib.sha256(b).hexdigest()


def xml(b):
    if re.search(br'<!\s*(DOCTYPE|ENTITY)', b, re.I):
        raise ValueError('DTD/entities are not permitted')
    return ET.fromstring(b)


def member_path(base, href):
    u = urlsplit(href)
    if u.scheme or u.netloc:
        raise ValueError('External spine path is not permitted')
    p = posixpath.normpath(posixpath.join(posixpath.dirname(base), unquote(u.path)))
    if p.startswith(('/', '../')) or '\\' in p:
        raise ValueError('Unsafe archive path')
    return p


class BodyReader(HTMLParser):
    blocks = {'p', 'div', 'section', 'article', 'li', 'dt', 'dd', 'blockquote',
              'pre', 'figcaption', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}

    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.filename = filename
        self.in_body = False
        self.skip = 0
        self.buf = []
        self.lines = []
        self.headings = []
        self.heading_level = None
        self.images = []
        self.links = []
        self.anchors = []

    def flush(self):
        s = re.sub(r'\s+', ' ', ''.join(self.buf)).strip()
        self.buf = []
        if s:
            if self.heading_level:
                self.headings.append({'line': len(self.lines) + 1, 'title': s,
                                      'level': self.heading_level, 'document': self.filename})
            self.lines.append(s)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'body':
            self.in_body = True
        if not self.in_body:
            return
        if tag in {'script', 'style'}:
            self.skip += 1
            return
        if self.skip:
            return
        if tag in self.blocks or tag == 'br':
            self.flush()
        if re.fullmatch('h[1-6]', tag):
            self.heading_level = int(tag[1])
        if a.get('id'):
            self.anchors.append({'id': a['id'], 'line': len(self.lines) + 1})
        if tag in {'td', 'th'} and self.buf:
            self.buf.append(' | ')
        if tag == 'img':
            src = a.get('src', '')
            self.images.append({'src': src, 'alt': a.get('alt', '')})
            self.buf.append('[Изображение: ' + src + ('; ' + a['alt'] if a.get('alt') else '') + ']')
        if tag == 'image':
            src = a.get('xlink:href', a.get('href', ''))
            self.images.append({'src': src, 'alt': ''})
            self.buf.append('[Изображение: ' + src + ']')
        if tag == 'a' and a.get('href'):
            self.links.append({'href': a['href'], 'line': len(self.lines) + 1,
                               'noteref': a.get('epub:type') == 'noteref' or a.get('role') == 'doc-noteref'})

    def handle_endtag(self, tag):
        if tag in {'script', 'style'} and self.skip:
            self.skip -= 1
            return
        if not self.in_body or self.skip:
            return
        if tag in self.blocks or tag == 'body':
            self.flush()
        if re.fullmatch('h[1-6]', tag):
            self.heading_level = None
        if tag == 'body':
            self.in_body = False

    def handle_data(self, data):
        if self.in_body and not self.skip:
            self.buf.append(data)


def decode_txt(b):
    if b.startswith((b'\xff\xfe', b'\xfe\xff')):
        return b.decode('utf-16'), 'utf-16'
    try:
        return b.decode('utf-8-sig'), 'utf-8-sig'
    except UnicodeDecodeError:
        return b.decode('cp1251'), 'cp1251'


def extract(path, source_id):
    path = Path(path)
    raw = path.read_bytes()
    meta = {'id': source_id, 'input_bytes': len(raw), 'input_sha256': digest(raw)}
    with zipfile.ZipFile(path) as z:
        if sum(i.file_size for i in z.infolist()) > 128 * 1024 * 1024:
            raise ValueError('Archive exceeds the explicit size limit')
        bad = z.testzip()
        if bad:
            raise ValueError('CRC error in ' + bad)
        meta['members'] = [{'name': i.filename, 'bytes': i.file_size,
                            'sha256': digest(z.read(i))} for i in z.infolist() if not i.is_dir()]
        meta['archive_crc_ok'] = True
        names = z.namelist()
        if 'META-INF/container.xml' in names:
            if z.read('mimetype').strip() != b'application/epub+zip':
                raise ValueError('EPUB mimetype mismatch')
            container = xml(z.read('META-INF/container.xml'))
            opf = container.find('.//{*}rootfile').get('full-path')
            if str(PurePosixPath(opf)).startswith(('/', '../')):
                raise ValueError('Unsafe package path')
            package = xml(z.read(opf))
            md = package.find('{*}metadata')
            get = lambda name: [''.join(e.itertext()).strip() for e in md.findall('{*}' + name)]
            meta.update(input_format='epub', title=re.sub(r'\s+', ' ', get('title')[0]),
                        author=re.sub(r'\s+', ' ', '; '.join(get('creator'))), encoding='utf-8')
            man = {e.get('id'): e for e in package.find('{*}manifest')}
            spine = [member_path(opf, man[e.get('idref')].get('href')) for e in package.find('{*}spine')]
            lines, headings, documents = [], [], []
            for name in spine:
                parser = BodyReader(name)
                parser.feed(z.read(name).decode('utf-8-sig'))
                parser.close()
                parser.flush()
                lines.append('[Документ EPUB: ' + name + ']')
                offset = len(lines)
                headings.extend({**h, 'line': h['line'] + offset} for h in parser.headings)
                documents.append({'path': name, 'first_line': offset + 1,
                                  'last_line': offset + len(parser.lines),
                                  'sha256': digest(z.read(name)), 'images': parser.images,
                                  'links': parser.links, 'anchors': parser.anchors})
                lines.extend(parser.lines)
            text = '\n'.join(lines) + '\n'
            meta.update(spine=spine, documents=documents, headings=headings,
                        images=sum(len(d['images']) for d in documents),
                        preservation='All spine bodies in package reading order, mixed inline text, image markers; original bytes retained. Navigation/metadata/assets retained in original, not substituted for body text.')
        else:
            members = [n for n in names if n.lower().endswith('.txt') and not n.endswith('/')]
            if len(members) != 1:
                raise ValueError('Expected exactly one TXT member; refuse to guess')
            name = members[0]
            text, encoding = decode_txt(z.read(name))
            text = text.replace('\r\n', '\n').replace('\r', '\n')
            if not text.endswith('\n'):
                text += '\n'
            nonempty = [l.strip() for l in text.splitlines() if l.strip()]
            author, title = nonempty[:2]
            if 'Давайте договоримся на берегу' in title:
                title = title.split('Давайте договоримся на берегу', 1)[0].strip()
            headings = []
            for i, l in enumerate(text.splitlines(), 1):
                s = l.strip()
                if s and len(s) < 150 and re.match(r'^(Часть\s|Глава\s|Книга\s|Раздел\s|Введение$|Заключение$|Предисловие|Эпилог$|Содержание$)', s, re.I):
                    headings.append({'line': i, 'title': s, 'level': 1 if s.startswith('Часть') else 2})
            meta.update(input_format='zip+txt', archive_member_name=name, encoding=encoding,
                        author=author, title=title, headings=headings,
                        text_member_sha256=digest(z.read(name)), text_member_bytes=len(z.read(name)),
                        images=len(re.findall(r'\[Картинка\s*:', text)),
                        preservation='Complete TXT including preface, advertising, images-as-markers and end sections; only BOM/newline normalization. Headings are a navigation aid, not a claim of reconstructed typography.')
    if '\ufffd' in text:
        raise ValueError('Replacement character detected')
    meta.update(bytes=len(text.encode('utf-8')), lines=len(text.splitlines()),
                words=len(text.split()), sha256=digest(text.encode('utf-8')))
    return text, meta


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('input')
    ap.add_argument('output')
    ap.add_argument('--source-id', required=True)
    args = ap.parse_args()
    text, meta = extract(args.input, args.source_id)
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(text, encoding='utf-8')
    out.with_suffix('.index.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: meta[k] for k in ['id', 'input_format', 'title', 'author', 'words', 'sha256']}, ensure_ascii=False))
