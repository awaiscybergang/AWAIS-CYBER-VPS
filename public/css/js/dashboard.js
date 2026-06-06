// public/js/dashboard.js
let metricsChart = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    startRealTimeUpdates();
    setupEventListeners();
});

function initializeDashboard() {
    loadSystemMetrics();
    initializeCharts();
    loadRecentDeployments();
    loadSystemLogs();
}

function setupEventListeners() {
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        loadSystemMetrics();
        showToast('Refreshing metrics...', 'info');
    });
}

function loadSystemMetrics() {
    fetch('/api/monitoring/metrics', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        updateMetricsDisplay(data);
        updateCharts(data);
    })
    .catch(error => {
        console.error('Error loading metrics:', error);
        showToast('Failed to load metrics', 'error');
    });
}

function updateMetricsDisplay(metrics) {
    // Update CPU
    document.getElementById('cpu-usage').textContent = `${metrics.cpu?.usage?.toFixed(1) || 0}%`;
    document.getElementById('cpu-bar').style.width = `${metrics.cpu?.usage || 0}%`;
    
    // Update RAM
    const ramUsedGB = (metrics.memory?.used / (1024 ** 3)).toFixed(1);
    const ramTotalGB = (metrics.memory?.total / (1024 ** 3)).toFixed(1);
    document.getElementById('ram-usage').textContent = `${ramUsedGB} / ${ramTotalGB} GB`;
    document.getElementById('ram-bar').style.width = `${metrics.memory?.usagePercent || 0}%`;
    
    // Update Storage
    const storageUsedGB = (metrics.disk?.[0]?.used / (1024 ** 3)).toFixed(1);
    const storageTotalGB = (metrics.disk?.[0]?.total / (1024 ** 3)).toFixed(1);
    document.getElementById('storage-usage').textContent = `${storageUsedGB} / ${storageTotalGB} GB`;
    document.getElementById('storage-bar').style.width = `${metrics.disk?.[0]?.usagePercent || 0}%`;
    
    // Update Network
    document.getElementById('network-rx').textContent = formatBytes(metrics.network?.traffic?.rxSpeed || 0);
    document.getElementById('network-tx').textContent = formatBytes(metrics.network?.traffic?.txSpeed || 0);
    
    // Update Uptime
    document.getElementById('uptime').textContent = formatUptime(metrics.uptime?.system || 0);
    
    // Update Health Status
    const healthStatus = document.getElementById('health-status');
    if (metrics.health?.status === 'healthy') {
        healthStatus.textContent = '✓ All Systems Operational';
        healthStatus.style.color = '#00FFD5';
    } else if (metrics.health?.status === 'warning') {
        healthStatus.textContent = '⚠ Some Issues Detected';
        healthStatus.style.color = '#FFB800';
    } else {
        healthStatus.textContent = '🔴 System Critical';
        healthStatus.style.color = '#FF3366';
    }
}

function initializeCharts() {
    const ctx = document.getElementById('metrics-chart').getContext('2d');
    metricsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'CPU Usage %',
                    data: [],
                    borderColor: '#00CFFF',
                    backgroundColor: 'rgba(0, 207, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Memory Usage %',
                    data: [],
                    borderColor: '#8A2BE2',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

function updateCharts(metrics) {
    if (!metricsChart) return;
    
    const now = new Date().toLocaleTimeString();
    
    if (metricsChart.data.labels.length > 20) {
        metricsChart.data.labels.shift();
        metricsChart.data.datasets[0].data.shift();
        metricsChart.data.datasets[1].data.shift();
    }
    
    metricsChart.data.labels.push(now);
    metricsChart.data.datasets[0].data.push(metrics.cpu?.usage || 0);
    metricsChart.data.datasets[1].data.push(metrics.memory?.usagePercent || 0);
    
    metricsChart.update();
}

function loadRecentDeployments() {
    fetch('/api/deployments', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => res.json())
    .then(deployments => {
        const container = document.getElementById('recent-deployments');
        if (!container) return;
        
        if (deployments.length === 0) {
            container.innerHTML = '<p class="text-center">No deployments yet. Create your first deployment!</p>';
            return;
        }
        
        container.innerHTML = deployments.slice(0, 5).map(d => `
            <div class="deployment-item">
                <div class="deployment-info">
                    <strong>${d.name}</strong>
                    <small>${d.type}</small>
                </div>
                <div class="deployment-status">
                    <span class="status-badge status-${d.status}">${d.status}</span>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error loading deployments:', error);
    });
}

function loadSystemLogs() {
    fetch('/api/monitoring/logs?limit=10', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        const container = document.getElementById('system-logs');
        if (!container) return;
        
        if (!data.logs || data.logs.length === 0) {
            container.innerHTML = '<p class="text-center">No logs available</p>';
            return;
        }
        
        container.innerHTML = data.logs.map(log => `
            <div class="log-entry log-${log.type}">
                <span class="log-time">${new Date(log.createdAt).toLocaleTimeString()}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error loading logs:', error);
    });
}

function startRealTimeUpdates() {
    const socket = io({
        auth: {
            token: localStorage.getItem('token')
        }
    });
    
    socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('join-monitoring');
    });
    
    socket.on('metrics-update', (metrics) => {
        updateMetricsDisplay(metrics);
        updateCharts(metrics);
    });
    
    socket.on('deployment-update', (data) => {
        showToast(`Deployment ${data.name}: ${data.status}`, 'info');
        loadRecentDeployments();
    });
    
    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#00FFD5' : type === 'error' ? '#FF3366' : '#FFB800'};
        color: #0B0F19;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
