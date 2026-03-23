const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveData: (data) => ipcRenderer.invoke('save-data', data),
    loadData: () => ipcRenderer.invoke('load-data'),
    getDataPath: () => ipcRenderer.invoke('get-data-path'),
    deleteTopic: (topicName) => ipcRenderer.invoke('delete-topic', topicName)
});
