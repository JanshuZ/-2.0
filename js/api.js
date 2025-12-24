// API接口封装
const API = {
    // 基础URL，实际项目中需要替换为真实的API地址
    BASE_URL: 'http://ytictdev.natapp1.cc',
    
    // 获取组织列表
    async getOrganizations() {
        try {
            const response = await fetch(`${this.BASE_URL}/org/getOrgList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    teamId: '' // 车队ID，为空获取所有组织
                })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // 返回组织列表，根据API文档返回格式为 {orgList: [...]}
            return data.orgList || [];
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
            // 根据API文档，构建请求参数
            const requestBody = {
                monitoringDate: params.date || '', // 监控日期（yyyy-MM-dd），必填
                teamIdList: params.orgId ? [params.orgId] : [], // 车队ID列表，可选
                current: params.page || 1, // 当前页，可选
                size: params.pageSize || 1000, // 页大小，可选，设置较大值获取全部数据
                sessionId: params.sessionId || '' // sessionId，可选
            };
            
            const response = await fetch(`${this.BASE_URL}/vehicle/getVehMonitoringDetailsList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取车辆运行监控明细失败:', error);
            throw error;
        }
    },
    
    // 导出车辆运行监控明细列表
    async exportVehicleMonitoringDetails(params) {
        try {
            // 根据API文档，构建请求参数
            const requestBody = {
                monitoringDate: params.date || '', // 监控日期（yyyy-MM-dd），必填
                teamIdList: params.orgId ? [params.orgId] : [], // 车队ID列表，可选
                current: params.page || 1, // 当前页，可选
                size: params.pageSize || 1000, // 页大小，可选，设置较大值获取全部数据
                sessionId: params.sessionId || '' // sessionId，可选
            };
            
            const response = await fetch(`${this.BASE_URL}/vehicle/exportVehMonitoringDetailsList`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // 处理文件下载
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `车辆运行监控明细_${new Date().toISOString().split('T')[0]}.xls`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            return { success: true };
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