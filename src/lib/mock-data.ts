// Single source of truth for mock data used by the dashboard UI
// until the database is wired up. Shapes loosely follow the Prisma
// draft in context/project-overview.md. Replace with real queries later.

export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string; // tailwind text-color class for the icon
  isSystem: boolean;
  count: number; // number of items of this type (for sidebar)
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  isFavorite: boolean;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  typeId: string;
  collectionId: string | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  language: string | null;
  createdAt: string; // ISO date
}

export const currentUser: User = {
  id: "user_1",
  name: "John Doe",
  email: "john@devstash.io",
  isPro: true,
};

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "Snippets", icon: "Code", color: "text-blue-500", isSystem: true, count: 24 },
  { id: "type_prompt", name: "Prompts", icon: "Sparkles", color: "text-purple-500", isSystem: true, count: 18 },
  { id: "type_command", name: "Commands", icon: "Terminal", color: "text-amber-500", isSystem: true, count: 15 },
  { id: "type_note", name: "Notes", icon: "FileText", color: "text-yellow-500", isSystem: true, count: 12 },
  { id: "type_file", name: "Files", icon: "File", color: "text-gray-400", isSystem: true, count: 5 },
  { id: "type_image", name: "Images", icon: "Image", color: "text-green-500", isSystem: true, count: 3 },
  { id: "type_url", name: "Links", icon: "Link", color: "text-cyan-500", isSystem: true, count: 8 },
];

export const collections: Collection[] = [
  {
    id: "col_react",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
  },
  {
    id: "col_python",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
  },
  {
    id: "col_context",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
  },
  {
    id: "col_interview",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
  },
  {
    id: "col_git",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
  },
  {
    id: "col_ai",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
  },
];

export const items: Item[] = [
  {
    id: "item_useauth",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    typeId: "type_snippet",
    collectionId: "col_react",
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    language: "typescript",
    createdAt: "2026-01-15",
  },
  {
    id: "item_api_error",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    typeId: "type_snippet",
    collectionId: "col_react",
    tags: ["typescript", "api", "fetch"],
    isFavorite: false,
    isPinned: true,
    language: "typescript",
    createdAt: "2026-01-12",
  },
  {
    id: "item_debounce",
    title: "Debounce Utility",
    description: "Generic debounce function for input handlers",
    typeId: "type_snippet",
    collectionId: "col_python",
    tags: ["javascript", "utility"],
    isFavorite: false,
    isPinned: false,
    language: "javascript",
    createdAt: "2026-01-10",
  },
  {
    id: "item_git_undo",
    title: "Undo Last Commit",
    description: "Soft reset to keep changes staged after undoing a commit",
    typeId: "type_command",
    collectionId: "col_git",
    tags: ["git", "cli"],
    isFavorite: false,
    isPinned: false,
    language: "bash",
    createdAt: "2026-01-08",
  },
  {
    id: "item_review_prompt",
    title: "Code Review Prompt",
    description: "Prompt for thorough AI-assisted code reviews",
    typeId: "type_prompt",
    collectionId: "col_ai",
    tags: ["ai", "review"],
    isFavorite: true,
    isPinned: false,
    language: null,
    createdAt: "2026-01-05",
  },
  {
    id: "item_ctx_overview",
    title: "Project Overview Template",
    description: "Reusable context file describing a project for AI tools",
    typeId: "type_note",
    collectionId: "col_context",
    tags: ["context", "ai"],
    isFavorite: false,
    isPinned: false,
    language: "markdown",
    createdAt: "2026-01-03",
  },
];
