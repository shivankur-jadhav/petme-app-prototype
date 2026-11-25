// Real photos of every species in the app, bundled so they show instantly and offline.
// Source: iNaturalist. Only photos whose licence allows commercial use (CC0, CC BY, CC BY-SA) are
// used. CC BY and CC BY-SA require crediting the photographer, so keep PhotoCredits visible wherever
// these photos appear. Cropped to 240 x 240.
// Generated from iNaturalist metadata; to swap a photo, replace assets/species/<art>.jpg and its entry.

export type BundledPhoto = { src: number; credit: string; license: string; source: string; taxon: string };

export const SPECIES_PHOTOS: Record<string, BundledPhoto> = {
  "clown": { src: require("../assets/species/clown.jpg"), credit: "Ditch Townsend", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/363228268", taxon: "Amphiprion ocellaris" },
  "goby": { src: require("../assets/species/goby.jpg"), credit: "klukoff", license: "CC BY", source: "https://www.inaturalist.org/photos/138375998", taxon: "Cryptocentrus cinctus" },
  "cardinal": { src: require("../assets/species/cardinal.jpg"), credit: "Dan Schofield", license: "CC BY", source: "https://www.inaturalist.org/photos/53953454", taxon: "Pterapogon kauderni" },
  "cleaner": { src: require("../assets/species/cleaner.jpg"), credit: "KKPCW", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/58465202", taxon: "Lysmata amboinensis" },
  "turbo": { src: require("../assets/species/turbo.jpg"), credit: "Alberto Alcal\u00e1", license: "CC BY", source: "https://www.inaturalist.org/photos/470394228", taxon: "Turbo fluctuosus" },
  "neon": { src: require("../assets/species/neon.jpg"), credit: "Melqkov", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/71484037", taxon: "Paracheirodon innesi" },
  "panda": { src: require("../assets/species/panda.jpg"), credit: "Artem Abdukakharov", license: "CC BY", source: "https://www.inaturalist.org/photos/757230415", taxon: "Hoplisoma panda" },
  "pleco": { src: require("../assets/species/pleco.jpg"), credit: "JanRehschuh", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/135644440", taxon: "Ancistrus" },
  "amano": { src: require("../assets/species/amano.jpg"), credit: "Dornenwolf", license: "CC BY", source: "https://www.inaturalist.org/photos/84969366", taxon: "Caridina multidentata" },
  "nerite": { src: require("../assets/species/nerite.jpg"), credit: "Diego Gonz\u00e1lez Dopico", license: "CC BY", source: "https://www.inaturalist.org/photos/429692646", taxon: "Vittina natalensis" },
  "firefish": { src: require("../assets/species/firefish.jpg"), credit: "Pauline Walsh Jacobson", license: "CC BY", source: "https://www.inaturalist.org/photos/295004002", taxon: "Nemateleotris magnifica" },
  "gramma": { src: require("../assets/species/gramma.jpg"), credit: "Pauline Walsh Jacobson", license: "CC BY", source: "https://www.inaturalist.org/photos/525221328", taxon: "Gramma loreto" },
  "mandarin": { src: require("../assets/species/mandarin.jpg"), credit: "Lakshmi Sawitri", license: "CC BY", source: "https://www.inaturalist.org/photos/235301873", taxon: "Synchiropus splendidus" },
  "coralbeauty": { src: require("../assets/species/coralbeauty.jpg"), credit: "Roger Rittmaster", license: "CC BY", source: "https://www.inaturalist.org/photos/32922569", taxon: "Centropyge bispinosa" },
  "rasbora": { src: require("../assets/species/rasbora.jpg"), credit: "Stefan Maurer", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/332519654", taxon: "Trigonostigma heteromorpha" },
  "gourami": { src: require("../assets/species/gourami.jpg"), credit: "Antoondommerholt", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/96911305", taxon: "Trichogaster chuna" },
  "otocinclus": { src: require("../assets/species/otocinclus.jpg"), credit: "Chle", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/271075125", taxon: "Otocinclus vittatus" },
  "kuhli": { src: require("../assets/species/kuhli.jpg"), credit: "Iidkk", license: "CC BY-SA", source: "https://www.inaturalist.org/photos/343903247", taxon: "Pangio kuhlii" },
};
