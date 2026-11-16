import { describe, expect, it } from "vitest";
import {
  createLobby,
  dateKey,
  DEMO_USER,
  initialState,
  joinLobby,
  leaveLobby,
  restoreState,
  type NewLobby,
} from "./model";

const input: NewLobby = {
  title: "Lunch with new friends",
  description: "A relaxed lunch.",
  category: "Just chatting",
  language: "English",
  capacity: 4,
  date: dateKey(),
  time: "12:00",
  visibility: "public",
};

describe("lunch membership", () => {
  it("joins once and frees a seat when leaving", () => {
    const lobby = initialState().lobbies[0];
    const joined = joinLobby(lobby, DEMO_USER);
    expect(joined.members).toHaveLength(lobby.members.length + 1);
    expect(joinLobby(joined, DEMO_USER)).toBe(joined);
    expect(leaveLobby(joined, DEMO_USER.id).members).toEqual(lobby.members);
  });
  it("never overfills a table", () => {
    expect(() => joinLobby(initialState().lobbies[5], DEMO_USER)).toThrow(
      "full",
    );
  });
  it("requires an invite for private lunches", () => {
    const lobby = {
      ...initialState().lobbies[0],
      visibility: "private" as const,
    };
    expect(() => joinLobby(lobby, DEMO_USER)).toThrow("invite");
    expect(() => joinLobby(lobby, DEMO_USER, "wrong")).toThrow("invite");
    expect(
      joinLobby(lobby, DEMO_USER, lobby.inviteCode.toLowerCase()).members,
    ).toHaveLength(5);
  });
  it("keeps hosts from silently leaving their lunch", () => {
    const lobby = createLobby(input, DEMO_USER);
    expect(() => leaveLobby(lobby, DEMO_USER.id)).toThrow("hosting");
  });
});

describe("Garching pilot rules", () => {
  it("creates a lunch with the host and a unique invite", () => {
    const lobby = createLobby(input, DEMO_USER);
    expect(lobby.location).toBe("Mensa Garching");
    expect(lobby.members).toEqual([DEMO_USER]);
    expect(lobby.inviteCode).toMatch(/^LL-/);
  });
  it.each(["10:45", "13:45", "14:00", "25:00"])(
    "rejects a start time of %s",
    (time) => {
      expect(() => createLobby({ ...input, time }, DEMO_USER)).toThrow(
        "start time",
      );
    },
  );
  it.each([1, 9, 3.5])("rejects a capacity of %s", (capacity) => {
    expect(() => createLobby({ ...input, capacity }, DEMO_USER)).toThrow(
      "between 2 and 8",
    );
  });
  it("rejects empty names and past dates", () => {
    expect(() => createLobby({ ...input, title: "   " }, DEMO_USER)).toThrow(
      "title",
    );
    expect(() =>
      createLobby({ ...input, date: "2020-01-01" }, DEMO_USER),
    ).toThrow("future");
  });
});

describe("local persistence", () => {
  it("restores memberships and saved lunches", () => {
    const state = initialState();
    state.user = DEMO_USER;
    state.saved = ["lunch-2"];
    state.lobbies[0] = joinLobby(state.lobbies[0], DEMO_USER);
    expect(restoreState(JSON.stringify(state))).toEqual(state);
  });
  it.each([null, "broken", "{}", '{"lobbies":[{}],"saved":[],"feedback":[]}'])(
    "recovers safely from malformed storage: %s",
    (raw) => {
      expect(restoreState(raw).lobbies).toHaveLength(6);
    },
  );
});
