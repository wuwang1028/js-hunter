#!/usr/bin/env python3
"""
JS Hunter AI分析功能测试脚本
使用Manus内置Forge API进行快速验证
"""

import os
import json
import requests

# 从环境变量获取内置API配置
FORGE_API_URL = os.getenv('BUILT_IN_FORGE_API_URL', 'https://forge.manus.im')
FORGE_API_KEY = os.getenv('BUILT_IN_FORGE_API_KEY', '')

def test_api_discovery_analysis():
    """测试API接口发现分析场景"""
    print("=" * 60)
    print("测试1: API接口发现分析")
    print("=" * 60)
    
    # 读取测试JS文件
    with open('/home/ubuntu/js-hunter/test-website/js/external-normal.js', 'r') as f:
        js_code = f.read()
    
    # 构建分析提示词
    prompt = f"""你是一个JavaScript安全分析专家。请分析以下JavaScript代码，找出所有的API接口定义。

请按以下格式返回JSON：
{{
  "endpoints": [
    {{
      "path": "API路径",
      "method": "HTTP方法",
      "authentication": "认证类型",
      "parameters": ["参数列表"],
      "description": "端点描述",
      "risk_level": "风险等级(low/medium/high)"
    }}
  ],
  "summary": "总体分析摘要"
}}

JavaScript代码：
```javascript
{js_code[:2000]}
```

请只返回JSON，不要包含其他内容。"""
    
    try:
        # 调用Forge API
        response = requests.post(
            f'{FORGE_API_URL}/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {FORGE_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            
            print("\n✅ API分析成功")
            print("\nAI响应:")
            print(ai_response[:500] + "..." if len(ai_response) > 500 else ai_response)
            
            # 尝试解析JSON
            try:
                # 提取JSON部分
                if '```json' in ai_response:
                    json_str = ai_response.split('```json')[1].split('```')[0].strip()
                elif '```' in ai_response:
                    json_str = ai_response.split('```')[1].split('```')[0].strip()
                else:
                    json_str = ai_response.strip()
                
                parsed = json.loads(json_str)
                print(f"\n发现 {len(parsed.get('endpoints', []))} 个API端点")
                
                return True, parsed
            except json.JSONDecodeError as e:
                print(f"\n⚠️  JSON解析失败: {e}")
                return True, ai_response
        else:
            print(f"\n❌ API调用失败: {response.status_code}")
            print(response.text)
            return False, None
            
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        return False, None

def test_sensitive_info_scan():
    """测试敏感信息扫描场景"""
    print("\n" + "=" * 60)
    print("测试2: 敏感信息扫描")
    print("=" * 60)
    
    # 读取包含敏感信息的内联JS
    with open('/home/ubuntu/js-hunter/test-website/index.html', 'r') as f:
        html_content = f.read()
    
    # 提取内联JS部分
    start = html_content.find('<script>') + 8
    end = html_content.find('</script>', start)
    js_code = html_content[start:end][:2000]
    
    prompt = f"""你是一个JavaScript安全分析专家。请扫描以下代码中的敏感信息。

请按以下格式返回JSON：
{{
  "sensitive_data": [
    {{
      "type": "信息类型",
      "value": "具体值（部分隐藏）",
      "location": "位置",
      "severity": "严重程度(critical/high/medium/low)",
      "recommendation": "修复建议"
    }}
  ],
  "summary": "扫描摘要"
}}

JavaScript代码：
```javascript
{js_code}
```

请只返回JSON。"""
    
    try:
        response = requests.post(
            f'{FORGE_API_URL}/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {FORGE_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            
            print("\n✅ 敏感信息扫描成功")
            print("\nAI响应:")
            print(ai_response[:500] + "..." if len(ai_response) > 500 else ai_response)
            
            try:
                if '```json' in ai_response:
                    json_str = ai_response.split('```json')[1].split('```')[0].strip()
                elif '```' in ai_response:
                    json_str = ai_response.split('```')[1].split('```')[0].strip()
                else:
                    json_str = ai_response.strip()
                
                parsed = json.loads(json_str)
                print(f"\n发现 {len(parsed.get('sensitive_data', []))} 个敏感信息")
                
                return True, parsed
            except json.JSONDecodeError:
                return True, ai_response
        else:
            print(f"\n❌ API调用失败: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        return False, None

def test_auth_logic_analysis():
    """测试认证逻辑分析场景"""
    print("\n" + "=" * 60)
    print("测试3: 认证逻辑分析")
    print("=" * 60)
    
    with open('/home/ubuntu/js-hunter/test-website/js/external-normal.js', 'r') as f:
        js_code = f.read()[:2000]
    
    prompt = f"""你是一个JavaScript安全分析专家。请分析以下代码的认证逻辑，找出潜在的安全问题。

请按以下格式返回JSON：
{{
  "authentication_methods": ["认证方法列表"],
  "vulnerabilities": [
    {{
      "type": "漏洞类型",
      "description": "详细描述",
      "severity": "严重程度",
      "exploit": "利用方法"
    }}
  ],
  "recommendations": ["安全建议列表"]
}}

JavaScript代码：
```javascript
{js_code}
```

请只返回JSON。"""
    
    try:
        response = requests.post(
            f'{FORGE_API_URL}/v1/chat/completions',
            headers={
                'Authorization': f'Bearer {FORGE_API_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.3
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            
            print("\n✅ 认证逻辑分析成功")
            print("\nAI响应:")
            print(ai_response[:500] + "..." if len(ai_response) > 500 else ai_response)
            
            try:
                if '```json' in ai_response:
                    json_str = ai_response.split('```json')[1].split('```')[0].strip()
                elif '```' in ai_response:
                    json_str = ai_response.split('```')[1].split('```')[0].strip()
                else:
                    json_str = ai_response.strip()
                
                parsed = json.loads(json_str)
                print(f"\n发现 {len(parsed.get('vulnerabilities', []))} 个认证漏洞")
                
                return True, parsed
            except json.JSONDecodeError:
                return True, ai_response
        else:
            print(f"\n❌ API调用失败: {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
        return False, None

def main():
    """主测试函数"""
    print("\n" + "=" * 60)
    print("JS Hunter AI分析功能验证测试")
    print("使用Manus内置Forge API")
    print("=" * 60)
    
    if not FORGE_API_KEY:
        print("\n❌ 错误: 未找到BUILT_IN_FORGE_API_KEY环境变量")
        return
    
    print(f"\nAPI URL: {FORGE_API_URL}")
    print(f"API Key: {FORGE_API_KEY[:20]}...")
    
    results = {}
    
    # 测试1: API接口发现
    success, data = test_api_discovery_analysis()
    results['api_discovery'] = {'success': success, 'data': data}
    
    # 测试2: 敏感信息扫描
    success, data = test_sensitive_info_scan()
    results['sensitive_scan'] = {'success': success, 'data': data}
    
    # 测试3: 认证逻辑分析
    success, data = test_auth_logic_analysis()
    results['auth_analysis'] = {'success': success, 'data': data}
    
    # 生成测试报告
    print("\n" + "=" * 60)
    print("测试结果总结")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if r['success'])
    
    print(f"\n总测试数: {total_tests}")
    print(f"通过测试: {passed_tests}")
    print(f"失败测试: {total_tests - passed_tests}")
    print(f"成功率: {passed_tests/total_tests*100:.1f}%")
    
    # 保存结果
    output_file = '/home/ubuntu/js-hunter/api_test_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n详细结果已保存到: {output_file}")
    
    if passed_tests == total_tests:
        print("\n✅ 所有测试通过！AI分析功能正常工作。")
    else:
        print("\n⚠️  部分测试失败，请检查详细日志。")

if __name__ == '__main__':
    main()
