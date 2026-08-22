/**
 * ============================================================
 * 订单上传系统 - 首页交互脚本
 * 功能：Toast 提示、价格弹窗、管理订单弹窗、使用帮助弹窗
 * ============================================================
 */

(function() {
    'use strict';

    // ==========================================================
    // 1. Toast 提示组件
    // ==========================================================

    /** Toast 元素 */
    const toastEl = document.getElementById('toast');
    /** Toast 定时器 */
    let toastTimer = null;

    /**
     * 显示 Toast 提示（底部弹出，自动消失）
     * @param {string} msg      - 提示内容
     * @param {string} type     - 类型: 'info' | 'success' | 'error'（可选）
     * @param {number} duration - 显示时长，单位毫秒，默认 2500ms
     */
    function showToast(msg, type, duration) {
        // 如果页面没有 Toast 元素，直接返回
        if (!toastEl) return;

        // 清除之前的定时器，防止重叠
        if (toastTimer) {
            clearTimeout(toastTimer);
            toastTimer = null;
        }

        // 设置提示文字
        toastEl.textContent = msg;
        // 重置样式（清除之前的状态）
        toastEl.className = 'toast';
        // 如果有类型，加上对应的样式（如 success 变绿色）
        if (type) {
            toastEl.classList.add(type);
        }

        /**
         * 强制浏览器回流（重排）
         * 确保 class 重置后立即触发动画
         * void + 读取 offsetWidth 是常用技巧
         */
        void toastEl.offsetWidth;
        // 显示 Toast（添加 show 类触发入场动画）
        toastEl.classList.add('show');

        // 设置定时器，自动隐藏
        toastTimer = setTimeout(function() {
            toastEl.classList.remove('show');
            toastTimer = null;
        }, duration || 2500);
    }


    // ==========================================================
    // 2. 弹窗控制函数（暴露给 HTML 的 onclick 调用）
    // ==========================================================

    // ---- 2.1 价格弹窗 ----

    /**
     * 打开价格弹窗
     * 在 HTML 中通过 onclick="showPriceInfo()" 调用
     */
    window.showPriceInfo = function() {
        const modal = document.getElementById('priceModal');
        if (modal) {
            modal.classList.add('active');              // 显示弹窗
            document.body.style.overflow = 'hidden';    // 禁止页面滚动（防穿透）
        }
    };

    /**
     * 关闭价格弹窗
     * 在 HTML 中通过 onclick="closePriceModal()" 调用
     */
    window.closePriceModal = function() {
        const modal = document.getElementById('priceModal');
        if (modal) {
            modal.classList.remove('active');           // 隐藏弹窗
            document.body.style.overflow = '';          // 恢复页面滚动
        }
    };


    // ---- 2.2 管理订单弹窗（客服电话） ----

    /**
     * 打开管理订单弹窗
     * 在 HTML 中通过 onclick="showServiceInfo()" 调用
     */
    window.showServiceInfo = function() {
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    /**
     * 关闭管理订单弹窗
     * 在 HTML 中通过 onclick="closeServiceModal()" 调用
     */
    window.closeServiceModal = function() {
        const modal = document.getElementById('serviceModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };


    // ---- 2.3 使用帮助弹窗 ----

    /**
     * 打开使用帮助弹窗
     * 在 HTML 中通过 onclick="showHelpInfo()" 调用
     */
    window.showHelpInfo = function() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    /**
     * 关闭使用帮助弹窗
     * 在 HTML 中通过 onclick="closeHelpModal()" 调用
     */
    window.closeHelpModal = function() {
        const modal = document.getElementById('helpModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };


    // ==========================================================
    // 3. 键盘快捷键：ESC 键关闭弹窗
    // ==========================================================

    /**
     * 监听键盘事件
     * 用户按 ESC 键时，如果有弹窗打开，自动关闭
     */
    document.addEventListener('keydown', function(e) {
        // 只处理 ESC 键（键码 27）
        if (e.key === 'Escape') {

            // 检查价格弹窗是否打开
            const priceModal = document.getElementById('priceModal');
            if (priceModal && priceModal.classList.contains('active')) {
                window.closePriceModal();
                return;
            }

            // 检查帮助弹窗是否打开
            const helpModal = document.getElementById('helpModal');
            if (helpModal && helpModal.classList.contains('active')) {
                window.closeHelpModal();
                return;
            }

            // 检查管理订单弹窗是否打开
            const serviceModal = document.getElementById('serviceModal');
            if (serviceModal && serviceModal.classList.contains('active')) {
                window.closeServiceModal();
                return;
            }
        }
    });


    // ==========================================================
    // 4. 页面初始化（DOM 加载完成后执行）
    // ==========================================================

    document.addEventListener('DOMContentLoaded', function() {

        // ---- 4.1 客服弹窗（如果有需要，可启用） ----
        // 注意：目前首页没有使用客服弹窗，但代码已准备好
        // 如果有按钮需要打开客服弹窗，可取消注释并添加对应 HTML

        // const openBtn = document.getElementById('openModalBtn');
        // const modal = document.getElementById('serviceModal');
        // const closeBtn = document.getElementById('closeModalBtn');

        // if (openBtn && modal) {
        //     openBtn.addEventListener('click', function() {
        //         modal.classList.add('active');
        //         document.body.style.overflow = 'hidden';
        //     });
        // }

        // if (closeBtn && modal) {
        //     closeBtn.addEventListener('click', function() {
        //         modal.classList.remove('active');
        //         document.body.style.overflow = '';
        //     });
        // }

        // if (modal) {
        //     modal.addEventListener('click', function(e) {
        //         // 点击遮罩背景（不是内容区）时关闭弹窗
        //         if (e.target === modal) {
        //             modal.classList.remove('active');
        //             document.body.style.overflow = '';
        //         }
        //     });
        // }

        // 控制台输出，表示脚本已加载成功
        console.log('📋 订单上传系统已加载');
    });

})();