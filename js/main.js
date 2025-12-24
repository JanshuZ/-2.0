// 全局变量
let currentPage = 1;
let pageSize = 20;
let totalRecords = 0;
let totalPages = 0;
let fleetData = [];
let tableData = [];
let filteredData = [];

// 缓存变量
let cachedData = null;
let cachedOrgId = null;
let cachedDate = null;
let cachedViolationCount = null;
let cachedNormalCount = null;

// DOM元素
const fleetSelector = document.getElementById('fleetSelector');
const reportDate = document.getElementById('reportDate');
const searchBtn = document.getElementById('searchBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');
const quickSearch = document.getElementById('quickSearch') || null;
const quickSearchBtn = document.getElementById('quickSearchBtn') || null;
const tableBody = document.getElementById('tableBody');
const noDataMessage = document.getElementById('noDataMessage');
const loadingMessage = document.getElementById('loadingMessage');
const pagination = document.getElementById('pagination');
const pageSizeSelector = document.getElementById('pageSizeSelector');
const gotoPage = document.getElementById('gotoPage');
const gotoPageBtn = document.getElementById('gotoPageBtn');
const totalRecordsElement = document.getElementById('totalRecords');
const violationCountElement = document.getElementById('violationCount');
const normalCountElement = document.getElementById('normalCount');
const currentPageInfoElement = document.getElementById('currentPageInfo');
const totalRecordsCountElement = document.getElementById('totalRecordsCount');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    bindEvents();
});

// 初始化页面
function initializePage() {
    // 设置默认日期（2025年12月23日）
    const defaultDate = new Date('2025-12-23');
    const formattedDefaultDate = formatDateForInput(defaultDate);
    reportDate.value = formattedDefaultDate;
    
    // 加载车队数据
    loadFleetData();
    
    // 加载表格数据
    loadTableData();
}

// 绑定事件
function bindEvents() {
    searchBtn.addEventListener('click', handleSearch);
    exportBtn.addEventListener('click', handleExport);
    importBtn.addEventListener('click', handleImport);
    importFileInput.addEventListener('change', handleFileSelect);
    
    // 车队选择器和日期选择器变化时清除缓存
    fleetSelector.addEventListener('change', function() {
        // 清除缓存，因为搜索条件可能发生变化
        cachedData = null;
        cachedOrgId = null;
        cachedDate = null;
        cachedViolationCount = null;
        cachedNormalCount = null;
    });
    
    reportDate.addEventListener('change', function() {
        // 清除缓存，因为搜索条件可能发生变化
        cachedData = null;
        cachedOrgId = null;
        cachedDate = null;
        cachedViolationCount = null;
        cachedNormalCount = null;
    });
    
    // 只有当快速搜索元素存在时才绑定事件
    if (quickSearchBtn) {
        quickSearchBtn.addEventListener('click', handleQuickSearch);
    }
    if (quickSearch) {
        quickSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                handleQuickSearch();
            }
        });
    }
    
    pageSizeSelector.addEventListener('change', handlePageSizeChange);
    gotoPageBtn.addEventListener('click', handleGotoPage);
    gotoPage.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            handleGotoPage();
        }
    });
}

// 加载车队数据
async function loadFleetData() {
    try {
        // 调用API获取组织列表
        const data = await API.getOrganizations();
        fleetData = data;
        
        // 填充车队选择器
        fleetSelector.innerHTML = '<option value="">请选择车队</option>';
        fleetData.forEach(fleet => {
            const option = document.createElement('option');
            option.value = fleet.teamId; // 使用teamId作为值
            option.textContent = fleet.teamName; // 使用teamName作为显示文本
            fleetSelector.appendChild(option);
        });
    } catch (error) {
        console.error('加载车队数据失败:', error);
        // 如果API调用失败，使用模拟数据
        fleetData = [
            { teamId: '1', teamName: '第一车队' },
            { teamId: '2', teamName: '第二车队' },
            { teamId: '3', teamName: '第三车队' },
            { teamId: '4', teamName: '第四车队' },
            { teamId: '5', teamName: '第五车队' }
        ];
        
        // 填充车队选择器
        fleetSelector.innerHTML = '<option value="">请选择车队</option>';
        fleetData.forEach(fleet => {
            const option = document.createElement('option');
            option.value = fleet.teamId; // 使用teamId作为值
            option.textContent = fleet.teamName; // 使用teamName作为显示文本
            fleetSelector.appendChild(option);
        });
        
        showErrorToast('加载车队数据失败，使用模拟数据');
    }
}

