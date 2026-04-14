.PHONY: help init build dev check fix kill clean cleanAll reinstall deploy deploy-build deploy-build-api deploy-build deploy-build-web deploy-pull deploy-start deploy-stop deploy-restart deploy-down

# ================================
# 变量
# ================================
BUN := bun
DOCKER := docker
DOCKER_COMPOSE := $(DOCKER) compose -f deploy/docker-compose.yml
DOCKER_FILE_API := deploy/Dockerfile.api
DOCKER_FILE_WEB := deploy/Dockerfile.web
MISE := mise

# ================================
# 帮助
# ================================
help:
	@echo "AIO 项目 Makefile"
	@echo ""
	@echo "可用命令："
	@echo "  make init       # 初始化项目"
	@echo "  make build     # 编译项目"
	@echo "  make dev       # 启动开发环境"
	@echo "  make check     # 类型检查"
	@echo "  make fix       # 自动修复类型问题"
	@echo "  make kill      # 停止开发服务器"
	@echo "  make clean     # 清理构建产物"
	@echo "  make cleanAll  # 深度清理（包含 node_modules）"
	@echo "  make reinstall  # 清理并重新安装依赖"
	@echo ""
	@echo "Docker 命令："
	@echo "  make deploy            # 部署到 Docker (build + start)"
	@echo "  make deploy-build      # 构建 Docker 镜像"
	@echo "  make deploy-build-api  # 构建 API Docker 镜像"
	@echo "  make deploy-build-web  # 构建 Web Docker 镜像"
	@echo "  make deploy-pull      # 下载 Docker 镜像"
	@echo "  make deploy-start     # 启动 Docker 服务"
	@echo "  make deploy-stop      # 停止 Docker 容器"
	@echo "  make deploy-restart   # 重启 Docker 容器"
	@echo "  make deploy-down      # 删除 Docker 容器"

# ================================
# 1. 初始化项目
# ================================
init:
	@echo "==> 检测 Mise 安装状态..."
	@if ! command -v mise >/dev/null 2>&1; then \
		echo "⚠ Mise 未安装，部分功能将受限（如跨平台工具版本管理）"; \
		echo "  安装参考: https://mise.jdx.dev"; \
	else \
		echo "✓ Mise 已安装，执行 mise install..."; \
		mise install; \
	fi
	@echo ""
	@echo "==> 检测工具安装状态..."
	@BUN_OK=$$(command -v bun >/dev/null 2>&1 && echo "yes" || echo "no"); \
	VP_OK=$$(command -v vp >/dev/null 2>&1 && echo "yes" || echo "no"); \
	DOCKER_OK=$$(command -v docker >/dev/null 2>&1 && echo "yes" || echo "no"); \
	echo ""; \
	echo "工具检测结果:"; \
	[ "$$BUN_OK" = "yes" ] && echo "  ✓ Bun" || echo "  ✗ Bun (make dev/build 等命令不可用)"; \
	[ "$$VP_OK" = "yes" ] && echo "  ✓ VP" || echo "  ✗ VP (类型检查不可用)"; \
	[ "$$DOCKER_OK" = "yes" ] && echo "  ✓ Docker" || echo "  ✗ Docker (容器操作不可用)"; \
	echo ""
	@if ! command -v bun >/dev/null 2>&1 || ! command -v vp >/dev/null 2>&1; then \
		echo "✗ Bun 或 VP 未安装，初始化终止"; \
		echo "  请确保 Bun 和 VP 已正确安装后重试"; \
		exit 1; \
	fi
	@echo "==> 安装项目依赖..."
	@bun install || (echo "✗ 项目依赖安装失败" && exit 1)
	@echo "✓ 依赖安装成功"
	@echo ""
	@echo "==> 编译 Utils 包..."
	@bun run build:utils
	@echo "✓ Utils 编译完成"
	@echo ""
	@echo "==> 初始化环境变量文件..."
	@[ -f apps/api/.env.local ] || { cp apps/api/.env.example apps/api/.env.local; echo "  - apps/api/.env.local 已创建"; }
	@[ -f apps/web/.env.local ] || { cp apps/web/.env.example apps/web/.env.local; echo "  - apps/web/.env.local 已创建"; }
	@[ -f deploy/.env ] || { cp deploy/.env.example deploy/.env; echo "  - deploy/.env 已创建"; }
	@echo ""
	@echo "✓ 项目初始化成功！可以执行 'make dev' 启动开发环境"

