"use strict";

$(main);

const tabIds = ['dorm', 'campus', 'thesis'];
const subjects = ['math', 'phys', 'chem'];
const breakableWeapons = ['bow', 'sword', 'gun', 'rpg', 'laser'];
const items = ['bow', 'sword', 'gun', 'rpg', 'laser', 'bullet', 'cannonball',
  'arrow', 'medicine'];
const producableWeapons = ['sword', 'gun', 'bullet', 'rpg', 'cannonball',
  'laser'];
const bowMax = 10, swordMax = 10, gunMax = 50, rpgMax = 50, laserMax = 100;
const buildingInfo = {
  L: '图书馆', T: '教学楼', G: '体育馆', R: '饭堂', 8: '8348', C: '化学实验楼',
  P: '物理实验楼', H: '大礼堂', O: '宿舍', A: '艺术教育中心'
};
const westHeight = 14, middleHeight = 11, eastHeight = 7;  // 主干道与上边界距离
const initX = 6, initY = 46;
const initBackpack = {
  senseOfDirection: 0,
  bullet: 0, cannonball: 0, arrow: 0, medicine: 0,
  bow: undefined, sword: undefined, gun: undefined, rpg: undefined,
  laser: undefined
};
const stageInfo = [
  { en: 'zero grade', zh: '大零' },
  { en: 'freshman', zh: '大一' },
  { en: 'sophomore', zh: '大二' },
  { en: 'junior', zh: '大三' },
  { en: 'senior', zh: '大四' },
  { en: 'fifth grade', zh: '大五' },
  { en: 'sixth grade', zh: '大六' },
];
const maxHp = 100;
const deathPenalty = 3;
const autosaveInterval = 10;

const sortCmp = (a, b) => a - b;
const randBetween = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

// “所有希望刷新后仍然保留的变量”名列表
const autosaveVariables = [
  'nowTab', 'mathSpeed', 'physSpeed', 'chemSpeed', 'restSpeed',
  'mathValue', 'physValue', 'chemValue', 'bows', 'swords', 'guns', 'rpgs',
  'lasers', 'bullets', 'cannonballs', 'arrows', 'medicines', 'achieved',
  'showPhys', 'showChem', 'showBow', 'showRpg', 'showLaser', 'showMedicine',
  'learntPowder', 'learntDynamite', 'stage', 'logTexts', 'lastMoveTimeStamp',
  'changingCampus', 'showEvent', 'currentEvent', 'currentAchieve', 'velocity',
  'backpack', 'nowX', 'nowY', 'nowCampus', 'hp', 'foeHp', 'foe',
  'dodgeProb', 'building', 'showTeacher', 'joinGroup', 'writeThesis',
  'checkingCnt', 'nowDefense'
];
// 任何可能修改 Cookies 格式（譬如增加变量）的操作都应该增加下述计数器，
// 以提示用户的浏览器初始化新变量。
const autosaveFormatVersion = 'v0.1';
let nowTab = 'dorm';

// ========= 所有所有希望刷新后仍然保留的变量 开始 ==========
// !!!!!!!!! 这里任何的初始化操作都会被覆盖 !!!!!!!!!!!!!!!!
// !!!!!!!!! 请使用 initVariables 执行初始化，除非初始值为 undefined !!!!!!!!!!!!!!

// 能力值及增速 
let mathSpeed, physSpeed, chemSpeed, restSpeed;
let mathValue, physValue, chemValue;

// 道具库
let bows, swords, guns, rpgs, lasers;  // 仅存工具耐久度
let bullets, cannonballs, arrows, medicines;

// 进度
let achieved;  // 仅存成就 id
let advanced; // 仅存进度 id
let showPhys, showChem;
let showBow, showRpg, showLaser, showMedicine;
let learntPowder, learntDynamite;
let stage;  // 年级数，到一个图书馆大二，两个则大三，碰见教授则大四，答辩延毕则大五，
// 再延毕大六，再延毕辍学（游戏失败）。

let logTexts;  // { id: [string], text: [string] }
let lastMoveTimeStamp, changingCampus;

// 随机事件
let showEvent;
let currentEvent;

// 成就
let currentAchieve;

// 进度
let currentAdvance;

// 背包
let velocity;
let backpack;

let nowX, nowY;  // 向下为 x 轴正方向，向右为 y 轴正方向，这是初始坐标
let nowCampus;
let hp, foeHp, foe, dodgeProb, building;

// 导师
let showTeacher = [false, false, false];
let joinGroup = [false, false, false];
let writeThesis = [false, false, false];
let checkingCnt = [0, 0, 0];
let nowDefense = false;
let DefenseCnt = 0; // 理应在 autosavevariables 中
let passDefense = false; // 理应在 autosavevariables 中
let defenseSubject;
let gameEnd = false;

// ========= 所有所有希望刷新后仍然保留的变量 结束 ==========

function initVariables() {
  mathSpeed = physSpeed = chemSpeed = 0; restSpeed = 20;
  mathValue = physValue = chemValue = 0;
  bows = []; swords = []; guns = []; rpgs = []; lasers = [];
  bullets = cannonballs = arrows = medicines = 0;
  achieved = [];
  advanced = [];
  showPhys = showChem = false;
  showBow = showRpg = showLaser = showMedicine = false;
  learntPowder = learntDynamite = false;
  stage = 1;
  logTexts = [];
  lastMoveTimeStamp = 0;
  changingCampus = false;
  showEvent = false;
  currentEvent = 0;
  currentAchieve = 0;
  velocity = 1;
  backpack = JSON.parse(JSON.stringify(initBackpack));
  nowX = initX; nowY = initY;
  hp = maxHp; dodgeProb = 0;
}

let confirmCallback = () => { };  // campus_event_button 的回调函数

function debugSaveFile() {
  mathValue = physValue = chemValue = 90000;
  bows = [1, 2, 3, 4];
  swords = [10, 7, 3, 9, 2];
  guns = [12, 12, 2, 2, 20];
  lasers = [7, 7, 17, 19, 30];
  rpgs = [3, 7, 10, 20, 20];
  // achieved = ['avoid_hit'];
  advanced = ['show chem', 'show phys'];
  arrows = cannonballs = bullets = medicines = 30;
  showBow = showPhys = showChem = showRpg = showLaser = showMedicine = true;
  learntDynamite = learntPowder = true;

  backpack.senseOfDirection = 300;
  backpack.bow = backpack.gun = backpack.sword = backpack.rpg =
    10;
  showTeacher = [true, true, true];
  joinGroup = [false, true, true];
  writeThesis = [false, true, true];
  checkingCnt = [0, 10, 4];
  backpack.senseOfDirection = 1000;
  backpack.bow = backpack.gun = backpack.sword = backpack.rpg =
    backpack.laser = 10;
  backpack.sword = 2;
  backpack.bullet = backpack.medicine = backpack.cannonball = 200;
  backpack.arrow = 70;
  velocity = 20;
  showLaser = false;
}

function updateLogDom() {
  let logStr = '';
  for (let logText of logTexts) {
    logStr += '\n' + logText.text;
  }
  $('.log').text(logStr.substring(1));
  $('.log').html($('.log').html().replace(/\n/g, '<br/>'));
}
function log(str) {
  let randomId = Math.random().toString(36).substring(2);
  logTexts.unshift({ id: randomId, text: str });
  updateLogDom();
  while ($('.log').height() > window.innerHeight - 120) {
    logTexts.pop();
    updateLogDom();
  }
  setTimeout(() => { unlog(randomId); }, 1000 * 60 * 3);
}
function unlog(id) {
  if (logTexts[logTexts.length - 1].id === id) {
    logTexts.pop();
    updateLogDom();
  }
}

