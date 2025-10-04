// ==================== 全局变量 ====================
let currentBgImage = null;
let currentPage = 'mode';

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    applyBuiltinDefaultsIfNeeded();
    loadSettingsFromURL();
    initPageSelector();
    initPresetButtons();
    initBgImageUpload();
    initOpacitySlider();
    initModeIconUpload();
    loadSettings();
});

// ==================== 模式切换 ====================
function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    
    if (mode === 'single') {
        document.getElementById('singleMode').style.display = 'flex';
        currentPage = 'single';
    } else if (mode === 'batch') {
        document.getElementById('batchUpload').style.display = 'flex';
        currentPage = 'batch';
    } else if (mode === 'text') {
        document.getElementById('textUpload').style.display = 'flex';
        currentPage = 'text';
    }
    
    loadSettings();
}

function backToModeSelection() {
    document.getElementById('singleMode').style.display = 'none';
    document.getElementById('batchUpload').style.display = 'none';
    document.getElementById('batchEdit').style.display = 'none';
    document.getElementById('textUpload').style.display = 'none';
    document.getElementById('textEdit').style.display = 'none';
    document.getElementById('modeSelection').style.display = 'flex';
    currentPage = 'mode';
    loadSettings();
}

function backToBatchUpload() {
    resetBatchEdit();
    document.getElementById('batchEdit').style.display = 'none';
    document.getElementById('batchUpload').style.display = 'flex';
}
