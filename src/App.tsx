import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Toaster, toast } from "sonner";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Coffee,
  Compass,
  Copy,
  ExternalLink,
  Globe2,
  GraduationCap,
  Heart,
  Leaf,
  LockKeyhole,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  MessageCircleHeart,
  Minus,
  Mountain,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Soup,
  Sparkles,
  Star,
  Users,
  UtensilsCrossed,
  X,
  Gamepad2,
  Lightbulb,
  Languages,
  type LucideIcon,
} from "lucide-react";
import {
  CATEGORIES,
  DEMO_USER,
  STORAGE_KEY,
  createLobby,
  dateKey,
  friendlyDate,
  joinLobby,
  leaveLobby,
  restoreState,
  type AppState,
  type Category,
  type Lobby,
  type Member,
  type NewLobby,
} from "./model";

type View = "discover" | "lunches" | "saved" | "campus";
type Modal =
  | "login"
  | "create"
  | "detail"
  | "invite"
  | "pilot"
  | "feedback"
  | "notifications"
  | "profile"
  | "cancel"
  | "report"
  | null;
const categoryIcons: Record<Category, LucideIcon> = {
  "Just chatting": Coffee,
  "Tech & ideas": Lightbulb,
  Languages,
  Outdoors: Mountain,
  "Food & culture": Soup,
  Gaming: Gamepad2,
};
const categoryClasses: Record<Category, string> = {
  "Just chatting": "peach",
  "Tech & ideas": "lilac",
  Languages: "blue",
  Outdoors: "mint",
  "Food & culture": "rose",
  Gaming: "yellow",
};
const timeEnd = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return `${String(hours + Math.floor((minutes + 30) / 60)).padStart(2, "0")}:${String((minutes + 30) % 60).padStart(2, "0")}`;
};

