// State
let currentUser = null;
let currentPage = 'dashboard';
let token = localStorage.getItem('token');

// API Helper
const api = async (endpoint, options = {}) => {
    const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });
    
    if (response.status === 401) {
        logout();
        throw new Error('Session expired');
    }
    
    return response.json();
};

// Login
async function login(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            currentUser = data.user;
            await initApp();
            showToast('Login successful!', 'success');
            document.getElementById('loading').style.display = 'none';
        } else {
            showToast(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        showToast('Network error', 'error');
    }
}

// Logout
async function logout() {
    localStorage.removeItem('token');
    token = null;
    currentUser = null;
    showLoginPage();
    showToast('Logged out successfully');
}

// Show Login Page
function showLoginPage() {
    document.getElementById('page-content').innerHTML = `
        <div class="login-container">
            <div class="glass-card" style="max-width: 400px; margin: 100px auto; padding: 40px;">
                <h2 class="neon-text" style="text-align: center;">Welcome Back</h2>
                <form id="login-form">
                    <input type="email" id="email" placeholder="Email" required class="form-input" style="width: 100%; margin: 10px 0; padding: 12px;">
                    <input type="password" id="password" placeholder="Password" required class="form-input" style="width: 100%; margin: 10px 0; padding: 12px;">
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 20px;">Login</button>
                </form>
                <p style="text-align: center; margin-top: 20px;">Demo: admin@awaicyber.com / Admin@123456</p>
            </div>
        </div>
    `;
    
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        login(document.getElementById('email').value, document.getElementById('password').value);
    });
}

// Dashboard
async function renderDashboard() {
    try {
        const metrics = await api('/monitoring/metrics');
        
        document.getElementById('page-content').innerHTML = `
            <h2 class="neon-text">Dashboard</h2>
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                <div class="stat-card">
                    <i class="fas fa-microchip" style="font-size: 32px; color: #00CFFF;"></i>
                    <h3>CPU Usage</h3>
                    <p class="stat-value">${metrics.cpu?.usage?.toFixed(1) || 0}%</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-memory" style="font-size: 32px; color: #8A2BE2;"></i>
                    <h3>RAM Usage</h3>
                    <p class="stat-value">${((metrics.memory?.used || 0) / (1024 ** 3)).toFixed(1)} / ${((metrics.memory?.total || 0) / (1024 ** 3)).toFixed(1)} GB</p>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock" style="font-size: 32px; color: #00FFD5;"></i>
                    <h3>Uptime</h3>
                    <p class="stat-value">${Math.floor(metrics.uptime / 3600)}h ${Math.floor((metrics.uptime % 3600) / 60)}m</p>
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById('page-content').innerHTML = '<p class="error">Failed to load dashboard</p>';
    }
}

// Deployments Page
async function renderDeployments() {
    try {
        const deployments = await api('/deployments');
        
        document.getElementById('page-content').innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2 class="neon-text">Deployments</h2>
                <button class="btn-primary" onclick="showCreateDeployment()"><i class="fas fa-plus"></i> New Deployment</button>
            </div>
            <div id="deployments-list"></div>
        `;
        
        const container = document.getElementById('deployments-list');
        
        if (deployments.length === 0) {
            container.innerHTML = '<div class="glass-card" style="padding: 60px; text-align: center;"><i class="fas fa-cloud-upload-alt" style="font-size: 48px;"></i><h3>No Deployments</h3><p>Create your first deployment to get started</p></div>';
        } else {
            container.innerHTML = deployments.map(d => `
                <div class="glass-card" style="padding: 20px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <i class="fas fa-${d.type === 'nodejs' ? 'node-js' : d.type === 'python' ? 'python' : 'globe'}" style="font-size: 24px; color: #00CFFF;"></i>
                            <strong style="margin-left: 10px;">${d.name}</strong>
                            <span style="margin-left: 10px; padding: 2px 8px; border-radius: 20px; background: ${d.status === 'running' ? 'rgba(0,255,213,0.2)' : 'rgba(255,51,102,0.2)'}; color: ${d.status === 'running' ? '#00FFD5' : '#FF3366'}">${d.status}</span>
                        </div>
                        <div>
                            ${d.status !== 'running' ? `<button class="btn-primary" onclick="startDeployment('${d._id}')" style="padding: 5px 15px;">Start</button>` : `<button onclick="stopDeployment('${d._id}')" style="background: #FF3366; color: white; border: none; padding: 5px 15px; border-radius: 6px; cursor: pointer;">Stop</button>`}
                            <button onclick="deleteDeployment('${d._id}')" style="background: transparent; border: 1px solid #FF3366; color: #FF3366; padding: 5px 15px; border-radius: 6px; cursor: pointer; margin-left: 10px;">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        document.getElementById('page-content').innerHTML = '<p class="error">Failed to load deployments</p>';
    }
}

// File Manager
async function renderFileManager() {
    try {
        const files = await api('/files/list');
        
        document.getElementById('page-content').innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2 class="neon-text">File Manager</h2>
                <div>
                    <button class="btn-primary" onclick="uploadFile()"><i class="fas fa-upload"></i> Upload</button>
                    <button class="btn-primary" onclick="createFolder()" style="margin-left: 10px;"><i class="fas fa-folder-plus"></i> New Folder</button>
                </div>
            </div>
            <div class="glass-card" style="padding: 20px;" id="file-list"></div>
        `;
        
        const container = document.getElementById('file-list');
        
        if (files.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">No files found</p>';
        } else {
            container.innerHTML = files.map(file => `
                <div class="file-item">
                    <i class="fas fa-${file.type === 'directory' ? 'folder' : 'file'}"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${file.type === 'file' ? (file.size / 1024).toFixed(1) + ' KB' : '-'}</span>
                    <button onclick="deleteFile('${file.path}')" style="background: none; border: none; color: #FF3366; cursor: pointer;"><i class="fas fa-trash"></i></button>
                </div>
            `).join('');
        }
    } catch (error) {
        document.getElementById('page-content').innerHTML = '<p class="error">Failed to load files</p>';
    }
}

// Terminal
function renderTerminal() {
    document.getElementById('page-content').innerHTML = `
        <h2 class="neon-text">Terminal</h2>
        <div class="glass-card" style="padding: 20px; margin-top: 20px;">
            <div class="terminal" id="terminal-output">
                <div>Welcome to AWAIS CYBER VPS Terminal</div>
                <div>Type commands below to execute</div>
                <div>$ </div>
            </div>
            <div style="margin-top: 10px; display: flex;">
                <span style="color: #00FF00;">$&nbsp;</span>
                <input type="text" id="terminal-input" class="terminal-input" placeholder="Enter command..." autofocus>
            </div>
        </div>
    `;
    
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const command = input.value;
            output.innerHTML += `<div>$ ${command}</div>`;
            input.value = '';
            
            try {
                const result = await api('/terminal/command', {
                    method: 'POST',
                    body: JSON.stringify({ command })
                });
                output.innerHTML += `<div>${result.output || result.error || 'Command executed'}</div>`;
                output.scrollTop = output.scrollHeight;
            } catch (error) {
                output.innerHTML += `<div style="color: #FF3366;">Error: ${error.message}</div>`;
            }
        }
    });
}

