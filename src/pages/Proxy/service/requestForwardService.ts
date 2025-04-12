import { ProxyData, proxyGroupStatus, ProxyRule } from '@/model/proxy';
import { eventBus } from '@/lib/event-bus';
import { initProxyData, updateProxyData, getProxyStatus, setProxyStatus } from './index';
import { getModeProxy } from '@/service/proxy';
import { jsoncTransformProxyRule } from '@/pages/Proxy/utils';
import { ProxyMode } from '@/model/proxy';
export default class RequestForwardService {
  private static async clearAllRules() {
    try {
      const existingRules = await chrome.declarativeNetRequest?.getDynamicRules();
      const existingRuleIds = existingRules.map(rule => rule.id);
      if (existingRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: existingRuleIds,
        });
      }
    } catch (error) {
      console.error('Error clearing rules:', error);
    }
  }

  private static async updateRules(rules: any[]) {
    try {
      await this.clearAllRules();
      if (rules.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          addRules: rules,
        });
      }
      eventBus.emit('proxy-rules-updated', rules.length);
    } catch (error) {
      console.error('Error updating rules:', error);
      throw error;
    }
  }

  /**
   * 状态过滤
   */
  static statusFilter(proxyData: ProxyData) {
    // 组粒度权限控制
    const activeStatusGroup = Object.entries(proxyData).filter(
      ([, value]) => value.groupStatus === proxyGroupStatus.ACTIVE
    );
    // 单规则粒度权限控制
    const rules = activeStatusGroup
      .flatMap(value => value[1]?.rule)
      .filter((rule: ProxyRule) => rule.enabled)
      .map((rule: ProxyRule, index) => ({
        id: index + 1,
        priority: 1,
        action: {
          type: 'redirect',
          redirect: {
            regexSubstitution: rule.target,
          },
        },
        condition: {
          regexFilter: rule.pattern,
          resourceTypes: [
            'main_frame',
            'sub_frame',
            'stylesheet',
            'script',
            'image',
            'font',
            'xmlhttprequest',
            'other',
          ],
        },
      }));

    return rules;
  }

  /**
   * 更新代理规则
   */
  static async updateChromeRules(rules: any) {
    const proxyStatus = await getProxyStatus();
    if (!proxyStatus) {
      return;
    }
    await this.updateRules(rules);
  }

  /**
   * 关闭代理
   */
  static async closeProxy() {
    try {
      // 1. 更新状态
      await setProxyStatus(false);
      
      // 2. 清空所有规则
      await this.clearAllRules();
      
      // 3. 更新本地数据
      const proxyData = await initProxyData();
      const modeProxy = await getModeProxy();
      
      // 如果是 editor 模式，需要将 jsonc 转换为规则
      if (modeProxy?.mode === ProxyMode.EDITOR) {
        const currentTab = Object.keys(proxyData)[0];
        const jsonc = proxyData[currentTab]?.jsonc;
        if (jsonc) {
          const rules = jsoncTransformProxyRule(jsonc);
          proxyData[currentTab].rule = rules;
        }
      }
      
      await updateProxyData(proxyData);
      
      // 4. 通知UI更新
      eventBus.emit('proxy-rules-updated', 0);
    } catch (error) {
      console.error('Error closing proxy:', error);
      throw error;
    }
  }

  /**
   * 获取代理规则数量
   */
  static async getProxyRulesCount() {
    try {
      const proxyStatus = await getProxyStatus();
      if (!proxyStatus) {
        return 0;
      }
      const rules = await chrome.declarativeNetRequest.getDynamicRules();
      return rules.length;
    } catch (error) {
      console.error('Error getting rules count:', error);
      return 0;
    }
  }

  /**
   * 开启代理
   */
  static async openProxy() {
    try {
      // 1. 更新状态
      await setProxyStatus(true);
      
      // 2. 获取并过滤规则
      const proxyData = await initProxyData();
      const modeProxy = await getModeProxy();
      
      // 如果是 editor 模式，需要将 jsonc 转换为规则
      if (modeProxy?.mode === ProxyMode.EDITOR) {
        const currentTab = Object.keys(proxyData)[0];
        const jsonc = proxyData[currentTab]?.jsonc;
        if (jsonc) {
          const rules = jsoncTransformProxyRule(jsonc);
          proxyData[currentTab].rule = rules;
        }
      }
      
      const rules = this.statusFilter(proxyData);
      
      // 3. 更新规则
      await this.updateRules(rules);
      
      // 4. 更新本地数据
      await updateProxyData(proxyData);
    } catch (error) {
      console.error('Error opening proxy:', error);
      // 如果开启失败，确保状态被重置
      await this.closeProxy();
      throw error;
    }
  }

  /**
   * 切换代理状态
   */
  static async toggleProxy() {
    const currentStatus = await getProxyStatus();
    if (currentStatus) {
      await this.closeProxy();
    } else {
      await this.openProxy();
    }
  }
}
