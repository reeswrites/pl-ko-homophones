import React from "react";
import { TBL, FEAT_NAMES } from "./phonology.js";

/* ===== concept artwork: single-weight line drawings, 24×24, currentColor ===== */
const DOT = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;

const ART = {
  pain: '<path d="m12 2.5 2 5.5 5-2-3 4.5 4.5 2.5-5 1.5 2 5-5-2.5L12 21.5l-2.5-4.5-5 2.5 2-5-5-1.5L6 10.5 3 6l5 2z"/>',
  punishment: '<path d="m5 19 9-9"/><path d="M11.5 4.5 19 12l-2.5 2.5L9 7z"/><path d="M4 20.5h5"/>',
  medicine: '<path d="M14.5 3.5a5 5 0 0 1 7 7l-7.5 7.5a5 5 0 0 1-7-7z" transform="rotate(0 12 12)"/><path d="m10.5 7.5 6.5 6.5"/>',
  country: '<path d="M6 21V3"/><path d="M6 4h13l-2.5 4 2.5 4H6z"/>',
  two: '<path d="M8.5 4.5v15M15.5 4.5v15"/>',
  four: '<path d="M6 4.5v15M10 4.5v15M14 4.5v15M18 4.5v15"/>',
  light: '<path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5.2 5.2 7 7M17 17l1.8 1.8M18.8 5.2 17 7M7 17l-1.8 1.8"/>',
  honey: '<path d="m9 3 3 5 3-5z" opacity=".5"/><path d="M12 8 8.5 14l3.5 6 3.5-6z"/><path d="m5 10 3 5-3 5-3.5-5z"/><path d="m19 10 3 5-3 5-3.5-5z"/>',
  pot: '<path d="M4.5 9.5h15v6a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4z"/><path d="M2.5 9.5h19"/><path d="M4.5 12H2.8M19.5 12h1.7"/><path d="M9 6.5c0-1.2 1-1.8 1-3M14 6.5c0-1.2 1-1.8 1-3"/>',
  city: '<path d="M2.5 21V11h6v10M8.5 21V5h7v16M15.5 21v-7h6v7"/><path d="M11 8h1.5M11 12h1.5M11 16h1.5M4.5 14H6M4.5 17.5H6M18 17h1.5"/>',
  place: '<path d="M12 3a6.5 6.5 0 0 1 6.5 6.5c0 4.6-6.5 11.5-6.5 11.5S5.5 14.1 5.5 9.5A6.5 6.5 0 0 1 12 3z"/><path d="M12 7a2.6 2.6 0 1 1 0 5.2A2.6 2.6 0 0 1 12 7z"/>',
  laugh: '<path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z"/><path d="M7.5 13c1 3 8 3 9 0z"/><path d="M8 9.5c.7-.9 1.8-.9 2.5 0M13.5 9.5c.7-.9 1.8-.9 2.5 0"/>',
  taste: '<path d="M6 6.5c1.5-1.5 10.5-1.5 12 0 0 3-1.5 4-1.5 4"/><path d="M7.5 9c0 6 1.5 11 4.5 11s4.5-4 4.5-8c0-2-1.5-3-3-3s-2 1-2 2"/>',
  south: '<path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  horn: '<path d="M4 20c0-8 4-13 10-13 3 0 5 1.5 6 3-4 0-6 2-7.5 5S9 20 9 20z"/>',
  line: '<path d="M2.5 12h19"/>' + DOT(2.5, 12, 1.6) + DOT(21.5, 12, 1.6),
  roof: '<path d="m2 12 10-7.5L22 12"/><path d="M5 12v8h14v-8"/>',
  big: '<path d="M3 21V9h12v12z"/><path d="M15 21V3h6v18z"/>',
  forest: '<path d="M7 21v-4"/><path d="M7 17a5 5 0 0 0 0-10 5 5 0 0 0 0 10z"/><path d="M16.5 21v-5"/><path d="M16.5 16a6 6 0 0 0 0-12 6 6 0 0 0 0 12z"/>',
  water: '<path d="M2.5 8c2.7-2.2 5.3 2.2 8 0s5.3-2.2 8 0"/><path d="M2.5 13.5c2.7-2.2 5.3 2.2 8 0s5.3-2.2 8 0"/><path d="M2.5 19c2.7-2.2 5.3 2.2 8 0s5.3-2.2 8 0"/>',
  liquor: '<path d="M10 3h4v3.2l2.2 3.3V20a1 1 0 0 1-1 1H8.8a1 1 0 0 1-1-1V9.5L10 6.2z"/><path d="M7.8 13h8.4"/>',
  beer: '<path d="M6 8h9v13H6z"/><path d="M15 10.5h2.8a1.5 1.5 0 0 1 0 3H15"/><path d="M6 8c0-2 2-3 4.5-3S15 6 15 8"/><path d="M9 11.5v6M12 11.5v6"/>',
  juice: '<path d="M7.5 8h9l-1 13H8.5z"/><path d="M12 8V4.5"/><path d="M12 4.5c2.5 0 4-1 4.5-2.2"/>',
  coffee: '<path d="M5 9h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z"/><path d="M17 10.5h2.2a2.2 2.2 0 0 1 0 4.4H17"/><path d="M8.5 5.5c0-1 1-1.5 1-2.5M12 5.5c0-1 1-1.5 1-2.5"/>',
  cheese: '<path d="M3 15V9l9-4 9 4v6z"/><path d="M3 9l9 4 9-4M12 13v6"/>' + DOT(7, 12, 1) + DOT(16.5, 12.2, 1.2),
  bread: '<path d="M4 12a8 4.5 0 0 1 16 0v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M9 8.5V19M14 8.5V19"/>',
  "rice cake": '<path d="M4 10.5h16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 10.5a8 3 0 0 1 16 0"/><path d="M9 7.5v3M15 7.5v3"/>',
  groats: DOT(8, 8, 1.5) + DOT(13.5, 6.5, 1.5) + DOT(17, 10.5, 1.5) + DOT(6.5, 13.5, 1.5) + DOT(11.5, 12, 1.5) + DOT(15.5, 15.5, 1.5) + DOT(9, 18, 1.5),
  soup: '<path d="M3.5 11h17a8.5 8.5 0 0 1-8.5 8.5A8.5 8.5 0 0 1 3.5 11z"/><path d="M9 7.5c0-1.2 1-1.8 1-3M13 7.5c0-1.2 1-1.8 1-3"/>',
  kimchi: '<path d="M6 4c3 3 3 13 0 17h12c-3-4-3-14 0-17z"/><path d="M12 4.5v16M9 6.5c1.5 4 1.5 9 0 12"/>',
  cake: '<path d="M4 12h16v8H4z"/><path d="M4 12a8 3 0 0 1 16 0"/><path d="M12 8.5V6"/><path d="M12 6c1.5-1 1.5-2.5 0-3.5-1.5 1-1.5 2.5 0 3.5z"/>',
  persimmon: '<path d="M6 14a6 6 0 0 0 12 0 6 6 0 0 0-12 0z"/><path d="M12 8V5.5"/><path d="M8.5 7.5h7M9.8 6.2c1 1.3 3.4 1.3 4.4 0"/>',
  watermelon: '<path d="M3.5 8h17a8.5 8.5 0 0 1-17 0z"/><path d="M6 8a6 6 0 0 0 12 0"/>' + DOT(9.5, 11, .8) + DOT(12, 12.8, .8) + DOT(14.5, 11, .8),
  potato: '<path d="M5 13.5c-1-4 2.5-7.5 7-8s8 2 8 6-4 7.5-8.5 7.5S5.8 17 5 13.5z"/>' + DOT(10, 11.5, .8) + DOT(14.5, 14.5, .8),
  mushroom: '<path d="M3.5 12a8.5 6.5 0 0 1 17 0z"/><path d="M9.5 12v6a2.5 2.5 0 0 0 5 0v-6"/>',
  seaweed: '<path d="M5 4h14v16H5z"/><path d="M8 8c2 1.5 6 1.5 8 0M8 12c2 1.5 6 1.5 8 0M8 16c2 1.5 6 1.5 8 0"/>',
  salt: '<path d="M8 21V11.5h8V21z"/><path d="M9.5 11.5V8.5h5v3"/>' + DOT(10.6, 5.6, .75) + DOT(13.4, 5.6, .75) + DOT(12, 3.6, .75),
  gold: '<path d="M2.5 15h19l-3-5h-13z"/><path d="M6 10l2-4h8l2 4"/><path d="M8 15v4h8v-4"/>',
  stone: '<path d="M4 14.5 8 7h8l4 7.5-4 4.5H8z"/><path d="M8 7l1.5 7.5M16 7l-1.5 7.5M8 19l1.5-4.5h5L16 19"/>',
  sand: '<path d="M2.5 20h19"/><path d="M4 20c3-6 5-9 8-9s5 3 8 9"/>' + DOT(7, 16, .7) + DOT(12, 14, .7) + DOT(16.5, 16.5, .7),
  ice: '<path d="M12 2.5v19M3.7 7.2l16.6 9.6M20.3 7.2 3.7 16.8"/><path d="M9.5 5 12 7.5 14.5 5M9.5 19 12 16.5l2.5 2.5"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  night: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>' + DOT(16.5, 5, .9) + DOT(19.5, 9, .7),
  star: '<path d="m12 3 2.7 5.8 6.3.8-4.6 4.4 1.2 6.3-5.6-3.1-5.6 3.1 1.2-6.3L3 9.6l6.3-.8z"/>',
  fire: '<path d="M12 21c3.9 0 6.5-2.6 6.5-6 0-4.5-4-6-5-11-2.5 2.5-3 5-1.5 7C11 9 9 7 8 5.5 6.5 8 5.5 10.5 5.5 15c0 3.4 2.6 6 6.5 6z"/>',
  smoke: '<path d="M7 20h10"/><path d="M9 17c-2-2 0-3.5 1-5s1-3.5-.5-5"/><path d="M14 17c-2-2.5.5-4 1.5-5.5s1-3.5-.5-4.5"/>',
  shadow: '<path d="M12 3.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/><path d="M4 20.5c2.5-3 5-4.5 8-4.5s5.5 1.5 8 4.5z"/>',
  cloud: '<path d="M7 18.5h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 11.6a3.5 3.5 0 0 0 1 6.9z"/>',
  storm: '<path d="M7 14.5h10a4 4 0 0 0 .4-8A6 6 0 0 0 6 7.6a3.5 3.5 0 0 0 1 6.9z"/><path d="m13 14.5-3 4h4l-3 4"/>',
  wave: '<path d="M2.5 16.5c3-4 5-7 8.5-7s4 3.5 7 3.5c1.5 0 2.5-.7 3.5-1.7"/><path d="M2.5 20.5c3.5-1.5 5.5-1.5 9 0s6 1.5 9 0"/>',
  sea: '<path d="M2.5 13c2.7-2 5.3 2 8 0s5.3-2 8 0"/><path d="M2.5 18c2.7-2 5.3 2 8 0s5.3-2 8 0"/><path d="M9 9.5V3l7 3-7 3.5z"/>',
  river: '<path d="M8 2.5c-2 5 3 7 1 11s1 6 1 8"/><path d="M16 2.5c-2 5 3 7 1 11s1 6 1 8"/>',
  mountain: '<path d="m2.5 19.5 6-11 4 6.5 3-4.5 6 9z"/><path d="m6.6 12.3 2 1.7 2-1.5"/>',
  mountains: '<path d="m2.5 19.5 6-11 4 6.5 3-4.5 6 9z"/><path d="m6.6 12.3 2 1.7 2-1.5"/>',
  ground: '<path d="M2.5 12h19v8h-19z"/><path d="M2.5 12c3-2 5.5-2 9.5 0s6.5 2 9.5 0"/><path d="M7 15.5v2M12 16v2.5M17 15.5v2"/>',
  field: '<path d="M2.5 16.5 12 11l9.5 5.5L12 22z"/><path d="M7 8v6M12 5v9M17 8v6"/>' + DOT(7, 7, 1.3) + DOT(12, 4, 1.3) + DOT(17, 7, 1.3),
  grass: '<path d="M4 20c0-5 1.5-8 3-10M9 20c0-6 1-9.5 2.5-12M14.5 20c.5-5 2-8.5 4-10.5M20 20c-.5-3.5 0-5.5 1-7"/>',
  tree: '<path d="M12 21v-6"/><path d="M12 15a6 6 0 0 0 0-12 6 6 0 0 0 0 12z"/><path d="m12 11 3-3M12 13l-2.5-2.5"/>',
  root: '<path d="M12 3v8"/><path d="M12 11c-1.5 2-4 2.5-5 5.5M12 11c1.5 2 4 2.5 5 5.5M12 11v10"/><path d="M7 16.5c-.5 1.5-1.5 2.5-2.5 3M17 16.5c.5 1.5 1.5 2.5 2.5 3"/>',
  cat: '<path d="M5 10.5 6 4.5l4 3h4l4-3 1 6a7 7 0 0 1-14 0z"/>' + DOT(9.5, 11.5, .85) + DOT(14.5, 11.5, .85) + '<path d="M12 14v1.6M9.2 17c1.2 1 4.4 1 5.6 0"/>',
  chicken: '<path d="M8 20a5.5 5.5 0 0 1 0-11c0-3 2.5-5 5-5 2 0 3 1 3 2.5S15 9 15 9c2 1 3 3 3 5.5 0 3-2.5 5.5-5.5 5.5z"/>' + DOT(13, 7, .8) + '<path d="M17 7h3l-2 2M12 4c0-1.5-1-2-1-2"/>',
  hen: '<path d="M8 20a5.5 5.5 0 0 1 0-11c0-3 2.5-5 5-5 2 0 3 1 3 2.5S15 9 15 9c2 1 3 3 3 5.5 0 3-2.5 5.5-5.5 5.5z"/>' + DOT(13, 7, .8) + '<path d="M17 7h3l-2 2M12 4c0-1.5-1-2-1-2"/>',
  horse: '<path d="M4 20c0-5 2-8 5.5-9L14 8V5l3 2 3 .5-1.5 3L15 12c1.5 1.5 2 3.5 2 8"/><path d="M9.5 11 8 6l3 1.5"/>' + DOT(17.5, 8, .7),
  frog: '<path d="M4.5 17a7.5 7.5 0 0 1 15 0 3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3z"/><path d="M7.5 10a2.5 2.5 0 1 1 5 0M11.5 10a2.5 2.5 0 1 1 5 0"/>' + DOT(9.5, 9.5, .9) + DOT(14.5, 9.5, .9) + '<path d="M9.5 16.5c1.5 1.2 3.5 1.2 5 0"/>',
  snake: '<path d="M4 6c4 0 4 4 8 4s4-4 8-4"/><path d="M4 13c4 0 4 4 8 4s4-4 8-4"/><path d="M20 6c1.5 0 1.5 2 0 2.5"/>' + DOT(5, 13, .7),
  lion: '<path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>' + DOT(10.3, 11, .7) + DOT(13.7, 11, .7) + '<path d="M12 13v1.5M10 15.5c1 .8 3 .8 4 0"/>',
  moth: '<path d="M12 6.5v12"/><path d="M12 9.5c-3-4.5-8-3.5-8 .5s4 6.5 8 3.5"/><path d="M12 9.5c3-4.5 8-3.5 8 .5s-4 6.5-8 3.5"/><path d="m12 6.5-2.2-2.5M12 6.5l2.2-2.5"/>',
  drum: '<path d="M5 8.5h14v8a3 7 0 0 1-14 0z"/><path d="M5 8.5a7 3 0 0 1 14 0"/><path d="m6.5 10.5 11 4M17.5 10.5l-11 4"/>',
  clock: '<path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z"/><path d="M12 7v5l3.5 2.5"/>',
  key: '<path d="M8 8.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/><path d="M12 12.5h9M18 12.5v3.5M15 12.5v2.5"/>',
  book: '<path d="M4.5 4.5h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2h-6.5z"/><path d="M20 4.5h-6a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2H20z"/>',
  map: '<path d="m2.5 6.5 6.5-3 6 3 6.5-3v14l-6.5 3-6-3-6.5 3z"/><path d="M9 3.5v14M15 6.5v14"/>',
  house: '<path d="m2.5 11 9.5-7.5 9.5 7.5"/><path d="M5.5 9v11h13V9"/><path d="M10 20v-6h4v6"/>',
  wall: '<path d="M3 6h18v12H3z"/><path d="M3 12h18M9 6v6M15 12v6M15 6v0M6 12v6M12 12v6M18 12v6M12 6v6"/>',
  "wall (brick)": '<path d="M3 6h18v12H3z"/><path d="M3 12h18M9 6v6M15 6v6M6 12v6M12 12v6M18 12v6"/>',
  floor: '<path d="M2.5 20 12 8l9.5 12z"/><path d="M6 15.5h12M8.5 12h7"/>',
  door: '<path d="M6 3h12v18H6z"/><path d="M6 21h12"/>' + DOT(15, 12.5, 1),
  window: '<path d="M4 4h16v16H4z"/><path d="M12 4v16M4 12h16"/>',
  cinema: '<path d="M3 7.5h13v9H3z"/><path d="m16 11 5-3v8l-5-3z"/>' + DOT(6.5, 5, 1.6) + DOT(11.5, 5, 1.6),
  shop: '<path d="M4 9.5h16V20H4z"/><path d="M3 9.5 5 4h14l2 5.5"/><path d="M9 20v-6h6v6"/>',
  "cash desk": '<path d="M3 10.5h18V20H3z"/><path d="M6 10.5V6h12v4.5"/><path d="M9 15h6"/>' + DOT(12, 8, 1),
  money: '<path d="M2.5 7.5h19v9h-19z"/><path d="M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/><path d="M6 7.5v9M18 7.5v9"/>',
  price: '<path d="M12.5 3H21v8.5l-9.5 9.5L3 12.5z"/>' + DOT(17.5, 6.5, 1.1),
  ticket: '<path d="M3 7h18v3.5a1.5 1.5 0 0 0 0 3V17H3v-3.5a1.5 1.5 0 0 0 0-3z"/><path d="M13 7v2M13 13v2M13 16v1"/>',
  bag: '<path d="M4.5 8h15l-1 12h-13z"/><path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2"/>',
  hat: '<path d="M6.5 13V6.5A2.5 2.5 0 0 1 9 4h6a2.5 2.5 0 0 1 2.5 2.5V13"/><path d="M3 13h18v2.5H3z"/>',
  cap: '<path d="M4 15a8 8 0 0 1 16 0z"/><path d="M20 15h1.5v2H4v-2"/>',
  shoes: '<path d="M3 12h5l3.5 3H19a2 2 0 0 1 2 2v2H3z"/><path d="M3 12v7"/><path d="m8 12 1.5 1.5M11 13.5l1.5 1.5"/>',
  "dress shoes": '<path d="M3 12h5l3.5 3H19a2 2 0 0 1 2 2v2H3z"/><path d="M3 12v7M6 15.5h2"/>',
  wardrobe: '<path d="M4.5 3h15v18h-15z"/><path d="M12 3v18"/>' + DOT(10, 12, .9) + DOT(14, 12, .9),
  string: '<path d="M4 6c3 0 3 4 6 4s3-4 6-4 3 4 4 4"/><path d="M4 17c3 0 3-4 6-4s3 4 6 4 3-4 4-4"/>',
  soul: '<path d="M12 20.5c-4 0-7-3.5-7-8s3-9 7-9 7 4.5 7 9-3 8-7 8z"/><path d="M9 11c1 1.5 5 1.5 6 0"/>',
  god: '<path d="M12 2.5v19M4.5 9h15"/><path d="M12 2.5a4 4 0 0 0 0 8 4 4 0 0 0 0-8z" opacity=".35"/>',
  heart: '<path d="M12 20.5S3.5 15 3.5 9.2A4.7 4.7 0 0 1 12 6.5a4.7 4.7 0 0 1 8.5 2.7c0 5.8-8.5 11.3-8.5 11.3z"/>',
  hand: '<path d="M8 12V5.5a1.5 1.5 0 0 1 3 0V11m0-.5V4a1.5 1.5 0 0 1 3 0v7m0-.5V5.5a1.5 1.5 0 0 1 3 0V13"/><path d="M8 12V9.5a1.5 1.5 0 0 0-3 0V15a6 6 0 0 0 6 6h1.5a5.5 5.5 0 0 0 5.5-5.5V13"/>',
  leg: '<path d="M9 3v7c0 3-2 4-2 7.5 0 2 1 3.5 1 3.5"/><path d="M15 3v7c0 3 2 4 2 7.5 0 2-1 3.5-1 3.5"/><path d="M9 3h6"/>',
  head: '<path d="M12 3a7 7 0 0 1 7 7v3h-2v3.5a2 2 0 0 1-2 2h-1V21H9v-4.5a7 7 0 0 1-2-4.5v-2a7 7 0 0 1 5-7z"/>' + DOT(14.5, 10.5, .8),
  finger: '<path d="M10 20V8a2 2 0 0 1 4 0v12z"/><path d="M10 12h4M10 16h4"/>',
  back: '<path d="M12 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/><path d="M8.5 21v-6l-2-2.5V10a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2.5L15.5 15v6"/>',
  dot: DOT(12, 12, 4),
  three: '<path d="M6.5 4.5v15M12 4.5v15M17.5 4.5v15"/>',
  one: '<path d="M12 4.5v15"/>',
  five: '<path d="M4.5 5v10M8.5 5v10M12.5 5v10M16.5 5v10"/><path d="m3 17 15-5"/>',
  seven: '<path d="M4.5 6v9M8.5 6v9M12.5 6v9M16.5 6v9M20.5 6v9"/><path d="m3 17.5 18-3"/>',
  half: '<path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z"/><path d="M12 3.5v17"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" opacity=".25" stroke="none"/>',
  thousand: DOT(6, 6, 1.2) + DOT(12, 6, 1.2) + DOT(18, 6, 1.2) + DOT(6, 12, 1.2) + DOT(12, 12, 1.2) + DOT(18, 12, 1.2) + DOT(6, 18, 1.2) + DOT(12, 18, 1.2) + DOT(18, 18, 1.2),
  colour: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.9-1 1.4-1.9-.9-1.6.3-3.1 2-3.1h1.6a3.5 3.5 0 0 0 3.5-3.5c0-4.7-3.8-8.5-8.5-8.5z"/>' + DOT(8, 10, 1.1) + DOT(12, 7.5, 1.1) + DOT(16, 10, 1.1),
  purple: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.9-1 1.4-1.9-.9-1.6.3-3.1 2-3.1h1.6a3.5 3.5 0 0 0 3.5-3.5c0-4.7-3.8-8.5-8.5-8.5z"/>' + DOT(8, 10, 1.1) + DOT(12, 7.5, 1.1),
  grey: '<path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z"/><path d="M12 3.5v17"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor" opacity=".3" stroke="none"/>',
  train: '<path d="M6 3.5h12a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2z"/><path d="M4 9h16"/>' + DOT(8, 13, 1.1) + DOT(16, 13, 1.1) + '<path d="m7 17-2 3.5M17 17l2 3.5"/>',
  post: '<path d="M2.5 6h19v12h-19z"/><path d="m2.5 6.5 9.5 7 9.5-7"/>',
  goal: '<path d="M3.5 6.5h17v11h-17z"/><path d="M7 6.5v11M11 6.5v11M15 6.5v11M17 6.5v11M3.5 10h17M3.5 14h17"/>',
  dance: '<path d="M14 3.5a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z"/><path d="m14 7.5-3 4 2.5 3.5-1 6M11 11.5 6.5 10M13.5 15 9 20"/>',
  silence: '<path d="M11 4 6.5 8H3v8h3.5L11 20z"/><path d="m15.5 9.5 5 5M20.5 9.5l-5 5"/>',
  wound: '<path d="m8 4 3 4-2.5 3.5L11 15l-2 5"/><path d="M14.5 6.5 17 10l-2 3 2.5 3"/>',
  "old woman": '<path d="M12 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 4z"/><path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5z"/><path d="M8.5 6.5c1-1.5 6-1.5 7 0"/>',
  grandmother: '<path d="M12 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 4z"/><path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5z"/><path d="M8.5 6.5c1-1.5 6-1.5 7 0"/>',
  grandfather: '<path d="M12 3.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z"/><path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5z"/><path d="M10 11c.6 2 3.4 2 4 0"/>',
  mother: '<path d="M12 3.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z"/><path d="M5.5 21c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5z"/><path d="M9 16.5a2.2 2.2 0 1 1 4.4 0"/>',
  dad: '<path d="M12 3.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z"/><path d="M5.5 21c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5z"/><path d="M15.5 16.5a2 2 0 1 1 4 0V21"/>',
  mister: '<path d="M12 3.5a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z"/><path d="M5.5 21c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5z"/><path d="m12 14.5-1.5 3 1.5 1.5 1.5-1.5z"/>',
  madam: '<path d="M12 3.5a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8z"/><path d="M5 21c0-4.5 3-7 7-7s7 2.5 7 7z"/><path d="M8.5 6c1.2-1.8 5.8-1.8 7 0"/>',
  son: '<path d="M12 5a2.8 2.8 0 1 1 0 5.6A2.8 2.8 0 0 1 12 5z"/><path d="M7 21c0-3.5 2.2-5.8 5-5.8s5 2.3 5 5.8z"/>',
  daughter: '<path d="M12 5a2.8 2.8 0 1 1 0 5.6A2.8 2.8 0 0 1 12 5z"/><path d="M7 21c0-3.5 2.2-5.8 5-5.8s5 2.3 5 5.8z"/><path d="M9.5 6.5c1-1.2 4-1.2 5 0"/>',
  aunt: '<path d="M12 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 4z"/><path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5z"/><path d="M9 6c.8-1.3 5.2-1.3 6 0"/>',
  wife: '<path d="M12 4a3.2 3.2 0 1 1 0 6.4A3.2 3.2 0 0 1 12 4z"/><path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5z"/>' + DOT(17, 6, 1),
  "rich person": '<path d="M12 3.5a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4z"/><path d="M6 21c0-4 2.7-6.5 6-6.5s6 2.5 6 6.5z"/><path d="M17 4.5h4M19 2.5v4"/>',
  alone: '<path d="M12 4a3.4 3.4 0 1 1 0 6.8A3.4 3.4 0 0 1 12 4z"/><path d="M6 21c0-4.2 2.7-6.8 6-6.8s6 2.6 6 6.8z"/><path d="M2.5 3.5v4M21.5 3.5v4"/>',
  dream: '<path d="M4 15c0-3 2.5-5 5.5-5 .5-3 3-5 5.5-5 3 0 5 2.5 5 5.5S17.5 16 14 16H8a4 4 0 0 1-4-1z"/>' + DOT(9, 20, .8) + DOT(13, 20.5, 1) + DOT(17, 20, .8),
  time: '<path d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z"/><path d="M12 7.5V12l3 2"/>',
  week: '<path d="M3.5 5.5h17v15h-17z"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>' + DOT(8, 14, 1) + DOT(12, 14, 1) + DOT(16, 14, 1),
  day: '<path d="M12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/>',
  spring: '<path d="M12 21v-8"/><path d="M12 13a4 4 0 0 0 4-4 4 4 0 0 0-4 4 4 4 0 0 0-4-4 4 4 0 0 0 4 4z"/><path d="M12 13c0-3 1.5-5 4-6"/>',
  lyrics: '<path d="M9 18V6l9-2v12"/><path d="M6 15a3 3 0 1 1 3 3M15 13a3 3 0 1 1 3 3"/>',
  cinema2: '',
};