// Helper Functions
window.showCreateDeployment = () => {
    const name = prompt('Enter deployment name:');
    const type = prompt('Enter type (nodejs/python/static):');
    if (name && type) createDeployment(name, type);
};

async function createDeployment(name, type) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    
    await fetch('/api/deployments', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    
    showToast('Deployment created');
    renderDeployments();
}

async function startDeployment(id) {
    await api(`/deployments/${id}/start`, { method: 'PUT' });
    showToast('Deployment started');
    renderDeployments();
}

async function stopDeployment(id) {
    await api(`/deployments/${id}/stop`, { method: 'PUT' });
    showToast('Deployment stopped');
    renderDeployments();
}

async function deleteDeployment(id) {
    if (confirm('Are you sure?')) {
        await api(`/deployments/${id}`, { method: 'DELETE' });
        showToast('Deployment deleted');
        renderDeployments();
    }
}

async function uploadFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        
        await fetch('/api/files/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        showToast('File uploaded');
        renderFileManager();
    };
    input.click();
}

async function createFolder() {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        await api('/files/folder', {
            method: 'POST',
            body: JSON.stringify({ folderName })
        });
        showToast('Folder created');
        renderFileManager();
    }
}

async function deleteFile(path) {
    if (confirm('Delete this file?')) {
        await api('/files', {
            method: 'DELETE',
            body: JSON.stringify({ path })
        });
        showToast('Deleted');
        renderFileManager();
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; padding: 12px 24px;
        background: ${type === 'success' ? '#00FFD5' : '#FF3366'};
        color: #0B0F19; border-radius: 8px; z-index: 9999;
        font-weight: 600; animation: fadeInUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Navigation
const pages = {
    dashboard: renderDashboard,
    deployments: renderDeployments,
    files: renderFileManager,
    terminal: renderTerminal,
    databases: () => { document.getElementById('page-content').innerHTML = '<h2>Databases (Coming Soon)</h2>'; },
    domains: () => { document.getElementById('page-content').innerHTML = '<h2>Domains (Coming Soon)</h2>'; },
    admin: () => { document.getElementById('page-content').innerHTML = '<h2>Admin Panel (Coming Soon)</h2>'; }
};

async function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) item.classList.add('active');
    });
    
    if (pages[page]) await pages[page]();
}

// Initialize App
async function initApp() {
    document.getElementById('user-name').innerText = currentUser?.fullName || currentUser?.username;
    
    // Show admin menu if admin
    if (currentUser?.role === 'admin') {
        document.getElementById('admin-menu').style.display = 'flex';
    }
    
    await navigateTo('dashboard');
    
    // Setup event listeners
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
        document.getElementById('main-content').classList.toggle('sidebar-open');
    });
    
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', () => navigateTo(item.dataset.page));
    });
}

// Check authentication
if (token) {
    try {
        const user = await api('/auth/profile');
        currentUser = user;
        await initApp();
        document.getElementById('loading').style.display = 'none';
    } catch (error) {
        showLoginPage();
        document.getElementById('loading').style.display = 'none';
    }
} else {
    showLoginPage();
    document.getElementById('loading').style.display = 'none';
}

// Maintenance check
async function checkMaintenance() {
    try {
        await fetch('/');
        document.getElementById('maintenance-modal').classList.remove('active');
        showToast('Server is online', 'success');
    } catch (error) {
        showToast('Server is still offline', 'error');
    }
}

setInterval(async () => {
    try {
        await fetch('/');
        document.getElementById('maintenance-modal').classList.remove('active');
    } catch (error) {
        document.getElementById('maintenance-modal').classList.add('active');
    }
}, 30000);
