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

