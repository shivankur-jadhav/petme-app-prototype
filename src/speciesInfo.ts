// Plain-language profile for every species in the app, shown when a fish photo is tapped.
// Keyed by the same `art` id as the photos in src/speciesPhotos.ts (Critter.art / Idea.id).
// Sizes are typical adult sizes in aquariums; care is the hobby's usual difficulty rating.

export type Care = "Easy" | "Moderate" | "Experienced keepers";
export type SpeciesInfo = { sci: string; size: string; origin: string; care: Care; about: string };

export const SPECIES_INFO: Record<string, SpeciesInfo> = {
  /* ---- saltwater, current livestock ---- */
  clown: {
    sci: "Amphiprion ocellaris", size: "Up to 11 cm", origin: "Indo-Pacific reefs", care: "Easy",
    about: "The classic orange-and-white clownfish. Most sold today are captive-bred, which makes them hardy and calm. They often adopt an anemone, a coral or even a pump as home, but they don't need an anemone to thrive. Eats flakes, pellets and frozen foods.",
  },
  goby: {
    sci: "Cryptocentrus cinctus", size: "Up to 10 cm", origin: "Western Pacific", care: "Easy",
    about: "Spends the day perched at the mouth of a sand burrow, often shared with a pistol shrimp that digs while the goby keeps watch. Needs a sandy bottom and a tight lid, because a startled goby can jump.",
  },
  cardinal: {
    sci: "Pterapogon kauderni", size: "Up to 8 cm", origin: "Banggai Islands, Indonesia", care: "Easy",
    about: "A slow, elegant fish found in the wild only around one small island group in Indonesia, where it is endangered, so captive-bred fish are the right choice. Males carry the eggs and young in their mouth. Calm with most tankmates.",
  },
  cleaner: {
    sci: "Lysmata amboinensis", size: "Up to 6 cm", origin: "Indo-Pacific", care: "Moderate",
    about: "Runs a cleaning station: fish line up and it picks parasites and dead skin off them. Sensitive to copper medication and sudden salinity changes, so it is acclimated slowly. It moults every few weeks, and the empty shell left behind is normal.",
  },
  turbo: {
    sci: "Turbo fluctuosus", size: "Up to 5 cm", origin: "Eastern Pacific", care: "Easy",
    about: "A heavy-duty algae grazer that clears hair algae from rock and glass. It can knock over loose rock, and if it falls on its back on sand it may not right itself, so check on it. Needs enough algae to eat.",
  },
  /* ---- freshwater, current livestock ---- */
  neon: {
    sci: "Paracheirodon innesi", size: "Up to 4 cm", origin: "Amazon basin", care: "Easy",
    about: "A small schooling fish with a glowing blue-and-red stripe. Happiest in a group of ten or more, with plants and soft, slightly acidic water. Peaceful with other small fish.",
  },
  panda: {
    sci: "Corydoras panda", size: "Up to 5 cm", origin: "Peru", care: "Easy",
    about: "A small armoured catfish with black eye patches like a panda. Lives in groups of six or more and sifts the bottom with its whiskers, so soft sand keeps it healthy. It does not eat waste and needs its own sinking food.",
  },
  pleco: {
    sci: "Ancistrus sp.", size: "Up to 13 cm", origin: "South America", care: "Easy",
    about: "A compact algae-eating catfish; adult males grow soft bristles on the snout. It rasps algae, needs driftwood in the tank and enjoys vegetables like zucchini. Stays far smaller than the common pleco.",
  },
  amano: {
    sci: "Caridina multidentata", size: "Up to 5 cm", origin: "Japan and Taiwan", care: "Easy",
    about: "One of the best algae-eating shrimp, made famous by the aquascaper Takashi Amano. Peaceful and busy all day. Its young need brackish water to grow, so it won't overrun a freshwater tank.",
  },
  nerite: {
    sci: "Vittina natalensis", size: "Up to 2.5 cm", origin: "East Africa", care: "Easy",
    about: "A striped snail that grazes algae off glass, rock and leaves without harming plants. It may lay small white eggs on hard surfaces; they won't hatch in freshwater. Keep a lid on, because nerites sometimes climb out.",
  },
  /* ---- saltwater suggestions ---- */
  firefish: {
    sci: "Nemateleotris magnifica", size: "Up to 9 cm", origin: "Indo-Pacific", care: "Easy",
    about: "Hovers just above the rocks, flicking its long front fin, and darts into a hole when startled. Peaceful and safe with corals. Keep a lid on the tank, because firefish are known jumpers.",
  },
  gramma: {
    sci: "Gramma loreto", size: "Up to 8 cm", origin: "Caribbean", care: "Easy",
    about: "Half purple, half yellow, and very hardy. It claims a cave or overhang and often swims upside down under ledges. Keep one per tank, as two will fight.",
  },
  mandarin: {
    sci: "Synchiropus splendidus", size: "Up to 7 cm", origin: "Western Pacific", care: "Experienced keepers",
    about: "One of the most colourful fish in the hobby. It picks tiny live copepods off the rocks almost all day, so it needs a mature tank with plenty of live rock, or a keeper willing to train it onto frozen food.",
  },
  coralbeauty: {
    sci: "Centropyge bispinosa", size: "Up to 10 cm", origin: "Indo-Pacific", care: "Moderate",
    about: "A small angelfish in deep blue and orange. Hardy and active, but it may nip at some soft and LPS corals, so it suits fish-focused tanks or reefs with tougher corals.",
  },
  /* ---- freshwater suggestions ---- */
  rasbora: {
    sci: "Trigonostigma heteromorpha", size: "Up to 5 cm", origin: "Southeast Asia", care: "Easy",
    about: "A calm, copper-coloured schooling fish with a black triangle near the tail. Keep eight or more for the best colour and behaviour. Great with plants and other peaceful fish.",
  },
  gourami: {
    sci: "Trichogaster chuna", size: "Up to 5 cm", origin: "India and Bangladesh", care: "Easy",
    about: "A gentle centrepiece fish; males turn honey-gold with a dark throat. Likes floating plants and slow-moving water, and is shy around boisterous tankmates.",
  },
  otocinclus: {
    sci: "Otocinclus vittatus", size: "Up to 5 cm", origin: "South America", care: "Moderate",
    about: "A tiny catfish that cleans algae off glass and leaves. Delicate when new, so it should only go into a stable, mature tank, in a group of four or more.",
  },
  kuhli: {
    sci: "Pangio kuhlii", size: "Up to 10 cm", origin: "Southeast Asia", care: "Easy",
    about: "A shy, eel-like loach with orange and dark bands. It burrows and comes out mostly in dim light, so it needs soft sand and hiding places. Keep a few together.",
  },
};
