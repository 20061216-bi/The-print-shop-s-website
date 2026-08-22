// ============================================
// 订单页面 JavaScript
// ============================================

(function() {
    'use strict';

    // DOM 元素缓存
    const toastEl = document.getElementById('toast');
    const listEl = document.getElementById('orderList');
    const statsRow = document.getElementById('statsRow');
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalFilesEl = document.getElementById('totalFiles');
    const pendingCountEl = document.getElementById('pendingCount');

    // 状态变量
    let toastTimer = null;
    let currentWechat = '';

    // ============================================
    // Toast 提示
    // ============================================
    function showToast(msg, type, duration) {
        type = type || 'info';
        duration = duration || 2500;
        toastEl.textContent = msg;
        toastEl.className = 'toast ' + type;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
        requestAnimationFrame(() => toastEl.classList.add('show'));
    }

    // ============================================
    // 工具函数
    // ============================================
    function formatSize(bytes) {
        if (!bytes) return '0';
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }

    function getStatusText(status) {
        const map = {
            '待处理': '<span class="status pending">⏳ 待处理</span>',
            '处理中': '<span class="status processing">🔄 处理中</span>',
            '已完成': '<span class="status completed">✅ 已完成</span>',
            '已取消': '<span class="status cancelled">❌ 已取消</span>'
        };
        return map[status] || status;
    }

    function getStatusClass(status) {
        const map = {
            '待处理': 'pending',
            '处理中': 'processing',
            '已完成': 'completed',
            '已取消': 'cancelled'
        };
        return map[status] || '';
    }

    // ============================================
    // 从URL获取微信号
    // ============================================
    function getWechatFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('wechat') || '';
    }

    // ============================================
    // 检测是否在本地环境 (file:// 协议)
    // ============================================
    function isLocalFile() {
        return window.location.protocol === 'file:';
    }

    // ============================================
    // 加载订单数据
    // ============================================
    function loadOrders(wechat) {
        listEl.innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:10px;">加载中...</p></div>';

        // 如果是本地文件，使用模拟数据
        if (isLocalFile()) {
            console.log('本地环境，使用模拟数据');
            // 模拟延迟，展示加载效果
            setTimeout(() => {
                renderOrders(getMockData(wechat));
            }, 500);
            return;
        }

        fetch('/api/orders/' + encodeURIComponent(wechat))
            .then(res => res.json())
            .then(data => {
                if (data.code === 200) {
                    renderOrders(data.data);
                } else {
                    listEl.innerHTML = '<div class="empty"><span class="icon">⚠️</span><p>加载失败</p></div>';
                    statsRow.style.display = 'none';
                }
            })
            .catch(() => {
                listEl.innerHTML = '<div class="empty"><span class="icon">⚠️</span><p>网络错误，请重试</p></div>';
                statsRow.style.display = 'none';
            });
    }

    // ============================================
    // 模拟数据（本地调试用）
    // ============================================
    function getMockData(wechat) {
        return [
            {
                order_id: 'ORD-2026-001',
                wechat: wechat || 'test_user',
                status: '待处理',
                file_count: 3,
                total_size: 2048576,
                created_at: '2026-08-22 10:30',
                remark: '请帮忙处理这些文件，谢谢！'
            },
            {
                order_id: 'ORD-2026-002',
                wechat: wechat || 'test_user',
                status: '处理中',
                file_count: 2,
                total_size: 1048576,
                created_at: '2026-08-22 09:15',
                remark: ''
            },
            {
                order_id: 'ORD-2026-003',
                wechat: wechat || 'test_user',
                status: '已完成',
                file_count: 5,
                total_size: 5242880,
                created_at: '2026-08-21 16:45',
                remark: '已完成，请查收'
            },
            {
                order_id: 'ORD-2026-004',
                wechat: wechat || 'test_user',
                status: '已取消',
                file_count: 1,
                total_size: 102400,
                created_at: '2026-08-21 14:20',
                remark: '用户取消'
            }
        ];
    }

    // ============================================
    // 渲染订单列表
    // ============================================
    function renderOrders(orders) {
        if (!orders || orders.length === 0) {
            listEl.innerHTML = '<div class="empty"><span class="icon">📭</span><p>暂无历史订单</p></div>';
            statsRow.style.display = 'none';
            return;
        }

        statsRow.style.display = 'flex';

        let totalFiles = 0;
        let pendingCount = 0;

        let html = '<div class="order-list">';
        orders.forEach(order => {
            totalFiles += order.file_count || 0;
            if (order.status === '待处理') pendingCount++;

            const statusHtml = getStatusText(order.status);

            html += `
                    <div class="order-card">
                        <div class="top">
                            <span class="order-id">#${order.order_id}</span>
                            ${statusHtml}
                        </div>
                        <div class="info">
                            <span>📄 ${order.file_count || 0} 个文件</span>
                            <span>📦 ${formatSize(order.total_size || 0)}</span>
                            <span>🕐 ${order.created_at || '未知'}</span>
                        </div>
                        ${order.remark ? `<div class="remark">📝 ${order.remark}</div>` : ''}
                    </div>
                `;
        });
        html += '</div>';
        listEl.innerHTML = html;

        totalOrdersEl.textContent = orders.length;
        totalFilesEl.textContent = totalFiles;
        pendingCountEl.textContent = pendingCount;
    }

    // ============================================
    // 检查登录状态并跳转（仅在服务器环境）
    // ============================================
    function checkLoginAndRedirect() {
        // 本地文件环境，不跳转，使用模拟数据
        if (isLocalFile()) {
            console.log('本地文件环境，跳过登录检查');
            // 使用URL中的wechat参数，如果没有则使用默认值
            const wechat = getWechatFromUrl() || 'test_user';
            userNameEl.textContent = wechat;
            userAvatarEl.textContent = wechat.charAt(0).toUpperCase();
            loadOrders(wechat);
            return;
        }

        fetch('/api/check')
            .then(res => res.json())
            .then(data => {
                if (data.logged_in && data.wechat) {
                    window.location.href = '/orders?wechat=' + encodeURIComponent(data.wechat);
                } else {
                    window.location.href = '/login';
                }
            })
            .catch(() => {
                window.location.href = '/login';
            });
    }

    // ============================================
    // 初始化页面
    // ============================================
    function init() {
        const wechat = getWechatFromUrl();

        // 本地文件环境，直接使用URL参数或默认值
        if (isLocalFile()) {
            const displayWechat = wechat || 'test_user';
            userNameEl.textContent = displayWechat;
            userAvatarEl.textContent = displayWechat.charAt(0).toUpperCase();
            loadOrders(displayWechat);
            return;
        }

        // 服务器环境
        if (wechat) {
            currentWechat = wechat;
            userNameEl.textContent = wechat;
            userAvatarEl.textContent = wechat.charAt(0).toUpperCase();
            loadOrders(wechat);
        } else {
            checkLoginAndRedirect();
        }
    }

    // ============================================
    // DOM 加载完成后执行
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露函数供全局使用（如果需要）
    window.OrdersApp = {
        loadOrders: loadOrders,
        renderOrders: renderOrders,
        showToast: showToast,
        formatSize: formatSize,
        getMockData: getMockData,
        isLocalFile: isLocalFile
    };

})();