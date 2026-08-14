// ==================== 数据门户 ====================
export interface PortalAsset {
  id: string;
  name: string;
  type: 'chart' | 'dashboard' | 'screen' | 'report';
  typeLabel: string;
  creator: string;
  updatedAt: string;
  status: 'published' | 'draft';
}

export const portalAssets: PortalAsset[] = [
  { id: 'PA001', name: '月度销售额趋势图', type: 'chart', typeLabel: '图表', creator: '张三', updatedAt: '2026-06-10', status: 'published' },
  { id: 'PA002', name: 'Q2 运营仪表盘', type: 'dashboard', typeLabel: '仪表盘', creator: '李四', updatedAt: '2026-06-09', status: 'published' },
  { id: 'PA003', name: '618 大促数据大屏', type: 'screen', typeLabel: '数据大屏', creator: '王五', updatedAt: '2026-06-08', status: 'published' },
  { id: 'PA004', name: '用户留存分析报表', type: 'report', typeLabel: '报表', creator: '赵六', updatedAt: '2026-06-07', status: 'published' },
  { id: 'PA005', name: '库存周转率图表', type: 'chart', typeLabel: '图表', creator: '张三', updatedAt: '2026-06-06', status: 'draft' },
  { id: 'PA006', name: '财务核心指标仪表盘', type: 'dashboard', typeLabel: '仪表盘', creator: '李四', updatedAt: '2026-06-05', status: 'published' },
  { id: 'PA007', name: '供应链监控大屏', type: 'screen', typeLabel: '数据大屏', creator: '王五', updatedAt: '2026-06-04', status: 'published' },
  { id: 'PA008', name: '季度销售明细报表', type: 'report', typeLabel: '报表', creator: '赵六', updatedAt: '2026-06-03', status: 'published' },
];

// ==================== 数据源 ====================
export interface DataSource {
  id: string;
  name: string;
  type: string;
  host: string;
  database: string;
  connStatus: 'connected' | 'disconnected';
  status: 'pending' | 'online' | 'offline';
  creator: string;
  createdAt: string;
  modifier: string;
  updatedAt: string;
}

export const dataSources: DataSource[] = [
  { id: 'DS001', name: '订单数据库', type: 'MySQL', host: '192.168.1.10:3306', database: 'order_db', connStatus: 'connected', status: 'online', creator: 'admin', createdAt: '2026-05-10', modifier: 'zhangsan', updatedAt: '2026-06-10 14:32:18' },
  { id: 'DS002', name: '用户数据库', type: 'MySQL', host: '192.168.1.11:3306', database: 'user_db', connStatus: 'connected', status: 'online', creator: 'admin', createdAt: '2026-05-08', modifier: 'lisi', updatedAt: '2026-06-09 09:15:42' },
  { id: 'DS003', name: '商品数据 Excel', type: 'Excel', host: '-', database: 'product_data.xlsx', connStatus: 'connected', status: 'online', creator: 'zhangsan', createdAt: '2026-05-20', modifier: 'zhangsan', updatedAt: '2026-06-08 16:08:55' },
  { id: 'DS004', name: '物流 API', type: 'API', host: 'https://api.logistics.com', database: '-', connStatus: 'connected', status: 'offline', creator: 'admin', createdAt: '2026-04-15', modifier: 'wangwu', updatedAt: '2026-06-07 11:22:33' },
  { id: 'DS005', name: '财务 PostgreSQL', type: 'PostgreSQL', host: '192.168.1.20:5432', database: 'finance_db', connStatus: 'disconnected', status: 'pending', creator: 'lisi', createdAt: '2026-03-20', modifier: 'lisi', updatedAt: '2026-03-20 08:45:12' },
  { id: 'DS006', name: '日志 ClickHouse', type: 'ClickHouse', host: '192.168.1.30:8123', database: 'log_db', connStatus: 'connected', status: 'online', creator: 'admin', createdAt: '2026-06-01', modifier: 'data_team', updatedAt: '2026-06-06 20:18:09' },
  { id: 'DS007', name: '营销活动 MySQL', type: 'MySQL', host: '192.168.1.12:3306', database: 'marketing_db', connStatus: 'connected', status: 'online', creator: 'zhangsan', createdAt: '2026-05-25', modifier: 'zhangsan', updatedAt: '2026-06-05 10:30:00' },
  { id: 'DS008', name: '库存 Redis', type: 'Redis', host: '192.168.1.40:6379', database: 'db0', connStatus: 'connected', status: 'online', creator: 'lisi', createdAt: '2026-05-18', modifier: 'wangwu', updatedAt: '2026-06-04 16:45:22' },
  { id: 'DS009', name: '实时数仓 Kafka', type: 'Kafka', host: '192.168.1.50:9092', database: '-', connStatus: 'connected', status: 'pending', creator: 'admin', createdAt: '2026-06-02', modifier: 'data_team', updatedAt: '2026-06-03 14:20:00' },
  { id: 'DS010', name: '埋点数据 MongoDB', type: 'MongoDB', host: '192.168.1.60:27017', database: 'events', connStatus: 'disconnected', status: 'offline', creator: 'zhangsan', createdAt: '2026-04-28', modifier: 'zhangsan', updatedAt: '2026-05-30 09:00:00' },
  { id: 'DS011', name: '客户 CRM MySQL', type: 'MySQL', host: '192.168.1.13:3306', database: 'crm_db', connStatus: 'connected', status: 'online', creator: 'lisi', createdAt: '2026-05-22', modifier: 'lisi', updatedAt: '2026-06-04 11:33:45' },
  { id: 'DS012', name: '风控引擎 API', type: 'API', host: 'https://risk.company.com/v1', database: '-', connStatus: 'connected', status: 'online', creator: 'wangwu', createdAt: '2026-05-15', modifier: 'wangwu', updatedAt: '2026-06-02 17:50:30' },
  { id: 'DS013', name: '供应链 Excel', type: 'Excel', host: '-', database: 'supply_chain.xlsx', connStatus: 'connected', status: 'pending', creator: 'admin', createdAt: '2026-06-05', modifier: 'admin', updatedAt: '2026-06-05 08:00:00' },
  { id: 'DS014', name: 'BI 报表库 PostgreSQL', type: 'PostgreSQL', host: '192.168.1.21:5432', database: 'bi_reports', connStatus: 'connected', status: 'online', creator: 'data_team', createdAt: '2026-05-28', modifier: 'data_team', updatedAt: '2026-06-07 13:15:00' },
  { id: 'DS015', name: '用户行为 ES', type: 'Elasticsearch', host: '192.168.1.70:9200', database: 'user_behavior', connStatus: 'connected', status: 'online', creator: 'zhangsan', createdAt: '2026-05-30', modifier: 'lisi', updatedAt: '2026-06-08 10:45:00' },
  { id: 'DS016', name: '支付网关 API', type: 'API', host: 'https://pay.company.com/api', database: '-', connStatus: 'connected', status: 'offline', creator: 'admin', createdAt: '2026-04-20', modifier: 'admin', updatedAt: '2026-05-25 20:00:00' },
  { id: 'DS017', name: '商品搜索 ES', type: 'Elasticsearch', host: '192.168.1.71:9200', database: 'products', connStatus: 'connected', status: 'online', creator: 'lisi', createdAt: '2026-05-12', modifier: 'wangwu', updatedAt: '2026-06-01 15:30:00' },
  { id: 'DS018', name: '消息队列 RabbitMQ', type: 'RabbitMQ', host: '192.168.1.80:5672', database: '/', connStatus: 'connected', status: 'pending', creator: 'zhangsan', createdAt: '2026-06-04', modifier: 'zhangsan', updatedAt: '2026-06-04 09:20:00' },
  { id: 'DS019', name: '审计日志 MySQL', type: 'MySQL', host: '192.168.1.14:3306', database: 'audit_log', connStatus: 'connected', status: 'online', creator: 'admin', createdAt: '2026-05-08', modifier: 'admin', updatedAt: '2026-06-09 18:00:00' },
  { id: 'DS020', name: '文件存储 MinIO', type: 'MinIO', host: '192.168.1.90:9000', database: 'files', connStatus: 'connected', status: 'online', creator: 'data_team', createdAt: '2026-05-26', modifier: 'data_team', updatedAt: '2026-06-06 12:00:00' },
  { id: 'DS021', name: '配置中心 Nacos', type: 'Nacos', host: '192.168.1.100:8848', database: '-', connStatus: 'disconnected', status: 'pending', creator: 'lisi', createdAt: '2026-06-03', modifier: 'lisi', updatedAt: '2026-06-03 16:40:00' },
  { id: 'DS022', name: '地理信息 PostGIS', type: 'PostgreSQL', host: '192.168.1.22:5432', database: 'geo_data', connStatus: 'connected', status: 'online', creator: 'wangwu', createdAt: '2026-05-19', modifier: 'wangwu', updatedAt: '2026-06-05 14:55:00' },
];

// ==================== 数据集 ====================
export interface Dataset {
  id: string;
  name: string;
  owner: string;
  creator: string;
  createdAt: string;
  modifier: string;
  updatedAt: string;
  sourceId: string;
  sourceName: string;
  status: 'pending' | 'online' | 'offline';
}

