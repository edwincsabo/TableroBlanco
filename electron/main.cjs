const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net, Menu, safeStorage } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const { createLibrary } = require('./library.cjs');
const { randomUUID } = require('node:crypto');
const { createAIService } = require('./ai.cjs');
const messages = require('../shared/ui.json');
let language = 'es';
function translate(text) { return language === 'es' ? text : messages[text]?.[language === 'en' ? 0 : 1] || text; }
protocol.registerSchemesAsPrivileged([{scheme:'tablero',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}}]);
if (process.env.TABLERO_TEST_DATA) app.setPath('userData', path.resolve(process.env.TABLERO_TEST_DATA));
let window; let closeApproved = false; let pendingOpen = null;
const lock = app.requestSingleInstanceLock();
if (!lock) app.quit();
function captureArgument(args) { return args.find(arg => /\.(tablero|excalidraw)$/i.test(arg) && !arg.startsWith('--')); }
pendingOpen = captureArgument(process.argv);
app.on('second-instance', (_event, args) => {
  const file = captureArgument(args);
  if (window) { if (window.isMinimized()) window.restore(); window.focus(); if (file) openDocument(file); }
});
async function openDocument(file) {
  try { const data = await fs.readFile(file, 'utf8'); window.webContents.send('document:open', data); }
  catch (e) { dialog.showErrorBox(translate('No se pudo abrir el tablero'), e.message); }
}
app.whenReady().then(async () => {
  const ai = createAIService(app.getPath('userData'), {safeStorage,translate});
  const aiHandler = handler => (event,...args) => {
    if(!window || event.sender!==window.webContents || event.senderFrame!==window.webContents.mainFrame)throw new Error(translate('Solicitud de IA no válida.'));
    return handler(...args);
  };
  ipcMain.handle('ai:info',aiHandler(()=>ai.info()));
  ipcMain.handle('ai:save',aiHandler(input=>ai.save(input)));
  ipcMain.handle('ai:forget',aiHandler(provider=>ai.forget(provider)));
  ipcMain.handle('ai:analyze',aiHandler(payload=>ai.analyze(payload)));
  ipcMain.handle('ai:cancel',aiHandler(id=>ai.cancel(id)));
  let library; let initializationError; let folderProposal = null;
  try { library = await createLibrary(app.getPath('userData'), translate); }
  catch (error) { initializationError = error; }
  const store = () => { if (!library) throw initializationError; return library; };
  ipcMain.handle('app:language', (_event, locale) => { if (['es','en','zh-CN'].includes(locale)) language = locale; });
  protocol.handle('tablero', request => {
    const url = new URL(request.url);
    let relative;
    try { relative = decodeURIComponent(url.pathname); } catch { return new Response('Ruta inválida', {status:400}); }
    const base = path.resolve(__dirname, '../dist');
    const target = path.resolve(base, '.' + (relative === '/' ? '/index.html' : relative));
    if (url.host !== 'app' || !target.startsWith(base + path.sep)) return new Response('No permitido', {status:403});
    return net.fetch(pathToFileURL(target).toString());
  });
  ipcMain.handle('boards:list', () => store().list());
  ipcMain.handle('boards:save', (_event, board) => store().save(board));
  ipcMain.handle('boards:remove', (_event, id, revision) => store().remove(id, revision));
  ipcMain.handle('boards:history', (_event, id) => store().history(id));
  ipcMain.handle('boards:readHistory', (_event, id, version) => store().readHistory(id, version));
  ipcMain.handle('boards:snapshot', (_event, board) => store().snapshot(board));
  ipcMain.handle('app:dataFolder', () => shell.openPath(store().info().path));
  ipcMain.handle('library:info', () => store().info());
  ipcMain.handle('library:recovery', async () => {
    const recovery = library ? library.info().recoveryPath : path.join(app.getPath('userData'), 'recuperacion');
    await fs.mkdir(recovery, { recursive: true }); return shell.openPath(recovery);
  });
  ipcMain.handle('library:choose', async () => {
    folderProposal = null;
    const result = await dialog.showOpenDialog(window, { title: translate('Seleccionar carpeta de tableros'), buttonLabel: translate('Usar esta carpeta'), defaultPath: store().info().path, properties: ['openDirectory', 'createDirectory'] });
    if (result.canceled || !result.filePaths[0]) return null;
    const proposal = await store().prepare(result.filePaths[0]);
    folderProposal = { ...proposal, token: randomUUID() }; return folderProposal;
  });
  ipcMain.handle('library:change', async (_event, token) => {
    if (!folderProposal || token !== folderProposal.token) throw new Error(translate('Vuelve a seleccionar la carpeta.'));
    const proposal = folderProposal; folderProposal = null;
    const result = await store().change(proposal.path);
    window.webContents.send('boards:changed'); return result;
  });
  ipcMain.handle('file:save', async (_event, { name, data, kind }) => {
    const extensions = {tablero:['tablero'], json:['json'], png:['png'], svg:['svg'], pdf:['pdf']};
    if (!extensions[kind]) throw new Error(translate('Formato no admitido.'));
    const result = await dialog.showSaveDialog(window, {title:translate('Guardar archivo'),buttonLabel:translate('Guardar'),defaultPath:path.basename(name),filters:[{name:'TableroBlanco',extensions:extensions[kind]}]});
    if (result.canceled || !result.filePath) return false;
    await fs.writeFile(result.filePath, kind === 'tablero' || kind === 'json' || kind === 'svg' ? data : Buffer.from(data));
    return true;
  });
  ipcMain.handle('file:open', async () => {
    const result = await dialog.showOpenDialog(window, {title:translate('Importar tablero'),buttonLabel:translate('Importar'),properties:['openFile'],filters:[{name:translate('Tableros'),extensions:['tablero','excalidraw','json']}]});
    if (result.canceled) return null;
    return fs.readFile(result.filePaths[0], 'utf8');
  });
  ipcMain.handle('document:pending', async () => {
    const file = pendingOpen; pendingOpen = null;
    return file ? fs.readFile(file, 'utf8') : null;
  });
  ipcMain.handle('app:closeReady', async () => {ai.cancel();await ai.idle().catch(()=>{});await library?.idle().catch(()=>{});closeApproved = true; window.close();});
  ipcMain.handle('app:external', (_event, url) => { if (/^https?:\/\//i.test(url)) return shell.openExternal(url); });
  window = new BrowserWindow({width:1440,height:940,minWidth:1000,minHeight:680,backgroundColor:'#f7f9f8',title:'TableroBlanco',icon:path.join(__dirname,'../build/icon.ico'),webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
  Menu.setApplicationMenu(null);
  window.webContents.setWindowOpenHandler(({url}) => {if (/^https?:\/\//i.test(url)) shell.openExternal(url); return {action:'deny'};});
  window.webContents.on('will-navigate', (event, url) => {if (!url.startsWith('tablero://app/') && !url.startsWith('http://127.0.0.1:5173/')) event.preventDefault();});
  window.webContents.session.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  window.webContents.session.webRequest.onBeforeRequest({urls:['http://*/*','https://*/*']}, (details, callback) => {
    callback({cancel:!process.env.TABLERO_DEV || !details.url.startsWith('http://127.0.0.1:5173/')});
  });
  window.on('close', event => {if (!closeApproved && !window.webContents.isDestroyed()) {event.preventDefault();window.webContents.send('app:closing');}});
  if (process.env.TABLERO_DEV) await window.loadURL('http://127.0.0.1:5173');
  else await window.loadURL('tablero://app/');
  let signature = null; let checking = false;
  const checkLibrary = async () => {
    if (checking || window.isDestroyed() || !library) return;
    checking = true;
    try {
      const current = await library.signature();
      if (current !== signature) { signature = current; window.webContents.send('boards:changed'); }
    } catch {
      if (signature !== 'unavailable') { signature = 'unavailable'; window.webContents.send('boards:changed'); }
    } finally { checking = false; }
  };
  const refreshTimer = setInterval(checkLibrary, 3000);
  window.on('focus', checkLibrary);
  window.on('closed', () => clearInterval(refreshTimer));
});
app.on('window-all-closed', () => app.quit());
