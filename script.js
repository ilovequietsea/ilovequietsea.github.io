// ==================== 背景设置 ====================
const BG_PRESETS = {
    gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradient3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    gradient4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    gradient5: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    solid: '#2c3e50'
};

let currentBgImage = null;
let currentPage = 'mode'; // 当前页面：mode, single, batch, text
const DEFAULT_MODE_ICONS = {
    single: '📷',
    batch: '🖼️',
    text: '📝'
};

// 页面加载时恢复设置
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    initPresetButtons();
    initBgImageUpload();
    initOpacitySlider();
    initPageSelector();
    initModeIconUpload();
    loadModeIcons();
});

function loadSettings() {
    const allSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');

    // 加载全局设置
    loadPageSettings('all', allSettings);

    // 加载当前页面设置
    loadPageSettings(currentPage, allSettings);
}

function loadPageSettings(page, allSettings = null) {
    if (!allSettings) {
        allSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    }

    const settings = allSettings[page] || {};

    // 恢复背景
    if (settings.bgType === 'preset' && settings.bgValue) {
        applyPresetBackground(settings.bgValue);
    } else if (settings.bgType === 'color' && settings.bgValue) {
        applyBackground(settings.bgValue);
    } else if (settings.bgType === 'image' && settings.bgImage) {
        currentBgImage = settings.bgImage;
        applyBgImage(settings.bgImage);
    }

    // 恢复透明度
    if (settings.opacity) {
        const opacity = settings.opacity;
        document.getElementById('opacitySlider').value = opacity;
        document.getElementById('opacityValue').textContent = opacity;
        applyOpacity(opacity);
    }

    // 恢复字体和文字颜色
    if (settings.fontFamily) {
        applyFont(settings.fontFamily);
        document.getElementById('fontSelector').value = settings.fontFamily;
    }
    if (settings.textColor) {
        applyTextColor(settings.textColor);
        document.getElementById('textColorPicker').value = settings.textColor;
    }
}

function saveSettings(type, value, bgImage = null) {
    const allSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    const selectedPage = document.getElementById('pageSelector').value;

    if (!allSettings[selectedPage]) {
        allSettings[selectedPage] = {};
    }

    allSettings[selectedPage].bgType = type;
    allSettings[selectedPage].bgValue = value;
    allSettings[selectedPage].bgImage = bgImage || currentBgImage;
    allSettings[selectedPage].opacity = document.getElementById('opacitySlider').value;
    allSettings[selectedPage].fontFamily = document.getElementById('fontSelector').value;
    allSettings[selectedPage].textColor = document.getElementById('textColorPicker').value;

    localStorage.setItem('appSettings', JSON.stringify(allSettings));
}

function initPageSelector() {
    const selector = document.getElementById('pageSelector');
    selector.addEventListener('change', function() {
        const allSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        const selectedPage = this.value;
        loadPageSettings(selectedPage, allSettings);
    });
}

function openSettings() {
    document.getElementById('settingsPanel').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsPanel').classList.remove('active');
}

// 点击背景关闭设置面板
document.getElementById('settingsPanel')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeSettings();
    }
});

function initPresetButtons() {
    const buttons = document.querySelectorAll('.preset-bg');
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            applyPresetBackground(type);

            // 更新按钮状态
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            saveSettings('preset', type);
        });
    });
}

function applyPresetBackground(type) {
    const bg = BG_PRESETS[type];
    applyBackground(bg);

    // 移除图片背景
    document.body.classList.remove('has-bg-image');
    if (document.body.style.backgroundImage) {
        document.body.style.backgroundImage = '';
    }
}

function applyCustomColor() {
    const color = document.getElementById('bgColorPicker').value;
    applyBackground(color);

    // 移除图片背景
    document.body.classList.remove('has-bg-image');
    if (document.body.style.backgroundImage) {
        document.body.style.backgroundImage = '';
    }

    // 清除预设按钮的选中状态
    document.querySelectorAll('.preset-bg').forEach(b => b.classList.remove('active'));

    saveSettings('color', color);
}

function applyBackground(bg) {
    document.body.style.background = bg;
}

function initBgImageUpload() {
    const input = document.getElementById('bgImageInput');
    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageData = event.target.result;
            currentBgImage = imageData;
            applyBgImage(imageData);

            // 显示预览
            const preview = document.getElementById('bgImagePreview');
            preview.style.backgroundImage = `url(${imageData})`;
            preview.classList.add('active');

            // 清除预设按钮的选中状态
            document.querySelectorAll('.preset-bg').forEach(b => b.classList.remove('active'));

            saveSettings('image', null, imageData);
        };
        reader.readAsDataURL(file);
    });
}

function applyBgImage(imageData) {
    document.body.classList.add('has-bg-image');
    document.body.style.backgroundImage = `url(${imageData})`;
}

function removeBgImage() {
    document.body.classList.remove('has-bg-image');
    document.body.style.backgroundImage = '';
    currentBgImage = null;

    // 隐藏预览
    const preview = document.getElementById('bgImagePreview');
    preview.style.backgroundImage = '';
    preview.classList.remove('active');

    // 恢复默认背景
    applyPresetBackground('gradient1');
    saveSettings('preset', 'gradient1');
}

function initOpacitySlider() {
    const slider = document.getElementById('opacitySlider');
    slider.addEventListener('input', function() {
        const value = this.value;
        document.getElementById('opacityValue').textContent = value;
        applyOpacity(value);
        saveSettings(
            localStorage.getItem('appSettings') ? JSON.parse(localStorage.getItem('appSettings')).bgType : 'preset',
            localStorage.getItem('appSettings') ? JSON.parse(localStorage.getItem('appSettings')).bgValue : 'gradient1'
        );
    });
}

function applyOpacity(value) {
    const opacity = value / 100;
    const containers = document.querySelectorAll('.container, .mode-container');
    containers.forEach(container => {
        container.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
    });
}

function applyTextSettings() {
    const font = document.getElementById('fontSelector').value;
    const color = document.getElementById('textColorPicker').value;

    applyFont(font);
    applyTextColor(color);

    saveSettings(
        localStorage.getItem('appSettings') ? JSON.parse(localStorage.getItem('appSettings'))[document.getElementById('pageSelector').value]?.bgType : 'preset',
        localStorage.getItem('appSettings') ? JSON.parse(localStorage.getItem('appSettings'))[document.getElementById('pageSelector').value]?.bgValue : 'gradient1'
    );
}

function applyFont(fontFamily) {
    document.body.style.fontFamily = fontFamily;
}

function applyTextColor(color) {
    document.body.style.color = color;
    // 应用到标题和文字
    const elements = document.querySelectorAll('h1, h2, h3, p, span, label, button, input, select, textarea, div');
    elements.forEach(el => {
        if (!el.classList.contains('close-btn') && !el.classList.contains('crop-info-label')) {
            el.style.color = color;
        }
    });
}

function initModeIconUpload() {
    const iconInputs = ['singleIconInput', 'batchIconInput', 'textIconInput'];
    const iconIds = ['single', 'batch', 'text'];

    iconInputs.forEach((inputId, index) => {
        const input = document.getElementById(inputId);
        const mode = iconIds[index];

        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = event.target.result;
                applyModeIcon(mode, imageData);
                saveModeIcon(mode, imageData);
            };
            reader.readAsDataURL(file);
        });
    });
}

function applyModeIcon(mode, imageData) {
    const iconElement = document.getElementById(`${mode}ModeIcon`);
    if (iconElement) {
        iconElement.style.backgroundImage = `url(${imageData})`;
        iconElement.classList.add('has-custom-image');
        iconElement.textContent = '';
    }
}

function saveModeIcon(mode, imageData) {
    const modeIcons = JSON.parse(localStorage.getItem('modeIcons') || '{}');
    modeIcons[mode] = imageData;
    localStorage.setItem('modeIcons', JSON.stringify(modeIcons));
}

function loadModeIcons() {
    const modeIcons = JSON.parse(localStorage.getItem('modeIcons') || '{}');

    Object.keys(modeIcons).forEach(mode => {
        if (modeIcons[mode]) {
            applyModeIcon(mode, modeIcons[mode]);
        }
    });
}

function resetModeIcon(mode) {
    const iconElement = document.getElementById(`${mode}ModeIcon`);
    if (iconElement) {
        iconElement.style.backgroundImage = '';
        iconElement.classList.remove('has-custom-image');
        iconElement.textContent = DEFAULT_MODE_ICONS[mode];
    }

    // 从 localStorage 移除
    const modeIcons = JSON.parse(localStorage.getItem('modeIcons') || '{}');
    delete modeIcons[mode];
    localStorage.setItem('modeIcons', JSON.stringify(modeIcons));
}

