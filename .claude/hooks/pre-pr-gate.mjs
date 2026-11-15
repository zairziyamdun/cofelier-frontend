#!/usr/bin/env node
/**
 * PreToolUse hook: перед созданием PR из Claude Code проверяет, что для
 * коммита ветки есть отчёт /pre-pr-review и он не BLOCKED и не INCOMPLETE.
 *
 * Не запрещает, а спрашивает разработчика (permissionDecision: ask): решение
 * о PR остаётся за человеком, а обязательные проверки делает CI. Любая
 * ошибка самого hook — молча пропустить, чтобы не мешать работе.
 *
 * Отчёт ищется в <git-common-dir>/pre-pr/<sha>/status.json — его пишет скилл.
 * Файл одинаковый в cofelier-frontend и cofelier-backend.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const READY = ['READY', 'READY WITH WARNINGS']

function git(cwd, args) {
	try {
		return execFileSync('git', args, {
			cwd,
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore']
		}).trim()
	} catch {
		return null
	}
}

function ask(reason) {
	process.stdout.write(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: 'PreToolUse',
				permissionDecision: 'ask',
				permissionDecisionReason: reason
			}
		})
	)
	process.exit(0)
}

// Запрос на PR: через gh CLI или GitHub MCP. Возвращает имя исходной ветки или ''.
function describeRequest(input) {
	const tool = input.tool_name ?? ''
	const toolInput = input.tool_input ?? {}
	if (tool === 'Bash') {
		const command = String(toolInput.command ?? '')
		if (!/\bgh\s+pr\s+create\b/.test(command)) return null
		return { source: command.match(/(?:--head|-H)[\s=]+(\S+)/)?.[1] ?? '' }
	}
	if (/create_pull_request$/.test(tool))
		return { source: toolInput.head ?? '' }
	return null
}

function main() {
	const input = JSON.parse(readFileSync(0, 'utf8') || '{}')
	const request = describeRequest(input)
	if (!request) return

	const cwd = input.cwd || process.cwd()
	const root = git(cwd, ['rev-parse', '--show-toplevel'])
	if (!root) return
	if (!existsSync(path.join(root, '.claude/skills/pre-pr-review'))) return

	const sha =
		(request.source &&
			git(root, ['rev-parse', '--verify', '--quiet', `refs/heads/${request.source}`])) ||
		git(root, ['rev-parse', 'HEAD'])
	if (!sha) return
	const commonDir = path.resolve(root, git(root, ['rev-parse', '--git-common-dir']))
	const statusFile = path.join(commonDir, 'pre-pr', sha, 'status.json')
	const short = sha.slice(0, 10)

	if (!existsSync(statusFile))
		ask(
			`Для коммита ${short} нет отчёта /pre-pr-review (docs/PR-POLICY.md). Запустить /pre-pr-review перед PR или создать PR без него?`
		)
	const saved = JSON.parse(readFileSync(statusFile, 'utf8'))
	if (READY.includes(saved.status)) return
	ask(
		`Отчёт /pre-pr-review для ${short}: ${saved.status} (${path.join(path.dirname(statusFile), 'report.md')}). Создать PR всё равно?`
	)
}

try {
	main()
} catch {
	// Сломанный hook не должен мешать работе — CI проверит PR в любом случае.
}
