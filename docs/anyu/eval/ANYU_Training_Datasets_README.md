# AnYu Training Datasets

This folder contains Wisewave-provided training sets in machine-readable JSONL.

## Files

- `anyu_household_response_batch1_001_025.jsonl`
- `anyu_household_response_batch1_026_050.jsonl`
- `anyu_household_response_batch2_051_100.jsonl`
- `anyu_continuous_dialogue_3turn_batch1.jsonl`
- `anyu_dialogue_multiturn_v2_batch1_030.jsonl`（Wisewave V2，见下节）
- `anyu_dialogue_multiturn_v2_mandarin_020.jsonl`（Wisewave 普通话 V2 第1批）

## Notes

- Single-turn set now includes ids `1-100` (complete).
- All records keep the same schema:
  - single-turn: `id`, `input`, `emotion`, `response`, `risk_level`, `style_tag`
  - 3-turn: `scene`, `turns[3]`, `risk_level`

## Wisewave V2 multiturn（安语）

- File: **`anyu_dialogue_multiturn_v2_batch1_030.jsonl`**
- **Per row:** `id` (string，如 ANYU-001)、`style`（`cantonese_chat` \| `mandarin_gentle`）、`risk_level`、`tags[]`、`turns[]` alternating `user` / `assistant` with `role` + `text`（每条约 4 拍、两来回）。
- **Validate:**

`npm run eval:validate:v2`

(Optional path:) `npm run eval:validate:v2 -- path/to/other.jsonl`  
也可用 **JSON array** `.json`，根结点为 `[…]`。

- **Smoke（需本机在跑 Next）：**

`npm run eval:smoke:v2`

环境变量：`SMOKE_BASE_URL`（默认 `http://localhost:3030`）。脚本只对**第一条** dialogue 的顺序 user 回合做 POST（快速联通），不包含与参考 assistant 文案的字段级 diff。

## Validate (legacy batches)

Run:

`npm run eval:validate`

It checks:

- JSONL parsing
- required fields
- risk level enum
- 3-turn structure
- missing ids in single-turn corpus

## Lumen

将 `eval:validate:v2` 与 `eval:smoke:v2` 纳入 **`docs/anyu/QA_Plan_Lumen_Anyu_CN_Website.md`** 的增补回归项；fail 阈值以「校验脚本报错」「HTTP 非 200 或缺失 `assistant_message`」为准。

**说明：**当前 `POST /api/elder-chat/message` 仍为 **轮次索引 + 单次 user 拼装**；离线数据里的「多轮接球」与线上一致需在后续产品迭代中再由 prompt / 会话存储承接。
