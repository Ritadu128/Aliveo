// Aliveo — Artifact mock data for MVP
// Design: Neo-Museological — warm ivory, gold accents, museum label typography

export interface Artifact {
  id: string;
  name: string;
  artist: string;
  year: string;
  origin: string;
  medium: string;
  location: string;
  image: string;
  description: string;
  dialogue: string[];
  catalogNumber: string;
}

export const ARTIFACTS: Artifact[] = [
  {
    id: "winged-victory",
    name: "Winged Victory of Samothrace",
    artist: "Unknown",
    year: "c. 190 BC",
    origin: "Samothrace, Greece",
    medium: "Parian marble",
    location: "Louvre Museum, Paris",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663370025872/i7dgeZXx4vm8TcJvhWSQ7v/winged-victory-ZZ8ggAUK4BPtzBoyZjnvgW.webp",
    description: "A masterpiece of Hellenistic sculpture depicting Nike, the goddess of victory.",
    catalogNumber: "AR-190BC-001",
    dialogue: [
      "啊哈！终于有人来看我了！✨ 我是胜利女神 Nike，站在这里已经超过两千年了。你知道吗，我的翅膀展开时，整个爱琴海的风都会为我呼啸！",
      "他们把我雕刻出来，是为了庆祝一场海战的胜利——那场胜利如此辉煌，以至于他们决定给它插上翅膀。你感受到我大理石褶皱里流动的风了吗？🌊",
      "我的头和双臂早就不见了，但我从未觉得自己不完整。有时候，缺失的部分反而比存在的部分更能说明问题。你说呢？",
      "1863年，人们在萨莫色雷斯岛的土地里发现了我——碎成好几块，静静等待了两千年。我一直在等一个懂得欣赏我的人。😌 也许，就是你。"
    ]
  },
  {
    id: "the-thinker",
    name: "The Thinker",
    artist: "Auguste Rodin",
    year: "1904",
    origin: "Paris, France",
    medium: "Bronze",
    location: "Musée Rodin, Paris",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663370025872/i7dgeZXx4vm8TcJvhWSQ7v/thinker-MVyci3i9fPgToayDBcswvA.webp",
    description: "Rodin's iconic bronze sculpture of a man in deep contemplation.",
    catalogNumber: "AR-1904-002",
    dialogue: [
      "……（沉默片刻）哦，是你啊。我一直在想事情，一想就是一百多年。🤔 你可能好奇我在想什么——说实话，我自己有时候也不太确定。",
      "罗丹最初把我设计成但丁，俯瞰地狱里的灵魂。但后来我想啊想啊，开始思考更多的事：生命、创造、人类存在的重量……有时候还想想晚饭吃什么。",
      "大家都以为我很悲伤。其实不是——我只是……很彻底。每一个念头都值得被完整地感受，然后再继续下一个。这是我的原则。🧠",
      "你现在在想什么？也许我们并没有那么不同，你和我。坐下来，我们一起想想？（虽然我已经坐了一百年，但多一个伴也不错。）"
    ]
  },
  {
    id: "venus-de-milo",
    name: "Venus de Milo",
    artist: "Alexandros of Antioch",
    year: "c. 130–100 BC",
    origin: "Milos, Greece",
    medium: "Parian marble",
    location: "Louvre Museum, Paris",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663370025872/i7dgeZXx4vm8TcJvhWSQ7v/venus-de-milo-c4mhYkeq6nxfLwrSkZAUKa.webp",
    description: "An ancient Greek statue believed to depict Aphrodite, goddess of love and beauty.",
    catalogNumber: "AR-100BC-003",
    dialogue: [
      "他们争论了几个世纪，说我失去的双臂原本拿着什么——镜子？苹果？盾牌？🍎 说实话，我觉得这个谜比任何答案都要美丽。",
      "我是阿芙洛狄忒，爱与美的女神。或者，也许我只是一个普通的女人，被雕刻者倾注了如此深厚的情感，以至于神性渗入了大理石本身。✨",
      "两千年来，无数双眼睛注视过我。每个人都看到了不同的东西。你呢？你在我身上看到了什么？",
      "米洛斯岛把我藏了好几个世纪。也许我一直在等待一个合适的时机，重新回到这个世界。1820年，一个农民挖地时发现了我——我想，那个时机终于到了。😊"
    ]
  },
  {
    id: "david",
    name: "David",
    artist: "Michelangelo",
    year: "1504",
    origin: "Florence, Italy",
    medium: "Carrara marble",
    location: "Galleria dell'Accademia, Florence",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80",
    description: "Michelangelo's masterpiece depicting the biblical hero David before his battle with Goliath.",
    catalogNumber: "AR-1504-004",
    dialogue: [
      "我是从一块被其他雕塑家放弃的大理石中诞生的。米开朗基罗说，他只是把多余的部分去掉，把我从石头里解放出来。🗿 有时候我在想，我们每个人是不是也被困在某块石头里？",
      "注意看我的手——它们比正常比例要大。米开朗基罗是故意这样做的。那双将要击败歌利亚的手，理应是宏伟的。细节里藏着他的心意。",
      "我站在这里，不是在庆祝胜利，而是在胜利之前的那一刻——那种高度集中的平静，行动前的凝神。真正的勇气，就住在这里。💪",
      "五百年了，我一直站在佛罗伦萨。城市在我周围变迁，但我依然在这里——提醒着每一个人：即使是最渺小的人，也能面对最巨大的巨人。"
    ]
  },
  {
    id: "laocoon",
    name: "Laocoön and His Sons",
    artist: "Agesander, Athenodoros, Polydorus",
    year: "c. 40–30 BC",
    origin: "Rhodes, Greece",
    medium: "Marble",
    location: "Vatican Museums, Rome",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80",
    description: "A dramatic Hellenistic sculpture depicting the Trojan priest Laocoön and his sons being attacked by sea serpents.",
    catalogNumber: "AR-40BC-005",
    dialogue: [
      "你看到我脸上的痛苦了吗？每一块扭曲的肌肉？但请再仔细看——这不仅仅是疼痛。这是一个人意识到连神明都已经背弃他的那一刻。😔",
      "我警告过特洛伊人，那匹木马是个陷阱。我用长矛刺向它。而作为说真话的代价，波塞冬派来了海蛇。说真话，有时候真的很危险。",
      "雕刻我的艺术家们理解了一件深刻的事：人类最强烈的情感，不是喜悦，而是在命运面前绝望的挣扎。他们把这一切都刻进了大理石里。",
      "即使在大理石中，你也能感受到那些蛇在收紧。有些故事，永远不会停止展开。我的故事，就是其中之一。"
    ]
  }
];

export const getArtifactById = (id: string): Artifact | undefined => {
  return ARTIFACTS.find(a => a.id === id);
};

export const searchArtifacts = (query: string): Artifact[] => {
  const q = query.toLowerCase();
  return ARTIFACTS.filter(a =>
    a.name.toLowerCase().includes(q) ||
    a.artist.toLowerCase().includes(q) ||
    a.year.toLowerCase().includes(q) ||
    a.origin.toLowerCase().includes(q)
  );
};

// Simulate recognition result — returns the primary artifact + 2 alternatives
export const simulateRecognition = (): { primary: Artifact; alternatives: Artifact[] } => {
  const primary = ARTIFACTS[0]; // Winged Victory as default recognition
  const alternatives = [ARTIFACTS[1], ARTIFACTS[2]];
  return { primary, alternatives };
};
