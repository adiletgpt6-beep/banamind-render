// Выпуск 1 финансового канала: «The Money System» (US English).
// Сквозной учебный пример — Alex: take-home $4,000/мес, расходы $3,200,
// остаток $800 (учебные числа, не статистика зарплат).
// Все суммы согласованы между собой; проверка — scripts/finance/numbers.test.mjs.
//
// Правило проекта: соответствие шариату. В выпуске нет процентных займов,
// вкладов и облигаций, ставок, пирамид, обещанной доходности, кредитного
// плеча и спекулятивных инструментов; прибыль от реальной деятельности
// показана переменной, с риском убытка. Что исключено из исходника и почему —
// finance/episode-01/REPORT.md.
import type { Scene } from "./types";
import type { SfxKind } from "./sfx";

export const VOICE = {
  name: "Eric (ElevenLabs premade, American, adult male)",
  voiceId: "cjVigY5qzO86Huf0OWal",
  modelId: "eleven_multilingual_v2",
  seed: 7,
  settings: { stability: 0.52, similarity_boost: 0.8, style: 0.12, use_speaker_boost: true, speed: 1.0 },
};

export const EPISODE = {
  title: "The Money System: Why Your Paycheck Keeps Resetting to Zero",
  example: { takeHome: 4000, essentials: 2600, flexible: 600, spending: 3200, leftover: 800 },
};

