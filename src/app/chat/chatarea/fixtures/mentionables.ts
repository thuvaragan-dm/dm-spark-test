// Define a generic interface for anything we can mention
export interface Mentionable {
  id: string;
  name: string; // The text to be displayed and inserted
  trigger: string; // The character that activates this mentionable, e.g., '@', '/', '#'
  description?: string; // Optional description for the UI
}

// Create a dummy list of mentionable items (users and slash commands)
export const DUMMY_MENTIONABLES: Mentionable[] = [
  // --- Existing Users ---
  {
    id: "user-1",
    name: "JohnDoe",
    trigger: "@",
    description: "Frontend Developer",
  },
  {
    id: "user-2",
    name: "JaneSmith",
    trigger: "@",
    description: "Backend Developer",
  },
  {
    id: "user-3",
    name: "PeterJones",
    trigger: "@",
    description: "Project Manager",
  },
  // --- New Users ---
  {
    id: "user-4",
    name: "EmilyCarter",
    trigger: "@",
    description: "UI/UX Designer",
  },
  {
    id: "user-5",
    name: "MichaelChen",
    trigger: "@",
    description: "Data Scientist",
  },
  {
    id: "user-6",
    name: "SarahLee",
    trigger: "@",
    description: "DevOps Engineer",
  },
  {
    id: "user-7",
    name: "DavidKim",
    trigger: "@",
    description: "QA Tester",
  },

  // --- Existing Commands ---
  {
    id: "cmd-1",
    name: "summary",
    trigger: "/",
    description: "Summarize the document",
  },
  {
    id: "cmd-2",
    name: "translate",
    trigger: "/",
    description: "Translate to Spanish",
  },
  // --- New Commands ---
  {
    id: "cmd-3",
    name: "rewrite",
    trigger: "/",
    description: "Rewrite the selected text",
  },
  {
    id: "cmd-4",
    name: "ask",
    trigger: "/",
    description: "Ask a question about the content",
  },
  {
    id: "cmd-5",
    name: "format",
    trigger: "/",
    description: "Format selection as JSON",
  },
  {
    id: "cmd-6",
    name: "search",
    trigger: "/",
    description: "Search the web for a topic",
  },

  // --- New Category: Tags ---
  {
    id: "tag-1",
    name: "general",
    trigger: "#",
    description: "General discussion channel",
  },
  {
    id: "tag-2",
    name: "feedback",
    trigger: "#",
    description: "For product feedback and suggestions",
  },
  {
    id: "tag-3",
    name: "release-notes",
    trigger: "#",
    description: "Updates for the next release",
  },
  {
    id: "tag-4",
    name: "urgent",
    trigger: "#",
    description: "For urgent issues and incidents",
  },
];
