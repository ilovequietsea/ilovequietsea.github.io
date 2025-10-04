// ==================== 常量定义 ====================
const BG_PRESETS = {
    gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradient3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    gradient4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    gradient5: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    solid: '#2c3e50'
};

const DEFAULT_MODE_ICONS = {
    single: '📷',
    batch: '🖼️',
    text: '📝'
};

const BUILTIN_DEFAULT_SETTINGS = {
    appSettings: {},
    modeIcons: {}
};

// ==================== 通用工具函数 ====================
function calculateScale(imgWidth, imgHeight, targetWidth, targetHeight, mode) {
    if (mode === 'width') {
        return targetWidth / imgWidth;
    } else if (mode === 'height') {
        return targetHeight / imgHeight;
    } else {
        return Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
    }
}

function renderPageNumbers(currentPage, totalPages, containerId, callbackName) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (totalPages <= 1) return;

    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        container.appendChild(createPageButton(1, currentPage, callbackName));
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'page-ellipsis';
            container.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageButton(i, currentPage, callbackName));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'page-ellipsis';
            container.appendChild(ellipsis);
        }
        container.appendChild(createPageButton(totalPages, currentPage, callbackName));
    }
}

function createPageButton(pageNum, currentPage, callbackName) {
    const btn = document.createElement('button');
    btn.textContent = pageNum;
    btn.className = 'page-btn';
    if (pageNum === currentPage) {
        btn.classList.add('active');
    }
    btn.onclick = () => window[callbackName](pageNum);
    return btn;
}