// 加载表格数据
async function loadTableData() {
    showLoading(true);
    
    try {
        const currentOrgId = fleetSelector.value;
        const currentDate = reportDate.value;
        
        // 检查是否有缓存数据且是同一车队和同一日期
        if (cachedData && cachedOrgId === currentOrgId && cachedDate === currentDate) {
            // 使用缓存数据
            tableData = processApiData(cachedData);
        } else {
            // 没有缓存或车队/日期发生变化，重新请求数据
            const data = await API.getVehicleMonitoringDetails({
                orgId: currentOrgId,
                date: currentDate
            });
            
            // 更新缓存
            cachedData = data;
            cachedOrgId = currentOrgId;
            cachedDate = currentDate;
            
            // 处理API返回的数据
            tableData = processApiData(data);
            
            // 更新统计信息（使用API返回的统计数据）
            if (data.vehicleCount !== undefined) {
                totalRecords = data.vehicleCount;
            }
            if (data.violationVehicleCount !== undefined) {
                cachedViolationCount = data.violationVehicleCount;
            }
            if (data.parkedVehicleCount !== undefined) {
                cachedNormalCount = data.parkedVehicleCount;
            }
        }
        
        // 应用快速搜索筛选
        applyQuickSearchFilter();
        
        // 计算分页
        calculatePagination();
        
        // 更新表格
        updateTable();
        
        // 更新统计信息
        updateStatistics();
        
        // 更新分页控件
        updatePagination();
        
    } catch (error) {
        console.error('加载表格数据失败:', error);
        // 如果API调用失败，使用模拟数据
        tableData = generateMockData();
        
        // 应用快速搜索筛选
        applyQuickSearchFilter();
        
        // 计算分页
        calculatePagination();
        
        // 更新表格
        updateTable();
        
        // 更新统计信息
        updateStatistics();
        
        // 更新分页控件
        updatePagination();
        
        showErrorToast('加载数据失败，使用模拟数据');
    } finally {
        showLoading(false);
    }
}

// 处理API返回的数据
function processApiData(apiResponse) {
    // 根据API文档，返回的数据结构是VehMonitoringDetailsListRspData
    // 包含vehMonitoringDetailsList数组，每个元素是车辆运行监控明细
    
    if (!apiResponse || !apiResponse.vehMonitoringDetailsList) {
        console.warn('API返回的数据结构不符合预期:', apiResponse);
        return [];
    }
    
    // 将API返回的数据转换为前端需要的格式
    return apiResponse.vehMonitoringDetailsList.map(item => ({
        id: item.carId || '',
        vehicleNumber: item.carPlate || '',
        driverName: item.driverName || '',
        startLocation: item.startAddr || '',
        departureTime: item.startTime || '',
        destination: item.endAddr || '',
        route: item.waypoints || '',
        speed: item.speed || '0',
        arrivalTime: item.endTime || '',
        mileage: item.mileage || '0',
        recordContent: item.driverSafetyAlerts || '正常',
        processingStatus: item.alertDisposition || '',
        isViolation: item.driverSafetyAlerts && item.driverSafetyAlerts !== '正常'
    }));
}