function resetToDefault() {
    // 清除所有设置
    localStorage.removeItem('appSettings');
    localStorage.removeItem('modeIcons');
    currentBgImage = null;

    // 恢复默认背景
    applyPresetBackground('gradient1');

    // 恢复默认透明度
    document.getElementById('opacitySlider').value = 95;
    document.getElementById('opacityValue').textContent = 95;
    applyOpacity(95);

    // 恢复默认字体和颜色
    applyFont("'Segoe UI', Tahoma, Geneva, Verdana, sans-serif");
    applyTextColor('#333333');
    document.getElementById('fontSelector').value = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    document.getElementById('textColorPicker').value = '#333333';

    // 清除图片预览
    const preview = document.getElementById('bgImagePreview');
    preview.style.backgroundImage = '';
    preview.classList.remove('active');

    // 更新按钮状态
    document.querySelectorAll('.preset-bg').forEach((b, i) => {
        b.classList.remove('active');
        if (i === 0) b.classList.add('active');
    });

    // 恢复默认模式图标
    ['single', 'batch', 'text'].forEach(mode => {
        resetModeIcon(mode);
    });

    alert('已恢复全部默认设置');
}

// ==================== 模式切换 ====================
function selectMode(mode) {
    document.getElementById('modeSelection').style.display = 'none';
    if (mode === 'single') {
        currentPage = 'single';
        document.getElementById('singleMode').style.display = 'block';
    } else if (mode === 'batch') {
        currentPage = 'batch';
        document.getElementById('batchUpload').style.display = 'block';
    } else if (mode === 'text') {
        currentPage = 'text';
        document.getElementById('textUpload').style.display = 'block';
    }

    // 加载对应页面的设置
    loadPageSettings(currentPage);
}

function backToModeSelection() {
    document.getElementById('modeSelection').style.display = 'flex';
    document.getElementById('singleMode').style.display = 'none';
    document.getElementById('batchUpload').style.display = 'none';
    document.getElementById('batchEdit').style.display = 'none';
    document.getElementById('textUpload').style.display = 'none';
    document.getElementById('textEdit').style.display = 'none';

    // 切换到模式选择页面
    currentPage = 'mode';
    loadPageSettings(currentPage);
}

function backToBatchUpload() {
    document.getElementById('batchEdit').style.display = 'none';
    document.getElementById('batchUpload').style.display = 'block';
}

// ==================== 单张模式 ====================
let singleImage = null;
let singleScaledCanvas = null;
let singleCropPosition = { x: 0, y: 0 };
let singleIsDragging = false;
let singleDragStart = { x: 0, y: 0 };
let singlePreviewCounter = 0;
let singlePreviews = [];

// DOM元素 - 单张模式
const imageInput = document.getElementById('imageInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvasContainer');
const cropBox = document.getElementById('cropBox');
const cropLabel = document.getElementById('cropLabel');
const overlayTop = document.getElementById('overlayTop');
const overlayBottom = document.getElementById('overlayBottom');
const overlayLeft = document.getElementById('overlayLeft');
const overlayRight = document.getElementById('overlayRight');
const targetWidthInput = document.getElementById('targetWidth');
const targetHeightInput = document.getElementById('targetHeight');
const scaleModeSelect = document.getElementById('scaleMode');
const processBtn = document.getElementById('processBtn');
const originalSizeP = document.getElementById('originalSize');
const scaledSizeP = document.getElementById('scaledSize');
const cropInfoP = document.getElementById('cropInfo');
const previewList = document.getElementById('previewList');
const selectAllBtn = document.getElementById('selectAllBtn');
const downloadSelectedBtn = document.getElementById('downloadSelectedBtn');

// 事件监听 - 单张模式
imageInput.addEventListener('change', handleSingleImageUpload);
processBtn.addEventListener('click', processSingleImage);
selectAllBtn.addEventListener('click', toggleSelectAllSingle);
downloadSelectedBtn.addEventListener('click', downloadSelectedSingle);
cropBox.addEventListener('mousedown', startSingleDrag);
document.addEventListener('mousemove', singleDrag);
document.addEventListener('mouseup', endSingleDrag);

targetWidthInput.addEventListener('change', () => {
    if (singleImage) scaleAndDisplaySingleImage();
});
targetHeightInput.addEventListener('change', () => {
    if (singleImage) scaleAndDisplaySingleImage();
});
scaleModeSelect.addEventListener('change', () => {
    if (singleImage) scaleAndDisplaySingleImage();
});

function handleSingleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            singleImage = img;
            scaleAndDisplaySingleImage();
            processBtn.disabled = false;
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function scaleAndDisplaySingleImage() {
    if (!singleImage) return;

    const targetWidth = parseInt(targetWidthInput.value);
    const targetHeight = parseInt(targetHeightInput.value);
    const scaleMode = scaleModeSelect.value;

    const scale = calculateScale(singleImage.width, singleImage.height, targetWidth, targetHeight, scaleMode);
    const scaledWidth = Math.round(singleImage.width * scale);
    const scaledHeight = Math.round(singleImage.height * scale);

    singleScaledCanvas = document.createElement('canvas');
    singleScaledCanvas.width = scaledWidth;
    singleScaledCanvas.height = scaledHeight;
    const scaledCtx = singleScaledCanvas.getContext('2d');
    scaledCtx.drawImage(singleImage, 0, 0, scaledWidth, scaledHeight);

    const maxDisplayWidth = 900;
    const maxDisplayHeight = 700;
    let displayWidth = scaledWidth;
    let displayHeight = scaledHeight;
    let displayScale = 1;

    if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
        displayScale = Math.min(maxDisplayWidth / displayWidth, maxDisplayHeight / displayHeight);
        displayWidth = Math.round(displayWidth * displayScale);
        displayHeight = Math.round(displayHeight * displayScale);
    }

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    ctx.drawImage(singleScaledCanvas, 0, 0, displayWidth, displayHeight);

    showSingleCropBox(displayWidth, displayHeight, targetWidth, targetHeight, displayScale);

    originalSizeP.textContent = `原始尺寸: ${singleImage.width} × ${singleImage.height}`;
    scaledSizeP.textContent = `缩放后尺寸: ${scaledWidth} × ${scaledHeight}`;
    updateSingleCropInfo();
}

function showSingleCropBox(displayWidth, displayHeight, targetWidth, targetHeight, displayScale) {
    const cropDisplayWidth = Math.min(targetWidth * displayScale, displayWidth);
    const cropDisplayHeight = Math.min(targetHeight * displayScale, displayHeight);

    singleCropPosition.x = Math.max(0, (displayWidth - cropDisplayWidth) / 2);
    singleCropPosition.y = Math.max(0, (displayHeight - cropDisplayHeight) / 2);

    cropBox.style.left = singleCropPosition.x + 'px';
    cropBox.style.top = singleCropPosition.y + 'px';
    cropBox.style.width = cropDisplayWidth + 'px';
    cropBox.style.height = cropDisplayHeight + 'px';
    cropBox.style.display = 'block';

    cropLabel.textContent = `${targetWidth} × ${targetHeight}`;

    updateSingleOverlay();
}

function updateSingleOverlay() {
    const cropLeft = parseFloat(cropBox.style.left);
    const cropTop = parseFloat(cropBox.style.top);
    const cropWidth = parseFloat(cropBox.style.width);
    const cropHeight = parseFloat(cropBox.style.height);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 上遮罩
    overlayTop.style.left = '0';
    overlayTop.style.top = '0';
    overlayTop.style.width = canvasWidth + 'px';
    overlayTop.style.height = cropTop + 'px';
    overlayTop.style.display = 'block';

    // 下遮罩
    overlayBottom.style.left = '0';
    overlayBottom.style.top = (cropTop + cropHeight) + 'px';
    overlayBottom.style.width = canvasWidth + 'px';
    overlayBottom.style.height = (canvasHeight - cropTop - cropHeight) + 'px';
    overlayBottom.style.display = 'block';

    // 左遮罩
    overlayLeft.style.left = '0';
    overlayLeft.style.top = cropTop + 'px';
    overlayLeft.style.width = cropLeft + 'px';
    overlayLeft.style.height = cropHeight + 'px';
    overlayLeft.style.display = 'block';

    // 右遮罩
    overlayRight.style.left = (cropLeft + cropWidth) + 'px';
    overlayRight.style.top = cropTop + 'px';
    overlayRight.style.width = (canvasWidth - cropLeft - cropWidth) + 'px';
    overlayRight.style.height = cropHeight + 'px';
    overlayRight.style.display = 'block';
}

function updateSingleCropInfo() {
    if (!singleScaledCanvas) return;
    const displayScale = canvas.width / singleScaledCanvas.width;
    const cropX = Math.round(singleCropPosition.x / displayScale);
    const cropY = Math.round(singleCropPosition.y / displayScale);
    cropInfoP.textContent = `裁剪位置: (${cropX}, ${cropY})`;
}

function startSingleDrag(e) {
    singleIsDragging = true;
    singleDragStart.x = e.clientX - singleCropPosition.x;
    singleDragStart.y = e.clientY - singleCropPosition.y;
    cropBox.style.cursor = 'grabbing';
    e.preventDefault();
}

function singleDrag(e) {
    if (!singleIsDragging) return;

    const containerRect = canvasContainer.getBoundingClientRect();
    let newX = e.clientX - singleDragStart.x - containerRect.left;
    let newY = e.clientY - singleDragStart.y - containerRect.top;

    const maxX = canvas.width - parseFloat(cropBox.style.width);
    const maxY = canvas.height - parseFloat(cropBox.style.height);

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    singleCropPosition.x = newX;
    singleCropPosition.y = newY;

    cropBox.style.left = newX + 'px';
    cropBox.style.top = newY + 'px';

    updateSingleCropInfo();
    updateSingleOverlay();
}

