.PHONY: init build deploy help

SHELL_TYPE := $(shell basename $(SHELL))

# ================================
# 帮助
# ================================
help:
	@echo "AIO 项目 Makefile"
	@echo ""
	@echo "可用命令："
	@echo "  make init    # 初始化项目 (安装 mise/bun/依赖)"
	@echo "  make build   # 编译项目并打包 Docker 镜像"
	@echo "  make deploy  # 部署项目到 Docker"
	@echo ""
	@echo "其他命令："
	@echo "  make build-api   # 仅构建 API Docker 镜像"
	@echo "  make build-web   # 仅构建 Web Docker 镜像"

# ================================
# 1. 初始化项目
# ================================
init:
	@echo "==> 检测到 shell 类型: $(SHELL_TYPE)"
	@echo ""
	@echo "==> 安装 Mise..."
	@if [ "$(SHELL_TYPE)" = "zsh" ]; then \
		curl https://mise.run/zsh | sh; \
	elif [ "$(SHELL_TYPE)" = "bash" ]; then \
		curl https://mise.run/bash | sh; \
	else \
		echo "不支持的 shell 类型: $(SHELL_TYPE)，请手动安装 mise: https://mise.jdx.dev"; \
		exit 1; \
	fi
	@echo ""
	@source $$HOME/.local/share/mise/installs/mise/latest/mise-env.sh 2>/dev/null || source $$HOME/.local/share/mise/bin/mise-env.sh 2>/dev/null || source $$HOME/.local/share/mise/bin/activate 2>/dev/null || true
	@$(eval PATH := $(HOME)/.local/share/mise/installs/mise/latest:$(PATH))
	@echo "==> 验证 Mise 安装..."
	@./$$HOME/.local/share/mise/bin/mise -v || (echo "Mise 安装失败，请重试: mise install" && exit 1)
	@echo ""
	@echo "==> 安装 Bun 和 VP 依赖..."
	@./$$HOME/.local/share/mise/bin/mise install
	@echo ""
	@echo "==> 验证 Bun 版本..."
	@./$$HOME/.local/share/mise/bin/bun -v || (echo "Bun 安装失败" && exit 1)
	@echo ""
	@echo "==> 验证 VP 版本..."
	@./$$HOME/.local/share/mise/bin/vp --version || (echo "VP 安装失败" && exit 1)
	@echo ""
	@echo "==> 安装项目依赖 (bun install)..."
	@./$$HOME/.local/share/mise/bin/bun install || (echo "项目依赖安装失败，请重试" && exit 1)
	@echo ""
	@echo "==> 初始化环境变量文件..."
	@if [ ! -f apps/api/.env.local ]; then \
		cp apps/api/.env.example apps/api/.env.local; \
		echo "  - apps/api/.env.local 已创建"; \
	else \
		echo "  - apps/api/.env.local 已存在，跳过"; \
	fi
	@if [ ! -f apps/web/.env.local ]; then \
		cp apps/web/.env.example apps/web/.env.local; \
		echo "  - apps/web/.env.local 已创建"; \
	else \
		echo "  - apps/web/.env.local 已存在，跳过"; \
	fi
	@if [ ! -f deploy/.env ]; then \
		cp deploy/.env.example deploy/.env; \
		echo "  - deploy/.env 已创建"; \
	else \
		echo "  - deploy/.env 已存在，跳过"; \
	fi
	@echo ""
	@echo "✓ 项目初始化成功！可以执行 'bun run dev' 启动开发环境"

# ================================
# 2. 构建项目
# ================================
build: build-check build-project build-docker
	@echo ""
	@echo "✓ 构建完成！可执行 'make deploy' 部署"

build-check:
	@echo "==> 检查 Docker 版本..."
	@docker --version || (echo "Docker 未安装或未启动，请安装 Docker Desktop: https://docs.docker.com/get-docker/" && exit 1)
	@docker version -f '{{.Server.APIVersion}}' 2>/dev/null || (echo "Docker 服务未启动，请启动 Docker Desktop" && exit 1)
	@echo "✓ Docker 正常"

build-project:
	@echo ""
	@echo "==> 编译项目 (bun run build)..."
	@./$$HOME/.local/share/mise/bin/bun run build || (echo "项目编译失败，请检查代码错误" && exit 1)
	@echo "✓ 项目编译成功"

build-docker: build-api build-web
	@echo "✓ Docker 镜像构建成功"

build-api:
	@echo ""
	@echo "==> 构建 API Docker 镜像..."
	@docker build \
		--target api \
		--tag aio/api:latest \
		--file deploy/Dockerfile .
	@echo "✓ API 镜像: aio/api:latest"

build-web:
	@echo ""
	@echo "==> 构建 Web Docker 镜像..."
	@docker build \
		--target web \
		--tag aio/web:latest \
		--file deploy/Dockerfile .
	@echo "✓ Web 镜像: aio/web:latest"

# ================================
# 3. 部署
# ================================
deploy: deploy-check deploy-compose
	@echo ""
	@echo "✓ 部署成功！查看服务状态: docker compose -f deploy/docker-compose.yml ps"

deploy-check:
	@echo "==> 检查构建产物..."
	@if [ ! -d apps/api/dist ]; then \
		echo "API 产物不存在，请先执行 'make build'"; \
		exit 1; \
	fi
	@if [ ! -d apps/web/.output ]; then \
		echo "Web 产物不存在，请先执行 'make build'"; \
		exit 1; \
	fi
	@echo "✓ 构建产物检查通过"
	@echo ""
	@echo "==> 准备环境变量文件..."
	@if [ ! -f deploy/.env ]; then \
		cp deploy/.env.example deploy/.env; \
		echo "  - deploy/.env 已创建，请编辑配置"; \
	else \
		echo "  - deploy/.env 已存在"; \
	fi
	@echo ""

deploy-compose:
	@echo "==> 启动 Docker 服务..."
	@docker compose -f deploy/docker-compose.yml up -d
