#!/usr/bin/env bash
# install.sh - Standalone installer for usectx harness pack (skills + MCP + CLI + hooks)
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/op0ai/usectx/main/install.sh | bash
#   curl -fsSL https://op0.ai/usectx/install.sh | bash
#
# Environment variables:
#   CTX_HTTP_TOKEN     Workspace bearer token (from https://app.op0.ai/ctx)
#   CTX_URL            Remote service URL (default: https://ctx.op0.ai)
#   USECTX_PLUGIN_DIR  Target plugin directory (default: ~/.op0/usectx)
#   USECTX_BIN_DIR     Target CLI directory (default: ~/.local/bin)
#   USECTX_PACK_URL    Tarball URL (default: https://github.com/op0ai/usectx/archive/refs/heads/main.tar.gz)
set -euo pipefail

DEFAULT_CTX_URL="https://ctx.op0.ai"
ctx_url="${CTX_URL:-${CORE_CTX_URL:-${DEFAULT_CTX_URL}}}"

# Refuse localhost as hosted service URL unless explicitly allowed
if [[ "${ctx_url}" == *"127.0.0.1"* || "${ctx_url}" == *"localhost"* ]] && [[ "${ALLOW_LOOPBACK:-0}" != "1" ]]; then
  echo "install-usectx: refusing loopback as default service URL." >&2
  exit 1
fi

plugin_dir="${USECTX_PLUGIN_DIR:-${HOME}/.op0/usectx}"
agent_plugins_dir="${HOME}/.agents/plugins/usectx"
bin_dir="${USECTX_BIN_DIR:-${OP0_BIN_DIR:-${HOME}/.local/bin}}"
pack_url="${USECTX_PACK_URL:-https://github.com/op0ai/usectx/archive/refs/heads/main.tar.gz}"

mkdir -p "${plugin_dir}" "${bin_dir}"

# Download or copy pack
if [[ -n "${USECTX_DIST_DIR:-}" && -d "${USECTX_DIST_DIR}" ]]; then
  cp -R "${USECTX_DIST_DIR}/"* "${plugin_dir}/"
elif [[ -f "${pack_url}" ]]; then
  tar -xzf "${pack_url}" -C "${plugin_dir}"
else
  if ! command -v curl >/dev/null 2>&1; then
    echo "install-usectx: curl is required." >&2
    exit 1
  fi
  if ! command -v tar >/dev/null 2>&1; then
    echo "install-usectx: tar is required." >&2
    exit 1
  fi
  if ! curl -fsSL "${pack_url}" | tar -xz -C "${plugin_dir}" 2>/dev/null; then
    # Fallback to op0.ai hosted tarball if GitHub tarball fetch fails
    curl -fsSL "https://op0.ai/usectx/pack.tar.gz" | tar -xz -C "${plugin_dir}"
  fi
fi

# If unpacked from GitHub archive (contains usectx-main prefix), flatten it
if [[ -d "${plugin_dir}/usectx-main" ]]; then
  cp -R "${plugin_dir}/usectx-main/"* "${plugin_dir}/"
  rm -rf "${plugin_dir}/usectx-main"
fi

# Ensure executable permissions on binaries
chmod 755 "${plugin_dir}/bin/usectx" "${plugin_dir}/bin/usectx-mcp-stdio.mjs" 2>/dev/null || true

# Install CLI shim to bin_dir
cli_shim="${bin_dir}/usectx"
cat > "${cli_shim}" <<EOF
#!/usr/bin/env bash
target="${plugin_dir}/bin/usectx"
if [[ -x "\${target}" ]]; then
  exec "\${target}" "\$@"
elif command -v bun >/dev/null 2>&1; then
  exec bun "\${target}" "\$@"
elif command -v node >/dev/null 2>&1; then
  exec node "\${target}" "\$@"
else
  echo "usectx: node or bun is required on PATH to execute CLI." >&2
  exit 1
fi
EOF
chmod 755 "${cli_shim}"

# Mirror plugin into ~/.agents/plugins/usectx
mkdir -p "$(dirname "${agent_plugins_dir}")"
rm -rf "${agent_plugins_dir}"
ln -sf "${plugin_dir}" "${agent_plugins_dir}" 2>/dev/null || cp -R "${plugin_dir}" "${agent_plugins_dir}"

# Resolve token
token="${CTX_HTTP_TOKEN:-${CORE_CTX_TOKEN:-${CTX_TOKEN:-}}}"
header_token="${token:-<YOUR_CTX_HTTP_TOKEN>}"

# Merge/write MCP configurations for Cursor and Claude Desktop
mcp_remote_url="${ctx_url%/}/mcp"

write_or_merge_mcp_config() {
  local target_file="$1"
  mkdir -p "$(dirname "${target_file}")"

  if command -v node >/dev/null 2>&1; then
    node -e '
      const fs = require("fs");
      const file = process.argv[1];
      const mcpUrl = process.argv[2];
      const token = process.argv[3];
      let config = { mcpServers: {} };
      if (fs.existsSync(file)) {
        try {
          config = JSON.parse(fs.readFileSync(file, "utf8"));
          if (!config || typeof config !== "object") config = { mcpServers: {} };
          if (!config.mcpServers || typeof config.mcpServers !== "object") config.mcpServers = {};
        } catch {}
      }
      config.mcpServers["usectx"] = {
        url: mcpUrl,
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
    ' "${target_file}" "${mcp_remote_url}" "${header_token}"
  else
    cat > "${target_file}" <<EOF
{
  "mcpServers": {
    "usectx": {
      "url": "${mcp_remote_url}",
      "headers": {
        "Authorization": "Bearer ${header_token}"
      }
    }
  }
}
EOF
  fi
}

# 1. Local workspace .cursor/mcp.json if in a git repo or directory with existing .cursor
if [[ -d ".cursor" || -d ".git" || -f ".cursor/mcp.json" ]]; then
  write_or_merge_mcp_config ".cursor/mcp.json"
fi

# 2. User-global .cursor/mcp.json
write_or_merge_mcp_config "${HOME}/.cursor/mcp.json"

# 3. Claude Desktop configuration
if [[ "$(uname -s)" == "Darwin" ]]; then
  claude_config="${HOME}/Library/Application Support/Claude/claude_desktop_config.json"
  if [[ -d "${HOME}/Library/Application Support/Claude" || -f "${claude_config}" ]]; then
    write_or_merge_mcp_config "${claude_config}"
  fi
elif [[ "$(uname -s)" == "Linux" ]]; then
  claude_config="${HOME}/.config/Claude/claude_desktop_config.json"
  if [[ -d "${HOME}/.config/Claude" || -f "${claude_config}" ]]; then
    write_or_merge_mcp_config "${claude_config}"
  fi
fi

echo "✓ Installed usectx harness pack to ${plugin_dir}"
echo "✓ Installed usectx CLI to ${cli_shim}"
echo "✓ Configured MCP server at ${mcp_remote_url}"

if [[ -z "${token}" ]]; then
  echo ""
  echo "Notice: CTX_HTTP_TOKEN is unset."
  echo "Authenticate and configure MCP automatically by running:"
  echo "   usectx login"
  echo "Or visit https://app.op0.ai/ctx to view your workspace token."
fi

echo ""
echo "================================================================================"
echo "Agent Prompt:"
echo "Attach usectx memory from ${mcp_remote_url} using my workspace token, verify readiness at /readyz, and retrieve indexed project context."
echo "================================================================================"
exit 0