export const SCENES: Scene[] = [
  {
    id: "hook",
    chapter: "Hook",
    bg: "cream",
    visual: "hook",
    host: [{ at: "", layout: "close" }, { at: "h3@Today", layout: "center" }],
    poses: [{ at: "", pose: "question" }, { at: "h2@Payday", pose: "explain" }, { at: "h3@system", pose: "welcome" }],
    lines: [
      { id: "h1", text: "You earn money every month. So why does it still feel like you're starting from zero?", hl: ["zero?"], pauseAfter: 0.55 },
      { id: "h2", text: "Payday comes, the bills go out, and by the end of the month, the account looks almost the same as before.", pauseAfter: 0.45 },
      { id: "h3", text: "Today, let's fix that with a simple system. Not a trick. A system.", hl: ["system.", "system"] },
    ],
  },
  {
    id: "promise",
    chapter: "What you'll learn",
    bg: "sky",
    visual: "roadmap",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "explain" }, { at: "p2", pose: "count" }, { at: "p3", pose: "summary" }],
    lines: [
      { id: "p1", text: "By the end of this episode, you'll know five things." },
      {
        id: "p2",
        text: "Where you actually stand. What one hour of your work is really worth. Where your money flows. What you're aiming for. And how to grow your income in honest ways.",
        pauseAfter: 0.5,
      },
      {
        id: "p3",
        text: "One quick note about this channel. We leave out interest-based debt and savings, gambling, and get-rich-quick schemes. We stick to real work, real activity, and clear numbers.",
        hl: ["real", "clear"],
      },
    ],
  },
  {
    id: "alex",
    chapter: "Meet Alex",
    bg: "cream",
    visual: "alex",
    host: [{ at: "", layout: "right" }],
    poses: [{ at: "", pose: "pointLeft" }, { at: "a3", pose: "explain" }],
    lines: [
      { id: "a1", text: "Let's follow one example the whole way through. Meet Alex." },
      {
        id: "a2",
        text: "Alex has a regular job. Take-home pay, the money that actually lands in the account after taxes and deductions, is $4,000 a month.",
        hl: ["$4,000"],
      },
      { id: "a3", text: "These are teaching numbers, not average salaries. Swap in your own as we go." },
    ],
  },
  {
    id: "standing",
    chapter: "Step 1: Where you stand",
    bg: "sky",
    visual: "standing",
    host: [{ at: "", layout: "center" }],
    poses: [{ at: "", pose: "explain" }, { at: "s2", pose: "think" }, { at: "s3", pose: "pointRight" }],
    lines: [
      { id: "s1", text: "Step one: be honest about where you stand right now.", hl: ["honest"] },
      { id: "s2", text: "Not where you hope to be. Not where your friends seem to be. Where you are." },
      { id: "s3", text: "Alex opens last month's statement and sorts every expense into groups." },
    ],
  },
  {
    id: "budget",
    chapter: "Where the paycheck goes",
    bg: "cream",
    visual: "budget",
    host: [{ at: "", layout: "corner" }],
    poses: [{ at: "", pose: "pointRight" }, { at: "b4", pose: "count" }],
    lines: [
      { id: "b1", text: "$4,000 comes in. Then it splits." },
      {
        id: "b2",
        text: "Rent, groceries, transportation, utilities and phone, health and insurance. These are the essentials: $2,600.",
        hl: ["essentials:", "$2,600."],
      },
      { id: "b3", text: "Then dining out and delivery, subscriptions, shopping and fun. Another $600.", hl: ["$600."] },
      { id: "b4", text: "Total spending: $3,200.", hl: ["$3,200."] },
    ],
    hold: 0.4,
  },
  {
    id: "leftover",
    chapter: "What's left",
    bg: "sky",
    visual: "equation",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "question" }, { at: "e2", pose: "count" }, { at: "e3", pose: "explain" }],
    lines: [
      { id: "e1", text: "So what's left?", pauseAfter: 0.4 },
      { id: "e2", text: "$4,000 minus $3,200 equals $800.", hl: ["$800."], pauseAfter: 0.6 },
      {
        id: "e3",
        text: "That $800 is not a number to feel guilty or proud about. It's your starting point. And now you can see it.",
        hl: ["starting", "point."],
      },
    ],
  },
  {
    id: "hour",
    chapter: "Step 2: The price of your hour",
    bg: "cream",
    visual: "hour",
    host: [{ at: "", layout: "right" }],
    poses: [{ at: "", pose: "explain" }, { at: "w2@commute", pose: "count" }, { at: "w4", pose: "pointLeft" }],
    lines: [
      { id: "w1", text: "Step two: find out what one hour of your work is really worth.", hl: ["hour"] },
      { id: "w2", text: "Alex is paid for about 40 hours a week. But work takes more than that: the commute, getting ready, those late emails." },
      { id: "w3", text: "Add it all up, and Alex gives about 200 hours a month to work.", hl: ["200"] },
      { id: "w4", text: "$4,000 divided by 200 hours: about $20 for each hour.", hl: ["$20"] },
    ],
  },
  {
    id: "compare",
    chapter: "Monthly pay vs. the real hour",
    bg: "sky",
    visual: "compare",
    host: [{ at: "", layout: "corner" }],
    poses: [{ at: "", pose: "explain" }, { at: "m2", pose: "pointRight" }, { at: "m3", pose: "summary" }],
    lines: [
      { id: "m1", text: "This simple math can flip how you compare jobs." },
      { id: "m2", text: "Job A pays $4,500 a month but really takes 250 hours. That's $18 an hour. Job B pays $4,000 for 160 hours. That's $25 an hour.", hl: ["$18", "$25"] },
      { id: "m3", text: "The bigger paycheck isn't always the better hour.", hl: ["better", "hour."] },
    ],
  },
  {
    id: "hourUse",
    chapter: "Using the hour",
    bg: "cream",
    visual: "hourPrice",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "summary" }, { at: "u2", pose: "pointRight" }, { at: "u3", pose: "think" }, { at: "u4", pose: "explain" }],
    lines: [
      { id: "u1", text: "This is not what Alex is worth as a person. Your value isn't an hourly rate." },
      {
        id: "u2",
        text: "It's a tool for decisions. A $120 pair of sneakers costs Alex about six hours of work. Food delivery three times a week at about $20 each? That's roughly three hours, every week.",
      },
      { id: "u3", text: "Sometimes that's worth it. Sometimes it's not. Now the choice is clear.", hl: ["clear."] },
      { id: "u4", text: "Try it yourself: your monthly take-home pay, divided by all the hours work really takes." },
    ],
  },
  {
    id: "sources",
    chapter: "Step 3: Where income comes from",
    bg: "sky",
    visual: "quadrant",
    host: [{ at: "", layout: "center" }, { at: "q2", layout: "corner" }],
    poses: [
      { at: "", pose: "explain" },
      { at: "q2", pose: "pointRight" },
      { at: "q7", pose: "summary" },
    ],
    lines: [
      { id: "q1", text: "Step three: understand where income can come from." },
      { id: "q2", text: "Here's a simple map. Think of it as a sketch, not a law of success.", hl: ["sketch,"] },
      { id: "q3", text: "One: a job. You trade time and skill for a paycheck." },
      {
        id: "q4",
        text: "Two: self-employed. You sell your own service, like design, repairs, or tutoring. You keep more control, but you also handle clients, costs, and slow months.",
      },
      { id: "q5", text: "Three: a business. You build a system and a team, so the work doesn't depend only on your own hours." },
      {
        id: "q6",
        text: "Four: owning productive assets. Part of a real business, a property you rent out, or creative work that people buy again and again.",
      },
      {
        id: "q7",
        text: "None of these boxes is better by default. A great job can be a strong foundation. And every extra source takes time, money, and real risk to build.",
        hl: ["better", "default."],
      },
    ],
  },
  {
    id: "assets",
    chapter: "Assets, liabilities, cash flow",
    bg: "cream",
    visual: "assets",
    host: [{ at: "", layout: "right" }, { at: "x5", layout: "corner" }],
    poses: [{ at: "", pose: "explain" }, { at: "x2", pose: "pointLeft" }, { at: "x5", pose: "pointRight" }, { at: "x6", pose: "summary" }],
    lines: [
      { id: "x1", text: "Now, three words people often mix up: assets, liabilities, and cash flow." },
      { id: "x2", text: "An asset is something you own that has value: savings, tools, a car, a home.", hl: ["asset"] },
      { id: "x3", text: "A liability is something you owe to someone else, like an unpaid bill or a debt.", hl: ["liability"] },
      { id: "x4", text: "And cash flow is simply money moving in or out each month.", hl: ["cash", "flow"] },
      {
        id: "x5",
        text: "Imagine someone who owns a house outright. It's an asset. It still has costs: property tax, insurance, repairs. Those costs are cash going out. They don't turn the house into a liability.",
      },
      {
        id: "x6",
        text: "And if they rent out a spare room, that rent is cash coming in. Three separate things. Keep them separate, and the picture gets clear.",
      },
    ],
  },
  {
    id: "patterns",
    chapter: "Three money patterns",
    bg: "sky",
    visual: "patterns",
    host: [{ at: "", layout: "corner" }],
    poses: [{ at: "", pose: "explain" }, { at: "c2", pose: "pointRight" }, { at: "c3", pose: "oops" }, { at: "c4", pose: "pointRight" }, { at: "c5", pose: "summary" }],
    lines: [
      { id: "c1", text: "Let's watch how money moves. There are three common patterns." },
      { id: "c2", text: "Pattern one: money comes in, and all of it goes straight out to expenses. Every month resets to zero." },
      {
        id: "c3",
        text: "Pattern two: money comes in, and a big part goes to payments for things bought with borrowed money. Next month's paycheck is already spoken for before it arrives.",
      },
      {
        id: "c4",
        text: "Pattern three: money comes in, expenses are covered, and a planned part stays. It builds a reserve, funds goals and skills, and over time can go into real, productive activity.",
        hl: ["planned"],
      },
      { id: "c5", text: "Same paycheck. Very different direction.", hl: ["direction."] },
    ],
  },
  {
    id: "leaks",
    chapter: "Where money slips away",
    bg: "cream",
    visual: "leaks",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "question" }, { at: "l2", pose: "count" }, { at: "l3", pose: "oops" }, { at: "l4", pose: "explain" }],
    lines: [
      { id: "l1", text: "So where does money slip away before you even notice?" },
      {
        id: "l2",
        text: "First, deductions. Alex's gross pay is higher than $4,000, because taxes and deductions come out first. Paying taxes honestly is part of the deal, so read your pay stub and know the difference between gross and take-home.",
        hl: ["gross", "take-home."],
      },
      {
        id: "l3",
        text: "Second, charges: late fees, overdraft fees, and interest on borrowed money. On this channel, we avoid interest-based debt, and simply paying bills on time removes a lot of these charges.",
      },
      { id: "l4", text: "Third, small automatic spending: subscriptions you forgot, delivery fees, impulse buys." },
    ],
  },
  {
    id: "trim",
    chapter: "Spend less than you earn",
    bg: "sky",
    visual: "trim",
    host: [{ at: "", layout: "right" }],
    poses: [{ at: "", pose: "explain" }, { at: "t2", pose: "summary" }, { at: "t3", pose: "pointLeft" }, { at: "t4", pose: "welcome" }],
    lines: [
      { id: "t1", text: "Here's the rule that holds everything together: spend less than you earn. Clearly less.", hl: ["less"] },
      { id: "t2", text: "But this isn't about cutting until life gets gray. The essentials stay. Rest, family, and small joys stay too." },
      { id: "t3", text: "Alex just looks for leaks. Delivery goes from $300 to $200. Two unused subscriptions get canceled, from $90 to $40." },
      {
        id: "t4",
        text: "Spending drops from $3,200 to $3,050. The leftover grows from $800 to $950, and life didn't get worse.",
        hl: ["$950,"],
        say: { "$3,050": "three thousand and fifty dollars" },
      },
    ],
  },
  {
    id: "goals",
    chapter: "Step 4: Goals and a reserve",
    bg: "cream",
    visual: "goals",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "explain" }, { at: "g2", pose: "count" }, { at: "g3", pose: "pointRight" }, { at: "g4", pose: "summary" }],
    lines: [
      { id: "g1", text: "Step four: decide what that money is for. A goal without a number is just a wish.", hl: ["number"] },
      {
        id: "g5",
        text: "A good goal is specific, measurable, realistic, meaningful to you, and has a deadline. \"I want to be rich\" fails every test. \"Build a $7,800 reserve in 13 months\" passes.",
        hl: ["deadline."],
      },
      { id: "g2", text: "Alex splits the $950 on purpose: $600 to a reserve, $250 to a skills fund, and $100 for giving and small joys." },
      {
        id: "g3",
        text: "The reserve is a cushion for surprises, like a car repair or a few slow months. Alex's target: three months of essentials. That's $7,800.",
        hl: ["$7,800."],
      },
      { id: "g4", text: "At $600 a month, that takes 13 months. No promised returns, no tricks, just steady deposits you can watch grow.", hl: ["13"] },
    ],
  },
  {
    id: "hourUp",
    chapter: "Step 5: Grow the value of your hour",
    bg: "sky",
    visual: "hourUp",
    host: [{ at: "", layout: "center" }, { at: "r3", layout: "right" }],
    poses: [{ at: "", pose: "welcome" }, { at: "r2", pose: "think" }, { at: "r3", pose: "pointLeft" }, { at: "r4", pose: "explain" }],
    lines: [
      { id: "r1", text: "Step five: grow your income, starting with the value of your hour." },
      { id: "r2", text: "Ask yourself one question: doing roughly what I do now, or something close to it, how could one hour of my work be worth more?", pauseAfter: 0.5 },
      { id: "r3", text: "Maybe a certification. A stronger skill your team needs. Taking on harder problems. Or asking for a raise with clear results in hand." },
      {
        id: "r4",
        text: "Alex puts the skills fund into a course and, over time, aims for a role that pays more. It may take a while, and nothing is guaranteed. But a skill is something you always carry.",
      },
    ],
  },
  {
    id: "real",
    chapter: "Real activity, real profit",
    bg: "cream",
    visual: "realActivity",
    host: [{ at: "", layout: "right" }, { at: "v3", layout: "corner" }, { at: "v6", layout: "right" }],
    poses: [{ at: "", pose: "explain" }, { at: "v3", pose: "pointRight" }, { at: "v5", pose: "summary" }, { at: "v6", pose: "explain" }],
    lines: [
      { id: "v1", text: "Another way to grow is real, productive activity. Let's look at it honestly." },
      { id: "v2", text: "Say Alex starts a small weekend service: tuning bikes for neighbors." },
      { id: "v3", text: "In one month, revenue is $600. Tools, parts, and ads cost $250. Profit: $350, and that's before taxes on it.", hl: ["$350,"] },
      { id: "v4", text: "The next month, revenue is $300 and costs are $200. Profit: just $100.", hl: ["$100."] },
      { id: "v5", text: "That's the honest picture. Real profit goes up and down. There's no promised rate, and you can lose money too." },
      {
        id: "v6",
        text: "And if you ever put money into someone else's business as a partner, a fair deal shares the actual profit, and the losses too. Not a fixed, guaranteed payout on the money you put in.",
        hl: ["actual", "profit,"],
      },
    ],
  },
  {
    id: "scale",
    chapter: "Scaling",
    bg: "sky",
    visual: "scale",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "explain" }, { at: "k2", pose: "welcome" }, { at: "k3", pose: "think" }],
    lines: [
      { id: "k1", text: "One more idea: scaling. An hour of work that serves one person can only be sold once." },
      { id: "k2", text: "But a guide, a design, a course, or a tool you build once can be useful to many people. A business can scale too, like a second location of a coffee shop that already works." },
      { id: "k3", text: "It still takes time, money, and effort upfront, and it might not work out. But it's one way your income stops depending only on your own hours." },
    ],
  },
  {
    id: "recap",
    chapter: "Recap",
    bg: "cream",
    visual: "recap",
    host: [{ at: "", layout: "right" }],
    poses: [{ at: "", pose: "summary" }, { at: "z2", pose: "count" }],
    lines: [
      { id: "z1", text: "Let's put it all together." },
      {
        id: "z2",
        text: "Know where you stand. Know the price of your hour. Watch where money flows. Give every dollar a goal. And grow your income in honest ways.",
        pauseAfter: 0.6,
      },
    ],
  },
  {
    id: "today",
    chapter: "Your move today",
    bg: "sky",
    visual: "today",
    host: [{ at: "", layout: "left" }],
    poses: [{ at: "", pose: "welcome" }, { at: "d2", pose: "count" }, { at: "d3", pose: "explain" }],
    lines: [
      { id: "d1", text: "Here's your move for today. It takes about twenty minutes." },
      {
        id: "d2",
        text: "Write down your monthly take-home pay. List last month's spending in groups. Subtract to find your leftover. Then divide your pay by the real hours your work takes.",
      },
      { id: "d3", text: "Pick one goal, give it a number, and make the first small transfer. Even a small one counts." },
    ],
  },
  {
    id: "outro",
    chapter: "Subscribe",
    bg: "cream",
    visual: "outro",
    host: [{ at: "", layout: "center" }],
    poses: [{ at: "", pose: "welcome" }, { at: "o2", pose: "summary" }],
    lines: [
      { id: "o1", text: "If this helped, subscribe for the next episode. We'll keep building this system, one clear step at a time.", hl: ["subscribe"] },
      { id: "o2", text: "See you there." },
    ],
    hold: 0.8,
  },
];

/** Немелодические эффекты по смыслу (привязка к словам). */
export const SFX: [string, SfxKind][] = [
  ["e2@equals", "tick"],
  ["e2@$800", "pop"],
  ["w4@about", "tick"],
  ["c2@resets", "thud"],
  ["m2@$18", "tick"],
  ["m2@$25", "pop"],
  ["c3@spoken", "thud"],
  ["c4@stays", "pop"],
  ["t4@$950", "pop"],
  ["g3@$7,800", "pop"],
  ["v3@Profit", "tick"],
  ["v4@Profit", "tick"],
];