// 生成模拟数据
function generateMockData() {
    const mockData = [];
    const violationTypes = ['正常', '超速行驶', '疲劳驾驶', '接打电话', '未系安全带', '设备遮挡'];
    const driverNames = ['张三', '李四', '王五', '赵六', '陈七', '刘八', '周九', '吴十'];
    const locations = [
        '广东省江门市江海区外海街道',
        '广东省江门市新会区三江镇',
        '广东省江门市鹤山市沙坪街道',
        '广东省江门市蓬江区杜阮镇',
        '广东省江门市新会区双水镇'
    ];
    
    for (let i = 1; i <= 147; i++) {
        const violationType = Math.random() > 0.8 ? violationTypes[Math.floor(Math.random() * (violationTypes.length - 1)) + 1] : '正常';
        const isViolation = violationType !== '正常';
        
        mockData.push({
            id: i,
            vehicleNumber: `粤J${Math.floor(Math.random() * 90000) + 10000}`,
            driverName: driverNames[Math.floor(Math.random() * driverNames.length)],
            startLocation: locations[Math.floor(Math.random() * locations.length)],
            departureTime: generateRandomDate(),
            destination: locations[Math.floor(Math.random() * locations.length)],
            route: `S${Math.floor(Math.random() * 900) + 100}省道`,
            speed: (Math.random() * 60 + 40).toFixed(1),
            arrivalTime: generateRandomDate(),
            mileage: (Math.random() * 150 + 50).toFixed(2),
            recordContent: isViolation ? `${violationType}，已记录违规行为` : '正常',
            processingStatus: isViolation ? '处理中' : '无需处理',
            isViolation: isViolation
        });
    }
    
    return mockData;
}

// 生成随机日期
function generateRandomDate() {
    const selectedDate = new Date(reportDate.value);
    // 在选定日期的基础上随机生成时间
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);
    selectedDate.setHours(randomHours, randomMinutes, 0, 0);
    return formatDateTime(selectedDate);
}

// 应用快速搜索筛选
function applyQuickSearchFilter() {
    // 如果快速搜索框不存在，直接返回所有数据
    if (!quickSearch) {
        filteredData = [...tableData];
        return;
    }
    
    const searchTerm = quickSearch.value.trim().toLowerCase();
    
    if (!searchTerm) {
        filteredData = [...tableData];
        return;
    }
    
    filteredData = tableData.filter(item => 
        item.vehicleNumber.toLowerCase().includes(searchTerm) ||
        item.driverName.toLowerCase().includes(searchTerm) ||
        item.recordContent.toLowerCase().includes(searchTerm)
    );
}

// 计算分页
function calculatePagination() {
    totalRecords = filteredData.length;
    totalPages = Math.ceil(totalRecords / pageSize);
    
    // 确保当前页在有效范围内
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
}

// 截断文本并添加悬停提示
function truncateText(text, maxLength = 10) {
    if (!text || text.length <= maxLength) {
        return text;
    }
    return `<span class="truncate-text" title="${text}">${text.substring(0, maxLength)}...</span>`;
}

