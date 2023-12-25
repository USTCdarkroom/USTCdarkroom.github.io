"use strict";

const achieves = [
  { id: 'avoid_hit', txt: '找到别人打不到的地方。', name: '避实就虚' },
  { id: 'fist_master', txt: '空手以敌千军万马', name: '徒手战士' }
];
const advances = [
  { id: 'start', name: '新的开始' },
  { id: 'show phys', name: '初识物理' },
  { id: 'show chem', name: '初识化学' },
  { id: 'graduate', name: '顺利毕业' },
  { id: 'set off', name: '探索时光' },
  { id: 'switch campus', name: '校区穿梭' },
  { id: 'monster killer', name: '怪物猎人' },
  { id: 'meet mentor', name: '邂逅恩师' }
];
const events = [
  {
    event: "数理基础得到进一步巩固",
    opt: [{
      txt: "确认", res: () => {
        mathValue += 100;
        if (showPhys) { physValue += 100; }
      }
    }]
  }, {
    event: "美丽邂逅开始了报名",
    opt: [
      {
        txt: "参加", res: () => {
          let x = 2;
          while (restSpeed > 0 && x > 0) { restSpeed--; x--; }
          while (mathSpeed > 0 && x > 0) { mathSpeed--; x--; }
          while (physSpeed > 0 && x > 0) { physSpeed--; x--; }
          while (chemSpeed > 0 && x > 0) { chemSpeed--; x--; }
        }
      }, {
        txt: "不参加", res: () => { }
      }
    ]
  }, {
    event: "毕业学长返校开展讲座",
    opt: [
      {
        txt: "参加", res: () => {
          mathSpeed++;
          if (showPhys) { physSpeed++; }
          if (showChem) { chemSpeed++; }
        }
      }, {
        txt: "不参加", res: () => { }
      }
    ]
  }
];
const attackInfo = {
  fist: {
    char: 'o',
    interval: 1,
    damage: 4,
  },
  bow: {
    char: '>',
    interval: 2,
    damage: 12,
    cost: 'arrow',
  },
  sword: {
    char: 'x',
    interval: 1,
    damage: 6,
  },
  gun: {
    char: '-',
    interval: 2,
    damage: 25,
    cost: 'bullet',
  },
  rpg: {
    char: '*',
    interval: 2,
    damage: 50,
    cost: 'cannonball',
  },
  laser: {
    char: 'K',
    interval: 1,
    damage: 25
  }
}
// bullet 说明：
// o 空手 > 箭矢 x 剑 - 子弹 * 炮弹 K 光剑 Q 药水
const combatInfo = {
  boxer: {
    char: 'B',
    log: '一个拳击手希望比武。',
    name: '拳击手',
    minDamage: 1,
    maxDamage: 10,
    interval: 1,
    hp: 50,
    bullet: 'o',
    dodgeProb: 0.1
  },
  archer: {
    char: 'A',
    log: '墙边射出一支箭。',
    name: '弓箭手',
    minDamage: 5,
    maxDamage: 15,
    interval: 2,
    hp: 50,
    bullet: '<',
    dodgeProb: 0.1
  },
  swordsman: {
    char: 'S',
    log: '一位剑客要求决斗。',
    name: '剑客',
    minDamage: 10,
    maxDamage: 30,
    interval: 2,
    hp: 150,
    bullet: 'x',
    dodgeProb: 0.2
  },
  druggist: {
    char: 'D',
    log: '药剂师的药水很不好受。',
    name: '药剂师',
    minDamage: 5,
    maxDamage: 15,
    interval: 1,
    hp: 100,
    bullet: 'Q',
    dodgeProb: 0.4
  }
};