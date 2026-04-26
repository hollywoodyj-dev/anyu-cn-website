# 安语官网 STT 与 ESP / xiaozhi-server ASR 对齐说明

**目的：** 把 Wisewave ESP 栈里 `xiaozhi-server` 的 **InterfaceType** 语义，与 **安语中文官网**（`anyu-cn-website`）的 **`bridge` / `openai_whisper` / `message`** 设计对齐，避免把「流式对接」和「整段转写」混在一层实现。

**参考代码位置（本机路径，不入库）：**  
`C:\AI\esp32\wisewave-esp32-server\main\xiaozhi-server\core\providers\asr`  
（各实现的 `InterfaceType` 与调用方式以该目录及 `dto.py`、`listenMessageHandler.py`、`base.receive_audio` 为准。）

---

## 1. xiaozhi 里的三种类型（语义）

这里的 **「流式」** 指 **xiaozhi 与 ASR 的对接方式**：是否在 **`InterfaceType.STREAM`** 下走 **持续 WebSocket、边说边识别**。  
与「某云厂商 HTTP API 内部是否支持 stream」不是同一句话，需分开说。

| 类型 | 含义（本仓库用语） |
|------|-------------------|
| **STREAM** | 连接层按流式 ASR：`listenMessageHandler` / `base.receive_audio` 的 STREAM 分支，持续 WebSocket。 |
| **NON_STREAM** | **一段话结束（如 VAD 停）** 再把整段送去识别，**一次**拿结果。 |
| **LOCAL** | 本地模型；同样是 **停说话后** 对整段音频推理，**不是** STREAM 那条实时链。 |

---

## 2. 各 ASR 模块与类型对照（摘要）

配置名与实现以 ESP 工程为准；下表为交接用摘要。

| 配置名 | type / 方向 | InterfaceType | 是否「xiaozhi 语义下的流式对接」 |
|--------|----------------|---------------|----------------------------------|
| DoubaoStreamASR | `doubao_stream` | STREAM | 是（火山 WebSocket 流式） |
| AliyunStreamASR | `aliyun_stream` | STREAM | 是（阿里云 NLS WebSocket） |
| AliyunBLStreamASR | `aliyunbl_stream` | STREAM | 是（百炼 Paraformer realtime WebSocket） |
| XunfeiStreamASR | `xunfei_stream` | STREAM | 是（讯飞 WebSocket） |
| DoubaoASR | `doubao` | NON_STREAM | 否 |
| TencentASR | `tencent` | NON_STREAM | 否 |
| AliyunASR | `aliyun` | NON_STREAM | 否 |
| BaiduASR | `baidu` | NON_STREAM | 否 |
| OpenaiASR / GroqASR | `openai`（共用实现） | NON_STREAM | 否（整段音频 POST，一次转写） |
| Qwen3ASRFlash | `qwen3_asr_flash` | NON_STREAM | 否（HTTP；内部 `stream=True` 读响应仍是单次识别任务） |
| FunASR（默认） | `fun_local` | LOCAL | 否（整段停说后本地推理） |
| FunASRServer | `fun_server` | NON_STREAM | 否（虽可用 WebSocket 传 chunk，类型仍是 NON_STREAM 管线） |
| SherpaASR / SherpaParaformerASR | `sherpa_onnx_local` | LOCAL | 否（`create_stream` 为解码器 API，非 xiaozhi 对外「流式字幕」） |
| VoskASR | `vosk` | LOCAL | 否（按 chunk 喂 PCM，常见仍是一 utterance 一结果） |

---

## 3. 与安语官网（本仓库）的对应关系

| 安语侧 | 对齐 xiaozhi 语义 | 说明 |
|--------|-------------------|------|
| **`ANYU_STT_PROVIDER=bridge`（默认）** | 设备侧 **LOCAL / NON_STREAM**（或任意 ASR）已产出 **整句文本** | 不在 Next/Vercel 上跑 ASR；`POST /api/elder-chat/message` 只吃 **text**。与 Spec「**utterance-complete**」一致。 |
| **`openai_whisper` + `POST /api/elder-chat/transcribe`** | 接近 **OpenaiASR：NON_STREAM** | 整段音频 **POST** OpenAI **`/v1/audio/transcriptions`**，一次出全文。 |
| **不在官网实现** | **STREAM**（DoubaoStream / AliyunStream 等） | 持续 WebSocket、边说边识别应留在 **ESP / xiaozhi-server**；**不要**在营销站 Next 路由里复制一条 STREAM ASR 管线作为 v1 方案。 |

官网 **`ANYU_Voice_OpenAI_STT_Implementation_Spec.md` §6** 要求：**产品 v1 不做 live partial ASR** — 与上表中 **NON_STREAM / LOCAL** 的「**一句一结果**」一致，与 **STREAM 对接** 刻意区分。

---

## 4. 评审后的推荐方案（Best solution）

**推荐默认生产路径（ESP + 安语云）：**

1. **在设备 / xiaozhi-server 侧**完成 **utterance-complete** 转写：优先 **FunASR `fun_local`（LOCAL）** 或组织已选定的 **NON_STREAM** 云（与上表一致）。  
2. **VAD 停句 → 整段识别 → 文本** 后，由桥接调用 **`POST https://<部署>/api/elder-chat/message`**（必要时先走设备侧或并行 **`/api/risk/evaluate`**，以产品为准）。  
3. 官网保持 **`ANYU_STT_PROVIDER=bridge`**（Vercel 上 **501** 的 transcribe 合约可接受），**不把音频常驻上传到营销站**，有利于 **延迟、带宽、隐私与日志边界**（与 Spec §5 / §8 一致）。

**何时启用官网 `openai_whisper`：**

- **无麦克风的 Web 演示**、**应急排障**、或 **薄终端不做 ASR** 时，作为 **可选** 整段云转写；需 **`OPENAI_API_KEY`** 与 **`ANYU_STT_PROVIDER=openai_whisper`**，并单独做 **成本 / 合规 / 留存策略** 评审。

**不推荐（v1）：**

- 在 **Next.js Route Handler** 上再接一层与 xiaozhi **STREAM** 对等的「持续流式 ASR」——职责重复、链路与鉴权复杂，且与当前 **「一句一结果」** 产品边界不一致。

---

## 5. 相关文件（本仓库）

- 规格：`docs/anyu/ANYU_Voice_OpenAI_STT_Implementation_Spec.md` §6  
- 实现：`lib/anyu/stt.ts`，`POST /api/elder-chat/transcribe`  
- 运维说明：`README.md`（环境变量与 bridge / whisper 行为）

---

*若 ESP 侧 `config` 或 provider 命名变更，请同步更新上表「配置名」列，并保留 InterfaceType 语义不变。*
