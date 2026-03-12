(function () {
  const state = {
    allEvents: [],
    timeline: [],
    queue: [],
    currentEvent: null,
    score: 0,
    answered: 0,
  };

  const elements = {
    score: document.getElementById('score'),
    progress: document.getElementById('progress'),
    eventTitle: document.getElementById('event-title'),
    eventDescription: document.getElementById('event-description'),
    timeline: document.getElementById('timeline'),
    feedback: document.getElementById('feedback'),
    gameScreen: document.getElementById('game-screen'),
    resultScreen: document.getElementById('result-screen'),
    finalScore: document.getElementById('final-score'),
    restartBtn: document.getElementById('restart-btn'),
  };

  elements.restartBtn.addEventListener('click', startGame);

  init();

  async function init() {
    try {
      state.allEvents = await window.DataStore.loadEvents();
      startGame();
    } catch (error) {
      elements.eventTitle.textContent = '题库加载失败';
      elements.eventDescription.textContent = '请确认 data/events.json 可访问。';
    }
  }

  function startGame() {
    const shuffled = shuffle([...state.allEvents]);
    const [base, ...rest] = shuffled;

    state.timeline = [base];
    state.queue = rest;
    state.currentEvent = null;
    state.score = 0;
    state.answered = 0;

    elements.resultScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');
    elements.feedback.textContent = '';

    nextEvent();
    render();
  }

  function nextEvent() {
    if (state.queue.length === 0) {
      endGame();
      return;
    }
    state.currentEvent = state.queue.shift();
    renderCurrentEvent();
  }

  function handleInsert(position) {
    const expected = findCorrectPosition(state.currentEvent, state.timeline);
    const correct = expected === position;

    state.timeline.splice(position, 0, state.currentEvent);
    state.answered += 1;

    if (correct) {
      state.score += 1;
      elements.feedback.textContent = '✅ 放置正确！';
      elements.feedback.className = 'feedback ok';
    } else {
      elements.feedback.textContent = `❌ 放置错误，正确位置应为第 ${expected + 1} 个。`;
      elements.feedback.className = 'feedback wrong';
    }

    renderStats();
    renderTimeline();

    setTimeout(() => {
      elements.feedback.textContent = '';
      elements.feedback.className = 'feedback';
      nextEvent();
    }, 700);
  }

  function findCorrectPosition(event, timeline) {
    for (let i = 0; i < timeline.length; i += 1) {
      if (event.timestamp < timeline[i].timestamp) {
        return i;
      }
    }
    return timeline.length;
  }

  function render() {
    renderStats();
    renderCurrentEvent();
    renderTimeline();
  }

  function renderStats() {
    elements.score.textContent = String(state.score);
    elements.progress.textContent = `${state.answered} / ${state.allEvents.length - 1}`;
  }

  function renderCurrentEvent() {
    if (!state.currentEvent) {
      elements.eventTitle.textContent = '恭喜通关';
      elements.eventDescription.textContent = '所有事件都已完成。';
      return;
    }

    elements.eventTitle.textContent = state.currentEvent.title;
    elements.eventDescription.textContent = state.currentEvent.description;
  }

  function renderTimeline() {
    elements.timeline.innerHTML = '';

    for (let i = 0; i <= state.timeline.length; i += 1) {
      const insertBtn = document.createElement('button');
      insertBtn.className = 'insert-btn';
      insertBtn.textContent = '插入到这里';
      insertBtn.disabled = !state.currentEvent;
      insertBtn.addEventListener('click', () => handleInsert(i));
      elements.timeline.appendChild(insertBtn);

      if (i < state.timeline.length) {
        const item = document.createElement('article');
        item.className = 'timeline-item';
        item.innerHTML = `
          <p class="timeline-date">${formatDate(state.timeline[i].date)}</p>
          <h4>${state.timeline[i].title}</h4>
          <p>${state.timeline[i].description}</p>
        `;
        elements.timeline.appendChild(item);
      }
    }
  }

  function endGame() {
    state.currentEvent = null;
    renderCurrentEvent();
    renderTimeline();

    elements.gameScreen.classList.add('hidden');
    elements.resultScreen.classList.remove('hidden');
    elements.finalScore.textContent = `你的最终得分：${state.score} / ${state.allEvents.length - 1}`;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
})();
