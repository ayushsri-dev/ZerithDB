<!--
 * Main page component for the SvelteKit ZerithDB todo app.
 *
 * Handles task orchestration, calendar interactions, reactive UI state, and CRUD tasks.
-->

<svelte:options runes={true} />

<script lang="ts">
  import { fade, fly } from "svelte/transition";
  // Load persisted todos and initialize the default selected date on mount.
  import { onMount } from "svelte";
  import {
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo
  } from "$lib/todoServices";

  type Priority =
    | "Low"
    | "Medium"
    | "High";

  type Task = {
    _id?: string;
    text: string;
    done: boolean;
    priority: Priority;
    date: string;
    time: string;
  };

  let now = $state(new Date());
  let selectedDate = $state("");
  let taskInput = $state("");
  let searchQuery = $state("");
  let selectedPriority = $state<Priority>("Low");
  let selectedTime = $state("09:00");
  let tasks = $state<Task[]>([]);

  // Reactive clock state used for calendar and date-based UI updates.
  setInterval(() => {
    now = new Date();
  }, 60000);

  // SETTING DATE
  const todayDate = $derived(
    `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")}`
  );

  const currentDay = $derived(
    now.toLocaleDateString("en-US", {weekday: "long"}).toUpperCase()
  );

  const currentDate = $derived(
    now.getDate()
  );

  const currentMonth = $derived(
    now.toLocaleString("default", {month: "long"})
  );

  const currentYear = $derived(
    now.getFullYear()
  );

  onMount(async () => {
    selectedDate = todayDate;

    await loadTodos();
  });

  // Synchronize latese Todos from ZerithDB with reactive UI states.
  async function loadTodos() {
  try {
    const data = await fetchTodos();
    tasks = data || [];
  } 
  catch (err) {
    console.error("Failed loading todos:",err);
  }
}

  // CALENDAR

  const daysInMonth = $derived(
    new Date( currentYear, now.getMonth()+ 1, 0 ).getDate()
  );

  const firstDay = $derived(
    new Date( currentYear, now.getMonth(), 1).getDay()
  );

  const days = $derived(
    Array.from( { length: daysInMonth }, (_, i) => i + 1 )
  );

  function selectDay(day: number) {
    const date = new Date( currentYear, now.getMonth(),day );
    selectedDate = date.toISOString().split("T")[0];
  }

  function isSelected(day: number) {
    const date = new Date(currentYear,now.getMonth(),day);
    return date.toISOString().split("T")[0] === selectedDate;
  }

  // CREATE
  async function addTask() {
    if (!taskInput.trim()) return;

    try {
      const newTask: Task = {
        text: taskInput.trim(),
        done: false,
        priority: selectedPriority,
        date: selectedDate,
        time: selectedTime
      };

      await createTodo(newTask);

      taskInput = "";

      await loadTodos();
    } catch (err) {
      console.error("Create failed:", err);
    }
  }

  // UPDATE

  async function toggleTask(task: Task) {
    if (!task._id) return;
    try {
      await updateTodo(task._id, {
        done: !task.done
      });
      await loadTodos();
    } 
    catch (err) {
      console.error("Update failed:",err);
    }
  }

  // DELETE TASKS

  async function removeTask(task: Task) {
    if (!task._id) return;
    try {
      await deleteTodo(task._id);

      await loadTodos();
    }
    catch (err) {
      console.error("Delete failed:",err);
    }
  }

  // FILTERED TASKS

  const filteredTasks = $derived(
    tasks.filter((task) => {
      const sameDate = task.date === selectedDate;
      const matchesSearch =
        task.text.toLowerCase().includes( searchQuery.toLowerCase() );
      return (
        sameDate && matchesSearch
      );
    })
  );

  // TASK STATISTICS COMPUTATION

  const totalTasks = $derived(
    tasks.length
  );

  const completedTasks = $derived(
    tasks.filter(
      (task) => task.done
    ).length
  );

  const remainingTasks = $derived(
    totalTasks - completedTasks
  );

  const completedPercentage =
    $derived(
      totalTasks === 0
        ? 0
        : Math.round(
            (completedTasks /
              totalTasks) *
              100
          )
    );

  const remainingPercentage =
    $derived(
      totalTasks === 0
        ? 0
        : Math.round(
            (remainingTasks /
              totalTasks) *
              100
          )
    );

  // TODAY's OVERVIEW

  const todayTasks = $derived(
    tasks.filter(
      (task) =>
        task.date === todayDate
    )
  );

  const todayCompleted =
    $derived(
      todayTasks.filter(
        (task) => task.done
      ).length
    );

  const todayRemaining =
    $derived(
      todayTasks.length -
      todayCompleted
    );

  const todayCompletedPercentage =
    $derived(
      todayTasks.length === 0
        ? 0
        : Math.round(
            (todayCompleted /
              todayTasks.length) *
              100
          )
    );

  const todayRemainingPercentage =
    $derived(
      todayTasks.length === 0
        ? 0
        : Math.round(
            (todayRemaining /
              todayTasks.length) *
              100
          )
    );
