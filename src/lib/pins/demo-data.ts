import type { KindnessPin } from "@/types/pin";

/**
 * Seed stories used when Supabase isn't configured (see `store.ts`).
 *
 * These are illustrative, not real submissions — the UI labels them as
 * sample data so nobody mistakes them for the live map.
 */
interface DemoSeed {
  id: string;
  minutesAgo: number;
  latitude: number;
  longitude: number;
  location_label: string;
  country: string;
  category: KindnessPin["category"];
  message: string;
}

const SEEDS: DemoSeed[] = [
  {
    id: "demo-0001",
    country: "in",
    minutesAgo: 14,
    latitude: 17.385,
    longitude: 78.4867,
    location_label: "Hyderabad, India",
    category: "help_stranger",
    message:
      "A delivery rider stopped in the middle of traffic to help an older man carry his groceries across the road, then went back for his bike. Nobody honked. That felt like the whole city agreeing for a second.",
  },
  {
    id: "demo-0002",
    country: "gb",
    minutesAgo: 41,
    latitude: 51.5074,
    longitude: -0.1278,
    location_label: "London, United Kingdom",
    category: "emotional_support",
    message:
      "Sat next to someone crying on the Overground. I asked if they wanted company or quiet. They said company. We talked about nothing for four stops and they left smiling.",
  },
  {
    id: "demo-0003",
    country: "br",
    minutesAgo: 96,
    latitude: -23.5505,
    longitude: -46.6333,
    location_label: "Sao Paulo, Brazil",
    category: "community",
    message:
      "Our street pooled money to fix the broken lamp on the corner. Took three weeks and a lot of arguing in the group chat, but it is lit again and people walk home that way now.",
  },
  {
    id: "demo-0004",
    country: "jp",
    minutesAgo: 133,
    latitude: 35.6762,
    longitude: 139.6503,
    location_label: "Tokyo, Japan",
    category: "other",
    message:
      "Left my umbrella on the train. Someone handed it in at the station office with a note saying which car it was in, so staff could tell me where to look.",
  },
  {
    id: "demo-0005",
    country: "us",
    minutesAgo: 190,
    latitude: 40.7128,
    longitude: -74.006,
    location_label: "New York, USA",
    category: "donation",
    message:
      "The bodega on my block keeps a shelf where you can leave a paid-for sandwich for whoever needs one. I finally used it today instead of just admiring it.",
  },
  {
    id: "demo-0006",
    country: "au",
    minutesAgo: 260,
    latitude: -33.8688,
    longitude: 151.2093,
    location_label: "Sydney, Australia",
    category: "environment",
    message:
      "Six of us cleaned a stretch of the harbour foreshore before work. Two joggers stopped and joined halfway through without being asked. Filled nine bags.",
  },
  {
    id: "demo-0007",
    country: "fr",
    minutesAgo: 330,
    latitude: 48.8566,
    longitude: 2.3522,
    location_label: "Paris, France",
    category: "animal",
    message:
      "A cafe on rue Oberkampf puts a water bowl out every morning and keeps a tin of food for the cat that has decided it lives there now. The cat is thriving.",
  },
  {
    id: "demo-0008",
    country: "sg",
    minutesAgo: 420,
    latitude: 1.3521,
    longitude: 103.8198,
    location_label: "Singapore",
    category: "help_stranger",
    message:
      "My card declined at the checkout with a full trolley behind me. The woman behind tapped hers and refused to give me her details. I have paid it forward twice since.",
  },
  {
    id: "demo-0009",
    country: "ru",
    minutesAgo: 520,
    latitude: 55.7558,
    longitude: 37.6173,
    location_label: "Moscow, Russia",
    category: "emotional_support",
    message:
      "My neighbour noticed I had not taken my bins out in a week and knocked to check I was alright. I was not. She stayed for tea and did not make it a big thing.",
  },
  {
    id: "demo-0010",
    country: "ke",
    minutesAgo: 640,
    latitude: -1.2921,
    longitude: 36.8219,
    location_label: "Nairobi, Kenya",
    category: "community",
    message:
      "The matatu drivers on our route organised free rides for students during exam week. No announcement, they just stopped charging anyone in uniform.",
  },
  {
    id: "demo-0011",
    country: "mx",
    minutesAgo: 780,
    latitude: 19.4326,
    longitude: -99.1332,
    location_label: "Mexico City, Mexico",
    category: "donation",
    message:
      "Someone left a box of winter coats outside the metro with a sign saying take what you need. By evening the box was empty and there were two more boxes.",
  },
  {
    id: "demo-0012",
    country: "de",
    minutesAgo: 910,
    latitude: 52.52,
    longitude: 13.405,
    location_label: "Berlin, Germany",
    category: "environment",
    message:
      "My building started a shared compost bin. It is deeply unglamorous and it has cut our rubbish by half. The tomatoes on the roof are absurd this year.",
  },
  {
    id: "demo-0013",
    country: "ca",
    minutesAgo: 1080,
    latitude: 43.6532,
    longitude: -79.3832,
    location_label: "Toronto, Canada",
    category: "help_stranger",
    message:
      "Stranger spent twenty minutes in the snow helping me dig my car out, then waved off the coffee I offered and went back to shovelling someone else's driveway.",
  },
  {
    id: "demo-0014",
    country: "ar",
    minutesAgo: 1250,
    latitude: -34.6037,
    longitude: -58.3816,
    location_label: "Buenos Aires, Argentina",
    category: "other",
    message:
      "The bookshop near Plaza Serrano has a shelf of free books people have finished. I have taken three and left five. It is the best trade I have going.",
  },
  {
    id: "demo-0015",
    country: "in",
    minutesAgo: 1440,
    latitude: 28.6139,
    longitude: 77.209,
    location_label: "Delhi, India",
    category: "animal",
    message:
      "The guard at our gate has been feeding four street dogs for years out of his own pay. Residents finally noticed and now there is a rota so it is not just him.",
  },
  {
    id: "demo-0016",
    country: "it",
    minutesAgo: 1700,
    latitude: 41.9028,
    longitude: 12.4964,
    location_label: "Rome, Italy",
    category: "emotional_support",
    message:
      "Lost my grandmother in March. A friend I had not spoken to in years still texts me every Sunday. Never asks how I am doing, just tells me something small about her week.",
  },
  {
    id: "demo-0017",
    country: "kr",
    minutesAgo: 2000,
    latitude: 37.5665,
    longitude: 126.978,
    location_label: "Seoul, South Korea",
    category: "community",
    message:
      "Our apartment block runs a repair table on Saturdays. Bring anything broken. An 80 year old man fixed my headphones in four minutes and refused payment.",
  },
  {
    id: "demo-0018",
    country: "eg",
    minutesAgo: 2400,
    latitude: 30.0444,
    longitude: 31.2357,
    location_label: "Cairo, Egypt",
    category: "donation",
    message:
      "The fridge outside the mosque on our street is stocked by whoever can and emptied by whoever needs. Nobody signs anything. It has run for two years.",
  },
  {
    id: "demo-0019",
    country: "se",
    minutesAgo: 2900,
    latitude: 59.3293,
    longitude: 18.0686,
    location_label: "Stockholm, Sweden",
    category: "environment",
    message:
      "A group here does plogging: jogging while picking up litter. I joined to be polite and stayed because it is the only exercise that has ever felt useful.",
  },
  {
    id: "demo-0020",
    country: "za",
    minutesAgo: 3400,
    latitude: -26.2041,
    longitude: 28.0473,
    location_label: "Johannesburg, South Africa",
    category: "help_stranger",
    message:
      "Car died on the M1 at dusk. Two people stopped within a minute, one to push and one to put their hazards on behind me until the tow arrived.",
  },
  {
    id: "demo-0021",
    country: "ae",
    minutesAgo: 4100,
    latitude: 25.2048,
    longitude: 55.2708,
    location_label: "Dubai, UAE",
    category: "other",
    message:
      "The security guard in our tower learned every resident's name in his first month. Mine included, and I had been avoiding eye contact for a year.",
  },
  {
    id: "demo-0022",
    country: "ph",
    minutesAgo: 5000,
    latitude: 14.5995,
    longitude: 120.9842,
    location_label: "Manila, Philippines",
    category: "community",
    message:
      "After the flood, the sari-sari store gave out water and let people charge phones for free for three days. She lost stock she could not afford to lose.",
  },
  {
    id: "demo-0023",
    country: "ie",
    minutesAgo: 6200,
    latitude: 53.3498,
    longitude: -6.2603,
    location_label: "Dublin, Ireland",
    category: "emotional_support",
    message:
      "A bus driver waited while an anxious kid worked out their fare, then told the whole bus we were early anyway. We were not early. That was a kindness too.",
  },
  {
    id: "demo-0024",
    country: "ng",
    minutesAgo: 7600,
    latitude: 6.5244,
    longitude: 3.3792,
    location_label: "Lagos, Nigeria",
    category: "donation",
    message:
      "My tailor makes school uniforms for free for two children on our street every August. He has done it since before I moved here and has never mentioned it once.",
  },
  {
    id: "demo-0025",
    country: "it",
    minutesAgo: 9800,
    latitude: 45.4642,
    longitude: 9.19,
    location_label: "Milan, Italy",
    category: "animal",
    message:
      "The vet near the station treats strays for nothing on Tuesday mornings. There is always a queue of people carrying cats that are technically nobody's.",
  },
  {
    id: "demo-0026",
    country: "ca",
    minutesAgo: 13000,
    latitude: 49.2827,
    longitude: -123.1207,
    location_label: "Vancouver, Canada",
    category: "environment",
    message:
      "Neighbours turned the boulevard strip into a pollinator garden. It took one person starting and then nobody being able to resist adding something.",
  },
];

/** Materialise the seeds into pins with timestamps relative to now. */
export function buildDemoPins(): KindnessPin[] {
  const now = Date.now();
  return SEEDS.map((seed) => ({
    id: seed.id,
    created_at: new Date(now - seed.minutesAgo * 60_000).toISOString(),
    latitude: seed.latitude,
    longitude: seed.longitude,
    location_label: seed.location_label,
    country_code: seed.country,
    category: seed.category,
    message: seed.message,
    chain_parent_id: null,
    approved: true,
  }));
}
