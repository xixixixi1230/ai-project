# 使用官方 Nginx 作为基础镜像
FROM nginx:latest

# 复制 Vue 打包后的 dist 目录到 Nginx 的 web 目录
COPY ./dist /usr/share/nginx/html

# 复制自定义的 Nginx 配置文件（可选）
COPY ./nginx.conf /etc/nginx/nginx.conf


# 暴露容器的 80 端口
EXPOSE 80

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]