export const datasets: Dataset[] = [
  { id: 'DT001', name: '订单明细数据集', owner: 'admin', creator: 'admin', createdAt: '2026-05-10', modifier: 'zhangsan', updatedAt: '2026-06-10 14:32:18', sourceId: 'DS001', sourceName: '订单数据库', status: 'online' },
  { id: 'DT002', name: '用户画像数据集', owner: 'admin', creator: 'admin', createdAt: '2026-05-08', modifier: 'lisi', updatedAt: '2026-06-09 09:15:42', sourceId: 'DS002', sourceName: '用户数据库', status: 'online' },
  { id: 'DT003', name: '商品信息数据集', owner: 'zhangsan', creator: 'zhangsan', createdAt: '2026-05-20', modifier: 'zhangsan', updatedAt: '2026-06-08 16:08:55', sourceId: 'DS003', sourceName: '商品数据 Excel', status: 'online' },
  { id: 'DT004', name: '物流轨迹数据集', owner: 'admin', creator: 'admin', createdAt: '2026-04-15', modifier: 'wangwu', updatedAt: '2026-06-07 11:22:33', sourceId: 'DS004', sourceName: '物流 API', status: 'offline' },
  { id: 'DT005', name: '财务报表数据集', owner: 'lisi', creator: 'lisi', createdAt: '2026-03-20', modifier: 'lisi', updatedAt: '2026-03-20 08:45:12', sourceId: 'DS005', sourceName: '财务 PostgreSQL', status: 'pending' },
  { id: 'DT006', name: '访问日志数据集', owner: 'admin', creator: 'admin', createdAt: '2026-06-01', modifier: 'data_team', updatedAt: '2026-06-06 20:18:09', sourceId: 'DS006', sourceName: '日志 ClickHouse', status: 'pending' },
  { id: 'DT007', name: '营销活动数据集', owner: 'zhangsan', creator: 'zhangsan', createdAt: '2026-05-25', modifier: 'zhangsan', updatedAt: '2026-06-05 10:30:00', sourceId: 'DS007', sourceName: '营销活动 MySQL', status: 'online' },
  { id: 'DT008', name: '库存实时数据集', owner: 'lisi', creator: 'lisi', createdAt: '2026-05-18', modifier: 'wangwu', updatedAt: '2026-06-04 16:45:22', sourceId: 'DS008', sourceName: '库存 Redis', status: 'online' },
  { id: 'DT009', name: '埋点事件数据集', owner: 'admin', creator: 'admin', createdAt: '2026-05-28', modifier: 'zhangsan', updatedAt: '2026-06-07 13:15:00', sourceId: 'DS010', sourceName: '埋点数据 MongoDB', status: 'pending' },
  { id: 'DT010', name: 'CRM 客户数据集', owner: 'lisi', creator: 'lisi', createdAt: '2026-05-22', modifier: 'lisi', updatedAt: '2026-06-04 11:33:45', sourceId: 'DS011', sourceName: '客户 CRM MySQL', status: 'online' },
  { id: 'DT011', name: '风控规则数据集', owner: 'wangwu', creator: 'wangwu', createdAt: '2026-05-15', modifier: 'wangwu', updatedAt: '2026-06-02 17:50:30', sourceId: 'DS012', sourceName: '风控引擎 API', status: 'online' },
  { id: 'DT012', name: '供应链数据集', owner: 'admin', creator: 'admin', createdAt: '2026-06-05', modifier: 'admin', updatedAt: '2026-06-05 08:00:00', sourceId: 'DS013', sourceName: '供应链 Excel', status: 'pending' },
  { id: 'DT013', name: 'BI 报表宽表', owner: 'data_team', creator: 'data_team', createdAt: '2026-05-28', modifier: 'data_team', updatedAt: '2026-06-07 13:15:00', sourceId: 'DS014', sourceName: 'BI 报表库 PostgreSQL', status: 'online' },
  { id: 'DT014', name: '用户行为明细', owner: 'zhangsan', creator: 'zhangsan', createdAt: '2026-05-30', modifier: 'lisi', updatedAt: '2026-06-08 10:45:00', sourceId: 'DS015', sourceName: '用户行为 ES', status: 'online' },
  { id: 'DT015', name: '支付流水数据集', owner: 'admin', creator: 'admin', createdAt: '2026-04-20', modifier: 'admin', updatedAt: '2026-05-25 20:00:00', sourceId: 'DS016', sourceName: '支付网关 API', status: 'offline' },
  { id: 'DT016', name: '商品搜索数据集', owner: 'lisi', creator: 'lisi', createdAt: '2026-05-12', modifier: 'wangwu', updatedAt: '2026-06-01 15:30:00', sourceId: 'DS017', sourceName: '商品搜索 ES', status: 'online' },
  { id: 'DT017', name: '消息队列日志集', owner: 'zhangsan', creator: 'zhangsan', createdAt: '2026-06-04', modifier: 'zhangsan', updatedAt: '2026-06-04 09:20:00', sourceId: 'DS018', sourceName: '消息队列 RabbitMQ', status: 'pending' },
  { id: 'DT018', name: '审计日志数据集', owner: 'admin', creator: 'admin', createdAt: '2026-05-08', modifier: 'admin', updatedAt: '2026-06-09 18:00:00', sourceId: 'DS019', sourceName: '审计日志 MySQL', status: 'online' },
  { id: 'DT019', name: '文件元数据集', owner: 'data_team', creator: 'data_team', createdAt: '2026-05-26', modifier: 'data_team', updatedAt: '2026-06-06 12:00:00', sourceId: 'DS020', sourceName: '文件存储 MinIO', status: 'online' },
  { id: 'DT020', name: '配置变更数据集', owner: 'lisi', creator: 'lisi', createdAt: '2026-06-03', modifier: 'lisi', updatedAt: '2026-06-03 16:40:00', sourceId: 'DS021', sourceName: '配置中心 Nacos', status: 'pending' },
  { id: 'DT021', name: '地理围栏数据集', owner: 'wangwu', creator: 'wangwu', createdAt: '2026-05-19', modifier: 'wangwu', updatedAt: '2026-06-05 14:55:00', sourceId: 'DS022', sourceName: '地理信息 PostGIS', status: 'online' },
];

// ==================== 报表 ====================
export interface Report {
  id: string;
  name: string;
  datasetName: string;
  creator: string;
  createdAt: string;
  updater: string;
  updatedAt: string;
  status: 'pending' | 'online' | 'offline';
  viewPerm?: string[];
  managePerm?: string[];
}

export const reports: Report[] = [
  { id: 'RP001', name: '销售日报', datasetName: '订单明细数据集', creator: '张三', createdAt: '2026-05-15', updater: '李四', updatedAt: '2026-06-10', status: 'online' },
  { id: 'RP002', name: '用户增长周报', datasetName: '用户画像数据集', creator: '李四', createdAt: '2026-05-20', updater: '王五', updatedAt: '2026-06-09', status: 'online' },
  { id: 'RP003', name: '库存预警月报', datasetName: '商品信息数据集', creator: '王五', createdAt: '2026-06-01', updater: '赵六', updatedAt: '2026-06-08', status: 'pending' },
  { id: 'RP004', name: '物流时效分析', datasetName: '物流轨迹数据集', creator: '赵六', createdAt: '2026-05-25', updater: '张三', updatedAt: '2026-06-07', status: 'online' },
  { id: 'RP005', name: '财务利润表', datasetName: '财务报表数据集', creator: '张三', createdAt: '2026-03-20', updater: '李四', updatedAt: '2026-03-20', status: 'offline' },
  { id: 'RP006', name: '营销活动效果分析', datasetName: '营销活动数据集', creator: '李四', createdAt: '2026-05-26', updater: '李四', updatedAt: '2026-06-08', status: 'online' },
  { id: 'RP007', name: '库存周转日报', datasetName: '库存实时数据集', creator: '王五', createdAt: '2026-05-19', updater: '赵六', updatedAt: '2026-06-06', status: 'online' },
  { id: 'RP008', name: '用户行为漏斗报告', datasetName: '用户行为明细', creator: '赵六', createdAt: '2026-05-31', updater: '张三', updatedAt: '2026-06-09', status: 'pending' },
  { id: 'RP009', name: '支付流水对账单', datasetName: '支付流水数据集', creator: '张三', createdAt: '2026-04-22', updater: '李四', updatedAt: '2026-05-28', status: 'offline' },
  { id: 'RP010', name: '商品搜索热词排行', datasetName: '商品搜索数据集', creator: '李四', createdAt: '2026-05-14', updater: '王五', updatedAt: '2026-06-03', status: 'online' },
  { id: 'RP011', name: '风控异常交易报告', datasetName: '风控规则数据集', creator: '王五', createdAt: '2026-05-17', updater: '赵六', updatedAt: '2026-06-04', status: 'online' },
  { id: 'RP012', name: '供应链缺货预警', datasetName: '供应链数据集', creator: '赵六', createdAt: '2026-06-06', updater: '张三', updatedAt: '2026-06-07', status: 'pending' },
  { id: 'RP013', name: 'BI 综合运营看板', datasetName: 'BI 报表宽表', creator: '张三', createdAt: '2026-05-29', updater: 'data_team', updatedAt: '2026-06-08', status: 'online' },
  { id: 'RP014', name: '审计日志月度报告', datasetName: '审计日志数据集', creator: 'data_team', createdAt: '2026-05-10', updater: 'admin', updatedAt: '2026-06-10', status: 'online' },
  { id: 'RP015', name: '文件访问统计报告', datasetName: '文件元数据集', creator: 'data_team', createdAt: '2026-05-27', updater: 'data_team', updatedAt: '2026-06-07', status: 'online' },
  { id: 'RP016', name: '埋点事件分布报告', datasetName: '埋点事件数据集', creator: 'zhangsan', createdAt: '2026-05-29', updater: 'lisi', updatedAt: '2026-06-08', status: 'pending' },
  { id: 'RP017', name: 'CRM 客户转化分析', datasetName: 'CRM 客户数据集', creator: 'lisi', createdAt: '2026-05-23', updater: 'wangwu', updatedAt: '2026-06-05', status: 'online' },
  { id: 'RP018', name: '消息队列积压监控', datasetName: '消息队列日志集', creator: 'wangwu', createdAt: '2026-06-05', updater: 'wangwu', updatedAt: '2026-06-06', status: 'pending' },
  { id: 'RP019', name: '配置变更追踪表', datasetName: '配置变更数据集', creator: 'lisi', createdAt: '2026-06-04', updater: 'lisi', updatedAt: '2026-06-05', status: 'pending' },
  { id: 'RP020', name: '地理区域销售热力图', datasetName: '地理围栏数据集', creator: 'wangwu', createdAt: '2026-05-20', updater: 'zhao_liu', updatedAt: '2026-06-06', status: 'online' },
  { id: 'RP021', name: '实时流量监控大屏', datasetName: '访问日志数据集', creator: 'data_team', createdAt: '2026-06-02', updater: 'data_team', updatedAt: '2026-06-09', status: 'online' },
];

// ==================== 图表管理 ====================
export interface ChartItem {
  id: string;
  name: string;
  type: string;
  datasetName: string;
  creator: string;
  createdAt: string;
  updater: string;
  updatedAt: string;
  status: 'pending' | 'online' | 'offline';
  viewPerm?: string[];
  managePerm?: string[];
}

