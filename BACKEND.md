# Integrating a Python / FastAPI backend

The UI never talks to LocalStorage directly — it talks to the **data service** in
[`src/lib/store.js`](src/lib/store.js). Every method is already `async` and maps
1:1 to a REST endpoint, so adding a backend means writing a sibling store and
flipping one import.

## 1. Suggested REST surface

| Store method                       | HTTP                              |
| ---------------------------------- | --------------------------------- |
| `listHabits()`                     | `GET    /habits`                  |
| `createHabit(habit)`               | `POST   /habits`                  |
| `updateHabit(id, patch)`           | `PATCH  /habits/{id}`             |
| `deleteHabit(id)`                  | `DELETE /habits/{id}`             |
| `getLogs(habitId)`                 | `GET    /habits/{id}/logs`        |
| `setEntry(habitId, day, entry)`    | `PUT    /habits/{id}/logs/{day}`  |

## 2. Minimal FastAPI sketch

```python
from datetime import date
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Habit(BaseModel):
    id: str
    name: str
    icon: str = "Target"
    type: str = "binary"          # "binary" | "quantitative"
    target: int = 1
    unit: str = ""
    createdAt: str

class Entry(BaseModel):
    value: float | bool
    shield: bool = False

@app.get("/habits")
def list_habits() -> list[Habit]:
    ...

@app.put("/habits/{habit_id}/logs/{day}")
def set_entry(habit_id: str, day: str, entry: Entry) -> Entry:
    ...
```

The streak math in [`src/lib/streaks.js`](src/lib/streaks.js) is pure and
deterministic — port it to Python verbatim if you want server-side analytics
(e.g. consistency reports, reminders, or leaderboards).

## 3. Front-end swap

Create `src/lib/apiStore.js` implementing the same methods with `fetch`, then in
`src/hooks/useStore.js` import it instead of the LocalStorage `store`. Because the
React layer only depends on the async signatures, **no component changes are
required.**

```js
// src/lib/apiStore.js
const BASE = import.meta.env.VITE_API_URL ?? '/api';

export const store = {
  async listHabits() {
    return (await fetch(`${BASE}/habits`)).json();
  },
  async setEntry(habitId, day, entry) {
    return (
      await fetch(`${BASE}/habits/${habitId}/logs/${day}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    ).json();
  },
  // …the rest mirror store.js
};
```
