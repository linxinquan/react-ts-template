FROM node:20

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:latest
# 表示从第0个构建阶段中拷贝
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 8080

#启动Nginx服务
CMD ["nginx", "-g", "daemon off;"]