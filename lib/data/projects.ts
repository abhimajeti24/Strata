export interface Project {
  index: string;
  title: string;
  year: string;
  location: string;
  category: string;
  coords: string;
  image: string;
  alt: string;
}

export const projects: Project[] = [
  {
    index: "01",
    title: "Cadence House",
    year: "2024",
    location: "Bengaluru, IN",
    category: "Private Residence",
    coords: "12.9716° N, 77.5946° E",
    image: "/images/cadence.jpg",
    alt: "Stacked white concrete volumes of Cadence House against an open sky",
  },
  {
    index: "02",
    title: "The Quiet Terminal",
    year: "2023",
    location: "Singapore, SG",
    category: "Civic / Transit",
    coords: "1.3644° N, 103.9915° E",
    image: "/images/terminal.jpg",
    alt: "Curved banded concourse towers framing a shaft of daylight",
  },
  {
    index: "03",
    title: "Saltline Pavilion",
    year: "2025",
    location: "Goa, IN",
    category: "Cultural Pavilion",
    coords: "15.2993° N, 74.1240° E",
    image: "/images/saltline.jpg",
    alt: "Ribbed board-formed concrete shells of Saltline Pavilion meeting overhead",
  },
  {
    index: "04",
    title: "Meridian Courtyard",
    year: "2022",
    location: "Kuala Lumpur, MY",
    category: "Workplace",
    coords: "3.1390° N, 101.6869° E",
    image: "/images/meridian.jpg",
    alt: "Towers of Meridian Courtyard rising into fog, seen from the court floor",
  },
  {
    index: "05",
    title: "Stackhouse",
    year: "2021",
    location: "Ahmedabad, IN",
    category: "Mixed Use",
    coords: "23.0225° N, 72.5714° E",
    image: "/images/stackhouse.jpg",
    alt: "Woven metal facade of Stackhouse curving against the sky",
  },
];

export const featured = {
  title: ["Saltline", "Pavilion"],
  coordsN: "15.2993° N",
  coordsE: "74.1240° E",
  image: "/images/featured.jpg",
  alt: "Saltline Pavilion, board-formed concrete shells in low sea light",
  spec: [
    ["Client", "Goa State Arts Trust"],
    ["Area", "1,860 sqm"],
    ["Status", "Completed 2025"],
    ["Material", "Board-formed concrete, teak"],
  ] as const,
};
