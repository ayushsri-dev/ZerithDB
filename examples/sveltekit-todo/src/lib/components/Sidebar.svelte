/**
 * Sidebar component for the SvelteKit ZerithDB todo app.
 * Displays:
 * -> current date
 * -> interactive calendar
 * -> today's task overview
 *
 * All states are received from the parent component through props to keep the sidebar reusable
 */

<script lang="ts">
  let {
    currentDay,

    currentDate,

    currentMonth,

    currentYear,

    firstDay,

    days,

    isSelected,

    selectDay,

    todayTasks,

    todayCompleted,

    todayRemaining,

    todayCompletedPercentage,

    todayRemainingPercentage
  }: {
    currentDay: string;

    currentDate: number;

    currentMonth: string;

    currentYear: number;

    firstDay: number;

    days: number[];

    isSelected:
      (day: number) => boolean;

    selectDay:
      (day: number) => void;

    todayTasks: number;

    todayCompleted: number;

    todayRemaining: number;

    todayCompletedPercentage: number;

    todayRemainingPercentage: number;
  } = $props();

/**
 * At this point calendar data and task statistics are collected from the parent page.
*/

</script>

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

      {#each Array(firstDay) as _}{/each}
      {#each days as day}

        <button 
        class:selected-day={isSelected(day)} 
        class="calendar-day"
        onclick={() => selectDay(day)}
        >  {day}
        </button>

      {/each}
    </div>
  </div>

  <div class="separator"></div>
  <div>
    <p class="section-title">
      TODAY
    </p>

    <div class="overview-grid">

      <div class="overview-item">
        <div
          class="mini-ring"
          style="
            background: conic-gradient( #F3F4F4 100%,rgba(255,255,255,0.05) 0%)">

          <div class="mini-inner">
            {todayTasks}
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

<style>
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

    overflow: hidden;
  }

  .separator {
    height: 1px;

    background:
      rgba(255,255,255,0.05);
  }

  .tiny-label,
  .section-title {
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
  }

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

    border: none;

    border-radius: 10px;

    background:
      rgba(255,255,255,0.03);

    color: #dce7e8;

    cursor: pointer;
  }

  .selected-day {
    background: #5F9598;

    color: white;
  }

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

  .mini-ring {
    width: 58px;
    height: 58px;

    border-radius: 50%;

    display: flex;

    align-items: center;

    justify-content: center;
  }

  .mini-inner {
    width: 44px;
    height: 44px;

    border-radius: 50%;

    background: #0d2430;

    display: flex;

    align-items: center;

    justify-content: center;
  }
</style>