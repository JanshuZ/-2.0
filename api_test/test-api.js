const http = require('http');

// API基础URL
const BASE_URL = 'http://ytictdev.natapp1.cc';

// 获取组织列表
function testGetOrganizationList() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({});
        
        const options = {
            hostname: 'ytictdev.natapp1.cc',
            port: 80,
            path: '/organization/getOrganizationList',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('获取组织列表成功:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    resolve(jsonData);
                } catch (error) {
                    console.error('解析JSON失败:', error);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('请求失败:', error);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// 获取车辆运行监控明细列表
function testGetVehicleMonitoringDetails() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            monitoringDate: '2025-12-23', // 监控日期
            teamIdList: [], // 车队ID列表，空表示所有车队
            current: 1, // 当前页
            size: 10, // 页大小
            sessionId: '' // sessionId
        });
        
        const options = {
            hostname: 'ytictdev.natapp1.cc',
            port: 80,
            path: '/vehicle/getVehMonitoringDetailsList',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log('获取车辆运行监控明细成功:');
                    console.log(JSON.stringify(jsonData, null, 2));
                    
                    // 检查数据结构
                    if (jsonData && jsonData.vehMonitoringDetailsList) {
                        console.log(`\n数据结构正确，包含 ${jsonData.vehMonitoringDetailsList.length} 条记录`);
                    } else {
                        console.log('\n警告: 返回数据结构不符合预期');
                    }
                    
                    resolve(jsonData);
                } catch (error) {
                    console.error('解析JSON失败:', error);
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('请求失败:', error);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// 运行测试
async function runTests() {
    console.log('开始测试API接口...\n');
    
    try {
        // 测试获取组织列表
        console.log('1. 测试获取组织列表');
        await testGetOrganizationList();
        console.log('\n' + '='.repeat(50) + '\n');
        
        // 测试获取车辆运行监控明细
        console.log('2. 测试获取车辆运行监控明细');
        await testGetVehicleMonitoringDetails();
        console.log('\n' + '='.repeat(50) + '\n');
        
        console.log('所有测试完成');
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

// 导出函数以便在其他地方使用
module.exports = {
    testGetOrganizationList,
    testGetVehicleMonitoringDetails,
    runTests
};

// 如果直接运行此脚本，则执行测试
if (require.main === module) {
    runTests();
}