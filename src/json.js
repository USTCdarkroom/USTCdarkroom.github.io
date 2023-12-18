const achieves = [
  { id: 'avoid_hit', txt: '找到别人打不到的地方。' },
  { id: 'one_library', txt: '博览群书，六艺皆通。' },
  { id: 'two_libraries', txt: '古往今来，无所不晓。' },
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
        txt: "不参加", res: () => {}
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