const SYN = {
  quiet: "silence", "to be hot": "fire", "to get wet": "water", winter: "ice",
  daytime: "day", hotel: "house", writing: "book", "to laugh": "laugh",
  "to cry": "wound", summer: "day", autumn: "tree", "to be small": "big",
  "to be long": "line", "to be short": "line", thin: "line", full: "pot",
  "to be empty": "pot", flesh: "taste", roof: "roof", power: "pain",
  "north": "south", "east": "south", "west": "south", "flour": "groats",
  "rice": "groats", "uncooked rice": "groats", "sugar": "salt", "oil": "juice",
  "egg": "persimmon", "meat": "horse", "fish": "wave", "apple": "persimmon",
  "spoon": "pot", "chopsticks": "string", "plate": "soup", "onion": "potato",
  "garlic": "potato", "carrot": "root", "cabbage": "kimchi",
  "to know": "head", "to think": "head", "thought": "head", "memory": "head",
  "to speak": "lyrics", "voice": "lyrics", "sound": "lyrics",
  "to work": "hand", "work": "hand", "job": "hand", "office": "house",
  "school": "book", "hospital": "medicine", "illness": "medicine",
  "health": "heart", "death": "shadow", "war": "punishment", "peace": "spring",
  "army": "punishment", "police": "punishment", "law": "book", "truth": "light",
  "hope": "star", "joy": "laugh", "sadness": "wound", "fear": "shadow",
  "anger": "fire", "feeling": "heart", "mind": "head", "spirit": "soul",
  "to sleep": "dream", "to see": "head", "to drink": "juice", "to eat": "soup",
  "to write": "book", "to read": "book", "to walk": "leg", "to stand": "leg",
  "to go": "leg", "to buy": "money", "to give": "hand", "to receive": "hand",
  "to love": "heart", "to hear": "silence", "to do": "hand", "to die": "shadow",
  "cheese ": "cheese", "pair": "three", "hundred": "thousand", "leg; bridge": "leg",
  "downtown": "house", "company": "house", "shop": "shop", "account": "money",
  "life": "heart", "strength": "hand", "soul ": "soul", "temple": "god",
  "wine": "liquor", "milk": "juice", "tea": "coffee", "snow": "ice", "rain": "cloud",
  "wind": "wave", "flower": "spring", "leaf": "tree", "bird": "chicken",
  "cow": "horse", "pig": "horse", "sheep": "horse", "dog": "cat", "mouse": "cat",
  "wolf": "cat", "fox": "cat", "bear": "lion", "tiger": "lion", "butterfly": "moth",
  "bee": "moth", "sky": "cloud", "sun": "day", "moon; month": "moon",
  "boy": "son", "girl": "daughter", "child": "son", "baby": "son",
  "woman": "madam", "man": "mister", "person": "mister", "friend": "mister",
  "neighbour": "mister", "guest": "mister", "owner": "mister", "doctor": "mister",
  "bowl": "soup", "cup": "coffee", "bottle": "liquor", "knife": "wound",
  "chair": "wardrobe", "bed": "wardrobe", "table": "wardrobe", "room": "house",
  "church": "god", "prayer": "god", "song": "lyrics", "music": "lyrics",
  "picture": "map", "photograph": "map", "film": "cinema", "clothes": "wardrobe",
  "trousers": "shoes", "skirt": "shoes", "socks": "shoes", "gloves": "hand",
  "wallet": "money", "road": "field", "bridge": "river", "ship": "wave",
  "bicycle": "train", "airplane": "cloud", "travel": "map", "journey": "map",
  "letter": "post", "newspaper": "book", "name": "book", "word": "lyrics",
  "eye": "head", "nose": "head", "ear": "silence", "mouth": "head",
  "tooth": "head", "blood": "wound", "bone": "wound", "hair": "head",
  "face": "head", "body": "back", "neck": "back", "chest": "back",
  "iron": "gold", "silver": "gold", "glass": "window", "paper": "book",
  "needle": "string", "thread": "string", "ball": "goal", "game": "goal",
};