export const charts: ChartItem[] = [
  { id: 'CH001', name: '月度销售额趋势', type: '折线图', datasetName: '订单明细数据集', creator: '张三', createdAt: '2026-05-15', updater: '李四', updatedAt: '2026-06-10', status: 'online' },
  { id: 'CH002', name: '品类销售占比', type: '饼图', datasetName: '订单明细数据集', creator: '李四', createdAt: '2026-05-20', updater: '王五', updatedAt: '2026-06-09', status: 'online' },
  { id: 'CH003', name: '区域销售热力', type: '柱状图', datasetName: '订单明细数据集', creator: '王五', createdAt: '2026-06-01', updater: '赵六', updatedAt: '2026-06-08', status: 'pending' },
  { id: 'CH004', name: '用户留存漏斗', type: '漏斗图', datasetName: '用户画像数据集', creator: '赵六', createdAt: '2026-05-25', updater: '张三', updatedAt: '2026-06-07', status: 'online' },
  { id: 'CH005', name: '库存周转趋势', type: '面积图', datasetName: '商品信息数据集', creator: '张三', createdAt: '2026-06-02', updater: '李四', updatedAt: '2026-06-06', status: 'offline' },
  { id: 'CH006', name: '物流时效分布', type: '箱线图', datasetName: '物流轨迹数据集', creator: '李四', createdAt: '2026-05-28', updater: '王五', updatedAt: '2026-06-08', status: 'online' },
  { id: 'CH007', name: '财务收支对比', type: '堆叠条形图', datasetName: '财务报表数据集', creator: '王五', createdAt: '2026-03-25', updater: '赵六', updatedAt: '2026-03-25', status: 'offline' },
  { id: 'CH008', name: '访问量实时曲线', type: '面积图', datasetName: '访问日志数据集', creator: '赵六', createdAt: '2026-06-03', updater: 'data_team', updatedAt: '2026-06-07', status: 'pending' },
  { id: 'CH009', name: '营销渠道转化率', type: '雷达图', datasetName: '营销活动数据集', creator: 'data_team', createdAt: '2026-05-27', updater: 'zhangsan', updatedAt: '2026-06-05', status: 'online' },
  { id: 'CH010', name: '库存预警仪表盘', type: '仪表盘图', datasetName: '库存实时数据集', creator: 'zhangsan', createdAt: '2026-05-19', updater: 'lisi', updatedAt: '2026-06-04', status: 'online' },
  { id: 'CH011', name: '用户行为路径桑基', type: '桑基图', datasetName: '用户行为明细', creator: 'lisi', createdAt: '2026-05-31', updater: 'wangwu', updatedAt: '2026-06-09', status: 'pending' },
  { id: 'CH012', name: '支付方式分布', type: '环形图', datasetName: '支付流水数据集', creator: 'wangwu', createdAt: '2026-04-24', updater: 'zhangsan', updatedAt: '2026-05-29', status: 'offline' },
  { id: 'CH013', name: '搜索词词云', type: '词云图', datasetName: '商品搜索数据集', creator: 'zhangsan', createdAt: '2026-05-16', updater: 'lisi', updatedAt: '2026-06-04', status: 'online' },
  { id: 'CH014', name: '风险等级分布', type: '饼图', datasetName: '风控规则数据集', creator: 'lisi', createdAt: '2026-05-18', updater: 'wangwu', updatedAt: '2026-06-05', status: 'online' },
  { id: 'CH015', name: '供应链节点关系', type: '关系图', datasetName: '供应链数据集', creator: 'wangwu', createdAt: '2026-06-07', updater: 'zhao_liu', updatedAt: '2026-06-08', status: 'pending' },
  { id: 'CH016', name: 'BI 指标总览卡片', type: '指标卡组', datasetName: 'BI 报表宽表', creator: 'data_team', createdAt: '2026-05-30', updater: 'admin', updatedAt: '2026-06-08', status: 'online' },
  { id: 'CH017', name: '审计操作时间轴', type: '时间轴', datasetName: '审计日志数据集', creator: 'admin', createdAt: '2026-05-12', updater: 'data_team', updatedAt: '2026-06-10', status: 'online' },
  { id: 'CH018', name: '文件类型分布树图', type: '树图', datasetName: '文件元数据集', creator: 'data_team', createdAt: '2026-05-28', updater: 'data_team', updatedAt: '2026-06-07', status: 'online' },
  { id: 'CH019', name: '埋点事件瀑布图', type: '瀑布图', datasetName: '埋点事件数据集', creator: 'zhangsan', createdAt: '2026-06-01', updater: 'lisi', updatedAt: '2026-06-06', status: 'pending' },
  { id: 'CH020', name: '客户价值矩阵散点', type: '散点图', datasetName: 'CRM 客户数据集', creator: 'lisi', createdAt: '2026-05-24', updater: 'wangwu', updatedAt: '2026-06-06', status: 'online' },
  { id: 'CH021', name: '消息积压趋势图', type: '面积图', datasetName: '消息队列日志集', creator: 'wangwu', createdAt: '2026-06-06', updater: 'wangwu', updatedAt: '2026-06-07', status: 'pending' },
];

// ==================== 仪表盘 ====================
export type DashboardComponentType = 'bar' | 'line' | 'area' | 'pie' | 'table' | 'query' | 'richText' | 'media' | 'tab' | 'insight' | 'reuse';

