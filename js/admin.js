// ============================================
// 全局变量
// ============================================
let toastTimer = null;
let isSettingPassword = false;

// ============================================
// Toast 提示
// ============================================
function showToast(msg, type, duration) {
    type = type || 'info';
    duration = duration || 2500;
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = 'toast ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration);
    requestAnimationFrame(() => el.classList.add('show'));
}

// ============================================
// 工具函数
// ============================================
function formatSize(bytes) {
    if (!bytes) return '0';
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
}

function getFileIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    const map = {
        'doc': '📄', 'docx': '📄',
        'ppt': '📽️', 'pptx': '📽️',
        'xls': '📊', 'xlsx': '📊',
        'pdf': '📕',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
        'txt': '📝', 'md': '📝'
    };
    return map[ext] || '📎';
}

function getStatusBadge(status) {
    const map = {
        '待处理': '<span class="status-badge pending">⏳ 待处理</span>',
        '处理中': '<span class="status-badge processing">🔄 处理中</span>',
        '已完成': '<span class="status-badge completed">✅ 已完成</span>',
        '已取消': '<span class="status-badge cancelled">❌ 已取消</span>'
    };
    return map[status] || status;
}

function getBorderClass(status) {
    const map = {
        '待处理': 'pending',
        '处理中': 'processing',
        '已完成': 'completed',
        '已取消': 'cancelled'
    };
    return map[status] || '';
}

// ============================================
// 登录相关
// ============================================
function handleLogin() {
    const pwd = document.getElementById('passwordInput').value;
    const confirmPwd = document.getElementById('confirmInput').value;
    const errorEl = document.getElementById('loginError');

    if (isSettingPassword) {
        if (pwd.length < 4) {
            errorEl.textContent = '密码至少4位';
            errorEl.style.display = 'block';
            return;
        }
        if (pwd !== confirmPwd) {
            errorEl.textContent = '两次密码不一致';
            errorEl.style.display = 'block';
            return;
        }
        errorEl.style.display = 'none';

        fetch('/admin/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        })
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    showToast('✅ 密码设置成功！', 'success', 1500);
                    isSettingPassword = false;
                    document.getElementById('loginTitle').textContent = '🔐 管理后台';
                    document.getElementById('loginDesc').textContent = '请输入密码进入后台';
                    document.getElementById('loginSub').textContent = '';
                    document.getElementById('loginHint').textContent = '输入密码登录';
                    document.getElementById('confirmInput').style.display = 'none';
                    document.getElementById('loginBtn').textContent = '登录';
                    document.getElementById('passwordInput').value = '';
                    document.getElementById('passwordInput').placeholder = '请输入密码';
                    handleLogin();
                } else {
                    errorEl.textContent = data.message || '设置失败';
                    errorEl.style.display = 'block';
                }
            })
            .catch(() => {
                errorEl.textContent = '网络错误';
                errorEl.style.display = 'block';
            });
        return;
    }

    errorEl.style.display = 'none';

    fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd })
    })
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                loadOrders();
                loadStats();
            } else {
                errorEl.textContent = data.message || '密码错误';
                errorEl.style.display = 'block';
                document.getElementById('passwordInput').value = '';
                document.getElementById('passwordInput').focus();
            }
        })
        .catch(() => {
            errorEl.textContent = '网络错误';
            errorEl.style.display = 'block';
        });
}

function logout() {
    fetch('/admin/logout', { method: 'POST' })
        .then(() => {
            document.getElementById('loginOverlay').style.display = 'flex';
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('passwordInput').value = '';
            document.getElementById('loginError').style.display = 'none';
        });
}

// ============================================
// 数据加载
// ============================================
function loadStats() {
    fetch('/admin/orders/stats')
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                const s = data.data;
                document.getElementById('totalOrders').textContent = s.total_orders || 0;
                document.getElementById('totalFiles').textContent = s.total_files || 0;
                document.getElementById('totalSize').textContent = formatSize(s.total_size || 0);
                document.getElementById('pendingOrders').textContent = s.pending_orders || 0;
            }
        })
        .catch(err => console.error('加载统计失败:', err));
}

