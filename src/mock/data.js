/* ============ 模拟数据 ============
   接口定好后，把这些 export 换成 fetch 后端返回即可，视图层不用动。
   数据字段严格对应之前约定的 JSON 结构。 */

// 知识树：课程 -> 章节 -> 知识点 -> 细分考点（叶子带题目）
// status: mastered 掌握 / weak 薄弱 / learning 进行中 / untouched 未开始
// desc: 节点下方的一行灰色说明（对应老师思维导图里"主题 + 副主题"的副主题）
// 注意：章节这一层仍保留 children = 知识点，诊断页 weakSetLink 依赖它，结构不能改。
export const knowledgeTree = {
  id: 'c1',
  name: '专升本计算机基础',
  label: '课程',
  desc: '三年制考纲 · 三大模块',
  progress: 46,
  children: [
    {
      id: 'ch1',
      name: '计算机基础知识',
      label: '章节',
      desc: '从发展历史到数据表示',
      progress: 62,
      children: [
        {
          id: 'k1', name: '计算机的发展与分类', label: '知识点', desc: '四代计算机 · 分类方式',
          progress: 100, status: 'mastered', setId: 's1',
          children: [
            { id: 'd1', name: '发展的四个阶段', desc: '电子管 → 晶体管 → 集成电路 → 大规模集成电路' },
            { id: 'd2', name: '按用途与规模分类', desc: '通用/专用；巨型、大型、小型、微型' }
          ]
        },
        {
          id: 'k2', name: '数制与编码', label: '知识点', desc: '进制转换 · 字符编码',
          progress: 24, status: 'weak', setId: 's2',
          children: [
            { id: 'd3', name: '进位计数制', desc: '二进制、八进制、十进制、十六进制' },
            { id: 'd4', name: '数制间转换', desc: '按权展开求和；除基取余、乘基取整' },
            { id: 'd5', name: '字符编码', desc: 'ASCII 码、汉字编码、Unicode' }
          ]
        },
        {
          id: 'k3', name: '计算机系统的组成', label: '知识点', desc: '硬件系统 + 软件系统',
          progress: 60, status: 'learning', setId: 's3',
          children: [
            { id: 'd6', name: '硬件五大部件', desc: '运算器、控制器、存储器、输入/输出设备' },
            { id: 'd7', name: '软件系统', desc: '系统软件与应用软件' }
          ]
        }
      ]
    },
    {
      id: 'ch2',
      name: '数据结构与算法',
      label: '章节',
      desc: '数据的组织与处理方式',
      progress: 38,
      children: [
        {
          id: 'k4', name: '数据结构概述', label: '知识点', desc: '逻辑结构 · 存储结构',
          progress: 80, status: 'mastered', setId: 's4',
          children: [
            { id: 'd8', name: '逻辑结构', desc: '集合、线性、树形、图形结构' },
            { id: 'd9', name: '存储结构', desc: '顺序存储与链式存储' }
          ]
        },
        {
          id: 'k5', name: '线性表', label: '知识点', desc: '顺序表 · 链表',
          progress: 75, status: 'learning', setId: 's5',
          children: [
            { id: 'd10', name: '顺序存储', desc: '地址连续，可随机存取' },
            { id: 'd11', name: '链式存储', desc: '指针相连，插入删除方便' }
          ]
        },
        {
          id: 'k6', name: '栈与队列', label: '知识点', desc: '受限的线性表',
          progress: 15, status: 'weak', setId: 's6',
          children: [
            { id: 'd12', name: '栈：先进后出', desc: '栈顶插入删除，函数调用与表达式求值' },
            { id: 'd13', name: '队列：先进先出', desc: '队尾入队、队头出队' },
            { id: 'd14', name: '循环队列', desc: '队空 front==rear，队满 (rear+1)%m==front' }
          ]
        },
        {
          id: 'k7', name: '树与二叉树', label: '知识点', desc: '层次结构 · 遍历',
          progress: 0, status: 'untouched', setId: 's7',
          children: [
            { id: 'd15', name: '树的基本概念', desc: '根、结点、度、深度、叶子' },
            { id: 'd16', name: '二叉树性质', desc: '第 i 层最多 2^(i-1) 个结点' },
            { id: 'd17', name: '遍历方式', desc: '先序、中序、后序、层序' }
          ]
        }
      ]
    },
    {
      id: 'ch3',
      name: '操作系统',
      label: '章节',
      desc: '系统资源的管理者',
      progress: 12,
      children: [
        {
          id: 'k8', name: '操作系统概述', label: '知识点', desc: '作用 · 分类',
          progress: 30, status: 'learning', setId: 's8',
          children: [
            { id: 'd18', name: '操作系统的作用', desc: '管理软硬件资源，提供用户接口' },
            { id: 'd19', name: '常见分类', desc: '批处理、分时、实时、网络操作系统' }
          ]
        },
        {
          id: 'k9', name: '进程与线程', label: '知识点', desc: '并发执行 · 资源调度',
          progress: 0, status: 'untouched', setId: 's9',
          children: [
            { id: 'd20', name: '进程的概念与状态', desc: '就绪、运行、阻塞三态转换' },
            { id: 'd21', name: '进程与线程区别', desc: '进程是资源分配单位，线程是 CPU 调度单位' }
          ]
        }
      ]
    }
  ]
}

