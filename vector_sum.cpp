#include <iostream>
#include <vector>
#include <numeric>  // for accumulate

int main() {
    // 创建一个vector数组
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // 方法1：使用for循环
    int sum1 = 0;
    for(int num : numbers) {
        sum1 += num;
    }
    std::cout << "方法1 (for循环) 求和结果: " << sum1 << std::endl;
    
    // 方法2：使用accumulate函数
    int sum2 = std::accumulate(numbers.begin(), numbers.end(), 0);
    std::cout << "方法2 (accumulate) 求和结果: " << sum2 << std::endl;
    
    // 方法3：使用for循环和索引
    int sum3 = 0;
    for(size_t i = 0; i < numbers.size(); i++) {
        sum3 += numbers[i];
    }
    std::cout << "方法3 (索引遍历) 求和结果: " << sum3 << std::endl;
    
    return 0;
} 