function Avatar({
  member,
  small = false,
}: {
  member: Member;
  small?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className={`avatar avatar-fallback ${small ? "small" : ""}`}>
      {member.name.slice(0, 1)}
    </span>
  ) : (
    <img
      className={`avatar ${small ? "small" : ""}`}
      src={`/avatar-${member.avatar}.jpg`}
      alt={member.name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function AvatarStack({ members }: { members: Member[] }) {
  return (
    <div className="avatar-stack">
      {members.slice(0, 3).map((member) => (
        <Avatar key={member.id} member={member} small />
      ))}
      {members.length > 3 && (
        <span className="avatar small avatar-more">+{members.length - 3}</span>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={28} strokeWidth={1.5} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}

function LobbyCard({
  lobby,
  saved,
  user,
  onSave,
  onOpen,
  onJoin,
}: {
  lobby: Lobby;
  saved: boolean;
  user: Member | null;
  onSave: () => void;
  onOpen: () => void;
  onJoin: () => void;
}) {
  const Icon = categoryIcons[lobby.category];
  const joined = lobby.members.some((member) => member.id === user?.id);
  const full = lobby.members.length >= lobby.capacity;
  const almostFull = lobby.capacity - lobby.members.length <= 2 && !full;
  return (
    <article
      className={`lobby-card ${lobby.id === "lunch-1" ? "featured" : ""}`}
    >
      <div className="card-top">
        <span className={`topic-label ${categoryClasses[lobby.category]}`}>
          <span className="topic-icon">
            <Icon size={16} />
          </span>
          {lobby.category}
        </span>
        <button
          className={`icon-button bookmark-button ${saved ? "is-saved" : ""}`}
          onClick={onSave}
          title={saved ? "Unsave lunch" : "Save lunch"}
          aria-label={`${saved ? "Unsave" : "Save"} ${lobby.title}`}
          aria-pressed={saved}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      <button className="card-title" onClick={onOpen}>
        {lobby.title}
      </button>
      <p className="card-description">{lobby.description}</p>
      {lobby.date !== dateKey() && (
        <span className="card-day">
          <CalendarDays size={12} />
          {friendlyDate(lobby.date)}
        </span>
      )}
      <div className="card-meta">
        <span>
          <Clock3 size={14} />
          {lobby.time} - {timeEnd(lobby.time)}
        </span>
        <span>
          <Globe2 size={14} />
          {lobby.language}
        </span>
      </div>
      <div className="card-location">
        <MapPin size={14} />
        <span>Mensa Garching</span>
        {lobby.visibility === "private" && (
          <span className="private-tag">
            <LockKeyhole size={11} /> Invite only
          </span>
        )}
      </div>
      <div className="card-bottom">
        <div className="card-members">
          <AvatarStack members={lobby.members} />
          <span>
            <b>{lobby.members.length}</b>/{lobby.capacity} joined
          </span>
        </div>
        <button
          className={`join-button ${joined ? "joined" : ""}`}
          disabled={full && !joined}
          onClick={joined ? onOpen : onJoin}
        >
          {joined ? (
            <>
              <Check size={14} /> Joined
            </>
          ) : full ? (
            "Table full"
          ) : (
            <>
              Join lunch <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
      {almostFull && (
        <div className="card-availability">
          <span className="tiny-dot" />
          {lobby.capacity - lobby.members.length === 1
            ? "One last seat at the table"
            : "A couple of seats with your name on them"}
        </div>
      )}
    </article>
  );
}

function CreateForm({
  user,
  onCreate,
}: {
  user: Member;
  onCreate: (lobby: Lobby) => void;
}) {
  const [capacity, setCapacity] = useState(6);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const input: NewLobby = {
        title: String(data.get("title")),
        description: String(data.get("description")),
        category: data.get("category") as Category,
        language: String(data.get("language")),
        date: String(data.get("date")),
        time: String(data.get("time")),
        capacity,
        visibility,
      };
      onCreate(createLobby(input, user));
    } catch (issue) {
      setError((issue as Error).message);
    }
  }
  return (
    <form className="lobby-form" onSubmit={submit}>
      <label>
        Give your lunch a name{" "}
        <input
          name="title"
          placeholder="Something you'd love to talk about..."
          minLength={5}
          maxLength={70}
          required
          autoFocus
        />
      </label>
      <label>
        A little more about it <span className="optional">Optional</span>
        <textarea
          name="description"
          placeholder="What's on the menu for conversation?"
          maxLength={500}
          rows={3}
        />
      </label>
      <div className="form-grid">
        <label>
          Topic
          <select name="category">
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          Conversation language
          <select name="language">
            <option>English</option>
            <option>German</option>
            <option>German & English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Italian</option>
            <option>Any language</option>
          </select>
        </label>
      </div>
      <div className="form-grid">
        <label>
          Date
          <input
            type="date"
            name="date"
            min={dateKey()}
            defaultValue={dateKey()}
            required
          />
        </label>
        <label>
          Start time
          <select name="time" defaultValue="12:00">
            {Array.from({ length: 11 }, (_, index) => {
              const total = 660 + index * 15;
              const time = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
              return (
                <option key={time} value={time}>
                  {time} - {timeEnd(time)}
                </option>
              );
            })}
          </select>
        </label>
      </div>
      <div className="fixed-location">
        <MapPin size={20} />
        <div>
          <strong>Mensa Garching</strong>
          <span>Boltzmannstra&szlig;e 19, Garching</span>
        </div>
        <span className="badge">Pilot location</span>
      </div>
      <div className="capacity-row">
        <div>
          <label htmlFor="capacity">Seats at your table</label>
          <p>Including you. Small groups, better conversations.</p>
        </div>
        <div className="stepper">
          <button
            type="button"
            aria-label="Fewer seats"
            disabled={capacity <= 2}
            onClick={() => setCapacity(capacity - 1)}
          >
            <Minus size={16} />
          </button>
          <output id="capacity" aria-live="polite">
            {capacity}
          </output>
          <button
            type="button"
            aria-label="More seats"
            disabled={capacity >= 8}
            onClick={() => setCapacity(capacity + 1)}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <fieldset className="visibility-field">
        <legend>Who's invited?</legend>
        <div className="visibility-options">
          <label className={visibility === "public" ? "selected" : ""}>
            <input
              type="radio"
              name="visibility"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            <Globe2 size={19} />
            <span>
              <b>Everyone on campus</b>
              <small>Open to all TUM students</small>
            </span>
            {visibility === "public" && <Check size={17} />}
          </label>
          <label className={visibility === "private" ? "selected" : ""}>
            <input
              type="radio"
              name="visibility"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            <LockKeyhole size={19} />
            <span>
              <b>Invite only</b>
              <small>Just your invited people</small>
            </span>
            {visibility === "private" && <Check size={17} />}
          </label>
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-footer">
        <span>
          <Heart size={14} /> A little courage goes a long way.
        </span>
        <button className="button primary" type="submit">
          <Plus size={17} />
          Create lobby
        </button>
      </div>
    </form>
  );
}

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      return restoreState(localStorage.getItem(STORAGE_KEY));
    } catch {
      return restoreState(null);
    }
  });
  const [view, setView] = useState<View>("discover");
  const [modal, setModal] = useState<Modal>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | "All lunches">(
    "All lunches",
  );
  const [query, setQuery] = useState("");
  const [day, setDay] = useState(dateKey());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [language, setLanguage] = useState("All languages");
  const [seatsOnly, setSeatsOnly] = useState(false);
  const [sort, setSort] = useState("recommended");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [rating, setRating] = useState(0);
  const [feedbackError, setFeedbackError] = useState("");
  const [lunchTab, setLunchTab] = useState("all");
  const [reportText, setReportText] = useState("");
  const pendingAction = useRef<((user: Member) => void) | null>(null);
  const storageWarning = useRef(false);
  const boardRef = useRef<HTMLElement>(null);
  const selected = state.lobbies.find((lobby) => lobby.id === selectedId);
  const myLunches = state.lobbies.filter((lobby) =>
    lobby.members.some((member) => member.id === state.user?.id),
  );
  const upcoming = myLunches
    .filter((lobby) => lobby.date >= dateKey())
    .sort((first, second) =>
      `${first.date}${first.time}`.localeCompare(
        `${second.date}${second.time}`,
      ),
    );
  const activeFilters =
    Number(language !== "All languages") + Number(seatsOnly);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      if (!storageWarning.current) {
        toast.warning(
          "Browser storage is unavailable. Changes will last until this page is closed.",
        );
        storageWarning.current = true;
      }
    }
  }, [state]);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("invite");
    if (code) {
      setInviteCode(code);
      setModal("invite");
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setState(restoreState(event.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 761px)");
    const closeMobileMenu = () => {
      if (desktop.matches) setMobileMenu(false);
    };
    desktop.addEventListener("change", closeMobileMenu);
    return () => desktop.removeEventListener("change", closeMobileMenu);
  }, []);

  function navigate(next: View) {
    setView(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function authenticate(action: (member: Member) => void) {
    if (state.user) {
      action(state.user);
      return;
    }
    pendingAction.current = action;
    setModal("login");
  }
  function openCreate() {
    authenticate(() => setModal("create"));
  }
  function openDetails(lobby: Lobby) {
    setSelectedId(lobby.id);
    setModal("detail");
  }
  function join(lobby: Lobby, code?: string) {
    authenticate((member) => {
      try {
        const joined = joinLobby(lobby, member, code);
        setState((current) => ({
          ...current,
          lobbies: current.lobbies.map((item) =>
            item.id === lobby.id ? joined : item,
          ),
        }));
        setSelectedId(lobby.id);
        setModal("detail");
        toast.success("You're at the table!", {
          description: `${friendlyDate(lobby.date)}, ${lobby.time} at Mensa Garching.`,
        });
      } catch (issue) {
        toast.error((issue as Error).message);
      }
    });
  }
  function save(id: string) {
    setState((current) => ({
      ...current,
      saved: current.saved.includes(id)
        ? current.saved.filter((saved) => saved !== id)
        : [...current.saved, id],
    }));
  }
  function leave(lobby: Lobby) {
    try {
      const updated = leaveLobby(lobby, state.user!.id);
      setState((current) => ({
        ...current,
        lobbies: current.lobbies.map((item) =>
          item.id === lobby.id ? updated : item,
        ),
      }));
      setModal(null);
      toast("You left this lunch.", {
        description: "Your seat is available for someone new.",
      });
    } catch (issue) {
      toast.error((issue as Error).message);
    }
  }
  async function copyInvite(lobby: Lobby) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/?invite=${lobby.inviteCode}`,
      );
      toast.success("Invite link copied.");
    } catch {
      toast.error(
        "Clipboard access is unavailable. Copy the invite code below instead.",
      );
    }
  }
  function exportCalendar(lobby: Lobby) {
    const escape = (text: string) =>
      text
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/,/g, "\\,")
        .replace(/;/g, "\\;");
    const stamp = `${lobby.date.replaceAll("-", "")}T${lobby.time.replace(":", "")}00`;
    const end = `${lobby.date.replaceAll("-", "")}T${timeEnd(lobby.time).replace(":", "")}00`;
    const text = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//LunchLink//Campus Lunch//EN",
      "BEGIN:VEVENT",
      `UID:${lobby.id}@lunchlink.local`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}/, "")}`,
      `DTSTART;TZID=Europe/Berlin:${stamp}`,
      `DTEND;TZID=Europe/Berlin:${end}`,
      `SUMMARY:${escape(lobby.title)}`,
      "LOCATION:Mensa Garching - Boltzmannstrasse 19",
      `DESCRIPTION:${escape(`${lobby.description}\nMeet by the main entrance. No reserved table is guaranteed.`)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/calendar;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "lunchlink-lunch.ics";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success("Your calendar invite is ready.");
  }
  function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const lobby = state.lobbies.find(
      (item) => item.inviteCode === inviteCode.trim().toUpperCase(),
    );
    if (!lobby) {
      setInviteError(
        "That invite was not found on this device. Check the code with your host.",
      );
      return;
    }
    setInviteError("");
    join(lobby, inviteCode);
  }
  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rating) {
      setFeedbackError("Choose a rating before sending your feedback.");
      return;
    }
    const data = new FormData(event.currentTarget);
    setState((current) => ({
      ...current,
      feedback: [
        ...current.feedback,
        {
          rating,
          message: String(data.get("message")).trim(),
          date: new Date().toISOString(),
        },
      ],
    }));
    setModal(null);
    setRating(0);
    setFeedbackError("");
    toast.success("Thanks for making lunch a little better.", {
      description: "Your feedback is saved in this local preview.",
    });
  }

  let visibleLobbies = state.lobbies.filter(
    (lobby) =>
      lobby.visibility === "public" ||
      lobby.members.some((member) => member.id === state.user?.id),
  );
  if (view === "discover")
    visibleLobbies = visibleLobbies.filter(
      (lobby) =>
        lobby.date === day &&
        (category === "All lunches" || lobby.category === category) &&
        (language === "All languages" || lobby.language.includes(language)) &&
        (!seatsOnly || lobby.members.length < lobby.capacity),
    );
  if (view === "lunches")
    visibleLobbies = myLunches.filter((lobby) =>
      lunchTab === "hosting"
        ? lobby.host.id === state.user?.id
        : lunchTab === "upcoming"
          ? lobby.date >= dateKey()
          : true,
    );
  if (view === "saved")
    visibleLobbies = visibleLobbies.filter((lobby) =>
      state.saved.includes(lobby.id),
    );
  if (query.trim())
    visibleLobbies = visibleLobbies.filter((lobby) =>
      `${lobby.title} ${lobby.description} ${lobby.language} ${lobby.category} ${lobby.host.name}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  if (sort === "earliest")
    visibleLobbies = [...visibleLobbies].sort((first, second) =>
      `${first.date}${first.time}`.localeCompare(
        `${second.date}${second.time}`,
      ),
    );
  if (sort === "seats")
    visibleLobbies = [...visibleLobbies].sort(
      (first, second) =>
        second.capacity -
        second.members.length -
        (first.capacity - first.members.length),
    );
  const titles: Record<View, [string, string, string]> = {
    discover: [
      "A LITTLE LUNCH. A LOT OF POSSIBILITY.",
      "Find your lunch people",
      "A shared table. A new perspective. A better lunch break.",
    ],
    lunches: [
      "GOOD COMPANY, ON YOUR CALENDAR.",
      "Your lunch plans",
      "Something to look forward to, beyond the lecture hall.",
    ],
    saved: [
      "FOR ANOTHER LUNCH BREAK.",
      "A seat on your shortlist",
      "The conversations that caught your eye.",
    ],
    campus: [
      "A FAMILIAR PLACE. A FEW NEW FACES.",
      "Meet you at the Mensa",
      "Your little corner of the Garching campus.",
    ],
  };
  const [eyebrow, title, subtitle] = titles[view];
  const isJoined = selected?.members.some(
    (member) => member.id === state.user?.id,
  );
  const isHost = selected?.host.id === state.user?.id;
  const modalTitles: Record<Exclude<Modal, null>, string> = {
    login: "Your campus. Your people.",
    create: "Make room for a new connection.",
    detail: selected?.title ?? "Lunch details",
    invite: "There is a seat with your name on it.",
    pilot: "Small tables. A big hello.",
    feedback: "How was your lunch break?",
    notifications: "A little campus catch-up.",
    profile: "Nice to meet you, Alex.",
    cancel: "Cancel this lunch?",
    report: "Keep our tables welcoming.",
  };

  const sidebarContent = (
    <>
      <button
        className="brand"
        onClick={() => navigate("discover")}
        aria-label="LunchLink home"
      >
        <span className="brand-mark">
          <UtensilsCrossed size={23} strokeWidth={1.8} />
        </span>
        <span>
          lunchlink<span className="brand-period">.</span>
        </span>
      </button>
      <div className="sidebar-campus">
        <span className="campus-dot" />
        TUM Garching<span className="pilot-mini">PILOT</span>
      </div>
      <nav className="main-nav">
        <span className="nav-caption">A PLACE AT THE TABLE</span>
        <button
          className={view === "discover" ? "nav-item active" : "nav-item"}
          onClick={() => navigate("discover")}
        >
          <Compass size={19} />
          Discover lunches
          <span className="nav-count">
            {
              state.lobbies.filter(
                (lobby) =>
                  lobby.visibility === "public" && lobby.date === dateKey(),
              ).length
            }
          </span>
        </button>
        <button
          className={view === "lunches" ? "nav-item active" : "nav-item"}
          onClick={() => navigate("lunches")}
        >
          <CalendarDays size={19} />
          My lunches
          {myLunches.length > 0 && (
            <span className="nav-count">{myLunches.length}</span>
          )}
        </button>
        <button
          className={view === "saved" ? "nav-item active" : "nav-item"}
          onClick={() => navigate("saved")}
        >
          <Bookmark size={18} />
          Saved for later
          {state.saved.length > 0 && (
            <span className="nav-count">{state.saved.length}</span>
          )}
        </button>
        <span className="nav-caption second-caption">AROUND CAMPUS</span>
        <button
          className={view === "campus" ? "nav-item active" : "nav-item"}
          onClick={() => navigate("campus")}
        >
          <MapPin size={19} />
          The meeting spot
        </button>
        <button
          className="nav-item"
          onClick={() => {
            setMobileMenu(false);
            setModal("pilot");
          }}
        >
          <CircleHelp size={19} />
          About LunchLink
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <MessageCircleHeart size={30} strokeWidth={1.3} />
          <h3>
            Good food.
            <br />
            Even better company.
          </h3>
          <p>
            A familiar face starts
            <br />
            with a simple hello.
          </p>
          <span className="note-spark">
            <Sparkles size={16} />
          </span>
        </div>
        <button
          className="feedback-link"
          onClick={() => {
            setMobileMenu(false);
            setModal("feedback");
          }}
        >
          <MessageCircle size={16} />A little feedback?
          <ArrowRight size={14} />
        </button>
        <div className="sidebar-profile">
          <button
            className="profile-button"
            onClick={() => {
              setMobileMenu(false);
              pendingAction.current = null;
              setModal(state.user ? "profile" : "login");
            }}
          >
            {state.user ? (
              <Avatar member={state.user} />
            ) : (
              <span className="guest-avatar">
                <GraduationCap size={21} />
              </span>
            )}
            <span>
              <strong>
                {state.user ? "Alex Morgan" : "Hello, future friend"}
              </strong>
              <small>
                {state.user ? "Demo student account" : "Your campus community"}
              </small>
            </span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Dialog.Root open={mobileMenu} onOpenChange={setMobileMenu}>
        <Dialog.Portal>
          <Dialog.Backdrop className="mobile-scrim" />
          <Dialog.Popup className="sidebar mobile-sidebar">
            <Dialog.Title className="sr-only">Campus navigation</Dialog.Title>
            <Dialog.Description className="sr-only">
              Explore LunchLink and your campus lunch plans.
            </Dialog.Description>
            {sidebarContent}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <div className="app-shell">
        <aside className="sidebar desktop-sidebar" aria-label="Main navigation">
          {sidebarContent}
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu-button"
                aria-label="Open navigation"
                onClick={() => setMobileMenu(true)}
              >
                <Menu size={23} />
              </button>
              <span className="topbar-label">
                Your campus, a little closer.
              </span>
              <span className="mobile-brand">lunchlink.</span>
            </div>
            <div className="topbar-actions">
              <button
                className="campus-switch"
                onClick={() => setModal("pilot")}
              >
                <MapPin size={15} />
                <span>Garching campus</span>
                <ChevronDown size={13} />
              </button>
              <span className="topbar-divider" />
              <button
                className="icon-button notification-button"
                aria-label="Notifications"
                title="Notifications"
                onClick={() => setModal("notifications")}
              >
                <Bell size={19} />
                <span />
              </button>
              {state.user ? (
                <button
                  className="topbar-avatar"
                  aria-label="Your profile"
                  onClick={() => setModal("profile")}
                >
                  <Avatar member={state.user} />
                </button>
              ) : (
                <button
                  className="login-button"
                  onClick={() => {
                    pendingAction.current = null;
                    setModal("login");
                  }}
                >
                  <span className="tum-small">TUM</span>
                  <span>Student login</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </header>
          <main className="main-content">
            <div className="page-heading">
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1>
                  {title}
                  <span>.</span>
                </h1>
                <p className="page-subtitle">{subtitle}</p>
              </div>
              <button
                className="button primary create-button"
                onClick={openCreate}
              >
                <Plus size={18} />
                Create a lobby
              </button>
            </div>
            {view === "discover" && (
              <section
                className="lunch-banner"
                aria-label="Lunch together at Garching"
              >
                <img
                  src="/lunch-friends.jpg"
                  alt="Friends sharing food and conversation around a lunch table"
                  fetchPriority="high"
                />
                <div className="banner-shade" />
                <div className="banner-copy">
                  <span className="banner-eyebrow">
                    <span /> DIFFERENT STORIES. ONE TABLE.
                  </span>
                  <h2>
                    Same campus.
                    <br />
                    New connections.
                  </h2>
                  <p>Come hungry. Leave a little more connected.</p>
                </div>
                <div className="banner-location">
                  <span className="live-dot" />
                  <span>The Garching lunch club</span>
                  <span className="banner-location-divider" />
                  <Clock3 size={13} />
                  <span>11 am - 2 pm</span>
                </div>
                <span className="banner-corner">
                  <UtensilsCrossed size={15} /> A seat for everyone.
                </span>
              </section>
            )}
            {view === "campus" ? (
              <section className="campus-page">
                <div className="campus-photo">
                  <img
                    src="/lunch-friends.jpg"
                    alt="People gathered around a shared lunch table"
                  />
                  <span>
                    <MapPin size={17} />
                    Mensa Garching
                  </span>
                </div>
                <div className="campus-info">
                  <span className="badge">OUR FIRST MEETING SPOT</span>
                  <h2>
                    A familiar place to find
                    <br />a few unfamiliar faces.
                  </h2>
                  <p>
                    Right in the heart of campus. Meet your lunch group by the
                    main entrance, then find a table together.
                  </p>
                  <div className="campus-facts">
                    <span>
                      <MapPin />
                      Boltzmannstra&szlig;e 19, 85748 Garching
                    </span>
                    <span>
                      <Clock3 />
                      Lunch meetups: 11:00 - 14:00
                    </span>
                    <span>
                      <GraduationCap />
                      Garching-Forschungszentrum, U6
                    </span>
                    <span>
                      <Users />
                      No reserved tables during the pilot
                    </span>
                  </div>
                  <a
                    className="button primary"
                    href="https://www.google.com/maps/search/?api=1&query=Mensa+Garching+Boltzmannstrasse+19"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Get directions
                    <ExternalLink size={16} />
                  </a>
                </div>
                <div className="campus-bottom">
                  <Heart size={25} />
                  <div>
                    <h3>Different places. One shared table.</h3>
                    <p>
                      Every language, background, and field of study is welcome
                      here.
                    </p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => navigate("discover")}
                  >
                    Find your table
                    <ArrowRight size={16} />
                  </button>
                </div>
              </section>
            ) : (
              <div
                className={`content-layout ${view !== "discover" ? "secondary-layout" : ""}`}
              >
                <section
                  className="lobby-board"
                  ref={boardRef}
                  aria-label="Lunch lobbies"
                >
                  <div className="board-heading">
                    <div>
                      <h2>
                        {view === "discover"
                          ? "Good conversations start here"
                          : view === "lunches"
                            ? "A little something to look forward to"
                            : "Keep the good ones close"}
                      </h2>
                      <p>
                        {view === "discover"
                          ? "Pull up a chair. There's someone you'd get along with."
                          : view === "lunches"
                            ? "Your people, your plans, your next lunch break."
                            : "Your next favourite lunch could be right here."}
                      </p>
                    </div>
                    {view === "discover" && (
                      <span className="today-pill">
                        <span />
                        {friendlyDate(day)}
                      </span>
                    )}
                  </div>
                  {view === "lunches" && (
                    <div
                      className="view-tabs"
                      role="group"
                      aria-label="Lunch plan view"
                    >
                      {[
                        ["all", "All my lunches"],
                        ["upcoming", "Upcoming"],
                        ["hosting", "I'm hosting"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          className={lunchTab === value ? "selected" : ""}
                          onClick={() => setLunchTab(value)}
                          aria-pressed={lunchTab === value}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="search-toolbar">
                    <div className="search-field">
                      <Search size={17} />
                      <input
                        type="search"
                        aria-label="Search lunches"
                        placeholder="A topic, a language, your kind of people..."
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                      {query && (
                        <button
                          className="icon-button"
                          onClick={() => setQuery("")}
                          aria-label="Clear search"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    {view === "discover" && (
                      <>
                        <label className="date-filter">
                          <CalendarDays size={16} />
                          <select
                            value={day}
                            onChange={(event) => setDay(event.target.value)}
                            aria-label="Lunch day"
                          >
                            <option value={dateKey()}>Today</option>
                            <option value={dateKey(1)}>Tomorrow</option>
                            <option value={dateKey(2)}>
                              {friendlyDate(dateKey(2))}
                            </option>
                            <option value="custom">Pick a date</option>
                            {![
                              dateKey(),
                              dateKey(1),
                              dateKey(2),
                              "custom",
                            ].includes(day) && (
                              <option value={day}>{friendlyDate(day)}</option>
                            )}
                          </select>
                        </label>
                        <button
                          className={`filter-button ${filtersOpen || activeFilters ? "selected" : ""}`}
                          onClick={() => setFiltersOpen(!filtersOpen)}
                          aria-expanded={filtersOpen}
                        >
                          <SlidersHorizontal size={15} />
                          <span>Filters</span>
                          {activeFilters > 0 && <b>{activeFilters}</b>}
                        </button>
                      </>
                    )}
                  </div>
                  {day === "custom" && view === "discover" && (
                    <label className="custom-date">
                      Lunch date
                      <input
                        type="date"
                        min={dateKey()}
                        onChange={(event) => {
                          if (event.target.value) setDay(event.target.value);
                        }}
                        autoFocus
                      />
                    </label>
                  )}
                  {filtersOpen && view === "discover" && (
                    <div className="advanced-filters">
                      <label>
                        Conversation language
                        <select
                          value={language}
                          onChange={(event) => setLanguage(event.target.value)}
                        >
                          <option>All languages</option>
                          <option>English</option>
                          <option>German</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>Italian</option>
                        </select>
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={seatsOnly}
                          onChange={(event) =>
                            setSeatsOnly(event.target.checked)
                          }
                        />
                        Only tables with open seats
                      </label>
                      <button
                        className="text-button"
                        onClick={() => {
                          setLanguage("All languages");
                          setSeatsOnly(false);
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  )}
                  {view === "discover" && (
                    <div
                      className="category-filters"
                      role="group"
                      aria-label="Lunch topics"
                    >
                      {(["All lunches", ...CATEGORIES] as const).map((item) => {
                        const Icon =
                          item === "All lunches"
                            ? UtensilsCrossed
                            : categoryIcons[item];
                        return (
                          <button
                            key={item}
                            className={
                              category === item
                                ? "category-chip selected"
                                : "category-chip"
                            }
                            onClick={() => setCategory(item)}
                            aria-pressed={category === item}
                          >
                            <Icon size={14} />
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <div className="results-heading">
                    <span>
                      <b>{visibleLobbies.length}</b>{" "}
                      {visibleLobbies.length === 1 ? "lobby" : "lobbies"}
                      {view === "discover"
                        ? " to make your lunch break"
                        : " at the table"}
                    </span>
                    <label className="sort-select">
                      <ArrowDownUp size={12} />
                      <select
                        value={sort}
                        aria-label="Sort lunches"
                        onChange={(event) => setSort(event.target.value)}
                      >
                        <option value="recommended">Recommended</option>
                        <option value="earliest">Earliest first</option>
                        <option value="seats">Most open seats</option>
                      </select>
                      <ChevronDown size={12} />
                    </label>
                  </div>
                  {visibleLobbies.length > 0 ? (
                    <div className="lobby-grid">
                      {visibleLobbies.map((lobby) => (
                        <LobbyCard
                          key={lobby.id}
                          lobby={lobby}
                          saved={state.saved.includes(lobby.id)}
                          user={state.user}
                          onSave={() => save(lobby.id)}
                          onOpen={() => openDetails(lobby)}
                          onJoin={() => join(lobby)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={
                        view === "saved"
                          ? Bookmark
                          : view === "lunches"
                            ? CalendarDays
                            : Soup
                      }
                      title={
                        query || activeFilters || category !== "All lunches"
                          ? "No tables quite like that. Yet."
                          : view === "saved"
                            ? "Good things are worth keeping."
                            : view === "lunches"
                              ? "Your calendar has room for someone new."
                              : "Be the first at the table."
                      }
                    >
                      {view === "saved"
                        ? "Nothing on your shortlist just yet."
                        : view === "lunches"
                          ? "No lunch plans yet. Let's change that."
                          : "A fresh conversation could start with you."}
                      <span className="empty-actions">
                        {(query ||
                          activeFilters ||
                          category !== "All lunches") && (
                          <button
                            className="button secondary"
                            onClick={() => {
                              setQuery("");
                              setLanguage("All languages");
                              setSeatsOnly(false);
                              setCategory("All lunches");
                            }}
                          >
                            Clear filters
                          </button>
                        )}
                        <button
                          className="button primary"
                          onClick={
                            view === "discover"
                              ? openCreate
                              : () => {
                                  setQuery("");
                                  navigate("discover");
                                }
                          }
                        >
                          {view === "discover" ? (
                            <>
                              <Plus size={16} />
                              Create a lobby
                            </>
                          ) : (
                            <>
                              Explore lunches
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </span>
                    </EmptyState>
                  )}
                  <button
                    className="invite-entry"
                    onClick={() => {
                      setInviteError("");
                      setModal("invite");
                    }}
                  >
                    <LockKeyhole size={15} />
                    Got a lunch invite?
                    <span>
                      Enter your code
                      <ArrowRight size={14} />
                    </span>
                  </button>
                </section>
                <aside
                  className="right-rail"
                  aria-label="Your campus at a glance"
                >
                  <section className="plans-section">
                    <div className="rail-heading">
                      <h3>Your next lunch</h3>
                      <CalendarDays size={16} />
                    </div>
                    {upcoming.length ? (
                      <button
                        className="upcoming-lunch"
                        onClick={() => openDetails(upcoming[0])}
                      >
                        <span className="upcoming-date">
                          <small>
                            {new Date(
                              `${upcoming[0].date}T12:00:00`,
                            ).toLocaleDateString("en", { month: "short" })}
                          </small>
                          <b>{Number(upcoming[0].date.slice(-2))}</b>
                        </span>
                        <strong>{upcoming[0].title}</strong>
                        <span>
                          <Clock3 size={13} />
                          {friendlyDate(upcoming[0].date)}, {upcoming[0].time}
                        </span>
                        <span>
                          <MapPin size={13} />
                          Mensa Garching
                        </span>
                        <span className="upcoming-link">
                          See who's coming
                          <ArrowRight size={13} />
                        </span>
                      </button>
                    ) : (
                      <div className="no-plans">
                        <span className="plans-illustration">
                          <Coffee size={29} strokeWidth={1.4} />
                          <span>
                            <Sparkles size={15} />
                          </span>
                        </span>
                        <h4>
                          Your next good
                          <br />
                          conversation awaits.
                        </h4>
                        <p>
                          No plans yet.
                          <br />
                          Plenty of possibilities.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => {
                            navigate("discover");
                            boardRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }}
                        >
                          Find a table
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    )}
                  </section>
                  <section className="pilot-section">
                    <span className="rail-eyebrow">
                      <span />
                      STARTING SMALL, TOGETHER
                    </span>
                    <h3>The Garching chapter.</h3>
                    <p>
                      A little experiment in making
                      <br className="desktop-break" /> campus feel more like
                      home.
                    </p>
                    <ul className="pilot-facts">
                      <li>
                        <span>
                          <MapPin size={16} />
                        </span>
                        <div>
                          <strong>Mensa Garching</strong>
                          <small>Our first meeting spot</small>
                        </div>
                      </li>
                      <li>
                        <span>
                          <Clock3 size={16} />
                        </span>
                        <div>
                          <strong>11:00 - 14:00</strong>
                          <small>A break from the everyday</small>
                        </div>
                      </li>
                      <li>
                        <span>
                          <ShieldCheck size={17} />
                        </span>
                        <div>
                          <strong>Students, just like you</strong>
                          <small>A TUM campus community</small>
                        </div>
                      </li>
                    </ul>
                    <button
                      className="text-button"
                      onClick={() => setModal("pilot")}
                    >
                      A little about the pilot
                      <ArrowRight size={14} />
                    </button>
                  </section>
                  <section className="kindness-section">
                    <span className="kindness-icon">
                      <Heart size={17} />
                    </span>
                    <p>
                      You don't need a perfect
                      <br />
                      introduction. Just a hello.
                    </p>
                    <span>YOU ALREADY BELONG HERE.</span>
                  </section>
                </aside>
              </div>
            )}
            <footer className="page-footer">
              <span>
                <Leaf size={14} />A little less scrolling. A little more
                belonging.
              </span>
              <span>
                Made for students, by students.
                <Heart size={12} />
              </span>
            </footer>
          </main>
        </div>
      </div>
      <Dialog.Root
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
            pendingAction.current = null;
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="dialog-backdrop" />
          <Dialog.Popup
            className={`dialog ${modal === "create" || modal === "detail" ? "dialog-wide" : ""}`}
          >
            <Dialog.Close
              className="icon-button dialog-close"
              aria-label="Close dialog"
            >
              <X size={20} />
            </Dialog.Close>
            <div className="dialog-heading">
              <span className="dialog-kicker">LUNCHLINK CAMPUS CLUB</span>
              <Dialog.Title>{modal ? modalTitles[modal] : ""}</Dialog.Title>
              <Dialog.Description className="dialog-description">
                {modal === "create"
                  ? "A good lunch starts with someone pulling up a chair."
                  : modal === "login"
                    ? "Good conversations start with a familiar campus."
                    : modal === "detail" && selected
                      ? `${friendlyDate(selected.date)} at ${selected.time} - ${timeEnd(selected.time)}`
                      : modal === "feedback"
                        ? "The honest version. We are listening."
                        : modal === "invite"
                          ? "A personal invitation to a shared table."
                          : modal === "cancel"
                            ? "Everyone at the table will lose this lunch plan."
                            : modal === "report"
                              ? "Tell us if something at the table does not feel right."
                              : "A little less alone. A little more together."}
              </Dialog.Description>
            </div>
            {modal === "login" && (
              <div className="login-content">
                <div className="tum-block">
                  <span>TUM</span>
                  <div>
                    Technical University
                    <br />
                    of Munich
                  </div>
                  <ShieldCheck size={28} />
                </div>
                <div className="login-reasons">
                  <span>
                    <GraduationCap size={18} />A community for enrolled students
                  </span>
                  <span>
                    <Users size={18} />
                    Small tables, genuine connections
                  </span>
                  <span>
                    <Heart size={18} />
                    Every background belongs
                  </span>
                </div>
                <div className="demo-notice">
                  <strong>A quick note about this preview</strong>
                  <p>
                    TUM single sign-on is not connected yet. Continue with a
                    demo student profile to try LunchLink. No enrollment is
                    verified and no password is collected.
                  </p>
                </div>
                <button
                  className="button primary full-width"
                  onClick={() => {
                    setState((current) => ({ ...current, user: DEMO_USER }));
                    setModal(null);
                    const action = pendingAction.current;
                    pendingAction.current = null;
                    action?.(DEMO_USER);
                    toast.success("Welcome to the table, Alex.", {
                      description:
                        "You are exploring with a local demo account.",
                    });
                  }}
                >
                  Continue as a demo student
                  <ArrowRight size={17} />
                </button>
                <p className="privacy-note">
                  <LockKeyhole size={12} />
                  Your demo data stays in this browser.
                </p>
              </div>
            )}
            {modal === "create" && state.user && (
              <CreateForm
                user={state.user}
                onCreate={(lobby) => {
                  setState((current) => ({
                    ...current,
                    lobbies: [lobby, ...current.lobbies],
                  }));
                  setSelectedId(lobby.id);
                  setModal("detail");
                  setDay(lobby.date);
                  setCategory("All lunches");
                  setQuery("");
                  setLanguage("All languages");
                  setSeatsOnly(false);
                  toast.success("Your table is open.", {
                    description:
                      lobby.visibility === "private"
                        ? "Copy the invite code to bring your people."
                        : "Here is to a few new faces.",
                  });
                }}
              />
            )}
            {modal === "detail" && selected && (
              <div className="lobby-detail">
                <div className="detail-tags">
                  <span
                    className={`topic-label ${categoryClasses[selected.category]}`}
                  >
                    {(() => {
                      const Icon = categoryIcons[selected.category];
                      return <Icon size={16} />;
                    })()}
                    {selected.category}
                  </span>
                  <span className="badge">
                    {selected.visibility === "private" ? (
                      <LockKeyhole size={12} />
                    ) : (
                      <Globe2 size={12} />
                    )}
                    {selected.visibility === "private"
                      ? "Invite only"
                      : "Open table"}
                  </span>
                  {isHost && (
                    <span className="badge host-badge">You're hosting</span>
                  )}
                </div>
                <p className="detail-description">
                  {selected.description ||
                    "A shared table, a good lunch, and a few new faces. Come as you are."}
                </p>
                <div className="detail-facts">
                  <span>
                    <CalendarDays size={19} />
                    <span>
                      <small>WHEN</small>
                      <strong>
                        {friendlyDate(selected.date)}, {selected.time} -{" "}
                        {timeEnd(selected.time)}
                      </strong>
                    </span>
                  </span>
                  <span>
                    <MapPin size={19} />
                    <span>
                      <small>WHERE</small>
                      <strong>Mensa Garching</strong>
                    </span>
                  </span>
                  <span>
                    <Globe2 size={19} />
                    <span>
                      <small>CONVERSATION</small>
                      <strong>{selected.language}</strong>
                    </span>
                  </span>
                  <span>
                    <Users size={19} />
                    <span>
                      <small>AT THE TABLE</small>
                      <strong>
                        {selected.members.length} of {selected.capacity} seats
                        taken
                      </strong>
                    </span>
                  </span>
                </div>
                <div className="meetup-note">
                  <MapPin size={18} />
                  <p>
                    Meet by the <strong>main Mensa entrance</strong>, then find
                    a table together. There are no reserved tables during this
                    pilot.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Mensa+Garching+Boltzmannstrasse+19"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Open Mensa Garching in maps"
                    title="Open in maps"
                  >
                    <ExternalLink size={17} />
                  </a>
                </div>
                <div className="detail-members">
                  <h3>
                    A few faces at your table
                    <span>
                      {selected.members.length}/{selected.capacity}
                    </span>
                  </h3>
                  <div className="member-list">
                    {selected.members.map((member) => (
                      <div key={member.id}>
                        <Avatar member={member} />
                        <span>
                          {member.id === state.user?.id ? "You" : member.name}
                          {member.id === selected.host.id && (
                            <small>Host</small>
                          )}
                        </span>
                      </div>
                    ))}
                    {Array.from(
                      { length: selected.capacity - selected.members.length },
                      (_, index) => (
                        <div key={`empty-${index}`} className="open-seat">
                          <span className="seat-avatar">
                            <Plus size={17} />
                          </span>
                          <span>Open seat</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
                {isJoined && (
                  <div className="joined-note">
                    <CheckCheck size={18} />
                    <span>You're at this table. Just bring yourself.</span>
                  </div>
                )}
                {isJoined && (
                  <div className="invite-box">
                    <label htmlFor="share-code">
                      {selected.visibility === "private"
                        ? "Your private invite code"
                        : "Bring a friend along"}
                    </label>
                    <div>
                      <input
                        id="share-code"
                        value={selected.inviteCode}
                        readOnly
                      />
                      <button
                        className="button secondary"
                        onClick={() => copyInvite(selected)}
                      >
                        <Copy size={14} />
                        Copy invite
                      </button>
                    </div>
                    <small>
                      Demo invites work with lunches saved in this browser.
                      Cross-device sharing needs the live backend.
                    </small>
                  </div>
                )}
                <div className="detail-actions">
                  {isJoined ? (
                    <>
                      <button
                        className="button secondary"
                        onClick={() => exportCalendar(selected)}
                      >
                        <CalendarPlus size={16} />
                        Add to calendar
                      </button>
                      <button
                        className="text-button danger-text"
                        onClick={() =>
                          isHost ? setModal("cancel") : leave(selected)
                        }
                      >
                        {isHost ? "Cancel lunch" : "Leave lunch"}
                      </button>
                    </>
                  ) : (
                    <button
                      className="button primary full-width"
                      disabled={selected.members.length >= selected.capacity}
                      onClick={() => join(selected, inviteCode)}
                    >
                      {selected.members.length >= selected.capacity ? (
                        "This table is full"
                      ) : (
                        <>
                          Take a seat
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>
                  )}
                  <button
                    className={`icon-button detail-save ${state.saved.includes(selected.id) ? "is-saved" : ""}`}
                    onClick={() => save(selected.id)}
                    title="Save lunch"
                    aria-label="Save this lunch"
                    aria-pressed={state.saved.includes(selected.id)}
                  >
                    <Bookmark
                      size={20}
                      fill={
                        state.saved.includes(selected.id)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  </button>
                </div>
                <button
                  className="report-link"
                  onClick={() => setModal("report")}
                >
                  Something not right? Let us know.
                </button>
              </div>
            )}
            {modal === "invite" && (
              <form className="invite-form" onSubmit={redeem}>
                <span className="invite-illustration">
                  <LockKeyhole size={31} strokeWidth={1.5} />
                </span>
                <label>
                  Your invite code
                  <input
                    placeholder="LL-XXXXXXXX"
                    value={inviteCode}
                    onChange={(event) => {
                      setInviteCode(event.target.value.toUpperCase());
                      setInviteError("");
                    }}
                    required
                    autoFocus
                    autoComplete="off"
                    autoCapitalize="characters"
                    maxLength={32}
                  />
                </label>
                {inviteError && (
                  <p className="form-error" role="alert">
                    {inviteError}
                  </p>
                )}
                <p className="muted-note">
                  This local preview can find invites for lunches created in
                  this browser. Invitations across devices will be available
                  when the backend is connected.
                </p>
                <button className="button primary full-width" type="submit">
                  Find my table
                  <ArrowRight size={17} />
                </button>
              </form>
            )}
            {modal === "pilot" && (
              <div className="about-content">
                <div className="about-icon">
                  <Soup size={34} strokeWidth={1.5} />
                  <Heart size={19} />
                </div>
                <p>A new city can feel big. A lunch table doesn't have to.</p>
                <p>
                  LunchLink brings TUM students together for small, welcoming
                  lunch groups, starting right here at Mensa Garching.
                </p>
                <div className="about-rules">
                  <span>
                    <MapPin size={19} />
                    <span>
                      <strong>One campus, one meeting spot</strong>Mensa
                      Garching, Boltzmannstra&szlig;e 19
                    </span>
                  </span>
                  <span>
                    <Clock3 size={19} />
                    <span>
                      <strong>A proper lunch break</strong>30-minute lunches,
                      between 11:00 and 14:00
                    </span>
                  </span>
                  <span>
                    <Users size={19} />
                    <span>
                      <strong>Small enough to feel at home</strong>2-8 people.
                      Every background welcome.
                    </span>
                  </span>
                  <span>
                    <Heart size={19} />
                    <span>
                      <strong>A welcoming table is everyone's job</strong>Be
                      kind, respect boundaries, and include every voice.
                    </span>
                  </span>
                </div>
                <p className="muted-note">
                  There is no reserved seating or Mensa partnership in place.
                  Meet at the main entrance and choose a table together. This is
                  a local demo, not an official TUM service.
                </p>
                <div className="about-footer">
                  <button
                    className="button secondary"
                    onClick={() => setModal("feedback")}
                  >
                    <MessageCircle size={16} />
                    Share a thought
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      setModal(null);
                      navigate("discover");
                    }}
                  >
                    Find a table
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
            {modal === "feedback" && (
              <form className="feedback-form" onSubmit={submitFeedback}>
                <label>How did it feel?</label>
                <div
                  className="rating-stars"
                  role="group"
                  aria-label="Rate your lunch"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      type="button"
                      key={value}
                      aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                      aria-pressed={rating === value}
                      onClick={() => {
                        setRating(value);
                        setFeedbackError("");
                      }}
                    >
                      <Star
                        size={31}
                        fill={value <= rating ? "currentColor" : "none"}
                      />
                    </button>
                  ))}
                </div>
                <label>
                  What should we keep, change, or try?
                  <textarea
                    name="message"
                    placeholder="The good, the awkward, the unexpectedly lovely..."
                    maxLength={1500}
                    rows={5}
                  />
                </label>
                {feedbackError && (
                  <p className="form-error" role="alert">
                    {feedbackError}
                  </p>
                )}
                <p className="muted-note">
                  Feedback is saved on this device for the MVP preview. It is
                  not sent to a server.
                </p>
                <button className="button primary full-width" type="submit">
                  Send a little feedback
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
            {modal === "notifications" && (
              <div className="notifications-content">
                <span className="notification-label">CAMPUS NOTES</span>
                <div className="notification-item">
                  <span className="notification-icon">
                    <Leaf size={20} />
                  </span>
                  <div>
                    <strong>A fresh start in Garching.</strong>
                    <p>
                      The first chapter of LunchLink starts with a few new faces
                      and a lunch break.
                    </p>
                    <button
                      className="text-button"
                      onClick={() => setModal("pilot")}
                    >
                      About the pilot
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
                {upcoming.length > 0 && (
                  <div className="notification-item">
                    <span className="notification-icon">
                      <CalendarDays size={20} />
                    </span>
                    <div>
                      <strong>A good conversation is on your calendar.</strong>
                      <p>
                        {upcoming[0].title} &middot;{" "}
                        {friendlyDate(upcoming[0].date)}, {upcoming[0].time}
                      </p>
                      <button
                        className="text-button"
                        onClick={() => openDetails(upcoming[0])}
                      >
                        View lunch
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
                <p className="all-caught-up">
                  <CheckCheck size={16} />
                  You're all caught up.
                </p>
              </div>
            )}
            {modal === "profile" && (
              <div className="profile-content">
                <Avatar member={state.user ?? DEMO_USER} />
                <h3>Alex Morgan</h3>
                <p>Informatics &middot; TUM Garching</p>
                <span className="badge">
                  <GraduationCap size={14} />
                  Demo student account
                </span>
                <div className="profile-stats">
                  <span>
                    <b>{myLunches.length}</b>Lunch plans
                  </span>
                  <span>
                    <b>{state.saved.length}</b>Saved lunches
                  </span>
                  <span>
                    <b>
                      {
                        myLunches.filter(
                          (lobby) => lobby.host.id === state.user?.id,
                        ).length
                      }
                    </b>
                    Tables hosted
                  </span>
                </div>
                <p className="muted-note">
                  This profile is a demo. Enrollment is not verified. Your lunch
                  plans and feedback are stored only in this browser.
                </p>
                <button
                  className="button secondary full-width"
                  onClick={() => {
                    setState((current) => ({ ...current, user: null }));
                    setModal(null);
                    toast("You have signed out of the demo.");
                  }}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            )}
            {modal === "cancel" && selected && (
              <div className="cancel-content">
                <p>
                  Cancel <strong>{selected.title}</strong>? This removes the
                  lobby and frees everyone's lunch break. This can't be undone.
                </p>
                <div className="about-footer">
                  <button
                    className="button secondary"
                    onClick={() => setModal("detail")}
                  >
                    <ArrowLeft size={15} />
                    Keep the lunch
                  </button>
                  <button
                    className="button danger"
                    onClick={() => {
                      setState((current) => ({
                        ...current,
                        lobbies: current.lobbies.filter(
                          (lobby) => lobby.id !== selected.id,
                        ),
                        saved: current.saved.filter((id) => id !== selected.id),
                      }));
                      setModal(null);
                      toast("Lunch cancelled. Here is to another time.");
                    }}
                  >
                    Yes, cancel lunch
                  </button>
                </div>
              </div>
            )}
            {modal === "report" && (
              <form
                className="feedback-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  setState((current) => ({
                    ...current,
                    feedback: [
                      ...current.feedback,
                      {
                        rating: 0,
                        message: `REPORT ${selected?.id ?? ""}: ${reportText.trim()}`,
                        date: new Date().toISOString(),
                      },
                    ],
                  }));
                  setReportText("");
                  setModal(null);
                  toast.success("Your concern has been saved on this device.", {
                    description:
                      "This demo has no live moderation team. For immediate danger, call 112.",
                  });
                }}
              >
                <label>
                  What happened?
                  <textarea
                    value={reportText}
                    onChange={(event) => setReportText(event.target.value)}
                    minLength={10}
                    maxLength={1500}
                    rows={5}
                    required
                    placeholder="Tell us what made you uncomfortable..."
                  />
                </label>
                <p className="muted-note">
                  This preview saves reports locally only. No live moderator
                  will receive this report. For immediate danger, call 112. For
                  campus support, contact the TUM student advisory service.
                </p>
                <button className="button primary full-width" type="submit">
                  Save report
                  <ShieldCheck size={16} />
                </button>
              </form>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        toastOptions={{
          style: { fontFamily: "DM Sans, sans-serif", borderRadius: "8px" },
        }}
      />
    </>
  );
}