# ================================
# 2. 编译项目
# ================================
build:
	@echo "==> 编译项目..."
	@$(BUN) run build || (echo "项目编译失败，请检查代码错误" && exit 1)
	@echo "✓ 项目编译成功"

# ================================
# 3. 开发环境
# ================================
dev:
	@echo "==> 停止现有开发服务器..."
	@$(BUN) run kill
	@echo "✓ 已停止"
	@echo ""
	@echo "==> 启动开发服务器..."
	@$(BUN) run dev

# ================================
# 4. 代码质量
# ================================
check:
	@echo "==> 类型检查..."
	@$(BUN) run check
	@echo "✓ 检查完成"

fix:
	@echo "==> 自动修复类型问题..."
	@$(BUN) run check --fix
	@echo "✓ 修复完成"

kill:
	@echo "==> 停止开发服务器..."
	@$(BUN) run kill
	@echo "✓ 已停止"

# ================================
# 5. 清理与重装
# ================================
clean:
	@echo "==> 清理构建产物..."
	@$(BUN) run clean
	@echo "✓ 清理完成"

cleanAll:
	@echo "==> 深度清理..."
	@$(BUN) run cleanAll
	@rm -rf node_modules
	@echo "✓ 深度清理完成"

reinstall:
	@echo "==> 清理并重新安装依赖..."
	@$(BUN) run reinstall
	@echo "✓ 依赖重新安装完成"
	@echo ""
	@echo "==> 编译 Utils 包..."
	@$(BUN) run build:utils
	@echo "✓ Utils 编译完成"

# ================================
# 6. Docker 部署
# ================================
deploy: deploy-build deploy-start
	@echo ""
	@echo "✓ 部署成功！查看服务状态: $(DOCKER_COMPOSE) ps"

deploy-build:
	@echo "==> 检查 Docker 版本..."
	@$(DOCKER) --version || (echo "✗ Docker 未安装或未启动" && exit 1)
	@$(DOCKER) version -f '{{.Server.APIVersion}}' >/dev/null 2>&1 || (echo "✗ Docker 服务未启动" && exit 1)
	@echo "✓ Docker 正常"
	@echo ""
	@echo "==> 并行构建 Docker 镜像..."
	@$(DOCKER) build --target api --tag aio/api:latest --file $(DOCKER_FILE_API) . &
	@$(DOCKER) build --target web --tag aio/web:latest --file $(DOCKER_FILE_WEB) . &
	@wait
	@echo "✓ Docker 镜像构建成功"

deploy-build-api:
	@echo "==> 构建 API Docker 镜像..."
	@$(DOCKER) build --target api --tag aio/api:latest --file $(DOCKER_FILE_API) .
	@echo "✓ API 镜像: aio/api:latest"

deploy-build-web:
	@echo "==> 构建 Web Docker 镜像..."
	@$(DOCKER) build --target web --tag aio/web:latest --file $(DOCKER_FILE_WEB) .
	@echo "✓ Web 镜像: aio/web:latest"

deploy-pull:
	@echo "==> 下载 Docker 镜像..."
	@$(DOCKER_COMPOSE) pull --ignore-pull-failures || true
	@echo "✓ 镜像下载完成"

deploy-start:
	@echo "==> 启动 Docker 服务..."
	@$(DOCKER_COMPOSE) up -d --no-build
	@echo "✓ 容器已启动"

deploy-stop:
	@echo "==> 停止 Docker 容器..."
	@$(DOCKER_COMPOSE) stop
	@echo "✓ 容器已停止"

deploy-restart:
	@echo "==> 重启 Docker 容器..."
	@$(DOCKER_COMPOSE) restart
	@echo "✓ 容器已重启"

deploy-down:
	@echo "==> 删除 Docker 容器..."
	@$(DOCKER_COMPOSE) down
	@echo "✓ 容器已删除"
