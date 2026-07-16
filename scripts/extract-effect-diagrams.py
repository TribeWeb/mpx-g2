#!/usr/bin/env python3
"""Crop effect signal-flow diagrams from public/MPX_G2.pdf into public/effects/{slug}.png."""
from __future__ import annotations

import re
from collections import defaultdict
from pathlib import Path

import fitz
import numpy as np
import yaml

ROOT = Path(__file__).resolve().parents[1]
PDF = ROOT / 'public' / 'MPX_G2.pdf'
CONTENT = ROOT / 'content' / 'effects'
OUT = ROOT / 'public' / 'effects'
WEB = ROOT / 'tmp' / 'manual-web'

# Hand-tuned crops (page points @ 72dpi) from full-page inspection.
MANUAL_CLIPS: dict[str, tuple[int, fitz.Rect]] = {
  'tube-screamer': (93, fitz.Rect(240, 100, 360, 200)),
  'stereo-chorus': (110, fitz.Rect(400 / 3, 820 / 3, 1100 / 3, 1280 / 3)),
  # Gain
  'tone': (92, fitz.Rect(200, 100, 520, 180)),
  'crunch': (92, fitz.Rect(200, 100, 520, 180)),
  'overdrive': (94, fitz.Rect(70, 105, 500, 185)),
  'distortion': (95, fitz.Rect(200, 100, 540, 175)),
  'preamp': (95, fitz.Rect(70, 340, 540, 420)),
  'splitpreamp': (95, fitz.Rect(70, 340, 540, 420)),
  'all-params': (95, fitz.Rect(70, 340, 540, 420)),
  # Effect1/2
  'panner': (100, fitz.Rect(55, 110, 340, 230)),
  'auto-pan': (100, fitz.Rect(55, 370, 380, 520)),
  'tremolo-m': (101, fitz.Rect(180, 120, 520, 280)),
  'tremolo-s': (101, fitz.Rect(180, 120, 520, 280)),
  'univybe': (101, fitz.Rect(180, 470, 480, 600)),
  'wah-1': (107, fitz.Rect(200, 110, 560, 280)),
  'wah-2': (107, fitz.Rect(200, 110, 560, 280)),
  'wah-1-2': (107, fitz.Rect(200, 110, 560, 280)),
  'pedal-wah-1': (107, fitz.Rect(200, 110, 560, 280)),
  'pedal-wah-2': (107, fitz.Rect(200, 110, 560, 280)),
  'volume-m': (108, fitz.Rect(55, 110, 420, 280)),
  'volume-s': (108, fitz.Rect(55, 110, 420, 280)),
  'volume-d': (108, fitz.Rect(55, 110, 420, 280)),
  'pedal-vol': (108, fitz.Rect(55, 430, 360, 560)),
  'extpedalvol': (108, fitz.Rect(55, 430, 360, 560)),
  # Chorus family
  'flanger-m': (112, fitz.Rect(55, 110, 420, 260)),
  'flange24-m': (112, fitz.Rect(55, 110, 420, 260)),
  'flanger-s': (112, fitz.Rect(55, 110, 420, 260)),
  'detune-m': (111, fitz.Rect(55, 110, 400, 260)),
  'detune-s': (97, fitz.Rect(55, 200, 540, 380)),
  'detune-d': (97, fitz.Rect(55, 200, 540, 380)),
  'shift-m': (98, fitz.Rect(200, 100, 540, 320)),
  'shift-s': (98, fitz.Rect(200, 100, 540, 320)),
  'shift-d': (98, fitz.Rect(200, 100, 540, 320)),
  'diatonichmy': (99, fitz.Rect(200, 100, 500, 300)),
  'custom-vybe': (102, fitz.Rect(55, 100, 380, 280)),
  'phaser': (102, fitz.Rect(55, 400, 520, 560)),
  'orangephase': (103, fitz.Rect(200, 100, 500, 260)),
  'red-comp': (103, fitz.Rect(55, 100, 320, 240)),
  'delay-m': (119, fitz.Rect(200, 90, 560, 400)),
  'delay-s': (119, fitz.Rect(200, 90, 560, 400)),
  'delay-d': (119, fitz.Rect(200, 90, 560, 400)),
  '1-band-m': (129, fitz.Rect(200, 100, 540, 280)),
  '2-band-m': (129, fitz.Rect(200, 100, 540, 280)),
  '3-band-m': (129, fitz.Rect(200, 100, 540, 280)),
  '4-band-m': (129, fitz.Rect(200, 100, 540, 280)),
  '1-band-s': (129, fitz.Rect(200, 430, 540, 580)),
  '2-band-s': (129, fitz.Rect(200, 430, 540, 580)),
}

PAGE_OVERRIDES: dict[str, int] = {
  'tone': 92,
  'crunch': 92,
  'overdrive': 94,
  'distortion': 95,
  'preamp': 95,
  'splitpreamp': 95,
  'all-params': 95,
  'detune-m': 111,
  '1-band-m': 129,
  'jamman': 122,
  'diatonichmy': 99,
  'pedal-vol': 108,
  'extpedalvol': 108,
  'wah-1-2': 107,
  'click': 109,
  'test-tone': 109,
  'panner': 100,
  'auto-pan': 100,
}