function message(expr) {
  if (expr === 'learnt rpg') { throw 'x'; }
  switch (expr) {
    // Error
    case 'math low': log('数学能力不足。'); break;
    case 'phys low': log('物理能力不足。'); break;
    case 'chem low': log('化学能力不足。'); break;
    case '!learnt powder': log('还未掌握火药制造。'); break;
    case '!learnt dynamite': log('还未掌握炸药制造。'); break;

    // Info: 学习新知识
    case 'phys learnt': log('开始学习物理。'); break;
    case 'bow learnt': log('发现了弓箭。'); break;
    case 'chem learnt': log('开始学习化学。'); break;
    case 'powder learnt': log('掌握了火药的制造。'); break;
    case 'dynamite learnt': log('掌握了炸药的制造。'); break;
    case 'medicine learnt': log('发现了治疗药剂。'); break;
    case 'rpg learnt': log('掌握了火炮的制造。'); break;
    case 'laser learnt': log('掌握了光剑的制造。'); break;

    // Info: 制作新物品
    case 'buy sword': log('制作了一把铁剑。'); break;
    case 'buy gun': log('制作了一把步枪。'); break;
    case 'buy bullet': log('制作了一颗子弹。'); break;
    case 'buy rpg': log('制作了一个火炮。'); break;
    case 'buy cannonball': log('制作了一枚炮弹。'); break;
    case 'buy laser': log('制作了一副光剑。'); break;

    // Info: 进度提示
    case 'sophomore': log('升入大二。'); break;
    case 'junior': log('升入大三。'); break;
    case 'senior': log('升入大四，进入毕业年级。'); break;
    case 'fifth grade': log('答辩未通过，延毕至大五。'); break;
    case 'sixth grade': log('答辩未通过，延毕至大六。'); break;

    // Info in campus
    case 'senseOfDirection <= 5': log('方向感快用完了。'); break;
    case 'senseOfDirection <= 0': log('方向感用完了。'); break;
    case 'death of senseOfDirection':
      log('眼前的道路诡异地扭曲直至消失，回过神来已经被送到了宿舍。'); break;
    case 'death of boxer':
      log('被拳击手击败。'); break;
    case 'death of archer':
      log('被弓箭手击败。'); break;
    case 'death of druggist':
      log('被药剂师击败。'); break;
    case 'death of swordsman':
      log('被剑客击败。'); break;
    case 'meet math mentor':
      log('遇见数学导师。'); break;
    case 'meet phys mentor':
      log('遇见物理导师。'); break;
    case 'meet chem mentor':
      log('遇见化学导师。'); break;

    // Info in thesis
    case 'join group': log('加入了一个课题组'); break;
    case 'write thesis': log('撰写了一篇论文'); break;
    case 'check thesis': log('对论文进行了一次推敲'); break;
    case 'fail defense': log('答辩没有通过'); break;
    default: log('${' + expr + '}'); break;
  }
}

function changeTab(tab) {
  if (nowTab === tab) { return; }
  $(`#tab_${nowTab}`).css('text-decoration', 'none');
  $(`#tab_${tab}`).css('text-decoration', 'underline');
  $(`#${nowTab}`).css('display', 'none');
  $(`#${tab}`).css('display', 'block');
  nowTab = tab;
}

function setUpMouseBox() {
  $(document).on('mousemove', (e) => {
    $('#mouse_box').css('left', e.pageX + 10).css('top', e.pageY + 10);
  });
}
function onMouseBox(str) {
  $('#mouse_box').css('display', 'inherit').text(str);
}
function offMouseBox() {
  $('#mouse_box').css('display', 'none');
}

function updateValue() {  // 更新能力值、物品数。因为很常用于是单独拿出来。
  updatePrepare();
  for (let sub of subjects) {
    $(`.${sub}_value td.value`).text(eval(`${sub}Value`));
  }
  for (let item of items) {
    let count = eval(`${item}s`);
    if (count.length !== undefined) { count = count.length; }
    $(`.${item}_count td.value`).text(count);
  }
}

function updatePrepare() {  // 更新出发前准备栏。因为很常用所以单独拿出来。
  let bind = (row, idx, expr) => {
    $($(`${row} i`)[idx]).css('color', expr ? 'black' : 'grey');
  };

  $($('#velocity td')[1]).text(velocity);
  bind('#velocity', 0, mathValue >= 50 && velocity <= 399);
  bind('#velocity', 1, velocity >= 2);
  if (backpack.senseOfDirection >= 1 &&
    $('#set_off .cooldown').css('width') === '0px') {
    $('#set_off').removeClass('disabled');
  } else {
    $('#set_off').addClass('disabled');
  }

  let link = (id, cost, gain) => {
    $($(`#${id} td`)[1]).text(backpack[gain]);
    bind(`#${id}`, 0, eval(cost) >= 1 && backpack[gain] <= 399);
    bind(`#${id}`, 1, backpack[gain] >= 1);
    bind(`#${id}`, 2, eval(cost) >= 10 && backpack[gain] <= 390);
    bind(`#${id}`, 3, backpack[gain] >= 10);
  };
  link('sense_of_direction', 'mathValue', 'senseOfDirection');
  for (let item of ['bullet', 'cannonball', 'arrow', 'medicine']) {
    link(`${item}_taken`, `${item}s`, item);
  }

  let check = (weapon) => {
    $($(`#${weapon}_taken i`)[0]).removeClass('fa-square')
      .addClass('fa-square-check');
  };
  let uncheck = (weapon) => {
    $($(`#${weapon}_taken i`)[0]).removeClass('fa-square-check')
      .addClass('fa-square');
  };
  for (let weapon of breakableWeapons) {
    let durability = '??';
    if (backpack[weapon] !== undefined) {
      durability = backpack[weapon] * 100 / eval(`${weapon}Max`) + '%';
      check(weapon);
    } else {
      durability = '--';
      uncheck(weapon);
    }
    $($(`#${weapon}_taken td`)[1]).text(durability);
    let weapons = eval(`${weapon}s.sort(sortCmp)`);
    bind(`#${weapon}_taken`, 1, backpack[weapon] !== undefined &&
      backpack[weapon] < weapons[weapons.length - 1]);
    bind(`#${weapon}_taken`, 2,
      backpack[weapon] !== undefined && backpack[weapon] > weapons[0]);
  }
}

function updateBackpack() {  // 更新背包栏和战斗栏。
  let changeText = (row, text) => {
    $($(`#${row}_left td`)[1]).text(text);
  };
  changeText('sense_of_direction', backpack.senseOfDirection);
  for (let item of ['bullet', 'cannonball', 'arrow', 'medicine']) {
    changeText(item, backpack[item]);
  }
  for (let weapon of breakableWeapons) {
    if (backpack[weapon] === undefined) {
      changeText(weapon, '--');
    } else {
      changeText(weapon, backpack[weapon] * 100 / eval(`${weapon}Max`) + '%');
    }
  }
  $('#combat_my_hp').text(`${hp}/${maxHp}`);
  if (foe !== undefined) {
    $('#combat_foe_hp').text(`${foeHp}/${combatInfo[foe].hp}`);
    $('#combat_foe').text(`${combatInfo[foe].char}`);
  }
}

