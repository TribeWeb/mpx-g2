#!/usr/bin/env python3
"""Polish content/effects/*.md from scraped MPX G2 manual chapter 7 text.

Preserves machine min/max/index/id/softRow/availableIn. Fills prose, summary,
dspSteps, manualSection, and param descriptions from the manual where found.
"""
from __future__ import annotations

import re
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'content' / 'effects'
WEB = ROOT / 'tmp' / 'manual-web'
OCR = ROOT / 'tmp' / 'manual-ocr'

# Manual title aliases → content slug (when names differ).
TITLE_ALIASES = {
  'Chorus': 'stereo-chorus',
  'Screamer': 'tube-screamer',
  'Flanger24 (M)': 'flange24-m',
  'Flanger24(M)': 'flange24-m',
  'Flange24 (M)': 'flange24-m',
  'Flange24(M)': 'flange24-m',
  'SplitPreamp': 'mix',  # harvested under LCD name Mix (gain alg 7)
  'Split Preamp': 'mix',
  'Pedal Vol': 'pedal-vol',
  'PedalVol': 'pedal-vol',
  'Wah 1': 'wah-1',
  'Wah  1': 'wah-1',
  'Wah1': 'wah-1',
  'Wah 1 ': 'wah-1-2',  # fx2 copy uses single space name in harvest
  'Diatonic Hmy': 'diatonichmy',
  'Diatonic Harmony': 'diatonichmy',
  'Wah 1': 'wah-1',
  'Wah  1': 'wah-1',
  'Wah1': 'wah-1',
  'Wah 2': 'wah-2',
  'Wah  2': 'wah-2',
  'Pedal Wah1': 'pedal-wah-1',
  'Pedal Wah 1': 'pedal-wah-1',
  'Pedal Wah2': 'pedal-wah-2',
  'Pedal Wah 2': 'pedal-wah-2',
  'Sweep Filter': 'sweepfilter',
  'BlueComp': 'blue-comp',
  'RedComp': 'red-comp',
  'Orange Phase': 'orangephase',
  'Octa Buzz': 'octabuzz',
  'Ext Pedal Vol': 'extpedalvol',
  'ExtPedal Vol': 'extpedalvol',
  'RotaryCab': 'rotary-cab',
  'TestTone': 'test-tone',
  'FcSplitter': 'fc-splitter',
  'AutoPan': 'auto-pan',
  'CustomVybe': 'custom-vybe',
  'Uni Vybe': 'univybe',
  'Jam Man': 'jamman',
}

NOISE_START = re.compile(
  r'(MPX G2 specifications|Our partner|Top\s*Page|Обсуждение|Перевірте|iOS Android)',
  re.I
)


def load_pages() -> str:
  parts = []
  for p in range(92, 136):
    f = WEB / f'page-{p:03d}.txt'
    if f.exists():
      page = f.read_text()
      # Drop per-page marketing chrome before combining
      m = NOISE_START.search(page)
      if m:
        page = page[:m.start()]
      parts.append(f'\n\n===== PAGE {p} =====\n' + page)
  return '\n'.join(parts)


def clean_page_lines(text: str) -> list[str]:
  lines: list[str] = []
  for raw in text.splitlines():
    cells = [c.strip() for c in raw.split('|')]
    cells = [c for c in cells if c]
    if not cells:
      continue
    joined = ' '.join(cells)
    if joined.startswith('Page ') and len(cells) <= 3:
      continue
    if joined.startswith('Image '):
      continue
    if 'manualsdump' in joined.lower():
      continue
    if joined.endswith('manual') and 'Lexicon' in joined and len(joined) < 80:
      continue
    if joined in ('MPX G2 User Guide', 'Lexicon', 'The Effects and Parameters'):
      continue
    if joined.startswith('===== PAGE'):
      lines.append(joined)
      continue
    lines.append(' | '.join(cells))
  return lines


def normalize_key(s: str) -> str:
  return re.sub(r'[^a-z0-9]', '', s.lower())


def load_effects() -> dict[str, dict]:
  effects = {}
  for path in sorted(CONTENT.glob('*.md')):
    raw = path.read_text()
    m = re.match(r'^---\n([\s\S]*?)\n---\n?([\s\S]*)$', raw)
    if not m:
      raise SystemExit(f'Bad frontmatter: {path}')
    fm = yaml.safe_load(m.group(1))
    effects[path.stem] = {
      'slug': path.stem,
      'path': path,
      'fm': fm,
      'body': m.group(2),
      'name': fm['name'],
      'name_key': normalize_key(fm['name']),
    }
  return effects


