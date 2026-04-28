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

  return "这话听着，心里有点堵。\n你现在最想先说哪一件？";
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
  return "你呢句话，我听得出有啲顶住。\n你而家最想讲边样先？";
}

export function getIndirectFallbackByStyle(style?: "mandarin_gentle" | "cantonese_chat") {
  if (style === "cantonese_chat") {
    return "你咁讲，好似有啲忍住咁。\n有时都会想有人陪下，係咪？";
  }
  return "你这样说，好像有点在忍着。\n有时候还是会想有人陪一陪，对吗？";
}
