// ==================== 页面加载与设置应用 ====================

// 加载设置（从内存变量）
function loadSettings() {
    const page = document.getElementById('pageSelector').value;
    loadPageSettings(page);
}

// 加载特定页面的设置
function loadPageSettings(page) {
    const settings = currentSettings[page] || currentSettings.all || currentSettings;

    // 应用背景
    if (settings.bgType === 'preset' && settings.bgValue) {
        applyPresetBackground(settings.bgValue);
    } else if (settings.bgType === 'color' && settings.bgValue) {
        applyBackground(settings.bgValue);
    } else if (settings.bgType === 'image' && settings.bgImage) {
        applyBgImage(settings.bgImage);
    }

    // 应用透明度
    if (settings.opacity) {
        applyOpacity(settings.opacity);
    }

    // 应用文字设置
    if (settings.fontFamily) {
        applyFont(settings.fontFamily);
    }
    if (settings.textColor) {
        applyTextColor(settings.textColor);
    }
}

// 保存设置（仅更新内存变量）
function saveSettings(type, value, bgImage = null) {
    const page = document.getElementById('pageSelector').value;

    if (!currentSettings[page]) {
        currentSettings[page] = {};
    }

    if (type === 'bgType' || type === 'bgValue') {
        currentSettings[page].bgType = type === 'bgType' ? value : currentSettings[page].bgType;
        currentSettings[page].bgValue = type === 'bgValue' ? value : currentSettings[page].bgValue;
    } else if (type === 'bgImage') {
        currentSettings[page].bgType = 'image';
        currentSettings[page].bgImage = bgImage;
    } else if (type === 'opacity') {
        currentSettings[page].opacity = value;
    }
}

// ==================== 设置面板初始化 ====================

function initPageSelector() {
    const pageSelector = document.getElementById('pageSelector');
    pageSelector.addEventListener('change', function() {
        currentPage = this.value;
        loadSettings();
        updateSettingsPanelUI(currentSettings[this.value] || currentSettings.all || currentSettings);
    });
}

function openSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.add('active');
    updateSettingsPanelUI(currentSettings[currentPage] || currentSettings.all || currentSettings);

    // 延迟添加点击监听，避免立即触发
    setTimeout(() => {
        settingsPanel.addEventListener('click', handleSettingsPanelClick);
    }, 100);
}

function closeSettings() {
    const settingsPanel = document.getElementById('settingsPanel');
    settingsPanel.classList.remove('active');
    settingsPanel.removeEventListener('click', handleSettingsPanelClick);
}

function handleSettingsPanelClick(e) {
    // 只有点击到背景层（settingsPanel）时才关闭，点击内容区域不关闭
    if (e.target.id === 'settingsPanel') {
        closeSettings();
    }
}

// 更新设置面板 UI
function updateSettingsPanelUI(settings) {
    if (!settings) return;

    // 更新背景类型选择
    if (settings.bgType) {
        const bgTypeRadios = document.querySelectorAll('input[name="bgType"]');
        bgTypeRadios.forEach(radio => {
            radio.checked = radio.value === settings.bgType;
        });
    }

    // 更新透明度滑块
    if (settings.opacity) {
        const opacitySlider = document.getElementById('opacitySlider');
        const opacityValue = document.getElementById('opacityValue');
        if (opacitySlider) {
            opacitySlider.value = settings.opacity;
            opacityValue.textContent = settings.opacity + '%';
        }
    }

    // 更新字体选择
    if (settings.fontFamily) {
        const fontSelect = document.getElementById('fontSelector');
        if (fontSelect) {
            fontSelect.value = settings.fontFamily;
        }
    }

    // 更新文字颜色
    if (settings.textColor) {
        const textColorPicker = document.getElementById('textColorPicker');
        if (textColorPicker) {
            textColorPicker.value = settings.textColor;
        }
    }
}

// ==================== 背景预设 ====================

function initPresetButtons() {
    document.querySelectorAll('.preset-bg').forEach(btn => {
        btn.addEventListener('click', function() {
            const presetType = this.dataset.type;
            applyPresetBackground(presetType);
            saveSettings('bgType', 'preset');
            saveSettings('bgValue', presetType);
        });
    });
}

function applyPresetBackground(type) {
    const bg = BG_PRESETS[type];
    if (bg) {
        applyBackground(bg);
    }
}

// ==================== 自定义颜色 ====================

function applyCustomColor() {
    const color = document.getElementById('bgColorPicker').value;
    applyBackground(color);
    saveSettings('bgType', 'color');
    saveSettings('bgValue', color);
}

// ==================== 背景应用 ====================

function applyBackground(bg) {
    document.body.style.background = bg;
    currentBgImage = null;
}

// ==================== 背景图片 ====================

function initBgImageUpload() {
    const bgImageInput = document.getElementById('bgImageInput');
    bgImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const imageData = event.target.result;
                applyBgImage(imageData);
                saveSettings('bgImage', null, imageData);
            };
            reader.readAsDataURL(file);
        }
    });
}

