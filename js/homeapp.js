(function() {
    'use strict';

    // ===== 获取 Toast 元素 =====
    const toastEl = document.getElementById('toast');
    let toastTimer = null;

    /**
     * 显示 Toast 提示
     * @param {string} msg      - 提示内容
     * @param {string} type     - 类型: 'info' | 'success' | 'error'
     * @param {number} duration - 显示时长 (毫秒)
     */
    function showToast(msg, type, duration) {
    // ===== 价格图片弹窗 =====
    window.showPriceInfo = function() {
        document.getElementById('priceModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closePriceModal = function() {
        document.getElementById('priceModal').classList.remove('active');
        document.body.style.overflow = '';
    };

    // ESC 键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            var modal = document.getElementById('priceModal');
            if (modal.classList.contains('active')) {
                window.closePriceModal();
            }
        }
    });

    // ===== 使用帮助 (保留 Toast) =====
    window.showHelpInfo = function() {
        showToast('📖 操作指南：填写微信号 → 选择文件 → 提交订单', 'info', 3000);
    };
    }

    // ===== 暴露全局方法供 HTML 调用 =====
    window.showPriceInfo = function() {
        showToast('💰 收费标准：按文件数量计费，具体请咨询客服', 'info', 3000);
    };

    window.showHelpInfo = function() {
        showToast('📖 操作指南：填写微信号 → 选择文件 → 提交订单', 'info', 3000);
    };

    // ===== 可选：页面加载完成后自动执行一些初始化 =====
    document.addEventListener('DOMContentLoaded', function() {
        // 如果有需要初始化的逻辑，可以在这里添加
        console.log('📋 订单上传系统已加载');
    });

})();