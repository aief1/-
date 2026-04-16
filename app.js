/**
 * 如果当时 — 平行人生模拟器
 * Main Application Logic
 */

(function () {
  'use strict';

  // ========================================
  // Configuration
  // ========================================
  const CONFIG = {
    // Set to true to use demo data (no backend needed)
    DEMO_MODE: true,
    // Backend API endpoint (only needed if DEMO_MODE is false)
    API_ENDPOINT: '/api/generate',
    // AI Model
    MODEL: 'gpt-4o-mini',
    // Generating animation duration (ms)
    GENERATE_DURATION: 6000,
    // Typewriter speed (ms per character)
    TYPEWRITER_SPEED: 80,
    // Min characters to enable start button
    MIN_REGRET_LENGTH: 1,
  };

  // ========================================
  // Question Bank
  // ========================================
  const QUESTION_BANK = [
    // ===== 深度情感类 =====
    {
      id: 'fear',
      text: '当时你真正害怕的是什么？',
      placeholder: '比如：害怕失败、害怕孤独、害怕让父母失望……',
      category: 'all',
    },
    {
      id: 'regret_essence',
      text: '你现在最遗憾的是结果，还是当时的自己不够勇敢？',
      placeholder: '不用想太久，写下第一感觉……',
      category: 'all',
    },
    {
      id: 'expectation',
      text: '如果你做了相反的选择，你最期待发生什么？',
      placeholder: '比如：遇到不一样的人、看到更大的世界……',
      category: 'all',
    },
    {
      id: 'loss',
      text: '你觉得那条路可能会失去什么？',
      placeholder: '比如：稳定的生活、身边的人、熟悉的环境……',
      category: 'all',
    },
    {
      id: 'feeling_vs_life',
      text: '你现在还想要的，是那条人生，还是那种感觉？',
      placeholder: '比如：其实不是想去北京，而是想要那种勇敢的感觉……',
      category: 'emotional',
    },
    {
      id: 'external',
      text: '如果当时有人告诉你这么做会很好，你会听吗？',
      placeholder: '比如：可能会，也可能不会，因为……',
      category: 'external',
    },
    {
      id: 'self_compassion',
      text: '现在回头看，当时的你其实已经尽力了吗？',
      placeholder: '比如：也许是的，只是当时不知道……',
      category: 'self_blame',
    },
    {
      id: 'current_life',
      text: '现在的生活里，有什么是你满意的？',
      placeholder: '比如：有一份稳定的工作、有几个好朋友、家人健康……',
      category: 'emotional',
    },
    {
      id: 'support',
      text: '如果当时要做那个选择，谁会支持你？',
      placeholder: '比如：好朋友会支持、但父母可能反对……',
      category: 'external',
    },
  ];

  // Total questions to ask (emotional/depth only; background is collected via profile page)
  const QUESTIONS_TO_ASK = 4;

  // ========================================
  // Demo Data
  // ========================================
  // Demo scenario library - three different regret stories
  const DEMO_SCENARIOS = [
    {
      // 场景1：城市/工作选择
      keywords: ['城市', '工作', '去', '留', '北京', '上海', '深圳', '广州', '老家', '辞职', '职业', '事业', '公司', 'offer', '实习', '毕业'],
      result: {
        ideal: {
          timeline: [
            {
              time: '第一年',
              text: '你带着一个行李箱和满腔期待，站在了那座城市的街头。前几个月很辛苦，租住在很小的房间里，每天挤地铁上下班。但你的眼睛里有光。',
              emotion: '有些夜晚你会想家，但更多时候你觉得，这才是活着的感觉。',
            },
            {
              time: '第三年',
              text: '你慢慢站稳了脚跟。工作上开始有了起色，也交到了几个志同道合的朋友。你开始觉得，当初的决定是对的。',
              emotion: '偶尔在深夜，你会想起老家那个安静的房间，和那些没说出口的话。',
            },
            {
              time: '现在',
              text: '你在这座城市有了自己的生活。也许不是想象中的完美，但你不再后悔。你知道自己曾经勇敢过。',
              emotion: null,
            },
          ],
          summary: '你得到了梦想中的广阔世界，也失去了无价的安全感。但你说，值得。',
        },
        realistic: {
          timeline: [
            {
              time: '第一年',
              text: '你去了那座城市，发现它和你想象的不太一样。工作比预想的难找，生活成本比预想的高。你开始怀疑自己的选择。',
              emotion: '最难的时候，你差点买了回去的票。',
            },
            {
              time: '第三年',
              text: '你换了两次工作，搬了三次家。有些事情变好了，有些事情没有。你开始接受，生活不会因为换一个地方就自动变好。',
              emotion: '你发现，不管在哪里，有些烦恼是跟着你走的。',
            },
            {
              time: '现在',
              text: '你在这座城市过着普通的生活。有得有失，不好不坏。你偶尔会想，如果当初没来，现在会是什么样？',
              emotion: null,
            },
          ],
          summary: '另一条路也是普通的人生。没有奇迹，只有日常。但那些经历，确实让你变得不一样了。',
        },
        shadow: {
          timeline: [
            {
              time: '第一年',
              text: '你去了那座城市，全力以赴。但很快你发现，你失去了很多：父母的陪伴、老朋友的默契、那种被理解的安全感。',
              emotion: '最孤独的生日，你一个人吃了碗面。',
            },
            {
              time: '第三年',
              text: '你在这座城市有了一份还不错的工作，但你开始怀念老家那种慢节奏的生活。你发现自己并没有变得更快乐。',
              emotion: '你开始意识到，你追求的可能不是这座城市，而是一种「如果当时」的幻觉。',
            },
            {
              time: '现在',
              text: '你留在了那座城市，但心里始终有一个空缺。你开始遗憾另一件事：当初为什么没有多回家看看。',
              emotion: null,
            },
          ],
          summary: '另一条路也有另一种遗憾。你得到了远方，却失去了归途。人生从来不是选择题，而是承受题。',
        },
        reflection: {
          true_regret: '你遗憾的可能不是没去那座城市，而是没有给自己一次认真试过的机会。那份遗憾的本质，是对「未完成的自己」的惋惜。',
          past_message: '你当时已经在用你所知道的一切，做出了最好的决定。那个选择里，有你当时的恐惧、你的爱、你的局限。它不完美，但它是真实的你。',
          action: '这个周末，去一个你从来没去过的地方，哪怕只是隔壁的街区。不需要很远，只需要「不同」。让身体先走一步，心会慢慢跟上来。',
        },
      },
    },
    {
      // 场景2：感情/表白遗憾
      keywords: ['喜欢', '表白', '恋爱', '爱', '分手', '错过', '暗恋', '在一起', '男朋友', '女朋友', '对象', '前任', '结婚', '恋人', '感情', '牵手', '告白'],
      result: {
        ideal: {
          timeline: [
            {
              time: '那个夏天',
              text: '你终于说出了那句话。声音发抖，手心出汗，但你说了。对方愣了一下，然后笑了。那个笑容，你记了很多年。',
              emotion: '原来被回应的感觉，是这样的。',
            },
            {
              time: '后来',
              text: '你们在一起了。有过争吵，有过冷战，有过无数次想要放弃的瞬间。但也有深夜的拥抱、清晨的早安、和那些只有你们才懂的笑话。',
              emotion: '你发现，爱一个人不只是心动，更是选择——每天选择不放手。',
            },
            {
              time: '现在',
              text: '也许你们还在一起，也许已经各自安好。但你知道，当初那一步，让你学会了什么是勇敢，什么是珍惜。',
              emotion: null,
            },
          ],
          summary: '你得到了一段真实的感情，也承担了心碎的风险。但你说，不后悔开口。',
        },
        realistic: {
          timeline: [
            {
              time: '那个夏天',
              text: '你说了。对方沉默了很久，说：「对不起，我现在不能给你答案。」你笑着说没关系，转身的时候眼泪掉了下来。',
              emotion: '至少你知道了答案。虽然不是你想要的那个。',
            },
            {
              time: '后来',
              text: '你们的关系变得微妙。见面时会不自然，聊天时会小心翼翼。你花了很长时间才走出来，但那段日子让你变得更了解自己。',
              emotion: '你开始明白，不是所有的勇敢都会有回报，但沉默的遗憾往往比被拒绝更重。',
            },
            {
              time: '现在',
              text: '你已经能平静地想起那个人了。偶尔听到一首歌，还是会有一瞬间的恍惚，但你知道，那已经是过去了。',
              emotion: null,
            },
          ],
          summary: '勇敢不等于圆满。但你终于放下了那个「如果当时说了」的念头，因为你知道了结果。',
        },
        shadow: {
          timeline: [
            {
              time: '那个夏天',
              text: '你说了，对方答应了。但很快你发现，在一起和想象中完全不同。你们有不同的节奏、不同的期待、不同的世界。',
              emotion: '最难受的不是分手，而是发现相爱和相处是两回事。',
            },
            {
              time: '后来',
              text: '你们分开了。不是因为不爱，而是因为太累了。你失去了一个重要的人，也失去了一个朋友。你们再也没有说过话。',
              emotion: '你有时候会想，如果当初不说，至少你们还是朋友。但你也知道，那种「如果」其实站不住脚。',
            },
            {
              time: '现在',
              text: '你偶尔会在某个瞬间想起那段感情，不是想念那个人，而是想念那个时候勇敢的自己。',
              emotion: null,
            },
          ],
          summary: '有些路走上去才知道是弯路。但弯路也是路，它教会你的东西，直路永远教不了。',
        },
        reflection: {
          true_regret: '你遗憾的可能不是那段感情本身，而是当时的自己不够坦诚。那份遗憾的本质，是对「没有好好表达」的惋惜。',
          past_message: '当时的你已经很勇敢了。在不确定的时候选择开口，比沉默需要更大的力气。不管结果如何，那个你值得被温柔对待。',
          action: '给一个你一直想说谢谢但没说出口的人发一条消息。不需要长篇大论，一句「谢谢你当时」就够了。',
        },
      },
    },
    {
      // 场景3：学业/人生方向选择
      keywords: ['读书', '考研', '留学', '出国', '大学', '专业', '学', '高考', '退学', '转专业', '研究生', '博士', '学业', '考试', '学校', '梦想'],
      result: {
        ideal: {
          timeline: [
            {
              time: '第一年',
              text: '你开始了新的学业。图书馆成了你的第二个家，咖啡成了你最亲密的伙伴。很累，但每次解开一个难题的时候，你觉得一切都值得。',
              emotion: '你终于在做一件自己真正想做的事了。',
            },
            {
              time: '第三年',
              text: '你遇到了一位改变你思维方式的导师，也遇到了一群和你一样热爱这个领域的人。你开始看到自己成长的痕迹。',
              emotion: '原来当你真正热爱一件事的时候，吃苦也变成了一种享受。',
            },
            {
              time: '现在',
              text: '你在这条路上走得比想象中更远。也许还没有到达终点，但你已经不再羡慕别人的路了。因为你知道，你在走自己的。',
              emotion: null,
            },
          ],
          summary: '你得到了追求热爱的机会，也付出了时间和不确定的代价。但你说，这是我选的路。',
        },
        realistic: {
          timeline: [
            {
              time: '第一年',
              text: '你开始了新的学业，发现它比你想象的要难。课程跟不上，同学比你优秀，你开始怀疑自己是不是做错了选择。',
              emotion: '深夜在图书馆的时候，你不止一次想过放弃。',
            },
            {
              time: '第三年',
              text: '你慢慢适应了节奏，成绩也稳定了。但你发现，热爱和擅长是两回事。你开始接受自己可能只是「还不错」，而不是「很厉害」。',
              emotion: '你学会了和自己的平凡和解，这比任何课程都难。',
            },
            {
              time: '现在',
              text: '你完成了学业，进入了相关的领域。工作不算理想，但也不差。你偶尔会想，如果当初选了另一条路，会不会更好？',
              emotion: null,
            },
          ],
          summary: '另一条路也有另一座山要翻。没有哪条路是轻松的，但每条路都会让你变成不同的人。',
        },
        shadow: {
          timeline: [
            {
              time: '第一年',
              text: '你开始了新的学业，投入了全部精力。但你慢慢发现，你错过了很多：朋友的聚会、家人的生日、那些再也回不去的时光。',
              emotion: '你拿到了好成绩，但打开手机，发现已经三个月没和好朋友聊过天了。',
            },
            {
              time: '第三年',
              text: '你开始感到疲惫。不是身体上的，而是精神上的。你不确定自己是否真的热爱这件事，还是只是不想承认选错了。',
              emotion: '你发现，坚持有时候不是因为热爱，而是因为沉没成本。',
            },
            {
              time: '现在',
              text: '你完成了学业，但内心有一种说不清的空缺。你开始遗憾那些被你放弃的可能性——那些你因为「专注」而错过的人生风景。',
              emotion: null,
            },
          ],
          summary: '全力以赴的代价，是错过了沿途的其他风景。你得到了一个答案，但也失去了一些永远找不回来的东西。',
        },
        reflection: {
          true_regret: '你遗憾的可能不是那个选择本身，而是当时做选择时，没有认真倾听自己内心的声音。那份遗憾的本质，是对「不够了解自己」的惋惜。',
          past_message: '当时的你已经在有限的认知里，做了最大的努力。你不可能用现在的智慧去要求过去的自己。那个你，已经尽力了。',
          action: '花一个下午的时间，去你一直想去但没去过的书店或图书馆，随便翻翻书。不需要有目的，只是让自己重新感受「学习」本身的乐趣。',
        },
      },
    },
  ];

  // Default demo result (fallback when no keywords match)
  const DEFAULT_DEMO_RESULT = DEMO_SCENARIOS[0].result;

  // ========================================
  // State
  // ========================================
  const state = {
    currentPage: 'landing',
    regret: '',
    choicePast: '',
    choiceAlt: '',
    answers: {},
    selectedQuestions: [],
    currentQuestionIndex: 0,
    result: null,
  };

  // Timer tracking for cleanup
  let generatingTimers = [];

  // ========================================
  // DOM Elements
  // ========================================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const pages = {
    landing: $('#page-landing'),
    choices: $('#page-choices'),
    profile: $('#page-profile'),
    questions: $('#page-questions'),
    generating: $('#page-generating'),
    result: $('#page-result'),
  };

  // ========================================
  // Particles Background
  // ========================================
  function initParticles() {
    const canvas = $('#particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      };
    }

    function init() {
      resize();
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 15000), 80);
      particles = Array.from({ length: count }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.01;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resize();
    });

    init();
    draw();
  }

  // ========================================
  // Page Navigation
  // ========================================
  function navigateTo(pageName) {
    const current = pages[state.currentPage];
    const next = pages[pageName];

    if (!next) return;

    // Fade out current
    if (current) {
      current.classList.remove('active');
    }

    // Fade in next
    setTimeout(() => {
      next.classList.add('active');
      // Scroll to top
      next.scrollTop = 0;
      state.currentPage = pageName;

      // Show/hide exit button
      const exitBtn = $('#btn-exit');
      if (pageName === 'landing') {
        exitBtn.classList.remove('visible');
      } else {
        exitBtn.classList.add('visible');
      }

      // Page-specific init
      if (pageName === 'profile') {
        restoreProfileTags();
      }
      if (pageName === 'questions') {
        showQuestion();
      }
      if (pageName === 'generating') {
        startGeneratingAnimation();
      }
      if (pageName === 'result') {
        renderResult();
      }
    }, 400);
  }

  // ========================================
  // Typewriter Effect
  // ========================================
  function typeWriter(element, text, speed, callback) {
    let i = 0;
    element.textContent = '';

    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        const naturalDelay = speed + (Math.random() - 0.5) * speed * 0.4;
        setTimeout(type, naturalDelay);
      } else if (callback) {
        callback();
      }
    }

    type();
  }

  // ========================================
  // Landing Page
  // ========================================
  function initLanding() {
    const input = $('#regret-input');
    const btn = $('#btn-start');
    const typewriterEl = $('#typewriter-text');

    // Typewriter effect
    typeWriter(typewriterEl, '有没有一个选择，你一直想重来？', CONFIG.TYPEWRITER_SPEED);

    // Enable/disable button
    const updateBtnState = () => {
      btn.disabled = input.value.trim().length < CONFIG.MIN_REGRET_LENGTH;
    };

    // Track IME composition to avoid false triggers during Chinese input
    let isComposing = false;
    input.addEventListener('compositionstart', () => { isComposing = true; });
    input.addEventListener('compositionend', () => {
      isComposing = false;
      updateBtnState();
    });
    input.addEventListener('input', () => {
      if (!isComposing) {
        updateBtnState();
      }
    });

    // Show acknowledgment when user starts typing
    let hasAcknowledged = false;
    input.addEventListener('input', () => {
      if (!hasAcknowledged && input.value.trim().length > 0) {
        hasAcknowledged = true;
        const ack = $('#landing-ack');
        if (ack) ack.classList.add('visible');
      }
    });

    // Start button
    btn.addEventListener('click', () => {
      state.regret = input.value.trim();
      navigateTo('choices');
    });

    // Allow Enter key (with Shift+Enter for newline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !btn.disabled) {
        e.preventDefault();
        btn.click();
      }
    });
  }

  // ========================================
  // Choices Page
  // ========================================
  function initChoices() {
    const btn = $('#btn-to-profile');

    btn.addEventListener('click', () => {
      state.choicePast = $('#choice-past').value.trim();
      state.choiceAlt = $('#choice-alt').value.trim();
      navigateTo('profile');
    });

    // Auto-focus first textarea when page becomes visible
    const observer = new MutationObserver(() => {
      if (pages.choices.classList.contains('active')) {
        const firstTa = $('#choice-past');
        if (firstTa && !firstTa.value) {
          setTimeout(() => firstTa.focus(), 500);
        }
        observer.disconnect();
      }
    });
    observer.observe(pages.choices, { attributes: true, attributeFilter: ['class'] });
  }

  // ========================================
  // Profile Page (Basic Info)
  // ========================================
  // Restore profile tag selections from state.answers
  function restoreProfileTags() {
    $$('.profile-tags').forEach(tagGroup => {
      const fieldName = tagGroup.dataset.field;
      const savedValue = state.answers[fieldName];
      tagGroup.querySelectorAll('.profile-tag').forEach(tag => {
        if (savedValue && tag.dataset.value === savedValue) {
          tag.classList.add('selected');
        } else {
          tag.classList.remove('selected');
        }
      });
    });
  }

  function initProfile() {
    // Tag selection
    $$('.profile-tags').forEach(tagGroup => {
      const fieldName = tagGroup.dataset.field;
      tagGroup.addEventListener('click', (e) => {
        const tag = e.target.closest('.profile-tag');
        if (!tag) return;

        // Toggle selection
        const wasSelected = tag.classList.contains('selected');
        // Deselect all in this group
        tagGroup.querySelectorAll('.profile-tag').forEach(t => t.classList.remove('selected'));
        // Select clicked (unless it was already selected, then deselect)
        if (!wasSelected) {
          tag.classList.add('selected');
        }

        // Save to state
        const selected = tagGroup.querySelector('.profile-tag.selected');
        state.answers[fieldName] = selected ? selected.dataset.value : '';
      });
    });

    // Continue button
    const btn = $('#btn-to-questions');
    btn.addEventListener('click', () => {
      selectQuestions();
      navigateTo('questions');
    });
  }

  // ========================================
  // Questions Page
  // ========================================
  function selectQuestions() {
    const regretText = (state.regret + ' ' + state.choicePast + ' ' + state.choiceAlt).toLowerCase();

    // All questions are now emotional/depth questions
    const allQuestions = QUESTION_BANK.filter((q) => q.category !== 'background');

    // Keyword matching for relevance scoring
    const scored = allQuestions.map((q) => {
      let score = Math.random();
      if (regretText.includes('害怕') || regretText.includes('恐惧') || regretText.includes('担心') || regretText.includes('焦虑')) {
        if (q.category === 'self_blame') score += 2;
        if (q.id === 'fear') score += 1;
      }
      if (regretText.includes('别人') || regretText.includes('父母') || regretText.includes('朋友') || regretText.includes('家人') || regretText.includes('对象') || regretText.includes('伴侣')) {
        if (q.category === 'external') score += 2;
        if (q.id === 'support') score += 2;
      }
      if (regretText.includes('感觉') || regretText.includes('想念') || regretText.includes('怀念') || regretText.includes('孤独')) {
        if (q.category === 'emotional') score += 2;
        if (q.id === 'feeling_vs_life') score += 1;
      }
      if (regretText.includes('工作') || regretText.includes('辞职') || regretText.includes('职业') || regretText.includes('事业')) {
        if (q.id === 'current_life') score += 1;
      }
      if (regretText.includes('恋爱') || regretText.includes('表白') || regretText.includes('分手') || regretText.includes('感情')) {
        if (q.id === 'support') score += 1;
      }
      return { ...q, score };
    });

    scored.sort((a, b) => b.score - a.score);
    state.selectedQuestions = scored.slice(0, QUESTIONS_TO_ASK);
    state.currentQuestionIndex = 0;
    state.answers = {};
  }

  function showQuestion() {
    const container = $('#question-container');
    const actions = $('#questions-actions');
    const complete = $('#questions-complete');
    const transition = $('#questions-transition');

    if (state.currentQuestionIndex >= state.selectedQuestions.length) {
      // All questions done
      container.innerHTML = '';
      actions.style.display = 'none';
      complete.style.display = 'block';
      transition.style.display = 'none';
      const progressBar = $('#question-progress-bar');
      if (progressBar) progressBar.style.width = '100%';
      return;
    }

    const q = state.selectedQuestions[state.currentQuestionIndex];

    // Hide transition text after first question
    if (state.currentQuestionIndex > 0) {
      transition.style.display = 'none';
    }

    // Restore previous answer if exists
    const savedAnswer = state.answers[q.id] || '';

    container.innerHTML = `
      <div class="question-item">
        <p class="question-text">${q.text}</p>
        <div class="question-response">
          <textarea id="answer-${q.id}" placeholder="${q.placeholder}" rows="3">${savedAnswer}</textarea>
        </div>
      </div>
    `;

    actions.style.display = 'flex';
    complete.style.display = 'none';

    // Show/hide previous question button
    const btnPrev = $('#btn-prev-q');
    if (btnPrev) {
      btnPrev.style.visibility = state.currentQuestionIndex > 0 ? 'visible' : 'hidden';
    }

    // Update progress bar
    const progressBar = $('#question-progress-bar');
    if (progressBar) {
      const progress = ((state.currentQuestionIndex + 1) / state.selectedQuestions.length) * 100;
      progressBar.style.width = progress + '%';
    }

    // Update question counter
    const counter = $('#question-counter');
    if (counter) {
      counter.textContent = `${state.currentQuestionIndex + 1} / ${state.selectedQuestions.length}`;
    }

    // Focus textarea
    setTimeout(() => {
      const ta = $(`#answer-${q.id}`);
      if (ta) ta.focus();
    }, 800);
  }

  function initQuestions() {
    const btnNext = $('#btn-next-q');
    const btnSkip = $('#btn-skip');
    const btnToGenerating = $('#btn-to-generating');

    btnNext.addEventListener('click', () => {
      const q = state.selectedQuestions[state.currentQuestionIndex];
      const ta = $(`#answer-${q.id}`);
      state.answers[q.id] = ta ? ta.value.trim() : '';

      // Animate out
      const item = $('.question-item');
      if (item) {
        item.classList.add('leaving');
      }

      setTimeout(() => {
        state.currentQuestionIndex++;
        showQuestion();
      }, 400);
    });

    btnSkip.addEventListener('click', () => {
      const q = state.selectedQuestions[state.currentQuestionIndex];
      state.answers[q.id] = '';

      // Show brief acknowledgment
      const item = $('.question-item');
      if (item) {
        item.querySelector('.question-text').textContent = '没关系，我们继续。';
        item.style.opacity = '0.5';
        setTimeout(() => {
          item.classList.add('leaving');
          setTimeout(() => {
            state.currentQuestionIndex++;
            showQuestion();
          }, 400);
        }, 600);
      } else {
        state.currentQuestionIndex++;
        showQuestion();
      }
    });

    // Previous question button
    const btnPrev = $('#btn-prev-q');
    btnPrev.addEventListener('click', () => {
      if (state.currentQuestionIndex <= 0) return;
      
      // Save current answer before going back
      const q = state.selectedQuestions[state.currentQuestionIndex];
      const ta = $(`#answer-${q.id}`);
      if (ta) {
        state.answers[q.id] = ta.value.trim();
      }
      
      // Animate out
      const item = $('.question-item');
      if (item) {
        item.classList.add('leaving');
      }
      
      setTimeout(() => {
        state.currentQuestionIndex--;
        showQuestion();
      }, 400);
    });

    btnToGenerating.addEventListener('click', () => {
      navigateTo('generating');
    });
  }

  // ========================================
  // Generating Page
  // ========================================
  function startGeneratingAnimation() {
    const lines = $$('.fork-line');
    const textEl = $('#generating-text');

    // Clean up any previous timers
    cleanupGeneratingTimers();

    // Reset
    lines.forEach((l) => l.classList.remove('animate'));

    // Animate fork lines
    const t1 = setTimeout(() => {
      lines.forEach((l, i) => {
        const t = setTimeout(() => l.classList.add('animate'), i * 300);
        generatingTimers.push(t);
      });
    }, 500);
    generatingTimers.push(t1);

    // Rotate generating text
    const texts = [
      '时光正在分叉……',
      '在另一个时空里，另一个你，正在经历不同的故事。',
      '三条平行的人生，正在向你走来。',
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex++;
      if (textIndex < texts.length) {
        textEl.style.opacity = '0';
        setTimeout(() => {
          textEl.textContent = texts[textIndex];
          textEl.style.opacity = '1';
        }, 300);
      }
    }, 2000);
    generatingTimers.push(textInterval);

    // Generate result
    const t2 = setTimeout(() => {
      clearInterval(textInterval);
      generatingTimers = generatingTimers.filter(t => t !== textInterval);
      generateResult();
    }, CONFIG.GENERATE_DURATION);
    generatingTimers.push(t2);
  }

  function cleanupGeneratingTimers() {
    generatingTimers.forEach(t => {
      clearTimeout(t);
      clearInterval(t);
    });
    generatingTimers = [];
  }

  // ========================================
  // AI Generation
  // ========================================
  async function generateResult() {
    if (CONFIG.DEMO_MODE) {
      // Match best demo scenario based on user input
      const matchedScenario = matchDemoScenario();
      state.result = JSON.parse(JSON.stringify(matchedScenario));
      personalizeResult(state.result);
      navigateTo('result');
      return;
    }

    // Real AI generation
    try {
      const result = await callAI();
      const validated = validateResult(result);
      state.result = validated;
      navigateTo('result');
    } catch (error) {
      console.error('AI generation failed:', error);
      // Show error notification instead of silent fallback
      showErrorToast('生成遇到了一些问题，正在为你展示示例故事。');
      const matchedScenario = matchDemoScenario();
      state.result = JSON.parse(JSON.stringify(matchedScenario));
      personalizeResult(state.result);
      navigateTo('result');
    }
  }

  function matchDemoScenario() {
    const userInput = (state.regret + ' ' + state.choicePast + ' ' + state.choiceAlt).toLowerCase();
    
    let bestMatch = null;
    let bestScore = 0;
    
    DEMO_SCENARIOS.forEach((scenario) => {
      let score = 0;
      scenario.keywords.forEach((kw) => {
        if (userInput.includes(kw)) {
          score += 1;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = scenario;
      }
    });
    
    return bestMatch ? bestMatch.result : DEFAULT_DEMO_RESULT;
  }

  function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#222d3f;color:#e6edf3;padding:12px 24px;border-radius:12px;font-size:14px;font-family:inherit;z-index:300;border:1px solid rgba(201,169,110,0.3);opacity:0;transition:opacity 0.4s ease;';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  function personalizeResult(result) {
    const alt = state.choiceAlt || '那个选择';
    const past = state.choicePast || '原来的选择';
    const age = state.answers.age || '';
    const gender = state.answers.gender || '';
    const stage = state.answers.life_stage || '';
    const companion = state.answers.companion || '';

    // Build a gendered pronoun hint
    let pronoun = '你';
    if (gender.includes('女')) pronoun = '你';
    else if (gender.includes('男')) pronoun = '你';

    // Personalize timeline entries by replacing generic city references
    ['ideal', 'realistic', 'shadow'].forEach((key) => {
      if (!result[key] || !result[key].timeline) return;
      result[key].timeline.forEach((entry) => {
        // Replace generic "那座城市" with the alt choice if it mentions a place
        if (state.choiceAlt && state.choiceAlt.length > 1) {
          const placeMatch = state.choiceAlt.match(/去(.{2,6})/);
          if (placeMatch) {
            entry.text = entry.text.replace(/那座城市/g, placeMatch[1]);
          }
        }
        // Add age/stage context to "现在" entries
        if (entry.time === '现在' && age) {
          entry.text = entry.text.replace(/现在。/, `现在，${age}的你。`);
        }
      });
    });

    // Personalize reflection
    if (result.reflection) {
      if (result.reflection.true_regret && alt.length > 1) {
        result.reflection.true_regret = result.reflection.true_regret.replace(
          /没去那座城市/,
          `没有${alt}`
        );
      }
      if (companion && result.reflection.past_message) {
        result.reflection.past_message += companion === '一个人'
          ? '一个人做决定，本身就需要勇气。'
          : `身边有${companion}，也是一种幸运。`;
      }
    }
  }

  function validateResult(data) {
    // Ensure minimum required structure
    const safe = {
      ideal: { timeline: [], summary: '' },
      realistic: { timeline: [], summary: '' },
      shadow: { timeline: [], summary: '' },
      reflection: { true_regret: '', past_message: '', action: '' },
    };

    ['ideal', 'realistic', 'shadow'].forEach((key) => {
      if (data[key]) {
        safe[key].summary = data[key].summary || '';
        if (Array.isArray(data[key].timeline)) {
          safe[key].timeline = data[key].timeline.map((entry) => ({
            time: entry.time || '',
            text: entry.text || '',
            emotion: entry.emotion || null,
          }));
        }
      }
    });

    if (data.reflection) {
      safe.reflection.true_regret = data.reflection.true_regret || '';
      safe.reflection.past_message = data.reflection.past_message || '';
      safe.reflection.action = data.reflection.action || '';
    }

    return safe;
  }

  async function callAI() {
    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt();

    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CONFIG.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 3000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  }

  function buildSystemPrompt() {
    return `你是一位温柔而克制的叙事者，擅长帮助人们探索平行人生的可能性。

你的语调安静、真实、有文学感，不鸡汤、不过度美好。

你必须生成三条平行人生线，每条都有完整的时间线、叙事和情感。

最后必须生成"回到现在"的反思，包含小行动建议。

输出格式必须是 JSON，结构如下：
{
  "ideal": {
    "timeline": [
      { "time": "时间节点", "text": "叙事段落（50-80字）", "emotion": "内心独白（可为null）" }
    ],
    "summary": "这条线的核心得与失（一句话）"
  },
  "realistic": { 同上结构 },
  "shadow": { 同上结构 },
  "reflection": {
    "true_regret": "真正的遗憾是什么（一段话）",
    "past_message": "给过去的自己一句话",
    "action": "给现在的自己一个具体、小、可执行的行动建议"
  }
}

重要规则：
1. 用"你"而非"他/她"，增强代入感
2. 具体而非空洞，提及具体场景、具体情感
3. 克制而非过度，不要写得太美好也不要写得太悲惨
4. 平行而非对立，三条线不是"好/中/差"，而是三种不同的真实
5. 收束而非悬念，每条线都要有完整的结尾
6. 必须融入用户输入的具体细节——包括年龄、性别、人生阶段、身边人等背景信息
7. 严禁做心理诊断、严禁给出确定性判断、严禁过度美化另一条路
8. reflection.action 必须是具体、小、可执行的行动，而非空洞的鼓励
9. 时间线节点要根据用户的年龄和人生阶段来设定（比如大学生的时间线用"大一/大三/毕业后"，职场人用"第一年/第三年/现在"）
10. 如果用户提到了身边的人（恋人、朋友、父母），在叙事中自然地融入这些人物
11. 如果用户提到了性别，在叙事中自然地使用对应的称呼和情境`;
  }

  function buildUserPrompt() {
    let prompt = `用户的遗憾：${state.regret}\n`;
    prompt += `当时的选择：${state.choicePast}\n`;
    prompt += `相反的选择：${state.choiceAlt}\n\n`;

    // Background info from profile page
    const bgFields = [
      { id: 'age', label: '年龄' },
      { id: 'gender', label: '性别' },
      { id: 'life_stage', label: '人生阶段' },
      { id: 'companion', label: '身边人' },
    ];
    const bgAnswers = bgFields
      .filter(f => state.answers[f.id])
      .map(f => `- ${f.label}：${state.answers[f.id]}`);

    if (bgAnswers.length > 0) {
      prompt += `用户背景信息：\n${bgAnswers.join('\n')}\n\n`;
    }

    // Depth answers from questions
    const depthAnswers = [];
    state.selectedQuestions.forEach((q) => {
      const answer = state.answers[q.id];
      if (answer) {
        depthAnswers.push(`- ${q.text}\n  回答：${answer}`);
      }
    });

    if (depthAnswers.length > 0) {
      prompt += `深入对话回答：\n${depthAnswers.join('\n')}\n`;
    }

    return prompt;
  }

  // ========================================
  // Result Rendering
  // ========================================
  function renderResult() {
    if (!state.result) return;

    // Render three timelines
    renderTimeline('ideal', state.result.ideal);
    renderTimeline('realistic', state.result.realistic);
    renderTimeline('shadow', state.result.shadow);

    // Render reflection
    renderReflection(state.result.reflection);

    // Animate cards in sequence
    const cards = $$('.timeline-card, .reflection-card');
    cards.forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('visible');
      }, 300 + i * 400);
    });

    // Show scroll hint briefly
    const scrollHint = $('#scroll-hint');
    if (scrollHint) {
      scrollHint.style.display = 'flex';
      setTimeout(() => {
        scrollHint.style.opacity = '0';
        setTimeout(() => { scrollHint.style.display = 'none'; }, 500);
      }, 3000);
    }

    // Smooth scroll to first card after a moment
    setTimeout(() => {
      const firstCard = $('#card-ideal');
      if (firstCard) {
        firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1500);
  }

  function renderTimeline(type, data) {
    const container = $(`#content-${type}`);
    if (!container || !data) return;

    let html = '';

    if (data.timeline && data.timeline.length > 0) {
      data.timeline.forEach((entry) => {
        html += `
          <div class="timeline-entry">
            <div class="timeline-entry__dot"></div>
            <div class="timeline-entry__time">${escapeHtml(entry.time)}</div>
            <div class="timeline-entry__text">${escapeHtml(entry.text)}</div>
            ${entry.emotion ? `<div class="timeline-entry__emotion">${escapeHtml(entry.emotion)}</div>` : ''}
          </div>
        `;
      });
    }

    if (data.summary) {
      html += `<div class="timeline-summary">${escapeHtml(data.summary)}</div>`;
    }

    container.innerHTML = html;
  }

  function renderReflection(data) {
    const container = $('#content-reflection');
    if (!container || !data) return;

    let html = '';

    if (data.true_regret) {
      html += `
        <div class="reflection-section">
          <div class="reflection-label">真正的遗憾</div>
          <div class="reflection-text">${escapeHtml(data.true_regret)}</div>
        </div>
      `;
    }

    if (data.past_message) {
      html += `
        <div class="reflection-section">
          <div class="reflection-label">给过去的自己</div>
          <div class="reflection-text">${escapeHtml(data.past_message)}</div>
        </div>
      `;
    }

    if (data.action) {
      html += `
        <div class="reflection-section">
          <div class="reflection-label">给现在的自己</div>
          <div class="reflection-action">${escapeHtml(data.action)}</div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ========================================
  // Save / Export
  // ========================================
  function saveAsImage() {
    // Show save options
    const existing = document.getElementById('save-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'save-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML = `
      <div style="background:#1a2233;border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:32px;max-width:360px;width:90%;text-align:center;">
        <p style="font-size:16px;color:#e6edf3;margin-bottom:20px;line-height:1.8;">你想怎么保存这次旅程？</p>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button id="save-print" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:transparent;border:1px solid #c9a96e;color:#c9a96e;font-family:inherit;font-size:14px;border-radius:28px;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>保存为 PDF / 打印</span>
          </button>
          <button id="save-text" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:transparent;border:1px solid #5a6370;color:#8b949e;font-family:inherit;font-size:14px;border-radius:28px;cursor:pointer;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>复制文字内容</span>
          </button>
          <button id="save-cancel" style="display:inline-flex;align-items:center;gap:8px;padding:12px 24px;background:none;border:none;color:#5a6370;font-family:inherit;font-size:13px;border-radius:28px;cursor:pointer;">
            取消
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.getElementById('save-cancel').addEventListener('click', () => modal.remove());

    document.getElementById('save-print').addEventListener('click', () => {
      modal.remove();
      window.print();
    });

    document.getElementById('save-text').addEventListener('click', () => {
      // Collect all text content from the result page
      const cards = $$('.timeline-card__content, .reflection-card__content');
      let text = '如果当时 — 平行人生模拟器\n\n';
      cards.forEach((card) => {
        text += card.innerText + '\n\n';
      });
      navigator.clipboard.writeText(text).then(() => {
        modal.remove();
        showErrorToast('内容已复制到剪贴板');
      }).catch(() => {
        // Fallback: create a textarea and copy
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        modal.remove();
        showErrorToast('内容已复制到剪贴板');
      });
    });
  }

  // ========================================
  // Modals
  // ========================================
  function initModals() {
    // Exit modal
    const btnExit = $('#btn-exit');
    const modalExit = $('#modal-exit');
    const btnStay = $('#modal-exit-stay');
    const btnLeave = $('#modal-exit-leave');

    btnExit.addEventListener('click', () => {
      if (state.currentPage === 'landing') return;
      modalExit.style.display = 'flex';
    });

    btnStay.addEventListener('click', () => {
      modalExit.style.display = 'none';
    });

    btnLeave.addEventListener('click', () => {
      modalExit.style.display = 'none';
      resetState();
      navigateTo('landing');
    });

    // Crisis modal
    const modalCrisis = $('#modal-crisis');
    const btnCrisisClose = $('#modal-crisis-close');

    btnCrisisClose.addEventListener('click', () => {
      modalCrisis.style.display = 'none';
    });

    // Close modals on overlay click
    [modalExit, modalCrisis].forEach((modal) => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });

    // Back button navigation
    const backBtns = $$('.btn-back');
    backBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = btn.getAttribute('data-back-to');
        if (!targetPage || !pages[targetPage]) return;

        // Page-specific cleanup when going back
        if (targetPage === 'landing') {
          // Reset everything
          resetState();
        } else if (targetPage === 'choices') {
          // Coming back from profile or questions
          // Keep profile answers (age, gender, etc.) but clear question state
          const profileFields = ['age', 'gender', 'life_stage', 'companion'];
          const savedProfile = {};
          profileFields.forEach(f => {
            if (state.answers[f]) savedProfile[f] = state.answers[f];
          });
          state.currentQuestionIndex = 0;
          state.selectedQuestions = [];
          state.answers = savedProfile;
          $('#question-container').innerHTML = '';
          $('#questions-actions').style.display = 'none';
          $('#questions-complete').style.display = 'none';
          $('#questions-transition').style.display = 'block';
          const progressBar = $('#question-progress-bar');
          if (progressBar) progressBar.style.width = '0%';
          const counter = $('#question-counter');
          if (counter) counter.textContent = '';
        } else if (targetPage === 'questions') {
          // Coming back from generating - clean up timers, show questions complete
          cleanupGeneratingTimers();
          $$('.fork-line').forEach(l => l.classList.remove('animate'));
          // Show the questions complete state since user already finished questions
          $('#question-container').innerHTML = '';
          $('#questions-actions').style.display = 'none';
          $('#questions-complete').style.display = 'block';
          $('#questions-transition').style.display = 'none';
          const progressBar = $('#question-progress-bar');
          if (progressBar) progressBar.style.width = '100%';
        }

        navigateTo(targetPage);
      });
    });
  }

  // ========================================
  // Result Actions
  // ========================================
  function initResultActions() {
    const btnRestart = $('#btn-restart');
    const btnSave = $('#btn-save');

    btnRestart.addEventListener('click', () => {
      resetState();
      navigateTo('landing');
      // Re-trigger typewriter
      setTimeout(() => {
        typeWriter($('#typewriter-text'), '有没有一个选择，你一直想重来？', CONFIG.TYPEWRITER_SPEED);
      }, 500);
    });

    btnSave.addEventListener('click', () => {
      saveAsImage();
    });
  }

  // ========================================
  // State Management
  // ========================================
  function resetState() {
    // Clean up generating timers
    cleanupGeneratingTimers();

    state.regret = '';
    state.choicePast = '';
    state.choiceAlt = '';
    state.answers = {};
    state.selectedQuestions = [];
    state.currentQuestionIndex = 0;
    state.result = null;

    // Reset landing acknowledgment
    const ack = $('#landing-ack');
    if (ack) ack.classList.remove('visible');

    // Reset form fields
    $('#regret-input').value = '';
    $('#choice-past').value = '';
    $('#choice-alt').value = '';
    $('#btn-start').disabled = true;

    // Reset questions page
    $('#question-container').innerHTML = '';
    $('#questions-actions').style.display = 'none';
    $('#questions-complete').style.display = 'none';
    $('#questions-transition').style.display = 'block';

    // Reset profile page tags
    $$('.profile-tag').forEach(t => t.classList.remove('selected'));

    // Reset progress bar
    const progressBar = $('#question-progress-bar');
    if (progressBar) progressBar.style.width = '0%';

    // Reset question counter
    const counter = $('#question-counter');
    if (counter) counter.textContent = '';

    // Reset generating page
    $$('.fork-line').forEach((l) => l.classList.remove('animate'));

    // Reset result page cards
    $$('.timeline-card, .reflection-card').forEach((c) => c.classList.remove('visible'));

    // Reset scroll hint
    const scrollHint = $('#scroll-hint');
    if (scrollHint) {
      scrollHint.style.display = 'none';
      scrollHint.style.opacity = '';
    }

    // Scroll result page to top
    const resultPage = $('#page-result');
    if (resultPage) resultPage.scrollTop = 0;
  }

  // ========================================
  // Sensitive Content Detection
  // ========================================
  const CRISIS_KEYWORDS = [
    '自杀', '不想活', '去死', '结束生命', '跳楼', '割腕',
    '活不下去', '没有意义', '想死', '了结',
    'suicide', 'kill myself', 'end my life', "don't want to live",
  ];

  function checkCrisisContent(text) {
    const lower = text.toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  }

  function monitorCrisisInput() {
    // Monitor all textareas for crisis keywords
    document.addEventListener('input', (e) => {
      if (e.target.tagName === 'TEXTAREA' && checkCrisisContent(e.target.value)) {
        $('#modal-crisis').style.display = 'flex';
      }
    });
  }

  // ========================================
  // Initialize
  // ========================================
  function init() {
    initParticles();
    initLanding();
    initChoices();
    initProfile();
    initQuestions();
    initModals();
    initResultActions();
    monitorCrisisInput();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
