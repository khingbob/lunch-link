export const CATEGORIES = [
  "Just chatting",
  "Tech & ideas",
  "Languages",
  "Outdoors",
  "Food & culture",
  "Gaming",
] as const;
export type Category = (typeof CATEGORIES)[number];
export type Member = { id: string; name: string; avatar: number };
export type Lobby = {
  id: string;
  title: string;
  description: string;
  category: Category;
  language: string;
  capacity: number;
  date: string;
  time: string;
  location: "Mensa Garching";
  visibility: "public" | "private";
  inviteCode: string;
  host: Member;
  members: Member[];
};
export type NewLobby = Pick<
  Lobby,
  | "title"
  | "description"
  | "category"
  | "language"
  | "capacity"
  | "date"
  | "time"
  | "visibility"
>;
export type AppState = {
  lobbies: Lobby[];
  user: Member | null;
  saved: string[];
  feedback: { rating: number; message: string; date: string }[];
};

export const DEMO_USER: Member = { id: "you", name: "Alex Morgan", avatar: 12 };
export const STORAGE_KEY = "lunchlink-v1";

export function dateKey(offset = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function friendlyDate(date: string): string {
  if (date === dateKey()) return "Today";
  if (date === dateKey(1)) return "Tomorrow";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function initialState(): AppState {
  const people: Member[] = [
    { id: "sophie", name: "Sophie", avatar: 47 },
    { id: "daniel", name: "Daniel", avatar: 11 },
    { id: "amina", name: "Amina", avatar: 44 },
    { id: "luca", name: "Luca", avatar: 13 },
    { id: "maya", name: "Maya", avatar: 49 },
    { id: "leo", name: "Leo", avatar: 14 },
  ];
  const seeds: [string, string, Category, string, string, number, number][] = [
    [
      "New here? Let's do lunch.",
      "New city, new semester, new faces. Come as you are, grab something good, and let's make campus feel a little more like home.",
      "Just chatting",
      "English",
      "12:00",
      4,
      6,
    ],
    [
      "Big ideas, small talk",
      "AI, side projects, and the ideas that keep you up at night. No pitch decks, just a relaxed lunch with curious people.",
      "Tech & ideas",
      "English",
      "12:15",
      3,
      5,
    ],
    [
      "A little Deutsch, a lot of fun",
      "A friendly place to practise German, make mistakes, and laugh together. All levels welcome, from Hallo to fluent.",
      "Languages",
      "German & English",
      "12:30",
      3,
      6,
    ],
    [
      "Trails, tales & weekend plans",
      "Looking for your next hiking buddy? Let's swap favourite trails around Munich and dream up a weekend adventure.",
      "Outdoors",
      "English",
      "12:30",
      2,
      5,
    ],
    [
      "A little taste of everywhere",
      "The foods we miss, the places we call home, and the best hidden gems in Munich. Bring your appetite and a story.",
      "Food & culture",
      "English",
      "13:00",
      5,
      6,
    ],
    [
      "One more game?",
      "Board games, co-op adventures, and friendly debates about the best game of all time. Everyone is welcome at this table.",
      "Gaming",
      "English",
      "13:15",
      6,
      6,
    ],
  ];
  return {
    user: null,
    saved: [],
    feedback: [],
    lobbies: seeds.map(
      (
        [title, description, category, language, time, count, capacity],
        index,
      ) => {
        const members = Array.from(
          { length: count },
          (_, position) => people[(index + position) % people.length],
        );
        return {
          id: `lunch-${index + 1}`,
          title,
          description,
          category,
          language,
          time,
          capacity,
          date: dateKey(),
          location: "Mensa Garching",
          visibility: "public",
          inviteCode: `LL-GARCH${index + 1}`,
          host: members[0],
          members,
        };
      },
    ),
  };
}

export function joinLobby(
  lobby: Lobby,
  member: Member,
  inviteCode?: string,
): Lobby {
  if (lobby.members.some((existing) => existing.id === member.id)) return lobby;
  if (lobby.members.length >= lobby.capacity)
    throw new Error(
      "This table is full. There is another seat out there for you!",
    );
  if (
    lobby.visibility === "private" &&
    inviteCode?.trim().toUpperCase() !== lobby.inviteCode
  )
    throw new Error("You need a valid invite code to join this lunch.");
  return { ...lobby, members: [...lobby.members, member] };
}

export function leaveLobby(lobby: Lobby, userId: string): Lobby {
  if (lobby.host.id === userId)
    throw new Error(
      "You are hosting this lunch. Cancel it instead to free the table.",
    );
  return {
    ...lobby,
    members: lobby.members.filter((member) => member.id !== userId),
  };
}

export function createLobby(input: NewLobby, host: Member): Lobby {
  if (input.title.trim().length < 5 || input.title.trim().length > 70)
    throw new Error("Give your lunch a title between 5 and 70 characters.");
  if (!CATEGORIES.includes(input.category))
    throw new Error("Choose a topic for your lunch.");
  if (!input.language.trim() || input.language.length > 40)
    throw new Error("Choose a conversation language.");
  if (
    !Number.isInteger(input.capacity) ||
    input.capacity < 2 ||
    input.capacity > 8
  )
    throw new Error("A lunch group needs between 2 and 8 people.");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    input.date < dateKey() ||
    Number.isNaN(Date.parse(`${input.date}T12:00:00`))
  )
    throw new Error("Choose today or a future date.");
  if (!/^(11|12|13):(00|15|30|45)$/.test(input.time) || input.time > "13:30")
    throw new Error(
      "Choose a start time from 11:00 to 13:30. Lunch ends by 14:00.",
    );
  return {
    ...input,
    title: input.title.trim(),
    description: input.description.trim().slice(0, 500),
    id: crypto.randomUUID(),
    host,
    members: [host],
    location: "Mensa Garching",
    inviteCode: `LL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  };
}

export function restoreState(raw: string | null): AppState {
  if (!raw) return initialState();
  try {
    const state = JSON.parse(raw) as AppState;
    if (
      !Array.isArray(state.lobbies) ||
      !Array.isArray(state.saved) ||
      !Array.isArray(state.feedback)
    )
      return initialState();
    if (
      state.user !== null &&
      (!state.user ||
        typeof state.user.id !== "string" ||
        typeof state.user.name !== "string")
    )
      return initialState();
    if (
      !state.lobbies.every(
        (lobby) =>
          typeof lobby.id === "string" &&
          typeof lobby.title === "string" &&
          typeof lobby.description === "string" &&
          typeof lobby.date === "string" &&
          typeof lobby.time === "string" &&
          typeof lobby.language === "string" &&
          typeof lobby.inviteCode === "string" &&
          CATEGORIES.includes(lobby.category) &&
          ["public", "private"].includes(lobby.visibility) &&
          Number.isInteger(lobby.capacity) &&
          lobby.capacity >= 2 &&
          lobby.capacity <= 8 &&
          lobby.host &&
          typeof lobby.host.id === "string" &&
          Array.isArray(lobby.members) &&
          lobby.members.length <= lobby.capacity &&
          lobby.members.every(
            (member) =>
              member &&
              typeof member.id === "string" &&
              typeof member.name === "string",
          ),
      )
    )
      return initialState();
    return state;
  } catch {
    return initialState();
  }
}