export interface DashboardChart {
  id: string;
  name: string;
  type: DashboardComponentType;
  datasetName?: string;
  dimensions?: string[];
  metrics?: string[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** 非图表组件的自定义配置 */
  config?: Record<string, any>;
}

export interface DashboardItem {
  id: string;
  name: string;
  chartCount: number;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'online' | 'offline';
  charts?: DashboardChart[];
}

export const dashboards: DashboardItem[] = [
  { id: 'DB001', name: '运营核心指标', chartCount: 3, creator: '张三', createdAt: '2026-05-10', updatedAt: '2026-06-10', status: 'online', charts: [
    { id: 'db1-ch1', name: '月度销售额趋势', type: 'line', datasetName: '订单明细数据集', dimensions: ['订单日期'], metrics: ['订单金额'] },
    { id: 'db1-ch2', name: '品类销售占比', type: 'pie', datasetName: '订单明细数据集', dimensions: ['商品品类'], metrics: ['订单金额'] },
    { id: 'db1-ch3', name: '区域销售分布', type: 'bar', datasetName: '订单明细数据集', dimensions: ['省份'], metrics: ['订单金额'] },
  ]},
  { id: 'DB002', name: '销售作战室', chartCount: 4, creator: '李四', createdAt: '2026-05-15', updatedAt: '2026-06-09', status: 'online', charts: [
    { id: 'db2-ch1', name: '销售目标达成', type: 'area', datasetName: '订单明细数据集', dimensions: ['订单日期'], metrics: ['订单金额'] },
    { id: 'db2-ch2', name: '渠道占比', type: 'pie', datasetName: '营销活动数据集', dimensions: ['商品品类'], metrics: ['订单金额'] },
    { id: 'db2-ch3', name: 'Top 城市排行', type: 'bar', datasetName: '订单明细数据集', dimensions: ['城市'], metrics: ['订单金额'] },
    { id: 'db2-ch4', name: '客单价趋势', type: 'line', datasetName: '订单明细数据集', dimensions: ['订单日期'], metrics: ['实付金额'] },
  ]},
  { id: 'DB003', name: '用户增长看板', chartCount: 2, creator: '王五', createdAt: '2026-06-01', updatedAt: '2026-06-08', status: 'pending', charts: [
    { id: 'db3-ch1', name: '新增用户趋势', type: 'line', datasetName: '用户画像数据集', dimensions: ['注册日期'], metrics: ['消费总额'] },
    { id: 'db3-ch2', name: '用户性别分布', type: 'pie', datasetName: '用户画像数据集', dimensions: ['性别'], metrics: ['消费总额'] },
  ]},
  { id: 'DB004', name: '供应链监控', chartCount: 3, creator: '赵六', createdAt: '2026-05-20', updatedAt: '2026-06-07', status: 'online', charts: [
    { id: 'db4-ch1', name: '库存周转趋势', type: 'area', datasetName: '库存实时数据集', dimensions: ['订单日期'], metrics: ['订单数量'] },
    { id: 'db4-ch2', name: '物流时效分布', type: 'bar', datasetName: '物流轨迹数据集', dimensions: ['省份'], metrics: ['订单金额'] },
    { id: 'db4-ch3', name: '缺货预警', type: 'pie', datasetName: '商品信息数据集', dimensions: ['商品品类'], metrics: ['订单数量'] },
  ]},
  { id: 'DB005', name: '财务总览', chartCount: 2, creator: '张三', createdAt: '2026-03-25', updatedAt: '2026-03-25', status: 'offline', charts: [
    { id: 'db5-ch1', name: '收支对比', type: 'bar', datasetName: '财务报表数据集', dimensions: ['订单日期'], metrics: ['订单金额'] },
    { id: 'db5-ch2', name: '利润趋势', type: 'line', datasetName: '财务报表数据集', dimensions: ['订单日期'], metrics: ['实付金额'] },
  ]},
  { id: 'DB006', name: '实时流量监控', chartCount: 2, creator: 'data_team', createdAt: '2026-06-03', updatedAt: '2026-06-09', status: 'pending', charts: [
    { id: 'db6-ch1', name: '访问量实时曲线', type: 'area', datasetName: '访问日志数据集', dimensions: ['注册日期'], metrics: ['订单次数'] },
    { id: 'db6-ch2', name: 'UV/PV 趋势', type: 'line', datasetName: '访问日志数据集', dimensions: ['注册日期'], metrics: ['消费总额'] },
  ]},
  { id: 'DB007', name: '营销效果分析', chartCount: 3, creator: 'zhangsan', createdAt: '2026-05-27', updatedAt: '2026-06-06', status: 'online', charts: [
    { id: 'db7-ch1', name: '渠道转化漏斗', type: 'bar', datasetName: '营销活动数据集', dimensions: ['商品品类'], metrics: ['订单金额'] },
    { id: 'db7-ch2', name: 'ROI 趋势', type: 'line', datasetName: '营销活动数据集', dimensions: ['注册日期'], metrics: ['消费总额'] },
    { id: 'db7-ch3', name: '活动参与占比', type: 'pie', datasetName: '营销活动数据集', dimensions: ['会员等级'], metrics: ['订单次数'] },
  ]},
  { id: 'DB008', name: '库存预警中心', chartCount: 2, creator: 'lisi', createdAt: '2026-05-19', updatedAt: '2026-06-05', status: 'online', charts: [
    { id: 'db8-ch1', name: '库存水位', type: 'area', datasetName: '库存实时数据集', dimensions: ['订单日期'], metrics: ['订单数量'] },
    { id: 'db8-ch2', name: '品类库存占比', type: 'pie', datasetName: '商品信息数据集', dimensions: ['商品品类'], metrics: ['订单数量'] },
  ]},
  { id: 'DB009', name: '风控驾驶舱', chartCount: 4, creator: 'wangwu', createdAt: '2026-05-18', updatedAt: '2026-06-04', status: 'online', charts: [
    { id: 'db9-ch1', name: '风险等级分布', type: 'pie', datasetName: '风控规则数据集', dimensions: ['会员等级'], metrics: ['消费总额'] },
    { id: 'db9-ch2', name: '异常交易趋势', type: 'line', datasetName: '风控规则数据集', dimensions: ['注册日期'], metrics: ['订单金额'] },
    { id: 'db9-ch3', name: '拦截率统计', type: 'bar', datasetName: '风控规则数据集', dimensions: ['商品品类'], metrics: ['订单次数'] },
    { id: 'db9-ch4', name: '风险热力', type: 'area', datasetName: '风控规则数据集', dimensions: ['省份'], metrics: ['实付金额'] },
  ]},
  { id: 'DB010', name: '客服数据看板', chartCount: 2, creator: 'zhao_liu', createdAt: '2026-05-22', updatedAt: '2026-06-03', status: 'online', charts: [
    { id: 'db10-ch1', name: '工单量趋势', type: 'line', datasetName: 'CRM 客户数据集', dimensions: ['注册日期'], metrics: ['订单次数'] },
    { id: 'db10-ch2', name: '满意度分布', type: 'pie', datasetName: 'CRM 客户数据集', dimensions: ['会员等级'], metrics: ['消费总额'] },
  ]},
  { id: 'DB011', name: '产品迭代追踪', chartCount: 2, creator: 'data_team', createdAt: '2026-05-30', updatedAt: '2026-06-08', status: 'online', charts: [
    { id: 'db11-ch1', name: '版本发布频率', type: 'bar', datasetName: '审计日志数据集', dimensions: ['订单日期'], metrics: ['订单数量'] },
    { id: 'db11-ch2', name: 'Bug 修复趋势', type: 'line', datasetName: '审计日志数据集', dimensions: ['注册日期'], metrics: ['订单金额'] },
  ]},
  { id: 'DB012', name: '审计合规看板', chartCount: 2, creator: 'admin', createdAt: '2026-05-12', updatedAt: '2026-06-10', status: 'online', charts: [
    { id: 'db12-ch1', name: '操作量统计', type: 'area', datasetName: '审计日志数据集', dimensions: ['注册日期'], metrics: ['订单次数'] },
    { id: 'db12-ch2', name: '异常操作占比', type: 'pie', datasetName: '审计日志数据集', dimensions: ['商品品类'], metrics: ['订单金额'] },
  ]},
  { id: 'DB013', name: '技术运维大盘', chartCount: 3, creator: 'dev_team', createdAt: '2026-05-08', updatedAt: '2026-06-11', status: 'online', charts: [
    { id: 'db13-ch1', name: 'QPS 监控', type: 'line', datasetName: '访问日志数据集', dimensions: ['注册日期'], metrics: ['消费总额'] },
    { id: 'db13-ch2', name: '错误率分布', type: 'pie', datasetName: '访问日志数据集', dimensions: ['会员等级'], metrics: ['订单次数'] },
    { id: 'db13-ch3', name: '响应时间趋势', type: 'area', datasetName: '访问日志数据集', dimensions: ['订单日期'], metrics: ['订单金额'] },
  ]},
  { id: 'DB014', name: 'HR 人效分析', chartCount: 2, creator: 'hr_admin', createdAt: '2026-05-25', updatedAt: '2026-06-07', status: 'pending', charts: [
    { id: 'db14-ch1', name: '人均产出趋势', type: 'line', datasetName: '用户画像数据集', dimensions: ['注册日期'], metrics: ['消费总额'] },
    { id: 'db14-ch2', name: '部门绩效分布', type: 'bar', datasetName: '用户画像数据集', dimensions: ['所在城市'], metrics: ['订单金额'] },
  ]},
  { id: 'DB015', name: '物流全局监控', chartCount: 3, creator: 'logistics_team', createdAt: '2026-05-28', updatedAt: '2026-06-09', status: 'online', charts: [
    { id: 'db15-ch1', name: '运单量趋势', type: 'area', datasetName: '物流轨迹数据集', dimensions: ['订单日期'], metrics: ['订单数量'] },
    { id: 'db15-ch2', name: '时效达标率', type: 'line', datasetName: '物流轨迹数据集', dimensions: ['注册日期'], metrics: ['实付金额'] },
    { id: 'db15-ch3', name: '区域配送分布', type: 'pie', datasetName: '物流轨迹数据集', dimensions: ['省份'], metrics: ['订单金额'] },
  ]},
];

export interface DataScreenComponent {
  id: string;
  name: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'card' | 'text' | 'image';
  x: number;
  y: number;
  w: number;
  h: number;
  datasetName?: string;
  dimensions?: string[];
  metrics?: string[];
}

// ==================== 数据大屏 ====================
export interface DataScreenItem {
  id: string;
  name: string;
  resolution: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'online' | 'offline';
  bgColor?: string;
  bgImage?: string;
  components?: DataScreenComponent[];
}

export const dataScreens: DataScreenItem[] = [
  {
    id: 'SC001', name: '618 大促实时大屏', resolution: '3840×1080', creator: '张三', createdAt: '2026-05-15', updatedAt: '2026-06-10', status: 'online',
    bgColor: '#0b1121',
    components: [
      { id: 'sc1-c1', name: 'GMV 实时趋势', type: 'line', x: 40, y: 80, w: 800, h: 360 },
      { id: 'sc1-c2', name: '品类销售占比', type: 'pie', x: 880, y: 80, w: 520, h: 360 },
      { id: 'sc1-c3', name: '今日成交额', type: 'card', x: 1440, y: 80, w: 320, h: 160 },
      { id: 'sc1-c4', name: '订单量趋势', type: 'area', x: 40, y: 480, w: 920, h: 360 },
      { id: 'sc1-c5', name: 'TOP 城市排行', type: 'bar', x: 1000, y: 480, w: 760, h: 360 },
    ],
  },
  {
    id: 'SC002', name: '双11 作战指挥屏', resolution: '5760×2160', creator: '李四', createdAt: '2026-05-20', updatedAt: '2026-06-09', status: 'online',
    bgColor: '#050b1a',
    components: [
      { id: 'sc2-c1', name: '全网销售额', type: 'card', x: 80, y: 100, w: 400, h: 180 },
      { id: 'sc2-c2', name: '用户增长曲线', type: 'line', x: 520, y: 100, w: 900, h: 420 },
      { id: 'sc2-c3', name: '渠道占比', type: 'pie', x: 1460, y: 100, w: 520, h: 420 },
      { id: 'sc2-c4', name: '订单热力图', type: 'bar', x: 80, y: 560, w: 1200, h: 520 },
      { id: 'sc2-c5', name: '实时库存', type: 'area', x: 1320, y: 560, w: 900, h: 520 },
    ],
  },
  {
    id: 'SC003', name: '供应链全局监控', resolution: '3840×1080', creator: '王五', createdAt: '2026-06-01', updatedAt: '2026-06-08', status: 'pending',
    bgColor: '#0b1121',
    components: [
      { id: 'sc3-c1', name: '在途订单数', type: 'card', x: 60, y: 80, w: 340, h: 160 },
      { id: 'sc3-c2', name: '物流时效趋势', type: 'line', x: 440, y: 80, w: 780, h: 360 },
      { id: 'sc3-c3', name: '仓储分布', type: 'pie', x: 1260, y: 80, w: 500, h: 360 },
      { id: 'sc3-c4', name: '缺货预警', type: 'bar', x: 60, y: 480, w: 900, h: 360 },
      { id: 'sc3-c5', name: '到货准时率', type: 'area', x: 1000, y: 480, w: 760, h: 360 },
    ],
  },
  {
    id: 'SC004', name: '财务数据展示屏', resolution: '1920×1080', creator: '赵六', createdAt: '2026-05-25', updatedAt: '2026-06-07', status: 'offline',
    bgColor: '#0b1121',
    components: [
      { id: 'sc4-c1', name: '营业收入', type: 'card', x: 40, y: 60, w: 280, h: 140 },
      { id: 'sc4-c2', name: '净利润', type: 'card', x: 340, y: 60, w: 280, h: 140 },
      { id: 'sc4-c3', name: '收支趋势', type: 'line', x: 40, y: 240, w: 920, h: 360 },
      { id: 'sc4-c4', name: '成本结构', type: 'pie', x: 1000, y: 240, w: 520, h: 360 },
      { id: 'sc4-c5', name: '费用对比', type: 'bar', x: 40, y: 640, w: 1480, h: 320 },
    ],
  },
  {
    id: 'SC005', name: '城市交通指挥屏', resolution: '3840×1080', creator: 'data_team', createdAt: '2026-05-18', updatedAt: '2026-06-06', status: 'online',
    bgColor: '#050b1a',
    components: [
      { id: 'sc5-c1', name: '拥堵指数', type: 'card', x: 60, y: 80, w: 360, h: 160 },
      { id: 'sc5-c2', name: '流量趋势', type: 'line', x: 460, y: 80, w: 820, h: 360 },
      { id: 'sc5-c3', name: '事故类型分布', type: 'pie', x: 1320, y: 80, w: 480, h: 360 },
      { id: 'sc5-c4', name: '主干道车速', type: 'bar', x: 60, y: 480, w: 900, h: 360 },
      { id: 'sc5-c5', name: '通行量预测', type: 'area', x: 1000, y: 480, w: 800, h: 360 },
    ],
  },
  {
    id: 'SC006', name: '生产车间可视化', resolution: '2560×1440', creator: 'factory_team', createdAt: '2026-05-28', updatedAt: '2026-06-08', status: 'online',
    bgColor: '#0b1121',
    components: [
      { id: 'sc6-c1', name: '产量达成率', type: 'card', x: 40, y: 60, w: 320, h: 160 },
      { id: 'sc6-c2', name: '设备 OEE', type: 'card', x: 380, y: 60, w: 320, h: 160 },
      { id: 'sc6-c3', name: '产线良率', type: 'line', x: 40, y: 260, w: 760, h: 340 },
      { id: 'sc6-c4', name: '缺陷分布', type: 'pie', x: 840, y: 260, w: 520, h: 340 },
      { id: 'sc6-c5', name: '能耗趋势', type: 'area', x: 40, y: 640, w: 1320, h: 320 },
    ],
  },
  {
    id: 'SC007', name: '零售门店数据屏', resolution: '1920×1080', creator: 'retail_team', createdAt: '2026-05-22', updatedAt: '2026-06-05', status: 'online',
    bgColor: '#0b1121',
    components: [
      { id: 'sc7-c1', name: '今日销售额', type: 'card', x: 40, y: 60, w: 300, h: 140 },
      { id: 'sc7-c2', name: '客流趋势', type: 'line', x: 40, y: 240, w: 920, h: 340 },
      { id: 'sc7-c3', name: '品类占比', type: 'pie', x: 1000, y: 240, w: 520, h: 340 },
      { id: 'sc7-c4', name: '时段销售', type: 'bar', x: 40, y: 620, w: 1480, h: 340 },
    ],
  },
  {
    id: 'SC008', name: '能源消耗监控屏', resolution: '3840×1080', creator: 'energy_team', createdAt: '2026-05-30', updatedAt: '2026-06-07', status: 'online',
    bgColor: '#050b1a',
    components: [
      { id: 'sc8-c1', name: '总能耗', type: 'card', x: 60, y: 80, w: 360, h: 160 },
      { id: 'sc8-c2', name: '能耗趋势', type: 'line', x: 460, y: 80, w: 880, h: 360 },
      { id: 'sc8-c3', name: '能源结构', type: 'pie', x: 1380, y: 80, w: 480, h: 360 },
      { id: 'sc8-c4', name: '区域能耗对比', type: 'bar', x: 60, y: 480, w: 920, h: 360 },
      { id: 'sc8-c5', name: '碳排放预测', type: 'area', x: 1020, y: 480, w: 840, h: 360 },
    ],
  },
  {
    id: 'SC009', name: '医疗资源调度屏', resolution: '2560×1440', creator: 'medical_team', createdAt: '2026-06-02', updatedAt: '2026-06-06', status: 'pending',
    bgColor: '#0b1121',
    components: [
      { id: 'sc9-c1', name: '在院患者', type: 'card', x: 40, y: 60, w: 320, h: 160 },
      { id: 'sc9-c2', name: '床位使用率', type: 'card', x: 380, y: 60, w: 320, h: 160 },
      { id: 'sc9-c3', name: '科室负荷', type: 'bar', x: 40, y: 260, w: 760, h: 340 },
      { id: 'sc9-c4', name: '急救趋势', type: 'line', x: 840, y: 260, w: 520, h: 340 },
      { id: 'sc9-c5', name: '药品库存', type: 'area', x: 40, y: 640, w: 1320, h: 320 },
    ],
  },
  {
    id: 'SC010', name: '教育质量分析屏', resolution: '1920×1080', creator: 'edu_team', createdAt: '2026-05-26', updatedAt: '2026-06-04', status: 'online',
    bgColor: '#0b1121',
    components: [
      { id: 'sc10-c1', name: '学生总数', type: 'card', x: 40, y: 60, w: 300, h: 140 },
      { id: 'sc10-c2', name: '成绩分布', type: 'bar', x: 40, y: 240, w: 920, h: 340 },
      { id: 'sc10-c3', name: '学科占比', type: 'pie', x: 1000, y: 240, w: 520, h: 340 },
      { id: 'sc10-c4', name: '出勤趋势', type: 'line', x: 40, y: 620, w: 1480, h: 340 },
    ],
  },
  {
    id: 'SC011', name: '金融风控大屏', resolution: '5760×2160', creator: 'finance_team', createdAt: '2026-05-16', updatedAt: '2026-06-09', status: 'online',
    bgColor: '#050b1a',
    components: [
      { id: 'sc11-c1', name: '风险交易数', type: 'card', x: 80, y: 100, w: 400, h: 180 },
      { id: 'sc11-c2', name: '交易趋势', type: 'line', x: 520, y: 100, w: 900, h: 420 },
      { id: 'sc11-c3', name: '风险类型', type: 'pie', x: 1460, y: 100, w: 520, h: 420 },
      { id: 'sc11-c4', name: '拦截统计', type: 'bar', x: 80, y: 560, w: 1200, h: 520 },
      { id: 'sc11-c5', name: '规则命中', type: 'area', x: 1320, y: 560, w: 900, h: 520 },
    ],
  },
  {
    id: 'SC012', name: '智慧园区展示屏', resolution: '3840×1080', creator: 'park_team', createdAt: '2026-05-29', updatedAt: '2026-06-08', status: 'online',
    bgColor: '#0b1121',
    components: [
      { id: 'sc12-c1', name: '园区总人数', type: 'card', x: 60, y: 80, w: 360, h: 160 },
      { id: 'sc12-c2', name: '能耗监控', type: 'line', x: 460, y: 80, w: 860, h: 360 },
      { id: 'sc12-c3', name: '车位占用', type: 'pie', x: 1360, y: 80, w: 480, h: 360 },
      { id: 'sc12-c4', name: '安防事件', type: 'bar', x: 60, y: 480, w: 920, h: 360 },
      { id: 'sc12-c5', name: '环境监测', type: 'area', x: 1020, y: 480, w: 820, h: 360 },
    ],
  },
  {
    id: 'SC013', name: '政务数据公开屏', resolution: '1920×1080', creator: 'gov_team', createdAt: '2026-06-03', updatedAt: '2026-06-05', status: 'pending',
    bgColor: '#0b1121',
    components: [
      { id: 'sc13-c1', name: '办件总量', type: 'card', x: 40, y: 60, w: 300, h: 140 },
      { id: 'sc13-c2', name: '事项办理趋势', type: 'line', x: 40, y: 240, w: 920, h: 340 },
      { id: 'sc13-c3', name: '部门占比', type: 'pie', x: 1000, y: 240, w: 520, h: 340 },
      { id: 'sc13-c4', name: '满意度评价', type: 'bar', x: 40, y: 620, w: 1480, h: 340 },
    ],
  },
  {
    id: 'SC014', name: '体育赛事直播屏', resolution: '3840×1080', creator: 'sports_team', createdAt: '2026-05-24', updatedAt: '2026-06-07', status: 'online',
    bgColor: '#050b1a',
    components: [
      { id: 'sc14-c1', name: '实时观众', type: 'card', x: 60, y: 80, w: 360, h: 160 },
      { id: 'sc14-c2', name: '收视趋势', type: 'line', x: 460, y: 80, w: 860, h: 360 },
      { id: 'sc14-c3', name: '平台分布', type: 'pie', x: 1360, y: 80, w: 480, h: 360 },
      { id: 'sc14-c4', name: '热门项目', type: 'bar', x: 60, y: 480, w: 920, h: 360 },
      { id: 'sc14-c5', name: '互动量', type: 'area', x: 1020, y: 480, w: 820, h: 360 },
    ],
  },
  {
    id: 'SC015', name: '旅游客流分析屏', resolution: '2560×1440', creator: 'travel_team', createdAt: '2026-05-31', updatedAt: '2026-06-09', status: 'online',
    bgColor: '#0b1121',
    components: [
      { id: 'sc15-c1', name: '今日客流', type: 'card', x: 40, y: 60, w: 320, h: 160 },
      { id: 'sc15-c2', name: '客流预测', type: 'line', x: 40, y: 260, w: 760, h: 340 },
      { id: 'sc15-c3', name: '来源地分布', type: 'pie', x: 840, y: 260, w: 520, h: 340 },
      { id: 'sc15-c4', name: '景区热度', type: 'bar', x: 40, y: 640, w: 1320, h: 320 },
    ],
  },
];

// ==================== 用户管理 ====================
export interface UserDataPermission {
  view: boolean;
  manage: boolean;
}

export interface UserDataPermissions {
  datasource: UserDataPermission;
  dataset: UserDataPermission;
  chart: UserDataPermission;
  report: UserDataPermission;
  dashboard: UserDataPermission;
  datascreen: UserDataPermission;
}

export interface MenuPermission {
  id: string;
  name: string;
  icon?: string;
  permissions: ('view' | 'manage')[];
}

export type ResourcePermissionType = 'datasource' | 'dataset' | 'chart' | 'report' | 'dashboard' | 'datascreen';

export interface ResourcePermission {
  resourceType: ResourcePermissionType;
  resourceId: string;
  resourceName: string;
  view: boolean;
  manage: boolean;
}

export interface TenantMembership {
  tenantId: string;
  /** 用户在当前租户下的角色：admin=租户管理员，member=普通成员 */
  role: 'admin' | 'member';
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  roleId: string;
  department: string;
  position?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  menuPermissions?: MenuPermission[];
  dataPermissions?: UserDataPermissions;
  resourcePermissions?: ResourcePermission[];
  /** 用户所属的租户空间列表（支持一个用户存在于多个租户） */
  tenantMemberships?: TenantMembership[];
  /** 是否为系统超级管理员（平台级，可进入租户管理） */
  isSuperAdmin?: boolean;
}

const defaultDataPermissions: UserDataPermissions = {
  datasource: { view: false, manage: false },
  dataset: { view: false, manage: false },
  chart: { view: false, manage: false },
  report: { view: false, manage: false },
  dashboard: { view: false, manage: false },
  datascreen: { view: false, manage: false },
};

export const resourcePermissionGroups: { key: ResourcePermissionType; label: string; items: { id: string; name: string }[] }[] = [
  { key: 'datasource', label: '数据源', items: dataSources.slice(0, 5).map((d) => ({ id: d.id, name: d.name })) },
  { key: 'dataset', label: '数据集', items: datasets.slice(0, 5).map((d) => ({ id: d.id, name: d.name })) },
  { key: 'chart', label: '图表', items: charts.slice(0, 5).map((d) => ({ id: d.id, name: d.name })) },
  { key: 'report', label: '报表', items: reports.slice(0, 5).map((d) => ({ id: d.id, name: d.name })) },
  { key: 'dashboard', label: '仪表盘', items: dashboards.slice(0, 5).map((d) => ({ id: d.id, name: d.name })) },
  { key: 'datascreen', label: '数据大屏', items: dataScreens.slice(0, 5).map((d) => ({ id: d.id, name: d.name })) },
];

function buildResourcePermissions(roleId: string): ResourcePermission[] {
  const perms: ResourcePermission[] = [];
  resourcePermissionGroups.forEach((group) => {
    group.items.forEach((item, idx) => {
      let view = false;
      let manage = false;
      if (roleId === 'R001') {
        view = true;
        manage = true;
      } else if (roleId === 'R002') {
        if (['dataset', 'chart', 'report', 'dashboard'].includes(group.key)) {
          view = true;
          manage = idx % 2 === 1;
        } else if (['datasource', 'datascreen'].includes(group.key)) {
          view = true;
        }
      } else if (roleId === 'R003') {
        if (['report', 'dashboard', 'datascreen'].includes(group.key)) {
          view = true;
          manage = group.key === 'dashboard' && idx === 1;
        }
      }
      perms.push({ resourceType: group.key, resourceId: item.id, resourceName: item.name, view, manage });
    });
  });
  return perms;
}

export const users: UserItem[] = [
  {
    id: 'U001',
    name: '张三',
    email: 'zhangsan@company.com',
    phone: '13800138001',
    role: '系统管理员',
    roleId: 'R001',
    department: '技术部',
    position: '技术总监',
    status: 'active',
    createdAt: '2026-01-10',
    updatedAt: '2026-06-10',
    lastLoginAt: '2026-08-11 09:30',
    tenantMemberships: [
      { tenantId: 'T001', role: 'admin' },
      { tenantId: 'T002', role: 'member' },
    ],
    isSuperAdmin: true,
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view', 'manage'] },
      { id: 'datasource', name: '数据源', permissions: ['view', 'manage'] },
      { id: 'dataset', name: '数据集', permissions: ['view', 'manage'] },
      { id: 'self-service', name: '自助取数', permissions: ['view', 'manage'] },
      { id: 'chart', name: '图表管理', permissions: ['view', 'manage'] },
      { id: 'report', name: '报表', permissions: ['view', 'manage'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view', 'manage'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view', 'manage'] },
      { id: 'user-manage', name: '用户管理', permissions: ['view', 'manage'] },
      { id: 'role-manage', name: '角色管理', permissions: ['view', 'manage'] },
      { id: 'operation-log', name: '操作日志', permissions: ['view', 'manage'] },
      { id: 'tenant-manage', name: '租户管理', permissions: ['view', 'manage'] },
      { id: 'metric-monitor', name: '指标监控', permissions: ['view', 'manage'] },
    ],
    dataPermissions: {
      datasource: { view: true, manage: true },
      dataset: { view: true, manage: true },
      chart: { view: true, manage: true },
      report: { view: true, manage: true },
      dashboard: { view: true, manage: true },
      datascreen: { view: true, manage: true },
    },
    resourcePermissions: buildResourcePermissions('R001'),
  },
  {
    id: 'U002',
    name: '李四',
    email: 'lisi@company.com',
    phone: '13800138002',
    role: '数据分析师',
    roleId: 'R002',
    department: '数据部',
    position: '高级数据分析师',
    status: 'active',
    createdAt: '2026-01-15',
    updatedAt: '2026-06-08',
    lastLoginAt: '2026-08-10 18:20',
    tenantMemberships: [
      { tenantId: 'T002', role: 'admin' },
      { tenantId: 'T003', role: 'member' },
    ],
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
      { id: 'datasource', name: '数据源', permissions: ['view'] },
      { id: 'dataset', name: '数据集', permissions: ['view', 'manage'] },
      { id: 'self-service', name: '自助取数', permissions: ['view', 'manage'] },
      { id: 'chart', name: '图表管理', permissions: ['view', 'manage'] },
      { id: 'report', name: '报表', permissions: ['view', 'manage'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view', 'manage'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view'] },
    ],
    dataPermissions: {
      datasource: { view: true, manage: false },
      dataset: { view: true, manage: true },
      chart: { view: true, manage: true },
      report: { view: true, manage: true },
      dashboard: { view: true, manage: true },
      datascreen: { view: true, manage: false },
    },
    resourcePermissions: buildResourcePermissions('R002'),
  },
  {
    id: 'U003',
    name: '王五',
    email: 'wangwu@company.com',
    phone: '13800138003',
    role: '数据分析师',
    roleId: 'R002',
    department: '数据部',
    position: '数据分析师',
    status: 'active',
    createdAt: '2026-02-01',
    updatedAt: '2026-05-22',
    lastLoginAt: '2026-08-11 08:45',
    tenantMemberships: [
      { tenantId: 'T003', role: 'admin' },
    ],
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
      { id: 'datasource', name: '数据源', permissions: ['view'] },
      { id: 'dataset', name: '数据集', permissions: ['view', 'manage'] },
      { id: 'self-service', name: '自助取数', permissions: ['view'] },
      { id: 'chart', name: '图表管理', permissions: ['view', 'manage'] },
      { id: 'report', name: '报表', permissions: ['view'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view', 'manage'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view'] },
    ],
    dataPermissions: {
      datasource: { view: true, manage: false },
      dataset: { view: true, manage: true },
      chart: { view: true, manage: true },
      report: { view: true, manage: false },
      dashboard: { view: true, manage: true },
      datascreen: { view: true, manage: false },
    },
    resourcePermissions: buildResourcePermissions('R002'),
  },
  {
    id: 'U004',
    name: '赵六',
    email: 'zhaoliu@company.com',
    phone: '13800138004',
    role: '业务人员',
    roleId: 'R003',
    department: '运营部',
    position: '运营专员',
    status: 'active',
    createdAt: '2026-02-20',
    updatedAt: '2026-06-05',
    lastLoginAt: '2026-08-09 17:10',
    tenantMemberships: [
      { tenantId: 'T004', role: 'admin' },
      { tenantId: 'T001', role: 'member' },
    ],
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view'] },
      { id: 'report', name: '报表', permissions: ['view'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view'] },
    ],
    dataPermissions: {
      datasource: { view: false, manage: false },
      dataset: { view: false, manage: false },
      chart: { view: false, manage: false },
      report: { view: true, manage: false },
      dashboard: { view: true, manage: false },
      datascreen: { view: true, manage: false },
    },
    resourcePermissions: buildResourcePermissions('R003'),
  },
  {
    id: 'U005',
    name: '孙七',
    email: 'sunqi@company.com',
    phone: '13800138005',
    role: '业务人员',
    roleId: 'R003',
    department: '市场部',
    position: '市场专员',
    status: 'inactive',
    createdAt: '2026-03-10',
    updatedAt: '2026-07-28',
    lastLoginAt: '2026-07-20 16:00',
    tenantMemberships: [
      { tenantId: 'T001', role: 'member' },
    ],
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view'] },
      { id: 'report', name: '报表', permissions: ['view'] },
    ],
    dataPermissions: {
      datasource: { view: false, manage: false },
      dataset: { view: false, manage: false },
      chart: { view: false, manage: false },
      report: { view: true, manage: false },
      dashboard: { view: true, manage: false },
      datascreen: { view: false, manage: false },
    },
    resourcePermissions: buildResourcePermissions('R003'),
  },
];

