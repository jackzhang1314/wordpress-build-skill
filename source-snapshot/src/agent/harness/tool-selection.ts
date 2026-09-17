import { tool, type ToolSet } from 'ai';
import { z } from 'zod';

const groups = {
  browser: ['snapshot', 'click', 'hover', 'fill', 'fillForm', 'setChecked', 'select', 'pressKey', 'scroll', 'navigate', 'listTabs', 'switchTab', 'wait', 'waitFor', 'screenshot'],
  data: ['inspectPage', 'extractList', 'extractTable', 'collectTable', 'exportCollectedTable', 'readTableFile'],
  // These two data tools operate on saved evidence, without an attached browser.
  files: ['listFiles', 'readFile', 'writeFile', 'editFile', 'searchFiles', 'deleteFile', 'publishFile', 'runJavaScript', 'exportCollectedTable', 'readTableFile'],
  skills: ['loadSkill', 'readSkillFile'],
  annotations: ['createAnnotation', 'readTaskAnnotation', 'readAnnotations'],
  wordpress: ['wpReadDesignProfile', 'wpCompilePage', 'wpRead', 'wpWriteContent', 'wpUploadMedia', 'wpReadAbility', 'wpWriteAbility', 'wpPreviewProducts', 'wpImportProducts', 'wpWorkflowStatus', 'wpReadSite', 'wpConfigureSite', 'wpPlanNavigation', 'wpApplyNavigation'],
  seo: ['dataForSeoConnectionStatus', 'dataForSeoMarkets', 'dataForSeoQuery', 'dataForSeoResearch', 'startSeoAudit', 'readSeoAudit', 'stopSeoAudit', 'createSeoMonitor', 'seoMonitorStatus', 'pauseSeoMonitor', 'googleSearchConsole', 'seoFieldPerformance', 'readSeoResource', 'readSeoCorrespondence', 'listSeoFollowUps', 'sendSeoEmail', 'checkSeoDelivery', 'seoContact', 'readSeoPost', 'writeSeoPost'],
  maps: ['apifyConnectionStatus', 'startMapsSearch', 'readMapsProgress', 'collectMapsResults'],
} as const;
const groupSchema = z.enum(['browser', 'data', 'files', 'skills', 'annotations', 'wordpress', 'seo', 'maps']);
type Group = z.infer<typeof groupSchema>;
export class ToolSelection {
  private selected = new Set<Group>();
  constructor(hasBrowser: boolean) { if (hasBrowser) { this.selected.add('browser'); this.selected.add('data'); } this.selected.add('files'); this.selected.add('skills'); }
  tool(tools: ToolSet) {
    return tool({ description: '切换当前步骤可用的工具组。browser=页面操作；data=页面证据与 SEO 检查、列表和表格提取；files=文件、已采集表格的核验导出与代码；skills=技能；annotations=创建与回读本地批注。创建页面修改建议需启用 annotations；wordpress=WordPress站点、主题、页面区块、媒体与插件能力，使用前先选择此组，可同时保留files/skills/browser。仅更改已有表格的交付范围时选 files 即可使用 exportCollectedTable，无需重新打开网页或编写过滤脚本。seo=DataForSEO/GSC数据、SEO监测、外联邮件和文章发布；maps=Apify地图获客。连接器工具按需选择，可同时组合多个组。可重复调用，隐藏工具不会执行；系统会保留提问、计划与历史回读。',
      inputSchema: z.object({ groups: z.array(groupSchema).min(1).max(8) }),
      execute: async ({ groups: requested }) => {
        this.selected = new Set(requested);
        return { activeTools: this.active(tools), note: '下一步可调用这些工具；需要其他能力时再次选择工具组。' };
      },
    });
  }
  active(tools: ToolSet): string[] {
    const known = new Set<string>(Object.values(groups).flat());
    return Object.keys(tools).filter(name => name === 'readAnnotations' || !known.has(name) || [...this.selected].some(group => (groups[group] as readonly string[]).includes(name))).sort();
  }
}