def build_title_index(effects: dict[str, dict]) -> list[tuple[str, str]]:
  """List of (title, slug) sorted by title length descending."""
  pairs: list[tuple[str, str]] = []
  for slug, eff in effects.items():
    pairs.append((eff['name'], slug))
  for title, slug in TITLE_ALIASES.items():
    if slug in effects:
      pairs.append((title, slug))
  # Unique by title, keep longest titles first for matching
  seen = set()
  out = []
  for title, slug in sorted(pairs, key=lambda x: len(x[0]), reverse=True):
    key = title.lower()
    if key in seen:
      continue
    seen.add(key)
    out.append((title, slug))
  return out


def is_effect_heading(lines: list[str], index: int, title: str) -> bool:
  """True when this line is an effect page title, not a lone param label."""
  line = lines[index]
  cells = [c.strip() for c in line.split(' | ') if c.strip()]
  if not cells or cells[0] != title:
    return False
  if len(cells) > 1 and any(len(c) > 2 for c in cells[1:]):
    return False

  nxt = lines[index + 1] if index + 1 < len(lines) else ''
  nxt_cells = [c.strip() for c in nxt.split(' | ') if c.strip()]
  nxt0 = nxt_cells[0] if nxt_cells else ''
  # Param tables put the range on the next line after a lone label.
  # Do not treat DSP bar markers (lone 190 / step counts) as ranges.
  if (
    nxt0
    and not re.fullmatch(r'\d{1,3}', nxt0)
    and re.search(r'(\d|%|dB|Hz|ms|Off|±|:)', nxt0, re.I)
    and len(nxt0) < 48
  ):
    return False

  window = lines[index + 1:index + 30]
  blob = ' '.join(window)
  if re.search(r'NO PROCESSING STEPS|\b\d{1,3}\s+190\b', blob, re.I):
    return True
  # Effect pages open with multi-word prose, not another short label.
  prose_lines = 0
  for w in window[:15]:
    w0 = w.split(' | ')[0].strip()
    if len(w0) >= 24 and re.search(r'[a-z]{3,}', w0):
      prose_lines += 1
  return prose_lines >= 1


def find_effect_segments(lines: list[str], titles: list[tuple[str, str]]) -> dict[str, list[str]]:
  """Map slug → contiguous lines for that effect (best/longest segment)."""
  title_map = {t: s for t, s in titles}  # preserve case keys
  # Prefer longer titles first when multiple match same line
  ordered_titles = sorted({t for t, _ in titles}, key=len, reverse=True)

  hits: list[tuple[int, str, str]] = []
  for i, line in enumerate(lines):
    cells = [c.strip() for c in line.split(' | ') if c.strip()]
    if not cells:
      continue
    head = cells[0]
    for title in ordered_titles:
      if head != title:
        continue
      if not is_effect_heading(lines, i, title):
        break
      hits.append((i, title, title_map[title]))
      break

  segments: dict[str, list[str]] = {}
  for n, (start, title, slug) in enumerate(hits):
    end = hits[n + 1][0] if n + 1 < len(hits) else min(len(lines), start + 160)
    chunk = lines[start:end]
    prev = segments.get(slug)
    score = sum(len(x) for x in chunk)
    if prev is None or score > sum(len(x) for x in prev):
      segments[slug] = chunk
  return segments


PARAM_NAME_RE = re.compile(
  r'^([A-Za-z][A-Za-z0-9 /+.\-]{0,20}?)\*?\s*$'
)


def looks_like_param_row(cells: list[str]) -> bool:
  if len(cells) < 2:
    return False
  name = cells[0].rstrip('*').strip()
  if len(name) > 24:
    return False
  if not PARAM_NAME_RE.match(name):
    return False
  rng = cells[1]
  if not re.search(r'(\d|%|dB|Hz|ms|Off|to|±|:)', rng, re.I):
    return False
  return True


