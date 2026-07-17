import { HandshakeCommand, SysExMessageType } from '#shared/types/midi'
import { parseDataMessagePayload, formatControlPath } from '#shared/midi/data-message'
import {
  buildActiveProgramDumpRequest,
  buildProgramDumpRequest
} from '#shared/midi/requests'
import { parseMpxG2SysEx } from '#shared/midi/sysex'
import { buildProgramSelectMessages } from '#shared/midi/program-select'
import {
  FACTORY_PROGRAM_COUNT,
  MAX_PROGRAM_NUMBER,
  PROGRAM_DUMP_BYTE_COUNT,
  decodeProgramDumpBlocks,
  isActiveProgramDumpPath,
  isLikelyProgramDumpData,
  parseProgramDumpAlgs,
  parseProgramDumpName,
  parseProgramDumpPath,
  type DecodedProgramBlock,
  type ProgramDumpAlgBlock
} from '#shared/midi/program-dump'

export type ProgramHarvestPhase = 'idle' | 'running' | 'done' | 'error'
export type ProgramHarvestStrategy = 'active' | 'stored'

export type ProgramHarvestStatus = {
  phase: ProgramHarvestPhase
  note: string
  strategy: ProgramHarvestStrategy
  from: number
  to: number
  current: number | null
  received: number
  failed: number
  retries: number
  rxCount: number
  lastRxNote: string | null
  error: string | null
}

export type HarvestedProgramDump = {
  programNumber: number
  name: string
  path: string
  levels: number[]
  byteCount: number
  algs: Record<ProgramDumpAlgBlock, number>
  /** Decoded per-block effect + param values (from PARAM_DATA). */
  blocks: DecodedProgramBlock[]
  /** Denibblized MPXG2_PROGRAM bytes. */
  data: number[]
  /** Same payload as hex string for easy tooling. */
  dataHex: string
}

const SELECT_GAP_MS = 40
/** Let the G2 finish loading before requesting Active Program dump. */
const LOAD_SETTLE_MS = 650
const REQUEST_GAP_MS = 80
/** Large SysEx; interfaces can be slow. */
const REPLY_MS = 6000
const MAX_RETRIES = 2

/**
 * Harvest stored programs by loading each via Program Change, then requesting
 * the Active Program dump (same blob as front-panel Current Pgm).
 * Falls back path: direct System→Programs Data request (`stored` strategy).
 */