function endSingleDrag() {
    if (singleIsDragging) {
        singleIsDragging = false;
        cropBox.style.cursor = 'move';
    }
}

function processSingleImage() {
    if (!singleScaledCanvas) return;

    const targetWidth = parseInt(targetWidthInput.value);
    const targetHeight = parseInt(targetHeightInput.value);
    const displayScale = canvas.width / singleScaledCanvas.width;
    const cropX = Math.round(singleCropPosition.x / displayScale);
    const cropY = Math.round(singleCropPosition.y / displayScale);

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = targetWidth;
    croppedCanvas.height = targetHeight;
    const croppedCtx = croppedCanvas.getContext('2d');

    croppedCtx.drawImage(
        singleScaledCanvas,
        cropX, cropY, targetWidth, targetHeight,
        0, 0, targetWidth, targetHeight
    );

    addSinglePreview(croppedCanvas, targetWidth, targetHeight, cropX, cropY);
}

function addSinglePreview(canvas, width, height, x, y) {
    const timestamp = new Date().toLocaleString('zh-CN');
    singlePreviewCounter++;

    const preview = {
        id: singlePreviewCounter,
        canvas: canvas,
        width: width,
        height: height,
        x: x,
        y: y,
        timestamp: timestamp
    };

    singlePreviews.push(preview);

    const emptyHint = previewList.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();

    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.dataset.id = preview.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.closest('.preview-item').classList.add('selected');
        } else {
            this.closest('.preview-item').classList.remove('selected');
        }
    });

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');

    const info = document.createElement('div');
    info.className = 'preview-item-info';
    info.textContent = `尺寸: ${width}×${height} | 位置: (${x}, ${y})`;

    const time = document.createElement('div');
    time.className = 'preview-item-time';
    time.textContent = timestamp;

    previewItem.appendChild(checkbox);
    previewItem.appendChild(img);
    previewItem.appendChild(info);
    previewItem.appendChild(time);

    previewItem.addEventListener('click', function(e) {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });

    previewList.insertBefore(previewItem, previewList.firstChild);

    selectAllBtn.disabled = false;
    downloadSelectedBtn.disabled = false;
}

function toggleSelectAllSingle() {
    const checkboxes = previewList.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
        cb.dispatchEvent(new Event('change'));
    });
}

