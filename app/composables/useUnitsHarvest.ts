import { HandshakeCommand, SysExMessageType } from '#shared/types/midi'
import {
  parseObjectDescriptionPayload,
  parseObjectTypeIdPayload,
  type ObjectDescription
} from '#shared/midi/object-description'
import { parseSystemConfigPayload, type SystemConfiguration } from '#shared/midi/system-config'
import {
  buildDataRequest,
  buildFormattedStringRequest,
  buildObjectDescriptionRequest,
  buildObjectTypeIdRequest,
  buildSystemConfigRequest
} from '#shared/midi/requests'
import { effectAlgControlPath } from '#shared/midi/control-paths'
import { buildDataMessage, parseMpxG2SysEx } from '#shared/midi/sysex'
import { encodeParamValue, decodeParamValue } from '#shared/midi/param-value'
import { parseFormattedStringPayload } from '#shared/midi/formatted-string'
import { parseDataMessagePayload } from '#shared/midi/data-message'
import { DISPLAY_UNITS } from '#shared/constants/units-map'
import {
  buildUnitsCatalogProbes,
  foldUnitsHarvestSamples,
  harvestableStringTables,
  mergeUnitStringTables,
  planUnitsHarvestJobs,
  type UnitsCatalogProbe,
  type UnitsHarvestJob,
  type UnitsHarvestSample,
  type UnitsHarvestTableResult
} from '#shared/midi/units-harvest'
import { GENERATED_UNIT_STRING_TABLES } from '#shared/constants/units-strings.generated'
import type { HarvestTreeNode } from '#shared/midi/effect-harvest'
import type { EffectBlockId } from '#shared/types/effect-blocks'

export type UnitsHarvestPhase
  = | 'idle'
    | 'system-config'
    | 'catalog-probe'
    | 'sweep'
    | 'done'
    | 'error'

export type UnitsHarvestStatus = {
  phase: UnitsHarvestPhase
  note: string
  objectTypeCount: number
  descriptionsLoaded: number
  treeNodes: number
  probesDone: number
  probesTotal: number
  tablesFound: number
  tablesTarget: number
  jobCount: number
  jobsDone: number
  samplesCaptured: number
  waitingForReady: boolean
  error: string | null
}

const PROBE_STAGGER_MS = 25
/** Fail fast on missing paths — catalog has many slots the unit may not answer. */
const PROBE_OTID_MS = 700
const PROBE_OD_MS = 900
const BUSY_WATCHDOG_MS = 4000
/** Alg must be loaded before OTID/OD on its params will answer. */
const PROBE_ALG_LOAD_SETTLE_MS = 350
const ALG_LOAD_SETTLE_MS = 250
const SWEEP_WRITE_SETTLE_MS = 120
const SWEEP_STRING_REPLY_MS = 1200
const SWEEP_DATA_REPLY_MS = 1200
/** Drop Formatted String captures that look like LCD dumps / stuck values. */
const MAX_STRING_LABEL_LEN = 24

type SweepStep
  = | { kind: 'load-alg', block: EffectBlockId, alg: number }
    | { kind: 'read' }
    | { kind: 'write', value: number }
    | { kind: 'verify', value: number }
    | { kind: 'string', value: number }
    | { kind: 'restore-alg' }

type ProbePending = {
  probe: UnitsCatalogProbe
  stage: 'otid' | 'od'
  objectTypeId?: number
}

/**
 * Harvest Formatted String tables using content/algorithms.generated.ts paths.
 * Probe phase: load each alg, then OTID+OD per catalog param.
 * Sweep phase: write values and capture Formatted String labels.
 */
