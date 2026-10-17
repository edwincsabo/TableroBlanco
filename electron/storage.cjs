const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

function validateBoard(board) {
  if (!board || typeof board !== 'object' || !/^[a-zA-Z0-9-]{1,100}$/.test(board.id || '')) throw new Error('Identificador de tablero inválido.');
  if (typeof board.name !== 'string' || !board.name.trim() || board.name.length > 200) throw new Error('Nombre de tablero inválido.');
  if (!board.scene || !Array.isArray(board.scene.elements) || typeof board.scene.files !== 'object' || board.scene.files === null) throw new Error('El archivo no contiene un tablero válido.');
  return board;
}
function createStore(root) {
  const queue = new Map();
  const boardPath = id => {
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(id || '')) throw new Error('Identificador inválido.');
    return path.join(root, `${id}.json`);
  };
  async function atomicWrite(target, data) {
    await fs.mkdir(path.dirname(target), { recursive: true });
    const temp = `${target}.${randomUUID()}.tmp`;
    try {
      const handle = await fs.open(temp, 'w');
      try { await handle.writeFile(JSON.stringify(data), 'utf8'); await handle.sync(); }
      finally { await handle.close(); }
      for (let attempt = 0; ; attempt++) {
        try { await fs.rename(temp, target); break; }
        catch (error) {
          if (!['EPERM', 'EACCES', 'EBUSY'].includes(error.code) || attempt >= 9) throw error;
          await new Promise(resolve => setTimeout(resolve, 30 * (attempt + 1)));
        }
      }
    }
    finally { await fs.rm(temp, { force: true }).catch(() => {}); }
  }
  return {
    async list() {
      await fs.mkdir(root, { recursive: true });
      const names = (await fs.readdir(root)).filter(n => n.endsWith('.json'));
      const boards = []; const errors = [];
      for (const name of names) {
        try { boards.push(validateBoard(JSON.parse(await fs.readFile(path.join(root, name), 'utf8')))); }
        catch { errors.push(name); }
      }
      return { boards, errors };
    },
    async save(board) {
      validateBoard(board);
      const target = boardPath(board.id);
      const previous = queue.get(board.id) || Promise.resolve();
      const pending = previous.catch(() => {}).then(async () => {
        let old;
        try { old = JSON.parse(await fs.readFile(target, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
        if (old && !board.deleted && (Date.now() - (old.snapshotAt || 0) > 300000)) {
          const historyDir = path.join(root, 'historial', board.id);
          await atomicWrite(path.join(historyDir, `${Date.now()}.json`), old);
          const snapshots = (await fs.readdir(historyDir)).filter(n => n.endsWith('.json')).sort().reverse();
          for (const extra of snapshots.slice(20)) await fs.rm(path.join(historyDir, extra));
          board.snapshotAt = Date.now();
        } else if (old) board.snapshotAt = old.snapshotAt;
        await atomicWrite(target, board);
        return true;
      });
      queue.set(board.id, pending);
      try { return await pending; } finally { if (queue.get(board.id) === pending) queue.delete(board.id); }
    },
    async remove(id) {
      await (queue.get(id) || Promise.resolve()).catch(() => {});
      await fs.rm(boardPath(id), { force: true });
      const historyRoot = path.resolve(root, 'historial');
      const historyPath = path.resolve(historyRoot, id);
      if (!historyPath.startsWith(historyRoot + path.sep)) throw new Error('Ruta de historial inválida.');
      await fs.rm(historyPath, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    },
    async history(id) {
      boardPath(id);
      try { return (await fs.readdir(path.join(root, 'historial', id))).filter(n => /^\d+\.json$/.test(n)).sort().reverse().map(n => ({ id: n, date: Number(n.slice(0, -5)) })); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
    async readHistory(id, version) {
      boardPath(id);
      if (!/^\d+\.json$/.test(version)) throw new Error('Versión inválida.');
      return validateBoard(JSON.parse(await fs.readFile(path.join(root, 'historial', id, version), 'utf8')));
    },
    async snapshot(board) { validateBoard(board); await atomicWrite(path.join(root, 'historial', board.id, `${Date.now()}.json`), board); }
  };
}
module.exports = { createStore, validateBoard };