async function downloadSelectedSingle() {
    const selectedItems = previewList.querySelectorAll('.preview-item.selected');
    if (selectedItems.length === 0) {
        alert('请先选择要下载的图片');
        return;
    }

    // 单个图片直接下载
    if (selectedItems.length === 1) {
        const id = parseInt(selectedItems[0].dataset.id);
        const preview = singlePreviews.find(p => p.id === id);
        if (preview) {
            preview.canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `cropped_${preview.width}x${preview.height}_${preview.id}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
        }
        return;
    }

    // 多个图片打包成ZIP
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const imgFolder = zip.folder('cropped_images');

    // 收集所有图片的Blob Promise
    const blobPromises = [];
    selectedItems.forEach(item => {
        const id = parseInt(item.dataset.id);
        const preview = singlePreviews.find(p => p.id === id);
        if (preview) {
            const promise = new Promise((resolve) => {
                preview.canvas.toBlob(function(blob) {
                    const fileName = `cropped_${preview.width}x${preview.height}_${preview.id}.png`;
                    resolve({ name: fileName, blob: blob });
                }, 'image/png');
            });
            blobPromises.push(promise);
        }
    });

    try {
        // 等待所有图片转换完成
        const blobs = await Promise.all(blobPromises);

        // 添加到ZIP
        blobs.forEach(item => {
            imgFolder.file(item.name, item.blob);
        });

        // 生成ZIP文件并下载
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped_images_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('打包下载失败：' + error.message);
    }
}

function resetSingleMode() {
    if (singleImage || singlePreviews.length > 0) {
        const confirmed = confirm('确定要清空单张模式的所有数据吗？');
        if (!confirmed) return;
    }

    singleImage = null;
    singleScaledCanvas = null;
    singlePreviews = [];
    singlePreviewCounter = 0;
    processBtn.disabled = true;
    selectAllBtn.disabled = true;
    downloadSelectedBtn.disabled = true;
    cropBox.style.display = 'none';
    overlayTop.style.display = 'none';
    overlayBottom.style.display = 'none';
    overlayLeft.style.display = 'none';
    overlayRight.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    originalSizeP.textContent = '原始尺寸: -';
    scaledSizeP.textContent = '缩放后尺寸: -';
    cropInfoP.textContent = '裁剪位置: -';
    previewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理图片</p>';
    imageInput.value = '';
}

// ==================== 批量模式 - 上传 ====================
let uploadedFiles = [];
let isShiftDragging = false;

const batchImageInput = document.getElementById('batchImageInput');
const uploadedImagesDiv = document.getElementById('uploadedImages');
const uploadedGrid = document.getElementById('uploadedGrid');
const uploadedCount = document.getElementById('uploadedCount');
const selectedCount = document.getElementById('selectedCount');

batchImageInput.addEventListener('change', handleBatchUpload);

// Shift + 拖动选中功能
uploadedGrid.addEventListener('mousedown', function(e) {
    if (e.shiftKey && e.button === 0) {
        isShiftDragging = true;
        e.preventDefault();

        // 立即选中当前项
        const item = e.target.closest('.uploaded-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
                updateUploadedSelection.call(checkbox);
            }
        }
    }
});

uploadedGrid.addEventListener('mousemove', function(e) {
    if (isShiftDragging) {
        const item = e.target.closest('.uploaded-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                updateUploadedSelection.call(checkbox);
            }
        }
    }
});

document.addEventListener('mouseup', function(e) {
    if (isShiftDragging) {
        isShiftDragging = false;
    }
});

function handleBatchUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    uploadedFiles = [];
    uploadedGrid.innerHTML = '';

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                uploadedFiles.push({
                    id: index,
                    file: file,
                    image: img,
                    name: file.name,
                    selected: false
                });

                const item = document.createElement('div');
                item.className = 'uploaded-item';
                item.dataset.id = index;

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'uploaded-item-checkbox';
                checkbox.addEventListener('change', updateUploadedSelection);

                const imgEl = document.createElement('img');
                imgEl.src = event.target.result;

                const nameDiv = document.createElement('div');
                nameDiv.className = 'uploaded-item-name';
                nameDiv.textContent = file.name;

                item.appendChild(checkbox);
                item.appendChild(imgEl);
                item.appendChild(nameDiv);

                item.addEventListener('click', function(e) {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        updateUploadedSelection.call(checkbox);
                    }
                });

                uploadedGrid.appendChild(item);

                uploadedCount.textContent = uploadedFiles.length;
                uploadedImagesDiv.style.display = 'block';
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function updateUploadedSelection() {
    const item = this.closest('.uploaded-item');
    const id = parseInt(item.dataset.id);
    const fileData = uploadedFiles.find(f => f.id === id);

    if (fileData) {
        fileData.selected = this.checked;
    }

    if (this.checked) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
    }

    const selected = uploadedFiles.filter(f => f.selected).length;
    selectedCount.textContent = selected;
}

function selectAllUploaded() {
    const checkboxes = uploadedGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = true;
        updateUploadedSelection.call(cb);
    });
}

function invertSelectionUploaded() {
    const checkboxes = uploadedGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = !cb.checked;
        updateUploadedSelection.call(cb);
    });
}

function deselectAllUploaded() {
    const checkboxes = uploadedGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        updateUploadedSelection.call(cb);
    });
}

function proceedToEdit() {
    const selected = uploadedFiles.filter(f => f.selected);
    if (selected.length === 0) {
        alert('请至少选择一张图片');
        return;
    }

    batchEditImages = selected;
    document.getElementById('batchUpload').style.display = 'none';
    document.getElementById('batchEdit').style.display = 'block';

    initBatchEdit();
}

function resetBatchMode() {
    if (uploadedFiles.length > 0 || batchImageData.length > 0 || batchPreviews.length > 0) {
        const confirmed = confirm('确定要清空批量模式的所有数据吗？');
        if (!confirmed) return;
    }

    uploadedFiles = [];
    uploadedGrid.innerHTML = '';
    uploadedImagesDiv.style.display = 'none';
    batchImageInput.value = '';
    uploadedCount.textContent = '0';
    selectedCount.textContent = '0';

    batchEditImages = [];
    batchImageData = [];
    batchCurrentPage = 1;
    batchPreviewCounter = 0;
    batchPreviews = [];

    // 清空编辑界面
    batchCanvasGrid.innerHTML = '';
    totalImagesSpan.textContent = '0';
    checkedImagesSpan.textContent = '0';
    batchPreviewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理图片</p>';
    batchSelectAllPreviewBtn.disabled = true;
    batchDownloadSelectedBtn.disabled = true;
    batchDeletePreviewBtn.disabled = true;
}

function resetBatchEdit() {
    if (batchImageData.length > 0 || batchPreviews.length > 0) {
        const confirmed = confirm('确定要清空编辑数据和预览吗？上传的图片将保留。');
        if (!confirmed) return;
    }

    batchImageData = [];
    batchEditImages = [];
    batchCurrentPage = 1;
    batchPreviewCounter = 0;
    batchPreviews = [];

    // 清空编辑界面
    batchCanvasGrid.innerHTML = '';
    totalImagesSpan.textContent = '0';
    checkedImagesSpan.textContent = '0';
    batchPreviewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理图片</p>';
    batchSelectAllPreviewBtn.disabled = true;
    batchDownloadSelectedBtn.disabled = true;
    batchDeletePreviewBtn.disabled = true;

    // 返回上传界面
    document.getElementById('batchEdit').style.display = 'none';
    document.getElementById('batchUpload').style.display = 'block';
}

// ==================== 批量模式 - 编辑 ====================
let batchEditImages = [];
let batchImageData = [];
let batchCurrentPage = 1;
let batchPreviewCounter = 0;
let batchPreviews = [];

const batchTargetWidthInput = document.getElementById('batchTargetWidth');
const batchTargetHeightInput = document.getElementById('batchTargetHeight');
const batchScaleModeSelect = document.getElementById('batchScaleMode');
const displayCountSelect = document.getElementById('displayCount');
const layoutModeSelect = document.getElementById('layoutMode');
const batchCanvasGrid = document.getElementById('batchCanvasGrid');
const totalImagesSpan = document.getElementById('totalImages');
const checkedImagesSpan = document.getElementById('checkedImages');
const pageInfo = document.getElementById('pageInfo');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const batchPreviewList = document.getElementById('batchPreviewList');
const batchSelectAllPreviewBtn = document.getElementById('batchSelectAllPreviewBtn');
const batchDownloadSelectedBtn = document.getElementById('batchDownloadSelectedBtn');
const batchDeletePreviewBtn = document.getElementById('batchDeletePreviewBtn');
const batchResizer = document.getElementById('batchResizer');

// 批量模式分隔条拖动
let isBatchResizing = false;
let batchStartX = 0;
let batchStartWidth = 0;

batchResizer.addEventListener('mousedown', function(e) {
    isBatchResizing = true;
    batchStartX = e.clientX;
    const rightSection = document.querySelector('#batchEdit .right-section');
    batchStartWidth = rightSection.offsetWidth;
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
    if (!isBatchResizing) return;

    const rightSection = document.querySelector('#batchEdit .right-section');
    const delta = batchStartX - e.clientX;
    const newWidth = batchStartWidth + delta;

    if (newWidth >= 250 && newWidth <= 600) {
        rightSection.style.width = newWidth + 'px';
    }
});

document.addEventListener('mouseup', function() {
    if (isBatchResizing) {
        isBatchResizing = false;
        document.body.style.cursor = '';
    }
});

// Shift + 拖动选择功能 - 剪辑窗口
let isBatchCanvasDragging = false;

batchCanvasGrid.addEventListener('mousedown', function(e) {
    if (e.shiftKey && e.button === 0) {
        isBatchCanvasDragging = true;
        e.preventDefault();

        const item = e.target.closest('.batch-canvas-item');
        if (item) {
            const checkbox = item.querySelector('.batch-canvas-item-checkbox');
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

batchCanvasGrid.addEventListener('mousemove', function(e) {
    if (isBatchCanvasDragging) {
        const item = e.target.closest('.batch-canvas-item');
        if (item) {
            const checkbox = item.querySelector('.batch-canvas-item-checkbox');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

document.addEventListener('mouseup', function() {
    if (isBatchCanvasDragging) {
        isBatchCanvasDragging = false;
    }
});

// Shift + 拖动选择功能 - 预览窗口
let isBatchPreviewDragging = false;

batchPreviewList.addEventListener('mousedown', function(e) {
    if (e.shiftKey && e.button === 0) {
        isBatchPreviewDragging = true;
        e.preventDefault();

        const item = e.target.closest('.preview-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

batchPreviewList.addEventListener('mousemove', function(e) {
    if (isBatchPreviewDragging) {
        const item = e.target.closest('.preview-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

document.addEventListener('mouseup', function() {
    if (isBatchPreviewDragging) {
        isBatchPreviewDragging = false;
    }
});

batchTargetWidthInput.addEventListener('change', updateAllBatchImages);
batchTargetHeightInput.addEventListener('change', updateAllBatchImages);
batchScaleModeSelect.addEventListener('change', updateAllBatchImages);
displayCountSelect.addEventListener('change', () => {
    batchCurrentPage = 1;
    renderBatchPage();
});
layoutModeSelect.addEventListener('change', renderBatchPage);

batchSelectAllPreviewBtn.addEventListener('click', toggleSelectAllBatchPreview);
batchDownloadSelectedBtn.addEventListener('click', downloadSelectedBatch);
batchDeletePreviewBtn.addEventListener('click', deleteSelectedBatchPreviews);

function initBatchEdit() {
    batchImageData = batchEditImages.map((item, index) => ({
        id: index,
        image: item.image,
        name: item.name,
        scaledCanvas: null,
        cropPosition: { x: 0, y: 0 },
        checked: false
    }));

    totalImagesSpan.textContent = batchImageData.length;
    batchCurrentPage = 1;

    updateAllBatchImages();
}

function updateAllBatchImages() {
    const targetWidth = parseInt(batchTargetWidthInput.value);
    const targetHeight = parseInt(batchTargetHeightInput.value);
    const scaleMode = batchScaleModeSelect.value;

    batchImageData.forEach(data => {
        const scale = calculateScale(data.image.width, data.image.height, targetWidth, targetHeight, scaleMode);
        const scaledWidth = Math.round(data.image.width * scale);
        const scaledHeight = Math.round(data.image.height * scale);

        data.scaledCanvas = document.createElement('canvas');
        data.scaledCanvas.width = scaledWidth;
        data.scaledCanvas.height = scaledHeight;
        const ctx = data.scaledCanvas.getContext('2d');
        ctx.drawImage(data.image, 0, 0, scaledWidth, scaledHeight);

        // 默认居中裁剪，但确保不超出边界
        let cropX = Math.max(0, Math.floor((scaledWidth - targetWidth) / 2));
        let cropY = Math.max(0, Math.floor((scaledHeight - targetHeight) / 2));

        // 确保裁剪区域不超出图片边界
        cropX = Math.min(cropX, Math.max(0, scaledWidth - targetWidth));
        cropY = Math.min(cropY, Math.max(0, scaledHeight - targetHeight));

        data.cropPosition = { x: cropX, y: cropY };
    });

    renderBatchPage();
}

function renderBatchPage() {
    const displayCount = parseInt(displayCountSelect.value);
    const layoutMode = layoutModeSelect.value;
    const totalPages = Math.ceil(batchImageData.length / displayCount);

    batchCanvasGrid.innerHTML = '';
    batchCanvasGrid.className = `batch-canvas-grid ${layoutMode}-layout`;

    const startIndex = (batchCurrentPage - 1) * displayCount;
    const endIndex = Math.min(startIndex + displayCount, batchImageData.length);

    for (let i = startIndex; i < endIndex; i++) {
        const data = batchImageData[i];
        const item = createBatchCanvasItem(data, i);
        batchCanvasGrid.appendChild(item);
    }

    pageInfo.textContent = `第 ${batchCurrentPage} 页 / 共 ${totalPages} 页`;
    prevPageBtn.disabled = batchCurrentPage === 1;
    nextPageBtn.disabled = batchCurrentPage === totalPages;

    // 更新页码输入框
    const pageInput = document.getElementById('batchPageInput');
    if (pageInput) {
        pageInput.value = batchCurrentPage;
        pageInput.max = totalPages;

        // 添加回车键监听（移除旧的监听器避免重复）
        pageInput.removeEventListener('keypress', batchPageInputKeyPress);
        pageInput.addEventListener('keypress', batchPageInputKeyPress);
    }

    // 生成页码按钮
    renderPageNumbers(batchCurrentPage, totalPages, 'batchPageNumbers', 'goToPageNumber');

    updateCheckedCount();
}

function createBatchCanvasItem(data, index) {
    const item = document.createElement('div');
    item.className = 'batch-canvas-item';
    if (data.checked) item.classList.add('checked');
    item.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'batch-canvas-item-header';

    const title = document.createElement('div');
    title.className = 'batch-canvas-item-title';
    title.textContent = `${index + 1}. ${data.name}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'batch-canvas-item-checkbox';
    checkbox.checked = data.checked;
    checkbox.addEventListener('change', function() {
        data.checked = this.checked;
        if (this.checked) {
            item.classList.add('checked');
        } else {
            item.classList.remove('checked');
        }
        updateCheckedCount();
    });

    header.appendChild(title);
    header.appendChild(checkbox);

    const container = document.createElement('div');
    container.className = 'batch-canvas-container';

    const canvas = document.createElement('canvas');
    const maxWidth = layoutModeSelect.value === 'grid' ? 300 : 600;
    const maxHeight = 400;

    let displayWidth = data.scaledCanvas.width;
    let displayHeight = data.scaledCanvas.height;
    let displayScale = 1;

    if (displayWidth > maxWidth || displayHeight > maxHeight) {
        displayScale = Math.min(maxWidth / displayWidth, maxHeight / displayHeight);
        displayWidth = Math.round(displayWidth * displayScale);
        displayHeight = Math.round(displayHeight * displayScale);
    }

    canvas.width = displayWidth;
    canvas.height = displayHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(data.scaledCanvas, 0, 0, displayWidth, displayHeight);

    // 创建遮罩层
    const overlayTop = document.createElement('div');
    const overlayBottom = document.createElement('div');
    const overlayLeft = document.createElement('div');
    const overlayRight = document.createElement('div');
    overlayTop.className = 'overlay-mask';
    overlayBottom.className = 'overlay-mask';
    overlayLeft.className = 'overlay-mask';
    overlayRight.className = 'overlay-mask';

    const cropBox = document.createElement('div');
    cropBox.className = 'crop-box';

    const targetWidth = parseInt(batchTargetWidthInput.value);
    const targetHeight = parseInt(batchTargetHeightInput.value);

    // 计算裁剪框在显示区域中的尺寸，确保不超过图片显示区域
    let cropDisplayWidth = Math.min(targetWidth * displayScale, displayWidth);
    let cropDisplayHeight = Math.min(targetHeight * displayScale, displayHeight);

    // 使用 Math.floor 避免浮点数导致超出边界
    cropDisplayWidth = Math.floor(cropDisplayWidth);
    cropDisplayHeight = Math.floor(cropDisplayHeight);

    let cropX = data.cropPosition.x * displayScale;
    let cropY = data.cropPosition.y * displayScale;

    // 确保裁剪框不超出图片边界
    cropX = Math.max(0, Math.min(cropX, displayWidth - cropDisplayWidth));
    cropY = Math.max(0, Math.min(cropY, displayHeight - cropDisplayHeight));

    // 同步更新裁剪位置数据
    data.cropPosition.x = Math.round(cropX / displayScale);
    data.cropPosition.y = Math.round(cropY / displayScale);

    cropBox.style.left = cropX + 'px';
    cropBox.style.top = cropY + 'px';
    cropBox.style.width = cropDisplayWidth + 'px';
    cropBox.style.height = cropDisplayHeight + 'px';
    cropBox.style.display = 'block';

    const label = document.createElement('div');
    label.className = 'crop-info-label';
    label.textContent = `${targetWidth} × ${targetHeight}`;
    cropBox.appendChild(label);

    // 更新遮罩函数
    function updateBatchOverlay() {
        const cropLeft = parseFloat(cropBox.style.left);
        const cropTop = parseFloat(cropBox.style.top);
        const cropWidth = parseFloat(cropBox.style.width);
        const cropHeight = parseFloat(cropBox.style.height);

        // 上遮罩
        overlayTop.style.left = '0';
        overlayTop.style.top = '0';
        overlayTop.style.width = displayWidth + 'px';
        overlayTop.style.height = cropTop + 'px';
        overlayTop.style.display = 'block';

        // 下遮罩
        overlayBottom.style.left = '0';
        overlayBottom.style.top = (cropTop + cropHeight) + 'px';
        overlayBottom.style.width = displayWidth + 'px';
        overlayBottom.style.height = (displayHeight - cropTop - cropHeight) + 'px';
        overlayBottom.style.display = 'block';

        // 左遮罩
        overlayLeft.style.left = '0';
        overlayLeft.style.top = cropTop + 'px';
        overlayLeft.style.width = cropLeft + 'px';
        overlayLeft.style.height = cropHeight + 'px';
        overlayLeft.style.display = 'block';

        // 右遮罩
        overlayRight.style.left = (cropLeft + cropWidth) + 'px';
        overlayRight.style.top = cropTop + 'px';
        overlayRight.style.width = (displayWidth - cropLeft - cropWidth) + 'px';
        overlayRight.style.height = cropHeight + 'px';
        overlayRight.style.display = 'block';
    }

    // 初始化遮罩
    updateBatchOverlay();

    // 拖动功能
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    cropBox.addEventListener('mousedown', function(e) {
        isDragging = true;
        const rect = cropBox.getBoundingClientRect();
        dragStart.x = e.clientX - rect.left;
        dragStart.y = e.clientY - rect.top;
        cropBox.style.cursor = 'grabbing';
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;

        const containerRect = container.getBoundingClientRect();
        let newX = e.clientX - dragStart.x - containerRect.left;
        let newY = e.clientY - dragStart.y - containerRect.top;

        const maxX = displayWidth - cropDisplayWidth;
        const maxY = displayHeight - cropDisplayHeight;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        cropBox.style.left = newX + 'px';
        cropBox.style.top = newY + 'px';

        data.cropPosition.x = Math.round(newX / displayScale);
        data.cropPosition.y = Math.round(newY / displayScale);

        updateBatchOverlay();
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            cropBox.style.cursor = 'move';
        }
    });

    container.appendChild(canvas);
    container.appendChild(overlayTop);
    container.appendChild(overlayBottom);
    container.appendChild(overlayLeft);
    container.appendChild(overlayRight);
    container.appendChild(cropBox);

    item.appendChild(header);
    item.appendChild(container);

    return item;
}

function updateCheckedCount() {
    const checked = batchImageData.filter(d => d.checked).length;
    checkedImagesSpan.textContent = checked;
}

function batchSelectAll() {
    const checkboxes = batchCanvasGrid.querySelectorAll('.batch-canvas-item-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
}

function batchSelectAllPages() {
    // 选中所有页面的所有图片（包括当前不在视图中的）
    batchImageData.forEach(data => {
        data.checked = true;
    });

    // 更新当前页面的显示
    renderBatchPage();
}

function batchDeleteSelected() {
    const selected = batchImageData.filter(d => d.checked);
    if (selected.length === 0) {
        alert('请先选择要删除的图片');
        return;
    }

    const confirmed = confirm(`确定要删除选中的 ${selected.length} 张图片吗？`);
    if (!confirmed) return;

    // 从数组中移除选中的图片
    batchImageData = batchImageData.filter(d => !d.checked);

    // 如果删除后没有图片了
    if (batchImageData.length === 0) {
        alert('所有图片已删除，返回上传界面');
        document.getElementById('batchEdit').style.display = 'none';
        document.getElementById('batchUpload').style.display = 'block';
        return;
    }

    // 重新分配 id
    batchImageData.forEach((data, index) => {
        data.id = index;
    });

    // 更新总数
    totalImagesSpan.textContent = batchImageData.length;

    // 调整当前页码
    const displayCount = parseInt(displayCountSelect.value);
    const totalPages = Math.ceil(batchImageData.length / displayCount);
    if (batchCurrentPage > totalPages) {
        batchCurrentPage = totalPages;
    }

    // 重新渲染
    renderBatchPage();
}

function batchProcessSelected() {
    const selected = batchImageData.filter(d => d.checked);
    if (selected.length === 0) {
        alert('请先选择要处理的图片');
        return;
    }

    const targetWidth = parseInt(batchTargetWidthInput.value);
    const targetHeight = parseInt(batchTargetHeightInput.value);

    selected.forEach(data => {
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = targetWidth;
        croppedCanvas.height = targetHeight;
        const ctx = croppedCanvas.getContext('2d');

        // 计算实际可裁剪的区域，确保不超出图片边界
        const actualCropWidth = Math.min(targetWidth, data.scaledCanvas.width - data.cropPosition.x);
        const actualCropHeight = Math.min(targetHeight, data.scaledCanvas.height - data.cropPosition.y);

        // 如果裁剪区域小于目标尺寸，填充白色背景
        if (actualCropWidth < targetWidth || actualCropHeight < targetHeight) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // 执行裁剪
        ctx.drawImage(
            data.scaledCanvas,
            data.cropPosition.x, data.cropPosition.y, actualCropWidth, actualCropHeight,
            0, 0, actualCropWidth, actualCropHeight
        );

        addBatchPreview(croppedCanvas, targetWidth, targetHeight, data.name);
    });
}

function addBatchPreview(canvas, width, height, name) {
    const timestamp = new Date().toLocaleString('zh-CN');
    batchPreviewCounter++;

    const preview = {
        id: batchPreviewCounter,
        canvas: canvas,
        width: width,
        height: height,
        name: name,
        timestamp: timestamp
    };

    batchPreviews.push(preview);

    const emptyHint = batchPreviewList.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();

    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.dataset.id = preview.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.closest('.preview-item').classList.add('selected');
        } else {
            this.closest('.preview-item').classList.remove('selected');
        }
    });

    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/png');

    const info = document.createElement('div');
    info.className = 'preview-item-info';
    info.textContent = `${name} | ${width}×${height}`;

    const time = document.createElement('div');
    time.className = 'preview-item-time';
    time.textContent = timestamp;

    previewItem.appendChild(checkbox);
    previewItem.appendChild(img);
    previewItem.appendChild(info);
    previewItem.appendChild(time);

    previewItem.addEventListener('click', function(e) {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });

    batchPreviewList.insertBefore(previewItem, batchPreviewList.firstChild);

    batchSelectAllPreviewBtn.disabled = false;
    batchDownloadSelectedBtn.disabled = false;
    batchDeletePreviewBtn.disabled = false;
}