function updateDom() {  // 更新 DOM 元素使之符合最新变量。更新变量后需调用。
  updateValue();

  makeAdvancement("start");

  if (showPhys) { $('#phys_inc, .phys_value').css('display', 'table-row'); makeAdvancement("show phys"); }
  if (showChem) { $('#chem_inc, .chem_value').css('display', 'table-row'); makeAdvancement("show chem"); }

  // 成就
  let achieveIds = [];
  for (let achieve of achieves) {
    achieveIds.push(achieve.id);
  }
  for (let achieveId of achieveIds) {
    if (achieved.indexOf(achieveId) !== -1) {
      $(`.${achieveId}`).css('display', 'table-row');
    }
  }

  // 道具库
  if (showPhys || showChem) { $('.produce_weapon').css('display', 'inherit'); }
  if (showPhys && showChem) { $('.study_weapon').css('display', 'inherit'); }
  var show = (weapon) => {
    $('.' + weapon).css('display', 'inherit');
    $(`.${weapon}_count, #${weapon}_taken, #${weapon}_left`)
      .css('display', 'table-row');
  };
  if (showBow) { show('bow'); show('arrow'); }
  if (showPhys) { show('sword'); }
  if (showPhys && showChem) { show('gun'); show('powder'); show('bullet'); }
  if (showRpg) { show('rpg'); show('cannonball'); show('dynamite'); }
  if (showLaser) { show('laser'); }
  if (showMedicine) { show('medicine'); }
  if (learntPowder) {
    $('#powder').addClass('inactive_box').removeClass('active_box');
  }
  if (learntDynamite) {
    $('#dynamite').addClass('inactive_box').removeClass('active_box');
  }

  // 增量调整栏
  $($('#rest td')[1]).text(restSpeed);

  let bind = (row, idx, expr) => {
    $($(`${row} i`)[idx]).css('color', expr ? 'black' : 'grey');
  };
  for (let sub of subjects) {
    $($(`#${sub}_inc td`)[1]).text(eval(`${sub}Speed`));
    bind(`#${sub}_inc`, 0, restSpeed >= 1);
    bind(`#${sub}_inc`, 1, eval(`${sub}Speed`) >= 1);
    bind(`#${sub}_inc`, 2, restSpeed >= 10);
    bind(`#${sub}_inc`, 3, eval(`${sub}Speed`) >= 10);
  }

  // 出发准备栏
  updatePrepare();

  // 导师
  for (let idx = 0; idx < 3; idx++) {
    if (showTeacher[idx]) $("#" + subjects[idx] + "_teacher_wrapper").css("display", "block");
    if (showTeacher[idx] && !joinGroup[idx]) $("#" + subjects[idx] + "_joingroup").css("display", "block");
    else $("#" + subjects[idx] + "_joingroup").css("display", "none");
    if (joinGroup[idx] && !writeThesis[idx]) $("#" + subjects[idx] + "_writethesis").css("display", "block");
    else $("#" + subjects[idx] + "_writethesis").css("display", "none");
    if (writeThesis[idx]) $("#" + subjects[idx] + "_checking").css("display", "block");
    if (checkingCnt[idx] >= 3) $("#" + subjects[idx] + "_defense").css("display", "block");
  }
}

function prepareDataRows() {
  $('.math_value').on('mouseover',
    () => { onMouseBox(`数学能力: +${mathSpeed}/10s`); });
  $('.phys_value').on('mouseover',
    () => { onMouseBox(`物理能力: +${physSpeed}/10s`); });
  $('.chem_value').on('mouseover',
    () => { onMouseBox(`化学能力: +${chemSpeed}/10s`); });
  for (let i of subjects) {
    $(`.${i}_value`).on('mouseleave', () => { offMouseBox(); });
  }

  for (let weapon of breakableWeapons) {
    $(`.${weapon}_count`)
      .on('mouseover', () => {
        let str = '耐久度: ';
        let tmp = eval(`${weapon}s`);
        if (tmp.length === 0) { return; }
        tmp.sort(sortCmp);
        let count = 0, max = eval(`${weapon}Max`);
        for (let i = tmp.length - 1; i >= 0; --i) {
          count++;
          if (i === 0 || tmp[i] !== tmp[i - 1]) {
            str += `${tmp[i] * 100 / max}%x${count}, `;
            count = 0;
          }
        }
        onMouseBox(str.substring(0, str.length - 2));
      })
      .on('mouseleave', () => { offMouseBox(); });
  }

  for (let ach of achieves) {
    $(`.${ach.id}`)
      .on('mouseover', () => { onMouseBox(ach.txt); })
      .on('mouseleave', () => { offMouseBox(); });
  }
}

function changeInc(subject, index) {  // 学科 id；按钮编号
  switch (index) {
    case 0:  // +1
      if (restSpeed >= 1) {
        restSpeed--; eval(`${subject}Speed++`);
      }
      break;
    case 1:  // -1
      if (eval(`${subject}Speed`) >= 1) {
        restSpeed++; eval(`${subject}Speed--`);
      }
      break;
    case 2:  // +10
      if (restSpeed >= 10) {
        restSpeed -= 10; eval(`${subject}Speed += 10`);
      }
      break;
    case 3:  // -10
      if (eval(`${subject}Speed`) >= 10) {
        restSpeed += 10; eval(`${subject}Speed -= 10`);
      }
      break;
  }
  updateDom();
}
function prepareInc() {
  for (let subject of subjects) {
    for (let i of [0, 1, 2, 3]) {
      $($(`#${subject}_inc i`)[i])
        .on('mousedown', () => { changeInc(subject, i); });
    }
    setInterval(() => {
      eval(`${subject}Value += ${subject}Speed`);
      updateValue();
    }, 1000);  // TODO: 改回来。 10s.
  }
}

function adjustPrepareItem(id, cost, gain) {  // 标签 id，按钮编号，消耗，获得
  for (let idx of [0, 1, 2, 3]) {
    let delta = [1, -1, 10, -10][idx];
    $($(`#${id} i`)[idx]).on('mousedown', () => {
      if (eval(cost) >= delta && backpack[gain] + delta <= 400 &&
        backpack[gain] >= -delta) {
        eval(`${cost} -= ${delta}; backpack.${gain} += ${delta}`);
        updatePrepare();
        updateValue();
      }
    });
  }
}
function adjustPrepareWeapon(weapon) {
  $($(`#${weapon}_taken i`)[0]).on('mousedown', () => {
    if (backpack[weapon] === undefined) {
      backpack[weapon] = eval(`${weapon}s.pop()`);
    } else {
      eval(`${weapon}s.push(${backpack[weapon]})`);
      backpack[weapon] = undefined;
    }
    updatePrepare();
    updateValue();
  });
  $($(`#${weapon}_taken i`)[1]).on('mousedown', () => {
    if (backpack[weapon] === undefined) { return; }
    let weapons = [...new Set(eval(`${weapon}s`))];
    weapons.push(backpack[weapon]);
    weapons.sort(sortCmp);
    weapons = [...new Set(weapons)];
    if (backpack[weapon] === weapons[weapons.length - 1]) { return; }
    eval(`${weapon}s.push(${backpack[weapon]})`);  // 将原来的 push 到最后
    backpack[weapon] = weapons[weapons.indexOf(backpack[weapon]) + 1];
    // 将新的从 weapons 删去
    eval(`${weapon}s.splice(${weapon}s.indexOf(${backpack[weapon]}), 1)`);
    eval(`${weapon}s.sort(sortCmp)`);
    updatePrepare();
    updateValue();
  });
  $($(`#${weapon}_taken i`)[2]).on('mousedown', () => {
    if (backpack[weapon] === undefined) { return; }
    let weapons = [...new Set(eval(`${weapon}s`))];
    weapons.push(backpack[weapon]);
    weapons.sort(sortCmp);
    weapons = [...new Set(weapons)];
    if (backpack[weapon] === weapons[0]) { return; }
    eval(`${weapon}s.push(${backpack[weapon]})`);  // 将原来的 push 到最后
    backpack[weapon] = weapons[weapons.indexOf(backpack[weapon]) - 1];
    // 将新的从 weapons 删去
    eval(`${weapon}s.splice(${weapon}s.indexOf(${backpack[weapon]}), 1)`);
    eval(`${weapon}s.sort(sortCmp)`);
    updatePrepare();
    updateValue();
  });
}

