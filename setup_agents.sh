#!/usr/bin/env bash
# =============================================================================
# setup.sh — AI Skills configurator
# =============================================================================
# Configures AI coding assistants that follow the agentskills.io standard.
# Creates symlinks from each assistant's config folder to the shared
# skills/ and agents/ directories in the repo.
#
# Supported assistants:
#   Claude Code    -> .claude/skills,  .claude/agents,  CLAUDE.md copies
#   Gemini CLI     -> .gemini/skills,  .gemini/agents,  GEMINI.md copies
#   Codex/OpenAI   -> .codex/skills,   .codex/agents    (uses AGENTS.md natively)
#   GitHub Copilot -> .github/copilot-instructions.md
#   OpenCode       -> .opencode/skills,.opencode/agents  (uses AGENTS.md natively)
#   Antigravity    -> .agent/skills,   .agent/agents    (uses AGENTS.md natively)
#
# Compatibility:
#   - Linux   : bash 4+, GNU coreutils
#   - macOS   : bash 3.2+ (system) or bash 5 (Homebrew), BSD coreutils
#   - Windows : Git Bash / MSYS2 / Cygwin (bash 4+)
#               NOTE: symlinks on Windows require Developer Mode or admin rights.
#               The script detects this and warns / falls back to junctions.
#
# Usage:
#   ./setup.sh              # Interactive mode
#   ./setup.sh --all        # Configure every assistant
#   ./setup.sh --claude --codex
#   ./setup.sh --help

# Require bash (not sh/dash) for arrays; exit clearly if wrong shell
if [ -z "${BASH_VERSION:-}" ]; then
    echo "ERROR: This script requires bash. Run it as:  bash setup.sh" >&2
    exit 1
fi

# Minimum bash 3.2 (macOS ships 3.2; arrays and [[ ]] work there)
_bash_major="${BASH_VERSION%%.*}"
if [ "$_bash_major" -lt 3 ]; then
    echo "ERROR: bash 3.2 or newer is required (found $BASH_VERSION)." >&2
    exit 1
fi

set -euo pipefail

# ---------------------------------------------------------------------------
# Resolve script and repo paths robustly across Linux / macOS / Git-Bash
# ---------------------------------------------------------------------------
_resolve_dir() {
    # Portable readlink -f equivalent that works on macOS (no GNU readlink)
    local target="$1"
    # If python3 is available use it; otherwise use pwd-based fallback
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$target"
    else
        ( cd "$target" && pwd -P )
    fi
}

SCRIPT_DIR="$(_resolve_dir "$(dirname "${BASH_SOURCE[0]}")")"

# Detect REPO_ROOT robustly.
# If SCRIPT_DIR contains common root markers, use it as REPO_ROOT.
# Otherwise, look one level up (traditional scripts/ folder setup).
if [[ -f "$SCRIPT_DIR/package.json" || -d "$SCRIPT_DIR/agents" || -d "$SCRIPT_DIR/skills" ]]; then
    REPO_ROOT="$SCRIPT_DIR"
else
    REPO_ROOT="$(_resolve_dir "$(dirname "$SCRIPT_DIR")")"
fi

SKILLS_SOURCE="$SCRIPT_DIR"
# If we decided SCRIPT_DIR is the root, then skills/ must be inside it (if it exists)
if [[ "$REPO_ROOT" == "$SCRIPT_DIR" ]]; then
    # In case skills/ is a subdirectory of the root where the script is
    if [[ -d "$SCRIPT_DIR/skills" ]]; then
        SKILLS_SOURCE="$SCRIPT_DIR/skills"
    fi
fi

AGENTS_SOURCE="$REPO_ROOT/agents"

# ---------------------------------------------------------------------------
# OS detection
# ---------------------------------------------------------------------------
OS="unknown"
case "$(uname -s 2>/dev/null || echo Windows)" in
    Linux*)   OS="linux"   ;;
    Darwin*)  OS="macos"   ;;
    MINGW*|MSYS*|CYGWIN*|Windows*) OS="windows" ;;
esac

