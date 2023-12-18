"use strict";

$(main);

const tabIds = ['dorm', 'campus', 'thesis'];
const subjects = ['math', 'phys', 'chem'];
const achieves = [
  {id: 'avoid_hit', txt: '找到别人打不到的地方。'},
  {id: 'one_library', txt: '博览群书，六艺皆通。'},
  {id: 'two_libraries', txt: '古往今来，无所不晓。'},
];
const events = [
  { txt: '得到学长帮扶，数理基础得到提升', opt: [`确认`] },
  { txt: '雪天骑车不幸摔倒，可支配时间下降', opt: [`确认`] },
];
const breakableWeapons = ['bow', 'sword', 'gun', 'rpg', 'laser'];
const items = ['bow', 'sword', 'gun', 'rpg', 'laser', 'bullet', 'cannonball',
               'arrow', 'medicine'];
const producableWeapons = ['sword', 'gun', 'bullet', 'rpg', 'cannonball',
                           'laser'];
const bowMax = 10, swordMax = 10, gunMax = 50, rpgMax = 50, laserMax = 100;

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

// 事件正在发生
let showEvent = false;

// 背包
let velocity = 1;
let backpack = {
  senseOfDirection: 0,
  bullet: 0, cannonball: 0, arrow: 0, medicine: 0,
  bow: undefined, sword: undefined, gun: undefined, rpg: undefined,
  laser: undefined
};

let nowX = 6, nowY = 46;  // 向下为 x 轴正方向，向右为 y 轴正方向，这是初始坐标
let nowCampus = 'middle';

function debugSaveFile() {
  math_value = phys_value = chem_value = 10000;
  bows = [1, 2, 3, 4];
  swords = [10, 7, 3, 9, 2];
  guns = [12, 12, 2, 2, 20];
  lasers = [7, 7, 17, 19, 30];
  rpgs = [3, 7, 10, 20, 20];
  achieved = ['avoid_hit', 'one_library', 'two_libraries'];
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
  logTexts.unshift({id: randomId, text: str});
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

// 非 ASCII 字符不要出现在 message 方法及注释外
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
  bind('#velocity', 0, math_value >= 50 && velocity < 9999);
  bind('#velocity', 1, velocity >= 2);
  if (backpack.senseOfDirection >= 1) {
    $('#set_off').addClass('active_box').removeClass('inactive_box');
  } else {
    $('#set_off').addClass('inactive_box').removeClass('active_box');
  }

  let link = (id, cost, gain) => {
    $($(`#${id} td`)[1]).text(backpack[gain]);
    bind(`#${id}`, 0, eval(cost) >= 1 && backpack[gain] < 9999);
    bind(`#${id}`, 1, backpack[gain] >= 1);
    bind(`#${id}`, 2, eval(cost) >= 10 && backpack[gain] < 9990);
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
    $($(`${row} i`)[idx]).css('color', expr ? 'black' : 'grey'); };
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
      if (eval(cost) >= delta && backpack[gain] + delta < 10000 &&
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
    console.log(weapons);
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
    console.log(weapons);
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
function preparePrepare() {
  adjustPrepareItem('sense_of_direction', 'math_value', 'senseOfDirection');
  for (let item of ['bullet', 'cannonball', 'arrow', 'medicine']) {
    adjustPrepareItem(`${item}_taken`, `${item}s`, item);
  }
  $($('#velocity i')[0]).on('mousedown', () => {
    if (math_value >= 50 && velocity < 9999) {
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
    if (backpack.senseOfDirection > 0) {
      $('#campus #campus_prepare_wrapper').css('display', 'none');
      $('#campus #data_wrapper').css('display', 'none');
      $('#campus #campus_map').css('display', 'block');
      changeMap('east');
    }
  });
}

function changeMap(name) {
  let mapStr = '';
  for (let line of eval(`${name}Campus`)) {
    mapStr = mapStr + '\n';
    for (let ch of line) {
      let str = '';
      switch (ch) {
        case '.': str = 'Dot'; break;
        case '#': str = 'Sharp'; break;
        default: str = 'Building' + ch;
      }
      mapStr += str;
    }
  }
  $('#campus_map').text(mapStr.substring(1));
  $('#campus_map')  // TODO: 减少这里 span 的数量，最后将不必要的删去
    .html($('#campus_map').html().replace(/\n/g, '<br/>'))
    .html($('#campus_map').html().replace(/Dot/g, 
                                          '.'))
    .html($('#campus_map').html().replace(/Sharp/g,
                                          '<span class="wall">#</span>'));  
  for (let ch of 'LTGR8CPHOA') {
    eval(`$('#campus_map').html($('#campus_map').html().replace(
          /Building${ch}/g, 
          '<span class="building building_${ch}">${ch}</span>'))`);
  }
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
    let cur = Math.random();
    console.log(nowTab, showEvent, cur);
    if (nowTab == 'dorm' && !showEvent && cur < prob) {
      showEvent = true;
      $(`#darkfilter`).css("display", "block");
      $(`#eventbox`).css("display", "block");

      setTimeout(() => {
        $(`#darkfilter`).css("display", "none");
        $(`#eventbox`).css("display", "none");
        showEvent = false;
      }, 10000);
    }
  };
  setInterval(() => checkEvent(), 1000);
}

function main() {
  debugSaveFile();
  updateDom();
  setUpMouseBox();
  prepareDataRows();  // 使数据表的每一行开启鼠标小框
  prepareInc();
  prepareWeapon();
  preparePrepare();  // 准备“出发前的准备”
  for (let tabId of tabIds) {
    $(`#tab_${tabId}`).on('click', () => { changeTab(tabId); });
  }

  changeTab('campus');
  $('#campus #campus_prepare_wrapper').css('display', 'none');
  $('#campus #data_wrapper').css('display', 'none');
  $('#campus #campus_map').css('display', 'block');
  changeMap('east');
}
