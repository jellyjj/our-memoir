#!/bin/sh

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
fi

exec "$@"
