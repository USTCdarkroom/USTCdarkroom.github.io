"use strict";

$(main);

const tabIds = ['dorm', 'campus', 'thesis'];
const subjects = ['math', 'phys', 'chem'];
const achieves = [
  { id: 'avoid_hit', txt: '找到别人打不到的地方。', name: '避实就虚' },
  { id: 'one_library', txt: '博览群书，六艺皆通。', name: '学富五车' },
  { id: 'two_libraries', txt: '古往今来，无所不晓。', name: '才高八斗' },
  { id: 'barehand_killer', txt: '空手以敌千军万马', name: '徒手战士' }
];
const events = [
  {
    event: "数理基础得到进一步巩固",
    opt: [{ txt: "确认", res: () => { math_value += 100; phys_value += 100; } }]
  }, {
    event: "美丽邂逅开始了报名",
    opt: [
      {
        txt: "参加", res: () => {
          let x = 2;
          while (rest_speed > 0 && x > 0) { rest_speed--; x--; }
          while (math_speed > 0 && x > 0) { math_speed--; x--; }
          while (phys_speed > 0 && x > 0) { phys_speed--; x--; }
          while (chem_speed > 0 && x > 0) { chem_speed--; x--; }
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
          math_speed++; phys_speed++; chem_speed++;
        }
      }, {
        txt: "不参加", res: () => { }
      }
    ]
  }
];
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

const sortCmp = (a, b) => a - b;

let nowTab = 'dorm';

// 能力值及增速 
let math_speed = 0, phys_speed = 0, chem_speed = 0, rest_speed = 20;
let math_value = 0, phys_value = 0, chem_value = 0;

// 道具库
let bows = [], swords = [], guns = [], rpgs = [], lasers = [];  // 仅存工具耐久度
let bullets = 0, cannonballs = 0, arrows = 0, medicines = 0;

// 进度
let achieved = [];  // 仅存成就 id
let showPhys = false, showChem = false;
let showBow = false, showRpg = false, showLaser = false, showMedicine = false;
let learntPowder = false, learntDynamite = false;

let logTexts = [];  // { id: [string], text: [string] }
let lastMoveTimeStamp = 0, changingCampus = false;

// 随机事件
let showEvent = false;
let currnet_event = 0;

// 成就
let current_achieve = 0;

// 背包
let velocity = 1;
let backpack = JSON.parse(JSON.stringify(initBackpack));

let nowX = initX, nowY = initY;  // 向下为 x 轴正方向，向右为 y 轴正方向，这是初始坐标
let nowCampus;