function setOff() {
  makeAdvancement("set off");
  if ($('#set_off').hasClass('disabled')) { return; }
  $('#campus #campus_prepare_wrapper').css('display', 'none');
  $('#campus #data_wrapper').css('display', 'none');
  $('#campus #campus_map, #backpack_wrapper').css('display', 'block');
  $('#tab_dorm, #tab_thesis').css('color', 'grey');
  nowCampus = 'middle';
  nowX = initX; nowY = initY;

  let show = {};
  for (let item of items) {
    if (backpack[item] !== 0 && backpack[item] !== undefined) {
      $(`#${item}_left`).css('display', 'table-row');
      $(`#use_${item}`).css('display', 'inherit');
      show[item] = true;
    }
  }
  if (show.sword === undefined && show.gun === undefined) {
    $($(`.combat_row`)[1]).css('height', 'auto');
  }
  if (show.rpg === undefined && show.laser === undefined) {
    $($(`.combat_row`)[2]).css('height', 'auto');
  }
  if (show.medicine === undefined) {
    $($(`.combat_row`)[3]).css('height', 'auto');
  }

  discover();
  changeMap(nowCampus);
  updateBackpack();
}
function home() {
  $('#campus #campus_prepare_wrapper, #campus #data_wrapper')
    .css('display', 'block');
  $('#campus #campus_map, #backpack_wrapper').css('display', 'none');
  $('#campus_event, #combat').css('display', 'none');
  $('#tab_dorm, #tab_thesis').css('color', 'black');
  nowCampus = undefined;
  velocity = 1;
  for (let item of breakableWeapons) {
    if (backpack[item] !== undefined) {
      eval(`${item}s.push(${backpack[item]})`);
      eval(`${item}s.sort(sortCmp)`);
    }
  }
  for (let item of items) {
    $(`#use_${item}`).css('display', 'none');
    if (breakableWeapons.indexOf(item) !== -1) { continue; }
    eval(`${item}s++`);
  }
  backpack = JSON.parse(JSON.stringify(initBackpack));
  updateDom();
}
function preparePrepare() {
  adjustPrepareItem('sense_of_direction', 'mathValue', 'senseOfDirection');
  for (let item of ['bullet', 'cannonball', 'arrow', 'medicine']) {
    adjustPrepareItem(`${item}_taken`, `${item}s`, item);
  }
  $($('#velocity i')[0]).on('mousedown', () => {
    if (mathValue >= 50 && velocity <= 399) {
      mathValue -= 50; velocity++;
    }
    updateDom();
  });
  $($('#velocity i')[1]).on('mousedown', () => {
    if (velocity >= 2) {
      velocity--; mathValue += 50;
    }
    updateDom();
  });
  for (let weapon of breakableWeapons) {
    adjustPrepareWeapon(weapon);
  }
  $('#set_off').on('mousedown', () => {
    if (backpack.senseOfDirection > 0) { setOff(); }
  });
}

function changeMap(name) {
  let mapStr = '';
  let mapFile = eval(`${name}Campus`);
  let mapVst = eval(`${name}Visited`);
  nowCampus = name;
  offMouseBox();
  discover();
  for (let i = 0; i < mapFile.length; i++) {
    mapStr = mapStr + '\n';
    for (let j = 0; j < mapFile[i].length; j++) {
      if (nowX == i && nowY == j) {
        mapStr += 'Me'; continue;
      }
      if (!mapVst[i][j]) {
        mapStr += 'Space'; continue;
      }
      let str = '';
      switch (mapFile[i][j]) {
        case '.': str = 'Dot'; break;
        case '#': str = 'Sharp'; break;
        default: str = 'Building' + mapFile[i][j];
      }
      mapStr += str;
    }
  }
  $('#campus_map').text(mapStr.substring(1));
  $('#campus_map')  // TODO: 减少这里 span 的数量，最后将不必要的删去（譬如 '#'）
    .html($('#campus_map').html().replace(/\n/g, '<br/>'))
    .html($('#campus_map').html().replace(/Dot/g, '.'))
    .html($('#campus_map').html().replace(/Space/g, '&nbsp;'))
    .html($('#campus_map').html().replace(/Me/g, '<span class="me">@</span>'))
    .html($('#campus_map').html().replace(/Sharp/g,
      '<span class="wall">#</span>'));
  for (let ch of 'LTGR8CPHOA') {
    eval(`$('#campus_map').html($('#campus_map').html().replace(
          /Building${ch}/g, 
          '<span class="building building_${ch}">${ch}</span>'))`);
  }
  for (let ch of 'LTGR8CPHOA') {
    $(`.building_${ch}`).on('mouseover', () => onMouseBox(buildingInfo[ch]))
      .on('mouseleave', () => offMouseBox());
  }
  $('.me').on('mouseleave', () => offMouseBox());  // 必要的
}

function buyWeapon(weapon) {
  switch (weapon) {
    case 'sword':
      if (physValue < 50) { message('phys low'); break; }
      physValue -= 50;
      swords.push(10);
      message('buy sword');
      break;
    case 'gun':
      if (physValue < 100) { message('phys low'); break; }
      physValue -= 100;
      guns.push(50);
      message('buy gun');
      break;
    case 'bullet':
      if (!learntPowder) { message('!learnt powder'); break; }
      if (chemValue < 2) { message('chem low'); break; }
      chemValue -= 2;
      bullets++;
      message('buy bullet');
      break;
    case 'rpg':
      if (mathValue < 100) { message('math low'); break; }
      if (physValue < 200) { message('phys low'); break; }
      mathValue -= 100;
      physValue -= 200;
      rpgs.push(50);
      message('buy rpg');
      break;
    case 'cannonball':
      if (!learntDynamite) { message('!learnt dynamite'); break; }
      if (chemValue < 5) { message('chem low'); break; }
      chemValue -= 5;
      cannonballs++;
      message('buy cannonball');
      break;
    case 'laser':
      if (mathValue < 250) { message('math low'); break; }
      if (physValue < 500) { message('phys low'); break; }
      mathValue -= 250;
      physValue -= 500;
      lasers.push(100);
      message('buy laser');
      break;
  }
  updateDom();
}
function studyWeapon(weapon) {
  switch (weapon) {
    case 'powder':
      if (learntPowder) { break; }
      if (mathValue < 100) { message('math low'); break; }
      if (chemValue < 200) { message('chem low'); break; }
      mathValue -= 100;
      chemValue -= 200;
      learntPowder = true;
      break;
    case 'dynamite':
      if (learntDynamite) { break; }
      if (mathValue < 250) { message('math low'); break; }
      if (chemValue < 500) { message('chem low'); break; }
      mathValue -= 250;
      chemValue -= 500;
      learntDynamite = true;
      break;
  }
}

