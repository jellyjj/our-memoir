#!/bin/sh

# Fix permissions for mounted volumes (runs as root)
chown -R nextjs:nodejs /app/data /app/public/uploads

# Initialize database on first run
if [ ! -f /app/data/dev.db ]; then
  echo "首次运行，初始化数据库..."
  if [ -f /app/prisma/dev.db ]; then
    cp /app/prisma/dev.db /app/data/dev.db
    echo "已复制种子数据库。"
  else
    DATABASE_URL="file:/app/data/dev.db" npx prisma db push
    echo "已创建空数据库。"
  fi
  chown nextjs:nodejs /app/data/dev.db
fi

# Drop to nextjs user and run the command
exec su-exec nextjs "$@"
