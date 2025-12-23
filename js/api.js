// API接口封装
const API = {
    // 基础URL，实际项目中需要替换为真实的API地址
    BASE_URL: 'https://api.example.com',
    
    // 获取组织列表
    async getOrganizations() {
        try {
            const response = await fetch(`${this.BASE_URL}/organizations`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('获取组织列表失败:', error);
            throw error;
        }
    },
    
    // 获取车辆列表
    async getVehicles(orgId = '') {
        try {
            const url = orgId ? `${this.BASE_URL}/vehicles?orgId=${orgId}` : `${this.BASE_URL}/vehicles`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('获取车辆列表失败:', error);
            throw error;
        }
    },
    
    // 获取车辆运行监控明细列表
    async getVehicleMonitoringDetails(params) {
        try {
            const queryParams = new URLSearchParams();
            
            // 添加查询参数
            if (params.orgId) queryParams.append('orgId', params.orgId);
            if (params.vehicleNumber) queryParams.append('vehicleNumber', params.vehicleNumber);
            if (params.date) queryParams.append('date', params.date);
            if (params.page) queryParams.append('page', params.page);
            if (params.pageSize) queryParams.append('pageSize', params.pageSize);
            
            const url = `${this.BASE_URL}/vehicle-monitoring-details?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取车辆运行监控明细失败:', error);
            throw error;
        }
    },
    
    // 导出车辆运行监控明细列表
    exportVehicleMonitoringDetails(params) {
        try {
            const queryParams = new URLSearchParams();
            
            // 添加查询参数
            if (params.orgId) queryParams.append('orgId', params.orgId);
            if (params.vehicleNumber) queryParams.append('vehicleNumber', params.vehicleNumber);
            if (params.date) queryParams.append('date', params.date);
            
            const url = `${this.BASE_URL}/export-vehicle-monitoring-details?${queryParams.toString()}`;
            
            // 创建隐藏的下载链接
            const link = document.createElement('a');
            link.href = url;
            link.download = `车辆运行监控明细_${new Date().toISOString().split('T')[0]}.xls`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('导出车辆运行监控明细失败:', error);
            throw error;
        }
    },
    
    // 获取车辆ACC开关统计
    async getVehicleAccStats(params) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.orgId) queryParams.append('orgId', params.orgId);
            if (params.vehicleNumber) queryParams.append('vehicleNumber', params.vehicleNumber);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            
            const url = `${this.BASE_URL}/vehicle-acc-stats?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取车辆ACC开关统计失败:', error);
            throw error;
        }
    },
    
    // 获取车辆里程
    async getVehicleMileage(params) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.orgId) queryParams.append('orgId', params.orgId);
            if (params.vehicleNumber) queryParams.append('vehicleNumber', params.vehicleNumber);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            
            const url = `${this.BASE_URL}/vehicle-mileage?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取车辆里程失败:', error);
            throw error;
        }
    },
    
    // 获取车辆轨迹
    async getVehicleTracks(params) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.vehicleNumber) queryParams.append('vehicleNumber', params.vehicleNumber);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            
            const url = `${this.BASE_URL}/vehicle-tracks?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取车辆轨迹失败:', error);
            throw error;
        }
    },
    
    // 导入车辆报警记录
    async importVehicleAlarmRecords(file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${this.BASE_URL}/vehicle/importVehAlertRecords`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('导入车辆报警记录失败:', error);
            throw error;
        }
    },
    
    // 获取驾驶员签到签退记录
    async getDriverAttendanceRecords(params) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.driverId) queryParams.append('driverId', params.driverId);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            
            const url = `${this.BASE_URL}/driver-attendance-records?${queryParams.toString()}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('获取驾驶员签到签退记录失败:', error);
            throw error;
        }
    }
};

// 导出API对象
window.API = API;