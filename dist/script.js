const YEAR = 2026;
const STORAGE_KEY = "green-planner-2026-todos";
const weekdays = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const state = {
  month: 0,
  selectedDate: "2026-01-01",
  todos: loadTodos()
};

const elements = {
  monthTitle: document.querySelector("#month-title"),
  grid: document.querySelector("#calendar-grid"),
  prev: document.querySelector("#prev-month"),
  next: document.querySelector("#next-month"),
  today: document.querySelector("#today-button"),
  selectedDay: document.querySelector("#selected-day"),
  selectedWeekday: document.querySelector("#selected-weekday"),
  selectedTitle: document.querySelector("#selected-date-title"),
  form: document.querySelector("#todo-form"),
  input: document.querySelector("#todo-input"),
  list: document.querySelector("#todo-list"),
  summary: document.querySelector("#todo-summary"),
  clearCompleted: document.querySelector("#clear-completed"),
  empty: document.querySelector("#empty-state"),
  template: document.querySelector("#todo-template"),
  progressLabel: document.querySelector("#progress-label"),
  progressBar: document.querySelector("#progress-bar"),
  progressTrack: document.querySelector(".progress-track")
};

function loadTodos() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.todos));
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayIn2026() {
  const now = new Date();
  return now.getFullYear() === YEAR ? now : new Date(YEAR, 0, 1);
}