def extract_from_segment(chunk: list[str], effect_name: str) -> dict:
  prose_parts: list[str] = []
  params: list[dict] = []
  dsp_steps = None
  manual_section = None

  start = 1 if chunk and chunk[0].split(' | ')[0].strip() == effect_name else 0
  # Also skip alias titles
  if chunk:
    head = chunk[0].split(' | ')[0].strip()
    if head == effect_name or TITLE_ALIASES.get(head) is not None:
      start = 1

  joined_for_meta = '\n'.join(chunk)
  no_steps = bool(re.search(r'NO PROCESSING STEPS', joined_for_meta, re.I))
  candidates = [int(n) for n in re.findall(r'(?m)^(\d{1,3})\s*\n190\s*$', joined_for_meta)]
  if not candidates:
    candidates = [int(n) for n in re.findall(r'\b(\d{1,3})\s+190\b', joined_for_meta)]
  positives = [n for n in candidates if 0 < n <= 190]
  if positives:
    dsp_steps = positives[-1]
  elif no_steps:
    dsp_steps = 0

  sections = re.findall(r'\b(7-\d+)\b', joined_for_meta)
  if sections:
    manual_section = sections[-1]

  i = start
  while i < len(chunk):
    line = chunk[i]
    cells = [c.strip() for c in line.split(' | ') if c.strip()]
    if not cells:
      i += 1
      continue
    joined = ' '.join(cells)
    if 'Interpolated' in joined or re.fullmatch(r'7-\d+', cells[0]):
      i += 1
      continue
    if cells[0] == '190' or (re.fullmatch(r'\d{1,3}', cells[0]) and len(cells) == 1):
      i += 1
      continue

    if looks_like_param_row(cells) and len(cells) >= 3:
      label = cells[0].rstrip('*').strip()
      desc = cells[2].strip()
      if len(label) >= 2 and len(desc) >= 8 and re.search(r'[a-z]', desc) and (' ' in desc or len(desc) >= 12):
        if label.lower() not in ('of the', 'in the', 'to the', 'and the'):
          params.append({'label': label, 'description': desc})
      i += 1
      continue

    # Param as stacked lines: Name / Range / Description
    if len(cells) == 1 and i + 2 < len(chunk):
      name = cells[0].rstrip('*').strip()
      range_line = [c.strip() for c in chunk[i + 1].split(' | ') if c.strip()]
      desc_line = [c.strip() for c in chunk[i + 2].split(' | ') if c.strip()]
      if (
        2 <= len(name) <= 24
        and PARAM_NAME_RE.match(name)
        and name.lower() not in ('of the', 'in the', 'to the')
        and range_line
        and not re.fullmatch(r'\d{1,3}', range_line[0])
        and re.search(r'(\d|%|dB|Hz|ms|Off|to|±|:)', range_line[0], re.I)
        and len(range_line[0]) < 48
        and desc_line
        and len(desc_line[0]) >= 8
        and re.search(r'[a-z]', desc_line[0])
      ):
        params.append({'label': name, 'description': desc_line[0]})
        i += 3
        continue

    # Prose fragment(s)
    prose_bits = []
    for c in cells:
      if len(c) <= 2 or c in ('190', 'Lexicon', 'MPX G2 User Guide'):
        continue
      if re.fullmatch(r'\d{1,3}', c):
        continue
      prose_bits.append(c)
    if prose_bits:
      prose_parts.append(' '.join(prose_bits))
    i += 1

  prose = cleanup_prose(' '.join(prose_parts))
  return {
    'prose': prose,
    'params': params,
    'dspSteps': dsp_steps,
    'manualSection': manual_section,
  }


def cleanup_prose(text: str) -> str:
  text = re.sub(r'\s+', ' ', text).strip()
  # Fix common OCR / scrape hyphenation
  text = re.sub(r'(\w)-\s+(\w)', r'\1\2', text)
  # Remove leftover guide chrome
  text = re.sub(r'MPX G2 User Guide\s*Lexicon\s*', '', text)
  text = re.sub(r'The Effects and Parameters\s*', '', text)
  # Deduplicate repeated spaces
  text = re.sub(r'\s{2,}', ' ', text).strip()
  return text


def first_sentence(text: str, limit: int = 180) -> str:
  if not text:
    return ''
  m = re.search(r'(.+?[.!?])(\s|$)', text)
  sentence = m.group(1).strip() if m else text.strip()
  if len(sentence) > limit:
    sentence = sentence[: limit - 1].rstrip() + '…'
  return sentence