function prepareWeapon() {
  for (let weapon of producableWeapons) {
    $(`#${weapon}`).on('mousedown', () => { buyWeapon(weapon); });
  }
}

function prepareEvent() {
  let prob = 1 / 300;
  let checkEvent = () => {
    if (nowCampus == undefined && nowDefense == false && !showEvent &&
      !gameEnd && Math.random() < prob) {
      currentEvent++;
      let cur = currentEvent;

      showEvent = true;
      $(`#dark_filter`).css("display", "block");
      $(`#event_box`).css("display", "block");

      let eventId = Math.floor(Math.random() * events.length);
      $(`#event_text`).text(events[eventId].event);

      for (let i = 0; i < events[eventId].opt.length; i++) {
        $(`#event_opt${i}`).css("display", "block");
        $(`#event_opt${i}`).text(events[eventId].opt[i].txt);
      }
      if (events[eventId].opt.length == 1) {
        $(`#event_opt1`).css("display", "none");
      }

      for (let i = 0; i < events[eventId].opt.length; i++) {
        $(`#event_opt${i}`).on('mousedown', () => {
          if (cur != currentEvent) return;
          $(`#dark_filter`).css("display", "none");
          $(`#event_box`).css("display", "none");
          showEvent = false;
          events[eventId].opt[i].res();
          updateDom();
        });
      }
    }
  };
  setInterval(() => checkEvent(), 1000); // 每秒以 1/300 概率尝试生成随机事件
}

function makeAchievement(achieveId) {
  if (achieved.indexOf(achieveId) != -1) return;
  let remainTime = 3000;

  let achieveIndex = -1;
  for (let i = 0; i < achieves.length; i++)
    if (achieves[i].id == achieveId)
      achieveIndex = i;

  // console.log(achieveIndex);
  if (achieveIndex == -1) return;
  currentAchieve = achieveIndex;

  $(`#reach_achievement`).text(`达成了成就`);
  $(`#achievement_text`).text(achieves[achieveIndex].name);
  $(`#achievement_text`).css("display", "block");
  $(`#reach_achievement`).css("display", "block");
  $(`#achievement_box`).css("display", "block");

  setTimeout(() => {
    if (currentAchieve == achieveIndex) {
      $(`#achievement_text`).css("display", "none");
      $(`#reach_achievement`).css("display", "none");
      $(`#achievement_box`).css("display", "none");
    }
  }, remainTime);
  achieved.push(achieveId);
  updateDom();
}

function makeAdvancement(advanceId) {
  if (advanced.indexOf(advanceId) != -1) return;
  let remainTime = 3000;

  let advanceIndex = -1;
  for (let i = 0; i < advances.length; i++)
    if (advances[i].id == advanceId)
      advanceIndex = i;

  // console.log(advanceIndex);
  if (advanceIndex == -1) return;
  currentAdvance = advanceIndex;

  $(`#reach_achievement`).text(`完成了进度`);
  $(`#achievement_text`).text(advances[advanceIndex].name);
  $(`#achievement_text`).css("display", "block");
  $(`#reach_achievement`).css("display", "block");
  $(`#achievement_box`).css("display", "block");

  setTimeout(() => {
    if (currentAdvance == advanceIndex) {
      $(`#achievement_text`).css("display", "none");
      $(`#reach_achievement`).css("display", "none");
      $(`#achievement_box`).css("display", "none");
    }
  }, remainTime);
  advanced.push(advanceId);
  updateDom();
}

function discover() {
  let test = (x, y) => (eval(`${nowCampus}Campus`)[nowX + x][nowY + y] === '#');
  let reach = [];
  for (let x = -4; x <= 4; ++x) { reach[x] = []; }
  reach[0][0] = true;
  for (let times = 1; times <= 3; times++) {
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        if (Math.abs(x) + Math.abs(y) > 3) { continue; }
        if ((reach[x - 1][y] || reach[x + 1][y] || reach[x][y - 1] ||
          reach[x][y + 1]) && !test(x, y)) {
          reach[x][y] = true;
        }
      }
    }
  }
  let test2 = (x, y) => Math.abs(x) + Math.abs(y) < 3 && reach[x][y];
  for (let x = -3; x <= 3; x++) {
    for (let y = -3; y <= 3; y++) {
      if (Math.abs(x) + Math.abs(y) > 3) { continue; }
      if (!(test2(x - 1, y) || test2(x + 1, y) || test2(x, y - 1) ||
        test2(x, y + 1))) { continue; }
      if (eval(`${nowCampus}Visited`)[nowX + x][nowY + y] !== undefined) {
        eval(`${nowCampus}Visited[${nowX + x}][${nowY + y}] = true`);
      }
    }
  }
}

function showCampusEventBox(title, content, callback = () => { }) {
  $('#campus_event_title').text(title);
  $('#campus_event_content')
    .text(content)
    .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
  $('#campus_event').css('display', 'inherit');
  confirmCallback = callback;
}

