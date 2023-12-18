"use strict";

$(main);

const tabIds = ['dorm', 'campus', 'thesis'];
const subjects = ['math', 'phys', 'chem'];
const achieves = [
  {id: 'avoid_hit', txt: '找到别人打不到的地方。'},
  {id: 'one_library', txt: '博览群书，六艺皆通。'},
  {id: 'two_libraries', txt: '古往今来，无所不晓。'},
];
const breakableWeapons = ['bow', 'sword', 'gun', 'rpg', 'laser'];
const items = ['bow', 'sword', 'gun', 'rpg', 'laser', 'bullet', 'cannonball',
               'arrow', 'medicine'];
const producableWeapons = ['sword', 'gun', 'bullet', 'rpg', 'cannonball',
                           'laser'];
const bowMax = 10, swordMax = 10, gunMax = 50, rpgMax = 50, laserMax = 100;

const sortCmp = (a, b) => {
  if (a > b) { return 1; }
  if (a < b) { return -1; }
  return 0;
}

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
  if (logTexts[logTexts.length - 1].id == id) {
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
  if (nowTab == tab) { return; }
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

function updateValue() {  // 更新能力值。因为很常用于是单独拿出来。
  for (let sub of subjects) {
    $($(`#${sub}_value td`)[1]).text(eval(`${sub}_value`));
  }
}

function updateDom() {  // 更新 DOM 元素使之符合最新变量。更新变量后需调用。
  updateValue();

  if (showPhys) { $('#phys_inc, #phys_value').css('display', 'table-row'); }
  if (showChem) { $('#chem_inc, #chem_value').css('display', 'table-row'); }

  // 成就
  let achieveIds = [];
  for (let achieve of achieves) {
    achieveIds.push(achieve.id);
  }
  for (let achieveId of achieveIds) {
    if (achieved.indexOf(achieveId) != -1) {
      $(`#${achieveId}`).css('display', 'table-row');
    }
  }

  // 道具库
  if (showPhys || showChem) { $('#produce_weapon').css('display', 'inherit'); }
  if (showPhys && showChem) { $('#study_weapon').css('display', 'inherit'); }
  var show = (weapon) => {
    $('#' + weapon).css('display', 'inherit');
    $(`#${weapon}_count`).css('display', 'table-row');
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

  for (let item of items) {
    let count = eval(`${item}s`);
    if (count.length !== undefined) { count = count.length; }
    $($(`#${item}_count td`)[1]).text(count);
  }
  
  // 增量调整栏
  $($('#rest td')[1]).text(rest_speed);

  for (let sub of subjects) {
    $($(`#${sub}_inc td`)[1]).text(eval(`${sub}_speed`));
    let bind = (idx, expr) => {
      $($(`#${sub}_inc i`)[idx]).css('color', expr ? 'black' : 'grey'); };
    bind(0, rest_speed >= 1);
    bind(1, eval(`${sub}_speed`) >= 1);
    bind(2, rest_speed >= 10);
    bind(3, eval(`${sub}_speed`) >= 10);
  }
}

function prepareDataRows() {
  $('#math_value').on('mouseover', () => { onMouseBox('数学能力: +' + math_speed + '/10s'); });
  $('#phys_value').on('mouseover', () => { onMouseBox('物理能力: +' + phys_speed + '/10s'); });
  $('#chem_value').on('mouseover', () => { onMouseBox('化学能力: +' + chem_speed + '/10s'); });
  for (let i of subjects) {
    $(`#${i}_value`).on('mouseleave', () => { offMouseBox(); });
  }

  for (let weapon of breakableWeapons) {
    $(`#${weapon}_count`)
      .on('mouseover', () => {
        let str = '耐久度: ';
        let tmp = eval(`${weapon}s`);
        if (tmp.length == 0) { return; }
        tmp.sort(sortCmp); 
        let count = 0, max = eval(`${weapon}Max`);
        for (let i = tmp.length - 1; i >= 0; --i) {
          count++;
          if (i == 0 || tmp[i] != tmp[i - 1]) {
            str += `${tmp[i] * 100 / max}%x${count}, `;
            count = 0;
          }
        }
        onMouseBox(str.substring(0, str.length - 2));
      })
      .on('mouseleave', () => { offMouseBox(); });
  }
  
  for (let ach of achieves) {
    $('#' + ach.id)
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
    $('#' + weapon).on('mousedown', () => { buyWeapon(weapon); });
  }
}

function main() {
  debugSaveFile();
  updateDom();
  setUpMouseBox();
  prepareDataRows();  // 使数据表的每一行开启鼠标小框
  prepareInc();
  prepareWeapon();
  for (let tabId of tabIds) {
    $(`#tab_${tabId}`).on('click', () => { changeTab(tabId); });
  }
}