</script>

<div class="page">

  <div class="ambient ambient-1"></div>
  <div class="ambient ambient-2"></div>

  <div class="layout">

    <!-- SIDEBAR -->

    <aside class="sidebar">

      <div>

        <p class="tiny-label">
          {currentDay}
        </p>

        <h1 class="date-number">
          {currentDate}
        </h1>

        <p class="date-text">
          {currentMonth} {currentYear}
        </p>

      </div>

      <div class="separator"></div>

      <!-- CALENDAR -->

      <div>

        <p class="section-title">
          CALENDAR
        </p>

        <div class="calendar-grid">

          {#each ["S","M","T","W","T","F","S"] as day}

            <div class="weekday">
              {day}
            </div>

          {/each}

          {#each Array(firstDay) as _}

            <div></div>

          {/each}

          {#each days as day}

            <button
              class:selected-day={isSelected(day)}
              class="calendar-day"
              onclick={() => selectDay(day)}
            >
              {day}
            </button>

          {/each}

        </div>

      </div>

      <div class="separator"></div>

      <!-- TODAY OVERVIEW -->

      <div>

        <p class="section-title">
          TODAY
        </p>

        <div class="overview-grid">

          <div class="overview-item">

            <div
              class="mini-ring"
              style="
                background:
                conic-gradient(
                  #F3F4F4 100%,
                  rgba(255,255,255,0.05) 0%
                )
              "
            >

              <div class="mini-inner">
                {todayTasks.length}
              </div>

            </div>

            <small>Total</small>

          </div>

          <div class="overview-item">

            <div
              class="mini-ring"
              style={`
                background:
                conic-gradient(
                  #5F9598
                  ${todayCompletedPercentage}%,

                  rgba(255,255,255,0.05)
                  ${todayCompletedPercentage}%
                )
              `}
            >

              <div class="mini-inner">
                {todayCompleted}
              </div>

            </div>

            <small>Done</small>

          </div>

          <div class="overview-item">

            <div
              class="mini-ring"
              style={`
                background:
                conic-gradient(
                  #1D546D
                  ${todayRemainingPercentage}%,

                  rgba(255,255,255,0.05)
                  ${todayRemainingPercentage}%
                )
              `}
            >

              <div class="mini-inner">
                {todayRemaining}
              </div>

            </div>

            <small>Left</small>

          </div>

        </div>

      </div>

    </aside>

    <!-- MAIN -->

    <main class="main-panel">

      <!-- HERO -->

      <div class="hero">

        <h2>
          ZERITH LABS WORKSPACE
        </h2>

        <p class="hero-subtitle">
          Minimal local-first productivity
        </p>

      </div>

      <!-- SEARCH -->

      <div class="search-bar">

        <input
          bind:value={searchQuery}
          placeholder="Search tasks..."
        />

      </div>

      <!-- INPUT -->

      <div class="input-wrapper">

        <input
          bind:value={taskInput}
          placeholder="Add a task..."
          onkeydown={(e) => {
            if (e.key === "Enter") {
              addTask();
            }
          }}
        />

        <!-- TIME -->

        <div class="modern-time-picker">

          <span class="time-icon">
            ⏰
          </span>

          <input
            type="time"
            bind:value={selectedTime}
            class="modern-time-input"
          />

        </div>

        <!-- PRIORITY -->

        <select
          bind:value={selectedPriority}
          class="priority-select"
        >

          <option value="Low">
            Low Priority
          </option>

          <option value="Medium">
            Medium Priority
          </option>

          <option value="High">
            High Priority
          </option>

        </select>

        <!-- ADD -->

        <button
          class="add-button"
          onclick={addTask}
        >

          <span class="plus">
            +
          </span>

          <span>
            Add Task
          </span>

        </button>

      </div>

      <!-- STATS -->

      <div class="stats-section">

        <div class="stat-circle">

          <div
            class="big-ring"
            style="
              background:
              conic-gradient(
                #F3F4F4 100%,
                rgba(255,255,255,0.05) 0%
              )
            "
          >

            <div class="big-inner">
              {totalTasks}
            </div>

          </div>

          <p>Total</p>

        </div>

        <div class="stat-circle">

          <div
            class="big-ring"
            style={`
              background:
              conic-gradient(
                #5F9598
                ${completedPercentage}%,

                rgba(255,255,255,0.05)
                ${completedPercentage}%
              )
            `}
          >

            <div class="big-inner">
              {completedTasks}
            </div>

          </div>

          <p>Done</p>

        </div>

        <div class="stat-circle">

          <div
            class="big-ring"
            style={`
              background:
              conic-gradient(
                #1D546D
                ${remainingPercentage}%,

                rgba(255,255,255,0.05)
                ${remainingPercentage}%
              )
            `}
          >

            <div class="big-inner">
              {remainingTasks}
            </div>

          </div>

          <p>Left</p>

        </div>

      </div>

      <!-- TASKS -->

      <div class="tasks-panel">

        <div class="tasks-header">
          {filteredTasks.length}
          TASKS
        </div>

        {#if filteredTasks.length === 0}

          <div
            class="empty-state"
            transition:fade
          >

            <div class="empty-icon">
              +
            </div>

            <h3>
              Nothing scheduled
            </h3>

          </div>

        {:else}

          <div class="task-list">

            {#each filteredTasks as task (task._id)}

              <div
                class="task-card"
                in:fly={{
                  y: 14,
                  duration: 250
                }}
                out:fade={{
                  duration: 150
                }}
              >

                <div
                  class={`priority-bar ${task.priority.toLowerCase()}`}
                ></div>

                <div class="task-left">

                  <button
                    class:checked={task.done}
                    class="check-button"
                    onclick={() =>
                      toggleTask(task)
                    }
                  >
                    ✓
                  </button>

                  <div>

                    <h4
                      class:done={task.done}
                    >
                      {task.text}
                    </h4>

                    <div class="task-meta">

                      <span
                        class={`priority ${task.priority.toLowerCase()}`}
                      >
                        {task.priority}
                      </span>

                      <span class="task-time">
                        {task.time}
                      </span>

                    </div>

                  </div>

                </div>

                <button
                  class="delete-btn"
                  onclick={() =>
                    removeTask(task)
                  }
                >
                  Delete
                </button>

              </div>

            {/each}

          </div>

        {/if}

      </div>

    </main>

  </div>

</div>

<style>
  .page {
    width: 100vw;

    height: 100vh;

    padding: 14px;

    overflow: hidden;

    position: relative;
  }

  .layout {
    width: 100%;
    height: 100%;

    display: grid;

    grid-template-columns:
      250px 1fr;

    gap: 14px;
  }

  /* SIDEBAR */

  .sidebar {
    display: flex;

    flex-direction: column;

    gap: 18px;

    padding: 22px;

    border-radius: 30px;

    background:
      linear-gradient(
        180deg,
        rgba(29,84,109,0.32),
        rgba(13,39,51,0.58)
      );

    border:
      1px solid rgba(255,255,255,0.05);

    backdrop-filter: blur(20px);

    overflow: hidden;
  }

  .separator {
    height: 1px;

    background:
      rgba(255,255,255,0.05);
  }

  .tiny-label,
  .section-title,
  .tasks-header {
    letter-spacing: 0.22em;

    font-size: 10px;

    color: #9cc5c8;
  }

  .date-number {
    margin: 4px 0;

    font-size: 72px;

    line-height: 1;

    font-family:
      "Cinzel",
      serif;
  }

  .date-text {
    color: #c7d9da;

    font-size: 14px;
  }

  /* CALENDAR */

  .calendar-grid {
    width: 100%;

    display: grid;

    grid-template-columns:
      repeat(7, minmax(0, 1fr));

    gap: 6px;
  }

  .weekday {
    text-align: center;

    font-size: 9px;

    color: #82adb0;
  }

  .calendar-day {
    width: 100%;

    aspect-ratio: 1;

    min-width: 0;

    border: none;

    border-radius: 10px;

    background:
      rgba(255,255,255,0.03);

    color: #dce7e8;

    cursor: pointer;

    transition: 0.18s ease;

    font-size: 13px;
  }

  .calendar-day:hover {
    background:
      rgba(95,149,152,0.18);
  }

  .selected-day {
    background: #5F9598;

    color: white;
  }

  /* OVERVIEW */

  .overview-grid {
    display: flex;

    justify-content: space-between;

    gap: 10px;
  }

  .overview-item {
    flex: 1;

    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 8px;
  }

  .mini-ring,
  .big-ring {
    display: flex;

    align-items: center;

    justify-content: center;

    border-radius: 50%;
  }

  .mini-ring {
    width: 58px;
    height: 58px;
  }

  .big-ring {
    width: 112px;
    height: 112px;
  }

  .mini-inner,
  .big-inner {
    border-radius: 50%;

    background: #0d2430;

    display: flex;

    align-items: center;

    justify-content: center;

    color: #F3F4F4;
  }

  .mini-inner {
    width: 44px;
    height: 44px;
  }

  .big-inner {
    width: 84px;
    height: 84px;

    font-size: 28px;

    font-family:
      "Cinzel",
      serif;
  }

  /* MAIN */

  .main-panel {
    display: flex;

    flex-direction: column;

    gap: 12px;

    overflow: hidden;
  }

  .hero {
    text-align: center;

    padding-top: 6px;
  }

  .hero h2 {
    margin: 0;

    font-size: 48px;

    font-family:
      "Cinzel",
      serif;

    letter-spacing: 0.04em;
  }

  .hero-subtitle {
    margin-top: 6px;

    color: #a8c6c8;

    font-size: 15px;
  }

  /* SEARCH */

  .search-bar input,
  .input-wrapper > input {
    width: 100%;

    border: none;

    outline: none;

    background:
      rgba(255,255,255,0.04);

    color: #F3F4F4;

    font-family:
      "Fauna One",
      serif;

    border:
      1px solid rgba(255,255,255,0.05);
  }

  .search-bar input {
    height: 52px;

    border-radius: 20px;

    padding: 0 18px;
  }

  /* INPUT BAR */

  .input-wrapper {
    display: flex;

    gap: 12px;

    padding: 12px;

    border-radius: 28px;

    background:
      rgba(255,255,255,0.03);

    border:
      1px solid rgba(255,255,255,0.05);
  }

  .input-wrapper > input {
    flex: 1;

    height: 54px;

    border-radius: 18px;

    padding: 0 18px;
  }

  /* TIME */

  .modern-time-picker {
    display: flex;

    align-items: center;

    gap: 10px;

    padding: 0 16px;

    height: 54px;

    border-radius: 18px;

    background:
      rgba(29,84,109,0.45);

    border:
      1px solid rgba(255,255,255,0.05);
  }

  .modern-time-input {
    border: none;

    outline: none;

    background: transparent;

    color: #F3F4F4;

    font-family:
      "Fauna One",
      serif;
  }

  .modern-time-input::-webkit-calendar-picker-indicator {
    filter: invert(1);
    opacity: 0.8;
  }

  /* PRIORITY */

  .priority-select {
    min-width: 170px;

    height: 54px;

    padding: 0 16px;

    border: none;

    outline: none;

    border-radius: 18px;

    background:
      rgba(29,84,109,0.45);

    color: #F3F4F4;

    border:
      1px solid rgba(255,255,255,0.05);

    appearance: none;

    font-family:
      "Fauna One",
      serif;
  }

  .priority-select option {
    background: #102a38;

    color: #F3F4F4;
  }

  /* BUTTON */

  .add-button {
    height: 54px;

    min-width: 180px;

    border: none;

    border-radius: 18px;

    background:
      linear-gradient(
        145deg,
        #5F9598,
        #6ca7aa
      );

    color: white;

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 10px;

    cursor: pointer;

    font-family:
      "Cinzel",
      serif;

    font-weight: 700;

    transition: 0.2s ease;

    box-shadow:
      0 10px 24px rgba(95,149,152,0.18);
  }

  .add-button:hover {
    transform:
      translateY(-2px);

    box-shadow:
      0 14px 28px rgba(95,149,152,0.24);
  }

  .plus {
    font-size: 20px;
  }

  /* STATS */

  .stats-section {
    display: flex;

    justify-content: center;

    gap: 70px;

    padding: 2px 0;
  }

  .stat-circle {
    display: flex;

    flex-direction: column;

    align-items: center;

    gap: 10px;
  }

  .stat-circle p {
    margin: 0;
  }

  /* TASKS PANEL */

  .tasks-panel {
    flex: 1;

    overflow: hidden;

    display: flex;

    flex-direction: column;

    padding: 16px;

    border-radius: 30px;

    background:
      linear-gradient(
        180deg,
        rgba(29,84,109,0.24),
        rgba(10,25,34,0.48)
      );

    border:
      1px solid rgba(255,255,255,0.05);
  }

  .task-list {
    flex: 1;

    overflow-y: auto;

    display: flex;

    flex-direction: column;

    gap: 12px;

    padding-right: 4px;
  }

  .task-card {
    min-height: 72px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 14px 16px;

    border-radius: 22px;

    background:
      rgba(255,255,255,0.03);

    border:
      1px solid rgba(255,255,255,0.04);

    transition: 0.18s ease;

    position: relative;

    overflow: hidden;
  }

  .task-card:hover {
    transform:
      translateY(-1px);

    border-color:
      rgba(95,149,152,0.2);
  }

  .priority-bar {
    position: absolute;

    left: 0;
    top: 0;

    width: 4px;
    height: 100%;
  }

  .priority-bar.low {
    background: #F3F4F4;
  }

  .priority-bar.medium {
    background: #5F9598;
  }

  .priority-bar.high {
    background: #1D546D;
  }

  .task-left {
    display: flex;

    align-items: center;

    gap: 14px;
  }

  .check-button {
    width: 28px;
    height: 28px;

    border-radius: 9px;

    border:
      1px solid rgba(255,255,255,0.08);

    background: transparent;

    color: transparent;

    cursor: pointer;
  }

  .check-button.checked {
    background: #5F9598;

    color: white;
  }

  .task-left h4 {
    margin: 0;

    font-size: 16px;

    font-family:
      "Cinzel",
      serif;
  }

  .done {
    text-decoration: line-through;

    opacity: 0.55;
  }

  .task-meta {
    display: flex;

    align-items: center;

    gap: 8px;

    margin-top: 5px;
  }

  .priority {
    padding: 4px 10px;

    border-radius: 999px;

    font-size: 10px;
  }

  .priority.low {
    background:
      rgba(243,244,244,0.08);
  }

  .priority.medium {
    background:
      rgba(95,149,152,0.18);
  }

  .priority.high {
    background:
      rgba(29,84,109,0.26);
  }

  .task-time {
    font-size: 10px;

    color: #b8d8d3;
  }

  .delete-btn {
    border: none;

    border-radius: 12px;

    padding: 10px 14px;

    background:
      rgba(255,255,255,0.04);

    color: #F3F4F4;

    cursor: pointer;

    transition: 0.18s ease;
  }

  .delete-btn:hover {
    background:
      rgba(255,255,255,0.08);
  }

  /* EMPTY STATE */

  .empty-state {
    flex: 1;

    display: flex;

    flex-direction: column;

    align-items: center;

    justify-content: center;
  }

  .empty-icon {
    width: 70px;

    height: 70px;

    border-radius: 22px;

    background:
      rgba(255,255,255,0.04);

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 32px;

    margin-bottom: 14px;
  }

  /* SCROLLBAR */

  .task-list::-webkit-scrollbar {
    width: 6px;
  }

  .task-list::-webkit-scrollbar-thumb {
    background:
      rgba(255,255,255,0.1);

    border-radius: 999px;
  }

  /* AMBIENT */

  .ambient {
    position: fixed;

    border-radius: 50%;

    filter: blur(120px);

    z-index: 0;
  }

  .ambient-1 {
    width: 260px;

    height: 260px;

    background:
      rgba(95,149,152,0.18);

    top: -80px;

    left: -80px;
  }

  .ambient-2 {
    width: 240px;

    height: 240px;

    background:
      rgba(29,84,109,0.2);

    bottom: -60px;

    right: -40px;
  }
</style>