function artFor(gloss) {
  const g = gloss.split(/[,;]/)[0].trim().toLowerCase();
  return ART[g] || ART[SYN[g]] || null;
}

/* Fallback: a picture of the SOUND rather than the sense — sonority contour */
function sonority(p) {
  const f = TBL[p];
  if (!f) return 1;
  const ix = (n) => f[FEAT_NAMES.indexOf(n)];
  if (ix("syl") > 0) return ix("low") > 0 ? 6 : 5;
  if (ix("cons") < 0) return 4.2;
  if (ix("lat") > 0 || p === "r" || p === "ɾ") return 3.4;
  if (ix("nas") > 0) return 2.8;
  if (ix("cont") > 0) return ix("voi") > 0 ? 2 : 1.6;
  return ix("voi") > 0 ? 1.1 : 0.7;
}

function SonorityMark({ ph }) {
  const pts = ph.map((p, i) => {
    const x = ph.length === 1 ? 12 : 3 + (i * 18) / (ph.length - 1);
    return [x, 21 - (sonority(p) / 6) * 15];
  });
  const d = pts.map(([x, y], i) => (i ? `L${x.toFixed(1)} ${y.toFixed(1)}` : `M${x.toFixed(1)} ${y.toFixed(1)}`)).join("");
  return (
    <svg viewBox="0 0 24 24" className="hf-art" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} opacity=".75" />
      {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill="currentColor" stroke="none" />)}
      <path d="M2 21.8h20" opacity=".2" />
    </svg>
  );
}

function Art({ gloss, ph }) {
  const a = artFor(gloss);
  if (!a) return <SonorityMark ph={ph} />;
  return (
    <svg viewBox="0 0 24 24" className="hf-art" fill="none" stroke="currentColor"
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: a }} />
  );
}

const headGloss = (g) => g.split(/[,;]/)[0].trim();

export { ART, SYN, artFor, sonority, SonorityMark, Art, headGloss };
