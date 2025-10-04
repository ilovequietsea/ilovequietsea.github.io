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
