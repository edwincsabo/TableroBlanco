const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { createStore, atomicWrite, digest } = require('./storage.cjs');

function overlaps(a, b) {
  const left = path.resolve(a).toLowerCase(); const right = path.resolve(b).toLowerCase();
  return left === right || left.startsWith(right + path.sep) || right.startsWith(left + path.sep);
}
async function createLibrary(userData, translate = text => text) {
  const defaultRoot = path.join(userData, 'tableros');
  const settingsFile = path.join(userData, 'storage-settings.json');
  const recoveryRoot = path.join(userData, 'recuperacion');
  let root = defaultRoot; let custom = false; let lastBackup = null;
  try {
    const settings = JSON.parse(await fs.readFile(settingsFile, 'utf8'));
    if (settings.version !== 1 || typeof settings.root !== 'string' || !path.isAbsolute(settings.root)) throw new Error('INVALID_SETTINGS');
    root = settings.root; custom = path.resolve(root).toLowerCase() !== path.resolve(defaultRoot).toLowerCase(); lastBackup = settings.lastBackup || null;
  } catch (error) { if (error.code !== 'ENOENT') throw new Error(translate('No se pudo leer la ubicación de los tableros. Se conservaron los datos y la configuración.')); }
  const makeStore = location => createStore(location, { requireExisting: path.resolve(location).toLowerCase() !== path.resolve(defaultRoot).toLowerCase(), recoveryRoot: path.join(recoveryRoot, 'estados', digest(path.resolve(location).toLowerCase()).slice(0, 16)), translate });
  let store = makeStore(root); let tail = Promise.resolve();
  const exclusive = task => { const pending = tail.catch(() => {}).then(task); tail = pending; return pending; };
  const info = () => ({ path: root, defaultPath: defaultRoot, custom, recoveryPath: recoveryRoot, lastBackup });
  async function validateTarget(target) {
    if (!path.isAbsolute(target)) throw new Error(translate('Selecciona una carpeta válida.'));
    const resolved = await fs.realpath(target); const current = await fs.realpath(root).catch(() => path.resolve(root));
    if (resolved.toLowerCase() === current.toLowerCase()) return resolved;
    if (overlaps(resolved, current) || (resolved.toLowerCase() !== path.resolve(defaultRoot).toLowerCase() && overlaps(resolved, await fs.realpath(userData)))) throw new Error(translate('Elige una carpeta separada de la biblioteca actual y de la recuperación local.'));
    if (!(await fs.stat(resolved)).isDirectory()) throw new Error(translate('Selecciona una carpeta válida.'));
    await fs.access(resolved, require('node:fs').constants.R_OK | require('node:fs').constants.W_OK);
    return resolved;
  }
  async function copyVerified(from, to) {
    const bytes = await fs.readFile(from); await atomicWrite(to, bytes.toString('utf8'));
    if (digest(await fs.readFile(to)) !== digest(bytes)) throw new Error(translate('La verificación de la copia falló. La ubicación original se conserva.'));
  }
  async function copyHistory(fromStore, id, destination, destinationId) {
    for (const entry of await fromStore.history(id)) {
      const raw = await fs.readFile(path.join(root, 'historial', id, entry.id));
      const target = path.join(destination, 'historial', destinationId, entry.id);
      let existing = null;
      try { existing = await fs.readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      const finalTarget = existing && digest(existing) !== digest(raw) ? path.join(destination, 'historial', destinationId, `${entry.date}-${randomUUID()}.json`) : target;
      await copyVerified(path.join(root, 'historial', id, entry.id), finalTarget);
    }
  }
  return {
    info,
    idle: () => tail,
    list: () => exclusive(() => store.list()),
    save: board => exclusive(() => store.save(board)),
    remove: (id, revision) => exclusive(() => store.remove(id, revision)),
    history: id => exclusive(() => store.history(id)),
    readHistory: (id, version) => exclusive(() => store.readHistory(id, version)),
    snapshot: board => exclusive(() => store.snapshot(board)),
    signature: () => exclusive(() => store.signature()),
    prepare: target => exclusive(async () => {
      const resolved = await validateTarget(target);
      const source = await store.list(); const destination = await makeStore(resolved).list();
      if (source.errors.length || destination.errors.length) throw new Error(translate('Hay archivos ilegibles. Revisa la biblioteca antes de cambiar de carpeta.'));
      return { path: resolved, sourceCount: source.boards.length, destinationCount: destination.boards.length, unchanged: resolved.toLowerCase() === path.resolve(root).toLowerCase() };
    }),
    change: target => exclusive(async () => {
      const destination = await validateTarget(target);
      if (destination.toLowerCase() === path.resolve(root).toLowerCase()) return { ...info(), copied: 0, conflicts: 0 };
      const sourceSignature = await store.signature(); const source = await store.list();
      const next = makeStore(destination); const existing = await next.list();
      if (source.errors.length || existing.errors.length) throw new Error(translate('Hay archivos ilegibles. Revisa la biblioteca antes de cambiar de carpeta.'));
      const backup = path.join(recoveryRoot, 'migraciones', `${Date.now()}-${randomUUID()}`);
      await fs.mkdir(backup, { recursive: true });
      for (const name of (await fs.readdir(root)).filter(n => !n.startsWith('.') && n.endsWith('.json'))) await copyVerified(path.join(root, name), path.join(backup, name));
      for (const board of source.boards) await copyHistory(store, board.id, backup, board.id);
      await atomicWrite(path.join(backup, 'origen.txt'), root);
      let copied = 0; let conflicts = 0; const expectedRevisions = new Map();
      const known = new Map(existing.boards.map(board => [board.id, board]));
      for (const board of source.boards) {
        const other = known.get(board.id); let saved;
        if (other?.storageRevision === board.storageRevision) saved = other;
        else {
          const result = await next.save({ ...board, storageRevision: undefined });
          saved = result.board; copied++; if (result.conflict) conflicts++;
        }
        expectedRevisions.set(saved.id, saved.storageRevision);
        await copyHistory(store, board.id, destination, saved.id);
      }
      if (sourceSignature !== await store.signature()) throw new Error(translate('La biblioteca cambió durante la copia. La ubicación original sigue activa; vuelve a intentarlo.'));
      const verified = await next.list();
      if (verified.errors.length || [...expectedRevisions].some(([id, revision]) => verified.boards.find(board => board.id === id)?.storageRevision !== revision)) throw new Error(translate('La verificación de la copia falló. La ubicación original se conserva.'));
      await atomicWrite(settingsFile, { version: 1, root: destination, lastBackup: backup });
      root = destination; custom = path.resolve(root).toLowerCase() !== path.resolve(defaultRoot).toLowerCase();
      store = next; lastBackup = backup;
      return { ...info(), copied, conflicts };
    })
  };
}
module.exports = { createLibrary, overlaps };