export const defaultUserDataPermissions = defaultDataPermissions;

// ==================== 角色管理 ====================
export interface RoleItem {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  status: 'active' | 'inactive';
  menuPermissions?: MenuPermission[];
}

export const roles: RoleItem[] = [
  {
    id: 'R001',
    name: '系统管理员',
    description: '拥有所有模块的管理权限',
    userCount: 2,
    permissions: ['全部权限'],
    status: 'active',
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view', 'manage'] },
      { id: 'datasource', name: '数据源', permissions: ['view', 'manage'] },
      { id: 'dataset', name: '数据集', permissions: ['view', 'manage'] },
      { id: 'self-service', name: '自助取数', permissions: ['view', 'manage'] },
      { id: 'chart', name: '图表管理', permissions: ['view', 'manage'] },
      { id: 'report', name: '报表', permissions: ['view', 'manage'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view', 'manage'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view', 'manage'] },
      { id: 'user-manage', name: '用户管理', permissions: ['view', 'manage'] },
      { id: 'role-manage', name: '角色管理', permissions: ['view', 'manage'] },
      { id: 'operation-log', name: '操作日志', permissions: ['view', 'manage'] },
      { id: 'tenant-manage', name: '租户管理', permissions: ['view', 'manage'] },
      { id: 'metric-monitor', name: '指标监控', permissions: ['view', 'manage'] },
    ],
  },
  {
    id: 'R002',
    name: '数据分析师',
    description: '可创建数据集、图表和仪表盘',
    userCount: 3,
    permissions: ['数据准备', '数据分析'],
    status: 'active',
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
      { id: 'datasource', name: '数据源', permissions: ['view'] },
      { id: 'dataset', name: '数据集', permissions: ['view', 'manage'] },
      { id: 'self-service', name: '自助取数', permissions: ['view', 'manage'] },
      { id: 'chart', name: '图表管理', permissions: ['view', 'manage'] },
      { id: 'report', name: '报表', permissions: ['view', 'manage'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view', 'manage'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view'] },
    ],
  },
  {
    id: 'R003',
    name: '业务人员',
    description: '可查看已发布的数据资产',
    userCount: 8,
    permissions: ['数据门户'],
    status: 'active',
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
      { id: 'report', name: '报表', permissions: ['view'] },
      { id: 'dashboard', name: '仪表盘', permissions: ['view'] },
      { id: 'data-screen', name: '数据大屏', permissions: ['view'] },
    ],
  },
  {
    id: 'R004',
    name: '访客',
    description: '仅查看权限，不可操作',
    userCount: 5,
    permissions: ['数据门户(只读)'],
    status: 'inactive',
    menuPermissions: [
      { id: 'data-portal', name: '数据门户', permissions: ['view'] },
    ],
  },
];

