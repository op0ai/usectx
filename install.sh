#!/usr/bin/env bash
# usectx installer — Agent Plugins 1.0 kit + skill-compatible SKILL.md
#
# Interactive:
#   bash install.sh                  # plan, confirm, project-local (cwd/usectx)
#   bash install.sh --global         # ~/.op0/usectx + optional home MCP
#
# Non-interactive / Hanna:
#   curl -fsSL https://op0.ai/usectx/install.sh | bash
#   curl -fsSL https://op0.ai/usectx/install.sh | bash -s -- --global
#
# Flags:
#   --project   pack into $PWD/usectx (default)
#   --global    pack into ~/.op0/usectx; write ~/.local/bin, ~/.agents, home MCP
#   --yes       skip TTY confirm (same as USECTX_INSTALL=1)
#
# Skills across IDEs (SKILL.md only — no login, no bearer):
#   npx skills add op0ai/usectx
set -euo pipefail

DEFAULT_CTX_URL="https://ctx.op0.ai"
ctx_url="${CTX_URL:-${CORE_CTX_URL:-${DEFAULT_CTX_URL}}}"
pack_url="${USECTX_PACK_URL:-https://op0.ai/usectx/pack.tar.gz}"
token_path="${HOME}/.op0/usectx/token"
home_cursor_mcp="${HOME}/.cursor/mcp.json"
agent_plugins_dir="${HOME}/.agents/plugins/usectx"
default_home_pack="${HOME}/.op0/usectx"
default_bin_dir="${USECTX_BIN_DIR:-${OP0_BIN_DIR:-${HOME}/.local/bin}}"

if [[ "${ctx_url}" == *"127.0.0.1"* || "${ctx_url}" == *"localhost"* ]] && [[ "${ALLOW_LOOPBACK:-0}" != "1" ]]; then
  echo "install-usectx: refusing loopback as default service URL." >&2
  exit 1
fi

scope="project"
assume_yes=0
for arg in "$@"; do
  case "${arg}" in
    --project) scope="project" ;;
    --global) scope="global" ;;
    --yes|-y) assume_yes=1 ;;
    --help|-h)
      sed -n '2,22p' "$0"
      exit 0
      ;;
    *)
      echo "install-usectx: unknown flag ${arg}" >&2
      echo "Usage: install.sh [--project|--global] [--yes]" >&2
      exit 2
      ;;
  esac
done

if [[ "${USECTX_INSTALL:-}" == "1" ]]; then
  assume_yes=1
fi

can_prompt=0
if [[ -t 0 && -t 1 ]]; then
  can_prompt=1
fi

cwd="$(pwd)"
if [[ -n "${USECTX_PLUGIN_DIR:-}" ]]; then
  plugin_dir="${USECTX_PLUGIN_DIR}"
elif [[ "${scope}" == "global" ]]; then
  plugin_dir="${default_home_pack}"
else
  plugin_dir="${cwd}/usectx"
fi

mcp_remote_url="${ctx_url%/}/mcp"
write_home_mcp=0
write_agents=0
write_bin=0
if [[ "${scope}" == "global" ]]; then
  write_home_mcp=1
  write_agents=1
  write_bin=1
fi

if [[ -n "${USECTX_BIN_DIR:-}${OP0_BIN_DIR:-}" ]]; then
  write_bin=1
fi

claude_config=""
if [[ "$(uname -s)" == "Darwin" ]]; then
  claude_config="${HOME}/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$(uname -s)" == "Linux" ]]; then
  claude_config="${HOME}/.config/Claude/claude_desktop_config.json"
fi

print_plan() {
  echo ""
  echo "usectx installer"
  echo "================"
  echo ""
  echo "What"
  echo "  kit      Agent Plugins 1.0  (plugin.json + skills/ + mcp.json + CLI + hooks)"
  echo "  skills   usectx-attach · usectx-retrieve · usectx-code-graph · usectx-extract"
  echo "  mcp      ${mcp_remote_url}  (no tokens in pack mcp.json)"
  echo "  cli      usectx"
  echo ""
  echo "Where  (${scope})"
  echo "  pack     ${plugin_dir}"
  if [[ "${write_bin}" == "1" ]]; then
    echo "  cli      ${default_bin_dir}/usectx"
  else
    echo "  cli      ${plugin_dir}/bin/usectx"
  fi
  if [[ "${write_agents}" == "1" ]]; then
    echo "  agents   ${agent_plugins_dir}"
  else
    echo "  agents   skipped (use --global or: npx skills add op0ai/usectx)"
  fi
  if [[ "${write_home_mcp}" == "1" ]]; then
    echo "  cursor   ${home_cursor_mcp}"
    if [[ -n "${claude_config}" && ( -d "$(dirname "${claude_config}")" || -f "${claude_config}" ) ]]; then
      echo "  claude   ${claude_config}"
    else
      echo "  claude   skipped (Claude Desktop dir absent)"
    fi
  else
    echo "  cursor   skipped (piped/project does not write ${home_cursor_mcp})"
    echo "  claude   skipped"
  fi
  echo "  token    ${token_path}  (written by usectx login, not this step)"
  echo ""
  echo "Attach prompt"
  echo "  Attach usectx memory from ${mcp_remote_url} using my workspace token,"
  echo "  verify readiness at /readyz, and retrieve indexed project context."
  echo ""
}

