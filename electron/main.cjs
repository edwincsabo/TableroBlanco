const { app, BrowserWindow, ipcMain, dialog, shell, protocol, net, Menu } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const { createStore } = require('./storage.cjs');
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
  const root = path.join(app.getPath('userData'), 'tableros');
  const store = createStore(root);
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
  ipcMain.handle('boards:list', () => store.list());
  ipcMain.handle('boards:save', (_event, board) => store.save(board));
  ipcMain.handle('boards:remove', (_event, id) => store.remove(id));
  ipcMain.handle('boards:history', (_event, id) => store.history(id));
  ipcMain.handle('boards:readHistory', (_event, id, version) => store.readHistory(id, version));
  ipcMain.handle('boards:snapshot', (_event, board) => store.snapshot(board));
  ipcMain.handle('app:dataFolder', () => shell.openPath(root));
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
  ipcMain.handle('app:closeReady', () => {closeApproved = true; window.close();});
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
});
app.on('window-all-closed', () => app.quit());