// ==================== 菜单树（用于权限配置） ====================
export interface MenuTreeItem {
  id: string;
  label: string;
}

export interface MenuTreeGroup {
  label: string;
  items: MenuTreeItem[];
}

export const menuTree: MenuTreeGroup[] = [
  {
    label: '数据门户',
    items: [{ id: 'data-portal', label: '数据门户' }],
  },
  {
    label: '数据准备',
    items: [
      { id: 'datasource', label: '数据源' },
      { id: 'dataset', label: '数据集' },
      { id: 'self-service', label: '自助取数' },
    ],
  },
  {
    label: '数据分析',
    items: [
      { id: 'data-explore', label: '数据探查' },
      { id: 'chart', label: '图表管理' },
      { id: 'report', label: '报表' },
      { id: 'dashboard', label: '仪表盘' },
      { id: 'data-screen', label: '数据大屏' },
    ],
  },
  {
    label: '系统管理',
    items: [
      { id: 'user-manage', label: '用户管理' },
      { id: 'role-manage', label: '角色管理' },
      { id: 'operation-log', label: '操作日志' },
      { id: 'tenant-manage', label: '租户管理' },
    ],
  },
  {
    label: '监控告警',
    items: [{ id: 'metric-monitor', label: '指标监控' }],
  },
];

/** 菜单与数据资源类型的映射；没有对应资源的菜单为 null */
export const menuToResourceType: Record<string, ResourcePermissionType | null> = {
  datasource: 'datasource',
  dataset: 'dataset',
  chart: 'chart',
  report: 'report',
  dashboard: 'dashboard',
  'data-screen': 'datascreen',
};

// ==================== 操作日志 ====================
export type OperationActionType = 'create' | 'update' | 'delete' | 'publish' | 'download' | 'export' | 'login' | 'other';

export interface OperationLog {
  id: string;
  user: string;
  account: string;
  module: string;
  menuId: string;
  action: string;
  actionType: OperationActionType;
  detail: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip: string;
  time: string;
}

export const operationLogs: OperationLog[] = [
  {
    id: 'L001',
    user: '张三',
    account: 'zhangsan@company.com',
    module: '数据源',
    menuId: 'datasource',
    action: '创建',
    actionType: 'create',
    detail: '创建了数据源「订单数据库」',
    before: null,
    after: { name: '订单数据库', type: 'MySQL', host: 'mysql.company.com', port: 3306, status: 'active' },
    ip: '192.168.1.100',
    time: '2026-06-10 09:30:15',
  },
  {
    id: 'L002',
    user: '李四',
    account: 'lisi@company.com',
    module: '数据集',
    menuId: 'dataset',
    action: '更新',
    actionType: 'update',
    detail: '更新了数据集「用户画像数据集」',
    before: { name: '用户画像数据集', refreshInterval: 60, description: '原始描述' },
    after: { name: '用户画像数据集', refreshInterval: 30, description: '更新后的描述内容' },
    ip: '192.168.1.101',
    time: '2026-06-10 10:15:22',
  },
  {
    id: 'L003',
    user: '王五',
    account: 'wangwu@company.com',
    module: '图表管理',
    menuId: 'chart',
    action: '删除',
    actionType: 'delete',
    detail: '删除了图表「测试图表」',
    before: { name: '测试图表', type: 'line', dataset: '订单明细数据集' },
    after: null,
    ip: '192.168.1.102',
    time: '2026-06-10 11:05:08',
  },
  {
    id: 'L004',
    user: '赵六',
    account: 'zhaoliu@company.com',
    module: '仪表盘',
    menuId: 'dashboard',
    action: '发布',
    actionType: 'publish',
    detail: '发布了仪表盘「运营核心指标」',
    before: { status: 'draft' },
    after: { status: 'published', publishedAt: '2026-06-10 14:20:33' },
    ip: '192.168.1.103',
    time: '2026-06-10 14:20:33',
  },
  {
    id: 'L005',
    user: '张三',
    account: 'zhangsan@company.com',
    module: '用户管理',
    menuId: 'user-manage',
    action: '创建',
    actionType: 'create',
    detail: '创建了用户「孙七」',
    before: null,
    after: { name: '孙七', email: 'sunqi@company.com', role: '业务人员', department: '市场部', status: 'active' },
    ip: '192.168.1.100',
    time: '2026-06-09 16:45:10',
  },
  {
    id: 'L006',
    user: '李四',
    account: 'lisi@company.com',
    module: '数据大屏',
    menuId: 'data-screen',
    action: '编辑',
    actionType: 'update',
    detail: '编辑了大屏「618 大促实时大屏」',
    before: { name: '618 大促实时大屏', resolution: '1920×1080' },
    after: { name: '618 大促实时大屏', resolution: '3840×1080' },
    ip: '192.168.1.101',
    time: '2026-06-09 09:10:55',
  },
  {
    id: 'L007',
    user: '王五',
    account: 'wangwu@company.com',
    module: '自助取数',
    menuId: 'data-explore',
    action: '下载',
    actionType: 'download',
    detail: '下载了取数结果「订单明细_20260609.csv」',
    before: null,
    after: { fileName: '订单明细_20260609.csv', rows: 12580, size: '2.3MB' },
    ip: '192.168.1.102',
    time: '2026-06-09 11:30:40',
  },
  {
    id: 'L008',
    user: '赵六',
    account: 'zhaoliu@company.com',
    module: '报表',
    menuId: 'report',
    action: '导出',
    actionType: 'export',
    detail: '导出了报表「销售日报」',
    before: null,
    after: { fileName: '销售日报.xlsx', format: 'xlsx' },
    ip: '192.168.1.103',
    time: '2026-06-09 15:55:18',
  },
  {
    id: 'L009',
    user: '张三',
    account: 'zhangsan@company.com',
    module: '角色管理',
    menuId: 'role-manage',
    action: '编辑',
    actionType: 'update',
    detail: '编辑了角色「数据分析师」',
    before: { description: '可创建数据集、图表和仪表盘' },
    after: { description: '可创建数据集、图表、仪表盘和报表' },
    ip: '192.168.1.100',
    time: '2026-06-09 14:22:10',
  },
  {
    id: 'L010',
    user: '李四',
    account: 'lisi@company.com',
    module: '租户管理',
    menuId: 'tenant-manage',
    action: '创建',
    actionType: 'create',
    detail: '创建了租户「华东分部」',
    before: null,
    after: { name: '华东分部', code: 'HD', userQuota: 50, status: 'active' },
    ip: '192.168.1.101',
    time: '2026-06-08 09:30:00',
  },
  {
    id: 'L011',
    user: '王五',
    account: 'wangwu@company.com',
    module: '指标监控',
    menuId: 'metric-monitor',
    action: '更新',
    actionType: 'update',
    detail: '更新了告警规则「订单量骤减」',
    before: { threshold: 1000, notifyWay: '邮件' },
    after: { threshold: 800, notifyWay: '邮件+短信' },
    ip: '192.168.1.102',
    time: '2026-06-08 16:15:42',
  },
  {
    id: 'L012',
    user: '赵六',
    account: 'zhaoliu@company.com',
    module: '数据门户',
    menuId: 'data-portal',
    action: '登录',
    actionType: 'login',
    detail: '登录了系统',
    before: null,
    after: { loginAt: '2026-06-08 08:55:12', userAgent: 'Chrome 145' },
    ip: '192.168.1.103',
    time: '2026-06-08 08:55:12',
  },
];