# Preferred vertical band on shared DigiPath pages (0=top cluster, 1=second, …).
CLUSTER_INDEX: dict[str, int] = {
  'volume-m': 0,
  'volume-s': 0,
  'volume-d': 0,
  'pedal-vol': 1,
  'extpedalvol': 1,
  '1-band-m': 0,
  '2-band-m': 0,
  '3-band-m': 0,
  '4-band-m': 0,
  '1-band-s': 1,
  '2-band-s': 1,
  '1-band-d': 0,
  '2-band-d': 0,
  'wah-1': 0,
  'wah-2': 0,
  'wah-1-2': 0,
  'pedal-wah-1': 0,
  'pedal-wah-2': 0,
}

TITLE_ALIASES = {
  'Screamer': 'tube-screamer',
  'Chorus': 'stereo-chorus',
  'SplitPreamp': 'splitpreamp',
  'Flanger24 (M)': 'flange24-m',
  'Flanger24(M)': 'flange24-m',
  'CustomVybe': 'custom-vybe',
  'PedalVol': 'pedal-vol',
  'Pedal Wah 1': 'pedal-wah-1',
  'PedalWah1': 'pedal-wah-1',
  'Pedal Wah 2': 'pedal-wah-2',
  'PedalWah2': 'pedal-wah-2',
  'ExtPedalVol': 'extpedalvol',
  'Wah 1': 'wah-1',
  'Wah 2': 'wah-2',
  'Diatonic Hmy': 'diatonichmy',
  'DiatonicHmy': 'diatonichmy',
  'UniVybe': 'univybe',
  'OrangePhase': 'orangephase',
  'Blue Comp': 'blue-comp',
  'Red Comp': 'red-comp',
  'OctaBuzz': 'octabuzz',
  'DigiDrive1': 'digidrive1',
  'DigiDrive2': 'digidrive2',
  'JamMan': 'jamman',
  'Test Tone': 'test-tone',
  'Rotary Cab': 'rotary-cab',
  'SweepFilter': 'sweepfilter',
  'FC Splitter': 'fc-splitter',
  'Centrifuge1': 'centrifuge1',
  'Centrifuge2': 'centrifuge2',
  'Comb 1': 'comb-1',
  'Comb 2': 'comb-2',
}


def load_effects() -> dict[str, dict]:
  effects = {}
  for path in sorted(CONTENT.glob('*.md')):
    fm = yaml.safe_load(re.match(r'^---\n([\s\S]*?)\n---', path.read_text()).group(1))
    effects[path.stem] = {'name': fm['name']}
  return effects


def build_slug_pages(effects: dict[str, dict]) -> dict[str, int]:
  name_to_slug = {eff['name']: slug for slug, eff in effects.items()}
  for title, slug in TITLE_ALIASES.items():
    if slug in effects:
      name_to_slug[title] = slug

  hits: dict[str, list[int]] = defaultdict(list)
  for dump_page in range(92, 136):
    f = WEB / f'page-{dump_page:03d}.txt'
    if not f.exists():
      continue
    text = f.read_text().split('MPX G2 specifications')[0]
    pdf_index = dump_page - 2
    for title, slug in name_to_slug.items():
      if re.search(rf'(?m)^\s*{re.escape(title)}\s*$', text) or f'\n{title}\n' in text:
        hits[slug].append(pdf_index)

  result = {slug: sorted(set(p for p in pages if p >= 92))[0]
            for slug, pages in hits.items() if any(p >= 92 for p in pages)}
  result.update(PAGE_OVERRIDES)
  for slug, (idx, _) in MANUAL_CLIPS.items():
    result[slug] = idx
  return {k: v for k, v in result.items() if k in effects}


def find_node_centers(gray: np.ndarray, mat: float) -> list[tuple[float, float]]:
  h, w = gray.shape
  centers: list[tuple[float, float]] = []
  r = max(3, int(5 * mat / 1.5))
  for y in range(r + 1, h - r - 1, 2):
    for x in range(r + 1, w - r - 1, 2):
      center = gray[y - 1:y + 2, x - 1:x + 2].mean()
      ring = []
      for a in range(0, 360, 30):
        rad = np.deg2rad(a)
        ring.append(gray[int(y + r * np.sin(rad)), int(x + r * np.cos(rad))])
      if np.mean(ring) >= 90 or center <= 140:
        continue
      outside = []
      for a in range(0, 360, 45):
        rad = np.deg2rad(a)
        yy = int(y + (r + 4) * np.sin(rad))
        xx = int(x + (r + 4) * np.cos(rad))
        if 0 <= yy < h and 0 <= xx < w:
          outside.append(gray[yy, xx])
      if outside and np.mean(outside) > 180:
        centers.append((x / mat, y / mat))
  clustered: list[tuple[float, float]] = []
  for x, y in centers:
    if any(abs(x - cx) + abs(y - cy) < 6 for cx, cy in clustered):
      continue
    clustered.append((x, y))
  return clustered


