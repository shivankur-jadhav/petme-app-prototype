// Real photos of every species in the app, bundled so they show instantly and offline.
// Source: iNaturalist. Only photos whose licence allows commercial use (CC0, CC BY, CC BY-SA) are
// used. CC BY and CC BY-SA require crediting the photographer, so keep PhotoCredits visible wherever
// these photos appear. Tiles use a 360 x 360 crop; the full-screen viewer uses the whole photo up to
// 1200px (assets/species-large), both with light camera-style levels and sharpening.
// Generated from iNaturalist metadata; to swap a photo, replace assets/species/<art>.jpg and its entry.

/** `src`: 360px square crop for tiles. `large`: the full photo, up to 1200px, for the full-screen viewer. */
export type BundledPhoto = { src: number; large: number; credit: string; license: string; source: string; taxon: string };

export const SPECIES_PHOTOS: Record<string, BundledPhoto> = {
  "clown": { src: require("../assets/species/clown.jpg"), large: require("../assets/species-large/clown.jpg"), credit: "Ditch Townsend", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/363228268", taxon: "Amphiprion ocellaris" },
  "goby": { src: require("../assets/species/goby.jpg"), large: require("../assets/species-large/goby.jpg"), credit: "klukoff", license: "CC BY", source: "https://www.inaturalist.org/photos/138375998", taxon: "Cryptocentrus cinctus" },
  "cardinal": { src: require("../assets/species/cardinal.jpg"), large: require("../assets/species-large/cardinal.jpg"), credit: "Dan Schofield", license: "CC BY", source: "https://www.inaturalist.org/photos/53953454", taxon: "Pterapogon kauderni" },
  "cleaner": { src: require("../assets/species/cleaner.jpg"), large: require("../assets/species-large/cleaner.jpg"), credit: "KKPCW", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/58465202", taxon: "Lysmata amboinensis" },
  "turbo": { src: require("../assets/species/turbo.jpg"), large: require("../assets/species-large/turbo.jpg"), credit: "Alberto Alcal\u00e1", license: "CC BY", source: "https://www.inaturalist.org/photos/470394228", taxon: "Turbo fluctuosus" },
  "neon": { src: require("../assets/species/neon.jpg"), large: require("../assets/species-large/neon.jpg"), credit: "Melqkov", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/71484037", taxon: "Paracheirodon innesi" },
  "panda": { src: require("../assets/species/panda.jpg"), large: require("../assets/species-large/panda.jpg"), credit: "Artem Abdukakharov", license: "CC BY", source: "https://www.inaturalist.org/photos/757230415", taxon: "Hoplisoma panda" },
  "pleco": { src: require("../assets/species/pleco.jpg"), large: require("../assets/species-large/pleco.jpg"), credit: "JanRehschuh", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/135644440", taxon: "Ancistrus" },
  "amano": { src: require("../assets/species/amano.jpg"), large: require("../assets/species-large/amano.jpg"), credit: "Dornenwolf", license: "CC BY", source: "https://www.inaturalist.org/photos/84969366", taxon: "Caridina multidentata" },
  "nerite": { src: require("../assets/species/nerite.jpg"), large: require("../assets/species-large/nerite.jpg"), credit: "Diego Gonz\u00e1lez Dopico", license: "CC BY", source: "https://www.inaturalist.org/photos/429692646", taxon: "Vittina natalensis" },
  "firefish": { src: require("../assets/species/firefish.jpg"), large: require("../assets/species-large/firefish.jpg"), credit: "Pauline Walsh Jacobson", license: "CC BY", source: "https://www.inaturalist.org/photos/295004002", taxon: "Nemateleotris magnifica" },
  "gramma": { src: require("../assets/species/gramma.jpg"), large: require("../assets/species-large/gramma.jpg"), credit: "Pauline Walsh Jacobson", license: "CC BY", source: "https://www.inaturalist.org/photos/525221328", taxon: "Gramma loreto" },
  "mandarin": { src: require("../assets/species/mandarin.jpg"), large: require("../assets/species-large/mandarin.jpg"), credit: "Lakshmi Sawitri", license: "CC BY", source: "https://www.inaturalist.org/photos/235301873", taxon: "Synchiropus splendidus" },
  "coralbeauty": { src: require("../assets/species/coralbeauty.jpg"), large: require("../assets/species-large/coralbeauty.jpg"), credit: "Roger Rittmaster", license: "CC BY", source: "https://www.inaturalist.org/photos/32922569", taxon: "Centropyge bispinosa" },
  "rasbora": { src: require("../assets/species/rasbora.jpg"), large: require("../assets/species-large/rasbora.jpg"), credit: "Stefan Maurer", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/332519654", taxon: "Trigonostigma heteromorpha" },
  "gourami": { src: require("../assets/species/gourami.jpg"), large: require("../assets/species-large/gourami.jpg"), credit: "Antoondommerholt", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/96911305", taxon: "Trichogaster chuna" },
  "otocinclus": { src: require("../assets/species/otocinclus.jpg"), large: require("../assets/species-large/otocinclus.jpg"), credit: "Kaden Slone", license: "CC BY", source: "https://www.inaturalist.org/photos/325240362", taxon: "Otocinclus vittatus" },
  "kuhli": { src: require("../assets/species/kuhli.jpg"), large: require("../assets/species-large/kuhli.jpg"), credit: "Iidkk", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/343903247", taxon: "Pangio kuhlii" },
};