// ==================== 租户管理 ====================
export interface TenantItem {
  id: string;
  name: string;
  code: string;
  contact: string;
  contactPhone?: string;
  userQuota: number;
  storageQuota: string;
  status: 'active' | 'inactive';
  expireAt: string;
  createdAt?: string;
  description?: string;
  /** 租户管理员用户 ID */
  adminUserId?: string;
}

export const tenants: TenantItem[] = [
  {
    id: 'T001',
    name: '总部',
    code: 'HQ',
    contact: '张三',
    contactPhone: '13800138001',
    userQuota: 100,
    storageQuota: '500GB',
    status: 'active',
    expireAt: '2027-06-10',
    createdAt: '2026-01-01',
    description: '集团总部租户，管理全部数据资产与系统配置。',
    adminUserId: 'U001',
  },
  {
    id: 'T002',
    name: '华东分部',
    code: 'HD',
    contact: '李四',
    contactPhone: '13800138002',
    userQuota: 50,
    storageQuota: '200GB',
    status: 'active',
    expireAt: '2027-03-15',
    createdAt: '2026-02-01',
    description: '华东区域业务数据与运营看板。',
    adminUserId: 'U002',
  },
  {
    id: 'T003',
    name: '华南分部',
    code: 'HN',
    contact: '王五',
    contactPhone: '13800138003',
    userQuota: 50,
    storageQuota: '200GB',
    status: 'active',
    expireAt: '2027-03-15',
    createdAt: '2026-02-15',
    description: '华南区域业务数据与运营看板。',
    adminUserId: 'U003',
  },
  {
    id: 'T004',
    name: '华北分部',
    code: 'HB',
    contact: '赵六',
    contactPhone: '13800138004',
    userQuota: 30,
    storageQuota: '100GB',
    status: 'inactive',
    expireAt: '2026-06-01',
    createdAt: '2026-03-01',
    description: '华北区域业务数据与运营看板（已停用）。',
    adminUserId: 'U004',
  },
];

/** 获取租户管理员名称 */
export function getTenantAdminName(tenantId: string): string {
  const tenant = tenants.find((t) => t.id === tenantId);
  if (!tenant?.adminUserId) return '-';
  const user = users.find((u) => u.id === tenant.adminUserId);
  return user?.name || '-';
}

/** 获取指定租户下的成员（用户与租户存在 membership 关系） */
export function getTenantMembers(tenantId: string): UserItem[] {
  return users.filter((u) => u.tenantMemberships?.some((m) => m.tenantId === tenantId));
}

/** 当前登录用户（原型固定为张三，系统超级管理员） */
export const currentUser: UserItem = users.find((u) => u.id === 'U001')!;

/** 当前登录用户可访问的租户列表 */
export function getCurrentUserTenants(user: UserItem = currentUser): TenantItem[] {
  if (user.isSuperAdmin) return tenants.filter((t) => t.status === 'active');
  const ids = new Set(user.tenantMemberships?.map((m) => m.tenantId) || []);
  return tenants.filter((t) => ids.has(t.id));
}

/** 检查当前用户对某个数据门户资源的查看权限 */
export function getAssetPermission(
  user: UserItem,
  assetType: 'chart' | 'report' | 'dashboard' | 'screen',
  assetId: string
): { view: boolean; manage: boolean } {
  if (user.isSuperAdmin) return { view: true, manage: true };
  const resourceType: ResourcePermissionType =
    assetType === 'screen' ? 'datascreen' : assetType;
  const perm = user.resourcePermissions?.find(
    (p) => p.resourceType === resourceType && p.resourceId === assetId
  );
  if (perm) return { view: perm.view, manage: perm.manage };
  // 无显式权限记录时默认不可见
  return { view: false, manage: false };
}

// ==================== 指标监控 ====================
export interface MetricData {
  label: string;
  value: string;
  change?: number;
  unit?: string;
  /** 自定义趋势文案，优先级高于 change 自动计算 */
  trendText?: string;
}

/** 从日期字串中提取「年-月」，兼容 2026-08-01 与 2026/8/12 两种格式 */
export function getYearMonth(dateStr: string): string {
  const m = dateStr.match(/(\d{4})\D+(\d{1,2})/);
  if (!m) return '';
  return `${m[1]}-${m[2].padStart(2, '0')}`;
}

export const qpsTrend = [
  { time: '00:00', qps: 420 },
  { time: '02:00', qps: 310 },
  { time: '04:00', qps: 280 },
  { time: '06:00', qps: 350 },
  { time: '08:00', qps: 680 },
  { time: '10:00', qps: 1120 },
  { time: '12:00', qps: 980 },
  { time: '14:00', qps: 1280 },
  { time: '16:00', qps: 1150 },
  { time: '18:00', qps: 890 },
  { time: '20:00', qps: 760 },
  { time: '22:00', qps: 540 },
];

// ==================== 监控告警 ====================

export type MonitorResourceType = 'chart' | 'dashboard' | 'report' | 'screen';
export type MonitorTaskStatus = 'running' | 'paused' | 'disabled';
export type PushChannel = 'email' | 'message' | 'wecom';
export type MonitorAlertStatus = 'pending' | 'processed';

export interface MonitorRule {
  operator: '>' | '<' | '>=' | '<=' | '=' | '!=';
  threshold: number;
}

export type MonitorCombineType = 'and' | 'or';

