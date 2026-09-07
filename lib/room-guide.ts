import type { Language } from './content';
export type StudyPanel =
  | 'map'
  | 'writing'
  | 'computer'
  | 'tactics'
  | 'guide'
  | 'suggestions';
export const roomGuide = (lang: Language) =>
  lang === 'zh'
    ? [
        {
          id: 'move',
          title: '走进房间',
          text: 'WASD / 方向键行走 · C 站立 / 蹲下。鼠标转头，瞄点对准后点击或按 E。Esc 释放鼠标。',
        },
        {
          id: 'drag',
          title: '拖动与触屏',
          text: '向右拖＝向左看；向下拖＝抬头。手机用左下摇杆移动。滚轮 / 双指靠近或后退，到墙面和家具前停下。',
        },
        {
          id: 'writing',
          title: '桌上的文稿',
          text: '点纸张阅读文章、随笔与诗歌。返回目录继续挑选，关闭回到原位。',
        },
        {
          id: 'computer',
          title: '我的电脑',
          text: '点电脑浏览 Projects；任务栏打开或最小化 Terminal。输入 help 查看命令。',
        },
        {
          id: 'television',
          title: '休息与游戏',
          text: '点电视玩贪吃蛇和星际飞行，点沙发坐下。游戏中 Esc 回菜单，再按一次回房间。',
        },
        {
          id: 'art',
          title: '墙上的收藏',
          text: '四幅照片和世界地图都能点击靠近。点落地灯开关，点窗户切换昼夜；架上的问号藏着小彩蛋。',
        },
        {
          id: 'tactics',
          title: '排一个阵型',
          text: '点战术板，拖动红蓝号码磁粒布置阵型，碰到其他磁粒时会沿边缘滑动，可随时复位。足球自动滚动，拖动后松手继续，碰到磁粒会反弹；进球显示 GOAL 奖励，再回到中圈。',
        },
        {
          id: 'suggestions',
          title: '留下建议',
          text: '右侧访客簿可以留言与投票。每位访客每天最多留下两条建议。',
        },
      ]
    : [
        {
          id: 'move',
          title: 'Make yourself at home',
          text: 'WASD / arrows walk. C stands / crouches. Move the mouse to look; aim and click or press E. Esc releases the cursor.',
        },
        {
          id: 'drag',
          title: 'Drag & touch',
          text: 'Drag right to look left, down to look up. Mobile: left joystick walks. Scroll / pinch moves forward or back, stopping at walls and furniture.',
        },
        {
          id: 'writing',
          title: 'On the paper',
          text: 'Read articles, essays and poems. Return to the index, or close to return to your previous view.',
        },
        {
          id: 'computer',
          title: 'My computer',
          text: 'Browse Projects. Open or minimize Terminal from the taskbar. Type help for commands.',
        },
        {
          id: 'television',
          title: 'Rest & play',
          text: 'TV: Snake and Starflight. Sofa: take a seat. Esc returns from a game to the menu, then to the room.',
        },
        {
          id: 'art',
          title: 'Little collections',
          text: 'Click any picture or the world map to look closer. Click the lamp or window for lighting. The question block holds a little surprise.',
        },
        {
          id: 'tactics',
          title: 'Set your formation',
          text: 'Open the tactics board, drag the numbered magnets around each other; they slide along contact edges without overlapping. Reset whenever you like. The ball rolls, bounces off magnets, and resumes after you drag and release it. Score a goal for a small reward, then the ball returns to the centre.',
        },
        {
          id: 'suggestions',
          title: 'Leave a suggestion',
          text: 'Open the visitor book beside these notes to leave a note or vote. Up to two notes per visitor per day.',
        },
      ];
export const studyLabel = (id: StudyPanel, lang: Language) =>
  ({
    map: lang === 'zh' ? '世界地图' : 'World map',
    writing: lang === 'zh' ? '阅读文稿' : 'Read writing',
    computer: lang === 'zh' ? '打开电脑' : 'Open computer',
    tactics: lang === 'zh' ? '足球战术板' : 'Tactics board',
    guide: lang === 'zh' ? '房间操作' : 'Room controls',
    suggestions: lang === 'zh' ? '建议访客簿' : 'Suggestions',
  })[id];
