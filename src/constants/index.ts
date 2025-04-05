import { ProxyData, proxyGroupStatus } from '@/model/proxy';
/**
 * replaceLink chrome插件 store 存储的key
 */
export const CHFONE_STORE_LINK_KEY = 'deploy_lens_chrome_store_link';

/**
 * 开发环境mock数据初始化
 */
export const DEVELOPMENT_STORELINK =
  'https://example.com/api/v1/users?page=1&size=10&sort=desc&filter=active&hduwhuwdhwhduw=12312312321';

/**
 * JSONC数据
 */
export const JSONC = `{
          // Use IntelliSense to learn about possible links.
          // Type \`rule\` to quick insert rule.
          "proxy": 
          [
            [
              "^https://api.example.com/users/.*111",
              "https://test-api.example.com/users/"
            ],
            [
              "^https://api.example.com/orders/.*",
              "https://test-api.example.com/users/"
            ],
            // \`Command/Ctrl + click\` to visit:
            // https://unpkg.com/react@16.4.1/umd/react.production.min.js
            // [
              // "(.*)/path1/path2/(.*)", // https://www.sample.com/path1/path2/index.js
              // "http://127.0.0.1:3000/$2", // http://127.0.0.1:3000/index.js
            // ],
          ],

}`;
/**
 * 代理数据 stroe key
 */
export const CHFONE_STORE_PROXY_KEY = 'deploy_lens_chrome_store_proxy';

export const CHFONE_STORE_PROXY_STATUS_KEY = 'deploy_lens_chrome_store_proxy_status';

export const PROXY_DATA: ProxyData = {
  default: {
    key: 'default',
    group: 'default',
    groupEnabled: true,
    groupStatus: proxyGroupStatus.ACTIVE,
    rule: [
      {
        id: 0,
        pattern: '^https://api.example.com/users/.*111',
        target: 'https://test-api.example.com/users/',
        enabled: true,
      },
      {
        id: 1,
        pattern: '^https://api.example.com/orders/.*',
        target: 'https://test-api.example.com/users/',
        enabled: true,
      },
    ],
    jsonc: JSONC,
  },
};
