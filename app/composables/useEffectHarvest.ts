import { HandshakeCommand, SysExMessageType } from '#shared/types/midi'
import {
  buildEffectDraftsFromHarvest,
  harvestDraftsToBundle,
  harvestDraftToMarkdown,
  type HarvestEffectDraft,
  type HarvestTreeNode
} from '#shared/midi/effect-harvest'
import {
  parseObjectDescriptionPayload,
  parseObjectTypeIdPayload,
  type ObjectDescription
} from '#shared/midi/object-description'
import { parseSystemConfigPayload, type SystemConfiguration } from '#shared/midi/system-config'
import {
  buildObjectDescriptionRequest,
  buildObjectTypeIdRequest,
  buildSystemConfigRequest
} from '#shared/midi/requests'
import { EFFECT_TYPE_BY_BLOCK } from '#shared/midi/control-paths'
import { buildHandshakeMessage, parseMpxG2SysEx } from '#shared/midi/sysex'

export type EffectHarvestPhase
  = | 'idle'
    | 'system-config'
    | 'descriptions'
    | 'control-tree'
    | 'program-walk'
    | 'folding'
    | 'done'
    | 'error'

export type EffectHarvestStatus = {
  phase: EffectHarvestPhase
  note: string
  objectTypeCount: number
  descriptionsLoaded: number
  treeNodes: number
  effectCount: number
  waitingForReady: boolean
  error: string | null
}

const DESC_STAGGER_MS = 80
/** Skip / retry if an Object Description never arrives (prevents 3/717 stalls). */
const DESC_REPLY_MS = 2500
/** If BUSY never followed by READY, force-continue. */
const BUSY_WATCHDOG_MS = 4000
/** Wait after last Object Description before walking Program paths. */
const POST_DESC_SETTLE_MS = 800
/**
 * Optional TransmitControlTree probe. The G2 often never streams OTIDs with paths
 * over Web MIDI; we fall back to a Program-branch walk quickly.
 */
const TREE_FIRST_NODE_MS = 4000
/** Idle gap after the latest tree OTID that means the dump is finished. */
const TREE_IDLE_MS = 3500
const WALK_STAGGER_MS = 45
/** Match effect-param-sync patience — G2 OTID replies can be slow after a full OD sweep. */
const WALK_REPLY_MS = 2000
const WALK_MAX_ALG = 48
const WALK_MAX_PARAM = 48

/**
 * One-shot G2 harvester: System Config → Object Descriptions → Transmit control tree
 * (with Program-branch walk fallback) → draft Content markdown / JSON.
 */