function loadOrders() {
    const listEl = document.getElementById('orderList');
    listEl.innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:12px;">加载中...</p></div>';

    fetch('/admin/orders')
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                renderOrders(data.data);
                loadStats();
            } else {
                listEl.innerHTML = `<div class="empty"><span class="icon">⚠️</span><p>${data.message}</p></div>`;
            }
        })
        .catch(err => {
            listEl.innerHTML = `<div class="empty"><span class="icon">⚠️</span><p>加载失败: ${err.message}</p></div>`;
        });
}

function searchOrders() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (!keyword) {
        loadOrders();
        return;
    }
    const listEl = document.getElementById('orderList');
    listEl.innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:12px;">搜索中...</p></div>';

    fetch('/admin/orders/search?keyword=' + encodeURIComponent(keyword))
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                renderOrders(data.data);
            } else {
                listEl.innerHTML = `<div class="empty"><span class="icon">⚠️</span><p>${data.message}</p></div>`;
            }
        })
        .catch(err => {
            listEl.innerHTML = `<div class="empty"><span class="icon">⚠️</span><p>搜索失败: ${err.message}</p></div>`;
        });
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadOrders();
}

// ============================================
// 渲染订单
// ============================================
function renderOrders(orders) {
    const listEl = document.getElementById('orderList');
    const countEl = document.getElementById('orderCount');

    if (!orders || orders.length === 0) {
        listEl.innerHTML = `<div class="empty"><span class="icon">📭</span><p>暂无订单</p></div>`;
        countEl.textContent = '0 个订单';
        document.getElementById('totalOrders').textContent = '0';
        document.getElementById('totalFiles').textContent = '0';
        document.getElementById('totalSize').textContent = '0';
        document.getElementById('pendingOrders').textContent = '0';
        return;
    }

    countEl.textContent = orders.length + ' 个订单';
    document.getElementById('totalOrders').textContent = orders.length;

    let totalFiles = 0;
    let totalSize = 0;
    let pendingCount = 0;

    let html = '<div class="order-grid">';
    orders.forEach(order => {
        const fileCount = order.files ? order.files.length : 0;
        totalFiles += fileCount;
        if (order.total_size) totalSize += order.total_size;
        if (order.status === '待处理') pendingCount++;

        const status = order.status || '待处理';
        const borderClass = getBorderClass(status);

        let filesHtml = '';
        if (order.files && order.files.length > 0) {
            order.files.forEach(f => {
                const icon = getFileIcon(f);
                const downloadUrl = `/admin/download/${encodeURIComponent(order.wechat)}/${encodeURIComponent(f)}`;
                filesHtml += `<span class="file-tag">${icon} <a href="${downloadUrl}" target="_blank">${f}</a></span>`;
            });
        }

        let remarkHtml = '';
        if (order.remark && order.remark.trim()) {
            remarkHtml = `<div class="remark-content">${order.remark}</div>`;
        }

        html += `
                <div class="order-card">
                    <div class="border-status ${borderClass}"></div>
                    <div class="info">
                        <div class="order-id">
                            #${order.order_id || 'N/A'}
                            <span class="tag">${getStatusBadge(status)}</span>
                        </div>
                        <div class="wechat"><span class="icon">💬</span> ${order.wechat}</div>
                        <div class="meta">
                            <span>📄 ${fileCount} 个文件</span>
                            <span>📦 ${formatSize(order.total_size || 0)}</span>
                            <span>🕐 ${order.created_at || '未知时间'}</span>
                        </div>
                        <div class="files-list">${filesHtml}</div>
                        ${remarkHtml}
                    </div>
                    <div class="actions">
                        ${status !== '已完成' ? `<button class="btn btn-success btn-sm" onclick="markComplete('${order.order_id}')">✅ 完成</button>` : ''}
                        <button class="btn btn-warning btn-sm" onclick="markProcessing('${order.order_id}')">🔄 处理中</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.wechat}')">🗑 删除</button>
                    </div>
                </div>
            `;
    });
    html += '</div>';
    listEl.innerHTML = html;

    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('totalSize').textContent = formatSize(totalSize);
    document.getElementById('pendingOrders').textContent = pendingCount;
}