export function useProgramHarvest() {
  const {
    status,
    mode,
    sendSysEx,
    sendMidi,
    getSysexOptions,
    setHarvestHandler,
    clearHarvestHandler,
    beginHarvestQuiet,
    endHarvestQuiet
  } = useMidiConnection()

  const harvestStatus = ref<ProgramHarvestStatus>({
    phase: 'idle',
    note: 'Idle',
    strategy: 'active',
    from: 1,
    to: FACTORY_PROGRAM_COUNT,
    current: null,
    received: 0,
    failed: 0,
    retries: 0,
    rxCount: 0,
    lastRxNote: null,
    error: null
  })

  const dumps = ref<HarvestedProgramDump[]>([])
  const failedNumbers = ref<number[]>([])

  let active = false
  let strategy: ProgramHarvestStrategy = 'active'
  let queue: number[] = []
  let pendingNumber: number | null = null
  let pendingRetries = 0
  let gapTimer: ReturnType<typeof setTimeout> | null = null
  let replyTimer: ReturnType<typeof setTimeout> | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let loadTimer: ReturnType<typeof setTimeout> | null = null

  function setStatus(partial: Partial<ProgramHarvestStatus>) {
    harvestStatus.value = { ...harvestStatus.value, ...partial }
  }

  function clearTimers() {
    if (gapTimer) {
      clearTimeout(gapTimer)
      gapTimer = null
    }
    if (replyTimer) {
      clearTimeout(replyTimer)
      replyTimer = null
    }
    if (settleTimer) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
  }

  function bytesToHex(data: number[]): string {
    return data.map(byte => byte.toString(16).padStart(2, '0')).join('')
  }

  function finish(note: string, phase: ProgramHarvestPhase = 'done') {
    active = false
    clearTimers()
    clearHarvestHandler()
    endHarvestQuiet()
    pendingNumber = null
    setStatus({
      phase,
      note,
      current: null
    })
  }

  function noteRx(message: string) {
    setStatus({
      rxCount: harvestStatus.value.rxCount + 1,
      lastRxNote: message
    })
  }

  function armReplyWatchdog() {
    if (replyTimer) {
      clearTimeout(replyTimer)
    }
    replyTimer = setTimeout(() => {
      replyTimer = null
      if (!active || pendingNumber == null) {
        return
      }
      if (pendingRetries < MAX_RETRIES) {
        pendingRetries += 1
        setStatus({
          retries: harvestStatus.value.retries + 1,
          note: `No dump for #${pendingNumber} — retry ${pendingRetries}/${MAX_RETRIES} (rx=${harvestStatus.value.rxCount})`
        })
        if (strategy === 'active') {
          requestActiveDump()
        } else {
          requestStoredDump()
        }
        return
      }
      failedNumbers.value = [...failedNumbers.value, pendingNumber]
      setStatus({
        failed: failedNumbers.value.length,
        note: `Timed out on #${pendingNumber} — skipping (last RX: ${harvestStatus.value.lastRxNote ?? 'none'})`
      })
      pendingNumber = null
      pendingRetries = 0
      scheduleNext()
    }, REPLY_MS)
  }

  function requestStoredDump() {
    if (!active || pendingNumber == null) {
      return
    }
    const opts = getSysexOptions()
    const ok = sendSysEx(
      buildProgramDumpRequest(pendingNumber, opts.deviceId, opts.productId),
      `Program dump request (stored) #${pendingNumber}`,
      { silent: false }
    )
    if (!ok) {
      finish('Failed to send SysEx (check MIDI output port).', 'error')
      setStatus({ error: 'SysEx send failed' })
      return
    }
    setStatus({
      current: pendingNumber,
      note: `Requesting stored dump #${String(pendingNumber).padStart(3, '0')}…`
    })
    armReplyWatchdog()
  }

  function requestActiveDump() {
    if (!active || pendingNumber == null) {
      return
    }
    const opts = getSysexOptions()
    const ok = sendSysEx(
      buildActiveProgramDumpRequest(opts.deviceId, opts.productId),
      `Active program dump request (for #${pendingNumber})`,
      { silent: false }
    )
    if (!ok) {
      finish('Failed to send SysEx (check MIDI output port).', 'error')
      setStatus({ error: 'SysEx send failed' })
      return
    }
    setStatus({
      current: pendingNumber,
      note: `Requesting active dump for #${String(pendingNumber).padStart(3, '0')}…`
    })
    armReplyWatchdog()
  }

  function loadThenRequestActive() {
    if (!active || pendingNumber == null) {
      return
    }
    const messages = buildProgramSelectMessages(pendingNumber)
    for (const [index, message] of messages.entries()) {
      window.setTimeout(() => {
        if (!active || pendingNumber == null) {
          return
        }
        sendMidi(message.bytes, message.note, { silent: false })
      }, index * SELECT_GAP_MS)
    }
    setStatus({
      current: pendingNumber,
      note: `Loading program #${String(pendingNumber).padStart(3, '0')}…`
    })
    if (loadTimer) {
      clearTimeout(loadTimer)
    }
    loadTimer = setTimeout(() => {
      loadTimer = null
      if (!active || pendingNumber == null) {
        return
      }
      requestActiveDump()
    }, SELECT_GAP_MS * messages.length + LOAD_SETTLE_MS)
  }

  function scheduleNext() {
    if (!active) {
      return
    }
    if (gapTimer) {
      clearTimeout(gapTimer)
    }
    gapTimer = setTimeout(() => {
      gapTimer = null
      if (!active) {
        return
      }
      const next = queue.shift()
      if (next == null) {
        const failed = failedNumbers.value.length
        finish(
          failed > 0
            ? `Done — ${dumps.value.length} dumps, ${failed} failed (${failedNumbers.value.join(', ')})`
            : `Done — ${dumps.value.length} program dumps`
        )
        return
      }
      pendingNumber = next
      pendingRetries = 0
      if (strategy === 'active') {
        loadThenRequestActive()
      } else {
        requestStoredDump()
      }
    }, REQUEST_GAP_MS)
  }

  function acceptDump(programNumber: number, data: number[], levels: number[]) {
    if (replyTimer) {
      clearTimeout(replyTimer)
      replyTimer = null
    }

    const entry: HarvestedProgramDump = {
      programNumber,
      name: parseProgramDumpName(data),
      path: formatControlPath(levels),
      levels: [...levels],
      byteCount: data.length,
      algs: parseProgramDumpAlgs(data),
      blocks: decodeProgramDumpBlocks(data),
      data: [...data],
      dataHex: bytesToHex(data)
    }

    const without = dumps.value.filter(d => d.programNumber !== programNumber)
    dumps.value = [...without, entry].sort((a, b) => a.programNumber - b.programNumber)
    failedNumbers.value = failedNumbers.value.filter(n => n !== programNumber)

    setStatus({
      received: dumps.value.length,
      failed: failedNumbers.value.length,
      note: `Got ${String(programNumber).padStart(3, '0')}${entry.name ? ` “${entry.name}”` : ''} (${data.length} bytes)`
    })

    pendingNumber = null
    pendingRetries = 0
    scheduleNext()
  }

  function handleInbound(raw: Uint8Array) {
    if (!active) {
      return
    }
    const parsed = parseMpxG2SysEx(raw)
    if (!parsed) {
      noteRx(`Unparsed ${raw.length}B (starts ${raw[0]?.toString(16)})`)
      return
    }

    if (parsed.messageType === SysExMessageType.Handshake) {
      const cmd = parsed.payload[0]
      const label = cmd === HandshakeCommand.Busy
        ? 'BUSY'
        : cmd === HandshakeCommand.Ready
          ? 'READY'
          : cmd === HandshakeCommand.Error
            ? 'Error'
            : cmd === HandshakeCommand.AreYouThere
              ? 'AreYouThere'
              : `Handshake 0x${(cmd ?? 0).toString(16)}`
      noteRx(label)
      return
    }

    if (parsed.messageType !== SysExMessageType.Data) {
      noteRx(`Msg type 0x${parsed.messageType.toString(16)} (${raw.length}B)`)
      return
    }

    const dataMsg = parseDataMessagePayload(parsed.payload)
    if (!dataMsg) {
      noteRx(`Data parse fail (${raw.length}B wire)`)
      return
    }

    noteRx(`Data ${dataMsg.data.length}B @ ${formatControlPath(dataMsg.levels)}`)

    const fromPath = parseProgramDumpPath(dataMsg.levels)
    if (fromPath && isLikelyProgramDumpData(dataMsg.data)) {
      acceptDump(fromPath.programNumber, dataMsg.data, dataMsg.levels)
      return
    }

    if (
      pendingNumber != null
      && isActiveProgramDumpPath(dataMsg.levels)
      && isLikelyProgramDumpData(dataMsg.data)
    ) {
      acceptDump(pendingNumber, dataMsg.data, dataMsg.levels)
      return
    }

    // Oversized reply with pending request — accept even if path surprised us.
    if (pendingNumber != null && isLikelyProgramDumpData(dataMsg.data)) {
      acceptDump(pendingNumber, dataMsg.data, dataMsg.levels)
    }
  }

  function start(
    from = 1,
    to = FACTORY_PROGRAM_COUNT,
    nextStrategy: ProgramHarvestStrategy = 'active'
  ) {
    const lo = Math.max(1, Math.min(MAX_PROGRAM_NUMBER, Math.trunc(from)))
    const hi = Math.max(lo, Math.min(MAX_PROGRAM_NUMBER, Math.trunc(to)))

    if (status.value !== 'connected') {
      setStatus({
        phase: 'error',
        error: 'Connect to the MPX-G2 (hardware mode) before harvesting.',
        note: 'Not connected'
      })
      return
    }
    if (mode.value !== 'hardware') {
      setStatus({
        phase: 'error',
        error: 'Program harvest requires hardware MIDI.',
        note: 'Wrong mode'
      })
      return
    }

    stop(false)
    active = true
    strategy = nextStrategy
    dumps.value = []
    failedNumbers.value = []
    queue = []
    for (let n = lo; n <= hi; n++) {
      queue.push(n)
    }

    setStatus({
      phase: 'running',
      strategy,
      note: 'Quieting panel traffic (Auto Display / polls off)…',
      from: lo,
      to: hi,
      current: null,
      received: 0,
      failed: 0,
      retries: 0,
      rxCount: 0,
      lastRxNote: null,
      error: null
    })

    setHarvestHandler(handleInbound)
    beginHarvestQuiet()

    settleTimer = setTimeout(() => {
      settleTimer = null
      if (!active) {
        return
      }
      const modeNote = strategy === 'active'
        ? 'Program Change → Active dump'
        : 'Direct stored-path Data request'
      setStatus({
        note: `Harvesting ${lo}–${hi} via ${modeNote} (${queue.length} programs)…`
      })
      scheduleNext()
    }, 300)
  }

  function stop(resetStatus = true) {
    active = false
    clearTimers()
    clearHarvestHandler()
    endHarvestQuiet()
    queue = []
    pendingNumber = null
    pendingRetries = 0
    if (resetStatus && harvestStatus.value.phase !== 'done') {
      setStatus({
        phase: 'idle',
        note: 'Idle',
        current: null
      })
    }
  }

  function downloadJson() {
    const bundle = {
      format: 'mpx-g2-program-harvest',
      version: 2,
      strategy: harvestStatus.value.strategy,
      expectedByteCount: PROGRAM_DUMP_BYTE_COUNT,
      from: harvestStatus.value.from,
      to: harvestStatus.value.to,
      received: dumps.value.length,
      failed: failedNumbers.value,
      programs: dumps.value.map(dump => ({
        programNumber: dump.programNumber,
        name: dump.name,
        path: dump.path,
        levels: dump.levels,
        byteCount: dump.byteCount,
        algs: dump.algs,
        blocks: dump.blocks,
        dataHex: dump.dataHex
      }))
    }
    triggerDownload(
      'mpx-g2-program-harvest.json',
      JSON.stringify(bundle, null, 2),
      'application/json'
    )
  }

  function downloadSyxListing() {
    const parts = dumps.value.map((dump) => {
      return [
        `; Program ${String(dump.programNumber).padStart(3, '0')} ${dump.name || '(unnamed)'}`,
        `; path ${dump.path}`,
        `; ${dump.byteCount} bytes denibblized`,
        dump.dataHex
      ].join('\n')
    })
    triggerDownload(
      'mpx-g2-program-dumps.hex.txt',
      parts.join('\n\n') + '\n',
      'text/plain'
    )
  }

  const canDownload = computed(() => dumps.value.length > 0)

  onBeforeUnmount(() => {
    stop()
  })

  return {
    harvestStatus,
    dumps,
    failedNumbers,
    canDownload,
    start,
    stop,
    downloadJson,
    downloadSyxListing
  }
}

function triggerDownload(filename: string, body: string, type: string) {
  const blob = new Blob([body], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