// 这里砍怪可以改成更 dedicated 的复用代码，但是考虑到要加教学楼限定怪就没搞。
function campusEvent(type) {
  let gain;
  let physStr = '物理能力得到提高';
  if (!showPhys) {
    physStr = '学习了物理';
  }
  switch (type) {
    case 'pick_chem':
      $('#campus_event_title').text('拾起化学材料');
      log('地上有一根废弃的试管。');
      gain = randBetween(50, 100);
      let str = '化学能力得到提高。';
      if (!showChem) {
        showChem = true;
        message('chem learnt');
        str = '学习了化学。';
      }
      $('#campus_event_content')
        .text(`${str}\n\n获得：\n化学能力 x${gain}`)
        .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      chemValue += gain;
      $('#campus_event').css('display', 'inherit');
      break;
    case 'meet_mentor':
      if (stage < 4) {
        stage = 4;
        message('senior');
        $('#stage').text(stageInfo[4].zh);
      }
      let subject = ['math', 'phys', 'chem'][randBetween(0, 2)];
      addMentor(subject);
      message(`meet ${subject} mentor`);
      break;

    case 'kill_boxer':
      $('#campus_event_title').text('击败拳击手');
      log('拳击手倒下了。');
      gain = randBetween(10, 30);
      $('#campus_event_content')
        .text(`${physStr}。\n\n获得：\n物理能力 x${gain}`)
        .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      physValue += gain;
      $('#campus_event').css('display', 'inherit');
      break;
    case 'kill_archer':
      $('#campus_event_title').text('击败弓箭手');
      log('弓箭手倒下了。');
      gain = randBetween(10, 30);
      let gainBowArrow = Math.random() < 0.5;
      if (gainBowArrow) {
        if (!showBow) {
          showBow = true;
          message('bow learnt');
        }
        let bowGained = randBetween(1, 10);
        let arrowGained = randBetween(1, 3);
        if (backpack.arrow === 0 || backpack.bow === undefined) {
          $('#use_bow').removeClass('disabled').css('display', 'inherit');
        }
        backpack.arrow += arrowGained;
        if (backpack.bow === undefined) {
          backpack.bow = bowGained;
        } else {
          backpack.bow = Math.min(bowMax, backpack.bow + bowGained);
        }
        $('#campus_event_content')
          .text(`${physStr}，同时获得了一套弓箭。\n\n获得：\n物理能力 x${gain}` +
            `\n弓 ${bowGained * 100 / bowMax}%\n箭 x${arrowGained}`
          )
          .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      } else {
        $('#campus_event_content')
          .text(`${physStr}。\n\n获得：\n物理能力 x${gain}`)
          .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      }
      physValue += gain;
      $('#campus_event').css('display', 'inherit');
      break;
    case 'kill_swordsman':
      $('#campus_event_title').text('击败剑客');
      log('剑客倒下了。');
      gain = randBetween(50, 100);
      $('#campus_event_content')
        .text(`${physStr}。\n\n获得：\n物理能力 x${gain}`)
        .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      physValue += gain;
      $('#campus_event').css('display', 'inherit');
      break;
    case 'kill_druggist':
      $('#campus_event_title').text('击败药剂师');
      log('药剂师倒下了。');
      gain = randBetween(50, 100);
      let gainMedicine = Math.random() < 0.5;
      if (gainMedicine) {
        if (!showMedicine) {
          showMedicine = true;
          message('medicine learnt');
        }
        if (backpack.medicine === 0) {
          $('#use_medicine').removeClass('disabled').css('display', 'inherit');
          $($('.combat_row')[3]).css('height', '44px');
        }
        backpack.medicine++;
        $('#campus_event_content')
          .text(`${physStr}，同时获得了一枚药剂。\n\n获得：\n物理能力 x${gain}` +
            `\n药剂 x1`)
          .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      } else {
        $('#campus_event_content')
          .text(`${physStr}。\n\n获得：\n物理能力 x${gain}`)
          .html($('#campus_event_content').html().replace(/\n/g, '<br/>'));
      }
      physValue += gain;
      $('#campus_event').css('display', 'inherit');
      break;

    case 'drink_coffee':
      showCampusEventBox('喝咖啡', '喝了杯咖啡。');
      break;
    case 'watch_movie':
      showCampusEventBox('看电影', '看了场电影。');
      break;
    case 'have_meal':
      showCampusEventBox('吃饭', '吃了顿饭，方向感提高。');
      backpack.senseOfDirection += 10;
      break;
    case 'exercise':
      showCampusEventBox('锻炼', '锻炼，方向感提高。');
      backpack.senseOfDirection += 10;
      break;
  }
}

function updateCombatCooldown(selector, percentage, seconds) {
  percentage -= 1 / seconds;
  if ($('#combat').css('display') !== 'none') {
    $(`${selector} .cooldown`).css('width', `${percentage}%`);
  }
  if (Math.abs(percentage) < 1e-5 || $('#combat').css('display') === 'none') {
    let item = selector.substring(5);
    if (items.indexOf(item) === -1 || backpack[item] >= 1) {
      $(selector).removeClass('disabled');
    }
    return;
  }
  setTimeout(() => updateCombatCooldown(selector, percentage, seconds), 10);
}
let updateCooldownCrit = true;
function updateCooldown(selector, percentage, seconds, callback, useCrit) {
  percentage -= 1 / seconds;
  $(`${selector} .cooldown`).css('width', `${percentage}%`);
  if (Math.abs(percentage) < 1e-5 || (useCrit && !updateCooldownCrit)) {
    $(`${selector} .cooldown`).css('width', '0%');
    $(selector).removeClass('disabled');
    callback();
    return;
  }
  setTimeout(() => updateCooldown(selector, percentage, seconds, callback), 10);
}
function startCombatCooldown(selector, seconds) {
  $(selector).addClass('disabled');
  updateCombatCooldown(selector, 100, seconds);
}
function startCooldown(selector, seconds, callback = () => { },
  useCrit = false) {
  $(selector).addClass('disabled');
  updateCooldown(selector, 100, seconds, callback);
}

function endCombat() {
  for (let item of breakableWeapons) {
    $(`#combat_my_${item}`).removeClass('my_moving_attack');
    $(`#use_${item} .cooldown`).css('width', '0%');
  }
  $('#combat_my_fist').removeClass('my_moving_attack');
  $('#use_fist .cooldown').css('width', '0%');
  $('#use_medicine .cooldown').css('width', '0%');
  $('#combat_foe_attack').removeClass('foe_moving_attack');
  $('#combat').css('display', 'none');
  if (hp === 0) {
    if (!showPhys) {
      showPhys = true;
      message('phys learnt')
    }
    dead(foe); return;
  }
  confirmCallback = combatCallback;
  makeAdvancement("monster killer");
  campusEvent(`kill_${foe}`);
}

let dodgeCombatCheckId;
function prepareCombat() {
  for (let item of breakableWeapons) {
    $(`#use_${item}`).on('mousedown', () => {
      if ($(`#use_${item}`).hasClass('disabled')) { return; }
      let info = attackInfo[item];
      if (backpack[item] === undefined ||
        (info.cost !== undefined && backpack[info.cost] === 0)) {
        $(`#use_${item}`).addClass('disabled');
        return;
      }
      let damage = info.damage;
      if (Math.random() < combatInfo[foe].dodgeProb) {
        damage = 0;
        $('#combat_foe_dodge').addClass('dodging');
        let id = Math.random();
        dodgeCombatCheckId = id;
        setTimeout(() => {
          if (dodgeCombatCheckId === id) {
            $('#combat_foe_dodge').removeClass('dodging');
          }
        }, 500);
      }
      foeHp = Math.max(0, foeHp - damage);
      if (info.cost !== undefined) { backpack[info.cost]--; }
      backpack[item]--;
      updateBackpack();
      if (foeHp === 0) { endCombat(); return; }
      if (backpack[item] === 0) { backpack[item] = undefined; }
      $(`#combat_my_${item}`).css('display', 'inline');
      setTimeout(() => $(`#combat_my_${item}`).addClass('my_moving_attack'), 1);
      // 这里有可能 501ms 之后已经是另一颗子弹了（另一个战斗页面）
      setTimeout(
        () => $(`#combat_my_${item}`).css('display', 'none')
          .removeClass('my_moving_attack')
        , 501);
      startCombatCooldown(`#use_${item}`, info.interval);
    });
  };
  $('#use_fist').on('mousedown', () => {
    if ($('#use_fist').hasClass('disabled')) { return; }
    let info = attackInfo.fist;
    let damage = info.damage;
    if (Math.random() < combatInfo[foe].dodgeProb) {
      damage = 0;
      $('#combat_foe_dodge').addClass('dodging');
      let id = Math.random();
      dodgeCombatCheckId = id;
      setTimeout(() => {
        if (dodgeCombatCheckId === id) {
          $('#combat_foe_dodge').removeClass('dodging');
        }
      }, 500);
    }
    foeHp = Math.max(0, foeHp - damage);
    updateBackpack();
    if (foeHp === 0) { endCombat(); return; }
    $('#combat_my_fist').css('display', 'inline');
    setTimeout(() => $('#combat_my_fist').addClass('my_moving_attack'), 1);
    // 这里有可能 501ms 之后已经是另一颗子弹了（另一个战斗页面）
    setTimeout(
      () => $('#combat_my_fist').css('display', 'none')
        .removeClass('my_moving_attack')
      , 501);
    startCombatCooldown('#use_fist', info.interval);
  });
  $('#use_medicine').on('mousedown', () => {
    if ($('#use_medicine').hasClass('disabled')) { return; }
    if (backpack.medicine === 0) {
      $('#use_medicine').addClass('disabled');
      return;
    }
    hp = Math.min(maxHp, hp + 50);
    backpack.medicine--;
    updateBackpack();
    startCombatCooldown('#use_medicine', 3);
  });
}

