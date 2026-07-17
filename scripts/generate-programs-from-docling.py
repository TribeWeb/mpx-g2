#!/usr/bin/env python3
"""Generate content/programs/001.md–250.md from manual program descriptions.

Primary source: searchable User Guide text (chapter 9).
Fallback: Docling OCR (tmp/manual-docling/programs) + web scrape.
Preserves hand-edited content/programs/001.md.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'content' / 'programs'
SEARCHABLE = ROOT / 'tmp' / 'manual-searchable' / 'zzounds-userguide.txt'
DOCLING_MD = ROOT / 'tmp' / 'manual-docling' / 'programs' / 'MPX_G2_p140-168.md'

RANGES: list[tuple[int, int, str, str]] = [
  (1, 19, 'Amp Input + FX Loop', 'Top Nineteen'),
  (20, 29, 'Amp Input + FX Loop', 'Vintage Rig'),
  (30, 39, 'Amp Input + FX Loop', 'Chorus Delay Rig'),
  (40, 49, 'Amp Input + FX Loop', 'Pitch Rig'),
  (50, 59, 'Amp Input + FX Loop', 'Tremelo + Filter FX'),
  (60, 79, 'Amp Input + FX Loop', 'FX Collection'),
  (80, 89, 'Amp Input + FX Loop', 'Analog Gain'),
  (90, 99, 'Amp Input + FX Loop', 'JamMan'),
  (100, 109, 'Amp Input Only', 'Top Ten'),
  (110, 119, 'Amp Input Only', 'Analog Gain'),
  (120, 139, 'Amp Input Only', 'FX Collection'),
  (140, 144, 'Amp Input Only', 'Bass FX'),
  (145, 149, 'Amp Input Only', 'JamMan'),
  (150, 159, 'Stand Alone', 'Top Ten'),
  (160, 179, 'Stand Alone', 'Artist/Song'),
  (180, 199, 'Stand Alone', 'Amp Collection'),
  (200, 209, 'Stand Alone', 'Studio Spaces'),
  (210, 219, 'Stand Alone', 'Studio FX'),
  (220, 229, 'Stand Alone', 'Styles'),
  (230, 232, 'Stand Alone', 'Live Rigs'),
  (233, 239, 'Stand Alone', 'Tremelo/Pitch'),
  (240, 244, 'Stand Alone', 'Bass FX'),
  (245, 248, 'Stand Alone', 'JamMan'),
  (249, 250, 'Stand Alone', 'Utility'),
]

NAME_FIXES = {
  'Amercan A/B': 'American A/B',
  'Pall 2->3 3->4': 'Pdl 2->3 3->4',
  'Pdi Octaves': 'Pdl Octaves',
}


@dataclass
class Program:
  num: int
  name: str
  description: str
  source: str = ''


@dataclass
class Blurb:
  group: str
  sub_group: str
  text: str


def meta_for(num: int) -> tuple[str, str]:
  for lo, hi, group, sub in RANGES:
    if lo <= num <= hi:
      return group, sub
  raise KeyError(num)


def clean_name(name: str) -> str:
  name = name.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<')
  name = re.sub(r'\s+', ' ', name).strip(' :.-')
  name = re.sub(r'^Utility\s+\d+\s+', '', name)
  return NAME_FIXES.get(name, name)


def clean_desc(text: str) -> str:
  text = text.replace('\u00a0', ' ').replace('&amp;', '&')
  text = text.replace('&gt;', '>').replace('&lt;', '<')
  # Drop running headers / footers / chrome
  text = re.sub(
    r'(?m)^(MPX G2 User Guide.*|Lexicon$|MPX G2 Program Descriptions.*|'
    r'9-\d+\s*$|Page \d+\s*$|Image \d+\s*$|Top Nineteen \(Amp Input \+ FX Loop\)\s*$|'
    r'Vintage Rig \(Amp Input \+ FX Loop\)\s*$|Chorus Delay Rig.*$|'
    r'Pitch Rig \(Amp Input \+ FX Loop\)\s*$|Tremolo and Filter Effects.*$|'
    r'Effects Collection \(Amp Input \+ FX Loop\)\s*$|'
    r'Analog Gain \(Amp Input \+ FX Loop\)\s*$|'
    r'JamMan \(Amp Input \+ FX Loop\)\s*$|'
    r'Bass Effects \(Amp Input Only\)\s*$|'
    r'Top Ten \(Stand Alone\)\s*$|Artist/Song \(Stand Alone\)\s*$|'
    r'Amp Collection \(Stand Alone\)\s*$|Studio Spaces \(Stand Alone\)\s*$|'
    r'Studio Effects \(Stand Alone\)\s*$|Styles \(Stand Alone\)\s*$|'
    r'Tremolo/Pitch \(Stand Alone\)\s*$|Live Rigs \(Stand Alone\)\s*$|'
    r'Bass Effects \(Stand Alone\)\s*$|JamMan \(Stand Alone\)\s*$|'
    r'Utility \(All Configurations\)\s*$|'
    r'Most of the MPX G2 programs are already set up.+?MPX R1Toe Switch\.)',
    '',
    text,
  )
  # Collapse whitespace / soft newlines
  text = re.sub(r'\s*\n\s*', ' ', text)
  text = re.sub(r'\s+', ' ', text).strip()
  # Soft hyphenation leftovers
  text = re.sub(r'(\w)-\s+(\w)', r'\1\2', text)
  # Trailing section labels stuck onto the last sentence
  text = re.sub(
    r'\s+(?:JamMan|Analog Gain|Effects Collection|FX Collection|Bass Effects|'
    r'Top Ten|Artist/Song|Amp Collection|Studio Spaces|Studio Effects|Styles|'
    r'Live Rigs|Tremolo/Pitch|Tremolo and Filter Effects|Utility|'
    r'Vintage Rig|Chorus Delay Rig|Pitch Rig|Top Nineteen)'
    r'\s*\((?:Amp Input \+ FX Loop|Amp Input Only|Stand Alone|All Configurations)\)\s*$',
    '',
    text,
  )
  # Button tokens → backticks (match 001.md style)
  for token in (
    'Gain', 'Effect 1', 'Effect 2', 'Chorus', 'Delay', 'Reverb', 'EQ',
    'A/B', 'Tap', 'Soft Row', 'Options', 'Toe Switch',
  ):
    text = re.sub(
      rf'(?<![`\w])({re.escape(token)})(?![`\w])',
      r'`\1`',
      text,
    )
  text = text.replace('``', '`')
  return text


PROGRAM_HEADER = re.compile(
  r'(?m)^(?:#{1,6}\s*)?(?:Utility\s+)?(\d{1,3})\s+([A-Za-z0-9][^\n]{0,48}?)\s*$'
)

# One-line "51 Square Trem A square wave..." entries in the searchable PDF.
INLINE_HEADER = re.compile(
  r'(?m)^(\d{1,3})\s+'
  r'([A-Za-z][\w/&>.+\-]*(?:[ ][\w/&>.+\-]*){0,4})\s+'
  r'('
  r'(?:This|That|These|The|A|An|Use|Press|Our|Play|Give|Here|Here\'s|Here\u2019s|'
  r'Analog|It\'s|It\u2019s|It\u2019s|Tune|RedComp|Compressor|Basic|More|Want|Loads|'
  r'Alternate|Swap|Chorus|Screamer|Wah|Fat|Classic|Medium|Super|Ultra|Perfect|'
  r'Country|Similar|Dual|Two|Get|Takes|Try|Need|Overdrive|Hendrix|Clean|'
  r'Acoustify|Smooth|Creamy|Great|Another|Some|Be|In|On|While|When|For|From|'
  r'“|").+'
  r')$'
)

DESC_FALLBACKS: dict[int, str] = {
  20: (
    'Wah, Screamer and UniVybe with the MPX R1 `Toe Switch` turning the wah on and off, '
    'so wah and modulation can be on at the same time. Corresponds to MPX R1 button 6.'
  ),
  26: (
    'Wah, Screamer and Flanger with the MPX R1 `Toe Switch` turning the wah on and off.'
  ),
  27: (
    'Wah, Screamer and Phaser with the MPX R1 `Toe Switch` turning the wah on and off.'
  ),
  28: (
    'Wah, Screamer and Chorus with the MPX R1 `Toe Switch` turning the wah on and off.'
  ),
  29: (
    'Wah, Screamer and Aero Flange with the MPX R1 `Toe Switch` turning the wah on and off.'
  ),
}


def slice_chapter9(raw: str) -> str:
  start = raw.find('9-1\n\nMPX G2 Program Descriptions')
  if start < 0:
    start = raw.find('9 Program Descriptions')
  end = raw.find('250 Clean Slate')
  if end > 0:
    end = raw.find('\n', end + 20)
  if start < 0:
    raise SystemExit('Could not locate chapter 9 in searchable manual text')
  return raw[start: end if end > start else None]


def parse_programs(chapter: str, source: str) -> dict[int, Program]:
  matches = list(PROGRAM_HEADER.finditer(chapter))
  programs: dict[int, Program] = {}
  for i, m in enumerate(matches):
    num = int(m.group(1))
    if num < 1 or num > 250:
      continue
    name = clean_name(m.group(2))
    # Skip false positives (DSP step bars etc.)
    if re.match(r'^\d+$', name) or name.lower().startswith('no processing'):
      continue
    if 'program description' in name.lower():
      continue
    # Leave long name+sentence lines to the inline parser
    if len(name) > 42 or re.search(
      r'\b(This|Want|A square|Use the|Loads with|Our recreation|A lush)\b',
      name,
      re.I,
    ):
      continue
    start = m.end()
    end = matches[i + 1].start() if i + 1 < len(matches) else len(chapter)
    body = chapter[start:end]
    # Truncate at next major section prose that isn't a program body
    body = re.split(
      r'(?=\n(?:Programs?\s+\d|##### |These programs are designed to work in the high-gain|'
      r'Set both Input and Output))',
      body,
      maxsplit=1,
    )[0]
    desc = clean_desc(body)
    # Same-line "51 Square Trem Description..." forms
    if not desc and ' ' in name:
      # already separated by regex
      pass
    prev = programs.get(num)
    if prev is None or len(desc) > len(prev.description):
      programs[num] = Program(num, name, desc, source)
  return programs


def parse_inline_programs(chapter: str, source: str) -> dict[int, Program]:
  """Catch '51 Square Trem A square wave...' on one line."""
  programs: dict[int, Program] = {}
  for m in INLINE_HEADER.finditer(chapter):
    num = int(m.group(1))
    if num < 1 or num > 250:
      continue
    name = clean_name(m.group(2))
    desc = clean_desc(m.group(3))
    if len(name) < 2 or len(desc) < 20:
      continue
    if 'program description' in name.lower():
      continue
    prev = programs.get(num)
    if prev is None or len(desc) > len(prev.description):
      programs[num] = Program(num, name, desc, source + ':inline')
  return programs


def extract_blurbs(chapter: str) -> list[Blurb]:
  specs: list[tuple[str, str, re.Pattern[str]]] = [
    (
      'Amp Input + FX Loop',
      'Top Nineteen',
      re.compile(
        r'(These programs are designed to work in the high-gain channel of your guitar amp.+?levels a bit\.)',
        re.S,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'Vintage Rig',
      re.compile(
        r'(Programs 20-29 are organized to work as a custom effects rig.+?built-in\.)',
        re.S,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'Chorus Delay Rig',
      re.compile(
        r'(Programs 30-39 are based on combinations of Screamer.+?feedback time\.)',
        re.S,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'Pitch Rig',
      re.compile(
        r'(Programs 40-49 are .+?(?:to the mix\.|Remote Controller\.))',
        re.S,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'Tremelo + Filter FX',
      re.compile(
        r'(Programs 50-59 are .+?high-gain channels\.)',
        re.S,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'FX Collection',
      re.compile(
        r'(Programs 60-79 each contain a single effect.+?single program\.)',
        re.S,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'Analog Gain',
      re.compile(
        r'(Programs 80-89 are examples of dry sounds.+?these programs\.)',
        re.S | re.I,
      ),
    ),
    (
      'Amp Input + FX Loop',
      'JamMan',
      re.compile(
        r'(Programs 90-94 are set up.+?Clear Loop)',
        re.S,
      ),
    ),
    (
      'Amp Input Only',
      'Analog Gain',
      re.compile(
        r'(Programs 110-119 are examples of dry sounds.+?these programs\.)',
        re.S | re.I,
      ),
    ),
    (
      'Amp Input Only',
      'FX Collection',
      re.compile(
        r'(Programs 120-139 each contain a single effect.+?single program\.)',
        re.S,
      ),
    ),
    (
      'Amp Input Only',
      'Bass FX',
      re.compile(
        r'(Programs 140-144 are designed for bass\.)',
        re.S,
      ),
    ),
    (
      'Amp Input Only',
      'JamMan',
      re.compile(
        r'(Programs 145-149 are set up.+?Clear Loop)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Top Ten',
      re.compile(
        r'(Programs 150-159 .+?(?:Stand Alone|favorite sounds|Top Ten).{0,200})',
        re.S | re.I,
      ),
    ),
    (
      'Stand Alone',
      'Artist/Song',
      re.compile(
        r'(Programs 160-179 give you signature sounds from artists and from specific songs\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Amp Collection',
      re.compile(
        r'(Programs 180-199 give you a collection of guitar amp tones.+?between\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Studio Spaces',
      re.compile(
        r'(Programs 200-209 are designed to give you a suite of realistic reverberation.+?100% wet\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Studio FX',
      re.compile(
        r'(Programs 210-219 are designed to give you a collection of classic studio effects[^\n]*)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Styles',
      re.compile(
        r'(Programs\s*220-229 give you playing styles from Surf to Techno\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Live Rigs',
      re.compile(
        r'(Programs 230-232 are rigs.+?different effects\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Tremelo/Pitch',
      re.compile(
        r'(Programs 233-239 give you a variety of tremolo-based and pitch effects\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Bass FX',
      re.compile(
        r'(Programs 240-244 are designed for bass\.)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'JamMan',
      re.compile(
        r'(Programs 245-248 are set up.+?Clear Loop)',
        re.S,
      ),
    ),
    (
      'Stand Alone',
      'Utility',
      re.compile(
        r'(249-250: Utility.+?Clean Slate[^\n]*)',
        re.S,
      ),
    ),
  ]
  blurbs: list[Blurb] = []
  for group, sub, pat in specs:
    m = pat.search(chapter)
    if not m:
      continue
    text = clean_desc(m.group(1)).replace('`', '')
    if len(text) > 30:
      blurbs.append(Blurb(group, sub, text))
  return blurbs


def merge(
  preferred: dict[int, Program],
  *fallbacks: dict[int, Program],
) -> dict[int, Program]:
  """Prefer `preferred` whenever it has a usable description."""
  out: dict[int, Program] = {}
  for num in range(1, 251):
    cand = preferred.get(num)
    if cand and len(cand.description) >= 25:
      out[num] = cand
      continue
    best = cand
    for fb in fallbacks:
      other = fb.get(num)
      if other is None:
        continue
      if best is None or len(other.description) > len(best.description):
        best = other
      elif best and other.name and (
        best.name.startswith('Program') or len(other.name) > len(best.name)
      ):
        best = Program(num, other.name, best.description, best.source)
    if best is None:
      best = Program(num, f'Program {num}', '', 'missing')
    if num in DESC_FALLBACKS and len(best.description) < 40:
      best = Program(best.num, best.name, DESC_FALLBACKS[num], best.source or 'fallback')
    out[num] = best
  return out


def split_glued_name(name: str, desc: str) -> tuple[str, str]:
  """Fix 'Vintage Trem A classic…' titles where the sentence stuck to the name."""
  m = re.match(
    r'^(.+?)\s+(A|An|The|It\'s|It\u2019s|This|Use|Loads|Our|Play)\s+(.+)$',
    name,
  )
  if not m:
    return name, desc
  rest = f'{m.group(2)} {m.group(3)}'.strip()
  # Only split when the remainder looks like prose, not part of the title
  if rest[0:1].isupper() and (
    rest.lower().startswith(('a ', 'an ', 'the ', 'this ', 'use ', 'our ', 'play ', 'loads ', "it's ", 'it’s '))
  ):
    new_name = clean_name(m.group(1))
    new_desc = clean_desc(f'{rest} {desc}'.strip())
    if len(new_name) >= 2:
      return new_name, new_desc if len(new_desc) >= len(desc) else desc
  return name, desc


def finalize_desc(text: str) -> str:
  """Cut bleed from following programs / section headers."""
  text = clean_desc(text)
  # Stop at next numbered program title embedded in the paragraph
  text = re.split(
    r'\s+(?=\d{1,3}\s+[A-Z][A-Za-z0-9/&>.+\-]*)',
    text,
    maxsplit=1,
  )[0]
  text = re.split(r'\s+##\s+', text, maxsplit=1)[0]
  text = re.sub(r'^\((?:Amp Input \+ FX Loop|Amp Input Only|Stand Alone|All Configurations)\)\s*', '', text)
  text = re.sub(r'\s*\((?:Amp Input \+ FX Loop|Amp Input Only|Stand Alone|All Configurations)\)\s*$', '', text)
  text = re.sub(r'\s*<!--.*?-->\s*', ' ', text)
  text = re.sub(r'\s+', ' ', text).strip(' |')
  return text


def render_program(p: Program) -> str:
  group, sub = meta_for(p.num)
  body = p.description.strip() or '_Description pending — OCR incomplete for this program._'
  return (
    f'---\n'
    f'group: {group}\n'
    f'subGroup: {sub}\n'
    f'parameters: []\n'
    f'---\n\n'
    f'# {p.name}\n\n'
    f'{body}\n'
  )


def render_index(blurbs: list[Blurb]) -> str:
  top = (
    'These programs are designed to work in the high-gain channel of your guitar amp, '
    'set for moderate gain. The `Screamer` and `Wah` effects are programmed to have high '
    'output levels to increase sustain when they\'re pumped into an amp that\'s already '
    'being pushed pretty hard. If you want to use this rig with a clean amp channel, you '
    'may want to decrease the `Gain` (Screamer) and `Effect 2` (Wah) levels a bit.'
  )
  lines = [
    '---',
    '---',
    '',
    '# Programs',
    '',
    'The 250 MPX G2 programs are organized into three major groups:',
    '',
    '## 1-99: Amp Input + FX Loop',
    '',
    'Programs designed to be used with the MPX G2 connected to a guitar amp with an effects loop',
    '',
    '## 100-149: Amp Input Only',
    '',
    'Programs designed to be used with the MPX G2 connected to an amp with no effects loop',
    '',
    '## 150-248: Stand Alone',
    '',
    'Programs designed to be used with the MPX G2 connected directly to a mixer or power amp',
    '',
    'Programs **249–250** are Utility presets (all configurations).',
    '',
    'Each group is broken down into smaller sections which we\'ve titled to make it',
    'easier for you to find just what you\'re looking for.',
    '',
    '### Top Nineteen (Amp Input + FX Loop)',
    '',
    top,
    '',
  ]
  seen = {('Amp Input + FX Loop', 'Top Nineteen')}
  for b in blurbs:
    key = (b.group, b.sub_group)
    if key in seen:
      continue
    seen.add(key)
    lines += [f'### {b.sub_group} ({b.group})', '', b.text, '']
  for _lo, _hi, group, sub in RANGES:
    if (group, sub) in seen:
      continue
    seen.add((group, sub))
    lines += [f'### {sub} ({group})', '', f'Programs in the **{sub}** section ({group}).', '']
  return '\n'.join(lines).rstrip() + '\n'


def main() -> None:
  raw = SEARCHABLE.read_text(errors='ignore')
  chapter = slice_chapter9(raw)
  primary = parse_programs(chapter, 'searchable')
  inline = parse_inline_programs(chapter, 'searchable')
  docling: dict[int, Program] = {}
  if DOCLING_MD.exists():
    docling = parse_programs(DOCLING_MD.read_text(), 'docling')
  # Prefer searchable (primary + inline); Docling only fills gaps.
  preferred: dict[int, Program] = {}
  for src in (inline, primary):
    for num, prog in src.items():
      cur = preferred.get(num)
      if cur is None or len(prog.description) >= len(cur.description):
        preferred[num] = prog
  programs = merge(preferred, docling)
  for num, prog in list(programs.items()):
    name, desc = split_glued_name(prog.name, prog.description)
    programs[num] = Program(
      prog.num,
      name,
      finalize_desc(desc),
      prog.source,
    )

  # Hard corrections where OCR/PDF line-wrapping splits names
  PATCHES: dict[int, tuple[str, str]] = {
    9: (
      'JamMan',
      'It\'s baaaack!!!!!!! A medium-gain preamp with a chorus, reverb and a 20-second single '
      'loop JamMan! The MPX G2 front panel buttons or the MPX R1 control: Tap = Record Loop, '
      'A/B = Layer, Delay = Clear Loop. The MPX R1 Toe Switch lets the pedal control volume '
      '(Toe Switch off) or wah (Toe Switch on).',
    ),
    29: (
      'Wah & Aero',
      'Wah, Screamer and Aero Flange with the MPX R1 Toe Switch turning the wah on and off. '
      'This makes it possible to have the wah and modulation effects on at the same time.',
    ),
    51: (
      'Square Trem',
      'A square wave LFO gives this tremolo a hard edge before it hits your amp. '
      '(Be sure to check out the PW parameter in the Soft Row.) Tap the tempo and set depth with the pedal.',
    ),
    78: (
      'StereoChorus',
      'A lush Lexicon stereo chorus.',
    ),
    79: (
      'ClassicDetune',
      'A simple but gorgeous effect. The dual pitch shifter is used to independently detune '
      'the left and right sides of the stereo field. The classic settings are ±8 cents, but feel '
      'free to modify these default settings.',
    ),
    157: (
      'Pdl Octaves',
      'Use a pedal to create outrageous octave sweeps. A/B changes the direction of the sweep '
      '(A=octave up, B=octave down). Chorus, delay and reverb are in the effects loop. Check out the Glide '
      'parameter in the Soft Row. When it\'s set to Off, the pedal produces a chromatic glissando '
      'instead of a continuous glide.',
    ),
    213: (
      'Env AutoPan',
      'RedComp pumps up the signal before it gets to Preamp. From there, it runs through reverb auto pan, '
      'chorus and delay. The twist here is that the panner rate is envelope controlled. Play a big chord '
      'and listen to what happens as it rings out. The MPX R1 pedal controls the depth of the panning. '
      'Tap sets the delay rhythm.',
    ),
    249: (
      'Unity Gain',
      'This program is set up for testing a unity gain signal in all configurations.',
    ),
    250: (
      'Clean Slate',
      'Want to start from scratch? This one\'s as empty as they get.',
    ),
  }
  for num, (name, desc) in PATCHES.items():
    programs[num] = Program(num, name, clean_desc(desc), 'patch')

  blurbs = extract_blurbs(chapter)

  OUT.mkdir(parents=True, exist_ok=True)
  written = 0
  skipped = 0
  short: list[int] = []

  # Keep hand-authored 001.md body, but ensure schema fields are present
  path_001 = OUT / '001.md'
  if path_001.exists():
    text = path_001.read_text()
    if 'parameters:' not in text:
      text = text.replace(
        'subGroup: Top Nineteen\n---',
        'subGroup: Top Nineteen\nparameters: []\n---',
      )
      path_001.write_text(text)
    skipped += 1
  else:
    path_001.write_text(render_program(programs[1]))
    written += 1

  for num in range(2, 251):
    path = OUT / f'{num:03d}.md'
    prog = programs[num]
    if len(prog.description) < 20:
      short.append(num)
    path.write_text(render_program(prog))
    written += 1

  (OUT / 'index.md').write_text(render_index(blurbs))
  print(f'Wrote {written} files, preserved/updated {skipped}')
  print(f'Searchable programs: {len(primary)}, inline: {len(inline)}, docling: {len(docling)}')
  print(f'Short descriptions: {short}')
  print(f'Subgroup blurbs: {len(blurbs)}')


if __name__ == '__main__':
  main()