function toggleSelectAllBatchPreview() {
    const checkboxes = batchPreviewList.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
        cb.dispatchEvent(new Event('change'));
    });
}

async function downloadSelectedBatch() {
    const selectedItems = batchPreviewList.querySelectorAll('.preview-item.selected');
    if (selectedItems.length === 0) {
        alert('请先选择要下载的图片');
        return;
    }

    // 单个图片直接下载
    if (selectedItems.length === 1) {
        const id = parseInt(selectedItems[0].dataset.id);
        const preview = batchPreviews.find(p => p.id === id);
        if (preview) {
            preview.canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const fileName = preview.name.replace(/\.[^/.]+$/, '');
                a.download = `${fileName}_cropped_${preview.width}x${preview.height}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/png');
        }
        return;
    }

    // 多个图片打包成ZIP
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const imgFolder = zip.folder('cropped_images');

    // 收集所有图片的Blob Promise
    const blobPromises = [];
    selectedItems.forEach(item => {
        const id = parseInt(item.dataset.id);
        const preview = batchPreviews.find(p => p.id === id);
        if (preview) {
            const promise = new Promise((resolve) => {
                preview.canvas.toBlob(function(blob) {
                    const fileName = preview.name.replace(/\.[^/.]+$/, '');
                    const finalName = `${fileName}_cropped_${preview.width}x${preview.height}.png`;
                    resolve({ name: finalName, blob: blob });
                }, 'image/png');
            });
            blobPromises.push(promise);
        }
    });

    try {
        // 等待所有图片转换完成
        const blobs = await Promise.all(blobPromises);

        // 添加到ZIP
        blobs.forEach(item => {
            imgFolder.file(item.name, item.blob);
        });

        // 生成ZIP文件并下载
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropped_images_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('打包下载失败：' + error.message);
    }
}

function deleteSelectedBatchPreviews() {
    const selectedItems = batchPreviewList.querySelectorAll('.preview-item.selected');
    if (selectedItems.length === 0) {
        alert('请先选择要删除的预览');
        return;
    }

    const confirmed = confirm(`确定要删除选中的 ${selectedItems.length} 个预览吗？`);
    if (!confirmed) return;

    // 收集要删除的 ID
    const idsToDelete = Array.from(selectedItems).map(item => parseInt(item.dataset.id));

    // 从数组中移除
    batchPreviews = batchPreviews.filter(p => !idsToDelete.includes(p.id));

    // 从 DOM 中移除
    selectedItems.forEach(item => item.remove());

    // 如果没有预览了，显示空提示并禁用按钮
    if (batchPreviews.length === 0) {
        batchPreviewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理图片</p>';
        batchSelectAllPreviewBtn.disabled = true;
        batchDownloadSelectedBtn.disabled = true;
        batchDeletePreviewBtn.disabled = true;
    }
}

function applyUniformCrop() {
    if (batchImageData.length === 0) return;

    const firstCrop = batchImageData[0].cropPosition;
    const targetWidth = parseInt(batchTargetWidthInput.value);
    const targetHeight = parseInt(batchTargetHeightInput.value);

    batchImageData.forEach(data => {
        // 使用第一张图的裁剪位置比例
        const firstCanvas = batchImageData[0].scaledCanvas;
        const cropXRatio = firstCrop.x / (firstCanvas.width - targetWidth);
        const cropYRatio = firstCrop.y / (firstCanvas.height - targetHeight);

        const maxX = Math.max(0, data.scaledCanvas.width - targetWidth);
        const maxY = Math.max(0, data.scaledCanvas.height - targetHeight);

        data.cropPosition.x = Math.round(cropXRatio * maxX);
        data.cropPosition.y = Math.round(cropYRatio * maxY);
    });

    renderBatchPage();
}

function prevPage() {
    if (batchCurrentPage > 1) {
        batchCurrentPage--;
        renderBatchPage();
    }
}

function nextPage() {
    const displayCount = parseInt(displayCountSelect.value);
    const totalPages = Math.ceil(batchImageData.length / displayCount);
    if (batchCurrentPage < totalPages) {
        batchCurrentPage++;
        renderBatchPage();
    }
}

function jumpToPage() {
    const pageInput = document.getElementById('batchPageInput');
    const pageNum = parseInt(pageInput.value);
    const displayCount = parseInt(displayCountSelect.value);
    const totalPages = Math.ceil(batchImageData.length / displayCount);

    if (pageNum >= 1 && pageNum <= totalPages) {
        batchCurrentPage = pageNum;
        renderBatchPage();
    } else {
        alert(`请输入1到${totalPages}之间的页码`);
    }
}

function goToPageNumber(pageNum) {
    batchCurrentPage = pageNum;
    renderBatchPage();
}

function batchPageInputKeyPress(e) {
    if (e.key === 'Enter') {
        jumpToPage();
    }
}

// ==================== 通用工具函数 ====================
function calculateScale(imgWidth, imgHeight, targetWidth, targetHeight, mode) {
    let scale = 1;

    switch(mode) {
        case 'short':
            const shortSide = Math.min(imgWidth, imgHeight);
            const targetShortSide = Math.min(targetWidth, targetHeight);
            scale = targetShortSide / shortSide;
            break;

        case 'long':
            const longSide = Math.max(imgWidth, imgHeight);
            const targetLongSide = Math.max(targetWidth, targetHeight);
            scale = targetLongSide / longSide;
            break;

        case 'width':
            scale = targetWidth / imgWidth;
            break;

        case 'height':
            scale = targetHeight / imgHeight;
            break;
    }

    return scale;
}

// 生成页码按钮
function renderPageNumbers(currentPage, totalPages, containerId, callbackName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    // 如果总页数小于等于1，不显示页码按钮
    if (totalPages <= 1) return;

    // 计算要显示的页码范围
    const maxButtons = 7; // 最多显示7个按钮
    let startPage, endPage;

    if (totalPages <= maxButtons) {
        // 页数少，全部显示
        startPage = 1;
        endPage = totalPages;
    } else {
        // 页数多，智能显示
        const halfButtons = Math.floor(maxButtons / 2);

        if (currentPage <= halfButtons + 1) {
            // 靠近开始
            startPage = 1;
            endPage = maxButtons - 1;
        } else if (currentPage >= totalPages - halfButtons) {
            // 靠近结束
            startPage = totalPages - maxButtons + 2;
            endPage = totalPages;
        } else {
            // 中间部分
            startPage = currentPage - halfButtons + 1;
            endPage = currentPage + halfButtons - 1;
        }
    }

    // 添加首页按钮
    if (startPage > 1) {
        const firstBtn = createPageButton(1, currentPage, callbackName);
        container.appendChild(firstBtn);

        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            container.appendChild(dots);
        }
    }

    // 添加页码按钮
    for (let i = startPage; i <= endPage; i++) {
        const btn = createPageButton(i, currentPage, callbackName);
        container.appendChild(btn);
    }

    // 添加尾页按钮
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '...';
            container.appendChild(dots);
        }

        const lastBtn = createPageButton(totalPages, currentPage, callbackName);
        container.appendChild(lastBtn);
    }
}

// 创建页码按钮
function createPageButton(pageNum, currentPage, callbackName) {
    const btn = document.createElement('button');
    btn.className = 'page-number-btn';
    btn.textContent = pageNum;
    btn.onclick = () => window[callbackName](pageNum);

    if (pageNum === currentPage) {
        btn.classList.add('active');
    }

    return btn;
}

// ==================== 文本处理模式 - 上传 ====================
let uploadedTextFiles = [];
let isTextShiftDragging = false;

const textFileInput = document.getElementById('textFileInput');
const uploadedTextsDiv = document.getElementById('uploadedTexts');
const uploadedTextGrid = document.getElementById('uploadedTextGrid');
const uploadedTextCount = document.getElementById('uploadedTextCount');
const selectedTextCount = document.getElementById('selectedTextCount');

textFileInput.addEventListener('change', handleTextUpload);

// Shift + 拖动选中功能 - 文本上传
uploadedTextGrid.addEventListener('mousedown', function(e) {
    if (e.shiftKey && e.button === 0) {
        isTextShiftDragging = true;
        e.preventDefault();

        const item = e.target.closest('.uploaded-text-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
                updateUploadedTextSelection.call(checkbox);
            }
        }
    }
});

uploadedTextGrid.addEventListener('mousemove', function(e) {
    if (isTextShiftDragging) {
        const item = e.target.closest('.uploaded-text-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                updateUploadedTextSelection.call(checkbox);
            }
        }
    }
});

document.addEventListener('mouseup', function(e) {
    if (isTextShiftDragging) {
        isTextShiftDragging = false;
    }
});

function handleTextUpload(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    uploadedTextFiles = [];
    uploadedTextGrid.innerHTML = '';

    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const content = event.target.result;
            const lines = content.split('\n').length;
            const size = (file.size / 1024).toFixed(2); // KB

            uploadedTextFiles.push({
                id: index,
                file: file,
                name: file.name,
                content: content,
                size: size,
                lines: lines,
                selected: false
            });

            const item = document.createElement('div');
            item.className = 'uploaded-text-item';
            item.dataset.id = index;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'uploaded-text-item-checkbox';
            checkbox.addEventListener('change', updateUploadedTextSelection);

            const icon = document.createElement('div');
            icon.className = 'uploaded-text-item-icon';
            icon.textContent = '📄';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'uploaded-text-item-name';
            nameDiv.textContent = file.name;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'uploaded-text-item-info';
            infoDiv.textContent = `${size} KB | ${lines} 行`;

            item.appendChild(checkbox);
            item.appendChild(icon);
            item.appendChild(nameDiv);
            item.appendChild(infoDiv);

            item.addEventListener('click', function(e) {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                    updateUploadedTextSelection.call(checkbox);
                }
            });

            uploadedTextGrid.appendChild(item);

            uploadedTextCount.textContent = uploadedTextFiles.length;
            uploadedTextsDiv.style.display = 'block';
        };
        reader.readAsText(file);
    });
}

function updateUploadedTextSelection() {
    const item = this.closest('.uploaded-text-item');
    const id = parseInt(item.dataset.id);
    const fileData = uploadedTextFiles.find(f => f.id === id);

    if (fileData) {
        fileData.selected = this.checked;
    }

    if (this.checked) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
    }

    const selected = uploadedTextFiles.filter(f => f.selected).length;
    selectedTextCount.textContent = selected;
}

function selectAllUploadedTexts() {
    const checkboxes = uploadedTextGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = true;
        updateUploadedTextSelection.call(cb);
    });
}

function invertSelectionUploadedTexts() {
    const checkboxes = uploadedTextGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = !cb.checked;
        updateUploadedTextSelection.call(cb);
    });
}

function deselectAllUploadedTexts() {
    const checkboxes = uploadedTextGrid.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        updateUploadedTextSelection.call(cb);
    });
}

function proceedToTextEdit() {
    const selected = uploadedTextFiles.filter(f => f.selected);
    if (selected.length === 0) {
        alert('请至少选择一个文件');
        return;
    }

    textEditFiles = selected;
    document.getElementById('textUpload').style.display = 'none';
    document.getElementById('textEdit').style.display = 'block';

    initTextEdit();
}

function backToTextUpload() {
    document.getElementById('textEdit').style.display = 'none';
    document.getElementById('textUpload').style.display = 'block';
}

function resetTextMode() {
    if (uploadedTextFiles.length > 0 || textFileData.length > 0 || textPreviews.length > 0) {
        const confirmed = confirm('确定要清空文本处理模式的所有数据吗？');
        if (!confirmed) return;
    }

    uploadedTextFiles = [];
    uploadedTextGrid.innerHTML = '';
    uploadedTextsDiv.style.display = 'none';
    textFileInput.value = '';
    uploadedTextCount.textContent = '0';
    selectedTextCount.textContent = '0';

    textEditFiles = [];
    textFileData = [];
    textCurrentPage = 1;
    textPreviewCounter = 0;
    textPreviews = [];

    // 清空编辑界面
    textFileGrid.innerHTML = '';
    document.getElementById('totalTexts').textContent = '0';
    document.getElementById('checkedTexts').textContent = '0';
    textPreviewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理文件</p>';
    document.getElementById('textSelectAllPreviewBtn').disabled = true;
    document.getElementById('textDownloadSelectedBtn').disabled = true;
    document.getElementById('textDeletePreviewBtn').disabled = true;
    document.getElementById('textToAdd').value = '';
}

function resetTextEdit() {
    if (textFileData.length > 0 || textPreviews.length > 0) {
        const confirmed = confirm('确定要清空编辑数据和预览吗？上传的文件将保留。');
        if (!confirmed) return;
    }

    textFileData = [];
    textEditFiles = [];
    textCurrentPage = 1;
    textPreviewCounter = 0;
    textPreviews = [];

    // 清空编辑界面
    textFileGrid.innerHTML = '';
    document.getElementById('totalTexts').textContent = '0';
    document.getElementById('checkedTexts').textContent = '0';
    textPreviewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理文件</p>';
    document.getElementById('textSelectAllPreviewBtn').disabled = true;
    document.getElementById('textDownloadSelectedBtn').disabled = true;
    document.getElementById('textDeletePreviewBtn').disabled = true;
    document.getElementById('textToAdd').value = '';

    // 返回上传界面
    document.getElementById('textEdit').style.display = 'none';
    document.getElementById('textUpload').style.display = 'block';
}

// ==================== 文本处理模式 - 编辑 ====================
let textEditFiles = [];
let textFileData = [];
let textCurrentPage = 1;
let textPreviewCounter = 0;
let textPreviews = [];

const textDisplayCountSelect = document.getElementById('textDisplayCount');
const textFileGrid = document.getElementById('textFileGrid');
const textPreviewList = document.getElementById('textPreviewList');
const textSelectAllPreviewBtn = document.getElementById('textSelectAllPreviewBtn');
const textDownloadSelectedBtn = document.getElementById('textDownloadSelectedBtn');
const textDeletePreviewBtn = document.getElementById('textDeletePreviewBtn');
const textResizer = document.getElementById('textResizer');
const textToAddTextarea = document.getElementById('textToAdd');
const addPositionSelect = document.getElementById('addPosition');

// 文本模式分隔条拖动
let isTextResizing = false;
let textStartX = 0;
let textStartWidth = 0;

textResizer.addEventListener('mousedown', function(e) {
    isTextResizing = true;
    textStartX = e.clientX;
    const rightSection = document.querySelector('#textEdit .right-section');
    textStartWidth = rightSection.offsetWidth;
    document.body.style.cursor = 'col-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', function(e) {
    if (!isTextResizing) return;

    const rightSection = document.querySelector('#textEdit .right-section');
    const delta = textStartX - e.clientX;
    const newWidth = textStartWidth + delta;

    if (newWidth >= 250 && newWidth <= 600) {
        rightSection.style.width = newWidth + 'px';
    }
});

document.addEventListener('mouseup', function() {
    if (isTextResizing) {
        isTextResizing = false;
        document.body.style.cursor = '';
    }
});

// Shift + 拖动选择功能 - 文本编辑
let isTextFileDragging = false;

textFileGrid.addEventListener('mousedown', function(e) {
    if (e.shiftKey && e.button === 0) {
        isTextFileDragging = true;
        e.preventDefault();

        const item = e.target.closest('.text-file-item');
        if (item) {
            const checkbox = item.querySelector('.text-file-item-checkbox');
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

textFileGrid.addEventListener('mousemove', function(e) {
    if (isTextFileDragging) {
        const item = e.target.closest('.text-file-item');
        if (item) {
            const checkbox = item.querySelector('.text-file-item-checkbox');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

document.addEventListener('mouseup', function() {
    if (isTextFileDragging) {
        isTextFileDragging = false;
    }
});

// Shift + 拖动选择功能 - 文本预览
let isTextPreviewDragging = false;

textPreviewList.addEventListener('mousedown', function(e) {
    if (e.shiftKey && e.button === 0) {
        isTextPreviewDragging = true;
        e.preventDefault();

        const item = e.target.closest('.text-preview-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

textPreviewList.addEventListener('mousemove', function(e) {
    if (isTextPreviewDragging) {
        const item = e.target.closest('.text-preview-item');
        if (item) {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
});

document.addEventListener('mouseup', function() {
    if (isTextPreviewDragging) {
        isTextPreviewDragging = false;
    }
});

textDisplayCountSelect.addEventListener('change', () => {
    textCurrentPage = 1;
    renderTextPage();
});

textSelectAllPreviewBtn.addEventListener('click', toggleSelectAllTextPreview);
textDownloadSelectedBtn.addEventListener('click', downloadSelectedTexts);
textDeletePreviewBtn.addEventListener('click', deleteSelectedTextPreviews);

function initTextEdit() {
    textFileData = textEditFiles.map((item, index) => ({
        id: index,
        name: item.name,
        originalContent: item.content,
        modifiedContent: item.content,
        size: item.size,
        lines: item.lines,
        checked: false
    }));

    document.getElementById('totalTexts').textContent = textFileData.length;
    textCurrentPage = 1;

    renderTextPage();
}

function renderTextPage() {
    const displayCount = parseInt(textDisplayCountSelect.value);
    const totalPages = Math.ceil(textFileData.length / displayCount);

    textFileGrid.innerHTML = '';

    const startIndex = (textCurrentPage - 1) * displayCount;
    const endIndex = Math.min(startIndex + displayCount, textFileData.length);

    for (let i = startIndex; i < endIndex; i++) {
        const data = textFileData[i];
        const item = createTextFileItem(data, i);
        textFileGrid.appendChild(item);
    }

    document.getElementById('textPageInfo').textContent = `第 ${textCurrentPage} 页 / 共 ${totalPages} 页`;
    document.getElementById('prevTextPageBtn').disabled = textCurrentPage === 1;
    document.getElementById('nextTextPageBtn').disabled = textCurrentPage === totalPages;

    // 更新页码输入框
    const pageInput = document.getElementById('textPageInput');
    if (pageInput) {
        pageInput.value = textCurrentPage;
        pageInput.max = totalPages;

        // 添加回车键监听（移除旧的监听器避免重复）
        pageInput.removeEventListener('keypress', textPageInputKeyPress);
        pageInput.addEventListener('keypress', textPageInputKeyPress);
    }

    // 生成页码按钮
    renderPageNumbers(textCurrentPage, totalPages, 'textPageNumbers', 'goToTextPageNumber');

    updateCheckedTextCount();
}

function createTextFileItem(data, index) {
    const item = document.createElement('div');
    item.className = 'text-file-item';
    if (data.checked) item.classList.add('checked');
    item.dataset.index = index;

    const header = document.createElement('div');
    header.className = 'text-file-item-header';

    const title = document.createElement('div');
    title.className = 'text-file-item-title';
    title.textContent = `${index + 1}. ${data.name}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'text-file-item-checkbox';
    checkbox.checked = data.checked;
    checkbox.addEventListener('change', function() {
        data.checked = this.checked;
        if (this.checked) {
            item.classList.add('checked');
        } else {
            item.classList.remove('checked');
        }
        updateCheckedTextCount();
    });

    header.appendChild(title);
    header.appendChild(checkbox);

    const info = document.createElement('div');
    info.className = 'text-file-item-info';
    info.innerHTML = `<span>大小: ${data.size} KB</span><span>行数: ${data.lines}</span>`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-file-item-content';
    contentDiv.textContent = data.modifiedContent;

    item.appendChild(header);
    item.appendChild(info);
    item.appendChild(contentDiv);

    return item;
}

function updateCheckedTextCount() {
    const checked = textFileData.filter(d => d.checked).length;
    document.getElementById('checkedTexts').textContent = checked;
}

function textSelectAll() {
    const checkboxes = textFileGrid.querySelectorAll('.text-file-item-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
}

function textSelectAllPages() {
    // 选中所有页面的所有文件（包括当前不在视图中的）
    textFileData.forEach(data => {
        data.checked = true;
    });

    // 更新当前页面的显示
    renderTextPage();
}

function textDeleteSelected() {
    const selected = textFileData.filter(d => d.checked);
    if (selected.length === 0) {
        alert('请先选择要删除的文件');
        return;
    }

    const confirmed = confirm(`确定要删除选中的 ${selected.length} 个文件吗？`);
    if (!confirmed) return;

    textFileData = textFileData.filter(d => !d.checked);

    if (textFileData.length === 0) {
        alert('所有文件已删除，返回上传界面');
        document.getElementById('textEdit').style.display = 'none';
        document.getElementById('textUpload').style.display = 'block';
        return;
    }

    textFileData.forEach((data, index) => {
        data.id = index;
    });

    document.getElementById('totalTexts').textContent = textFileData.length;

    const displayCount = parseInt(textDisplayCountSelect.value);
    const totalPages = Math.ceil(textFileData.length / displayCount);
    if (textCurrentPage > totalPages) {
        textCurrentPage = totalPages;
    }

    renderTextPage();
}

function addTextToSelected() {
    const textToAdd = textToAddTextarea.value;
    if (!textToAdd) {
        alert('请输入要添加的文本内容');
        return;
    }

    const selected = textFileData.filter(d => d.checked);
    if (selected.length === 0) {
        alert('请先选择要添加文本的文件');
        return;
    }

    const position = addPositionSelect.value;

    selected.forEach(data => {
        if (position === 'start') {
            data.modifiedContent = textToAdd + data.modifiedContent;
        } else {
            data.modifiedContent = data.modifiedContent + textToAdd;
        }

        // 更新行数
        data.lines = data.modifiedContent.split('\n').length;

        // 生成预览
        addTextPreview(data.name, data.modifiedContent, position, textToAdd);
    });

    // 重新渲染页面以显示更新后的内容
    renderTextPage();

    alert(`已将文本添加到 ${selected.length} 个文件的${position === 'start' ? '开头' : '结尾'}`);
}

function addTextPreview(name, content, position, addedText) {
    const timestamp = new Date().toLocaleString('zh-CN');
    textPreviewCounter++;

    const preview = {
        id: textPreviewCounter,
        name: name,
        content: content,
        position: position,
        addedText: addedText,
        timestamp: timestamp
    };

    textPreviews.push(preview);

    const emptyHint = textPreviewList.querySelector('.empty-hint');
    if (emptyHint) emptyHint.remove();

    const previewItem = document.createElement('div');
    previewItem.className = 'text-preview-item';
    previewItem.dataset.id = preview.id;

    const header = document.createElement('div');
    header.className = 'text-preview-item-header';

    const title = document.createElement('div');
    title.className = 'text-preview-item-title';
    title.textContent = name;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'text-preview-item-checkbox';
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            this.closest('.text-preview-item').classList.add('selected');
        } else {
            this.closest('.text-preview-item').classList.remove('selected');
        }
        updateSelectedPreviewCount();
    });

    header.appendChild(title);
    header.appendChild(checkbox);

    const info = document.createElement('div');
    info.className = 'text-preview-item-info';
    info.textContent = `添加位置: ${position === 'start' ? '开头' : '结尾'} | ${content.split('\n').length} 行`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'text-preview-item-content';
    contentDiv.textContent = content;

    const time = document.createElement('div');
    time.className = 'text-preview-item-time';
    time.textContent = timestamp;

    previewItem.appendChild(header);
    previewItem.appendChild(info);
    previewItem.appendChild(contentDiv);
    previewItem.appendChild(time);

    previewItem.addEventListener('click', function(e) {
        if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked;
            checkbox.dispatchEvent(new Event('change'));
        }
    });

    textPreviewList.insertBefore(previewItem, textPreviewList.firstChild);

    textSelectAllPreviewBtn.disabled = false;
    textDownloadSelectedBtn.disabled = false;
    textDeletePreviewBtn.disabled = false;

    updateSelectedPreviewCount();
}