function foeAttack() {
  if ($('#combat').css('display') === 'none') { return; }
  let damage = randBetween(combatInfo[foe].minDamage,
    combatInfo[foe].maxDamage);
  if (Math.random() < dodgeProb) {

  }
  hp = Math.max(0, hp - damage);
  if (hp === 0) { endCombat(); return; }
  updateBackpack();
  $('#combat_foe_attack').css('display', 'inline');
  setTimeout(() => $('#combat_foe_attack').addClass('foe_moving_attack'), 1);
  setTimeout(
    () => $('#combat_foe_attack').css('display', 'none')
      .removeClass('foe_moving_attack')
    , 501);
  setTimeout(foeAttack, combatInfo[foe].interval * 1000);
}

let combatCallback = () => { };
function combat(type, callback = () => { }) {
  combatCallback = callback;
  $('#combat').css('display', 'inherit');
  let info = combatInfo[type];
  $('#combat_foe').text(info.char);
  hp = maxHp;
  $('#combat_foe_attack').text(info.bullet);
  $('#combat_foe_hp').text(`${info.hp}/${info.hp}`);
  $('#combat_title').text(info.name);
  foe = type;
  foeHp = info.hp;
  log(info.log);
  setTimeout(foeAttack, info.interval * 1000);
}

function dead(cause) {
  message(`death of ${cause}`);
  backpack = JSON.parse(JSON.stringify(initBackpack));
  startCooldown('#set_off', deathPenalty, () => {
    if (backpack.senseOfDirection === 0) {
      $('#set_off').addClass('disabled');
    }
  });
  home();
}

function enterBuilding() {
  if (building.finished) {
    switch (building.type) {
      case 'cafe': campusEvent('drink_coffee'); break;
      case 'hall': campusEvent('watch_movie'); break;
      case 'canteen': campusEvent('have_meal'); break;
      case 'gym': campusEvent('exercise'); break;
      default:
        showCampusEventBox(building.name, '这里已经没有什么好害怕的了。');
    }
    return;
  }
  showCampusEventBox(building.name, '从门口望去，这里走廊深邃看不见尽头。', () => {
    let index = Math.floor(Math.random() * (nowCampus === 'middle' ? 2 : 4));
    combat(['boxer', 'archer', 'swordsman', 'druggist'][index], () => {
      building.finished = true;
      if (building.type === 'chem' && !showChem) {
        message('chem learnt');
        showChem = true;
      }
      if (building.type === 'chem' && !showRpg) {
        message('rpg learnt');
        showRpg = true;
      }
      if (building.type === 'phys' && !showLaser) {
        message('laser learnt');
        showLaser = true;
      }
      if (building.type === 'library') {
        stage++;
        message(stageInfo[stage].en);
        $('#stage').text(stageInfo[stage].zh);
      }
      let str = `${building.name}现在安全了。`, gain;
      switch (building.type) {
        case 'teach':
          gain = randBetween(50, 100);
          mathValue += gain;
          str += `\n\n获得：\n数学能力值 x${gain}`;
          break;
        case 'phys':
          gain = randBetween(50, 100);
          physValue += gain;
          str += `\n\n获得：\n物理能力值 x${gain}`;
          break;
        case 'chem':
          gain = randBetween(50, 100);
          chemValue += gain;
          str += `\n\n获得：\n化学能力值 x${gain}`;
          break;
      }
      showCampusEventBox(building.name, str);
    });
  });
}

function moveMe(e) {
  if (nowCampus === undefined) { return; }
  if ($('#campus_event').css('display') !== 'none') { return; }
  if ($('#combat').css('display') !== 'none') { return; }
  let moveToCampus = (id, timeStamp, dx) => {
    setTimeout(() => {
      if (lastMoveTimeStamp === timeStamp) {
        nowX -= dx;
        nowY = 63 - nowY;
        changingCampus = false;
        changeMap(id);
        makeAdvancement("switch campus");
      }
    }, 1000);
  };
  let minInterval = 500 / velocity;
  switch (e.originalEvent.key) {
    case 'ArrowLeft':
      if (nowY == 0) {
        if (changingCampus) { return; }
        if (e.timeStamp - lastMoveTimeStamp < minInterval) { return; }
        lastMoveTimeStamp = e.timeStamp;
        changingCampus = true;
        if (nowCampus === 'middle') {
          moveToCampus('west', lastMoveTimeStamp, middleHeight - westHeight);
        } else {
          moveToCampus('middle', lastMoveTimeStamp, eastHeight - middleHeight);
        }
        break;
      }
      if (eval(`${nowCampus}Campus`)[nowX][nowY - 1] === '#') { return; }
      if (e.timeStamp - lastMoveTimeStamp < minInterval) { return; }
      lastMoveTimeStamp = e.timeStamp;
      nowY--;
      break;
    case 'ArrowRight':
      if (nowY == 63) {
        if (changingCampus) { return; }
        if (e.timeStamp - lastMoveTimeStamp < minInterval) { return; }
        lastMoveTimeStamp = e.timeStamp;
        changingCampus = true;
        if (nowCampus === 'middle') {
          moveToCampus('east', lastMoveTimeStamp, middleHeight - eastHeight);
        } else {
          moveToCampus('middle', lastMoveTimeStamp, westHeight - middleHeight);
        }
        break;
      }
      if (eval(`${nowCampus}Campus`)[nowX][nowY + 1] === '#') { return; }
      if (e.timeStamp - lastMoveTimeStamp < minInterval) { return; }
      lastMoveTimeStamp = e.timeStamp;
      nowY++;
      break;
    case 'ArrowUp':
      if (eval(`${nowCampus}Campus`)[nowX - 1][nowY] === '#') { return; }
      if (e.timeStamp - lastMoveTimeStamp < minInterval) { return; }
      lastMoveTimeStamp = e.timeStamp;
      nowX--;
      break;
    case 'ArrowDown':
      if (eval(`${nowCampus}Campus`)[nowX + 1][nowY] === '#') { return; }
      if (e.timeStamp - lastMoveTimeStamp < minInterval) { return; }
      lastMoveTimeStamp = e.timeStamp;
      nowX++;
      break;
    default: return;
  }
  if (nowCampus === 'middle' && nowX === initX && nowY === initY) {
    home(); return;
  }
  discover();
  backpack.senseOfDirection--;
  if (backpack.senseOfDirection === 5) { message('senseOfDirection <= 5'); }
  if (backpack.senseOfDirection === 0) { message('senseOfDirection <= 0'); }
  if (backpack.senseOfDirection === -1) {
    dead('senseOfDirection');
    return;
  }
  updateBackpack();
  changeMap(nowCampus);
  for (building of buildings) {
    if (building.campus === nowCampus && building.x === nowX &&
      building.y === nowY) {
      enterBuilding(); return;
    }
  }
  // return;
  if (nowCampus === 'middle' && Math.hypot(nowX - initX, nowY - initY) < 10) {
    return;
  }
  if (Math.random() < 0.04) {
    let index = Math.floor(Math.random() * (nowCampus === 'middle' ? 2 : 4));
    combat(['boxer', 'archer', 'swordsman', 'druggist'][index]);
    return;
  }
  if (Math.random() < 0.02) {
    campusEvent('pick_chem');
    return;
  }
  if (Math.random() < 0.005 && stage >= 3) {
    campusEvent('meet_mentor');
    return;
  }
}
function moveTab(e) {
  if (nowCampus !== undefined) { return; }
  if (e.timeStamp - lastMoveTimeStamp <= 1000) { return; }
  if (e.originalEvent.key === 'ArrowLeft') {
    if (nowTab === 'campus') { changeTab('dorm'); }
    if (nowTab === 'thesis') { changeTab('campus'); }
  } else if (e.originalEvent.key === 'ArrowRight') {
    if (nowTab === 'campus') { changeTab('thesis'); }
    if (nowTab === 'dorm') { changeTab('campus'); }
  }
}
function prepareThesis() {
  for (let idx = 0; idx < 3; idx++) {
    let subId = subjects[idx];

    $("#" + subId + "_joingroup").on('mousedown', () => {
      if (joinGroup[idx]) return;
      joinGroup[idx] = true;
      message("join group");
      updateDom();
    });

    $("#" + subId + "_writethesis").on('mousedown', () => {
      if (writeThesis[idx]) return;
      if (eval(subId + "Value < 1000")) { message(subId + ' low'); return; }
      writeThesis[idx] = true;
      message("write thesis");
      eval(subId + "Value -= 1000");
      updateDom();
    });

    $("#" + subId + "_checking").on('mousedown', () => {
      if ($("#" + subId + "_checking_cooldown").css("width") != "0px") { return; }
      if (eval(subId + "Value < 500")) { message(subId + ' low'); return; }
      checkingCnt[idx]++;
      message("check thesis");
      eval(subId + "Value -= 500");
      startCooldown("#" + subId + "_checking", 60);
      updateDom();
    });

    $("#" + subId + "_defense").on('mousedown', () => {
      if (nowDefense) return;
      if (eval(subId + "Value < 3000")) { message(subId + ' low'); return; }
      eval(subId + "Value -= 3000");
      defenseSubject = subId;
      startDefense(checkingCnt[idx]);
    });
  }
}

