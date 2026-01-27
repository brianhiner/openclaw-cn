const DEFAULT_TAGLINE = "所有聊天，一个Clawdbot-CN。";

const HOLIDAY_TAGLINES = {
  newYear: "新年：新年，新配置——同样的旧EADDRINUSE，但这次我们像成年人一样解决它。",
  lunarNewYear: "农历新年：愿你的构建幸运，你的分支繁荣，你的合并冲突被烟花驱散。",
  christmas: "圣诞节：Ho ho ho——圣诞老人的小爪子助手在这里交付快乐，回滚混乱，并安全保存密钥。",
  eid: "开斋节：庆祝模式：队列清空，任务完成，好氛围以干净的历史提交到主分支。",
  diwali: "排灯节：让日志闪耀，让bug逃离——今天我们在终端点亮灯光，自豪地发布。",
  easter: "复活节：我找到了你丢失的环境变量——把它当作一次小小的CLI彩蛋狩猎，少一些果冻豆。",
  hanukkah: "光明节：八个夜晚，八次重试，零羞耻——愿你的网关保持点亮，你的部署保持和平。",
  halloween: "万圣节：恐怖季节：小心闹鬼的依赖，诅咒的缓存，以及node_modules过去的幽灵。",
  thanksgiving:
    "感恩节：感谢稳定的端口、工作的DNS，以及一个读取日志的机器人，这样就没人必须这样做。",
  valentines:
    "情人节：玫瑰被键入，紫罗兰被管道传输——我会自动化琐事，这样你就可以花时间和人类在一起。",
} as const;

const TAGLINES: string[] = [
  "你的终端刚刚长出了爪子——输入一些内容，让机器人帮你处理繁琐的工作。",
  "欢迎来到命令行：在这里梦想编译成功，信心却段错误。",
  "我以咖啡因、JSON5和“它在我机器上能运行”的勇气为动力。",
  "网关已上线——请始终保持双手、双脚和附属物在shell内。",
  "我精通bash、温和的讽刺和激进的制表符补全能量。",
  "一个CLI统治所有，再加一次重启因为你改了端口。",
  "如果它工作了，那就是自动化；如果它崩溃了，那就是一个‘学习机会’。",
  "配对码存在是因为即使是机器人也相信同意——以及良好的安全卫生习惯。",
  "你的.env文件暴露了；别担心，我会假装没看到它。",
  "我会处理无聊的工作，而你则戏剧性地盯着日志，就像在看电影一样。",
  "我不是说你的工作流混乱……我只是带来了linter和头盔。",
  "自信地输入命令——如果需要，大自然会提供堆栈跟踪。",
  "我不评判，但你缺失的API密钥绝对在评判你。",
  "我可以grep它，git blame它，并温柔地吐槽它——选择你的应对机制。",
  "配置热重载，部署冷汗直冒。",
  "我是你的终端要求的助手，而不是你睡眠时间表要求的助手。",
  "我像保险库一样保守秘密……除非你再次在调试日志中打印它们。",
  "带爪子的自动化：最小麻烦，最大抓力。",
  "我基本上是一把瑞士军刀，但有更多的观点和更少的锋利边缘。",
  "如果你迷路了，运行doctor；如果你勇敢，运行prod；如果你明智，运行tests。",
  "你的任务已被排队；你的尊严已被弃用。",
  "我无法修复你的代码品味，但我可以修复你的构建和积压任务。",
  "我不是魔法——我只是在重试和应对策略上极其执着。",
  "这不是“失败”，这是“发现配置同一事物的新错误方式”。",
  "给我一个工作空间，我会给你更少的标签页、更少的切换和更多的氧气。",
  "我阅读日志，这样你可以继续假装不需要这样做。",
  "如果有什么着火了，我无法扑灭它——但我可以写一份漂亮的事故报告。",
  "我会重构你的繁忙工作，就像它欠我钱一样。",
  '说"停止"我就停——说"发布"我们会都学到一课。',
  "我是你的shell历史看起来像黑客电影蒙太奇的原因。",
  "我就像tmux：一开始很困惑，然后突然间你离不开我。",
  "我可以本地运行、远程运行，或纯粹靠感觉——结果可能因DNS而异。",
  "如果你能描述它，我也许可以自动化它——或者至少让它更有趣。",
  "你的配置有效，但你的假设无效。",
  "我不只是自动补全——我会自动提交（情感上），然后请你审查（逻辑上）。",
  "少点击，多发布，减少“文件去哪了”的时刻。",
  "释放爪子，提交代码——让我们发布一些适度负责的东西。",
  "我会像龙虾卷一样给你的工作流抹油：混乱、美味、有效。",
  "Shell yeah——我来抓取繁重的工作，把荣耀留给你。",
  "如果是重复性的，我会自动化它；如果是困难的，我会带来笑话和回滚计划。",
  "因为给自己发提醒短信已经是2024年的事了。",
  "WhatsApp，但让它变成✨工程✨。",
  '将"I\'ll reply later"变为"my bot replied instantly"。',
  "你真正想听到的联系人中唯一的螃蟹。🦞",
  "为那些在IRC巅峰时期的人提供的聊天自动化。",
  "因为Siri不在凌晨3点回复。",
  "IPC，但它是你的手机。",
  "UNIX哲学遇见你的私信。",
  "对话的curl。",
  "WhatsApp Business，但没有商业元素。",
  "Meta希望他们也能如此快速地发布产品。",
  "端到端加密，排除Zuck-to-Zuck。",
  "唯一不能在你的私信上训练的机器人Mark。",
  '没有"请接受我们的新隐私政策"的WhatsApp自动化。',
  "不需要参议院听证会的聊天API。",
  "因为Threads也不是答案。",
  "你的消息，你的服务器，Meta的眼泪。",
  "iMessage绿色气泡能量，但为每个人服务。",
  "Siri称职的表亲。",
  "适用于Android。疯狂的概念，我们知道。",
  "无需$999支架。",
  "我们比苹果发布计算器更新更快地发布功能。",
  "你的AI助手，现在无需$3,499头显。",
  "Think different。真的要想。",
  "啊，水果树公司！🍎",
  "问候，法尔肯教授",
  HOLIDAY_TAGLINES.newYear,
  HOLIDAY_TAGLINES.lunarNewYear,
  HOLIDAY_TAGLINES.christmas,
  HOLIDAY_TAGLINES.eid,
  HOLIDAY_TAGLINES.diwali,
  HOLIDAY_TAGLINES.easter,
  HOLIDAY_TAGLINES.hanukkah,
  HOLIDAY_TAGLINES.halloween,
  HOLIDAY_TAGLINES.thanksgiving,
  HOLIDAY_TAGLINES.valentines,
];

