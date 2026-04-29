import type { DialogueState } from "@/lib/elder-agent/conversationStateEngine";
import { getV5PhrasePack } from "@/lib/elder-agent/v5PhraseBank";

function pickKeyEcho(text: string): string {
  const t = text.trim();
  const keys = [
    "冇用",
    "没用",
    "没人",
    "冇人",
    "不回来",
    "返嚟",
    "仔女",
    "儿子",
    "女儿",
    "孤单",
    "无聊",
    "闷",
    "不舒服",
    "唔舒服",
  ];
  for (const k of keys) {
    if (t.includes(k)) return k;
  }
  return t.slice(0, Math.min(6, t.length));
}

export function getHouseholdFallback(message: string) {
  if (message.includes("没人") || message.includes("没人说话")) {
    return "一天没人说话，怪冷清的。\n你今天大多都在家吗？";
  }

  if (message.includes("儿子") || message.includes("女儿")) {
    return "见得少了，心里会空一点。\n你最近有和他们通电话吗？";
  }

  if (message.includes("晚上") || message.includes("害怕")) {
    return "晚上一个人会有点怕。\n你今晚是一个人在家吗？";
  }

  if (message.includes("没用") || message.includes("不中用")) {
    return "这样想会挺难受的。\n你现在最挂心的是哪件事？";
  }

  if (message.includes("麻烦")) {
    return "你是不想麻烦他们。\n你会想先轻轻问候一句吗？";
  }

  return "嗯，我听着。\n你现在想先聊哪一小件？";
}

export function getHouseholdFallbackByStyle(message: string, style?: "mandarin_gentle" | "cantonese_chat") {
  if (style !== "cantonese_chat") return getHouseholdFallback(message);

  if (message.includes("冇人") || message.includes("没人")) {
    return "成日冇人讲嘢，屋企会静晒。\n你今日系咪都喺屋企？";
  }
  if (message.includes("仔女") || message.includes("儿子") || message.includes("女儿") || message.includes("孩子")) {
    return "挂住仔女，心会有啲酸。\n你近排有冇同佢哋讲两句？";
  }
  if (message.includes("麻烦") || message.includes("麻煩")) {
    return "你係唔想麻烦佢哋。\n你会唔会想轻轻问候一句？";
  }
  return "我听住。\n你而家想由边句开始讲？";
}

export function getIndirectFallbackByStyle(style?: "mandarin_gentle" | "cantonese_chat") {
  if (style === "cantonese_chat") {
    return "你咁讲，好似有啲忍住咁。\n有时都会想有人陪下，係咪？";
  }
  return "你这样说，好像有点在忍着。\n有时候还是会想有人陪一陪，对吗？";
}

