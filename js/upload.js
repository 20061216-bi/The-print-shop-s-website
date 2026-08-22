// ============================================
// 订单上传页面 JavaScript
// ============================================

(function() {
    'use strict';

    // ============================================
    // DOM 元素缓存
    // ============================================
    const formSection = document.getElementById('formSection');
    const successScreen = document.getElementById('successScreen');
    const wechatId = document.getElementById('wechatId');
    const remark = document.getElementById('remark');
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const fileList = document.getElementById('fileList');
    const submitBtn = document.getElementById('submitBtn');
    const newUploadBtn = document.getElementById('newUploadBtn');
    const toastEl = document.getElementById('toast');

    // ============================================
    // 状态变量
    // ============================================
    let selectedFiles = [];
    let isSubmitting = false;
    let toastTimer = null;

    // ============================================
    // Toast 提示
    // ============================================
    function showToast(msg, type, duration) {
        type = type || 'info';
        duration = duration || 2500;
        toastEl.textContent = msg;
        toastEl.className = 'toast ' + type;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            toastEl.classList.remove('show');
        }, duration);
        requestAnimationFrame(function() {
            toastEl.classList.add('show');
        });
    }

    // ============================================
    // 工具函数
    // ============================================
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + 'B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
        return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
    }

    function getFileIcon(name) {
        var ext = name.split('.').pop().toLowerCase();
        var map = {
            'doc': '📄',
            'docx': '📄',
            'ppt': '📽️',
            'pptx': '📽️',
            'xls': '📊',
            'xlsx': '📊',
            'pdf': '📕'
        };
        return map[ext] || '📎';
    }

    // ============================================
    // 检测是否在本地环境 (file:// 协议)
    // ============================================
    function isLocalFile() {
        return window.location.protocol === 'file:';
    }

    // ============================================
    // 渲染文件列表
    // ============================================
    function renderFileList() {
        if (selectedFiles.length === 0) {
            fileList.innerHTML = '';
            return;
        }
        var html = '';
        selectedFiles.forEach(function(file, i) {
            html += `
                    <div class="file-item">
                        <span class="file-icon">${getFileIcon(file.name)}</span>
                        <div class="file-info">
                            <span class="file-name">${file.name}</span>
                            <span class="file-size">${formatSize(file.size)}</span>
                        </div>
                        <button class="file-remove" data-index="${i}">✕</button>
                    </div>
                `;
        });
        fileList.innerHTML = html;

        // 绑定删除事件
        document.querySelectorAll('.file-remove').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var idx = parseInt(this.dataset.index, 10);
                if (!isNaN(idx)) {
                    selectedFiles.splice(idx, 1);
                    renderFileList();
                    fileInput.value = '';
                }
            });
        });
    }

    // ============================================
    // 处理文件选择
    // ============================================
    function handleFiles(files) {
        if (!files || files.length === 0) return;

        var allowed = ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        var valid = [];

        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            var ext = f.name.split('.').pop().toLowerCase();
            if (allowed.indexOf(ext) !== -1 || f.type.startsWith('image/')) {
                valid.push(f);
            } else {
                showToast('⚠️ 跳过: ' + f.name, 'error', 1800);
            }
        }

        if (valid.length === 0) return;

        selectedFiles = selectedFiles.concat(valid);
        renderFileList();
        showToast('📎 已选 ' + valid.length + ' 个文件', 'success', 1200);
        fileInput.value = '';
    }

    // ============================================
    // 提交订单
    // ============================================
    async function submitOrder() {
        var wechat = wechatId.value.trim();

        if (!wechat) {
            showToast('⚠️ 请输入微信号', 'error', 1600);
            wechatId.focus();
            return;
        }

        if (selectedFiles.length === 0) {
            showToast('⚠️ 请至少选择一个文件', 'error', 1600);
            return;
        }

        if (isSubmitting) return;

        isSubmitting = true;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // 本地环境使用模拟提交
            if (isLocalFile()) {
                console.log('本地环境，模拟提交订单');
                await new Promise(function(resolve) {
                    setTimeout(resolve, 1500);
                });
                // 模拟成功
                showToast('✅ 订单提交成功！（模拟）', 'success', 2500);
                formSection.style.display = 'none';
                successScreen.style.display = 'block';
                selectedFiles = [];
                renderFileList();
                remark.value = '';
                fileInput.value = '';
                isSubmitting = false;
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                return;
            }

            // 服务器环境 - 真实提交
            var formData = new FormData();
            formData.append('wechat', wechat);
            formData.append('remark', remark.value.trim() || '');

            for (var i = 0; i < selectedFiles.length; i++) {
                formData.append('files', selectedFiles[i]);
            }

            var resp = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            var result = await resp.json();

            if (result.code === 200) {
                showToast('✅ 订单提交成功！', 'success', 2500);
                formSection.style.display = 'none';
                successScreen.style.display = 'block';
                selectedFiles = [];
                renderFileList();
                remark.value = '';
                fileInput.value = '';
            } else {
                throw new Error(result.message || '上传失败');
            }
        } catch (err) {
            console.error('上传错误:', err);
            showToast('❌ ' + err.message, 'error', 4000);
        } finally {
            isSubmitting = false;
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    // ============================================
    // 恢复表单（继续上传）
    // ============================================
    function resetForm() {
        successScreen.style.display = 'none';
        formSection.style.display = 'block';
        wechatId.value = '';
        remark.value = '';
        selectedFiles = [];
        renderFileList();
        fileInput.value = '';
    }

    // ============================================
    // 从URL自动填充微信号
    // ============================================
    function autoFillWechat() {
        var params = new URLSearchParams(window.location.search);
        var wechat = params.get('wechat');
        if (wechat) {
            wechatId.value = wechat;
        }
    }

    // ============================================
    // 初始化事件绑定
    // ============================================
    function init() {
        // 文件选择
        fileInput.addEventListener('change', function(e) {
            handleFiles(e.target.files);
        });

        // 拖拽上传
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files) {
                handleFiles(e.dataTransfer.files);
            }
        });

        // 点击上传区域触发文件选择
        uploadZone.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') {
                fileInput.click();
            }
        });

        // 提交订单
        submitBtn.addEventListener('click', submitOrder);

        // 继续上传
        newUploadBtn.addEventListener('click', resetForm);

        // Enter键提交（在微信号输入框按Enter）
        wechatId.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitOrder();
            }
        });

        // 自动填充微信号
        autoFillWechat();

        console.log('📋 订单上传已启动');
        if (isLocalFile()) {
            console.log('📍 本地环境，使用模拟提交');
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

    // ============================================
    // 暴露 API 供外部使用
    // ============================================
    window.UploadApp = {
        selectedFiles: selectedFiles,
        formatSize: formatSize,
        getFileIcon: getFileIcon,
        handleFiles: handleFiles,
        renderFileList: renderFileList,
        submitOrder: submitOrder,
        resetForm: resetForm,
        showToast: showToast,
        isLocalFile: isLocalFile
    };

})();