export function useUnitsHarvest() {
  const {
    status,
    mode,
    sendSysEx,
    getSysexOptions,
    setHarvestHandler,
    clearHarvestHandler,
    beginHarvestQuiet,
    endHarvestQuiet
  } = useMidiConnection()

  const harvestStatus = ref<UnitsHarvestStatus>({
    phase: 'idle',
    note: 'Idle',
    objectTypeCount: 0,
    descriptionsLoaded: 0,
    treeNodes: 0,
    probesDone: 0,
    probesTotal: 0,
    tablesFound: 0,
    tablesTarget: 0,
    jobCount: 0,
    jobsDone: 0,
    samplesCaptured: 0,
    waitingForReady: false,
    error: null
  })

  const systemConfig = ref<SystemConfiguration | null>(null)
  const tables = ref<UnitsHarvestTableResult[]>([])
  const jobs = ref<UnitsHarvestJob[]>([])

  let descriptions = new Map<number, ObjectDescription>()
  let treeNodes: HarvestTreeNode[] = []
  let probeByPathKey = new Map<string, UnitsCatalogProbe>()
  let probeQueue: UnitsCatalogProbe[] = []
  let probePending: ProbePending | null = null
  let probesDone = 0
  let probesSinceNewTable = 0
  let targetTables: string[] = []
  let foundTables = new Set<string>()

  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let workTimer: ReturnType<typeof setTimeout> | null = null
  let replyTimer: ReturnType<typeof setTimeout> | null = null
  let busyTimer: ReturnType<typeof setTimeout> | null = null
  let active = false

  let jobQueue: UnitsHarvestJob[] = []
  /** Stable copy for fold/download — never shifted during sweep. */
  let plannedJobs: UnitsHarvestJob[] = []
  let currentJob: UnitsHarvestJob | null = null
  let sweepSteps: SweepStep[] = []
  let pendingStep: SweepStep | null = null
  let loadedSweepAlg: { block: EffectBlockId, alg: number } | null = null
  let loadedProbeAlg: { block: EffectBlockId, alg: number } | null = null
  let savedValue: number | null = null
  let samplesByTable = new Map<string, UnitsHarvestSample[]>()
  let samplesCaptured = 0

  function setStatus(partial: Partial<UnitsHarvestStatus>) {
    harvestStatus.value = { ...harvestStatus.value, ...partial }
  }

  function clearTimers() {
    for (const timer of [settleTimer, workTimer, replyTimer, busyTimer]) {
      if (timer) {
        clearTimeout(timer)
      }
    }
    settleTimer = null
    workTimer = null
    replyTimer = null
    busyTimer = null
  }

  function armBusyWatchdog() {
    if (busyTimer) {
      clearTimeout(busyTimer)
    }
    busyTimer = setTimeout(() => {
      busyTimer = null
      if (!active || !harvestStatus.value.waitingForReady) {
        return
      }
      console.warn('[mpx-g2 units-harvest] BUSY watchdog — forcing continue')
      setStatus({ waitingForReady: false, note: 'BUSY timed out — continuing…' })
      resumeAfterBusy()
    }, BUSY_WATCHDOG_MS)
  }

  function resumeAfterBusy() {
    if (harvestStatus.value.phase === 'catalog-probe') {
      if (probePending?.stage === 'od' && probePending.objectTypeId != null) {
        requestPendingOd(probePending.objectTypeId)
        return
      }
      scheduleProbeNext()
      return
    }
    if (harvestStatus.value.phase === 'sweep') {
      scheduleSweepNext(0)
    }
  }

  function refreshFoundTables() {
    const before = foundTables.size
    const planned = planUnitsHarvestJobs(treeNodes, descriptions, { probeByPathKey })
    foundTables = new Set(planned.map(j => j.stringTable))
    if (foundTables.size > before) {
      probesSinceNewTable = 0
    }
    setStatus({
      tablesFound: foundTables.size,
      tablesTarget: targetTables.length
    })
    return planned
  }

  function allTablesFound() {
    return targetTables.length > 0 && targetTables.every(name => foundTables.has(name))
  }

  function shouldStopProbing() {
    // Run the full catalog (or until every known string table has a representative).
    // An early "stale" stop was wrongly cutting off at ~40/552 after the first table.
    return allTablesFound() || probeQueue.length === 0
  }

  function startCatalogProbe() {
    const probes = buildUnitsCatalogProbes()
    probeQueue = probes
    probeByPathKey = new Map(probes.map(p => [p.path.join('.'), p]))
    probePending = null
    probesDone = 0
    probesSinceNewTable = 0
    treeNodes = []
    descriptions = new Map()
    targetTables = harvestableStringTables()
    foundTables = new Set()
    loadedProbeAlg = null

    setStatus({
      phase: 'catalog-probe',
      note: `Probing ${probes.length} catalog params (loading each alg first)…`,
      probesDone: 0,
      probesTotal: probes.length,
      tablesFound: 0,
      tablesTarget: targetTables.length,
      treeNodes: 0,
      descriptionsLoaded: 0
    })
    scheduleProbeNext()
  }

  function scheduleProbeNext() {
    if (workTimer) {
      clearTimeout(workTimer)
    }
    workTimer = setTimeout(() => {
      workTimer = null
      requestProbeNext()
    }, PROBE_STAGGER_MS)
  }

  function requestProbeNext() {
    if (!active || harvestStatus.value.phase !== 'catalog-probe') {
      return
    }
    if (harvestStatus.value.waitingForReady || probePending) {
      return
    }

    if (shouldStopProbing()) {
      beginSweep()
      return
    }

    const next = probeQueue[0]
    if (!next) {
      beginSweep()
      return
    }

    // OTID/OD only answer when the algorithm is loaded in that block.
    const needLoad = !loadedProbeAlg
      || loadedProbeAlg.block !== next.block
      || loadedProbeAlg.alg !== next.alg
    if (needLoad) {
      const opts = getSysexOptions()
      sendSysEx(
        buildDataMessage(
          encodeParamValue(next.alg, 1),
          effectAlgControlPath(next.block),
          { deviceId: opts.deviceId, productId: opts.productId }
        ),
        `Units probe load ${next.block}=${next.alg}`
      )
      loadedProbeAlg = { block: next.block, alg: next.alg }
      setStatus({
        note: `Loading ${next.block} alg ${next.alg} (${next.algorithmId})…`
      })
      if (workTimer) {
        clearTimeout(workTimer)
      }
      workTimer = setTimeout(() => {
        workTimer = null
        requestProbeNext()
      }, PROBE_ALG_LOAD_SETTLE_MS)
      return
    }

    const probe = probeQueue.shift()!
    probePending = { probe, stage: 'otid' }
    const opts = getSysexOptions()
    sendSysEx(
      buildObjectTypeIdRequest(probe.path, opts.deviceId, opts.productId),
      `Units OTID ${probe.path.join('.')}`
    )
    setStatus({
      note: `Probe ${probe.algorithmId}.${probe.paramId} — `
        + `${foundTables.size}/${targetTables.length} tables, `
        + `${probesDone + 1}/${harvestStatus.value.probesTotal}, queue ${probeQueue.length}`
    })
    armReplyTimeout(PROBE_OTID_MS, () => onProbeMiss())
  }

  function armReplyTimeout(ms: number, onTimeout: () => void) {
    if (replyTimer) {
      clearTimeout(replyTimer)
    }
    replyTimer = setTimeout(() => {
      replyTimer = null
      onTimeout()
    }, ms)
  }

  function requestPendingOd(objectTypeId: number) {
    if (!probePending) {
      return
    }
    probePending = { ...probePending, stage: 'od', objectTypeId }
    const opts = getSysexOptions()
    sendSysEx(
      buildObjectDescriptionRequest(objectTypeId, opts.deviceId, opts.productId),
      `Units OD ${objectTypeId}`
    )
    armReplyTimeout(PROBE_OD_MS, () => onProbeOdMiss(objectTypeId))
  }

  function finishProbeStep() {
    probePending = null
    probesDone += 1
    probesSinceNewTable += 1
    setStatus({ probesDone })
    scheduleProbeNext()
  }

  function onProbeMiss() {
    if (!probePending) {
      return
    }
    finishProbeStep()
  }

  function onProbeOdMiss(_objectTypeId: number) {
    if (!probePending || probePending.stage !== 'od') {
      return
    }
    finishProbeStep()
  }

  function onProbeOtid(objectTypeId: number, levels: number[] | null) {
    if (!probePending || probePending.stage !== 'otid') {
      return
    }
    if (levels?.length && levels.join('.') !== probePending.probe.path.join('.')) {
      return
    }
    if (replyTimer) {
      clearTimeout(replyTimer)
      replyTimer = null
    }

    if (descriptions.has(objectTypeId)) {
      commitProbeNode(probePending.probe, objectTypeId)
      return
    }
    requestPendingOd(objectTypeId)
  }

  function onProbeOd(description: ObjectDescription) {
    descriptions.set(description.objectTypeId, description)
    setStatus({ descriptionsLoaded: descriptions.size })

    if (
      probePending?.stage === 'od'
      && probePending.objectTypeId === description.objectTypeId
    ) {
      if (replyTimer) {
        clearTimeout(replyTimer)
        replyTimer = null
      }
      commitProbeNode(probePending.probe, description.objectTypeId)
    }
  }

  function commitProbeNode(probe: UnitsCatalogProbe, objectTypeId: number) {
    treeNodes.push({ objectTypeId, levels: [...probe.path] })
    setStatus({ treeNodes: treeNodes.length })
    const before = foundTables.size
    refreshFoundTables()
    // refreshFoundTables resets probesSinceNewTable when a new table appears;
    // finishProbeStep always increments, so compensate if we just found one.
    if (foundTables.size > before) {
      probesSinceNewTable = -1 // finishProbeStep will bump to 0
    }
    finishProbeStep()
  }

  function beginSweep() {
    const planned = refreshFoundTables()
    planned.sort((a, b) => {
      if (a.block !== b.block) {
        return a.block.localeCompare(b.block)
      }
      return a.alg - b.alg
    })
    // Keep plannedJobs/jobs.value stable for fold/download — never share with the mutable queue.
    plannedJobs = planned
    jobs.value = planned
    jobQueue = [...planned]
    samplesByTable = new Map()
    samplesCaptured = 0
    currentJob = null
    sweepSteps = []
    pendingStep = null
    loadedSweepAlg = null
    savedValue = null

    if (planned.length === 0) {
      finishHarvest(
        `Catalog probe done (${probesDone} params) but no string-backed units with span ≤ 128`
      )
      return
    }

    setStatus({
      phase: 'sweep',
      note: `Sweeping ${planned.length} string table(s)…`,
      jobCount: planned.length,
      jobsDone: 0,
      samplesCaptured: 0
    })
    advanceJob()
  }

  function advanceJob() {
    if (!active) {
      return
    }
    currentJob = jobQueue.shift() ?? null
    if (!currentJob) {
      finishHarvest('Sweep complete')
      return
    }

    const job = currentJob
    samplesByTable.set(job.stringTable, [])
    sweepSteps = []

    const needLoad = !loadedSweepAlg
      || loadedSweepAlg.block !== job.block
      || loadedSweepAlg.alg !== job.alg
    if (needLoad) {
      sweepSteps.push({ kind: 'load-alg', block: job.block, alg: job.alg })
    }

    sweepSteps.push({ kind: 'read' })
    for (let value = job.min; value <= job.max; value++) {
      sweepSteps.push(
        { kind: 'write', value },
        { kind: 'verify', value },
        { kind: 'string', value }
      )
    }
    // Restore the param value after the sweep (alg left loaded for next job in group).
    sweepSteps.push({ kind: 'restore-alg' })

    setStatus({
      note: `Sweep ${job.stringTable} · ${job.block} alg ${job.alg} · ${job.paramName} (${job.min}…${job.max})`,
      jobsDone: harvestStatus.value.jobCount - jobQueue.length - 1
    })
    scheduleSweepNext(0)
  }

  function scheduleSweepNext(delayMs: number) {
    if (workTimer) {
      clearTimeout(workTimer)
    }
    workTimer = setTimeout(() => {
      workTimer = null
      runSweepStep()
    }, delayMs)
  }

  function runSweepStep() {
    if (!active || harvestStatus.value.phase !== 'sweep' || !currentJob) {
      return
    }
    if (harvestStatus.value.waitingForReady || pendingStep) {
      return
    }

    const step = sweepSteps.shift()
    if (!step) {
      advanceJob()
      return
    }

    const opts = getSysexOptions()
    const path = currentJob.path
    pendingStep = step

    if (step.kind === 'load-alg') {
      sendSysEx(
        buildDataMessage(
          encodeParamValue(step.alg, 1),
          effectAlgControlPath(step.block),
          { deviceId: opts.deviceId, productId: opts.productId }
        ),
        `Units load alg ${step.block}=${step.alg}`
      )
      loadedSweepAlg = { block: step.block, alg: step.alg }
      pendingStep = null
      scheduleSweepNext(ALG_LOAD_SETTLE_MS)
      return
    }

    if (step.kind === 'read') {
      sendSysEx(buildDataRequest(path, opts.deviceId, opts.productId), 'Units read param')
      armSweepTimeout(SWEEP_DATA_REPLY_MS)
      return
    }

    if (step.kind === 'write') {
      const data = encodeParamValue(step.value, currentJob.bytes)
      sendSysEx(
        buildDataMessage(data, path, { deviceId: opts.deviceId, productId: opts.productId }),
        `Units write ${step.value}`
      )
      pendingStep = null
      scheduleSweepNext(SWEEP_WRITE_SETTLE_MS)
      return
    }

    if (step.kind === 'verify') {
      sendSysEx(buildDataRequest(path, opts.deviceId, opts.productId), `Units verify ${step.value}`)
      armSweepTimeout(SWEEP_DATA_REPLY_MS)
      return
    }

    if (step.kind === 'string') {
      sendSysEx(
        buildFormattedStringRequest(path, opts.deviceId, opts.productId),
        `Units string ${step.value}`
      )
      armSweepTimeout(SWEEP_STRING_REPLY_MS)
      return
    }

    // restore-alg step name kept for enum compatibility — restores param value only.
    if (savedValue != null && path.length > 0) {
      const data = encodeParamValue(savedValue, currentJob.bytes)
      sendSysEx(
        buildDataMessage(data, path, { deviceId: opts.deviceId, productId: opts.productId }),
        `Units restore param ${savedValue}`
      )
    }
    pendingStep = null
    savedValue = null
    setStatus({
      jobsDone: harvestStatus.value.jobCount - jobQueue.length,
      note: `Finished ${currentJob.stringTable}`
    })
    scheduleSweepNext(SWEEP_WRITE_SETTLE_MS)
  }

  function armSweepTimeout(ms: number) {
    if (replyTimer) {
      clearTimeout(replyTimer)
    }
    replyTimer = setTimeout(() => {
      replyTimer = null
      pendingStep = null
      scheduleSweepNext(0)
    }, ms)
  }

  function onSweepData(data: number[]) {
    if (!currentJob || !pendingStep) {
      return
    }
    if (pendingStep.kind !== 'read' && pendingStep.kind !== 'verify') {
      return
    }
    if (replyTimer) {
      clearTimeout(replyTimer)
      replyTimer = null
    }
    const value = decodeParamValue(data)
    if (pendingStep.kind === 'read') {
      savedValue = value
      pendingStep = null
      scheduleSweepNext(0)
      return
    }
    // verify: skip string capture when the write did not stick
    const expected = pendingStep.value
    pendingStep = null
    if (value !== expected) {
      const next = sweepSteps[0]
      if (next?.kind === 'string' && next.value === expected) {
        sweepSteps.shift()
      }
      setStatus({
        note: `Write did not stick (${expected}→${value}) — skip string`
      })
    }
    scheduleSweepNext(0)
  }

  function onSweepString(text: string) {
    if (pendingStep?.kind !== 'string' || !currentJob) {
      return
    }
    if (replyTimer) {
      clearTimeout(replyTimer)
      replyTimer = null
    }
    const label = text.trim()
    const usable = label.length > 0 && label.length <= MAX_STRING_LABEL_LEN
    if (usable) {
      const list = samplesByTable.get(currentJob.stringTable) ?? []
      list.push({ value: pendingStep.value, text: label })
      samplesByTable.set(currentJob.stringTable, list)
      samplesCaptured += 1
      setStatus({ samplesCaptured })
    }
    pendingStep = null
    scheduleSweepNext(0)
  }

  function finishHarvest(reason: string) {
    clearTimers()
    const jobsForFold = plannedJobs.length > 0 ? plannedJobs : jobs.value
    const folded = foldUnitsHarvestSamples(jobsForFold, samplesByTable)
    jobs.value = jobsForFold
    tables.value = folded
    setStatus({
      phase: 'done',
      note: `${reason} — ${folded.filter(t => t.samples.length).length} table(s), ${samplesCaptured} sample(s)`,
      jobsDone: harvestStatus.value.jobCount || jobsForFold.length,
      samplesCaptured
    })
    stop(false)
  }

  function handleInbound(data: Uint8Array) {
    if (!active) {
      return
    }
    const parsed = parseMpxG2SysEx(data)
    if (!parsed) {
      return
    }

    if (parsed.messageType === SysExMessageType.Handshake) {
      const command = parsed.payload[0] ?? HandshakeCommand.Nop
      if (command === HandshakeCommand.Busy) {
        setStatus({ waitingForReady: true, note: 'G2 BUSY — waiting for READY…' })
        armBusyWatchdog()
        return
      }
      if (command === HandshakeCommand.Ready) {
        if (busyTimer) {
          clearTimeout(busyTimer)
          busyTimer = null
        }
        setStatus({ waitingForReady: false, note: 'G2 READY — continuing…' })
        resumeAfterBusy()
        return
      }
      if (command === HandshakeCommand.Error) {
        if (harvestStatus.value.phase === 'catalog-probe') {
          if (probePending?.stage === 'od') {
            onProbeOdMiss(probePending.objectTypeId ?? -1)
          } else {
            onProbeMiss()
          }
        }
        return
      }
    }

    if (parsed.messageType === SysExMessageType.SystemConfiguration) {
      // Only the startup request may start the probe. Alg loads can provoke short
      // type-0x00 frames (or a full config re-dump) — never abort mid-harvest.
      if (harvestStatus.value.phase !== 'system-config') {
        return
      }
      if (replyTimer) {
        clearTimeout(replyTimer)
        replyTimer = null
      }
      const config = parseSystemConfigPayload(parsed.payload)
      if (config) {
        systemConfig.value = config
        setStatus({
          objectTypeCount: config.objectTypeCount,
          note: 'System Config OK — starting catalog probe…'
        })
      } else {
        setStatus({
          note: 'System Config unreadable — starting catalog probe anyway…'
        })
      }
      startCatalogProbe()
      return
    }

    if (parsed.messageType === SysExMessageType.ObjectTypeId) {
      const otid = parseObjectTypeIdPayload(parsed.payload)
      if (!otid || harvestStatus.value.phase !== 'catalog-probe') {
        return
      }
      onProbeOtid(otid.objectTypeId, otid.levels)
      return
    }

    if (parsed.messageType === SysExMessageType.ObjectDescription) {
      const description = parseObjectDescriptionPayload(parsed.payload)
      if (!description) {
        if (probePending?.stage === 'od') {
          onProbeOdMiss(probePending.objectTypeId ?? -1)
        }
        return
      }
      if (harvestStatus.value.phase === 'catalog-probe') {
        onProbeOd(description)
      }
      return
    }

    if (parsed.messageType === SysExMessageType.Data) {
      const dataMsg = parseDataMessagePayload(parsed.payload)
      if (!dataMsg || harvestStatus.value.phase !== 'sweep') {
        return
      }
      onSweepData(dataMsg.data)
      return
    }

    if (parsed.messageType === SysExMessageType.FormattedString && harvestStatus.value.phase === 'sweep') {
      const formatted = parseFormattedStringPayload(parsed.payload)
      if (formatted) {
        onSweepString(formatted.text)
      }
    }
  }

  function start() {
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
        error: 'Units harvest requires hardware MIDI.',
        note: 'Wrong mode'
      })
      return
    }

    stop(false)
    active = true
    systemConfig.value = null
    tables.value = []
    jobs.value = []
    plannedJobs = []
    descriptions = new Map()
    treeNodes = []
    probeQueue = []
    probePending = null
    probeByPathKey = new Map()
    probesDone = 0
    probesSinceNewTable = 0
    foundTables = new Set()
    jobQueue = []
    currentJob = null
    samplesByTable = new Map()
    samplesCaptured = 0
    loadedSweepAlg = null
    loadedProbeAlg = null

    const probes = buildUnitsCatalogProbes()
    setStatus({
      phase: 'system-config',
      note: 'Quieting MIDI bus…',
      objectTypeCount: 0,
      descriptionsLoaded: 0,
      treeNodes: 0,
      probesDone: 0,
      probesTotal: probes.length,
      tablesFound: 0,
      tablesTarget: harvestableStringTables().length,
      jobCount: 0,
      jobsDone: 0,
      samplesCaptured: 0,
      waitingForReady: false,
      error: null
    })

    setHarvestHandler(handleInbound)
    beginHarvestQuiet()
    const opts = getSysexOptions()
    settleTimer = setTimeout(() => {
      settleTimer = null
      if (!active) {
        return
      }
      sendSysEx(buildSystemConfigRequest(opts.deviceId, opts.productId), 'Units System Config')
      // Don't block forever if the unit never answers (or only sends a stub).
      armReplyTimeout(2500, () => {
        if (!active || harvestStatus.value.phase !== 'system-config') {
          return
        }
        setStatus({
          note: 'System Config timed out — starting catalog probe anyway…'
        })
        startCatalogProbe()
      })
    }, 300)
  }

  function stop(resetStatus = true) {
    active = false
    clearTimers()
    clearHarvestHandler()
    endHarvestQuiet()
    probePending = null
    pendingStep = null
    if (resetStatus && harvestStatus.value.phase !== 'done') {
      setStatus({
        phase: 'idle',
        note: 'Idle',
        waitingForReady: false
      })
    }
  }

  function buildBundle() {
    const base: Record<string, Record<number, string>> = {}
    for (const [name, table] of Object.entries(GENERATED_UNIT_STRING_TABLES)) {
      base[name] = { ...(table as Record<number, string>) }
    }
    const jobsForBundle = plannedJobs.length > 0 ? plannedJobs : jobs.value
    const tablesForBundle = tables.value.length > 0
      ? tables.value
      : foldUnitsHarvestSamples(jobsForBundle, samplesByTable)
    const stringTables = mergeUnitStringTables(base, tablesForBundle)
    return {
      generatedAt: new Date().toISOString(),
      probesDone,
      tablesFound: [...foundTables],
      jobs: jobsForBundle,
      tables: tablesForBundle,
      stringTables,
      unitMeta: DISPLAY_UNITS.map(u => ({
        id: u.id,
        name: u.name,
        stringTable: u.stringTable
      }))
    }
  }

  function downloadJson() {
    triggerDownload(
      'mpx-g2-units-harvest.json',
      JSON.stringify(buildBundle(), null, 2),
      'application/json'
    )
  }

  const canDownload = computed(
    () => tables.value.length > 0 || jobs.value.length > 0 || harvestStatus.value.phase === 'done'
  )

  onBeforeUnmount(() => {
    stop()
  })

  return {
    harvestStatus,
    systemConfig,
    tables,
    jobs,
    canDownload,
    start,
    stop,
    downloadJson
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
