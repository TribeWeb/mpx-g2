#!/usr/bin/env python3
"""Run Docling OCR on scanned MPX G2 manual pages (image-only DigiPath PDF).

Default: PDF pages 91-110 (1-based) covering the start of chapter 7 effects.
Writes markdown + JSON under tmp/manual-docling/.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from docling.datamodel.base_models import InputFormat
from docling.datamodel.pipeline_options import (
  AcceleratorDevice,
  AcceleratorOptions,
  OcrMacOptions,
  PdfPipelineOptions,
)
from docling.document_converter import DocumentConverter, PdfFormatOption

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'public' / 'MPX_G2.pdf'
OUT = ROOT / 'tmp' / 'manual-docling'


def build_converter(*, images_scale: float) -> DocumentConverter:
  pipeline = PdfPipelineOptions(
    do_ocr=True,
    do_table_structure=True,
    images_scale=images_scale,
    generate_page_images=False,
    generate_picture_images=False,
    accelerator_options=AcceleratorOptions(device=AcceleratorDevice.AUTO),
    ocr_options=OcrMacOptions(
      lang=['en-US'],
      force_full_page_ocr=True,
      recognition='accurate',
      bitmap_area_threshold=0.0,
    ),
  )
  return DocumentConverter(
    format_options={
      InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline),
    }
  )


def export_subset(pdf: Path, start: int, end: int, dest: Path) -> Path:
  """Copy 1-based inclusive page range into a smaller PDF for faster iteration."""
  import fitz

  doc = fitz.open(pdf)
  out = fitz.open()
  for i in range(start - 1, end):
    out.insert_pdf(doc, from_page=i, to_page=i)
  dest.parent.mkdir(parents=True, exist_ok=True)
  out.save(dest)
  n = out.page_count
  out.close()
  doc.close()
  print(f'Wrote {n}-page subset {dest} (PDF pages {start}-{end})')
  return dest


def main() -> int:
  ap = argparse.ArgumentParser(description=__doc__)
  ap.add_argument('--start', type=int, default=91, help='First PDF page (1-based)')
  ap.add_argument('--end', type=int, default=110, help='Last PDF page (1-based, inclusive)')
  ap.add_argument('--images-scale', type=float, default=2.0)
  ap.add_argument('--pdf', type=Path, default=PDF)
  ap.add_argument('--output', type=Path, default=OUT)
  args = ap.parse_args()

  args.output.mkdir(parents=True, exist_ok=True)
  subset = args.output / f'MPX_G2_p{args.start:03d}-{args.end:03d}.pdf'
  export_subset(args.pdf, args.start, args.end, subset)

  print(
    f'Converting with Docling (ocrmac, force_full_page_ocr, '
    f'images_scale={args.images_scale})…'
  )
  converter = build_converter(images_scale=args.images_scale)
  result = converter.convert(str(subset))
  doc = result.document

  stem = subset.stem
  md_path = args.output / f'{stem}.md'
  json_path = args.output / f'{stem}.json'
  texts_path = args.output / f'{stem}.texts.txt'
  md_path.write_text(doc.export_to_markdown(image_mode='placeholder'))
  doc.save_as_json(json_path)
  texts_path.write_text(flatten_texts(json_path, pdf_page_offset=args.start - 1))
  print(f'Wrote {md_path}')
  print(f'Wrote {json_path}')
  print(f'Wrote {texts_path}')

  # Per-page markdown + flat text dumps for comparison with tmp/manual-ocr / manual-web
  write_by_page(json_path, args.output / 'by-page', args.start)
  return 0


def flatten_texts(json_path: Path, *, pdf_page_offset: int) -> str:
  """Dump every OCR text item in reading order (page, then top→bottom).

  Docling's markdown export often drops diagram-adjacent param labels on this
  manual; the JSON `texts` array is much more complete.
  """
  import json

  data = json.loads(json_path.read_text())
  items: list[tuple[int, float, float, str, str]] = []
  for t in data.get('texts', []):
    text = (t.get('text') or t.get('orig') or '').strip()
    if not text:
      continue
    label = t.get('label') or 'text'
    page_no = 1
    top = 0.0
    left = 0.0
    prov = t.get('prov') or []
    if prov:
      page_no = int(prov[0].get('page_no') or 1)
      bbox = prov[0].get('bbox') or {}
      # Docling uses BOTTOMLEFT; higher t = higher on page
      top = -float(bbox.get('t') or 0)
      left = float(bbox.get('l') or 0)
    items.append((page_no, top, left, label, text))

  items.sort()
  lines: list[str] = []
  current_page = None
  for page_no, _top, _left, label, text in items:
    pdf_page = pdf_page_offset + page_no
    if page_no != current_page:
      if lines:
        lines.append('')
      lines.append(f'===== PDF PAGE {pdf_page} =====')
      current_page = page_no
    lines.append(f'[{label}] {text}')
  return '\n'.join(lines) + '\n'


def write_by_page(json_path: Path, pages_dir: Path, start_pdf_page: int) -> None:
  import json
  from collections import defaultdict

  from docling_core.types.doc import DoclingDocument

  pages_dir.mkdir(parents=True, exist_ok=True)
  doc = DoclingDocument.load_from_json(str(json_path))
  data = json.loads(json_path.read_text())

  by_page: dict[int, list[tuple[float, float, str, str]]] = defaultdict(list)
  for t in data.get('texts', []):
    text = (t.get('text') or t.get('orig') or '').strip()
    if not text:
      continue
    label = t.get('label') or 'text'
    prov = t.get('prov') or []
    page_no = int(prov[0].get('page_no') or 1) if prov else 1
    bbox = (prov[0].get('bbox') or {}) if prov else {}
    top = -float(bbox.get('t') or 0)
    left = float(bbox.get('l') or 0)
    by_page[page_no].append((top, left, label, text))

  n_pages = len(data.get('pages') or {})
  for page_no in range(1, n_pages + 1):
    pdf_page = start_pdf_page + page_no - 1
    try:
      md = doc.export_to_markdown(page_no=page_no, image_mode='placeholder')
    except TypeError:
      md = ''
    (pages_dir / f'p{pdf_page:03d}.md').write_text(md)

    rows = sorted(by_page.get(page_no, []))
    body = '\n'.join(f'[{label}] {text}' for _t, _l, label, text in rows)
    (pages_dir / f'p{pdf_page:03d}.texts.txt').write_text(body + ('\n' if body else ''))
    print(f'Wrote by-page p{pdf_page:03d} (md={len(md)} chars, texts={len(rows)} items)')


if __name__ == '__main__':
  sys.exit(main())
