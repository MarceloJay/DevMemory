class CommandManager {
    constructor() {
        this.data = {};
        this.currentTopic = null;
        this.isElectron = typeof window.electronAPI !== 'undefined';
        this.init();
    }

    async init() {
        await this.loadData();
        this.topicSelect = document.getElementById('topicSelect');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.editTopicBtn = document.getElementById('editTopicBtn');
        this.addTopicBtn = document.getElementById('addTopicBtn');
        this.addCommandBtn = document.getElementById('addCommandBtn');
        this.reorderBtn = document.getElementById('reorderBtn');
        this.saveListBtn = document.getElementById('saveListBtn');
        this.commandList = document.getElementById('commandList');
        this.commandCount = document.getElementById('commandCount');
        this.searchInput = document.getElementById('searchInput');
        this.darkModeBtn = document.getElementById('darkModeBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        
        this.topicModal = document.getElementById('topicModal');
        this.topicInput = document.getElementById('topicInput');
        this.topicTypeSelect = document.getElementById('topicTypeSelect');
        this.saveTopicBtn = document.getElementById('saveTopicBtn');
        this.cancelTopicBtn = document.getElementById('cancelTopicBtn');
        this.editingTopic = null;
        
        this.commandModal = document.getElementById('commandModal');
        this.commandTitleInput = document.getElementById('commandTitleInput');
        this.commandInput = document.getElementById('commandInput');
        this.credentialLoginInput = document.getElementById('credentialLoginInput');
        this.credentialPasswordInput = document.getElementById('credentialPasswordInput');
        this.listItemInput = document.getElementById('listItemInput');
        this.jsonInput = document.getElementById('jsonInput');
        this.textInput = document.getElementById('textInput');
        this.formatJsonBtn = document.getElementById('formatJsonBtn');
        this.saveCommandBtn = document.getElementById('saveCommandBtn');
        this.cancelCommandBtn = document.getElementById('cancelCommandBtn');

        this.settingsModal = document.getElementById('settingsModal');
        this.themeSelect = document.getElementById('themeSelect');
        this.windowSizeSelect = document.getElementById('windowSizeSelect');
        this.autoStartCheck = document.getElementById('autoStartCheck');
        this.confirmDeleteCheck = document.getElementById('confirmDeleteCheck');
        this.dataPathDisplay = document.getElementById('dataPathDisplay');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');

        this.jsonViewModal = document.getElementById('jsonViewModal');
        this.jsonViewTitle = document.getElementById('jsonViewTitle');
        this.jsonViewContent = document.getElementById('jsonViewContent');
        this.jsonSearchInput = document.getElementById('jsonSearchInput');
        this.closeJsonViewBtn = document.getElementById('closeJsonViewBtn');

        this.reorderMode = false;
        this.listChanged = false;
        this.searchTerm = '';
        this.loadSettings();
        this.attachEvents();
        this.renderTopics();
    }

    attachEvents() {
        this.refreshBtn.addEventListener('click', () => this.refreshData());
        this.editTopicBtn.addEventListener('click', () => this.openEditTopicModal());
        this.addTopicBtn.addEventListener('click', () => this.openTopicModal());
        this.saveTopicBtn.addEventListener('click', () => this.saveTopic());
        this.cancelTopicBtn.addEventListener('click', () => this.closeTopicModal());
        
        this.addCommandBtn.addEventListener('click', () => this.openCommandModal());
        this.reorderBtn.addEventListener('click', () => this.toggleReorderMode());
        this.saveCommandBtn.addEventListener('click', () => this.saveCommand());
        this.cancelCommandBtn.addEventListener('click', () => this.closeCommandModal());
        this.formatJsonBtn.addEventListener('click', () => this.formatJson());
        
        this.topicSelect.addEventListener('change', (e) => this.selectTopic(e.target.value));
        
        this.darkModeBtn.addEventListener('click', () => this.toggleDarkMode());
        this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeSettingsModal());
        
        this.closeJsonViewBtn.addEventListener('click', () => this.closeJsonViewModal());
        
        this.jsonSearchInput.addEventListener('input', (e) => this.searchInJson(e.target.value));
        
        this.topicInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveTopic();
        });
        
        this.commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.saveCommand();
        });
        
        this.searchInput.addEventListener('input', (e) => this.filterCommands(e.target.value));
    }

    async loadData() {
        console.log('Iniciando loadData...');
        console.log('isElectron:', this.isElectron);
        
        if (this.isElectron) {
            // Carregar do arquivo no Electron
            const data = await window.electronAPI.loadData();
            console.log('Dados carregados do Electron:', data);
            
            if (data && Object.keys(data).length > 0) {
                this.data = data;
                console.log('Dados definidos:', this.data);
            } else {
                console.log('Nenhum dado encontrado, usando padrão');
                this.data = this.getDefaultData();
                await this.saveData();
            }
        } else {
            // Carregar do localStorage no navegador
            const saved = localStorage.getItem('commandManagerData');
            if (saved) {
                this.data = JSON.parse(saved);
            } else {
                this.data = this.getDefaultData();
                this.saveData();
            }
        }
        
        console.log('Dados finais:', this.data);
        console.log('Tópicos:', Object.keys(this.data));
    }

    getDefaultData() {
        return {
            'Git': {
                type: 'command',
                items: [
                    { title: 'Inicializar repositório', command: 'git init' },
                    { title: 'Adicionar todos os arquivos', command: 'git add .' },
                    { title: 'Commit com mensagem', command: 'git commit -m "mensagem"' },
                    { title: 'Amend - Alterar último commit', command: 'git commit --amend -m "nova mensagem"' },
                    { title: 'Amend sem alterar mensagem', command: 'git commit --amend --no-edit' },
                    { title: 'Ver status', command: 'git status' },
                    { title: 'Ver histórico completo', command: 'git log' },
                    { title: 'Ver histórico resumido', command: 'git log --oneline' },
                    { title: 'Ver histórico com gráfico', command: 'git log --oneline --graph --all' },
                    { title: 'Criar nova branch', command: 'git checkout -b nome-da-branch' },
                    { title: 'Mudar de branch', command: 'git checkout nome-da-branch' },
                    { title: 'Listar todas as branches', command: 'git branch -a' },
                    { title: 'Deletar branch local', command: 'git branch -d nome-da-branch' },
                    { title: 'Forçar deletar branch local', command: 'git branch -D nome-da-branch' },
                    { title: 'Deletar branch remota', command: 'git push origin --delete nome-da-branch' },
                    { title: 'Reset soft - Desfaz commit mantém alterações', command: 'git reset --soft HEAD~1' },
                    { title: 'Reset mixed - Desfaz commit e staging', command: 'git reset HEAD~1' },
                    { title: 'Reset hard - Desfaz tudo (CUIDADO!)', command: 'git reset --hard HEAD~1' },
                    { title: 'Force push (CUIDADO!)', command: 'git push --force origin nome-da-branch' },
                    { title: 'Force push com lease (mais seguro)', command: 'git push --force-with-lease origin nome-da-branch' },
                    { title: 'Ver diferenças', command: 'git diff' },
                    { title: 'Ver diferenças staged', command: 'git diff --staged' },
                    { title: 'Stash - Guardar alterações temporariamente', command: 'git stash' },
                    { title: 'Stash com mensagem', command: 'git stash save "mensagem"' },
                    { title: 'Aplicar último stash', command: 'git stash pop' },
                    { title: 'Listar stashes', command: 'git stash list' },
                    { title: 'Desfazer alterações em arquivo', command: 'git checkout -- nome-do-arquivo' },
                    { title: 'Limpar arquivos não rastreados', command: 'git clean -fd' },
                    { title: 'Ver configurações', command: 'git config --list' },
                    { title: 'Configurar nome de usuário', command: 'git config --global user.name "Seu Nome"' },
                    { title: 'Configurar email', command: 'git config --global user.email "seu@email.com"' }
                ]
            },
            'GitHub': {
                type: 'command',
                items: [
                    { title: 'Clonar repositório', command: 'git clone https://github.com/usuario/repo.git' },
                    { title: 'Adicionar remote origin', command: 'git remote add origin https://github.com/usuario/repo.git' },
                    { title: 'Push para main', command: 'git push origin main' },
                    { title: 'Push primeira vez', command: 'git push -u origin main' },
                    { title: 'Pull do repositório', command: 'git pull origin main' },
                    { title: 'Ver remotes', command: 'git remote -v' },
                    { title: 'Fork - adicionar upstream', command: 'git remote add upstream https://github.com/original/repo.git' },
                    { title: 'Atualizar fork', command: 'git fetch upstream && git merge upstream/main' }
                ]
            }
        };
    }

    async saveData() {
        if (this.isElectron) {
            // Salvar em arquivo no Electron
            await window.electronAPI.saveData(this.data);
        } else {
            // Salvar no localStorage no navegador
            localStorage.setItem('commandManagerData', JSON.stringify(this.data));
        }
    }

    renderTopics() {
        console.log('renderTopics chamado');
        console.log('Dados atuais:', this.data);
        
        this.topicSelect.innerHTML = '<option value="">Selecione um tópico</option>';
        Object.keys(this.data).forEach(topic => {
            console.log('Adicionando tópico:', topic);
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            this.topicSelect.appendChild(option);
        });
    }

    openTopicModal() {
        this.editingTopic = null;
        this.topicModal.classList.add('active');
        this.topicModal.querySelector('h3').textContent = 'Novo Tópico';
        this.topicInput.value = '';
        this.topicTypeSelect.value = 'command';
        this.topicTypeSelect.disabled = false;
        this.topicInput.focus();
    }

    openEditTopicModal() {
        if (!this.currentTopic) return;
        
        this.editingTopic = this.currentTopic;
        this.topicModal.classList.add('active');
        this.topicModal.querySelector('h3').textContent = 'Editar Tópico';
        this.topicInput.value = this.currentTopic;
        this.topicTypeSelect.value = this.data[this.currentTopic].type;
        this.topicTypeSelect.disabled = true; // Não pode mudar o tipo
        this.topicInput.focus();
        this.topicInput.select();
    }

    closeTopicModal() {
        this.topicModal.classList.remove('active');
    }

    async saveTopic() {
        const topicName = this.topicInput.value.trim();
        const topicType = this.topicTypeSelect.value;
        
        if (!topicName) return;
        
        if (this.editingTopic) {
            // Editando tópico existente
            if (topicName !== this.editingTopic) {
                // Renomear tópico
                this.data[topicName] = this.data[this.editingTopic];
                delete this.data[this.editingTopic];
                
                // Deletar arquivo antigo e salvar com novo nome
                if (this.isElectron) {
                    await window.electronAPI.deleteTopic(this.editingTopic);
                }
                
                await this.saveData();
                this.renderTopics();
                this.topicSelect.value = topicName;
                this.selectTopic(topicName);
            }
        } else {
            // Criando novo tópico
            if (!this.data[topicName]) {
                this.data[topicName] = {
                    type: topicType,
                    items: []
                };
                await this.saveData();
                this.renderTopics();
                this.topicSelect.value = topicName;
                this.selectTopic(topicName);
            }
        }
        
        this.closeTopicModal();
    }

    selectTopic(topic) {
        this.currentTopic = topic;
        this.addCommandBtn.disabled = !topic;
        this.reorderBtn.disabled = !topic;
        this.editTopicBtn.disabled = !topic;
        
        // Mostrar/ocultar campo de busca
        this.searchInput.style.display = topic ? 'block' : 'none';
        this.searchInput.value = '';
        this.searchTerm = '';

        // Atualizar texto do botão baseado no tipo
        if (topic && this.data[topic]) {
            const topicType = this.data[topic].type;
            if (topicType === 'credential') {
                this.addCommandBtn.textContent = '+ Credencial';
            } else if (topicType === 'list') {
                this.addCommandBtn.textContent = '+ Item';
            } else if (topicType === 'json') {
                this.addCommandBtn.textContent = '+ JSON';
            } else if (topicType === 'text') {
                this.addCommandBtn.textContent = '+ Texto';
            } else {
                this.addCommandBtn.textContent = '+ Comando';
            }
        }

        // Desativar modo de reordenação ao trocar de tópico
        if (this.reorderMode) {
            this.toggleReorderMode();
        }

        this.renderCommands();
    }

    filterCommands(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.renderCommands();
    }

    renderCommands() {
        if (!this.currentTopic) {
            this.commandList.innerHTML = '<div class="empty-state">Selecione um tópico</div>';
            this.commandCount.textContent = '0 comandos';
            return;
        }

        const topicData = this.data[this.currentTopic];
        const items = topicData.items || [];
        const topicType = topicData.type;
        
        // Filtrar itens baseado na busca
        const filteredItems = this.searchTerm ? items.filter((item, index) => {
            item._originalIndex = index; // Guardar índice original
            
            if (topicType === 'credential') {
                return (item.title && item.title.toLowerCase().includes(this.searchTerm)) ||
                       (item.login && item.login.toLowerCase().includes(this.searchTerm));
            } else if (topicType === 'list') {
                return item.text && item.text.toLowerCase().includes(this.searchTerm);
            } else if (topicType === 'json' || topicType === 'text') {
                return (item.title && item.title.toLowerCase().includes(this.searchTerm)) ||
                       (item.content && item.content.toLowerCase().includes(this.searchTerm));
            } else {
                return (item.title && item.title.toLowerCase().includes(this.searchTerm)) ||
                       (item.command && item.command.toLowerCase().includes(this.searchTerm));
            }
        }) : items.map((item, index) => {
            item._originalIndex = index;
            return item;
        });
        
        let countLabel = 'comando';
        if (topicType === 'credential') countLabel = 'credencial';
        else if (topicType === 'list') countLabel = 'item';
        else if (topicType === 'json') countLabel = 'snippet';
        else if (topicType === 'text') countLabel = 'texto';
        
        const totalCount = items.length;
        const filteredCount = filteredItems.length;
        
        if (this.searchTerm) {
            this.commandCount.textContent = `${filteredCount} de ${totalCount} ${countLabel}${totalCount !== 1 ? (topicType === 'credential' ? 'is' : 's') : ''}`;
        } else {
            this.commandCount.textContent = `${totalCount} ${countLabel}${totalCount !== 1 ? (topicType === 'credential' ? 'is' : 's') : ''}`;
        }
        
        if (filteredItems.length === 0) {
            let emptyLabel = ' comando';
            if (topicType === 'credential') emptyLabel = 'a credencial';
            else if (topicType === 'list') emptyLabel = ' item';
            else if (topicType === 'json') emptyLabel = ' snippet';
            else if (topicType === 'text') emptyLabel = ' texto';
            
            this.commandList.innerHTML = `<div class="empty-state">Nenhum${emptyLabel} salvo</div>`;
            return;
        }

        // IMPORTANTE: Limpar o container antes de renderizar
        this.commandList.innerHTML = '';
        
        // Renderizar lista de forma diferente
        if (topicType === 'list') {
            const listContainer = document.createElement('div');
            listContainer.className = 'list-container';
            
            filteredItems.forEach((item) => {
                const index = item._originalIndex;
                const listItem = document.createElement('div');
                listItem.className = `list-item ${item.done ? 'done' : ''}`;
                listItem.dataset.index = index;
                
                if (this.reorderMode) {
                    listItem.classList.add('reorder-mode');
                    listItem.draggable = true;
                }
                
                listItem.innerHTML = `
                    <div class="drag-handle">⋮⋮</div>
                    <input type="checkbox" class="list-checkbox" data-index="${index}" ${item.done ? 'checked' : ''} ${this.reorderMode ? 'disabled' : ''}>
                    <span class="list-text">${this.escapeHtml(item.text)}</span>
                    <button class="list-delete-btn" data-index="${index}" ${this.reorderMode ? 'style="display:none"' : ''}>🗑️</button>
                `;
                
                if (this.reorderMode) {
                    listItem.addEventListener('dragstart', (e) => this.handleDragStart(e));
                    listItem.addEventListener('dragover', (e) => this.handleDragOver(e));
                    listItem.addEventListener('drop', (e) => this.handleDrop(e));
                    listItem.addEventListener('dragend', (e) => this.handleDragEnd(e));
                }
                
                listContainer.appendChild(listItem);
            });
            
            this.commandList.appendChild(listContainer);
        } else {
            // Renderizar comandos, credenciais, JSON e Texto como cards
            filteredItems.forEach((item) => {
                const index = item._originalIndex;
                const card = document.createElement('div');
                card.className = 'command-item';
                card.dataset.index = index;
                
                if (this.reorderMode) {
                    card.classList.add('reorder-mode');
                    card.draggable = true;
                }
                
                if (topicType === 'credential') {
                    card.innerHTML = `
                        <div class="drag-handle">⋮⋮</div>
                        ${item.title ? `<div class="command-title">${this.escapeHtml(item.title)}</div>` : ''}
                        <div class="credential-info">
                            <div class="credential-row">
                                <span class="credential-label">Login:</span>
                                <span class="credential-value">${this.escapeHtml(item.login)}</span>
                            </div>
                            <div class="credential-row">
                                <span class="credential-label">Senha:</span>
                                <span class="credential-value">${'•'.repeat(Math.min(item.password.length, 20))}</span>
                            </div>
                        </div>
                        <div class="command-actions" ${this.reorderMode ? 'style="display:none"' : ''}>
                            <button class="copy-login-btn" data-index="${index}">📋 Login</button>
                            <button class="copy-password-btn" data-index="${index}">🔑 Senha</button>
                            <button class="delete-btn" data-index="${index}">Excluir</button>
                        </div>
                    `;
                } else if (topicType === 'json') {
                    // Mostrar apenas preview do JSON (primeiras 3 linhas)
                    const formatted = this.formatJsonString(item.content);
                    const lines = formatted.split('\n');
                    const preview = lines.slice(0, 3).join('\n') + (lines.length > 3 ? '\n...' : '');
                    
                    card.innerHTML = `
                        <div class="drag-handle">⋮⋮</div>
                        ${item.title ? `<div class="command-title">${this.escapeHtml(item.title)}</div>` : ''}
                        <div class="command-code json-preview" data-index="${index}">${this.escapeHtml(preview)}</div>
                        <div class="command-actions" ${this.reorderMode ? 'style="display:none"' : ''}>
                            <button class="analyze-btn" data-index="${index}">🔍 Analisar</button>
                            <button class="copy-btn" data-index="${index}">📋 Copiar</button>
                            <button class="delete-btn" data-index="${index}">Excluir</button>
                        </div>
                    `;
                } else if (topicType === 'text') {
                    card.innerHTML = `
                        <div class="drag-handle">⋮⋮</div>
                        ${item.title ? `<div class="command-title">${this.escapeHtml(item.title)}</div>` : ''}
                        <div class="command-code text-content" data-index="${index}">${this.escapeHtml(item.content)}</div>
                        <div class="command-actions" ${this.reorderMode ? 'style="display:none"' : ''}>
                            <button class="copy-btn" data-index="${index}">📋 Copiar</button>
                            <button class="delete-btn" data-index="${index}">Excluir</button>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="drag-handle">⋮⋮</div>
                        ${item.title ? `<div class="command-title">${this.escapeHtml(item.title)}</div>` : ''}
                        <div class="command-code">${this.escapeHtml(item.command)}</div>
                        <div class="command-actions" ${this.reorderMode ? 'style="display:none"' : ''}>
                            <button class="copy-btn" data-index="${index}">📋 Copiar</button>
                            <button class="delete-btn" data-index="${index}">Excluir</button>
                        </div>
                    `;
                }
                
                if (this.reorderMode) {
                    card.addEventListener('dragstart', (e) => this.handleDragStart(e));
                    card.addEventListener('dragover', (e) => this.handleDragOver(e));
                    card.addEventListener('drop', (e) => this.handleDrop(e));
                    card.addEventListener('dragend', (e) => this.handleDragEnd(e));
                }
                
                this.commandList.appendChild(card);
            });
        }

        if (!this.reorderMode) {
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.copyCommand(e.target.dataset.index));
            });

            document.querySelectorAll('.copy-login-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.copyLogin(e.target.dataset.index, e.target));
            });

            document.querySelectorAll('.copy-password-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.copyPassword(e.target.dataset.index, e.target));
            });

            document.querySelectorAll('.list-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => this.toggleListItem(e.target.dataset.index));
            });

            document.querySelectorAll('.list-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteCommand(e.target.dataset.index));
            });

            document.querySelectorAll('.analyze-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.analyzeJson(e.target.dataset.index));
            });

            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteCommand(e.target.dataset.index));
            });
        }
    }

    async toggleListItem(index) {
        const topicData = this.data[this.currentTopic];
        const checkbox = document.querySelector(`.list-checkbox[data-index="${index}"]`);
        const listItem = checkbox.closest('.list-item');
        
        // Atualizar estado
        topicData.items[index].done = checkbox.checked;
        
        // Atualizar UI
        if (checkbox.checked) {
            listItem.classList.add('done');
        } else {
            listItem.classList.remove('done');
        }
        
        // Salvar automaticamente
        await this.saveData();
    }

    analyzeJson(index) {
        const topicData = this.data[this.currentTopic];
        const item = topicData.items[index];
        
        try {
            const formatted = this.formatJsonString(item.content);
            
            // Salvar JSON original para busca
            this.currentJsonContent = formatted;
            
            // Abrir modal com JSON formatado
            this.jsonViewModal.classList.add('active');
            this.jsonViewTitle.textContent = item.title || 'JSON';
            this.jsonViewContent.innerHTML = this.escapeHtml(formatted);
            this.jsonSearchInput.value = '';
            this.jsonSearchInput.focus();
        } catch (error) {
            alert('Erro ao formatar JSON!');
        }
    }

    searchInJson(searchTerm) {
        if (!this.currentJsonContent) return;
        
        if (!searchTerm.trim()) {
            // Se busca vazia, mostrar JSON normal
            this.jsonViewContent.innerHTML = this.escapeHtml(this.currentJsonContent);
            return;
        }
        
        // Destacar termos encontrados
        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
        const highlighted = this.currentJsonContent.replace(regex, '<mark>$1</mark>');
        this.jsonViewContent.innerHTML = highlighted;
    }

    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    closeJsonViewModal() {
        this.jsonViewModal.classList.remove('active');
        this.currentJsonContent = null;
    }

    formatJson() {
        try {
            const jsonText = this.jsonInput.value.trim();
            if (!jsonText) return;
            
            const parsed = JSON.parse(jsonText);
            const formatted = JSON.stringify(parsed, null, 2);
            this.jsonInput.value = formatted;
            
            // Feedback visual
            const originalText = this.formatJsonBtn.textContent;
            this.formatJsonBtn.textContent = '✓ Formatado';
            setTimeout(() => {
                this.formatJsonBtn.textContent = originalText;
            }, 1500);
        } catch (error) {
            alert('JSON inválido! Não foi possível formatar.');
        }
    }

    openCommandModal() {
        if (!this.currentTopic) return;
        
        const topicData = this.data[this.currentTopic];
        const topicType = topicData.type;
        
        // Atualizar título do modal
        const modalTitle = this.commandModal.querySelector('h3');
        if (topicType === 'credential') {
            modalTitle.textContent = 'Nova Credencial';
        } else if (topicType === 'list') {
            modalTitle.textContent = 'Novo Item';
        } else if (topicType === 'json') {
            modalTitle.textContent = 'Novo JSON';
        } else if (topicType === 'text') {
            modalTitle.textContent = 'Novo Texto';
        } else {
            modalTitle.textContent = 'Novo Comando';
        }
        
        this.commandModal.classList.add('active');
        this.commandTitleInput.value = '';
        this.commandInput.value = '';
        this.credentialLoginInput.value = '';
        this.credentialPasswordInput.value = '';
        this.listItemInput.value = '';
        this.jsonInput.value = '';
        this.textInput.value = '';
        
        // Mostrar/ocultar campos baseado no tipo
        document.getElementById('commandFields').style.display = topicType === 'command' ? 'block' : 'none';
        document.getElementById('credentialFields').style.display = topicType === 'credential' ? 'block' : 'none';
        document.getElementById('listFields').style.display = topicType === 'list' ? 'block' : 'none';
        document.getElementById('jsonFields').style.display = topicType === 'json' ? 'block' : 'none';
        document.getElementById('textFields').style.display = topicType === 'text' ? 'block' : 'none';
        
        // Ocultar título para listas
        this.commandTitleInput.style.display = topicType === 'list' ? 'none' : 'block';
        
        if (topicType === 'credential') {
            this.credentialLoginInput.focus();
        } else if (topicType === 'list') {
            this.listItemInput.focus();
        } else if (topicType === 'json') {
            this.jsonInput.focus();
        } else if (topicType === 'text') {
            this.textInput.focus();
        } else {
            this.commandInput.focus();
        }
    }

    closeCommandModal() {
        this.commandModal.classList.remove('active');
    }

    async saveCommand() {
        if (!this.currentTopic) return;
        
        const topicData = this.data[this.currentTopic];
        const topicType = topicData.type;
        
        if (topicType === 'credential') {
            const title = this.commandTitleInput.value.trim();
            const login = this.credentialLoginInput.value.trim();
            const password = this.credentialPasswordInput.value.trim();
            
            if (!login || !password) return;
            
            topicData.items.push({ title, login, password });
        } else if (topicType === 'list') {
            const text = this.listItemInput.value.trim();
            
            if (!text) return;
            
            topicData.items.push({ text, done: false });
        } else if (topicType === 'json') {
            const title = this.commandTitleInput.value.trim();
            const content = this.jsonInput.value.trim();
            
            if (!content) return;
            
            // Validar JSON
            try {
                JSON.parse(content);
                // Salvar minificado
                const minified = JSON.stringify(JSON.parse(content));
                topicData.items.push({ title, content: minified, formatted: false });
            } catch (error) {
                alert('JSON inválido! Verifique a sintaxe.');
                return;
            }
        } else if (topicType === 'text') {
            const title = this.commandTitleInput.value.trim();
            const content = this.textInput.value.trim();
            
            if (!content) return;
            
            topicData.items.push({ title, content });
        } else {
            const title = this.commandTitleInput.value.trim();
            const command = this.commandInput.value.trim();
            
            if (!command) return;
            
            topicData.items.push({ title, command });
        }
        
        await this.saveData();
        this.renderCommands();
        this.closeCommandModal();
    }

    copyCommand(index) {
        const topicData = this.data[this.currentTopic];
        const item = topicData.items[index];
        const topicType = topicData.type;
        
        let textToCopy = '';
        if (topicType === 'list') {
            textToCopy = item.text;
        } else if (topicType === 'json' || topicType === 'text') {
            textToCopy = item.content;
        } else {
            textToCopy = item.command;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const btn = document.querySelector(`.copy-btn[data-index="${index}"]`);
            const originalText = btn.textContent;
            btn.textContent = 'Copiado!';
            setTimeout(() => btn.textContent = originalText, 1500);
        });
    }

    copyLogin(index, button) {
        const topicData = this.data[this.currentTopic];
        const login = topicData.items[index].login;
        navigator.clipboard.writeText(login).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = originalText, 1500);
        });
    }

    copyPassword(index, button) {
        const topicData = this.data[this.currentTopic];
        const password = topicData.items[index].password;
        navigator.clipboard.writeText(password).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copiado!';
            setTimeout(() => button.textContent = originalText, 1500);
        });
    }

    async deleteCommand(index) {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const confirmDelete = settings.confirmDelete !== false;
        
        if (confirmDelete && !confirm('Deseja excluir este item?')) {
            return;
        }
        
        const topicData = this.data[this.currentTopic];
        topicData.items.splice(index, 1);
        await this.saveData();
        this.renderCommands();
    }

    async refreshData() {
        console.log('Recarregando dados...');
        const currentTopic = this.currentTopic;
        await this.loadData();
        this.renderTopics();
        
        if (currentTopic && this.data[currentTopic]) {
            this.topicSelect.value = currentTopic;
            this.selectTopic(currentTopic);
        } else {
            this.currentTopic = null;
            this.addCommandBtn.disabled = true;
            this.renderCommands();
        }
        
        const originalText = this.refreshBtn.textContent;
        this.refreshBtn.textContent = '✓';
        setTimeout(() => this.refreshBtn.textContent = originalText, 1000);
    }

    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        
        const theme = settings.theme || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.darkModeBtn.textContent = '☀️';
        } else if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                this.darkModeBtn.textContent = '☀️';
            }
        }
        
        if (this.isElectron && this.dataPathDisplay) {
            window.electronAPI.getDataPath().then(path => {
                this.dataPathDisplay.textContent = path;
            });
        }
    }

    openSettingsModal() {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        
        this.themeSelect.value = settings.theme || 'light';
        this.windowSizeSelect.value = settings.windowSize || 'small';
        this.autoStartCheck.checked = settings.autoStart || false;
        this.confirmDeleteCheck.checked = settings.confirmDelete !== false;
        
        this.settingsModal.classList.add('active');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    saveSettings() {
        const settings = {
            theme: this.themeSelect.value,
            windowSize: this.windowSizeSelect.value,
            autoStart: this.autoStartCheck.checked,
            confirmDelete: this.confirmDeleteCheck.checked
        };
        
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        if (settings.theme === 'light') {
            document.body.classList.remove('dark-mode');
            this.darkModeBtn.textContent = '🌙';
        } else if (settings.theme === 'dark') {
            document.body.classList.add('dark-mode');
            this.darkModeBtn.textContent = '☀️';
        } else if (settings.theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark-mode');
                this.darkModeBtn.textContent = '☀️';
            } else {
                document.body.classList.remove('dark-mode');
                this.darkModeBtn.textContent = '🌙';
            }
        }
        
        this.closeSettingsModal();
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        settings.theme = isDark ? 'dark' : 'light';
        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        this.darkModeBtn.textContent = isDark ? '☀️' : '🌙';
    }

    toggleReorderMode() {
        this.reorderMode = !this.reorderMode;
        
        if (this.reorderMode) {
            this.reorderBtn.textContent = '✓ Concluir';
            this.reorderBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            this.addCommandBtn.disabled = true;
        } else {
            this.reorderBtn.textContent = '↕️ Organizar';
            this.reorderBtn.style.background = '';
            this.addCommandBtn.disabled = false;
        }
        
        this.renderCommands();
    }

    formatJsonString(jsonStr) {
        try {
            const parsed = JSON.parse(jsonStr);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            return jsonStr;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleDragStart(e) {
        const target = e.target.closest('.command-item, .list-item');
        this.draggedElement = target;
        this.draggedElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedElement.innerHTML);
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        
        const target = e.target.closest('.command-item, .list-item');
        if (target && target !== this.draggedElement) {
            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            
            if (e.clientY < midpoint) {
                target.classList.add('drag-over-top');
                target.classList.remove('drag-over-bottom');
            } else {
                target.classList.add('drag-over-bottom');
                target.classList.remove('drag-over-top');
            }
        }
        
        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        const target = e.target.closest('.command-item, .list-item');
        if (target && this.draggedElement && target !== this.draggedElement) {
            const draggedIndex = parseInt(this.draggedElement.dataset.index);
            const targetIndex = parseInt(target.dataset.index);
            
            const topicData = this.data[this.currentTopic];
            const items = topicData.items;
            
            // Remover item da posição original
            const [movedItem] = items.splice(draggedIndex, 1);
            
            // Inserir na nova posição
            const rect = target.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            const insertIndex = e.clientY < midpoint ? targetIndex : targetIndex + 1;
            
            items.splice(insertIndex > draggedIndex ? insertIndex - 1 : insertIndex, 0, movedItem);
            
            // Salvar e re-renderizar
            this.saveData();
            this.renderCommands();
        }
        
        return false;
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
        }
        
        // Remover classes de drag over de todos os elementos
        document.querySelectorAll('.command-item, .list-item').forEach(item => {
            item.classList.remove('drag-over-top', 'drag-over-bottom');
        });
        
        this.draggedElement = null;
    }
}

new CommandManager();
