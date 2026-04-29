-- 创建设备状态表
-- 如果 TypeORM synchronize 设置为 false，请手动执行此脚本

CREATE TABLE IF NOT EXISTS device_status (
    device_id UUID PRIMARY KEY REFERENCES device(id) ON DELETE CASCADE,
    last_seen_at TIMESTAMPTZ,
    is_online BOOLEAN DEFAULT FALSE,
    alert_status VARCHAR(20) DEFAULT 'normal',
    last_checked_at TIMESTAMPTZ,
    data_count_1h INTEGER DEFAULT 0,
    avg_horizontal_mm DECIMAL(10, 4),
    avg_vertical_mm DECIMAL(10, 4),
    std_horizontal_mm DECIMAL(10, 4),
    std_vertical_mm DECIMAL(10, 4),
    max_horizontal_mm DECIMAL(10, 4),
    max_vertical_mm DECIMAL(10, 4),
    min_horizontal_mm DECIMAL(10, 4),
    min_vertical_mm DECIMAL(10, 4),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_device_status_alert_status ON device_status(alert_status);
CREATE INDEX IF NOT EXISTS idx_device_status_is_online ON device_status(is_online);
CREATE INDEX IF NOT EXISTS idx_device_status_last_seen_at ON device_status(last_seen_at);

-- 验证表结构
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'device_status'
ORDER BY ordinal_position;

-- 验证索引
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'device_status';