export interface MonitorTask {
  id: string;
  name: string;
  resourceType: MonitorResourceType;
  resourceId: string;
  resourceName: string;
  datasetName: string;
  metricNames: string[];
  dimensionName: string;
  metricRules: Record<string, MonitorRule>;
  combineType: MonitorCombineType;
  pushRuleId: string;
  status: MonitorTaskStatus;
  creator: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface MonitorAlert {
  id: string;
  taskId: string;
  taskName: string;
  resourceType: MonitorResourceType;
  resourceName: string;
  metricName: string;
  dimensionName: string;
  dimensionValue: string;
  actualValue: number;
  threshold: number;
  operator: string;
  triggeredAt: string;
  status: MonitorAlertStatus;
  pushStatus: 'success' | 'failed' | 'pending';
  pushChannel: PushChannel;
  receiver: string;
}

export interface PushRule {
  id: string;
  name: string;
  channel: PushChannel;
  receiver: string;
  cc?: string;
  enabled: boolean;
  creator: string;
  createdAt: string;
  updatedAt: string;
}

export const resourceTypeLabel: Record<MonitorResourceType, string> = {
  chart: '图表',
  dashboard: '仪表盘',
  report: '报表',
  screen: '数据大屏',
};

export const pushChannelLabel: Record<PushChannel, string> = {
  email: '邮件',
  message: '站内信',
  wecom: '企业微信',
};

export const monitorTasks: MonitorTask[] = [
  {
    id: 'MT001',
    name: '月度营销报表销售额监控',
    resourceType: 'report',
    resourceId: 'RP001',
    resourceName: '销售日报',
    datasetName: '订单明细数据集',
    metricNames: ['订单金额'],
    dimensionName: '省份',
    metricRules: { 订单金额: { operator: '<', threshold: 500000 } },
    combineType: 'and',
    pushRuleId: 'PR001',
    status: 'running',
    creator: '张三',
    createdAt: '2026-08-01 10:00',
    updatedAt: '2026-08-11 09:30',
    description: '监控全国各省份月度销售额，低于 50 万时发送预警。',
  },
  {
    id: 'MT002',
    name: '运营核心指标仪表盘监控',
    resourceType: 'dashboard',
    resourceId: 'DB001',
    resourceName: '运营核心指标',
    datasetName: '订单明细数据集',
    metricNames: ['订单金额', '订单数量'],
    dimensionName: '订单日期',
    metricRules: {
      订单金额: { operator: '<', threshold: 100000 },
      订单数量: { operator: '<', threshold: 500 },
    },
    combineType: 'or',
    pushRuleId: 'PR002',
    status: 'running',
    creator: '李四',
    createdAt: '2026-08-02 14:20',
    updatedAt: '2026-08-10 16:45',
    description: '监控运营核心指标仪表盘日销售额或订单量波动。',
  },
  {
    id: 'MT003',
    name: '品类销售占比图表监控',
    resourceType: 'chart',
    resourceId: 'CH002',
    resourceName: '品类销售占比',
    datasetName: '订单明细数据集',
    metricNames: ['订单金额'],
    dimensionName: '商品品类',
    metricRules: { 订单金额: { operator: '<', threshold: 200000 } },
    combineType: 'and',
    pushRuleId: 'PR001',
    status: 'paused',
    creator: '王五',
    createdAt: '2026-08-05 11:10',
    updatedAt: '2026-08-09 10:20',
  },
  {
    id: 'MT004',
    name: '实时流量监控大屏监控',
    resourceType: 'screen',
    resourceId: 'SC001',
    resourceName: '实时销售大屏',
    datasetName: '访问日志数据集',
    metricNames: ['访问用户数'],
    dimensionName: '省份',
    metricRules: { 访问用户数: { operator: '<', threshold: 5000 } },
    combineType: 'and',
    pushRuleId: 'PR003',
    status: 'disabled',
    creator: '赵六',
    createdAt: '2026-07-28 09:00',
    updatedAt: '2026-08-01 12:00',
  },
];

export const monitorAlerts: MonitorAlert[] = [
  {
    id: 'MA001',
    taskId: 'MT001',
    taskName: '月度营销报表销售额监控',
    resourceType: 'report',
    resourceName: '销售日报',
    metricName: '订单金额',
    dimensionName: '省份',
    dimensionValue: '青海省',
    actualValue: 420000,
    threshold: 500000,
    operator: '<',
    triggeredAt: '2026-08-11 08:30',
    status: 'pending',
    pushStatus: 'success',
    pushChannel: 'email',
    receiver: 'zhangsan@company.com',
  },
  {
    id: 'MA002',
    taskId: 'MT001',
    taskName: '月度营销报表销售额监控',
    resourceType: 'report',
    resourceName: '销售日报',
    metricName: '订单金额',
    dimensionName: '省份',
    dimensionValue: '宁夏回族自治区',
    actualValue: 380000,
    threshold: 500000,
    operator: '<',
    triggeredAt: '2026-08-11 09:00',
    status: 'pending',
    pushStatus: 'success',
    pushChannel: 'email',
    receiver: 'zhangsan@company.com',
  },
  {
    id: 'MA003',
    taskId: 'MT002',
    taskName: '运营核心指标仪表盘监控',
    resourceType: 'dashboard',
    resourceName: '运营核心指标',
    metricName: '订单金额',
    dimensionName: '订单日期',
    dimensionValue: '2026-08-10',
    actualValue: 85000,
    threshold: 100000,
    operator: '<',
    triggeredAt: '2026-08-10 23:50',
    status: 'processed',
    pushStatus: 'success',
    pushChannel: 'message',
    receiver: 'lisi@company.com',
  },
  {
    id: 'MA004',
    taskId: 'MT003',
    taskName: '品类销售占比图表监控',
    resourceType: 'chart',
    resourceName: '品类销售占比',
    metricName: '订单金额',
    dimensionName: '商品品类',
    dimensionValue: '家居用品',
    actualValue: 150000,
    threshold: 200000,
    operator: '<',
    triggeredAt: '2026-08-09 14:20',
    status: 'processed',
    pushStatus: 'failed',
    pushChannel: 'email',
    receiver: 'wangwu@company.com',
  },
  {
    id: 'MA005',
    taskId: 'MT001',
    taskName: '月度营销报表销售额监控',
    resourceType: 'report',
    resourceName: '销售日报',
    metricName: '订单金额',
    dimensionName: '省份',
    dimensionValue: '西藏自治区',
    actualValue: 120000,
    threshold: 500000,
    operator: '<',
    triggeredAt: '2026-08-08 10:15',
    status: 'processed',
    pushStatus: 'success',
    pushChannel: 'email',
    receiver: 'zhangsan@company.com',
  },
];

export const pushRules: PushRule[] = [
  {
    id: 'PR001',
    name: '销售团队邮件通知',
    channel: 'email',
    receiver: 'sales@company.com',
    cc: 'manager@company.com',
    enabled: true,
    creator: '张三',
    createdAt: '2026-08-01 10:00',
    updatedAt: '2026-08-11 09:30',
  },
  {
    id: 'PR002',
    name: '运营值班站内信',
    channel: 'message',
    receiver: 'operation-duty@company.com',
    enabled: true,
    creator: '李四',
    createdAt: '2026-08-02 14:20',
    updatedAt: '2026-08-10 16:45',
  },
  {
    id: 'PR003',
    name: '技术值班企业微信',
    channel: 'wecom',
    receiver: 'tech-duty-group',
    enabled: false,
    creator: '赵六',
    createdAt: '2026-07-28 09:00',
    updatedAt: '2026-08-01 12:00',
  },
];

/** 根据资源类型与 ID 获取资源名称 */
export function getMonitorResourceName(type: MonitorResourceType, id: string): string {
  if (type === 'chart') return charts.find((c) => c.id === id)?.name || id;
  if (type === 'dashboard') return dashboards.find((d) => d.id === id)?.name || id;
  if (type === 'report') return reports.find((r) => r.id === id)?.name || id;
  return dataScreens.find((s) => s.id === id)?.name || id;
}

/** 获取资源关联的数据集名称列表 */
export function getResourceDatasets(type: MonitorResourceType, id: string): string[] {
  if (type === 'chart') {
    const item = charts.find((c) => c.id === id);
    return item ? [item.datasetName] : [];
  }
  if (type === 'report') {
    const item = reports.find((r) => r.id === id);
    return item ? [item.datasetName] : [];
  }
  if (type === 'dashboard') {
    const item = dashboards.find((d) => d.id === id);
    return item ? Array.from(new Set((item.charts || []).map((c) => c.datasetName).filter((n): n is string => !!n))) : [];
  }
  if (type === 'screen') {
    // 数据大屏暂按固定示例数据集返回，实际应由大屏组件配置决定
    return ['访问日志数据集'];
  }
  return [];
}

/** 获取数据集下的维度与指标字段 */
export function getDatasetFields(datasetName: string): { dimensions: string[]; metrics: string[] } {
  const fields = datasetFields[datasetName] || [];
  return {
    dimensions: fields.filter((f) => f.type === 'dimension').map((f) => f.name),
    metrics: fields.filter((f) => f.type === 'metric').map((f) => f.name),
  };
}

// ==================== 自助取数 / 数据探查 字段 ====================
export interface DatasetField {
  name: string;
  type: 'dimension' | 'metric';
  dataType: string;
}

/** 图表/大屏组件配置中被选中的字段（维度或指标） */
export interface SelectedField {
  name: string;
  dataType: string;
  aggregation?: string;
  alias?: string;
  sort?: 'asc' | 'desc' | 'none';
  visible?: boolean;
}

export const aggOptions = ['SUM', 'AVG', 'COUNT', 'MAX', 'MIN'];

export const datasetFields: Record<string, DatasetField[]> = {
  '订单明细数据集': [
    { name: '订单日期', type: 'dimension', dataType: '日期' },
    { name: '省份', type: 'dimension', dataType: '文本' },
    { name: '城市', type: 'dimension', dataType: '文本' },
    { name: '商品品类', type: 'dimension', dataType: '文本' },
    { name: '商品名称', type: 'dimension', dataType: '文本' },
    { name: '订单金额', type: 'metric', dataType: '数值' },
    { name: '订单数量', type: 'metric', dataType: '数值' },
    { name: '优惠金额', type: 'metric', dataType: '数值' },
    { name: '实付金额', type: 'metric', dataType: '数值' },
    { name: '用户ID', type: 'dimension', dataType: '文本' },
  ],
  '用户画像数据集': [
    { name: '注册日期', type: 'dimension', dataType: '日期' },
    { name: '性别', type: 'dimension', dataType: '文本' },
    { name: '年龄段', type: 'dimension', dataType: '文本' },
    { name: '所在城市', type: 'dimension', dataType: '文本' },
    { name: '会员等级', type: 'dimension', dataType: '文本' },
    { name: '消费总额', type: 'metric', dataType: '数值' },
    { name: '订单次数', type: 'metric', dataType: '数值' },
    { name: '最近登录', type: 'dimension', dataType: '日期' },
  ],
};

// ==================== 图表示例数据 ====================
export const chartSampleData = [
  { name: '1月', value: 4200, value2: 3800 },
  { name: '2月', value: 5100, value2: 4200 },
  { name: '3月', value: 4800, value2: 4500 },
  { name: '4月', value: 6200, value2: 5100 },
  { name: '5月', value: 7100, value2: 5800 },
  { name: '6月', value: 6800, value2: 6200 },
];

export const pieSampleData = [
  { name: '电子产品', value: 35 },
  { name: '服装', value: 25 },
  { name: '食品', value: 20 },
  { name: '家居', value: 15 },
  { name: '其他', value: 5 },
];

// ==================== 流程审批：订阅审核 ====================
export type SubscribeAuditStatus = 'pending' | 'approved' | 'rejected';

export type SubscribeCycle = 'daily' | 'weekly' | 'monthly';
export const subscribeCycleLabel: Record<SubscribeCycle, string> = {
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
};

export type SubscribeScope = 'current' | 'full';
export const subscribeScopeLabel: Record<SubscribeScope, string> = {
  current: '当前查询条件所见数据',
  full: '全量数据',
};

export interface SubscribeAuditRecord {
  operatorId: string;
  operatorName: string;
  action: 'approved' | 'rejected';
  comment?: string;
  time: string;
}

export interface SubscribeApproval {
  id: string;
  title: string;
  applicantId: string;
  applicantName: string;
  applicantDept: string;
  tenantId: string;
  resourceType: 'chart' | 'dashboard' | 'report' | 'screen';
  resourceId: string;
  resourceName: string;
  cycle: SubscribeCycle;
  scope: SubscribeScope;
  channel: PushChannel;
  receiver: string;
  reason?: string;
  status: SubscribeAuditStatus;
  createdAt: string;
  auditRecords: SubscribeAuditRecord[];
}

export const subscribeCycleColor: Record<SubscribeCycle, string> = {
  daily: '#1677FF',
  weekly: '#722ED1',
  monthly: '#13C2C2',
};

export const subscribeAuditStatusLabel: Record<SubscribeAuditStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};

export const subscribeAuditStatusColor: Record<SubscribeAuditStatus, string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

let __subscribeSeq = 5;
export function nextSubscribeId() {
  return `SUB${String(++__subscribeSeq).padStart(3, '0')}`;
}

export const initialSubscribeApprovals: SubscribeApproval[] = [
  {
    id: 'SUB001',
    title: '品类销售占比订阅',
    applicantId: 'U001',
    applicantName: '张三',
    applicantDept: '运营部',
    tenantId: 'T001',
    resourceType: 'chart',
    resourceId: 'PA001',
    resourceName: '品类销售占比',
    cycle: 'daily',
    scope: 'full',
    channel: 'email',
    receiver: 'zhangsan@company.com',
    reason: '每天需将销售品类占比同步给运营组，用于日报复盘。',
    status: 'pending',
    createdAt: '2026-08-11 09:12',
    auditRecords: [],
  },
  {
    id: 'SUB002',
    title: '月度销售趋势订阅',
    applicantId: 'U005',
    applicantName: '孙七',
    applicantDept: '市场部',
    tenantId: 'T001',
    resourceType: 'chart',
    resourceId: 'PA002',
    resourceName: '月度销售额趋势图',
    cycle: 'weekly',
    scope: 'current',
    channel: 'wecom',
    receiver: '市场部周报群',
    reason: '每周一早会前发给市场部，便于业务回顾。',
    status: 'pending',
    createdAt: '2026-08-11 10:36',
    auditRecords: [],
  },
  {
    id: 'SUB003',
    title: '财务核心指标仪表盘订阅',
    applicantId: 'U006',
    applicantName: '周八',
    applicantDept: '财务部',
    tenantId: 'T002',
    resourceType: 'dashboard',
    resourceId: 'PA006',
    resourceName: '财务核心指标仪表盘',
    cycle: 'daily',
    scope: 'full',
    channel: 'email',
    receiver: 'zhouba@company.com',
    status: 'approved',
    createdAt: '2026-08-10 14:20',
    auditRecords: [
      {
        operatorId: 'U002',
        operatorName: '李四',
        action: 'approved',
        comment: '财务日常需要，已通过。',
        time: '2026-08-10 15:02',
      },
    ],
  },
  {
    id: 'SUB004',
    title: '用户留存分析报表订阅',
    applicantId: 'U003',
    applicantName: '王五',
    applicantDept: '产品部',
    tenantId: 'T002',
    resourceType: 'report',
    resourceId: 'PA008',
    resourceName: '用户留存分析报表',
    cycle: 'monthly',
    scope: 'full',
    channel: 'message',
    receiver: '王五',
    reason: '月度复盘时使用。',
    status: 'rejected',
    createdAt: '2026-08-09 11:05',
    auditRecords: [
      {
        operatorId: 'U002',
        operatorName: '李四',
        action: 'rejected',
        comment: '请改为邮件订阅，避免站内信遗漏。',
        time: '2026-08-09 14:38',
      },
    ],
  },
];

/** 运行时订阅审核数据（包含 PortalPage 提交后新增的） */
export const subscribeApprovals: SubscribeApproval[] = [...initialSubscribeApprovals];

/**
 * 向订阅审核表中追加一条记录。
 * PortalPage 提交订阅时会调用此函数，避免重复定义逻辑。
 */
export function appendSubscribeApproval(item: SubscribeApproval) {
  subscribeApprovals.unshift(item);
}

// ==================== 流程审批：审核人配置 ====================
export interface ApproveAssigneeConfig {
  tenantId: string;
  assigneeIds: string[];
  updatedAt: string;
  updatedById: string;
}

export const approveAssigneeConfigs: ApproveAssigneeConfig[] = [
  {
    tenantId: 'T001',
    assigneeIds: ['U002', 'U004'],
    updatedAt: '2026-08-08 09:30',
    updatedById: 'U001',
  },
  {
    tenantId: 'T002',
    assigneeIds: ['U007'],
    updatedAt: '2026-08-06 17:12',
    updatedById: 'U001',
  },
  {
    tenantId: 'T003',
    assigneeIds: [],
    updatedAt: '2026-08-05 11:00',
    updatedById: 'U001',
  },
];

/**
 * 获取指定租户在指定资源类型上的审核人 ID。
 * 当前阶段对所有资源类型统一配置，后续可按资源类型拆分。
 */
export function getApproveAssigneeIds(tenantId: string): string[] {
  return approveAssigneeConfigs.find((c) => c.tenantId === tenantId)?.assigneeIds || [];
}

/**
 * 判断当前用户是否承担指定租户的审核任务。
 */
export function isAssigneeOfTenant(userId: string, tenantId: string): boolean {
  return getApproveAssigneeIds(tenantId).includes(userId);
}