# ---------------------------------------------------------------------------
# Color support — disabled automatically for non-TTY or dumb terminals
# ---------------------------------------------------------------------------
if [ -t 1 ] && [ "${TERM:-dumb}" != "dumb" ] && [ "${NO_COLOR:-}" = "" ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    CYAN='\033[0;36m'
    BOLD='\033[1m'
    NC='\033[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' NC=''
fi

# ---------------------------------------------------------------------------
# Logging helpers  (use printf instead of echo -e for portability)
# ---------------------------------------------------------------------------
log_ok()   { printf "%b  [OK]  %s%b\n" "${GREEN}"  "$*" "${NC}"; }
log_warn() { printf "%b  [WARN] %s%b\n" "${YELLOW}" "$*" "${NC}"; }
log_err()  { printf "%b  [ERR] %s%b\n" "${RED}"    "$*" "${NC}" >&2; }
log_step() { printf "%b%s%b\n" "${YELLOW}" "$*" "${NC}"; }
log_info() { printf "%b%s%b\n" "${BLUE}"   "$*" "${NC}"; }

# ---------------------------------------------------------------------------
# Selection flags
# ---------------------------------------------------------------------------
SETUP_CLAUDE=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_COPILOT=false
SETUP_OPENCODE=false
SETUP_ANTIGRAVITY=false

# =============================================================================
# HELP
# =============================================================================
show_help() {
    printf "Usage: %s [OPTIONS]\n\n" "$0"
    printf "Configure AI coding assistants (skills + agents symlinks).\n\n"
    printf "Options:\n"
    printf "  --all           Configure all AI assistants\n"
    printf "  --claude        Configure Claude Code\n"
    printf "  --gemini        Configure Gemini CLI\n"
    printf "  --codex         Configure Codex (OpenAI)\n"
    printf "  --copilot       Configure GitHub Copilot\n"
    printf "  --opencode      Configure OpenCode\n"
    printf "  --antigravity   Configure Antigravity (.agent)\n"
    printf "  --help, -h      Show this help\n\n"
    printf "If no options are given, an interactive menu is shown.\n\n"
    printf "Examples:\n"
    printf "  %s                    # interactive\n" "$0"
    printf "  %s --all              # everything\n" "$0"
    printf "  %s --claude --codex   # only those two\n\n" "$0"
    printf "Windows note:\n"
    printf "  Symlinks require Developer Mode or running as Administrator.\n"
    printf "  Without those, the script copies directories instead.\n"
}

# =============================================================================
# VALIDATION
# =============================================================================
validate_sources() {
    local ok=true
    if [ ! -d "$SKILLS_SOURCE" ]; then
        log_err "Skills directory not found: $SKILLS_SOURCE"
        ok=false
    fi
    if [ ! -d "$AGENTS_SOURCE" ]; then
        log_warn "Agents directory not found: $AGENTS_SOURCE  (agents/ links will be skipped)"
    fi
    [ "$ok" = true ]
}

# =============================================================================
# SYMLINK / JUNCTION CREATION
# =============================================================================

# Compute a relative path from $2 (directory) to $1 (target).
# Falls back to absolute path when python3 is unavailable.
_rel_path() {
    local target="$1" base="$2"
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "import os,sys; print(os.path.relpath(sys.argv[1],sys.argv[2]))" \
            "$target" "$base" 2>/dev/null && return
    fi
    # Fallback: return absolute path
    printf "%s" "$target"
}

# Check whether the current user can create symlinks on Windows
_win_can_symlink() {
    # Try creating a test symlink; delete it immediately
    local tmp
    tmp="$(mktemp -d 2>/dev/null || printf "%s" "$TEMP/symtest_$$")"
    if ln -s "$tmp" "${tmp}_link" 2>/dev/null; then
        rm -rf "${tmp}_link" "$tmp"
        return 0
    fi
    rm -rf "$tmp"
    return 1
}

# make_link <link_path> <target_abs>
# Creates a symlink (Linux/macOS) or junction/copy (Windows fallback).
make_link() {
    local link="$1"
    local target_abs="$2"
    local link_dir
    link_dir="$(dirname "$link")"

    mkdir -p "$link_dir"

    # Remove stale link or back up real directory
    if [ -L "$link" ]; then
        rm "$link"
    elif [ -d "$link" ]; then
        local backup="${link}.bak.$(date +%Y%m%d%H%M%S)"
        mv "$link" "$backup"
        log_warn "Backed up existing dir: $(basename "$backup")"
    elif [ -e "$link" ]; then
        rm -f "$link"
    fi

    # Windows: try symlink, fall back to junction (cmd mklink /J), then plain copy
    if [ "$OS" = "windows" ]; then
        if _win_can_symlink; then
            ln -s "$target_abs" "$link"
        else
            # mklink /J works without elevated rights for directories
            local win_link win_target
            win_link="$(cygpath -w "$link"       2>/dev/null || printf "%s" "$link")"
            win_target="$(cygpath -w "$target_abs" 2>/dev/null || printf "%s" "$target_abs")"
            if cmd //c mklink //J "$win_link" "$win_target" >/dev/null 2>&1; then
                log_warn "Created NTFS junction (symlinks require Developer Mode)"
            else
                log_warn "Cannot create symlink or junction — copying directory instead"
                cp -r "$target_abs" "$link"
            fi
        fi
        return
    fi

    # Linux / macOS: use relative symlink
    local rel_target
    rel_target="$(_rel_path "$target_abs" "$link_dir")"
    ln -s "$rel_target" "$link"
}

# =============================================================================
# SETUP HELPERS
# =============================================================================

# setup_dir <dot_dir>  — create skills (and optional agents) links inside dot_dir
setup_dir() {
    local dot_dir="$1"
    local name
    name="$(basename "$dot_dir")"

    make_link "$dot_dir/skills" "$SKILLS_SOURCE"
    log_ok "${name}/skills  ->  skills/"

    if [ -d "$AGENTS_SOURCE" ]; then
        make_link "$dot_dir/agents" "$AGENTS_SOURCE"
        log_ok "${name}/agents  ->  agents/"
    fi
}

# copy_agents_md <target_filename>  — copy every AGENTS.md to <target_filename>
copy_agents_md() {
    local target_name="$1"
    local count=0
    local agents_file agents_dir

    # Use find without -print0 for maximum shell compatibility;
    # handle spaces via while+read with IFS trick
    while IFS= read -r agents_file; do
        [ -z "$agents_file" ] && continue
        agents_dir="$(dirname "$agents_file")"
        cp "$agents_file" "$agents_dir/$target_name"
        count=$((count + 1))
    done <<EOF
$(find "$REPO_ROOT" -name "AGENTS.md" \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    2>/dev/null)
EOF

    if [ "$count" -eq 0 ]; then
        log_warn "No AGENTS.md found — ${target_name} not created"
    else
        log_ok "Copied ${count} AGENTS.md -> ${target_name}"
    fi
}

# =============================================================================
# PER-ASSISTANT SETUP
# =============================================================================

setup_claude() {
    setup_dir "$REPO_ROOT/.claude"
    copy_agents_md "CLAUDE.md"
}

setup_gemini() {
    setup_dir "$REPO_ROOT/.gemini"
    copy_agents_md "GEMINI.md"
}

setup_codex() {
    setup_dir "$REPO_ROOT/.codex"
    log_ok "Codex uses AGENTS.md natively"
}

setup_copilot() {
    if [ ! -f "$REPO_ROOT/AGENTS.md" ]; then
        log_warn "AGENTS.md not found at repo root — skipping Copilot"
        return
    fi
    mkdir -p "$REPO_ROOT/.github"
    cp "$REPO_ROOT/AGENTS.md" "$REPO_ROOT/.github/copilot-instructions.md"
    log_ok "AGENTS.md  ->  .github/copilot-instructions.md"
}

setup_opencode() {
    setup_dir "$REPO_ROOT/.opencode"
    log_ok "OpenCode uses AGENTS.md natively"
}

setup_antigravity() {
    setup_dir "$REPO_ROOT/.agent"
    log_ok "Antigravity uses AGENTS.md natively"
}

# =============================================================================
# INTERACTIVE MENU  (bash arrays — safe on bash 3.2+)
# =============================================================================

show_menu() {
    # --- option list (parallel arrays for bash 3.2 compat) ---
    local opt0="Claude Code"  sel0=true
    local opt1="Gemini CLI"   sel1=false
    local opt2="Codex (OpenAI)" sel2=false
    local opt3="GitHub Copilot" sel3=false
    local opt4="OpenCode"     sel4=false
    local opt5="Antigravity"  sel5=false
    local N=6   # total options

    # Helper: get option label by index
    _opt_label() {
        case $1 in
            0) printf "%s" "$opt0" ;; 1) printf "%s" "$opt1" ;;
            2) printf "%s" "$opt2" ;; 3) printf "%s" "$opt3" ;;
            4) printf "%s" "$opt4" ;; 5) printf "%s" "$opt5" ;;
        esac
    }

    # Helper: get/set selection by index
    _opt_get() {
        case $1 in
            0) printf "%s" "$sel0" ;; 1) printf "%s" "$sel1" ;;
            2) printf "%s" "$sel2" ;; 3) printf "%s" "$sel3" ;;
            4) printf "%s" "$sel4" ;; 5) printf "%s" "$sel5" ;;
        esac
    }

    _opt_toggle() {
        local cur; cur="$(_opt_get "$1")"
        local nv; [ "$cur" = true ] && nv=false || nv=true
        case $1 in
            0) sel0=$nv ;; 1) sel1=$nv ;; 2) sel2=$nv ;;
            3) sel3=$nv ;; 4) sel4=$nv ;; 5) sel5=$nv ;;
        esac
    }

    _opt_all()  { sel0=true;  sel1=true;  sel2=true;  sel3=true;  sel4=true;  sel5=true;  }
    _opt_none() { sel0=false; sel1=false; sel2=false; sel3=false; sel4=false; sel5=false; }

    _draw_menu() {
        local i mark
        for i in 0 1 2 3 4 5; do
            [ "$(_opt_get "$i")" = true ] && mark="x" || mark=" "
            printf "  [%s] %d. %s\n" "$mark" "$((i+1))" "$(_opt_label "$i")"
        done
        printf "\n"
        printf "  a. Select all   n. Select none\n\n"
        printf "Toggle (1-%d, a, n) or Enter to confirm: " "$N"
    }

    local menu_lines=$(( N + 4 ))  # lines drawn by _draw_menu

    printf "%bWhich AI assistants do you use?%b\n" "${BOLD}" "${NC}"
    printf "%b(Use numbers to toggle, Enter to confirm)%b\n\n" "${CYAN}" "${NC}"

    local choice idx
    while true; do
        _draw_menu
        IFS= read -r choice

        case "$choice" in
            [1-6])
                idx=$(( choice - 1 ))
                _opt_toggle "$idx"
                ;;
            a|A) _opt_all  ;;
            n|N) _opt_none ;;
            "")  break     ;;
        esac

        # Erase menu lines and redraw
        printf "\033[%dA\033[J" "$menu_lines"
    done

    SETUP_CLAUDE=$sel0
    SETUP_GEMINI=$sel1
    SETUP_CODEX=$sel2
    SETUP_COPILOT=$sel3
    SETUP_OPENCODE=$sel4
    SETUP_ANTIGRAVITY=$sel5
}

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================