print_plan

if [[ "${can_prompt}" == "1" && "${assume_yes}" != "1" ]]; then
  printf "Install this plan? [Y/n] "
  read -r reply || reply="n"
  case "${reply}" in
    ""|Y|y|yes|YES) ;;
    *)
      echo "install-usectx: cancelled."
      exit 1
      ;;
  esac
elif [[ "${can_prompt}" != "1" ]]; then
  echo "No TTY — project-local pack. Home MCP/Claude not written."
  echo "Global IDE wiring: bash install.sh --global   or   curl … | bash -s -- --global"
  echo ""
fi

mkdir -p "${plugin_dir}"

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
  curl -fsSL "${pack_url}" | tar -xz -C "${plugin_dir}"
fi

chmod 755 "${plugin_dir}/bin/usectx" "${plugin_dir}/bin/usectx-mcp-stdio.mjs" 2>/dev/null || true

cli_shim=""
if [[ "${write_bin}" == "1" ]]; then
  mkdir -p "${default_bin_dir}"
  cli_shim="${default_bin_dir}/usectx"
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
  echo "usectx: node or bun is required on PATH." >&2
  exit 1
fi
EOF
  chmod 755 "${cli_shim}"
fi

if [[ "${write_agents}" == "1" ]]; then
  mkdir -p "$(dirname "${agent_plugins_dir}")"
  rm -rf "${agent_plugins_dir}"
  ln -sf "${plugin_dir}" "${agent_plugins_dir}" 2>/dev/null || cp -R "${plugin_dir}" "${agent_plugins_dir}"
fi

token="${CTX_HTTP_TOKEN:-${CORE_CTX_TOKEN:-${CTX_TOKEN:-}}}"
written_mcp=()

write_or_merge_mcp_config() {
  local target_file="$1"
  mkdir -p "$(dirname "${target_file}")"
  if command -v node >/dev/null 2>&1 && [[ -n "${token}" ]]; then
    node -e '
      const fs = require("fs");
      const file = process.argv[1];
      const mcpUrl = process.argv[2];
      const tok = process.argv[3];
      let config = { mcpServers: {} };
      if (fs.existsSync(file)) {
        try {
          config = JSON.parse(fs.readFileSync(file, "utf8"));
          if (!config || typeof config !== "object") config = { mcpServers: {} };
          if (!config.mcpServers || typeof config.mcpServers !== "object") config.mcpServers = {};
        } catch {}
      }
      config.mcpServers.usectx = { url: mcpUrl, headers: { Authorization: "Bearer " + tok } };
      fs.writeFileSync(file, JSON.stringify(config, null, 2) + "\n");
    ' "${target_file}" "${mcp_remote_url}" "${token}"
    written_mcp+=("${target_file}")
  elif [[ -n "${token}" ]]; then
    cat > "${target_file}" <<EOF
{
  "mcpServers": {
    "usectx": {
      "url": "${mcp_remote_url}",
      "headers": {
        "Authorization": "Bearer ${token}"
      }
    }
  }
}
EOF
    written_mcp+=("${target_file}")
  fi
}

if [[ "${write_home_mcp}" == "1" ]]; then
  if [[ -n "${token}" ]]; then
    write_or_merge_mcp_config "${home_cursor_mcp}"
    if [[ -n "${claude_config}" && ( -d "$(dirname "${claude_config}")" || -f "${claude_config}" ) ]]; then
      write_or_merge_mcp_config "${claude_config}"
    fi
  else
    echo "Notice: no CTX_HTTP_TOKEN in env — skipped writing home MCP. Run: usectx login --global"
  fi
fi

assurance() {
  local path="$1"
  if [[ -e "${path}" ]]; then
    echo "  OK   ${path}"
  else
    echo "  FAIL ${path}"
  fi
}

echo ""
echo "Wrote"
assurance "${plugin_dir}/plugin.json"
assurance "${plugin_dir}/mcp.json"
assurance "${plugin_dir}/skills/usectx-attach/SKILL.md"
assurance "${plugin_dir}/skills/usectx-retrieve/SKILL.md"
assurance "${plugin_dir}/skills/usectx-code-graph/SKILL.md"
assurance "${plugin_dir}/skills/usectx-extract/SKILL.md"
assurance "${plugin_dir}/bin/usectx"
if [[ -n "${cli_shim}" ]]; then
  assurance "${cli_shim}"
fi
if [[ "${write_agents}" == "1" ]]; then
  assurance "${agent_plugins_dir}"
fi
for mcp_file in "${written_mcp[@]+"${written_mcp[@]}"}"; do
  assurance "${mcp_file}"
done

echo ""
echo "Next"
echo "  usectx login                 # token → ${token_path}"
echo "  npx skills add op0ai/usectx  # SKILL.md into project .agents/skills/ (20+ IDEs)"
if [[ "${scope}" != "global" ]]; then
  echo "  export PATH=\"${plugin_dir}/bin:\$PATH\""
  echo "  bash install.sh --global     # home MCP / ~/.local/bin / ~/.agents"
fi
echo ""
echo "================================================================================"
echo "Agent Prompt:"
echo "Attach usectx memory from ${mcp_remote_url} using my workspace token, verify readiness at /readyz, and retrieve indexed project context."
echo "================================================================================"
exit 0
