const { contextBridge, ipcRenderer } = require('electron');
const listen = (channel, callback) => { const handler = (_event, data) => callback(data); ipcRenderer.on(channel, handler); return () => ipcRenderer.removeListener(channel, handler); };
contextBridge.exposeInMainWorld('desktop', {
  list: () => ipcRenderer.invoke('boards:list'),
  save: board => ipcRenderer.invoke('boards:save', board),
  remove: (id, revision) => ipcRenderer.invoke('boards:remove', id, revision),
  history: id => ipcRenderer.invoke('boards:history', id),
  readHistory: (id, version) => ipcRenderer.invoke('boards:readHistory', id, version),
  snapshot: board => ipcRenderer.invoke('boards:snapshot', board),
  saveFile: options => ipcRenderer.invoke('file:save', options),
  openFile: () => ipcRenderer.invoke('file:open'),
  dataFolder: () => ipcRenderer.invoke('app:dataFolder'),
  libraryInfo: () => ipcRenderer.invoke('library:info'),
  chooseFolder: () => ipcRenderer.invoke('library:choose'),
  changeFolder: token => ipcRenderer.invoke('library:change', token),
  recoveryFolder: () => ipcRenderer.invoke('library:recovery'),
  aiInfo: () => ipcRenderer.invoke('ai:info'),
  aiSave: input => ipcRenderer.invoke('ai:save', input),
  aiForget: provider => ipcRenderer.invoke('ai:forget', provider),
  aiAnalyze: payload => ipcRenderer.invoke('ai:analyze', payload),
  aiCancel: id => ipcRenderer.invoke('ai:cancel', id),
  onBoardsChanged: callback => listen('boards:changed', callback),
  external: url => ipcRenderer.invoke('app:external', url),
  setLanguage: locale => ipcRenderer.invoke('app:language', locale),
  onClosing: callback => listen('app:closing', callback),
  closeReady: () => ipcRenderer.invoke('app:closeReady'),
  onOpen: callback => {
    const unsubscribe = listen('document:open', callback);
    ipcRenderer.invoke('document:pending').then(data => { if (data) callback(data); }).catch(error => callback(JSON.stringify({error:error.message})));
    return unsubscribe;
  }
});