while [ $# -gt 0 ]; do
    case "$1" in
        --all)
            SETUP_CLAUDE=true; SETUP_GEMINI=true; SETUP_CODEX=true
            SETUP_COPILOT=true; SETUP_OPENCODE=true; SETUP_ANTIGRAVITY=true
            shift ;;
        --claude)      SETUP_CLAUDE=true;      shift ;;
        --gemini)      SETUP_GEMINI=true;      shift ;;
        --codex)       SETUP_CODEX=true;       shift ;;
        --copilot)     SETUP_COPILOT=true;     shift ;;
        --opencode)    SETUP_OPENCODE=true;    shift ;;
        --antigravity) SETUP_ANTIGRAVITY=true; shift ;;
        --help|-h)     show_help; exit 0 ;;
        *)
            log_err "Unknown option: $1"
            show_help
            exit 1 ;;
    esac
done

# =============================================================================
# MAIN
# =============================================================================

printf "\n%b== AI Skills Setup ==%b\n" "${BOLD}" "${NC}"
printf "OS detected: %s\n\n" "$OS"

validate_sources || exit 1

# Count skills
SKILL_COUNT=$(find "$SKILLS_SOURCE" -maxdepth 2 -name "SKILL.md" 2>/dev/null | wc -l)
SKILL_COUNT="${SKILL_COUNT//[[:space:]]/}"  # strip whitespace (portable)