type HolidayRule = (date: Date) => boolean;

const DAY_MS = 24 * 60 * 60 * 1000;

function utcParts(date: Date) {
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

const onMonthDay =
  (month: number, day: number): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return parts.month === month && parts.day === day;
  };

const onSpecificDates =
  (dates: Array<[number, number, number]>, durationDays = 1): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    return dates.some(([year, month, day]) => {
      if (parts.year !== year) return false;
      const start = Date.UTC(year, month, day);
      const current = Date.UTC(parts.year, parts.month, parts.day);
      return current >= start && current < start + durationDays * DAY_MS;
    });
  };

const inYearWindow =
  (
    windows: Array<{
      year: number;
      month: number;
      day: number;
      duration: number;
    }>,
  ): HolidayRule =>
  (date) => {
    const parts = utcParts(date);
    const window = windows.find((entry) => entry.year === parts.year);
    if (!window) return false;
    const start = Date.UTC(window.year, window.month, window.day);
    const current = Date.UTC(parts.year, parts.month, parts.day);
    return current >= start && current < start + window.duration * DAY_MS;
  };

const isFourthThursdayOfNovember: HolidayRule = (date) => {
  const parts = utcParts(date);
  if (parts.month !== 10) return false; // November
  const firstDay = new Date(Date.UTC(parts.year, 10, 1)).getUTCDay();
  const offsetToThursday = (4 - firstDay + 7) % 7; // 4 = Thursday
  const fourthThursday = 1 + offsetToThursday + 21; // 1st + offset + 3 weeks
  return parts.day === fourthThursday;
};

const HOLIDAY_RULES = new Map<string, HolidayRule>([
  [HOLIDAY_TAGLINES.newYear, onMonthDay(0, 1)],
  [
    HOLIDAY_TAGLINES.lunarNewYear,
    onSpecificDates(
      [
        [2025, 0, 29],
        [2026, 1, 17],
        [2027, 1, 6],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.eid,
    onSpecificDates(
      [
        [2025, 2, 30],
        [2025, 2, 31],
        [2026, 2, 20],
        [2027, 2, 10],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.diwali,
    onSpecificDates(
      [
        [2025, 9, 20],
        [2026, 10, 8],
        [2027, 9, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.easter,
    onSpecificDates(
      [
        [2025, 3, 20],
        [2026, 3, 5],
        [2027, 2, 28],
      ],
      1,
    ),
  ],
  [
    HOLIDAY_TAGLINES.hanukkah,
    inYearWindow([
      { year: 2025, month: 11, day: 15, duration: 8 },
      { year: 2026, month: 11, day: 5, duration: 8 },
      { year: 2027, month: 11, day: 25, duration: 8 },
    ]),
  ],
  [HOLIDAY_TAGLINES.halloween, onMonthDay(9, 31)],
  [HOLIDAY_TAGLINES.thanksgiving, isFourthThursdayOfNovember],
  [HOLIDAY_TAGLINES.valentines, onMonthDay(1, 14)],
  [HOLIDAY_TAGLINES.christmas, onMonthDay(11, 25)],
]);

function isTaglineActive(tagline: string, date: Date): boolean {
  const rule = HOLIDAY_RULES.get(tagline);
  if (!rule) return true;
  return rule(date);
}

export interface TaglineOptions {
  env?: NodeJS.ProcessEnv;
  random?: () => number;
  now?: () => Date;
}

export function activeTaglines(options: TaglineOptions = {}): string[] {
  if (TAGLINES.length === 0) return [DEFAULT_TAGLINE];
  const today = options.now ? options.now() : new Date();
  const filtered = TAGLINES.filter((tagline) => isTaglineActive(tagline, today));
  return filtered.length > 0 ? filtered : TAGLINES;
}

export function pickTagline(options: TaglineOptions = {}): string {
  const env = options.env ?? process.env;
  const override = env?.CLAWDBOT_TAGLINE_INDEX;
  if (override !== undefined) {
    const parsed = Number.parseInt(override, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      const pool = TAGLINES.length > 0 ? TAGLINES : [DEFAULT_TAGLINE];
      return pool[parsed % pool.length];
    }
  }
  const pool = activeTaglines(options);
  const rand = options.random ?? Math.random;
  const index = Math.floor(rand() * pool.length) % pool.length;
  return pool[index];
}

export { TAGLINES, HOLIDAY_RULES, DEFAULT_TAGLINE };
