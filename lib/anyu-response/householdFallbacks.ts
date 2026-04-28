export function getHouseholdFallback(message: string) {
  if (message.includes("没人") || message.includes("没人说话")) {
    return "一天没人说话，怪冷清的。\n家里都没个声音。";
  }

  if (message.includes("儿子") || message.includes("女儿")) {
    return "他少理你，心里不好受。\n像说话没人接。";
  }

  if (message.includes("晚上") || message.includes("害怕")) {
    return "晚上一个人，会有点怕。\n灯一关，更安静了。";
  }

  if (message.includes("没用") || message.includes("不中用")) {
    return "这样想，心里挺难受的。\n像帮不上什么忙了。";
  }

  if (message.includes("麻烦")) {
    return "你是不想麻烦他们。\n什么都自己扛着。";
  }

  return "这话听着，心里不好受。\n像憋了挺久。";
}

export function getHouseholdFallbackByStyle(message: string, style?: "mandarin_gentle" | "cantonese_chat") {
  if (style !== "cantonese_chat") return getHouseholdFallback(message);

  if (message.includes("冇人") || message.includes("没人")) {
    return "成日冇人讲嘢，屋企会静晒。\n心都会空空地。";
  }
  if (message.includes("仔女") || message.includes("儿子") || message.includes("女儿") || message.includes("孩子")) {
    return "挂住仔女，心会有啲酸。\n又怕打扰佢哋。";
  }
  if (message.includes("麻烦") || message.includes("麻煩")) {
    return "你係唔想麻烦佢哋。\n好多嘢都自己顶住。";
  }
  return "你呢句话，我听得出有啲顶住。\n慢慢讲，我喺度。";
}