export function getStateFallbackByStyle(
  state: DialogueState,
  style?: "mandarin_gentle" | "cantonese_chat",
  seed = 0,
  contextText = "",
): string {
  const pick = (arr: string[]) => arr[Math.abs(seed) % arr.length];
  const ctx = contextText.trim();
  if (style === "cantonese_chat") {
    if (state === "casual") return pick(["几好啊。\n你今日过得顺唔顺？", "听落几轻松。\n今日有冇出去行下？"]);
    if (state === "story") return pick(["好啊，我听住。\n你想由以前边段开始讲？", "好，我慢慢听。\n你想先讲当年边件事？"]);
    if (state === "family") {
      return pick(["挂住屋企人好自然。\n你而家想听下佢哋把声，定想约食餐饭？", "呢份挂住我听到。\n你想先同边个讲两句？"]);
    }
    if (state === "health") return pick(["身体唔舒服真係辛苦。\n你呢几日有冇同屋企人讲过？", "听到你身体唔太舒服。\n你想唔想先休息下再慢慢讲？"]);
    if (state === "confused") return pick(["我啱啱听得唔太清楚。\n你係想讲身体，定係想讲屋企嘅事？", "我未听得好实。\n你可唔可以再讲慢少少？"]);
    if (state === "emotional") {
      if (/生氣|生气|頂唔順|顶唔顺|好嬲|好怒/.test(ctx)) {
        return "听到你而家真係有啲火。\n你想先讲下，啱啱边句最顶住你？";
      }
      if (/冇人|没人|一个人|自己/.test(ctx)) {
        return pick([
          "屋企得返自己，真係会闷住。\n你而家最想有人同你讲边句？",
          "听到你讲到得返自己一个。\n你想唔想先讲下，今晚最难顶嗰阵？",
        ]);
      }
      return pick([
        "我明，你想有人倾两句。\n你今日最想讲边样？",
        "呢阵有啲闷都正常。\n你而家最想边个陪你讲下？",
        "我听到你而家有点闷住。\n想先讲下今日最难顶嗰阵吗？",
      ]);
    }
    return "我喺度听住。\n你慢慢讲就得。";
  }
  if (state === "casual") return pick(["那挺好的。\n今天过得还轻松吗？", "听起来不错。\n今天有没有做点让你舒服的小事？"]);
  if (state === "story") return pick(["好啊，我听着。\n你想先讲哪一段以前的事？", "好，我在听。\n你想从当年的哪件事说起？"]);
  if (state === "family") return pick(["惦记家里人很自然。\n你现在更想见一面，还是先通个电话？", "这份挂念我听到了。\n你想先听听谁的声音？"]);
  if (state === "health") return pick(["身体不舒服确实辛苦。\n你这几天有和家里人说过吗？", "听着确实不太舒服。\n你要不要先说说最明显的是哪一处？"]);
  if (state === "confused") return pick(["我刚刚听得不太清楚。\n你是想说身体不舒服，还是想说家里的事？", "我刚刚没完全听清。\n你可以再慢一点说一次吗？"]);
  if (state === "emotional") {
    if (/生气|火大|烦死|受不了/.test(ctx)) {
      return "我听到你这会儿是真有火气。\n你想先把最卡的那一句说出来吗？";
    }
    if (/没人|一个人|没人在家|就剩我/.test(ctx)) {
      return pick([
        "一个人在家，心里会更空一些。\n这会儿你最想先说哪一句？",
        "听到你说家里只剩自己。\n你最想有人回你哪句话？",
      ]);
    }
    return pick([
      "嗯，我听到了。\n你今天最想先聊哪件小事？",
      "我在听。\n你最想先说哪一件让你闷着的事？",
      "我听着呢。\n这会儿你最想先说哪一句？",
    ]);
  }
  return "嗯，我在听。\n你慢慢说就好。";
}

export function getV5StateResponseByStyle(
  state: DialogueState,
  style: "mandarin_gentle" | "cantonese_chat",
  userText: string,
  seed = 0,
): string {
  const key = pickKeyEcho(userText);
  const pack = getV5PhrasePack(style, state);
  const pickPack = (arr: string[], delta = 0) => arr[Math.abs(seed + delta) % arr.length];
  const baseThree = () => `${pickPack(pack.empathy)}\n${pickPack(pack.daily, 1)}\n${pickPack(pack.follow, 2)}`;
  if (style === "cantonese_chat") {
    if (state === "casual") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
    if (state === "health") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
    if (state === "story") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
    if (state === "confused") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
    if (state === "family") return `你讲到「${key}」。\n${pickPack(pack.daily, 1)}\n${pickPack(pack.follow, 2)}`;
    if (state === "emotional") return `你讲到「${key}」。\n呢种感觉会几唔舒服。\n你而家最想讲边一句？`;
    return baseThree();
  }

  if (state === "casual") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
  if (state === "health") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
  if (state === "story") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
  if (state === "confused") return `${pickPack(pack.empathy)}\n${pickPack(pack.follow, 1)}`;
  if (state === "family") return `你刚刚提到「${key}」。\n${pickPack(pack.daily, 1)}\n${pickPack(pack.follow, 2)}`;
  if (state === "emotional") return `你刚刚提到「${key}」。\n${pickPack(pack.daily, 1)}\n${pickPack(pack.follow, 2)}`;
  return baseThree();
}
