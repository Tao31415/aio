import { registerAs } from '@nestjs/config'

export default registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT || 'localhost:9000',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  bucket: process.env.MINIO_BUCKET || 'default',
}))
