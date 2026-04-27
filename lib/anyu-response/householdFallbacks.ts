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
