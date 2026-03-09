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
      "I have stood here for centuries, watching history unfold before me. The winds of the Aegean still seem to rush through my wings, even now.",
      "They carved me to celebrate a naval victory — a moment of triumph so profound that they gave it wings. Do you feel the movement in my marble folds?",
      "I lost my head and arms long ago, yet I have never felt incomplete. Sometimes, what is absent speaks louder than what remains.",
      "Come closer. Let me tell you about the day I was discovered, buried beneath the earth of Samothrace, waiting for someone to hear my story..."
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
      "Ah, a visitor. I have been sitting here, thinking, for over a century. You might wonder what occupies my mind so deeply.",
      "Rodin imagined me as Dante, contemplating the souls in Hell below. But I have come to think about everything — life, creation, the weight of human existence.",
      "People assume I am sad. But I am not sad — I am simply... thorough. Every thought deserves to be felt completely before moving on.",
      "What are you thinking about right now? Perhaps we are not so different, you and I."
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
      "They debate endlessly about what my missing arms once held. A mirror? An apple? A shield? I find the mystery more beautiful than any answer could be.",
      "I am Aphrodite — or perhaps I am simply a woman, carved with such devotion that divinity seeped into the marble itself.",
      "Two thousand years of human eyes have looked upon me. Each person sees something different. What do you see?",
      "The island of Milos kept me hidden for centuries. Perhaps I was waiting for the right moment to return to the world."
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
      "I was carved from a single block of marble that other sculptors had abandoned. Michelangelo saw me inside the stone before he ever touched it.",
      "Look at my hands — they are larger than proportional. Michelangelo made them that way deliberately. The hand that would slay Goliath deserved to be monumental.",
      "I stand here not in triumph, but in the moment before — the concentrated stillness before action. This is where true courage lives.",
      "Five hundred years I have stood in Florence. The city has changed around me, but I remain — a reminder that even the smallest among us can face the greatest giants."
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
      "You see agony in my face, in every twisted muscle. But look deeper — this is not merely pain. This is the moment when a man realizes the gods themselves have turned against him.",
      "I warned the Trojans about the wooden horse. I threw my spear at it. And for my truth-telling, Poseidon sent the serpents.",
      "The artists who made me understood something profound: the most powerful human emotion is not joy, but the desperate struggle against fate.",
      "Even in marble, you can feel the serpents tightening. Some stories never stop unfolding."
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
