package test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestProductAssetsExist(t *testing.T) {
	t.Helper()

	requiredPaths := []string{
		"../README.md",
		"../skills/anycap.skill",
		"../skills/capabilities/anycap-image.skill",
		"../configs/server/local.env.example",
		"../configs/cli/config.example.json",
		"../web/dashboard/README.md",
		"../web/landing/README.md",
		"../internal/cli/command/cap/image.go",
		"../internal/cli/command/meta/login.go",
		"../internal/cli/command/meta/status.go",
		"../internal/cli/command/infra/doc.go",
		"../internal/cli/command/extension/doc.go",
		"../internal/cli/output/json.go",
		"../scripts/dev/run-server.sh",
		"../scripts/dev/run-cli.sh",
		"../scripts/release/build.sh",
		"../deploy/docker/Dockerfile.server",
		"../deploy/docker/Dockerfile.cli",
		"../test/integration/smoke_test.sh",
	}

	for _, path := range requiredPaths {
		if _, err := os.Stat(filepath.Clean(path)); err != nil {
			t.Fatalf("expected %s to exist: %v", path, err)
		}
	}
}

func TestRepositoryDocs(t *testing.T) {
	content, err := os.ReadFile(filepath.Clean("../README.md"))
	if err != nil {
		t.Fatalf("read README: %v", err)
	}

	readme := string(content)
	for _, expected := range []string{
		"## 目录结构",
		"```text",
		"├── cmd/                    # 所有可执行程序入口目录",
		"│   ├── anycap/             # AnyCap CLI 二进制入口，面向 Agent 使用",
		"├── internal/               # 仓库私有实现目录，不对外暴露稳定 API",
		"│   ├── cli/                # CLI 的私有实现目录",
		"│   │   ├── command/        # Cobra 命令树与命令分区装配位置",
		"│   │   │   ├── cap/        # Cap 能力命令，例如 image、video、music",
		"│   │   │   ├── infra/      # Infra 资源命令，例如 drive、browser、sandbox",
		"│   │   │   ├── meta/       # 管理命令，例如 login、status、config、skill",
		"│   │   │   └── extension/  # 动态扩展命令，例如 run",
		"│   │   └── output/         # CLI 输出封装，例如 JSON-first stdout",
		"├── skills/                 # AnyCap skill files 总目录",
		"└── web/                    # 面向人类用户的 Web 产品目录",
		"    ├── dashboard/          # Dashboard 功能模块目录",
		"## 本地运行",
	} {
		if !strings.Contains(readme, expected) {
			t.Fatalf("expected %q in README", expected)
		}
	}
}