if [ "${SKILL_COUNT:-0}" -eq 0 ]; then
    log_err "No SKILL.md files found in: $SKILLS_SOURCE"
    exit 1
fi

log_info "Found ${SKILL_COUNT} skills"
printf "\n"

# Interactive mode when no flags were passed
if [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && \
   [ "$SETUP_CODEX"  = false ] && [ "$SETUP_COPILOT" = false ] && \
   [ "$SETUP_OPENCODE" = false ] && [ "$SETUP_ANTIGRAVITY" = false ]; then
    show_menu
    printf "\n"
fi

# Nothing selected?
if [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && \
   [ "$SETUP_CODEX"  = false ] && [ "$SETUP_COPILOT" = false ] && \
   [ "$SETUP_OPENCODE" = false ] && [ "$SETUP_ANTIGRAVITY" = false ]; then
    log_warn "No assistants selected. Nothing to do."
    exit 0
fi

# Count selected steps
TOTAL=0
[ "$SETUP_CLAUDE"      = true ] && TOTAL=$((TOTAL+1))
[ "$SETUP_GEMINI"      = true ] && TOTAL=$((TOTAL+1))
[ "$SETUP_CODEX"       = true ] && TOTAL=$((TOTAL+1))
[ "$SETUP_COPILOT"     = true ] && TOTAL=$((TOTAL+1))
[ "$SETUP_OPENCODE"    = true ] && TOTAL=$((TOTAL+1))
[ "$SETUP_ANTIGRAVITY" = true ] && TOTAL=$((TOTAL+1))

STEP=1
run_step() {
    local label="$1" fn="$2"
    log_step "[${STEP}/${TOTAL}] Setting up ${label}..."
    "$fn"
    STEP=$((STEP+1))
}

[ "$SETUP_CLAUDE"      = true ] && run_step "Claude Code"    setup_claude
[ "$SETUP_GEMINI"      = true ] && run_step "Gemini CLI"     setup_gemini
[ "$SETUP_CODEX"       = true ] && run_step "Codex (OpenAI)" setup_codex
[ "$SETUP_COPILOT"     = true ] && run_step "GitHub Copilot" setup_copilot
[ "$SETUP_OPENCODE"    = true ] && run_step "OpenCode"       setup_opencode
[ "$SETUP_ANTIGRAVITY" = true ] && run_step "Antigravity"    setup_antigravity

# =============================================================================
# SUMMARY
# =============================================================================
printf "\n%b[OK] Successfully configured %s skills!%b\n\n" "${GREEN}" "${SKILL_COUNT}" "${NC}"
printf "Configured:\n"
[ "$SETUP_CLAUDE"      = true ] && printf "  - Claude Code:    .claude/skills  + .claude/agents  + CLAUDE.md\n"
[ "$SETUP_GEMINI"      = true ] && printf "  - Gemini CLI:     .gemini/skills   + .gemini/agents  + GEMINI.md\n"
[ "$SETUP_CODEX"       = true ] && printf "  - Codex (OpenAI): .codex/skills    + .codex/agents   + AGENTS.md (native)\n"
[ "$SETUP_COPILOT"     = true ] && printf "  - GitHub Copilot: .github/copilot-instructions.md\n"
[ "$SETUP_OPENCODE"    = true ] && printf "  - OpenCode:       .opencode/skills + .opencode/agents + AGENTS.md (native)\n"
[ "$SETUP_ANTIGRAVITY" = true ] && printf "  - Antigravity:    .agent/skills    + .agent/agents   + AGENTS.md (native)\n"
printf "\n"
printf "Note: restart your AI assistant to load the new skills.\n"
printf "      AGENTS.md is the source of truth -- edit it, then re-run this script.\n"