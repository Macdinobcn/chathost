#!/usr/bin/env node
// backup.js — Backup completo ChatHost.ai
// Copia TODO el proyecto excepto node_modules y .next (son regenerables)
// Parar: Ctrl+C

const { execSync } = require('child_process')
const fs     = require('fs')
const path   = require('path')
const crypto = require('crypto')

// ── Config ────────────────────────────────────────────────────────────────────

const PROJECT_ROOT = 'C:\\Users\\anera\\Desktop\\ChatHost.ai'

const BACKUP_DIRS = [
  'D:\\chat-arandai\\zBackup',
  'F:\\chat-arandai\\zBackup',
  'C:\\Users\\anera\\OneDrive\\2026\\zBackup chat-arandai',
]

const INTERVAL_MS = 20 * 60 * 1000
const MAX_BACKUPS = 20

// Carpetas a EXCLUIR (regenerables o basura)
const EXCLUDE = [
  'node_modules',
  '.next',
  '.git',
  'backups',
]

// ── Hash de cambios ───────────────────────────────────────────────────────────

function computeProjectHash() {
  const hash = crypto.createHash('md5')

  function hashPath(p) {
    if (!fs.existsSync(p)) return
    const name = path.basename(p)
    if (EXCLUDE.includes(name)) return

    const stat = fs.statSync(p)
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(p).sort()
      entries.forEach(e => hashPath(path.join(p, e)))
    } else {
      try {
        hash.update(p)
        hash.update(fs.readFileSync(p))
      } catch {}
    }
  }

  hashPath(PROJECT_ROOT)
  return hash.digest('hex')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTimestamp() {
  return new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19)
}

function log(msg) {
  const time = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  console.log(`[${time}] ${msg}`)
}

function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    return true
  } catch (err) {
    log(`⚠️  No se pudo crear ${dir}: ${err.message}`)
    return false
  }
}

function cleanOldBackups(dir) {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.startsWith('chathost_ai_backup_') && f.endsWith('.zip'))
      .sort()
    if (files.length > MAX_BACKUPS) {
      files.slice(0, files.length - MAX_BACKUPS).forEach(f => {
        fs.unlinkSync(path.join(dir, f))
        log(`🗑️  Eliminado: ${f}`)
      })
    }
  } catch {}
}

function backupToDir(destDir, timestamp) {
  const zipPath = path.join(destDir, `chathost_ai_backup_${timestamp}.zip`)

  try {
    const tmpDir = path.join(require('os').tmpdir(), `chathost_ai_tmp_${timestamp}`)
    const projName = path.basename(PROJECT_ROOT)
    const tmpProj  = path.join(tmpDir, projName)

    fs.mkdirSync(tmpDir, { recursive: true })

    const robocopy = `robocopy "${PROJECT_ROOT}" "${tmpProj}" /E /XD ${EXCLUDE.map(e => `"${e}"`).join(' ')} /NFL /NDL /NJH /NJS /nc /ns /np`
    try {
      execSync(robocopy, { stdio: 'pipe' })
    } catch (e) {
      // robocopy devuelve exit code > 0 aunque tenga éxito, ignorar
    }

    const cmd = `powershell -Command "Compress-Archive -Path '${tmpProj}' -DestinationPath '${zipPath}' -Force"`
    execSync(cmd, { stdio: 'pipe', timeout: 300000 })

    execSync(`rmdir /s /q "${tmpDir}"`, { stdio: 'pipe' })

    const sizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(1)
    log(`✅ ${destDir} → chathost_ai_backup_${timestamp}.zip (${sizeMB} MB)`)
    cleanOldBackups(destDir)
    return true

  } catch (err) {
    log(`❌ Error en ${destDir}: ${err.message}`)
    return false
  }
}

// ── Lógica principal ──────────────────────────────────────────────────────────

let lastHash = null

function check() {
  const currentHash = computeProjectHash()

  if (currentHash === lastHash) {
    log('⏸  Sin cambios — backup omitido')
    const next = new Date(Date.now() + INTERVAL_MS)
    log(`⏳ Próxima comprobación: ${next.toLocaleTimeString('es')}`)
    return
  }

  const timestamp = getTimestamp()
  log('─────────────────────────────────────────')
  log(`🔄 Cambios detectados — iniciando backup completo`)
  log(`📦 Comprimiendo proyecto (sin node_modules ni .next)...`)

  let ok = 0
  for (const dir of BACKUP_DIRS) {
    if (ensureDir(dir) && backupToDir(dir, timestamp)) ok++
  }

  if (ok > 0) {
    lastHash = currentHash
    log(`✅ Backup completado — ${ok}/${BACKUP_DIRS.length} destinos`)
  } else {
    log(`❌ Backup fallido — se reintentará en el próximo ciclo`)
  }

  const next = new Date(Date.now() + INTERVAL_MS)
  log(`⏳ Próxima comprobación: ${next.toLocaleTimeString('es')}`)
}

// ── Arranque ──────────────────────────────────────────────────────────────────

log('🚀 Backup ChatHost.ai arrancado')
log(`⏱️  Comprueba cambios cada 20 minutos`)
log(`📁 Destino 1: ${BACKUP_DIRS[0]}`)
log(`📁 Destino 2: ${BACKUP_DIRS[1]}`)
log(`📁 Destino 3: ${BACKUP_DIRS[2]}`)
log(`🚫 Excluye: ${EXCLUDE.join(', ')}`)
log(`📦 Máximo ${MAX_BACKUPS} backups por carpeta`)
log('─────────────────────────────────────────')

check()
setInterval(check, INTERVAL_MS)

process.on('SIGINT', () => {
  log('👋 Backup detenido')
  process.exit(0)
})
