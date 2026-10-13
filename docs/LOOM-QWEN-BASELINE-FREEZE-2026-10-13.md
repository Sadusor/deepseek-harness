# LOOM Qwen 9B — Working Baseline Freeze Record (2026-10-13)

**Status:** OWNER-REQUESTED DOCUMENTATION FREEZE of the demonstrated local workflow. **Do not modify proven modules merely to improve them.** Changes after this record require a separately scoped change, tests, and explicit owner approval. This file records evidence and restrictions; it is not a Git tag, and it does not claim the current Windows build has been committed.

## Scope and identity
- Product: LOOM, a personal Windows desktop customization of DeepSeek Harness.
- Repo/branch: `Sadusor/deepseek-harness` / `personal-qwen-specialized`.
- Last inspected remote code revision *before this documentation-only commit*: `6f02d3e69c119c45176ba3e9f5a9643bed51db1c`.
- Local source: `E:\LOOM-HARNESS-TEST`.
- Packaged executable: `E:\LOOM-HARNESS-TEST\apps\desktop\.desktop-build\targets\win-x64\unsigned-artifacts\win-unpacked\Loom.exe`.
- User reported local uncommitted TypeScript/build corrections in `apps/desktop/src/main.ts` and `apps/desktop/scripts/prepare-dsh.ts`, plus a pre-existing stash `9cf735c20e712936e0e830587f9c340343b216df`. **Do not reset, clean, stash-pop, or overwrite these without inspecting local state and owner authorization.**
- Other products (`TheHands-`, ORION V3) remain independent and frozen. No changes to their product modules are authorized by this record.

## Verified technical baseline
1. Earlier Windows workspace build and unsigned package smoke test PASSED (TheHands evidence sessions `03b42840d386` and `32c3612c8d34`). The packaged smoke-test SHA256 previously reported: `C33D2BBC1874125D31D01BDA3694BF60056F5283FDB76D131EA8BB142A363A0A`. Treat as the **previously tested binary**, not a freshly re-hashed file.
2. LOOM UI presents **Qwen Work** preset. Provider configured for Ollama's OpenAI-compatible endpoint `http://127.0.0.1:11434/v1`, model `qwen3.5:9b` (base model), reason/off where selectable. The provider/profile may require re-entry if app profiles change.
3. On 2026-10-13, Ollama's initial actual active context was **4096** despite LOOM's configured `contextWindow: 16384`. Direct native Ollama test with per-request `num_ctx: 16384` and `think: false` produced a structured function call: TheHands session `8164c2423228` (one `get_working_directory` call; 15 output tokens).
4. OpenAI-compatible endpoint also returned a structured tool call while 4096 was active: TheHands session `17e6c07e7b1e` (`finish_reason=tool_calls`, one function call, 15 completion tokens). This established protocol compatibility under minimal prompt load.
5. User-scoped `OLLAMA_CONTEXT_LENGTH=16384` was saved (session `8b3bb614261c`), then the user **manually quit and relaunched Ollama**. Live post-restart probe **confirmed actual `ollama ps` CONTEXT 16384**, 100% GPU, and a structured tool call over `/v1/chat/completions`: TheHands session `be5e03dca185` (267 prompt, 15 completion tokens, finish `tool_calls`). The global Windows user environment setting is persistent until changed or removed.
6. LOOM `Workspace Write` mode attempted PowerShell but failed **before command execution** at sandbox `SetNamedSecurityInfoW failed (Win32 5): grantWrite(C:\Users\SouS\Documents\deepseek-harness\default-workspace)`. Read-only ACL inspection session `d817c8c09f7f` found that user `SouS` already has inherited Full Control over that folder; do **not** broadly change ACLs or assume full-control entries fix sandbox provisioning.
7. User temporarily switched LOOM to **Full Access**. Qwen's next response reported exact `Get-Location` output `C:\Users\SouS\Documents\deepseek-harness\default-workspace`; this is consistent with successful PowerShell execution, but raw LOOM tool event logs were not independently collected.
8. Windows Defender Controlled Folder Access raised a notification blocking a `powershell.exe` write. User subsequently reported successful creation and tool readback of `loom-test.txt` containing exactly `LOOM QWEN CODING PASS`. This is a **Qwen/user-reported** end-to-end result, not yet independently re-read from filesystem by TheHands. Do not claim protected-folder policy has been resolved.
9. Original DeepSeek Harness had a separate profile YAML startup error from malformed `off:none` in `C:\Users\SouS\.dsh\profiles\desktop\cordis.patch.yml`. This was isolated from the Qwen agent problem; the original harness subsequently ran read-only investigation.

## Freeze boundary / do not touch
- No edits to the agent loop, tool-call assembler, OpenAI adapter, established Qwen Work tool registration, or proven Windows build/packaging paths without a separately documented failing reproduction and explicit authorization.
- Do not replace LOOM with a new agent framework or conflate it with TheHands (executor) or ORION V3.
- Do not disable Defender Controlled Folder Access or globally whitelist PowerShell as a convenience.
- No broad Windows ACL changes or unsafe sandbox “repair.” Full Access was a user-selected **temporary workaround**, not proof that Workspace Write is fixed.
- Keep existing local modifications and stash intact. A documentation commit alone **does not freeze an uncommitted local build**; capture status/hash and preserve local patches before any merge or update.
- Avoid GitHub Actions paid CI for trials; use TheHands GIT CHECK and recorded evidence when requested.

## Known issues
- Workspace Write sandbox provisioning is **FAILED**. Investigate Windows sandbox account / grant-write implementation before restoring secure bounded execution.
- Windows Defender Controlled Folder Access may block PowerShell writes to protected Documents paths.
- LOOM and original DeepSeek Harness may share profile paths; isolation **not verified**.
- Model catalog could distinguish `qwen3.5:9b` versus `qwen35-9b-orion:latest`; verify the actual selected model each session.
- Tool-call success at short prompts doesn't establish long-context coding reliability.
- Chat's successful file write/read is user-reported; verify on disk when convenient.
- UI branding/dark theme and a benchmark of real multi-step coding remain **not done**.

## Next gate: token-limit regression, no core changes
Run a bounded multi-step task with `qwen3.5:9b`, actual 16K context, Qwen Work, and a disposable workspace. Check (a) true tool calls/results (b) file created/read back (c) no `output-token limit reached`, and (d) total prompt/completion tokens and context use. Start with a ~2–4K-token input and a 3-step constrained coding task, then scale gradually; do not deliberately flood the model past 16K or spend huge tokens. Benchmark with both available Qwen variants separately only after the base-model run passes. Capture a trace or screenshots for independent verification.

## Snapshot interpretation
**FROZEN:** Proven functions/build pathways as above, by project policy (no modification without owner approval).
**NOT YET FULLY FROZEN AS ARTIFACT:** Windows working tree contains uncommitted corrections, package binary hash has not been reverified in this session, and run-time provider settings are user-profile state. Preserve and explicitly capture these before declaring a reproducible release.
