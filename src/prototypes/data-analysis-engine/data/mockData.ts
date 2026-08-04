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
export interface DashboardChart {
  id: string;
  name: string;
  type: 'bar' | 'line' | 'area' | 'pie' | 'table';
  datasetName: string;
  dimensions: string[];
  metrics: string[];
  x?: number;
  y?: number;
  w?: number;
  h?: number;
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

// ==================== 数据大屏 ====================
export interface DataScreenItem {
  id: string;
  name: string;
  resolution: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  status: 'pending' | 'online' | 'offline';
}

export const dataScreens: DataScreenItem[] = [
  { id: 'SC001', name: '618 大促实时大屏', resolution: '3840×1080', creator: '张三', createdAt: '2026-05-15', updatedAt: '2026-06-10', status: 'online' },
  { id: 'SC002', name: '双11 作战指挥屏', resolution: '5760×2160', creator: '李四', createdAt: '2026-05-20', updatedAt: '2026-06-09', status: 'online' },
  { id: 'SC003', name: '供应链全局监控', resolution: '3840×1080', creator: '王五', createdAt: '2026-06-01', updatedAt: '2026-06-08', status: 'pending' },
  { id: 'SC004', name: '财务数据展示屏', resolution: '1920×1080', creator: '赵六', createdAt: '2026-05-25', updatedAt: '2026-06-07', status: 'offline' },
  { id: 'SC005', name: '城市交通指挥屏', resolution: '3840×1080', creator: 'data_team', createdAt: '2026-05-18', updatedAt: '2026-06-06', status: 'online' },
  { id: 'SC006', name: '生产车间可视化', resolution: '2560×1440', creator: 'factory_team', createdAt: '2026-05-28', updatedAt: '2026-06-08', status: 'online' },
  { id: 'SC007', name: '零售门店数据屏', resolution: '1920×1080', creator: 'retail_team', createdAt: '2026-05-22', updatedAt: '2026-06-05', status: 'online' },
  { id: 'SC008', name: '能源消耗监控屏', resolution: '3840×1080', creator: 'energy_team', createdAt: '2026-05-30', updatedAt: '2026-06-07', status: 'online' },
  { id: 'SC009', name: '医疗资源调度屏', resolution: '2560×1440', creator: 'medical_team', createdAt: '2026-06-02', updatedAt: '2026-06-06', status: 'pending' },
  { id: 'SC010', name: '教育质量分析屏', resolution: '1920×1080', creator: 'edu_team', createdAt: '2026-05-26', updatedAt: '2026-06-04', status: 'online' },
  { id: 'SC011', name: '金融风控大屏', resolution: '5760×2160', creator: 'finance_team', createdAt: '2026-05-16', updatedAt: '2026-06-09', status: 'online' },
  { id: 'SC012', name: '智慧园区展示屏', resolution: '3840×1080', creator: 'park_team', createdAt: '2026-05-29', updatedAt: '2026-06-08', status: 'online' },
  { id: 'SC013', name: '政务数据公开屏', resolution: '1920×1080', creator: 'gov_team', createdAt: '2026-06-03', updatedAt: '2026-06-05', status: 'pending' },
  { id: 'SC014', name: '体育赛事直播屏', resolution: '3840×1080', creator: 'sports_team', createdAt: '2026-05-24', updatedAt: '2026-06-07', status: 'online' },
  { id: 'SC015', name: '旅游客流分析屏', resolution: '2560×1440', creator: 'travel_team', createdAt: '2026-05-31', updatedAt: '2026-06-09', status: 'online' },
];

// ==================== 用户管理 ====================
export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export const users: UserItem[] = [
  { id: 'U001', name: '张三', email: 'zhangsan@company.com', role: '管理员', department: '技术部', status: 'active', createdAt: '2026-01-10' },
  { id: 'U002', name: '李四', email: 'lisi@company.com', role: '数据分析师', department: '数据部', status: 'active', createdAt: '2026-01-15' },
  { id: 'U003', name: '王五', email: 'wangwu@company.com', role: '数据分析师', department: '数据部', status: 'active', createdAt: '2026-02-01' },
  { id: 'U004', name: '赵六', email: 'zhaoliu@company.com', role: '业务人员', department: '运营部', status: 'active', createdAt: '2026-02-20' },
  { id: 'U005', name: '孙七', email: 'sunqi@company.com', role: '业务人员', department: '市场部', status: 'inactive', createdAt: '2026-03-10' },
];

// ==================== 角色管理 ====================
export interface RoleItem {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

export const roles: RoleItem[] = [
  { id: 'R001', name: '系统管理员', description: '拥有所有模块的管理权限', userCount: 2, permissions: ['全部权限'] },
  { id: 'R002', name: '数据分析师', description: '可创建数据集、图表和仪表盘', userCount: 3, permissions: ['数据准备', '数据分析'] },
  { id: 'R003', name: '业务人员', description: '可查看已发布的数据资产', userCount: 8, permissions: ['数据门户'] },
  { id: 'R004', name: '访客', description: '仅查看权限，不可操作', userCount: 5, permissions: ['数据门户(只读)'] },
];

// ==================== 操作日志 ====================
export interface OperationLog {
  id: string;
  user: string;
  module: string;
  action: string;
  detail: string;
  ip: string;
  time: string;
}

export const operationLogs: OperationLog[] = [
  { id: 'L001', user: '张三', module: '数据源', action: '创建', detail: '创建了数据源「订单数据库」', ip: '192.168.1.100', time: '2026-06-10 09:30:15' },
  { id: 'L002', user: '李四', module: '数据集', action: '更新', detail: '更新了数据集「用户画像数据集」', ip: '192.168.1.101', time: '2026-06-10 10:15:22' },
  { id: 'L003', user: '王五', module: '图表管理', action: '删除', detail: '删除了图表「测试图表」', ip: '192.168.1.102', time: '2026-06-10 11:05:08' },
  { id: 'L004', user: '赵六', module: '仪表盘', action: '发布', detail: '发布了仪表盘「运营核心指标」', ip: '192.168.1.103', time: '2026-06-10 14:20:33' },
  { id: 'L005', user: '张三', module: '用户管理', action: '创建', detail: '创建了用户「孙七」', ip: '192.168.1.100', time: '2026-06-09 16:45:10' },
  { id: 'L006', user: '李四', module: '数据大屏', action: '编辑', detail: '编辑了大屏「618 大促实时大屏」', ip: '192.168.1.101', time: '2026-06-09 09:10:55' },
  { id: 'L007', user: '王五', module: '自助取数', action: '下载', detail: '下载了取数结果「订单明细_20260609.csv」', ip: '192.168.1.102', time: '2026-06-09 11:30:40' },
  { id: 'L008', user: '赵六', module: '报表', action: '导出', detail: '导出了报表「销售日报」', ip: '192.168.1.103', time: '2026-06-09 15:55:18' },
];

// ==================== 租户管理 ====================
export interface TenantItem {
  id: string;
  name: string;
  code: string;
  contact: string;
  userQuota: number;
  storageQuota: string;
  status: 'active' | 'inactive';
  expireAt: string;
}

export const tenants: TenantItem[] = [
  { id: 'T001', name: '总部', code: 'HQ', contact: '张三', userQuota: 100, storageQuota: '500GB', status: 'active', expireAt: '2027-06-10' },
  { id: 'T002', name: '华东分部', code: 'HD', contact: '李四', userQuota: 50, storageQuota: '200GB', status: 'active', expireAt: '2027-03-15' },
  { id: 'T003', name: '华南分部', code: 'HN', contact: '王五', userQuota: 50, storageQuota: '200GB', status: 'active', expireAt: '2027-03-15' },
  { id: 'T004', name: '华北分部', code: 'HB', contact: '赵六', userQuota: 30, storageQuota: '100GB', status: 'inactive', expireAt: '2026-06-01' },
];

// ==================== 指标监控 ====================
export interface MetricData {
  label: string;
  value: string;
  change: number;
  unit: string;
}

export const metricsData: MetricData[] = [
  { label: '数据源连接数', value: '24', change: 4.2, unit: '个' },
  { label: '查询 QPS', value: '1,280', change: 12.5, unit: '次/秒' },
  { label: '图表渲染耗时', value: '145', change: -8.3, unit: 'ms' },
  { label: '活跃用户数', value: '86', change: 6.7, unit: '人' },
];

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

// ==================== 自助取数 / 数据探查 字段 ====================
export interface DatasetField {
  name: string;
  type: 'dimension' | 'metric';
  dataType: string;
}

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
