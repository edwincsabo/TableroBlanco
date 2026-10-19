const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID, createHash } = require('node:crypto');

const digest = data => createHash('sha256').update(data).digest('hex');
const diskBoard = board => { const { storageRevision, ...data } = board; return data; };
function validateBoard(board) {
  if (!board || typeof board !== 'object' || !/^[a-zA-Z0-9-]{1,100}$/.test(board.id || '')) throw new Error('Identificador de tablero inválido.');
  if (typeof board.name !== 'string' || !board.name.trim() || board.name.length > 200) throw new Error('Nombre de tablero inválido.');
  if (!board.scene || !Array.isArray(board.scene.elements) || typeof board.scene.files !== 'object' || board.scene.files === null) throw new Error('El archivo no contiene un tablero válido.');
  return board;
}
async function readOptional(target) {
  try { return await fs.readFile(target, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}
async function atomicWrite(target, data, beforeCommit) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  const temp = `${target}.${randomUUID()}.tmp`;
  try {
    const handle = await fs.open(temp, 'wx');
    try { await handle.writeFile(typeof data === 'string' ? data : JSON.stringify(data), 'utf8'); await handle.sync(); }
    finally { await handle.close(); }
    for (let attempt = 0; ; attempt++) {
      if (beforeCommit) await beforeCommit();
      try { await fs.rename(temp, target); break; }
      catch (error) {
        if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 9) throw error;
        await new Promise(resolve => setTimeout(resolve, 30 * (attempt + 1)));
      }
    }
  } finally { await fs.rm(temp, { force: true }).catch(() => {}); }
}
function createStore(root, { recoveryRoot, translate = text => text, requireExisting = false } = {}) {
  const queue = new Map(); const locations = new Map();
  const validateId = id => { if (!/^[a-zA-Z0-9-]{1,100}$/.test(id || '')) throw new Error('Identificador inválido.'); };
  const boardPath = id => { validateId(id); return path.join(root, locations.get(id) || `${id}.json`); };
  const ensureRoot = async () => {
    if (requireExisting) { if (!(await fs.stat(root)).isDirectory()) throw new Error(translate('La carpeta de tableros no está disponible.')); }
    else await fs.mkdir(root, { recursive: true });
  };
  async function recover(board) {
    if (!recoveryRoot) return;
    const target = path.join(recoveryRoot, `${board.id}.json`);
    const previous = await readOptional(target);
    if (previous) await atomicWrite(path.join(recoveryRoot, `${board.id}.previous.json`), previous);
    await atomicWrite(target, diskBoard(board));
  }
  async function signature() {
    await ensureRoot();
    const names = (await fs.readdir(root)).filter(n => !n.startsWith('.') && n.endsWith('.json')).sort();
    const info = await Promise.all(names.map(async name => {
      try { const stat = await fs.stat(path.join(root, name)); return [name, stat.size, stat.mtimeMs, stat.ctimeMs]; }
      catch (error) { if (error.code === 'ENOENT') return [name, 'pending']; throw error; }
    }));
    return digest(JSON.stringify(info));
  }
  const store = {
    signature,
    async list() {
      await ensureRoot();
      const names = (await fs.readdir(root)).filter(n => !n.startsWith('.') && n.endsWith('.json'));
      const boards = []; const errors = [];
      for (const name of names) {
        try {
          const raw = await fs.readFile(path.join(root, name), 'utf8');
          const board = validateBoard(JSON.parse(raw));
          // A provider's conflict copy may carry the same embedded ID.
          if (name !== `${board.id}.json`) board.id = `sync-${digest(name).slice(0, 32)}`;
          locations.set(board.id, name);
          boards.push({ ...board, storageRevision: digest(raw) });
        } catch { errors.push(name); }
      }
      return { boards, errors };
    },
    async save(board) {
      validateBoard(board);
      const previous = queue.get(board.id) || Promise.resolve();
      const pending = previous.catch(() => {}).then(async () => {
        // Protect the submitted state even if the sync folder is unavailable.
        await recover(board); await ensureRoot();
        const target = boardPath(board.id); const raw = await readOptional(target);
        const expected = board.storageRevision || null;
        const actual = raw === null ? null : digest(raw);
        const conflict = () => Object.assign(new Error('STORAGE_CONFLICT'), { code: 'STORAGE_CONFLICT' });
        try {
          if (expected !== actual) throw conflict();
          const saved = diskBoard(board);
          const old = raw === null ? null : validateBoard(JSON.parse(raw));
          if (old && !board.deleted && Date.now() - (old.snapshotAt || 0) > 300000) {
            const historyDir = path.join(root, 'historial', board.id);
            await atomicWrite(path.join(historyDir, `${Date.now()}-${randomUUID()}.json`), old);
            const snapshots = (await fs.readdir(historyDir)).filter(n => n.endsWith('.json')).sort().reverse();
            for (const extra of snapshots.slice(20)) await fs.rm(path.join(historyDir, extra));
            saved.snapshotAt = Date.now();
          } else if (old) saved.snapshotAt = old.snapshotAt;
          const content = JSON.stringify(saved);
          await atomicWrite(target, content, async () => {
            const current = await readOptional(target);
            if ((current === null ? null : digest(current)) !== actual) throw conflict();
          });
          return { board: { ...saved, storageRevision: digest(content) }, conflict: false };
        } catch (error) {
          if (error.code !== 'STORAGE_CONFLICT') throw error;
          const copy = { ...diskBoard(board), id: randomUUID(), name: `${board.name.slice(0, 165)} — ${translate('copia por conflicto')}`, updated: Date.now(), deleted: false };
          delete copy.snapshotAt;
          await recover(copy);
          const content = JSON.stringify(copy);
          await atomicWrite(path.join(root, `${copy.id}.json`), content);
          return { board: { ...copy, storageRevision: digest(content) }, conflict: true };
        }
      });
      queue.set(board.id, pending);
      try { return await pending; } finally { if (queue.get(board.id) === pending) queue.delete(board.id); }
    },
    async remove(id, expectedRevision) {
      validateId(id); await (queue.get(id) || Promise.resolve()).catch(() => {}); await ensureRoot();
      const target = boardPath(id); const current = await readOptional(target);
      if (current === null) return;
      if (!expectedRevision || digest(current) !== expectedRevision) throw new Error(translate('El tablero cambió en la carpeta. Actualiza la biblioteca antes de eliminarlo.'));
      await recover(validateBoard(JSON.parse(current)));
      await fs.rm(target, { force: true });
      const historyRoot = path.resolve(root, 'historial'); const historyPath = path.resolve(historyRoot, id);
      if (!historyPath.startsWith(historyRoot + path.sep)) throw new Error('Ruta de historial inválida.');
      await fs.rm(historyPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    },
    async history(id) {
      validateId(id);
      try { return (await fs.readdir(path.join(root, 'historial', id))).filter(n => /^\d+(?:-[a-f0-9-]+)?\.json$/.test(n)).sort().reverse().map(n => ({ id: n, date: Number(n.split(/[.-]/)[0]) })); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
    async readHistory(id, version) {
      validateId(id);
      if (!/^\d+(?:-[a-f0-9-]+)?\.json$/.test(version)) throw new Error('Versión inválida.');
      return validateBoard(JSON.parse(await fs.readFile(path.join(root, 'historial', id, version), 'utf8')));
    },
    async snapshot(board) {
      validateBoard(board); await ensureRoot();
      await atomicWrite(path.join(root, 'historial', board.id, `${Date.now()}-${randomUUID()}.json`), diskBoard(board));
    }
  };
  return store;
}
module.exports = { createStore, validateBoard, atomicWrite, digest, diskBoard };