def match_param_desc(param: dict, manual_params: list[dict]) -> str | None:
  def norm(s: str) -> str:
    s = normalize_key(s)
    s = s.replace('depth', 'dpth').replace('resonance', 'res').replace('delay', 'dly')
    return s

  pid = norm(param['id'])
  plabel = norm(param['label'])
  best = None
  for mp in manual_params:
    key = norm(mp['label'])
    if not key or len(key) < 2:
      continue
    if key in (pid, plabel) or key.startswith(pid) or pid.startswith(key) or key.startswith(plabel) or plabel.startswith(key):
      desc = mp['description'].strip()
      if desc and len(desc) >= 5:
        best = desc
        break
  return best


def dump_frontmatter(fm: dict) -> str:
  # Stable, readable YAML similar to curated files
  lines = ['---']
  lines.append(f"name: {yaml_str(fm['name'])}")
  lines.append(f"modelName: {yaml_str(fm['modelName'])}")
  lines.append(f"summary: {yaml_str(fm['summary'])}")
  lines.append(f"dspSteps: {fm['dspSteps']}")
  if fm.get('manualSection'):
    lines.append(f"manualSection: {yaml_str(str(fm['manualSection']))}")
  lines.append('availableIn:')
  for block, alg in fm['availableIn'].items():
    lines.append(f'  {block}: {alg}')
  lines.append('softRow:')
  for sid in fm['softRow']:
    lines.append(f'  - {sid}')
  lines.append('params:')
  for p in fm['params']:
    lines.append(f"  - id: {p['id']}")
    lines.append(f"    index: {p['index']}")
    lines.append(f"    label: {yaml_str(p['label'])}")
    lines.append(f"    min: {p['min']}")
    lines.append(f"    max: {p['max']}")
    lines.append(f"    description: {yaml_str(p['description'])}")
  lines.append('---')
  return '\n'.join(lines) + '\n'


def yaml_str(value: str) -> str:
  if value == '':
    return '""'
  if re.search(r'[:#{}\[\],&*?|>!%@`]', value) or value.strip() != value or '\n' in value:
    return json_dumps(value)
  if ' ' in value or value.lower() in ('true', 'false', 'null', 'yes', 'no'):
    return json_dumps(value)
  return value


def json_dumps(value: str) -> str:
  import json
  return json.dumps(value)


def build_body(name: str, slug: str, prose: str, existing_body: str, dsp_steps: int | None) -> str:
  # Preserve curated diagrams / extra notes for stereo-chorus & tube-screamer
  existing_imgs = re.findall(r'!\[.*?\]\(/effects/[^)]+\)', existing_body)
  img = existing_imgs[0] if existing_imgs else f'![{name} signal flow](/effects/{slug}.png)'

  curated = slug in ('stereo-chorus', 'tube-screamer')
  if curated:
    # Keep existing body (already polished) — only ensure image present
    body = existing_body.strip()
    if not body:
      body = f'{prose}\n\n{img}\n'
    return body + '\n'

  parts = []
  if prose:
    parts.append(prose)
  else:
    parts.append(f'{name} effect from the MPX G2 manual. Parameter layout harvested from the unit via MIDI.')
  parts.append('')
  parts.append(img)
  if dsp_steps == 0:
    parts.append('')
    parts.append(
      'Gain/analog effects like this use dedicated processing and do not consume the shared DSP step budget '
      '(shown as **0 of 190** / “NO PROCESSING STEPS USED” in the manual).'
    )
  elif isinstance(dsp_steps, int) and dsp_steps > 0:
    parts.append('')
    parts.append(f'This effect uses **{dsp_steps} of 190** processing steps.')
  parts.append('')
  return '\n'.join(parts)


def fallback_segment_from_pages(name: str, lines: list[str]) -> list[str] | None:
  """Grab a window after the first plausible title occurrence."""
  for i, line in enumerate(lines):
    head = line.split(' | ')[0].strip()
    if head != name:
      continue
    # Skip TOC-like runs of bare effect names
    nxt = lines[i + 1].split(' | ')[0].strip() if i + 1 < len(lines) else ''
    if nxt and len(nxt) < 28 and '(' in nxt and ')' in nxt and not re.search(r'[a-z]{5,}', nxt):
      # next is another Effect (M) style title — could be TOC
      # allow if later prose exists
      window = lines[i + 1:i + 20]
      if not any(len(w.split(' | ')[0]) >= 24 for w in window):
        continue
    return lines[i:i + 100]
  return None


