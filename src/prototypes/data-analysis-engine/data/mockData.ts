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
  status: 'connected' | 'disconnected';
  creator: string;
  modifier: string;
  updatedAt: string;
}

export const dataSources: DataSource[] = [
  { id: 'DS001', name: '订单数据库', type: 'MySQL', host: '192.168.1.10:3306', database: 'order_db', status: 'connected', creator: 'admin', modifier: 'zhangsan', updatedAt: '2026-06-10 14:32:18' },
  { id: 'DS002', name: '用户数据库', type: 'MySQL', host: '192.168.1.11:3306', database: 'user_db', status: 'connected', creator: 'admin', modifier: 'lisi', updatedAt: '2026-06-09 09:15:42' },
  { id: 'DS003', name: '商品数据 Excel', type: 'Excel', host: '-', database: 'product_data.xlsx', status: 'connected', creator: 'zhangsan', modifier: 'zhangsan', updatedAt: '2026-06-08 16:08:55' },
  { id: 'DS004', name: '物流 API', type: 'API', host: 'https://api.logistics.com', database: '-', status: 'connected', creator: 'admin', modifier: 'wangwu', updatedAt: '2026-06-07 11:22:33' },
  { id: 'DS005', name: '财务 PostgreSQL', type: 'PostgreSQL', host: '192.168.1.20:5432', database: 'finance_db', status: 'disconnected', creator: 'lisi', modifier: 'lisi', updatedAt: '2026-03-20 08:45:12' },
  { id: 'DS006', name: '日志 ClickHouse', type: 'ClickHouse', host: '192.168.1.30:8123', database: 'log_db', status: 'connected', creator: 'admin', modifier: 'data_team', updatedAt: '2026-06-06 20:18:09' },
];

// ==================== 数据集 ====================
export interface Dataset {
  id: string;
  name: string;
  owner: string;
  modifier: string;
  updatedAt: string;
  sourceId: string;
  sourceName: string;
  status?: 'active' | 'inactive';
}

export const datasets: Dataset[] = [
  { id: 'DT001', name: '订单明细数据集', owner: 'admin', modifier: 'zhangsan', updatedAt: '2026-06-10 14:32:18', sourceId: 'DS001', sourceName: '订单数据库', status: 'active' },
  { id: 'DT002', name: '用户画像数据集', owner: 'admin', modifier: 'lisi', updatedAt: '2026-06-09 09:15:42', sourceId: 'DS002', sourceName: '用户数据库', status: 'active' },
  { id: 'DT003', name: '商品信息数据集', owner: 'zhangsan', modifier: 'zhangsan', updatedAt: '2026-06-08 16:08:55', sourceId: 'DS003', sourceName: '商品数据 Excel', status: 'active' },
  { id: 'DT004', name: '物流轨迹数据集', owner: 'admin', modifier: 'wangwu', updatedAt: '2026-06-07 11:22:33', sourceId: 'DS004', sourceName: '物流 API', status: 'active' },
  { id: 'DT005', name: '财务报表数据集', owner: 'lisi', modifier: 'lisi', updatedAt: '2026-03-20 08:45:12', sourceId: 'DS005', sourceName: '财务 PostgreSQL', status: 'inactive' },
  { id: 'DT006', name: '访问日志数据集', owner: 'admin', modifier: 'data_team', updatedAt: '2026-06-06 20:18:09', sourceId: 'DS006', sourceName: '日志 ClickHouse', status: 'active' },
];

// ==================== 报表 ====================
export interface Report {
  id: string;
  name: string;
  datasetName: string;
  creator: string;
  updatedAt: string;
  status: 'published' | 'draft';
}

export const reports: Report[] = [
  { id: 'RP001', name: '销售日报', datasetName: '订单明细数据集', creator: '张三', updatedAt: '2026-06-10', status: 'published' },
  { id: 'RP002', name: '用户增长周报', datasetName: '用户画像数据集', creator: '李四', updatedAt: '2026-06-09', status: 'published' },
  { id: 'RP003', name: '库存预警月报', datasetName: '商品信息数据集', creator: '王五', updatedAt: '2026-06-08', status: 'draft' },
  { id: 'RP004', name: '物流时效分析', datasetName: '物流轨迹数据集', creator: '赵六', updatedAt: '2026-06-07', status: 'published' },
  { id: 'RP005', name: '财务利润表', datasetName: '财务报表数据集', creator: '张三', updatedAt: '2026-03-20', status: 'draft' },
];

// ==================== 图表管理 ====================
export interface ChartItem {
  id: string;
  name: string;
  type: string;
  datasetName: string;
  creator: string;
  updater: string;
  updatedAt: string;
}

export const charts: ChartItem[] = [
  { id: 'CH001', name: '月度销售额趋势', type: '折线图', datasetName: '订单明细数据集', creator: '张三', updater: '李四', updatedAt: '2026-06-10' },
  { id: 'CH002', name: '品类销售占比', type: '饼图', datasetName: '订单明细数据集', creator: '李四', updater: '王五', updatedAt: '2026-06-09' },
  { id: 'CH003', name: '区域销售热力', type: '柱状图', datasetName: '订单明细数据集', creator: '王五', updater: '赵六', updatedAt: '2026-06-08' },
  { id: 'CH004', name: '用户留存漏斗', type: '漏斗图', datasetName: '用户画像数据集', creator: '赵六', updater: '张三', updatedAt: '2026-06-07' },
  { id: 'CH005', name: '库存周转趋势', type: '面积图', datasetName: '商品信息数据集', creator: '张三', updater: '李四', updatedAt: '2026-06-06' },
];

// ==================== 仪表盘 ====================
export interface DashboardItem {
  id: string;
  name: string;
  chartCount: number;
  creator: string;
  updatedAt: string;
  status: 'published' | 'draft';
}

export const dashboards: DashboardItem[] = [
  { id: 'DB001', name: '运营核心指标', chartCount: 8, creator: '张三', updatedAt: '2026-06-10', status: 'published' },
  { id: 'DB002', name: '销售作战室', chartCount: 12, creator: '李四', updatedAt: '2026-06-09', status: 'published' },
  { id: 'DB003', name: '用户增长看板', chartCount: 6, creator: '王五', updatedAt: '2026-06-08', status: 'draft' },
  { id: 'DB004', name: '供应链监控', chartCount: 10, creator: '赵六', updatedAt: '2026-06-07', status: 'published' },
];

// ==================== 数据大屏 ====================
export interface DataScreenItem {
  id: string;
  name: string;
  resolution: string;
  creator: string;
  updatedAt: string;
  status: 'published' | 'draft';
}

export const dataScreens: DataScreenItem[] = [
  { id: 'SC001', name: '618 大促实时大屏', resolution: '3840×1080', creator: '张三', updatedAt: '2026-06-10', status: 'published' },
  { id: 'SC002', name: '双11 作战指挥屏', resolution: '5760×2160', creator: '李四', updatedAt: '2026-06-09', status: 'published' },
  { id: 'SC003', name: '供应链全局监控', resolution: '3840×1080', creator: '王五', updatedAt: '2026-06-08', status: 'draft' },
  { id: 'SC004', name: '财务数据展示屏', resolution: '1920×1080', creator: '赵六', updatedAt: '2026-06-07', status: 'published' },
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