function getCalendarDates() {
  const first = new Date(YEAR, state.month, 1);
  const gridStart = new Date(YEAR, state.month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
}

function renderCalendar() {
  elements.monthTitle.textContent = `${state.month + 1}월`;
  elements.grid.innerHTML = "";
  const realToday = new Date();
  const todayKey = dateKey(realToday.getFullYear(), realToday.getMonth(), realToday.getDate());

  getCalendarDates().forEach((date) => {
    const key = dateKey(date.getFullYear(), date.getMonth(), date.getDate());
    const button = document.createElement("button");
    const inYear = date.getFullYear() === YEAR;
    const inMonth = inYear && date.getMonth() === state.month;
    const tasks = state.todos[key] || [];

    button.type = "button";
    button.className = "day-cell";
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일, 할 일 ${tasks.length}개`);
    button.innerHTML = `<span class="day-number">${date.getDate()}</span>`;

    if (!inMonth) button.classList.add("is-outside");
    if (key === state.selectedDate) button.classList.add("is-selected");
    if (key === todayKey) button.classList.add("is-today");
    if (date.getDay() === 0) button.classList.add("is-sunday");

    if (tasks.length) {
      const dots = document.createElement("span");
      dots.className = "task-dots";
      tasks.slice(0, 4).forEach((task) => {
        const dot = document.createElement("i");
        if (task.done) dot.classList.add("done");
        dots.appendChild(dot);
      });
      button.appendChild(dots);
    }

    button.addEventListener("click", () => {
      if (!inYear) return;
      state.selectedDate = key;
      state.month = date.getMonth();
      render();
      elements.input.focus();
    });
    elements.grid.appendChild(button);
  });

  renderProgress();
}

function renderSelectedDate() {
  const [year, month, day] = state.selectedDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  elements.selectedDay.textContent = day;
  elements.selectedWeekday.textContent = weekdays[date.getDay()];
  elements.selectedTitle.textContent = `${year}년 ${month}월 ${day}일`;

  const tasks = state.todos[state.selectedDate] || [];
  const doneCount = tasks.filter((task) => task.done).length;
  elements.summary.textContent = tasks.length ? `할 일 ${tasks.length}개 · 완료 ${doneCount}개` : "할 일 0개";
  elements.clearCompleted.disabled = doneCount === 0;
  elements.empty.hidden = tasks.length > 0;
  elements.list.hidden = tasks.length === 0;
  elements.list.innerHTML = "";

  tasks.forEach((task) => {
    const fragment = elements.template.content.cloneNode(true);
    const item = fragment.querySelector(".todo-item");
    const checkbox = fragment.querySelector("input");
    const text = fragment.querySelector(".todo-text");
    const remove = fragment.querySelector(".delete-button");
    checkbox.checked = task.done;
    text.textContent = task.text;
    item.classList.toggle("is-done", task.done);

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveTodos();
      render();
    });
    remove.addEventListener("click", () => {
      state.todos[state.selectedDate] = tasks.filter((item) => item.id !== task.id);
      if (!state.todos[state.selectedDate].length) delete state.todos[state.selectedDate];
      saveTodos();
      render();
    });
    elements.list.appendChild(fragment);
  });
}

function renderProgress() {
  const prefix = `${YEAR}-${String(state.month + 1).padStart(2, "0")}-`;
  const monthlyTasks = Object.entries(state.todos)
    .filter(([key]) => key.startsWith(prefix))
    .flatMap(([, tasks]) => tasks);
  const completed = monthlyTasks.filter((task) => task.done).length;
  const progress = monthlyTasks.length ? Math.round((completed / monthlyTasks.length) * 100) : 0;
  elements.progressLabel.textContent = `${progress}%`;
  elements.progressBar.style.width = `${progress}%`;
  elements.progressTrack.setAttribute("aria-valuenow", String(progress));
}

function render() {
  renderCalendar();
  renderSelectedDate();
}

function addTodo(date, text) {
  if (!/^2026-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$/.test(date)) {
    throw new Error("2026년의 올바른 날짜를 YYYY-MM-DD 형식으로 입력해 주세요.");
  }
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime()) || dateKey(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()) !== date) {
    throw new Error("존재하지 않는 날짜입니다.");
  }
  const cleanText = typeof text === "string" ? text.trim() : "";
  if (!cleanText || cleanText.length > 80) {
    throw new Error("할 일은 1자 이상 80자 이하로 입력해 주세요.");
  }
  const task = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, text: cleanText, done: false };
  state.todos[date] = [...(state.todos[date] || []), task];
  state.selectedDate = date;
  state.month = parsed.getMonth();
  saveTodos();
  render();
  return task;
}

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();

  const reportError = (error) => console.warn("WebMCP 도구 등록 실패", error);
  const register = (tool) => {
    try {
      void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(reportError);
    } catch (error) {
      reportError(error);
    }
  };

  register({
    name: "list_todos_for_date",
    title: "날짜별 할 일 보기",
    description: "2026년의 지정한 날짜에 저장된 할 일과 완료 상태를 조회합니다.",
    inputSchema: {
      type: "object",
      properties: { date: { type: "string", pattern: "^2026-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$" } },
      required: ["date"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute(input) {
      if (!input || typeof input.date !== "string") throw new Error("날짜가 필요합니다.");
      return { date: input.date, todos: (state.todos[input.date] || []).map(({ id, text, done }) => ({ id, text, done })) };
    }
  });

  register({
    name: "create_todo",
    title: "할 일 추가",
    description: "2026년의 지정한 날짜에 새 할 일을 추가하고 달력을 해당 날짜로 이동합니다.",
    inputSchema: {
      type: "object",
      properties: {
        date: { type: "string", pattern: "^2026-(0[1-9]|1[0-2])-([0-2][0-9]|3[01])$" },
        text: { type: "string", minLength: 1, maxLength: 80 }
      },
      required: ["date", "text"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: true },
    execute(input) {
      if (!input || typeof input.date !== "string" || typeof input.text !== "string") {
        throw new Error("날짜와 할 일 내용이 필요합니다.");
      }
      const task = addTodo(input.date, input.text);
      return { created: true, date: input.date, todo: { id: task.id, text: task.text, done: task.done } };
    }
  });
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.input.value.trim();
  if (!text) return;
  addTodo(state.selectedDate, text);
  elements.input.value = "";
  elements.input.focus();
});

elements.clearCompleted.addEventListener("click", () => {
  const tasks = (state.todos[state.selectedDate] || []).filter((task) => !task.done);
  if (tasks.length) state.todos[state.selectedDate] = tasks;
  else delete state.todos[state.selectedDate];
  saveTodos();
  render();
});

elements.prev.addEventListener("click", () => {
  if (state.month === 0) return;
  state.month -= 1;
  state.selectedDate = dateKey(YEAR, state.month, 1);
  render();
});

elements.next.addEventListener("click", () => {
  if (state.month === 11) return;
  state.month += 1;
  state.selectedDate = dateKey(YEAR, state.month, 1);
  render();
});

elements.today.addEventListener("click", () => {
  const date = todayIn2026();
  state.month = date.getMonth();
  state.selectedDate = dateKey(YEAR, date.getMonth(), date.getDate());
  render();
});

const initialDate = todayIn2026();
state.month = initialDate.getMonth();
state.selectedDate = dateKey(YEAR, initialDate.getMonth(), initialDate.getDate());
render();
registerWebMcpTools();