// 更新表格
function updateTable() {
    if (filteredData.length === 0) {
        tableBody.innerHTML = '';
        noDataMessage.classList.remove('d-none');
        return;
    }
    
    noDataMessage.classList.add('d-none');
    
    // 计算当前页的数据
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredData.length);
    const currentPageData = filteredData.slice(startIndex, endIndex);
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 填充表格数据
    currentPageData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // 如果是违规记录，添加特殊样式
        if (item.isViolation) {
            row.classList.add('violation-row');
        }
        
        row.innerHTML = `
            <td class="text-center">${startIndex + index + 1}</td>
            <td class="text-center">${item.vehicleNumber}</td>
            <td class="text-center">${truncateText(item.driverName, 8)}</td>
            <td class="text-center">${item.startLocation}</td>
            <td class="text-center">${item.departureTime}</td>
            <td class="text-center">${item.destination}</td>
            <td class="text-center">${item.route}</td>
            <td class="text-center">${item.speed}</td>
            <td class="text-center">${item.arrivalTime}</td>
            <td class="text-center">${item.mileage}</td>
            <td class="text-center">
                <div class="record-content" title="${item.recordContent}">
                    ${item.isViolation ? '<span class="violation-badge">违规</span> ' : ''}
                    ${item.recordContent}
                </div>
            </td>
            <td class="text-center">${item.processingStatus}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// 更新统计信息
function updateStatistics() {
    // 计算违规车辆和正常车辆数量
    let violationCount, normalCount;
    
    // 从所有数据（不是当前页面数据）中计算违规和正常车辆数量
    violationCount = tableData.filter(item => item.isViolation).length;
    normalCount = tableData.filter(item => !item.isViolation).length;
    
    // 如果API返回了统计数据，可以用来验证我们的计算是否正确
    if (cachedViolationCount !== null) {
        console.log(`API返回违规车辆数: ${cachedViolationCount}, 前端计算违规车辆数: ${violationCount}`);
    }
    
    totalRecordsElement.textContent = totalRecords;
    violationCountElement.textContent = violationCount;
    normalCountElement.textContent = normalCount;
    currentPageInfoElement.textContent = `${totalPages > 0 ? currentPage : 0}/${totalPages}`;
    
    // 更新页面底部的总记录数
    totalRecordsCountElement.textContent = totalRecords;
}

// 更新分页控件
function updatePagination() {
    pagination.innerHTML = '';
    
    if (totalPages <= 1) {
        return;
    }
    
    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updateTable();
            updatePagination();
            updateStatistics();
        }
    });
    pagination.appendChild(prevLi);
    
    // 页码按钮
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            updateTable();
            updatePagination();
            updateStatistics();
        });
        pagination.appendChild(pageLi);
    }
    
    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            updateTable();
            updatePagination();
            updateStatistics();
        }
    });
    pagination.appendChild(nextLi);
    
    // 更新跳转输入框的最大值
    gotoPage.max = totalPages;
    gotoPage.value = currentPage;
}

// 处理搜索
function handleSearch() {
    // 重置分页
    currentPage = 1;
    
    // 清空数据
    tableData = [];
    filteredData = [];
    totalRecords = 0;
    totalPages = 0;
    
    // 清除缓存，因为搜索条件可能发生变化
    cachedData = null;
    cachedOrgId = null;
    cachedDate = null;
    cachedViolationCount = null;
    cachedNormalCount = null;
    
    // 重新加载数据
    loadTableData();
}

// 处理导出
async function handleExport() {
    try {
        // 调用API导出车辆运行监控明细
        await API.exportVehicleMonitoringDetails({
            orgId: fleetSelector.value,
            date: reportDate.value
        });
        
        showSuccessToast('导出成功');
    } catch (error) {
        console.error('导出失败:', error);
        showErrorToast('导出失败，请稍后重试');
    }
}

// 处理快速搜索
function handleQuickSearch() {
    currentPage = 1;
    applyQuickSearchFilter();
    calculatePagination();
    updateTable();
    updateStatistics();
    updatePagination();
}

// 处理每页显示数量变化
function handlePageSizeChange() {
    pageSize = parseInt(pageSizeSelector.value);
    currentPage = 1;
    calculatePagination();
    updateTable();
    updatePagination();
    updateStatistics();
}

// 处理跳转到指定页
function handleGotoPage() {
    const targetPage = parseInt(gotoPage.value);
    
    if (isNaN(targetPage) || targetPage < 1 || targetPage > totalPages) {
        showErrorToast('请输入有效的页码');
        return;
    }
    
    currentPage = targetPage;
    updateTable();
    updatePagination();
    updateStatistics();
}

// 显示/隐藏加载状态
function showLoading(show) {
    if (show) {
        loadingMessage.classList.remove('d-none');
        noDataMessage.classList.add('d-none');
    } else {
        loadingMessage.classList.add('d-none');
    }
}

// 显示成功提示
function showSuccessToast(message) {
    // 这里可以使用Bootstrap的Toast组件或其他通知库
    alert(message);
}

// 显示错误提示
function showErrorToast(message) {
    // 这里可以使用Bootstrap的Toast组件或其他通知库
    alert(message);
}

// 格式化日期为输入框可接受的格式
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 格式化日期时间
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 处理导入按钮点击事件
function handleImport() {
    // 触发文件选择对话框
    importFileInput.click();
}

// 处理文件选择事件
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (!file) {
        return;
    }
    
    // 验证文件类型
    const validTypes = [
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx)$/i)) {
        showErrorToast('请选择Excel文件（.xls或.xlsx格式）');
        // 重置文件输入
        importFileInput.value = '';
        return;
    }
    
    // 显示加载状态
    showLoading(true);
    
    // 调用API上传文件
    API.importVehicleAlarmRecords(file)
        .then(response => {
            showSuccessToast('文件导入成功');
            // 重置文件输入
            importFileInput.value = '';
            // 重新加载数据
            loadTableData();
        })
        .catch(error => {
            console.error('导入失败:', error);
            showErrorToast('文件导入失败: ' + (error.message || '未知错误'));
            // 重置文件输入
            importFileInput.value = '';
        })
        .finally(() => {
            // 隐藏加载状态
            showLoading(false);
        });
}