export function useEffectHarvest() {
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

  const harvestStatus = ref<EffectHarvestStatus>({
    phase: 'idle',
    note: 'Idle',
    objectTypeCount: 0,
    descriptionsLoaded: 0,
    treeNodes: 0,
    effectCount: 0,
    waitingForReady: false,
    error: null
  })

  const drafts = ref<HarvestEffectDraft[]>([])
  const systemConfig = ref<SystemConfiguration | null>(null)
  /** Reactive counters so Download stays enabled after a sparse harvest. */
  const rawDescriptionCount = ref(0)
  const rawTreeNodeCount = ref(0)

  let descriptions = new Map<number, ObjectDescription>()
  let treeNodes: HarvestTreeNode[] = []
  let descQueue: number[] = []
  let descTimer: ReturnType<typeof setTimeout> | null = null
  let descReplyTimer: ReturnType<typeof setTimeout> | null = null
  let busyTimer: ReturnType<typeof setTimeout> | null = null
  let settleTimer: ReturnType<typeof setTimeout> | null = null
  let treeFirstTimer: ReturnType<typeof setTimeout> | null = null
  let treeIdleTimer: ReturnType<typeof setTimeout> | null = null
  let walkTimer: ReturnType<typeof setTimeout> | null = null
  let walkReplyTimer: ReturnType<typeof setTimeout> | null = null
  let active = false
  let walkQueue: number[][] = []
  let walkPendingPath: number[] | null = null
  let walkMisses = 0
  let pendingDescId: number | null = null

  function setStatus(partial: Partial<EffectHarvestStatus>) {
    harvestStatus.value = { ...harvestStatus.value, ...partial }
  }

  function clearTimers() {
    if (descTimer) {
      clearTimeout(descTimer)
      descTimer = null
    }
    if (descReplyTimer) {
      clearTimeout(descReplyTimer)
      descReplyTimer = null
    }
    if (busyTimer) {
      clearTimeout(busyTimer)
      busyTimer = null
    }
    if (settleTimer) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
    if (treeFirstTimer) {
      clearTimeout(treeFirstTimer)
      treeFirstTimer = null
    }
    if (treeIdleTimer) {
      clearTimeout(treeIdleTimer)
      treeIdleTimer = null
    }
    if (walkTimer) {
      clearTimeout(walkTimer)
      walkTimer = null
    }
    if (walkReplyTimer) {
      clearTimeout(walkReplyTimer)
      walkReplyTimer = null
    }
  }

  function clearTreeTimers() {
    if (treeFirstTimer) {
      clearTimeout(treeFirstTimer)
      treeFirstTimer = null
    }
    if (treeIdleTimer) {
      clearTimeout(treeIdleTimer)
      treeIdleTimer = null
    }
  }

  function pathsEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index])
  }

  function bumpTreeIdle() {
    if (treeIdleTimer) {
      clearTimeout(treeIdleTimer)
    }
    treeIdleTimer = setTimeout(() => {
      if (harvestStatus.value.phase === 'control-tree' && treeNodes.length > 0) {
        finishFold('Control tree dump idle')
      }
    }, TREE_IDLE_MS)
  }

  function armTreeFirstNodeTimeout() {
    if (treeFirstTimer) {
      clearTimeout(treeFirstTimer)
    }
    treeFirstTimer = setTimeout(() => {
      if (harvestStatus.value.phase !== 'control-tree') {
        return
      }
      if (treeNodes.length === 0) {
        console.warn(
          '[mpx-g2 harvest] No control-tree OTIDs received — falling back to Program-branch walk'
        )
        startProgramWalk()
      }
    }, TREE_FIRST_NODE_MS)
  }

  function requestNextDescription() {
    if (!active || harvestStatus.value.waitingForReady) {
      return
    }
    const next = descQueue[0]
    if (next == null) {
      pendingDescId = null
      if (descReplyTimer) {
        clearTimeout(descReplyTimer)
        descReplyTimer = null
      }
      scheduleControlTreeDump()
      return
    }
    pendingDescId = next
    const opts = getSysexOptions()
    sendSysEx(
      buildObjectDescriptionRequest(next, opts.deviceId, opts.productId),
      `Harvest Object Description ${next}`
    )
    setStatus({
      phase: 'descriptions',
      note: `Requesting Object Description ${next} / ${harvestStatus.value.objectTypeCount - 1}`
    })
    if (descReplyTimer) {
      clearTimeout(descReplyTimer)
    }
    descReplyTimer = setTimeout(() => {
      descReplyTimer = null
      if (!active || harvestStatus.value.phase !== 'descriptions') {
        return
      }
      if (pendingDescId !== next) {
        return
      }
      console.warn(`[mpx-g2 harvest] OD timeout for type ${next} — skipping`)
      descQueue = descQueue.filter(id => id !== next)
      pendingDescId = null
      scheduleNextDescription()
    }, DESC_REPLY_MS)
  }

  function scheduleNextDescription() {
    if (descTimer) {
      clearTimeout(descTimer)
    }
    descTimer = setTimeout(() => {
      descTimer = null
      requestNextDescription()
    }, DESC_STAGGER_MS)
  }

  function scheduleControlTreeDump() {
    // TransmitControlTree has not produced path-bearing OTIDs over Web MIDI on
    // this unit; go straight to the request/response Program-branch walk.
    setStatus({
      phase: 'program-walk',
      note: `Descriptions done — settling ${POST_DESC_SETTLE_MS}ms before Program walk…`,
      descriptionsLoaded: descriptions.size
    })
    if (settleTimer) {
      clearTimeout(settleTimer)
    }
    settleTimer = setTimeout(() => {
      settleTimer = null
      startProgramWalk()
    }, POST_DESC_SETTLE_MS)
  }

  function startControlTreeDump() {
    if (!active) {
      return
    }
    setStatus({
      phase: 'control-tree',
      note: 'Requesting control tree dump (handshake 8)…',
      descriptionsLoaded: descriptions.size
    })
    treeNodes = []
    const opts = getSysexOptions()
    sendSysEx(
      buildHandshakeMessage(HandshakeCommand.TransmitControlTree, opts),
      'TransmitControlTree'
    )
    armTreeFirstNodeTimeout()
  }

  function enqueueWalkChildren(path: number[], objectTypeId: number) {
    // Program → effectType (len 2) → alg (len 3) → param (len 4).
    // Effect-type nodes are usually the alg-select leaf (max = highest alg index).
    // Alg branch nodes use max = highest param index (e.g. Screamer max=5 → params 0..5).
    const maxFromDesc = descriptions.get(objectTypeId)?.limits[0]?.max
    if (path.length === 2) {
      const maxAlg = Math.min(maxFromDesc ?? WALK_MAX_ALG, WALK_MAX_ALG)
      for (let alg = 1; alg <= maxAlg; alg++) {
        walkQueue.push([...path, alg])
      }
      return
    }
    if (path.length === 3) {
      const maxParam = Math.min(maxFromDesc ?? WALK_MAX_PARAM, WALK_MAX_PARAM)
      for (let param = 0; param <= maxParam; param++) {
        walkQueue.push([...path, param])
      }
    }
  }

  function startProgramWalk() {
    clearTreeTimers()
    walkQueue = []
    walkPendingPath = null
    walkMisses = 0
    treeNodes = []
    rawTreeNodeCount.value = 0

    for (const effectType of Object.values(EFFECT_TYPE_BY_BLOCK)) {
      // Seed: program → effect type (expand into algs on hit).
      walkQueue.push([0, effectType])
    }

    setStatus({
      phase: 'program-walk',
      note: `Walking Program effect branches (${walkQueue.length} seeds)…`,
      treeNodes: 0
    })
    scheduleWalkNext()
  }

  function scheduleWalkNext() {
    if (walkTimer) {
      clearTimeout(walkTimer)
    }
    walkTimer = setTimeout(() => {
      walkTimer = null
      requestWalkNext()
    }, WALK_STAGGER_MS)
  }

  function requestWalkNext() {
    if (!active || harvestStatus.value.phase !== 'program-walk') {
      return
    }
    if (harvestStatus.value.waitingForReady) {
      return
    }
    if (walkPendingPath) {
      return
    }

    const next = walkQueue.shift()
    if (!next) {
      finishFold('Program-branch walk complete')
      return
    }

    walkPendingPath = next
    walkMisses = 0
    const opts = getSysexOptions()
    sendSysEx(
      buildObjectTypeIdRequest(next, opts.deviceId, opts.productId),
      `Harvest OTID ${next.join('.')}`
    )
    setStatus({
      note: `Walk OTID [${next.join(', ')}] — queue ${walkQueue.length}, nodes ${treeNodes.length}`
    })

    if (walkReplyTimer) {
      clearTimeout(walkReplyTimer)
    }
    walkReplyTimer = setTimeout(() => {
      walkReplyTimer = null
      onWalkMiss()
    }, WALK_REPLY_MS)
  }

  function onWalkMiss() {
    if (!walkPendingPath || harvestStatus.value.phase !== 'program-walk') {
      return
    }
    const missed = walkPendingPath
    walkPendingPath = null
    walkMisses += 1

    // Only truncate alg/param sibling runs — never wipe other effect-type seeds.
    if (missed.length >= 3) {
      const parent = missed.slice(0, -1)
      const missedIndex = missed[missed.length - 1]!
      walkQueue = walkQueue.filter((path) => {
        if (path.length !== missed.length) {
          return true
        }
        if (!pathsEqual(path.slice(0, -1), parent)) {
          return true
        }
        return (path[path.length - 1] ?? 0) < missedIndex
      })
    }

    scheduleWalkNext()
  }

  /**
   * Attribute an OTID reply to the in-flight walk request.
   * G2 request replies usually omit control levels (same as gain/chorus sync) —
   * only TransmitControlTree includes paths. Never require levels on walk hits.
   */
  function onWalkHit(objectTypeId: number, levels: number[] | null) {
    if (!walkPendingPath) {
      return
    }
    if (levels?.length && !pathsEqual(levels, walkPendingPath)) {
      // Unrelated OTID with a different path — ignore.
      return
    }

    if (walkReplyTimer) {
      clearTimeout(walkReplyTimer)
      walkReplyTimer = null
    }

    const path = [...walkPendingPath]
    walkPendingPath = null
    walkMisses = 0
    const node: HarvestTreeNode = { objectTypeId, levels: path }
    treeNodes.push(node)
    rawTreeNodeCount.value = treeNodes.length
    const name = descriptions.get(objectTypeId)?.name?.trim() || `type ${objectTypeId}`
    setStatus({
      treeNodes: treeNodes.length,
      note: `Walk [${path.join(', ')}] → ${name} — queue ${walkQueue.length}`
    })

    if (path[0] === 0 && path.length >= 2 && path.length < 4) {
      enqueueWalkChildren(path, objectTypeId)
    }

    scheduleWalkNext()
  }

  function finishFold(reason: string) {
    clearTreeTimers()
    if (walkReplyTimer) {
      clearTimeout(walkReplyTimer)
      walkReplyTimer = null
    }
    setStatus({ phase: 'folding', note: `Folding… (${reason})` })
    const nextDrafts = buildEffectDraftsFromHarvest(treeNodes, descriptions)
    drafts.value = nextDrafts
    setStatus({
      phase: 'done',
      note: nextDrafts.length > 0
        ? `Harvest complete — ${nextDrafts.length} effect draft(s), ${treeNodes.length} tree nodes`
        : `Harvest finished with 0 drafts (${treeNodes.length} tree nodes, ${descriptions.size} descriptions). Download raw JSON to inspect.`,
      treeNodes: treeNodes.length,
      effectCount: nextDrafts.length
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
        if (busyTimer) {
          clearTimeout(busyTimer)
        }
        busyTimer = setTimeout(() => {
          busyTimer = null
          if (!active || !harvestStatus.value.waitingForReady) {
            return
          }
          console.warn('[mpx-g2 harvest] BUSY watchdog — forcing continue')
          setStatus({ waitingForReady: false, note: 'BUSY timed out — continuing…' })
          if (harvestStatus.value.phase === 'descriptions') {
            scheduleNextDescription()
          } else if (harvestStatus.value.phase === 'control-tree' && treeNodes.length > 0) {
            bumpTreeIdle()
          } else if (harvestStatus.value.phase === 'program-walk') {
            scheduleWalkNext()
          }
        }, BUSY_WATCHDOG_MS)
        return
      }
      if (command === HandshakeCommand.Ready) {
        if (busyTimer) {
          clearTimeout(busyTimer)
          busyTimer = null
        }
        setStatus({ waitingForReady: false, note: 'G2 READY — continuing…' })
        if (harvestStatus.value.phase === 'descriptions') {
          scheduleNextDescription()
        } else if (harvestStatus.value.phase === 'control-tree' && treeNodes.length > 0) {
          bumpTreeIdle()
        } else if (harvestStatus.value.phase === 'program-walk') {
          scheduleWalkNext()
        }
        return
      }
      if (command === HandshakeCommand.Error && harvestStatus.value.phase === 'program-walk') {
        onWalkMiss()
        return
      }
    }

    if (parsed.messageType === SysExMessageType.SystemConfiguration) {
      const config = parseSystemConfigPayload(parsed.payload)
      if (!config || config.objectTypeCount <= 0) {
        setStatus({
          phase: 'error',
          error: 'System Configuration missing object type count',
          note: 'Failed'
        })
        stop(false)
        return
      }
      systemConfig.value = config
      descriptions = new Map()
      descQueue = Array.from({ length: config.objectTypeCount }, (_, i) => i)
      setStatus({
        phase: 'descriptions',
        objectTypeCount: config.objectTypeCount,
        note: `System Config OK — ${config.objectTypeCount} object types (v${config.majorVersion}.${config.minorVersion})`
      })
      scheduleNextDescription()
      return
    }

    if (parsed.messageType === SysExMessageType.ObjectDescription) {
      const description = parseObjectDescriptionPayload(parsed.payload)
      if (!description) {
        // Unparseable reply for the pending id — skip so we do not stall forever.
        if (pendingDescId != null) {
          console.warn(`[mpx-g2 harvest] OD parse failed for type ${pendingDescId} — skipping`)
          descQueue = descQueue.filter(id => id !== pendingDescId)
          pendingDescId = null
          if (descReplyTimer) {
            clearTimeout(descReplyTimer)
            descReplyTimer = null
          }
          if (!harvestStatus.value.waitingForReady) {
            scheduleNextDescription()
          }
        }
        return
      }
      descriptions.set(description.objectTypeId, description)
      rawDescriptionCount.value = descriptions.size
      descQueue = descQueue.filter(id => id !== description.objectTypeId)
      if (pendingDescId === description.objectTypeId) {
        pendingDescId = null
      }
      if (descReplyTimer) {
        clearTimeout(descReplyTimer)
        descReplyTimer = null
      }
      setStatus({
        descriptionsLoaded: descriptions.size,
        note: `Descriptions ${descriptions.size} / ${harvestStatus.value.objectTypeCount}`
      })
      if (!harvestStatus.value.waitingForReady) {
        scheduleNextDescription()
      }
      return
    }

    if (parsed.messageType === SysExMessageType.ObjectTypeId) {
      const otid = parseObjectTypeIdPayload(parsed.payload)
      if (!otid) {
        return
      }

      if (harvestStatus.value.phase === 'program-walk') {
        // Path is optional on request replies — attribute to the pending probe.
        onWalkHit(otid.objectTypeId, otid.levels)
        return
      }

      if (harvestStatus.value.phase === 'control-tree') {
        if (!otid.levels?.length) {
          // Dump is supposed to include paths; skip bare IDs.
          return
        }
        const node = { objectTypeId: otid.objectTypeId, levels: otid.levels }
        const wasEmpty = treeNodes.length === 0
        treeNodes.push(node)
        rawTreeNodeCount.value = treeNodes.length
        setStatus({
          treeNodes: treeNodes.length,
          note: `Control tree nodes: ${treeNodes.length}`
        })
        if (wasEmpty && treeFirstTimer) {
          clearTimeout(treeFirstTimer)
          treeFirstTimer = null
        }
        bumpTreeIdle()
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
        error: 'Harvest requires hardware MIDI — the simulator has no control tree.',
        note: 'Wrong mode'
      })
      return
    }

    stop(false)
    active = true
    drafts.value = []
    systemConfig.value = null
    descriptions = new Map()
    treeNodes = []
    rawDescriptionCount.value = 0
    rawTreeNodeCount.value = 0
    descQueue = []
    walkQueue = []
    walkPendingPath = null
    setStatus({
      phase: 'system-config',
      note: 'Quieting MIDI bus, then requesting System Configuration…',
      objectTypeCount: 0,
      descriptionsLoaded: 0,
      treeNodes: 0,
      effectCount: 0,
      waitingForReady: false,
      error: null
    })

    setHarvestHandler(handleInbound)
    beginHarvestQuiet()
    const opts = getSysexOptions()
    // Brief pause so Auto Display / panel poll traffic drains before we start.
    settleTimer = setTimeout(() => {
      settleTimer = null
      if (!active) {
        return
      }
      sendSysEx(buildSystemConfigRequest(opts.deviceId, opts.productId), 'Harvest System Config')
    }, 300)
  }

  function stop(resetStatus = true) {
    active = false
    clearTimers()
    clearHarvestHandler()
    endHarvestQuiet()
    walkPendingPath = null
    walkQueue = []
    if (resetStatus && harvestStatus.value.phase !== 'done') {
      setStatus({
        phase: 'idle',
        note: 'Idle',
        waitingForReady: false
      })
    }
  }

  function downloadJson() {
    const bundle = {
      ...harvestDraftsToBundle(drafts.value),
      systemConfig: systemConfig.value,
      treeNodeCount: treeNodes.length,
      treeNodesSample: treeNodes.slice(0, 40),
      treeNodes,
      descriptions: [...descriptions.values()].map(d => ({
        objectTypeId: d.objectTypeId,
        name: d.name,
        byteCount: d.byteCount,
        controlFlags: d.controlFlags,
        limits: d.limits
      }))
    }
    triggerDownload(
      'mpx-g2-effect-harvest.json',
      JSON.stringify(bundle, null, 2),
      'application/json'
    )
  }

  function downloadMarkdownZipListing() {
    const parts = drafts.value.map((draft) => {
      return [
        `<!-- FILE: content/effects/${draft.slug}.md -->`,
        harvestDraftToMarkdown(draft),
        ''
      ].join('\n')
    })
    triggerDownload(
      'mpx-g2-effect-drafts.md',
      parts.join('\n'),
      'text/markdown'
    )
  }

  const canDownloadRaw = computed(
    () => rawDescriptionCount.value > 0
      || rawTreeNodeCount.value > 0
      || drafts.value.length > 0
  )

  onBeforeUnmount(() => {
    stop()
  })

  return {
    harvestStatus,
    drafts,
    systemConfig,
    canDownloadRaw,
    start,
    stop,
    downloadJson,
    downloadMarkdownZipListing
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