function debugSaveFile() {
  math_value = phys_value = chem_value = 10000;
  bows = [1, 2, 3, 4];
  swords = [10, 7, 3, 9, 2];
  guns = [12, 12, 2, 2, 20];
  lasers = [7, 7, 17, 19, 30];
  rpgs = [3, 7, 10, 20, 20];
  // achieved = ['avoid_hit', 'one_library', 'two_libraries'];
  arrows = cannonballs = bullets = medicines = 30;
  showBow = showPhys = showChem = showRpg = showLaser = showMedicine = true;
  learntDynamite = learntPowder = true;
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
  switch (expr) {
    // Error
    case 'math low': log('数学能力不足。'); break;
    case 'phys low': log('物理能力不足。'); break;
    case 'chem low': log('化学能力不足。'); break;
    case '!learnt powder': log('还未掌握火药制造。'); break;
    case '!learnt dynamite': log('还未掌握炸药制造。'); break;

    // Info
    case 'powder learnt': log('掌握了火药的制造。'); break;
    case 'dynamite learnt': log('掌握了炸药的制造。'); break;
    case 'buy sword': log('制作了一把剑。'); break;
    case 'buy gun': log('制作了一把枪。'); break;
    case 'buy bullet': log('制作了一颗子弹。'); break;
    case 'buy rpg': log('制作了一个火箭筒。'); break;
    case 'buy cannonball': log('制作了一枚炮弹。'); break;
    case 'buy laser': log('制作了一副激光武器。'); break;

    // Info in campus
    case 'senseOfDirection <= 5': log('方向感快用完了。'); break;
    case 'senseOfDirection <= 0': log('方向感用完了。'); break;
    case 'death of senseOfDirection':
      log('眼前的道路诡异地扭曲直至消失，回过神来已经被送到了宿舍。'); break;
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
  for (let sub of subjects) {
    $(`.${sub}_value td.value`).text(eval(`${sub}_value`));
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
  bind('#velocity', 0, math_value >= 50 && velocity <= 399);
  bind('#velocity', 1, velocity >= 2);
  if (backpack.senseOfDirection >= 1) {
    $('#set_off').addClass('active_box').removeClass('inactive_box');
  } else {
    $('#set_off').addClass('inactive_box').removeClass('active_box');
  }

  let link = (id, cost, gain) => {
    $($(`#${id} td`)[1]).text(backpack[gain]);
    bind(`#${id}`, 0, eval(cost) >= 1 && backpack[gain] <= 399);
    bind(`#${id}`, 1, backpack[gain] >= 1);
    bind(`#${id}`, 2, eval(cost) >= 10 && backpack[gain] <= 390);
    bind(`#${id}`, 3, backpack[gain] >= 10);
  };
  link('sense_of_direction', 'math_value', 'senseOfDirection');
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

function updateBackpack() {  // 更新背包栏。
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
      changeText(weapon, backpack[weapon] * 100 / eval(`${weapon}Max` + '%'));
    }
  }
}

function updateDom() {  // 更新 DOM 元素使之符合最新变量。更新变量后需调用。
  updateValue();

  if (showPhys) { $('#phys_inc, .phys_value').css('display', 'table-row'); }
  if (showChem) { $('#chem_inc, .chem_value').css('display', 'table-row'); }

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
    $(`.${weapon}_count`).css('display', 'table-row');
    $(`#${weapon}_taken`).css('display', 'table-row');
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
  $($('#rest td')[1]).text(rest_speed);

  let bind = (row, idx, expr) => {
    $($(`${row} i`)[idx]).css('color', expr ? 'black' : 'grey');
  };
  for (let sub of subjects) {
    $($(`#${sub}_inc td`)[1]).text(eval(`${sub}_speed`));
    bind(`#${sub}_inc`, 0, rest_speed >= 1);
    bind(`#${sub}_inc`, 1, eval(`${sub}_speed`) >= 1);
    bind(`#${sub}_inc`, 2, rest_speed >= 10);
    bind(`#${sub}_inc`, 3, eval(`${sub}_speed`) >= 10);
  }

  // 出发准备栏
  updatePrepare();
}

function prepareDataRows() {
  $('.math_value').on('mouseover', () => { onMouseBox(`数学能力: +${math_speed}/10s`); });
  $('.phys_value').on('mouseover', () => { onMouseBox(`物理能力: +${phys_speed}/10s`); });
  $('.chem_value').on('mouseover', () => { onMouseBox(`化学能力: +${chem_speed}/10s`); });
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
      if (rest_speed >= 1) {
        rest_speed--; eval(`${subject}_speed++`);
      }
      break;
    case 1:  // -1
      if (eval(`${subject}_speed`) >= 1) {
        rest_speed++; eval(`${subject}_speed--`);
      }
      break;
    case 2:  // +10
      if (rest_speed >= 10) {
        rest_speed -= 10; eval(`${subject}_speed += 10`);
      }
      break;
    case 3:  // -10
      if (eval(`${subject}_speed`) >= 10) {
        rest_speed += 10; eval(`${subject}_speed -= 10`);
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
      eval(`${subject}_value += ${subject}_speed`);
      updateValue();
    }, 10000);
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
  $('#campus #campus_prepare_wrapper').css('display', 'none');
  $('#campus #data_wrapper').css('display', 'none');
  $('#campus #campus_map, #backpack_wrapper').css('display', 'block');
  $('#tab_dorm, #tab_thesis').css('color', 'grey');
  nowCampus = 'middle';
  discover();
  changeMap(nowCampus);
  updateBackpack();
}
function home() {
  $('#campus #campus_prepare_wrapper, #campus #data_wrapper')
    .css('display', 'block');
  $('#campus #campus_map, #backpack_wrapper').css('display', 'none');
  $('#tab_dorm, #tab_thesis').css('color', 'black');
  backpack.senseOfDirection = 0;
  velocity = 1;
  nowCampus = undefined;
  updateDom();
}
function preparePrepare() {
  adjustPrepareItem('sense_of_direction', 'math_value', 'senseOfDirection');
  for (let item of ['bullet', 'cannonball', 'arrow', 'medicine']) {
    adjustPrepareItem(`${item}_taken`, `${item}s`, item);
  }
  $($('#velocity i')[0]).on('mousedown', () => {
    if (math_value >= 50 && velocity <= 399) {
      math_value -= 50; velocity++;
    }
    updateDom();
  });
  $($('#velocity i')[1]).on('mousedown', () => {
    if (velocity >= 2) {
      velocity--; math_value += 50;
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
      if (phys_value < 50) { message('phys low'); break; }
      phys_value -= 50;
      swords.push(10);
      message('buy sword');
      break;
    case 'gun':
      if (phys_value < 100) { message('phys low'); break; }
      phys_value -= 100;
      guns.push(50);
      message('buy gun');
      break;
    case 'bullet':
      if (!learntPowder) { message('!learnt powder'); break; }
      if (chem_value < 2) { message('chem low'); break; }
      chem_value -= 2;
      bullets++;
      message('buy bullet');
      break;
    case 'rpg':
      if (math_value < 100) { message('math low'); break; }
      if (phys_value < 200) { message('phys low'); break; }
      math_value -= 100;
      phys_value -= 200;
      rpgs.push(50);
      message('buy rpg');
      break;
    case 'cannonball':
      if (!learntDynamite) { message('!learnt dynamite'); break; }
      if (chem_value < 5) { message('chem low'); break; }
      chem_value -= 5;
      cannonballs++;
      message('buy cannonball');
      break;
    case 'laser':
      if (math_value < 250) { message('math low'); break; }
      if (phys_value < 500) { message('phys low'); break; }
      math_value -= 250;
      phys_value -= 500;
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
      if (math_value < 100) { message('math low'); break; }
      if (chem_value < 200) { message('chem low'); break; }
      math_value -= 100;
      chem_value -= 200;
      learntPowder = true;
      break;
    case 'dynamite':
      if (learntDynamite) { break; }
      if (math_value < 250) { message('math low'); break; }
      if (chem_value < 500) { message('chem low'); break; }
      math_value -= 250;
      chem_value -= 500;
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
    if (nowTab == 'dorm' && !showEvent && Math.random() < prob) {
      currnet_event++;
      let cur = currnet_event;

      showEvent = true;
      $(`#darkfilter`).css("display", "block");
      $(`#eventbox`).css("display", "block");

      let eventid = Math.floor(Math.random() * events.length);
      $(`#eventtext`).text(events[eventid].event);

      for (let i = 0; i < events[eventid].opt.length; i++) {
        $(`#eventopt${i}`).css("display", "block");
        $(`#eventopt${i}`).text(events[eventid].opt[i].txt);
      }
      if (events[eventid].opt.length == 1) {
        $(`#eventopt1`).css("display", "none");
      }

      for (let i = 0; i < events[eventid].opt.length; i++) {
        $(`#eventopt${i}`).on('mousedown', () => {
          if (cur != currnet_event) return;
          $(`#darkfilter`).css("display", "none");
          $(`#eventbox`).css("display", "none");
          showEvent = false;
          events[eventid].opt[i].res();
          updateDom();
        });
      }
    }
  };
  setInterval(() => checkEvent(), 1000); // 每秒以 1/300 概率尝试生成随机事件
}

function makeAchievement(achieveId) {
  if (achieved.indexOf(achieveId) != -1) return;
  let remain_time = 3000;

  let achieveIndex = -1;
  for (let i = 0; i < achieves.length; i++)
    if (achieves[i].id == achieveId)
      achieveIndex = i;

  // console.log(achieveIndex);
  if (achieveIndex == -1) return;
  current_achieve = achieveIndex;

  $(`#achievementtext`).text(achieves[achieveIndex].name);
  $(`#achievementtext`).css("display", "block");
  $(`#reachachievement`).css("display", "block");
  $(`#achievementbox`).css("display", "block");

  setTimeout(() => {
    if (current_achieve == achieveIndex) {
      $(`#achievementtext`).css("display", "none");
      $(`#reachachievement`).css("display", "none");
      $(`#achievementbox`).css("display", "none");
    }
  }, remain_time);
  achieved.push(achieveId);
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

function moveMe(e) {
  if (nowCampus === undefined) { return; }
  let moveToCampus = (id, timeStamp, dx) => {
    setTimeout(() => {
      if (lastMoveTimeStamp === timeStamp) {
        nowX -= dx;
        nowY = 63 - nowY;
        changingCampus = false;
        changeMap(id);
      }
    }, 1000);
  };
  let minInterval = 50 / velocity;
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
    message('death of senseOfDirection');
    backpack = JSON.parse(JSON.stringify(initBackpack));
    home();
    return;
  }
  updateBackpack();
  changeMap(nowCampus);
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

function main() {
  debugSaveFile();
  updateDom();
  setUpMouseBox();
  prepareDataRows();  // 使数据表的每一行开启鼠标小框
  prepareInc();
  prepareWeapon();
  preparePrepare();  // 准备“出发前的准备”
  $(document).on('keydown', (e) => moveMe(e));
  $(document).on('keyup', (e) => moveTab(e));
  prepareEvent();
  for (let tabId of tabIds) {
    $(`#tab_${tabId}`).on('click', () => {
      if (nowCampus === undefined) { changeTab(tabId); }
    });
  }

  changeTab('campus');
  // setOff();
}