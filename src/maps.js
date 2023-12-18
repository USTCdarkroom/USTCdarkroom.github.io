"use strict";

// 上 11 下 7, 64x22
const middleCampus = [
  '################################################################',
  '#####..........................................................#',
  '#####..........................................................#',
  '###........##############..............############........#####',
  '###........##############..............############........#####',
  '###...C........................................................#',
  '###...........................................O................#',
  '###............................................................#',
  '###............................................................#',
  '###........##############..............############............#',
  '###...T....##############..............############............#',
  '................................................................',
  '................................................................',
  '................................................................',
  '................................................................',
  '#..........##............################..................#####',
  '#..........##............################..................#####',
  '#..........##............################....G........P....#####',
  '#.....A....##.....R......################..................#####',
  '#..........##............################..................#####',
  '#..........##............################..................#####',
  '################################################################'
];

let middleVisited = new Array(22).fill().map(x => new Array(64).fill(false));

// 上 14 下 16, 64x34
const westCampus = [
  '################################################################',
  '#..............................................................#',
  '#..............................................................#',
  '#.....T...........R.......................C....................#',
  '#..............................................................#',
  '#..............................................................#',
  '#........############....############..........##..............#',
  '#...P....############....############..........##.....T........#',
  '#....................................####......##..............#',
  '#....................................####......##..............#',
  '#................................T...####......##..............#',
  '#................T........T..........####......###.............#',
  '#........##............................##........########......#',
  '#........##............................##......L.########......#',
  '#........##.....................................................',
  '#........##.....................................................',
  '#........##.....P..................##...........................',
  '#..T.....##........................##...........................',
  '#........##....####........T.......##......T.......######......#',
  '#........##....####................##..............######......#',
  '#........##....######################....######....##..........#',
  '#..C.....##....######################....######....##..........#',
  '#........................................######....##..........#',
  '#........................................######....##..........#',
  '#..................................................##..........#',
  '#..................................................##.....R....#',
  '#########................######....######..........##..........#',
  '#########................######....######..........##..........#',
  '#.................P......##............##......................#',
  '#........................##............##....G.................#',
  '#......T.................##.........T..##......................#',
  '#........................##..8.........##......................#',
  '#........................##............##......................#',
  '################################################################',
];

let westVisited = new Array(34).fill().map(x => new Array(64).fill(false));

// 上 7 下 27, 64x38
const eastCampus = [
  '################################################################',
  '###########....................................................#',
  '###########....................................................#',
  '#######....................................C...............T...#',
  '#######........................................................#',
  '#####..............################............................#',
  '#####..............################............................#',
  '...............................................######....#######',
  '............................P..................######....#######',
  '...............................................######..........#',
  '...............................................######..........#',
  '#####..............################............######..........#',
  '#####..............################.........T..######..........#',
  '#####..........................................######..........#',
  '#####..........................................######..........#',
  '#####..........................................######..........#',
  '#####.......................................T..######..........#',
  '#####..............######......######..........................#',
  '#####..............######......######..........................#',
  '#####..............##..............##..........................#',
  '#####....C.........##......T.......##.............R............#',
  '#####..............##..............##..........................#',
  '#####..............##..............##..........................#',
  '#####..............##################......############........#',
  '#####..............##################......############........#',
  '#####..............##..............##..........................#',
  '#####..............##..............##..........................#',
  '#..................##......L.......##............R.............#',
  '#..................##..............##..........................#',
  '#..............................................................#',
  '#..............................................................#',
  '#..................##################..........................#',
  '#..................##################..........................#',
  '#..................##################..........................#',
  '#....H.............##################.......P..................#',
  '#..................##################..........................#',
  '#..................##################..........................#',
  '################################################################',
];

let eastVisited = new Array(38).fill().map(x => new Array(64).fill(false));