
// 页面加载时恢复设置
document.addEventListener('DOMContentLoaded', function() {
    // 先应用内置默认设置（如果是首次访问）
    applyBuiltinDefaultsIfNeeded();

    // 先检查URL是否有分享的设置
    loadSettingsFromURL();

    loadSettings();
    initPresetButtons();
    initBgImageUpload();
    initOpacitySlider();
    initPageSelector();
    initModeIconUpload();
    loadModeIcons();

    // 如果没有默认设置，自动保存当前设置为默认
    initializeDefaultSettings();
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

// 应用内置默认设置（仅在首次访问时）
function applyBuiltinDefaultsIfNeeded() {
    // 检查是否是首次访问（没有任何设置）
    const hasAppSettings = localStorage.getItem('appSettings') !== null;
    const hasModeIcons = localStorage.getItem('modeIcons') !== null;

    if (!hasAppSettings && !hasModeIcons) {
        // 首次访问，应用内置默认设置
        if (Object.keys(BUILTIN_DEFAULT_SETTINGS.appSettings).length > 0) {
            localStorage.setItem('appSettings', JSON.stringify(BUILTIN_DEFAULT_SETTINGS.appSettings));
            console.log('已应用内置应用设置');
        }

        if (Object.keys(BUILTIN_DEFAULT_SETTINGS.modeIcons).length > 0) {
            localStorage.setItem('modeIcons', JSON.stringify(BUILTIN_DEFAULT_SETTINGS.modeIcons));
            console.log('已应用内置模式图标');
        }
    }
}

// 将当前设置设为应用默认（生成代码）
function setAsBuiltinDefault() {
    const appSettings = localStorage.getItem('appSettings');
    const modeIcons = localStorage.getItem('modeIcons');

    // 格式化 JSON 为美观的代码
    const formattedAppSettings = appSettings ?
        JSON.stringify(JSON.parse(appSettings), null, 4).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n') :
        '{}';

    const formattedModeIcons = modeIcons ?
        JSON.stringify(JSON.parse(modeIcons), null, 4).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n') :
        '{}';

    const code = `// 应用的内置默认设置（可通过"设为应用默认"更新）
const BUILTIN_DEFAULT_SETTINGS = {
    appSettings: ${formattedAppSettings},
    modeIcons: ${formattedModeIcons}
};`;

    // 显示代码对话框
    showCodeDialog(code);
}

// 显示代码对话框
function showCodeDialog(code) {
    const dialog = document.createElement('div');
    dialog.className = 'share-link-dialog';
    dialog.innerHTML = `
        <div class="share-link-content" style="max-width: 800px;">
            <h3>设为应用默认设置</h3>
            <p>请复制以下代码，替换 script.js 中的 BUILTIN_DEFAULT_SETTINGS 常量：</p>
            <div style="position: relative;">
                <textarea id="codeOutput" readonly style="width: 100%; min-height: 200px; padding: 12px;
                         border: 2px solid #ddd; border-radius: 5px; font-family: monospace;
                         font-size: 12px; line-height: 1.5; resize: vertical;">${code}</textarea>
                <button onclick="copyCode()" class="btn-small"
                        style="position: absolute; top: 10px; right: 10px;">复制代码</button>
            </div>
            <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-radius: 5px; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 0.9em; color: #856404;">
                    <strong>提示：</strong>复制代码后，在 script.js 文件中找到 <code>const BUILTIN_DEFAULT_SETTINGS</code>，
                    将其替换为上面的代码。保存后提交到仓库，所有用户首次访问时将看到相同的设置。
                </p>
            </div>
            <button onclick="closeShareDialog()" class="btn-small" style="margin-top: 15px; width: 100%;">关闭</button>
        </div>
    `;
    document.body.appendChild(dialog);

    // 自动选中代码
    document.getElementById('codeOutput').select();
}

// 复制代码
function copyCode() {
    const textarea = document.getElementById('codeOutput');
    textarea.select();

    try {
        document.execCommand('copy');
        alert('代码已复制到剪贴板！');
    } catch (err) {
        navigator.clipboard.writeText(textarea.value).then(() => {
            alert('代码已复制到剪贴板！');
        }).catch(() => {
            alert('复制失败，请手动复制');
        });
    }
}

// 初始化默认设置（如果不存在，保存当前设置为默认）
function initializeDefaultSettings() {
    const hasDefaultSettings = localStorage.getItem('defaultAppSettings') !== null;

    if (!hasDefaultSettings) {
        // 自动保存当前设置为默认设置
        saveCurrentAsDefault();
    }
}

// 保存当前设置为默认设置
function saveCurrentAsDefault() {
    // 保存应用设置
    const currentAppSettings = localStorage.getItem('appSettings');
    if (currentAppSettings) {
        localStorage.setItem('defaultAppSettings', currentAppSettings);
    }

    // 保存模式图标
    const currentModeIcons = localStorage.getItem('modeIcons');
    if (currentModeIcons) {
        localStorage.setItem('defaultModeIcons', currentModeIcons);
    }

    console.log('当前设置已保存为默认设置');
}

// 更新默认设置
function updateDefaultSettings() {
    saveCurrentAsDefault();
    alert('已将当前设置更新为默认设置');
}

// 恢复到用户自定义的默认设置
function resetToDefault() {
    // 获取用户保存的默认设置
    const defaultAppSettings = localStorage.getItem('defaultAppSettings');
    const defaultModeIcons = localStorage.getItem('defaultModeIcons');

    if (defaultAppSettings) {
        // 恢复应用设置
        localStorage.setItem('appSettings', defaultAppSettings);
        const allSettings = JSON.parse(defaultAppSettings);

        // 恢复当前页面的设置
        const selectedPage = document.getElementById('pageSelector').value;
        loadPageSettings(selectedPage, allSettings);

        // 更新设置面板UI
        updateSettingsPanelUI(allSettings[selectedPage] || {});
    }

    if (defaultModeIcons) {
        // 恢复模式图标
        localStorage.setItem('modeIcons', defaultModeIcons);
        loadModeIcons();
    }

    alert('已恢复到您的默认设置');
}

// 更新设置面板的UI显示
function updateSettingsPanelUI(settings) {
    // 更新透明度滑块
    if (settings.opacity) {
        document.getElementById('opacitySlider').value = settings.opacity;
        document.getElementById('opacityValue').textContent = settings.opacity;
    }

    // 更新字体选择器
    if (settings.fontFamily) {
        document.getElementById('fontSelector').value = settings.fontFamily;
    }

    // 更新文字颜色选择器
    if (settings.textColor) {
        document.getElementById('textColorPicker').value = settings.textColor;
    }

    // 更新背景颜色选择器
    if (settings.bgType === 'color' && settings.bgValue) {
        document.getElementById('bgColorPicker').value = settings.bgValue;
    }

    // 更新背景图片预览
    const preview = document.getElementById('bgImagePreview');
    if (settings.bgType === 'image' && settings.bgImage) {
        preview.style.backgroundImage = `url(${settings.bgImage})`;
        preview.classList.add('active');
    } else {
        preview.style.backgroundImage = '';
        preview.classList.remove('active');
    }

    // 更新预设背景按钮状态
    document.querySelectorAll('.preset-bg').forEach(btn => {
        btn.classList.remove('active');
        if (settings.bgType === 'preset' && btn.getAttribute('data-type') === settings.bgValue) {
            btn.classList.add('active');
        }
    });
}

// ==================== URL分享设置 ====================
// 生成分享链接
function generateShareLink(includeImages = false) {
    try {
        // 获取当前所有设置
        const appSettings = localStorage.getItem('appSettings');
        const modeIcons = localStorage.getItem('modeIcons');

        let settingsData = {
            app: appSettings ? JSON.parse(appSettings) : {},
            icons: includeImages && modeIcons ? JSON.parse(modeIcons) : {}
        };

        // 如果不包含图片，移除背景图片数据
        if (!includeImages && settingsData.app) {
            settingsData.app = removeImageDataFromSettings(settingsData.app);
        }

        // 将设置编码为Base64
        const settingsJSON = JSON.stringify(settingsData);
        const settingsBase64 = btoa(encodeURIComponent(settingsJSON));

        // 生成完整URL
        const baseURL = window.location.origin + window.location.pathname;
        const shareURL = `${baseURL}?s=${settingsBase64}`;

        // 显示链接并复制
        showShareLinkDialog(shareURL, includeImages);
    } catch (error) {
        console.error('生成分享链接失败:', error);
        alert('生成分享链接失败，设置数据可能过大');
    }
}

// 移除设置中的图片数据
function removeImageDataFromSettings(appSettings) {
    const cleanSettings = JSON.parse(JSON.stringify(appSettings)); // 深拷贝

    // 遍历所有页面设置
    Object.keys(cleanSettings).forEach(page => {
        if (cleanSettings[page] && cleanSettings[page].bgImage) {
            // 移除背景图片数据
            delete cleanSettings[page].bgImage;
            // 如果背景类型是图片，改为默认预设
            if (cleanSettings[page].bgType === 'image') {
                cleanSettings[page].bgType = 'preset';
                cleanSettings[page].bgValue = 'gradient1';
            }
        }
    });

    return cleanSettings;
}

// 显示分享链接对话框
function showShareLinkDialog(url, includeImages) {
    const dialog = document.createElement('div');
    dialog.className = 'share-link-dialog';

    const imageNote = includeImages ?
        '<p style="font-size: 0.85em; color: #ff9800; margin-top: 10px;">⚠️ 包含图片数据，链接较长</p>' :
        '<p style="font-size: 0.85em; color: #4caf50; margin-top: 10px;">✓ 已优化，不包含图片数据</p>';

    dialog.innerHTML = `
        <div class="share-link-content">
            <h3>分享链接已生成</h3>
            <p>复制此链接，在任何设备上打开即可应用相同设置：</p>
            <div class="share-link-box">
                <input type="text" value="${url}" id="shareLinkInput" readonly>
                <button onclick="copyShareLink()" class="btn-small">复制</button>
            </div>
            ${imageNote}
            <div style="margin-top: 15px; padding: 10px; background: #f5f5f5; border-radius: 5px;">
                <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" id="includeImagesCheckbox" ${includeImages ? 'checked' : ''}
                           onchange="regenerateShareLink()">
                    <span style="font-size: 0.9em;">包含背景图片和模式图标（会增加链接长度）</span>
                </label>
            </div>
            <button onclick="closeShareDialog()" class="btn-small" style="margin-top: 15px;">关闭</button>
        </div>
    `;
    document.body.appendChild(dialog);

    // 自动选中链接
    document.getElementById('shareLinkInput').select();
}

// 重新生成分享链接
function regenerateShareLink() {
    const includeImages = document.getElementById('includeImagesCheckbox').checked;
    closeShareDialog();
    generateShareLink(includeImages);
}

// 复制分享链接
function copyShareLink() {
    const input = document.getElementById('shareLinkInput');
    input.select();

    try {
        document.execCommand('copy');
        alert('链接已复制到剪贴板！');
    } catch (err) {
        // 使用现代API
        navigator.clipboard.writeText(input.value).then(() => {
            alert('链接已复制到剪贴板！');
        }).catch(() => {
            alert('复制失败，请手动复制');
        });
    }
}

// 关闭分享对话框
function closeShareDialog() {
    const dialog = document.querySelector('.share-link-dialog');
    if (dialog) {
        dialog.remove();
    }
}

// 从URL加载设置
function loadSettingsFromURL() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        // 支持新旧参数名：s 和 settings
        const settingsParam = urlParams.get('s') || urlParams.get('settings');

        if (settingsParam) {
            // 解码Base64
            const settingsJSON = decodeURIComponent(atob(settingsParam));
            const settingsData = JSON.parse(settingsJSON);

            // 应用设置
            if (settingsData.app && Object.keys(settingsData.app).length > 0) {
                localStorage.setItem('appSettings', JSON.stringify(settingsData.app));
            }

            if (settingsData.icons && Object.keys(settingsData.icons).length > 0) {
                localStorage.setItem('modeIcons', JSON.stringify(settingsData.icons));
            }

            // 清除URL参数，避免重复应用
            const cleanURL = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanURL);

            console.log('已从URL加载设置');

            // 显示提示
            setTimeout(() => {
                alert('已成功应用分享的设置！');
            }, 500);
        }
    } catch (error) {
        console.error('从URL加载设置失败:', error);
        alert('加载设置失败，链接可能已损坏');
    }
}

// ==================== 模式切换 ====================