function victory() { // 胜利界面
  makeAdvancement("graduate");
  $('#defensebox').css("display", "none");
  nowDefense = false;
  gameEnd = true;
  if (defenseSubject == 'math') $($(".victory_school td")[1]).text('数学系');
  if (defenseSubject == 'phys') $($(".victory_school td")[1]).text('物理系');
  if (defenseSubject == 'chem') $($(".victory_school td")[1]).text('化学系');
  mathSpeed = 0;
  physSpeed = 0;
  chemSpeed = 0;
  $(".victory_grade .value").text(stageInfo[stage].zh);
  $(".victory").css("display", "block");
}

function failDefense() {
  $('#defensebox').css("display", "none");
  $(".thesis_main").css("display", "block");
  nowDefense = false;
  defenseSubject = undefined;
  message("fail defense");
}

function startDefense(checkcnt) {  // defense 一词好在哪里？表达了作者怎样的思想感情？（4 分）
  DefenseCnt++;
  let DefenseCur = DefenseCnt;
  nowDefense = true;
  $(".thesis_main").css("display", "none");


  let period = 200 + 100 * checkcnt;
  let periodnum = 30;

  let clickednum = 0;
  let changePos = () => {
    if (!nowDefense || DefenseCur != DefenseCnt) return;
    let xPos = Math.floor(Math.random() * 50) + 10;
    let yPos = Math.floor(Math.random() * 50) + 10;
    $('#defensebox').css("top", `${xPos}%`);
    $('#defensebox').css("left", `${yPos}%`);
    $('#defensebox').css("display", "block");
  }

  changePos();
  startCooldown('#defensebox', 1, () => { }, true);

  setTimeout(() => {
    if (!nowDefense || DefenseCur != DefenseCnt) return;
    if (clickednum == 0) failDefense();
  }, 1000);

  $('#defensebox').on('mousedown', () => {
    if (!nowDefense || DefenseCur != DefenseCnt) return;
    clickednum++;

    updateCooldownCrit = false;
    $('#defensebox').css("display", "none");
    if (clickednum == periodnum) { victory(); return; }

    let currentClick = clickednum;

    setTimeout(() => {
      if (!nowDefense || DefenseCur != DefenseCnt) return;
      changePos();
      updateCooldownCrit = true;
      startCooldown('#defensebox', period / 1000, () => { }, true);
    }, 150);

    setTimeout(() => {
      if (!nowDefense || DefenseCur != DefenseCnt) return;
      if (currentClick == clickednum) failDefense();
    }, period + 150);
  });


  // setTimeout(() => {
  //   $(".thesis_main").css("display", "block");
  //   nowDefense = false;
  // }, 3000);
}

function addMentor(subId) {
  makeAdvancement("meet mentor");
  let subindex = subjects.indexOf(subId);
  showTeacher[subindex] = true;
  updateDom();
}

function autosave() {
  for (let varName of autosaveVariables) {
    Cookies.set(varName, eval(varName));
  }
}
function loadSaveData() {
  for (let varName of autosaveVariables) {
    eval(`${varName} = Cookies.getJSON('${varName}')`);
    if (eval(varName) === 'undefined') {
      eval(`${varName} = undefined`);
    }
  }
}
function manuallySave() {
  if ($('#manually_save').hasClass('saved')) { return; }
  autosave();
  $('#manually_save').text('saved!').addClass('saved');
  setTimeout(() => $('#manually_save').text('save.').removeClass('saved'), 800);
}

function main() {
  //loadSaveData();   // TODO: 本地这行要注释掉，除非有人知道怎么对本地 html 开 cookies.
  initVariables();
  debugSaveFile();
  updateDom();
  setUpMouseBox();
  prepareDataRows();  // 使数据表的每一行开启鼠标小框
  prepareInc();
  prepareWeapon();
  preparePrepare();  // 准备“出发前的准备”
  prepareEvent();
  prepareThesis();
  prepareCombat();
  $(document).on('keydown', (e) => moveMe(e));
  $(document).on('keyup', (e) => moveTab(e));
  for (let tabId of tabIds) {
    $(`#tab_${tabId}`).on('click', () => {
      if (nowCampus === undefined && nowDefense == false && !gameEnd) { changeTab(tabId); }
    });
  }
  $('#campus_event_button').on('mousedown', () => {
    $('#campus_event').css('display', 'none');
    confirmCallback();
  });
  setInterval(autosave, autosaveInterval * 1000);
  $('#manually_save').on('mousedown', manuallySave);

  // ======== 上面是必须加载的部分，下面是 debug

  // changeTab('campus');
  // setOff();
  // combat('archer');
}