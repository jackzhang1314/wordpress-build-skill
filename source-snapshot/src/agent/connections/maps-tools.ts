import { tool } from 'ai';
import { z } from 'zod';
import type { ToolHost } from '../tools';
import type { FileRuntime } from '../files/runtime';
import { apifyStatus } from './apify';
import { mapsCsv, uniqueMapsPlaces, mapsInputSchema, mapsProgress, mapsResults, publicJob, startMaps, type MapsPlace, type MapsState } from './maps';

export function mapsTools(host: ToolHost, files: FileRuntime, state: MapsState, persist: () => Promise<void>) {
  return {
    apifyConnectionStatus: tool({ description: '检查共享 Apify 连接是否配置，不返回 Token。未配置请引导设置 → 连接器 → Apify。', inputSchema: z.object({}),
      execute: input => host.execute('apifyConnectionStatus', input, apifyStatus) }),
    startMapsSearch: tool({ description: '在用户 Apify 账户启动 Google Maps 商家采集，会产生费用。须明确地区、搜索词、每词数量、是否补全官网联系方式和美元费用上限。每个对话仅一个采集任务，重复调用返回原任务；结果未知不得重试。', inputSchema: mapsInputSchema,
      execute: input => host.execute('startMapsSearch', input, () => startMaps(state, input, host.signal, persist), true) }),
    readMapsProgress: tool({ description: '查询本对话已保存的地图采集任务，可等待最多 30 秒。没有任务时不会创建任务；不要用 startMapsSearch 轮询。停止对话不会自动停止云端采集。', inputSchema: z.object({ waitSeconds: z.number().int().min(0).max(30).default(20) }),
      execute: input => host.execute('readMapsProgress', input, () => mapsProgress(state, host.signal, persist, input.waitSeconds)) }),
    collectMapsResults: tool({ description: '采集结束后读取本对话数据集，自动分页并保存客户 CSV 和来源 JSON。最多读取请求的商家数量（总计最多 500），按 Place ID 或地图 URL 去重，失败任务保留部分结果。返回路径后用 publishFile 交付；未返回文件不能声称已导出。', inputSchema: z.object({}),
      execute: input => host.execute('collectMapsResults', input, async () => {
        await mapsProgress(state, host.signal, persist);
        const job = state.mapsJob;
        if (!job?.run) throw new Error('尚无可导出的地图任务，请先核对采集状态。');
        const maximum = job.input.placesPerTerm * job.input.searchTerms.length, items: MapsPlace[] = [];
        let nextOffset: number | null = 0, capped = false;
        while (nextOffset !== null && items.length < maximum) {
          host.assertActive(); const page = await mapsResults(state, host.signal, nextOffset);
          const remaining = maximum - items.length;
          items.push(...page.items.slice(0, remaining));
          capped = page.items.length > remaining;
          nextOffset = page.nextOffset;
        }
        // At a requested limit, report the bounded coverage instead of claiming dataset exhaustion.
        capped = capped || nextOffset !== null;
        const prefix = `maps/${job.run.id}/${crypto.randomUUID()}`;
        const result = await files.store.changeMany(files.task, [
          { path: `${prefix}/customers.csv`, expectedVersion: 0, transform: () => mapsCsv(items) },
          { path: `${prefix}/sources.json`, expectedVersion: 0, transform: () => JSON.stringify({ task: publicJob(job), retrievedAt: new Date().toISOString(), bounded: capped, normalizedFieldsOnly: true, items }) },
        ], host.assertActive);
        return { files: result, collectedRows: items.length, exportedRows: uniqueMapsPlaces(items).length, runStatus: job.run.status, bounded: capped,
          partial: job.run.status !== 'SUCCEEDED', note: 'CSV 已按 Place ID/地图 URL 去重。来源 JSON 保留采集字段；不是采购意向或邮箱有效性证明。用 publishFile 发布客户表。' };
      }) }),
  };
}