// ============================================
// 订单操作
// ============================================
function markComplete(orderId) {
    if (!confirm(`确定将订单「${orderId}」标记为已完成吗？`)) return;
    updateStatus(orderId, '已完成');
}

function markProcessing(orderId) {
    if (!confirm(`确定将订单「${orderId}」标记为处理中吗？`)) return;
    updateStatus(orderId, '处理中');
}

function updateStatus(orderId, status) {
    fetch('/admin/orders/' + orderId + '/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status })
    })
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                showToast('✅ ' + data.message, 'success', 2000);
                loadOrders();
            } else {
                showToast('❌ ' + data.message, 'error', 2500);
            }
        })
        .catch(err => {
            showToast('❌ 操作失败: ' + err.message, 'error', 2500);
        });
}

function deleteOrder(wechat) {
    if (!confirm(`确定要删除「${wechat}」的所有订单吗？`)) return;

    fetch('/admin/delete/' + encodeURIComponent(wechat), { method: 'DELETE' })
        .then(res => res.json())
        .then(data => {
            if (data.code === 200) {
                showToast('✅ 已删除', 'success', 2000);
                loadOrders();
            } else {
                showToast('❌ ' + data.message, 'error', 2500);
            }
        })
        .catch(err => {
            showToast('❌ 删除失败: ' + err.message, 'error', 2500);
        });
}

// ============================================
// 事件绑定 (在DOM加载完成后执行)
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', handleLogin);

    // 刷新按钮
    document.getElementById('refreshBtn').addEventListener('click', loadOrders);

    // 退出按钮
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // 搜索按钮
    document.getElementById('searchBtn').addEventListener('click', searchOrders);

    // 清空按钮
    document.getElementById('clearBtn').addEventListener('click', clearSearch);

    // Enter键事件
    document.getElementById('passwordInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('confirmInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') searchOrders();
    });

    // ============================================
    // 检查登录状态 (页面加载时自动执行)
    // ============================================
    fetch('/admin/status')
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                document.getElementById('loginOverlay').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                loadOrders();
                loadStats();
                return;
            }

            if (!data.has_password) {
                isSettingPassword = true;
                document.getElementById('loginTitle').textContent = '🔐 首次设置密码';
                document.getElementById('loginDesc').textContent = '请设置管理员密码';
                document.getElementById('loginSub').textContent = '密码至少4位';
                document.getElementById('loginHint').textContent = '设置后请牢记此密码';
                document.getElementById('confirmInput').style.display = 'block';
                document.getElementById('loginBtn').textContent = '设置密码';
                document.getElementById('passwordInput').placeholder = '请输入密码';
                document.getElementById('passwordInput').value = '';
                document.getElementById('confirmInput').value = '';
            } else {
                isSettingPassword = false;
                document.getElementById('loginTitle').textContent = '🔐 管理后台';
                document.getElementById('loginDesc').textContent = '请输入密码进入后台';
                document.getElementById('loginSub').textContent = '';
                document.getElementById('loginHint').textContent = '输入密码登录';
                document.getElementById('confirmInput').style.display = 'none';
                document.getElementById('loginBtn').textContent = '登录';
                document.getElementById('passwordInput').placeholder = '请输入密码';
                document.getElementById('passwordInput').value = '';
            }
        });

    // 每60秒自动刷新
    setInterval(() => {
        if (document.getElementById('mainContent').style.display !== 'none') {
            loadOrders();
        }
    }, 60000);
});