def cluster_nodes(nodes: list[tuple[float, float]], gap: float = 90) -> list[list[tuple[float, float]]]:
  if not nodes:
    return []
  ordered = sorted(nodes, key=lambda n: n[1])
  clusters: list[list[tuple[float, float]]] = [[ordered[0]]]
  for node in ordered[1:]:
    if node[1] - clusters[-1][-1][1] > gap:
      clusters.append([node])
    else:
      clusters[-1].append(node)
  # Keep clusters that look like real DigiPath (2+ nodes)
  return [c for c in clusters if len(c) >= 2]


def clip_from_cluster(page: fitz.Page, cluster: list[tuple[float, float]]) -> fitz.Rect:
  xs = [n[0] for n in cluster]
  ys = [n[1] for n in cluster]
  pad_x, pad_y = 55, 40
  return fitz.Rect(
    max(40, min(xs) - pad_x),
    max(70, min(ys) - pad_y),
    min(page.rect.width - 40, max(xs) + pad_x),
    min(page.rect.height - 50, max(ys) + pad_y + 30),
  )


def find_gain_clip(page: fitz.Page) -> fitz.Rect:
  """Fallback for analog gain pages: dark knob strip in the upper content area."""
  mat = 1.5
  pix = page.get_pixmap(matrix=fitz.Matrix(mat, mat), alpha=False)
  arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
  gray = arr.mean(axis=2)
  pw, ph = page.rect.width, page.rect.height
  best = fitz.Rect(70, 105, 480, 200)
  best_s = -1.0
  for y0 in np.linspace(95, 220, 8):
    for x0 in np.linspace(60, 200, 5):
      for ww, hh in ((380, 90), (420, 100), (450, 110), (340, 95)):
        x1, y1 = x0 + ww, y0 + hh
        if x1 > pw - 40 or y1 > 320:
          continue
        patch = gray[int(y0 * mat):int(y1 * mat), int(x0 * mat):int(x1 * mat)]
        dark = (patch < 120).mean()
        mid = ((patch >= 120) & (patch < 200)).mean()
        # knob strip: mix of dark fill + mid labels, not pure text
        if not (0.08 <= dark <= 0.45):
          continue
        s = dark * 2 + mid - abs(dark - 0.2)
        if s > best_s:
          best_s = s
          best = fitz.Rect(x0, y0, x1, y1)
  return best


_node_cache: dict[int, list[tuple[float, float]]] = {}


def nodes_for_page(doc: fitz.Document, page_index: int) -> list[tuple[float, float]]:
  if page_index not in _node_cache:
    page = doc[page_index]
    mat = 1.4
    pix = page.get_pixmap(matrix=fitz.Matrix(mat, mat), alpha=False)
    arr = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
    _node_cache[page_index] = find_node_centers(arr.mean(axis=2), mat)
  return _node_cache[page_index]


def find_diagram_clip(doc: fitz.Document, page_index: int, slug: str) -> fitz.Rect:
  page = doc[page_index]
  nodes = nodes_for_page(doc, page_index)
  clusters = cluster_nodes(nodes)
  if clusters:
    idx = CLUSTER_INDEX.get(slug, 0)
    idx = min(idx, len(clusters) - 1)
    return clip_from_cluster(page, clusters[idx])
  return find_gain_clip(page)


def extract_one(doc: fitz.Document, slug: str, page_index: int, clip: fitz.Rect) -> Path:
  pix = doc[page_index].get_pixmap(matrix=fitz.Matrix(3, 3), clip=clip, alpha=False)
  out = OUT / f'{slug}.png'
  pix.save(str(out))
  return out


def main() -> None:
  OUT.mkdir(parents=True, exist_ok=True)
  effects = load_effects()
  pages = build_slug_pages(effects)
  doc = fitz.open(PDF)

  saved = 0
  missing: list[str] = []
  for slug in sorted(effects):
    if slug in MANUAL_CLIPS:
      idx, clip = MANUAL_CLIPS[slug]
      path = extract_one(doc, slug, idx, clip)
      print(f'OK  {slug:20} page={idx + 1} (manual) → {path.name} {path.stat().st_size}b')
      saved += 1
      continue
    idx = pages.get(slug)
    if idx is None:
      missing.append(slug)
      continue
    clip = find_diagram_clip(doc, idx, slug)
    path = extract_one(doc, slug, idx, clip)
    print(f'OK  {slug:20} page={idx + 1} → {path.name} {path.stat().st_size}b clip={tuple(round(v) for v in clip)}')
    saved += 1

  print(f'\nSaved {saved}/{len(effects)} diagrams')
  if missing:
    print('No page mapping:')
    for slug in missing:
      print(' ', slug)


if __name__ == '__main__':
  main()