// 题集概览：一个知识点一个题集
export const questionSets = {
  s6: {
    id: 's6',
    knowledgeName: '栈与队列',
    counts: { single: 8, multiple: 2, blank: 2 },
    total: 12,
    done: 4,
    questions: [
      { id: 'q1', type: 'single', stem: '栈的特点是（ ）。', status: 'correct',
        options: [{ key: 'A', text: '先进先出' }, { key: 'B', text: '先进后出' }, { key: 'C', text: '随机进出' }, { key: 'D', text: '只能从栈底进出' }],
        answer: 'B', analysis: '栈是限定仅在表尾进行插入和删除操作的线性表，表尾称为栈顶，因此最先入栈的元素压在最底部，最后出栈，即"先进后出"（LIFO）。' },
      { id: 'q2', type: 'single', stem: '队列在队头进行的操作是（ ）。', status: 'wrong',
        options: [{ key: 'A', text: '插入' }, { key: 'B', text: '删除' }, { key: 'C', text: '插入和删除' }, { key: 'D', text: '都不进行' }],
        answer: 'B', analysis: '队列是"先进先出"（FIFO）的线性表，只允许在队尾插入（入队）、在队头删除（出队）。' },
      { id: 'q3', type: 'multiple', stem: '下列关于栈的说法，正确的有（ ）。', status: 'correct',
        options: [{ key: 'A', text: '是一种线性表' }, { key: 'B', text: '只允许在一端进行操作' }, { key: 'C', text: '先进先出' }, { key: 'D', text: '可用于函数调用' }],
        answer: ['A', 'B', 'D'], analysis: '栈是操作受限的线性表，只能在栈顶一端插入删除，具有先进后出特性，常用于函数调用、表达式求值、括号匹配等场景。C 描述的是队列。' },
      { id: 'q4', type: 'single', stem: '循环队列用数组 A[0..m-1] 存放，队头指针 front，队尾指针 rear，队空的判定条件是（ ）。', status: 'doing',
        options: [{ key: 'A', text: 'front == rear' }, { key: 'B', text: '(rear+1)%m == front' }, { key: 'C', text: 'front == 0' }, { key: 'D', text: 'rear == m-1' }],
        answer: 'A', analysis: '循环队列中，队空时 front 与 rear 相等；队满时通常采用"牺牲一个存储单元"的方案，判定条件为 (rear+1)%m == front。两者需区分，否则无法判断空满。' },
      { id: 'q5', type: 'blank', stem: '栈的英文名称是 ______。', status: 'todo',
        options: [], answer: 'stack', analysis: '栈的英文是 stack，意为"堆叠"，形象地表达了元素层层压入、从顶部弹出的特点。' },
      { id: 'q6', type: 'blank', stem: '队列的特点是先进______。', status: 'todo',
        options: [], answer: '先出', analysis: '队列（queue）只允许在队尾插入、队头删除，因此最早进入的元素最先被移除，即"先进先出"（FIFO）。' }
    ]
  },
  s2: {
    id: 's2', knowledgeName: '数制与编码',
    counts: { single: 4, multiple: 1, blank: 1 }, total: 6, done: 2,
    questions: [
      { id: 'q7', type: 'single', stem: '十进制数 25 转换为二进制是（ ）。', status: 'wrong',
        options: [{ key: 'A', text: '11001' }, { key: 'B', text: '10101' }, { key: 'C', text: '10011' }, { key: 'D', text: '11100' }],
        answer: 'A', analysis: '25 除 2 取余倒序：25→12余1→6余0→3余0→1余1→0余1，倒序得 11001。' },
      { id: 'q8', type: 'blank', stem: '一个字节由 ______ 个二进制位组成。', status: 'correct',
        options: [], answer: '8', analysis: '1 字节（Byte）= 8 个二进制位（bit），是计算机存储信息的基本单位。' }
    ]
  },
  s5: {
    id: 's5', knowledgeName: '线性表',
    counts: { single: 5, multiple: 1, blank: 1 }, total: 7, done: 3,
    questions: [
      { id: 'q9', type: 'single', stem: '顺序存储结构的优点是（ ）。', status: 'correct',
        options: [{ key: 'A', text: '插入删除方便' }, { key: 'B', text: '可随机存取' }, { key: 'C', text: '存储空间可动态扩充' }, { key: 'D', text: '无需连续空间' }],
        answer: 'B', analysis: '顺序存储用连续的存储单元依次存放元素，可通过下标直接计算地址，实现随机存取；缺点是插入删除需要移动大量元素。' }
    ]
  },
  s1: {
    id: 's1', knowledgeName: '计算机的发展与分类',
    counts: { single: 2, multiple: 1, blank: 1 }, total: 4, done: 3,
    questions: [
      { id: 'q10', type: 'single', stem: '世界上第一台电子计算机 ENIAC 使用的主要电子元件是（ ）。', status: 'correct',
        options: [{ key: 'A', text: '电子管' }, { key: 'B', text: '晶体管' }, { key: 'C', text: '集成电路' }, { key: 'D', text: '大规模集成电路' }],
        answer: 'A', analysis: 'ENIAC 诞生于 1946 年，使用了约 1.8 万个电子管，属于第一代电子管计算机。此后依次发展为晶体管、中小规模集成电路、大规模和超大规模集成电路四代。' },
      { id: 'q11', type: 'single', stem: '按所用电子元件划分，第四代计算机采用的是（ ）。', status: 'correct',
        options: [{ key: 'A', text: '电子管' }, { key: 'B', text: '晶体管' }, { key: 'C', text: '中小规模集成电路' }, { key: 'D', text: '大规模和超大规模集成电路' }],
        answer: 'D', analysis: '计算机发展的四代依次以电子管、晶体管、中小规模集成电路、大规模和超大规模集成电路为标志。第四代自 20 世纪 70 年代至今，也正是微处理器和微型计算机飞速发展的时期。' },
      { id: 'q12', type: 'multiple', stem: '下列关于计算机分类的说法，正确的有（ ）。', status: 'correct',
        options: [{ key: 'A', text: '按用途可分为通用计算机和专用计算机' }, { key: 'B', text: '按规模可分为巨型机、大型机、小型机和微型机' }, { key: 'C', text: '巨型机运算速度快、存储容量大' }, { key: 'D', text: '微型机通常就是个人计算机（PC）' }],
        answer: ['A', 'B', 'C', 'D'], analysis: '按用途分通用与专用；按规模、速度和价格分巨型、大型、小型、微型机。巨型机用于航空航天、气象等大规模计算；微型机即个人计算机，是日常最常见的类型。四项均正确。' },
      { id: 'q13', type: 'blank', stem: '世界上第一台电子计算机的名字是 ______（填英文缩写）。', status: 'todo',
        options: [], answer: 'ENIAC', analysis: 'ENIAC（Electronic Numerical Integrator And Computer，电子数值积分计算机）1946 年在美国宾夕法尼亚大学研制成功，是世界上第一台通用电子计算机。' }
    ]
  },
  s3: {
    id: 's3', knowledgeName: '计算机系统的组成',
    counts: { single: 2, multiple: 1, blank: 1 }, total: 4, done: 1,
    questions: [
      { id: 'q14', type: 'single', stem: '计算机硬件五大部件中，负责进行算术运算和逻辑运算的是（ ）。', status: 'correct',
        options: [{ key: 'A', text: '控制器' }, { key: 'B', text: '运算器' }, { key: 'C', text: '存储器' }, { key: 'D', text: '输入设备' }],
        answer: 'B', analysis: '运算器（ALU）负责算术运算和逻辑运算；控制器负责指挥协调各部件；存储器存放程序和数据；输入/输出设备负责与外界交换信息。运算器与控制器合起来就是 CPU。' },
      { id: 'q15', type: 'single', stem: '下列完全属于系统软件的一组是（ ）。', status: 'wrong',
        options: [{ key: 'A', text: 'Office、WPS' }, { key: 'B', text: 'Windows、编译程序' }, { key: 'C', text: '微信、浏览器' }, { key: 'D', text: '游戏、播放器' }],
        answer: 'B', analysis: '系统软件用于管理计算机资源并为应用软件提供支撑，包括操作系统、编译程序、数据库管理系统等。Windows 是操作系统，编译程序是系统软件；其余选项都是为解决具体应用问题而编写的应用软件。' },
      { id: 'q16', type: 'multiple', stem: '下列属于计算机硬件五大基本部件的有（ ）。', status: 'doing',
        options: [{ key: 'A', text: '运算器' }, { key: 'B', text: '控制器' }, { key: 'C', text: '存储器' }, { key: 'D', text: '输入设备和输出设备' }],
        answer: ['A', 'B', 'C', 'D'], analysis: '冯·诺依曼体系结构的硬件由五大部件组成：运算器、控制器、存储器、输入设备、输出设备。其中运算器与控制器构成中央处理器（CPU）。四项均属于五大部件。' },
      { id: 'q17', type: 'blank', stem: '计算机硬件中，负责指挥和协调各部件按序工作的部件是 ______。', status: 'todo',
        options: [], answer: '控制器', analysis: '控制器是计算机的指挥中心，它从存储器取出指令、分析指令，并向其他部件发出控制信号，协调整机有条不紊地工作。它与运算器共同组成 CPU。' }
    ]
  },
  s4: {
    id: 's4', knowledgeName: '数据结构概述',
    counts: { single: 2, multiple: 1, blank: 1 }, total: 4, done: 3,
    questions: [
      { id: 'q18', type: 'single', stem: '下列属于逻辑结构的是（ ）。', status: 'correct',
        options: [{ key: 'A', text: '顺序存储' }, { key: 'B', text: '链式存储' }, { key: 'C', text: '树形结构' }, { key: 'D', text: '索引存储' }],
        answer: 'C', analysis: '逻辑结构描述数据元素之间的逻辑关系，与计算机无关，包括集合、线性、树形、图形结构。顺序存储、链式存储、索引存储都是把逻辑结构落实到计算机中的存储（物理）结构。' },
      { id: 'q19', type: 'single', stem: '下列哪一项不属于数据的存储结构？（ ）', status: 'correct',
        options: [{ key: 'A', text: '顺序存储' }, { key: 'B', text: '链式存储' }, { key: 'C', text: '线性结构' }, { key: 'D', text: '索引存储' }],
        answer: 'C', analysis: '存储结构（物理结构）主要有顺序存储、链式存储、索引存储和散列存储。线性结构属于逻辑结构，反映的是元素间一对一的相邻关系，与具体存储方式无关。' },
      { id: 'q20', type: 'multiple', stem: '常见的四种基本逻辑结构包括（ ）。', status: 'correct',
        options: [{ key: 'A', text: '集合结构' }, { key: 'B', text: '线性结构' }, { key: 'C', text: '树形结构' }, { key: 'D', text: '图形结构' }],
        answer: ['A', 'B', 'C', 'D'], analysis: '按元素间关系的复杂程度，逻辑结构分为四类：集合（元素间无关系）、线性（一对一）、树形（一对多）、图形（多对多）。它们是抽象层面的分类，与存储方式无关。' },
      { id: 'q21', type: 'blank', stem: '数据结构包括逻辑结构和 ______ 结构两个层面。', status: 'todo',
        options: [], answer: '存储', analysis: '数据结构包含两个层面：逻辑结构（元素间的逻辑关系，抽象）和存储结构（又称物理结构，是逻辑结构在计算机中的具体实现）。' }
    ]
  },
  s7: {
    id: 's7', knowledgeName: '树与二叉树',
    counts: { single: 3, multiple: 1, blank: 1 }, total: 5, done: 0,
    questions: [
      { id: 'q22', type: 'single', stem: '在一棵树中，没有前驱（父）结点的结点称为（ ）。', status: 'todo',
        options: [{ key: 'A', text: '叶子结点' }, { key: 'B', text: '根结点' }, { key: 'C', text: '分支结点' }, { key: 'D', text: '内部结点' }],
        answer: 'B', analysis: '树是一种层次结构，有且仅有一个没有父结点的结点，称为根结点；没有子结点的结点称为叶子结点；有子结点的称为分支（内部）结点。' },
      { id: 'q23', type: 'single', stem: '二叉树第 i 层（i≥1）上最多有（ ）个结点。', status: 'todo',
        options: [{ key: 'A', text: '2 的 i 次方' }, { key: 'B', text: '2 的 (i-1) 次方' }, { key: 'C', text: '2i' }, { key: 'D', text: 'i 的平方' }],
        answer: 'B', analysis: '二叉树第 i 层最多有 2^(i-1) 个结点（i 从 1 开始：第 1 层 1 个，第 2 层 2 个，第 3 层 4 个……）；深度为 k 的二叉树最多有 2^k - 1 个结点。' },
      { id: 'q24', type: 'single', stem: '对二叉树进行中序遍历，其访问顺序是（ ）。', status: 'todo',
        options: [{ key: 'A', text: '根 → 左 → 右' }, { key: 'B', text: '左 → 根 → 右' }, { key: 'C', text: '左 → 右 → 根' }, { key: 'D', text: '右 → 根 → 左' }],
        answer: 'B', analysis: '二叉树的遍历有先序（根-左-右）、中序（左-根-右）、后序（左-右-根）和层序四种。中序遍历先访问左子树，再访问根结点，最后访问右子树。' },
      { id: 'q25', type: 'multiple', stem: '下列关于树的说法，正确的有（ ）。', status: 'todo',
        options: [{ key: 'A', text: '树是一种非线性的层次结构' }, { key: 'B', text: '根结点没有父结点' }, { key: 'C', text: '叶子结点没有子结点' }, { key: 'D', text: '某个结点可以有多个父结点' }],
        answer: ['A', 'B', 'C'], analysis: '树是层次（非线性）结构，有且仅有一个根结点；除根外每个结点有且仅有一个父结点，因此 D 错误。没有子结点的结点称为叶子结点。' },
      { id: 'q26', type: 'blank', stem: '二叉树中度为 0 的结点称为 ______ 结点。', status: 'todo',
        options: [], answer: '叶子', analysis: '结点的度是指它拥有的子结点数。度为 0 即没有子结点，称为叶子结点（或终端结点）；树中度为 0 的结点个数往往最多。' }
    ]
  },
  s8: {
    id: 's8', knowledgeName: '操作系统概述',
    counts: { single: 2, multiple: 1, blank: 1 }, total: 4, done: 1,
    questions: [
      { id: 'q27', type: 'single', stem: '操作系统属于下列哪一类软件？（ ）', status: 'correct',
        options: [{ key: 'A', text: '系统软件' }, { key: 'B', text: '应用软件' }, { key: 'C', text: '办公软件' }, { key: 'D', text: '工具软件' }],
        answer: 'A', analysis: '操作系统是最核心的系统软件，负责管理计算机软硬件资源、组织程序运行的流程，并为用户提供使用计算机的接口，是其他软件运行的基础平台。' },
      { id: 'q28', type: 'single', stem: '允许多个用户通过终端同时使用计算机，且每个用户都感觉自己在独占整机的操作系统是（ ）。', status: 'wrong',
        options: [{ key: 'A', text: '批处理系统' }, { key: 'B', text: '分时系统' }, { key: 'C', text: '实时系统' }, { key: 'D', text: '单用户系统' }],
        answer: 'B', analysis: '分时系统把 CPU 时间划分成很短的时间片，轮流分配给各用户作业，由于切换极快，每个用户都感觉自己在独占计算机。批处理强调成批自动处理，实时系统强调对外部事件的及时响应。' },
      { id: 'q29', type: 'multiple', stem: '操作系统的主要作用包括（ ）。', status: 'doing',
        options: [{ key: 'A', text: '管理软硬件资源' }, { key: 'B', text: '提供用户使用接口' }, { key: 'C', text: '为程序运行提供环境和支撑' }, { key: 'D', text: '把高级语言源程序编译成目标程序' }],
        answer: ['A', 'B', 'C'], analysis: '操作系统一方面管理处理器、存储器、设备、文件等资源，另一方面提供命令接口和程序接口，并为程序运行创造良好环境。把高级语言源程序翻译成目标程序是编译程序的功能，D 不属于操作系统本身。' },
      { id: 'q30', type: 'blank', stem: '操作系统的英文缩写是 ______。', status: 'todo',
        options: [], answer: 'OS', analysis: '操作系统英文为 Operating System，缩写为 OS。常见的操作系统有 Windows、Linux、macOS、Android 等。' }
    ]
  },
  s9: {
    id: 's9', knowledgeName: '进程与线程',
    counts: { single: 2, multiple: 1, blank: 1 }, total: 4, done: 1,
    questions: [
      { id: 'q31', type: 'single', stem: '下列哪一项不属于进程的三种基本状态？（ ）', status: 'wrong',
        options: [{ key: 'A', text: '就绪' }, { key: 'B', text: '运行' }, { key: 'C', text: '阻塞' }, { key: 'D', text: '挂起' }],
        answer: 'D', analysis: '进程有三种基本状态：就绪（已获除 CPU 外的全部资源，等待调度）、运行（正在占用 CPU 执行）、阻塞（因等待某事件而暂停）。"挂起"是某些系统引入的扩充状态，不属于三种基本状态。' },
      { id: 'q32', type: 'single', stem: '关于进程和线程，下列说法正确的是（ ）。', status: 'todo',
        options: [{ key: 'A', text: '进程是 CPU 调度的基本单位' }, { key: 'B', text: '线程是资源分配的基本单位' }, { key: 'C', text: '进程是资源分配单位，线程是 CPU 调度单位' }, { key: 'D', text: '进程和线程是同一个概念' }],
        answer: 'C', analysis: '进程是资源分配的基本单位，拥有独立的地址空间和资源；线程是 CPU 调度的基本单位，是进程内的一个执行流。同一进程中的多个线程共享该进程的资源，切换开销更小。' },
      { id: 'q33', type: 'multiple', stem: '下列关于进程的说法，正确的有（ ）。', status: 'todo',
        options: [{ key: 'A', text: '进程是程序的一次执行过程' }, { key: 'B', text: '进程是动态的，有创建和消亡' }, { key: 'C', text: '进程是系统资源分配的单位' }, { key: 'D', text: '进程是静态的、永久保存在磁盘上的' }],
        answer: ['A', 'B', 'C'], analysis: '进程是程序在数据集合上的一次运行活动，是动态的，具有生命周期（创建、运行、消亡），并拥有独立的资源，是资源分配的单位。程序才是静态存放在磁盘上的，D 描述的是程序而非进程。' },
      { id: 'q34', type: 'blank', stem: '进程的三种基本状态是就绪、运行和 ______。', status: 'todo',
        options: [], answer: '阻塞', analysis: '进程的三种基本状态为就绪、运行、阻塞（又称等待或睡眠）。就绪态等待被调度获得 CPU；运行态占用 CPU 执行；阻塞态因等待 I/O 等事件而暂停，事件完成后转为就绪态。' }
    ]
  }
}

// 诊断报告数据：薄弱 / 已掌握知识点
export const diagnostic = {
  score: 68,
  total: 100,
  duration: 42,
  weakPoints: [
    { id: 'k6', name: '栈与队列', accuracy: 35 },
    { id: 'k2', name: '数制与编码', accuracy: 42 },
    { id: 'k9', name: '进程与线程', accuracy: 48 }
  ],
  masteredPoints: [
    { id: 'k1', name: '计算机的发展与分类', accuracy: 92 },
    { id: 'k4', name: '数据结构概述', accuracy: 88 },
    { id: 'k5', name: '线性表', accuracy: 85 }
  ]
}

// 根据 id 找知识点名称（供各视图复用）
export function findKnowledgeName(tree, id) {
  for (const node of tree.children) {
    for (const leaf of node.children) {
      if (leaf.id === id) return leaf.name
    }
  }
  return ''
}
