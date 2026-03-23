const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(app.getPath('userData'), 'commands-data');
const settingsPath = path.join(app.getPath('userData'), 'window-settings.json');

// Criar pasta e arquivos iniciais se não existirem
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Sincronizar arquivos do projeto com a pasta do sistema
function createDefaultFiles() {
    // Deletar commands.json antigo se existir
    const oldFile = path.join(dataDir, 'commands.json');
    if (fs.existsSync(oldFile)) {
        console.log('Deletando arquivo antigo commands.json');
        fs.unlinkSync(oldFile);
    }
    
    const sourceDir = path.join(__dirname, 'commands-data');
    
    if (fs.existsSync(sourceDir)) {
        console.log('Sincronizando arquivos da pasta commands-data...');
        const sourceFiles = fs.readdirSync(sourceDir);
        
        for (const file of sourceFiles) {
            if (file.endsWith('.json')) {
                const sourcePath = path.join(sourceDir, file);
                const destPath = path.join(dataDir, file);
                
                // Copiar apenas se não existir na pasta do sistema
                if (!fs.existsSync(destPath)) {
                    try {
                        fs.copyFileSync(sourcePath, destPath);
                        console.log(`Copiado: ${file}`);
                    } catch (error) {
                        console.error(`Erro ao copiar ${file}:`, error);
                    }
                }
            }
        }
    }
}

createDefaultFiles();

// Carregar configurações da janela
function loadWindowSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const data = fs.readFileSync(settingsPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações da janela:', error);
    }
    return {};
}

// Salvar configurações da janela (apenas tamanho)
function saveWindowSettings(win) {
    try {
        const bounds = win.getBounds();
        const settings = {
            width: bounds.width,
            height: bounds.height
        };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Erro ao salvar configurações da janela:', error);
    }
}

function createWindow() {
    const windowSettings = loadWindowSettings();
    const { screen } = require('electron');
    
    // Obter a tela onde o cursor está (área de trabalho atual)
    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
    
    // Calcular posição centralizada na tela atual
    const width = windowSettings.width || 480;
    const height = windowSettings.height || 900;
    const x = currentDisplay.workArea.x + Math.floor((currentDisplay.workArea.width - width) / 2);
    const y = currentDisplay.workArea.y + Math.floor((currentDisplay.workArea.height - height) / 2);
    
    const win = new BrowserWindow({
        width: width,
        height: height,
        x: x,
        y: y,
        minWidth: 450,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.loadFile('index.html');
    
    // Quando a janela for restaurada do minimize
    win.on('restore', () => {
        const cursorPoint = screen.getCursorScreenPoint();
        const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
        
        const bounds = win.getBounds();
        const x = currentDisplay.workArea.x + Math.floor((currentDisplay.workArea.width - bounds.width) / 2);
        const y = currentDisplay.workArea.y + Math.floor((currentDisplay.workArea.height - bounds.height) / 2);
        
        win.setPosition(x, y);
        win.show();
    });
    
    // Salvar apenas tamanho, não posição
    win.on('resized', () => {
        const bounds = win.getBounds();
        const settings = {
            width: bounds.width,
            height: bounds.height
        };
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    });
}

// Salvar dados - salva cada tópico em ambas as pastas
ipcMain.handle('save-data', async (event, data) => {
    try {
        const sourceDir = path.join(__dirname, 'commands-data');
        
        // Salvar cada tópico em seu próprio arquivo
        for (const [topic, topicData] of Object.entries(data)) {
            const systemPath = path.join(dataDir, `${topic}.json`);
            const projectPath = path.join(sourceDir, `${topic}.json`);
            
            // Salvar na pasta do sistema
            fs.writeFileSync(systemPath, JSON.stringify(topicData, null, 2));
            
            // Salvar na pasta do projeto (se existir)
            if (fs.existsSync(sourceDir)) {
                fs.writeFileSync(projectPath, JSON.stringify(topicData, null, 2));
            }
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Carregar dados - lê todos os arquivos JSON da pasta
ipcMain.handle('load-data', async () => {
    try {
        console.log('Carregando dados da pasta:', dataDir);
        const data = {};
        
        // Ler todos os arquivos .json da pasta
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir);
            console.log('Arquivos encontrados:', files);
            
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const topicName = file.replace('.json', '');
                    const filePath = path.join(dataDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    const parsed = JSON.parse(content);
                    
                    // Verificar se é formato antigo (array) ou novo (objeto com type e items)
                    if (Array.isArray(parsed)) {
                        // Converter formato antigo para novo
                        // Detectar se é credencial pelo nome do tópico ou conteúdo
                        const isCredential = topicName.toLowerCase().includes('senha') || 
                                           topicName.toLowerCase().includes('credencial') ||
                                           topicName.toLowerCase().includes('gov');
                        
                        if (isCredential) {
                            // Converter para formato de credencial
                            data[topicName] = {
                                type: 'credential',
                                items: parsed.map(item => ({
                                    title: item.title || '',
                                    login: item.title ? item.title.replace('CPF:', '').trim() : '',
                                    password: item.command || ''
                                }))
                            };
                        } else {
                            // Converter para formato de comando
                            data[topicName] = {
                                type: 'command',
                                items: parsed
                            };
                        }
                        
                        // Salvar no novo formato
                        fs.writeFileSync(filePath, JSON.stringify(data[topicName], null, 2));
                        console.log(`Convertido ${topicName} para novo formato`);
                    } else {
                        // Já está no formato novo
                        data[topicName] = parsed;
                    }
                    
                    console.log(`Carregado tópico ${topicName} com ${data[topicName].items.length} itens`);
                }
            }
        }
        
        console.log('Dados carregados:', Object.keys(data));
        return Object.keys(data).length > 0 ? data : null;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return null;
    }
});

// Deletar tópico - deleta de ambas as pastas
ipcMain.handle('delete-topic', async (event, topicName) => {
    try {
        const sourceDir = path.join(__dirname, 'commands-data');
        const systemPath = path.join(dataDir, `${topicName}.json`);
        const projectPath = path.join(sourceDir, `${topicName}.json`);
        
        let deleted = false;
        
        // Deletar da pasta do sistema
        if (fs.existsSync(systemPath)) {
            fs.unlinkSync(systemPath);
            deleted = true;
        }
        
        // Deletar da pasta do projeto
        if (fs.existsSync(projectPath)) {
            fs.unlinkSync(projectPath);
            deleted = true;
        }
        
        return { success: deleted };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Obter caminho da pasta de dados
ipcMain.handle('get-data-path', async () => {
    return dataDir;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