function applyBgImage(imageData) {
    document.body.style.background = `url(${imageData}) no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
    currentBgImage = imageData;
}

function removeBgImage() {
    currentBgImage = null;
    const page = document.getElementById('pageSelector').value;
    if (currentSettings[page]) {
        delete currentSettings[page].bgImage;
    }
    applyBackground(BG_PRESETS.gradient1);
    saveSettings('bgType', 'preset');
    saveSettings('bgValue', 'gradient1');
}

// ==================== 透明度 ====================

function initOpacitySlider() {
    const opacitySlider = document.getElementById('opacitySlider');
    const opacityValue = document.getElementById('opacityValue');

    opacitySlider.addEventListener('input', function() {
        const value = this.value;
        opacityValue.textContent = value + '%';
        applyOpacity(value);
        saveSettings('opacity', value);
    });
}

function applyOpacity(value) {
    const container = document.querySelector('.container');
    if (container) {
        container.style.backgroundColor = `rgba(255, 255, 255, ${value / 100})`;
    }
}

// ==================== 文字设置 ====================

function applyTextSettings() {
    const fontFamily = document.getElementById('fontSelector').value;
    const textColor = document.getElementById('textColorPicker').value;

    applyFont(fontFamily);
    applyTextColor(textColor);

    const page = document.getElementById('pageSelector').value;
    if (!currentSettings[page]) {
        currentSettings[page] = {};
    }
    currentSettings[page].fontFamily = fontFamily;
    currentSettings[page].textColor = textColor;
}

function applyFont(fontFamily) {
    document.body.style.fontFamily = fontFamily;
}

function applyTextColor(color) {
    document.body.style.color = color;
}

// ==================== 模式图标 ====================

let modeIcons = {};

function initModeIconUpload() {
    ['single', 'batch', 'text'].forEach(mode => {
        const input = document.getElementById(`${mode}IconInput`);
        const resetBtn = document.getElementById(`reset${mode.charAt(0).toUpperCase() + mode.slice(1)}Icon`);

        if (input) {
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        applyModeIcon(mode, event.target.result);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                resetModeIcon(mode);
            });
        }
    });
}

function applyModeIcon(mode, imageData) {
    modeIcons[mode] = imageData;
    const btn = document.querySelector(`[onclick="selectMode('${mode}')"]`);
    if (btn) {
        let icon = btn.querySelector('.mode-icon');
        if (icon) {
            // 如果是 div 元素，需要转换为 img 元素
            if (icon.tagName === 'DIV') {
                const img = document.createElement('img');
                img.className = 'mode-icon';
                img.id = icon.id;
                icon.parentNode.replaceChild(img, icon);
                icon = img;
            }
            icon.src = imageData;
            icon.style.fontSize = '0';
        }
    }
}

function loadModeIcons() {
    Object.keys(modeIcons).forEach(mode => {
        const imageData = modeIcons[mode];
        const btn = document.querySelector(`[onclick="selectMode('${mode}')"]`);
        if (btn && imageData) {
            const img = btn.querySelector('.mode-icon');
            if (img) {
                img.src = imageData;
                img.style.fontSize = '0';
            }
        }
    });
}

// 初始化默认模式图标
function initDefaultModeIcons() {
    ['single', 'batch', 'text'].forEach(mode => {
        const defaultIcon = DEFAULT_MODE_ICONS[mode];
        // 如果是图片路径，应用默认图片
        if (defaultIcon && defaultIcon.includes('.png')) {
            applyModeIcon(mode, defaultIcon);
        }
    });
}

function resetModeIcon(mode) {
    delete modeIcons[mode];
    const defaultIcon = DEFAULT_MODE_ICONS[mode];

    // 如果默认图标是图片路径，应用默认图片
    if (defaultIcon && defaultIcon.includes('.png')) {
        applyModeIcon(mode, defaultIcon);
    } else {
        // 如果是 emoji 或其他文本，恢复为文本
        const btn = document.querySelector(`[onclick="selectMode('${mode}')"]`);
        if (btn) {
            const icon = btn.querySelector('.mode-icon');
            if (icon) {
                icon.textContent = defaultIcon;
                icon.style.fontSize = '';
                icon.removeAttribute('src');
            }
        }
    }
}

// ==================== URL 分享设置 ====================

function generateShareLink(includeImages = false) {
    const page = document.getElementById('pageSelector').value;
    const settings = currentSettings[page] || currentSettings.all || currentSettings;

    let shareSettings = JSON.parse(JSON.stringify(settings));

    if (!includeImages) {
        shareSettings = removeImageDataFromSettings(shareSettings);
    }

    const settingsStr = encodeURIComponent(JSON.stringify(shareSettings));
    const url = `${window.location.origin}${window.location.pathname}?settings=${settingsStr}`;

    showShareLinkDialog(url, includeImages);
}

function removeImageDataFromSettings(settings) {
    const cleaned = { ...settings };
    if (cleaned.bgImage && cleaned.bgImage.startsWith('data:')) {
        delete cleaned.bgImage;
    }
    if (cleaned.all) {
        cleaned.all = removeImageDataFromSettings(cleaned.all);
    }
    Object.keys(cleaned).forEach(key => {
        if (typeof cleaned[key] === 'object' && cleaned[key] !== null) {
            if (cleaned[key].bgImage && cleaned[key].bgImage.startsWith('data:')) {
                delete cleaned[key].bgImage;
            }
        }
    });
    return cleaned;
}

function showShareLinkDialog(url, includeImages) {
    document.getElementById('shareDialog').classList.add('show');
    document.getElementById('shareLinkUrl').value = url;
    document.getElementById('includeImagesCheckbox').checked = includeImages;
}

function regenerateShareLink() {
    const includeImages = document.getElementById('includeImagesCheckbox').checked;
    generateShareLink(includeImages);
}

function copyShareLink() {
    const urlInput = document.getElementById('shareLinkUrl');
    urlInput.select();
    document.execCommand('copy');

    const copyBtn = event.target;
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '已复制！';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

function closeShareDialog() {
    document.getElementById('shareDialog').classList.remove('show');
}

function loadSettingsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const settingsParam = urlParams.get('settings');

    if (settingsParam) {
        try {
            const sharedSettings = JSON.parse(decodeURIComponent(settingsParam));
            const page = document.getElementById('pageSelector').value;
            currentSettings[page] = { ...currentSettings[page], ...sharedSettings };
            loadPageSettings(page);
        } catch (e) {
            console.error('无法解析分享的设置:', e);
        }
    }
}