def main() -> None:
  effects = load_effects()
  titles = build_title_index(effects)
  raw = load_pages()
  lines = clean_page_lines(raw)
  segments = find_effect_segments(lines, titles)

  # Fill gaps with looser window capture
  for slug, eff in effects.items():
    if slug in segments and len(segments[slug]) > 5:
      continue
    for title in [eff['name'], *[t for t, s in TITLE_ALIASES.items() if s == slug]]:
      fb = fallback_segment_from_pages(title, lines)
      if fb and len(fb) > 5:
        segments[slug] = fb
        break

  updated = 0
  missing = []
  for slug, eff in effects.items():
    chunk = segments.get(slug)
    extracted = extract_from_segment(chunk, eff['name']) if chunk else {
      'prose': '', 'params': [], 'dspSteps': None, 'manualSection': None
    }

    fm = dict(eff['fm'])
    curated = slug in ('stereo-chorus', 'tube-screamer')
    protected = curated or slug in ('preamp', 'splitpreamp', 'all-params')
    gain_only = list(fm.get('availableIn', {}).keys()) == ['gain']

    if extracted['dspSteps'] == 0 and not gain_only:
      extracted['dspSteps'] = None

    new_params = []
    for p in fm['params']:
      p = dict(p)
      desc = match_param_desc(p, extracted['params'])
      if curated or protected:
        if desc and p.get('description') in (None, '', 'TODO'):
          p['description'] = desc
      elif desc:
        p['description'] = desc
      if not p.get('description'):
        p['description'] = 'TODO'
      new_params.append(p)
    fm['params'] = new_params

    if extracted['dspSteps'] is not None and not protected:
      fm['dspSteps'] = extracted['dspSteps']

    if extracted['manualSection'] and not protected:
      fm['manualSection'] = extracted['manualSection']

    prose = extracted['prose']
    # Drop prose that is mostly param-option noise or TOC scrapes
    if prose and prose.count('Selects ') > 2 and len(prose) < 120:
      prose = ''
    if prose and looks_like_toc_junk(prose):
      prose = ''

    existing_summary = str(fm.get('summary', ''))
    if prose and not protected:
      fm['summary'] = first_sentence(prose) or fm['summary']
    elif prose and existing_summary.startswith('TODO'):
      fm['summary'] = first_sentence(prose)

    if slug == 'splitpreamp':
      fm['name'] = 'SplitPreamp'
      if fm.get('modelName') in ('Mix', 'mix', None):
        fm['modelName'] = 'Dual preamp'

    if protected and not existing_summary.startswith('TODO'):
      # Keep existing body; only persist param/dsp frontmatter updates above
      body = eff['body'].strip() + '\n'
    else:
      body_dsp = fm.get('dspSteps') if (gain_only or (fm.get('dspSteps') or 0) > 0) else None
      body = build_body(
        fm['name'],
        slug,
        prose,
        eff['body'],
        body_dsp if gain_only or (body_dsp or 0) > 0 else extracted['dspSteps']
      )
      if not gain_only:
        body = re.sub(
          r'\nThis effect uses \*\*0 of 190\*\* processing steps\.\n?',
          '\n',
          body
        )
        body = re.sub(
          r'\nGain/analog effects like this use dedicated processing[\s\S]*?\n',
          '\n',
          body
        )

    text = dump_frontmatter(fm) + '\n' + body
    if not text.endswith('\n'):
      text += '\n'
    eff['path'].write_text(text)
    updated += 1
    if not chunk or (not prose and not extracted['params']):
      missing.append(slug)

  print(f'Updated {updated} effects')
  print(f'Segments found: {len(segments)} / {len(effects)}')
  if missing:
    print('Weak/missing:')
    for m in missing:
      print(' ', m)


def looks_like_toc_junk(text: str) -> bool:
  tokens = re.findall(r'\b[A-Z][A-Za-z0-9]+(?:\s*\([MSD]\))?', text)
  return len(tokens) >= 8 and len(text) < 500


if __name__ == '__main__':
  main()