function updateSelectedPreviewCount() {
    const total = textPreviews.length;
    const selected = textPreviewList.querySelectorAll('.text-preview-item.selected').length;

    document.getElementById('totalPreviews').textContent = total;
    document.getElementById('selectedPreviews').textContent = selected;
}

function toggleSelectAllTextPreview() {
    const checkboxes = textPreviewList.querySelectorAll('input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
        if (cb.checked) {
            cb.closest('.text-preview-item').classList.add('selected');
        } else {
            cb.closest('.text-preview-item').classList.remove('selected');
        }
    });
    updateSelectedPreviewCount();
}

async function downloadSelectedTexts() {
    const selectedItems = textPreviewList.querySelectorAll('.text-preview-item.selected');
    if (selectedItems.length === 0) {
        alert('请先选择要下载的文件');
        return;
    }

    // 单个文件直接下载
    if (selectedItems.length === 1) {
        const id = parseInt(selectedItems[0].dataset.id);
        const preview = textPreviews.find(p => p.id === id);
        if (preview) {
            const blob = new Blob([preview.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = preview.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        return;
    }

    // 多个文件打包成ZIP
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    selectedItems.forEach(item => {
        const id = parseInt(item.dataset.id);
        const preview = textPreviews.find(p => p.id === id);
        if (preview) {
            zip.file(preview.name, preview.content);
        }
    });

    // 生成ZIP文件并下载
    try {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `text_files_${timestamp}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        alert('打包下载失败：' + error.message);
    }
}

function deleteSelectedTextPreviews() {
    const selectedItems = textPreviewList.querySelectorAll('.text-preview-item.selected');
    if (selectedItems.length === 0) {
        alert('请先选择要删除的预览');
        return;
    }

    const confirmed = confirm(`确定要删除选中的 ${selectedItems.length} 个预览吗？`);
    if (!confirmed) return;

    const idsToDelete = Array.from(selectedItems).map(item => parseInt(item.dataset.id));
    textPreviews = textPreviews.filter(p => !idsToDelete.includes(p.id));

    selectedItems.forEach(item => item.remove());

    if (textPreviews.length === 0) {
        textPreviewList.innerHTML = '<p class="empty-hint">暂无预览，请先处理文件</p>';
        textSelectAllPreviewBtn.disabled = true;
        textDownloadSelectedBtn.disabled = true;
        textDeletePreviewBtn.disabled = true;
    }

    updateSelectedPreviewCount();
}

function prevTextPage() {
    if (textCurrentPage > 1) {
        textCurrentPage--;
        renderTextPage();
    }
}

function nextTextPage() {
    const displayCount = parseInt(textDisplayCountSelect.value);
    const totalPages = Math.ceil(textFileData.length / displayCount);
    if (textCurrentPage < totalPages) {
        textCurrentPage++;
        renderTextPage();
    }
}

function jumpToTextPage() {
    const pageInput = document.getElementById('textPageInput');
    const pageNum = parseInt(pageInput.value);
    const displayCount = parseInt(textDisplayCountSelect.value);
    const totalPages = Math.ceil(textFileData.length / displayCount);

    if (pageNum >= 1 && pageNum <= totalPages) {
        textCurrentPage = pageNum;
        renderTextPage();
    } else {
        alert(`请输入1到${totalPages}之间的页码`);
    }
}

function goToTextPageNumber(pageNum) {
    textCurrentPage = pageNum;
    renderTextPage();
}

function textPageInputKeyPress(e) {
    if (e.key === 'Enter') {
        jumpToTextPage();
    }
}
