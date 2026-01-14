import {
  Sparkles,
  BookOpen,
  Layers,
  MessageCircle,
  ShoppingBag,
  Newspaper,
  Calendar,
  Crown,
  Zap,
  Search,
  TrendingUp,
  Package,
  FileText,
  Users,
  Star,
  Globe,
  type LucideIcon,
} from "lucide-react";

// Agent types matching the API route
export enum AgentType {
  Sitecore = "sitecore",
  Products = "products",
  News = "news",
  Events = "events",
  Allmighty = "all",
}

export interface PredefinedQuestion {
  id: number;
  label: string;
  question: string;
  icon: LucideIcon;
}

export interface TeaserCard {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface AgentConfig {
  id: AgentType;
  name: string;
  headline: string;
  subheadline: string;
  icon: LucideIcon;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
  };
  predefinedQuestions: PredefinedQuestion[];
  teaserCards: TeaserCard[];
}

export const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: AgentType.Sitecore,
    name: "Sitecore",
    headline: "Your Content Intelligence",
    subheadline:
      "AI-powered assistant that knows your content inside out. Ask anything about your pages or content strategy.",
    icon: Sparkles,
    colors: {
      primary: "#5a4fcf",
      primaryLight: "#6e3fff",
      primaryDark: "#4715af",
    },
    predefinedQuestions: [
      {
        id: 1,
        label: "Page Context",
        question:
          "Please provide me with the current page context. I'd like to understand the page structure, template information, fields, and any relevant metadata about the page I'm currently viewing or working on.",
        icon: FileText,
      },
      {
        id: 2,
        label: "All Sites",
        question:
          "Get all available sites configured in this Sitecore instance. Show me the site names, IDs, and their configuration details.",
        icon: Globe,
      },
      {
        id: 3,
        label: "All Languages",
        question:
          "Retrieve all available languages configured in this Sitecore site. Show me the language codes, display names, and metadata.",
        icon: Globe,
      },
      {
        id: 4,
        label: "Content Overview",
        question:
          "Give me a general overview of the content structure and organization in my Sitecore site.",
        icon: Layers,
      },
    ],
    teaserCards: [
      {
        title: "Content Aware",
        description:
          "Deeply integrated with your Sitecore pages and components. Understands your content structure and context.",
        icon: Layers,
      },
      {
        title: "Smart Suggestions",
        description:
          "Get AI insights to improve your content quality, SEO, and engagement. Optimize your pages effortlessly.",
        icon: Sparkles,
      },
    ],
  },
  {
    id: AgentType.Products,
    name: "Products",
    headline: "Product Intelligence",
    subheadline:
      "Your expert on all products, catalogs, and commerce. Get insights on inventory, pricing, and recommendations.",
    icon: ShoppingBag,
    colors: {
      primary: "#059669",
      primaryLight: "#10B981",
      primaryDark: "#047857",
    },
    predefinedQuestions: [
      {
        id: 1,
        label: "Catalog Overview",
        question:
          "Give me an overview of my product catalog including categories, total products, and any items that need attention.",
        icon: Package,
      },
      {
        id: 2,
        label: "Top Products",
        question:
          "What are my top-performing products? Include insights on views, engagement, and any trends you notice.",
        icon: TrendingUp,
      },
      {
        id: 3,
        label: "Product Gaps",
        question:
          "Identify any products with missing descriptions, images, or incomplete metadata that need to be updated.",
        icon: Search,
      },
      {
        id: 4,
        label: "Recommendations",
        question:
          "Based on my product catalog, suggest related products and cross-sell opportunities for the current page.",
        icon: Sparkles,
      },
    ],
    teaserCards: [
      {
        title: "Catalog Mastery",
        description:
          "Complete visibility into your product catalog. Track inventory, pricing, and product relationships across your site.",
        icon: Package,
      },
      {
        title: "Commerce Insights",
        description:
          "Analyze product performance, identify top sellers, and discover cross-sell opportunities to boost revenue.",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: AgentType.News,
    name: "News",
    headline: "News & Articles Hub",
    subheadline:
      "Your newsroom assistant for articles, blog posts, and editorial content. Stay on top of your publishing schedule.",
    icon: Newspaper,
    colors: {
      primary: "#DC2626",
      primaryLight: "#EF4444",
      primaryDark: "#B91C1C",
    },
    predefinedQuestions: [
      {
        id: 1,
        label: "News Count",
        question:
          "How many news articles are currently in the system? Please provide a count of all news items, including published and draft articles.",
        icon: FileText,
      },
      {
        id: 2,
        label: "Create News Page",
        question:
          "Help me create a new news page. I'll provide the details like title, content, and other required fields. Guide me through the process.",
        icon: Newspaper,
      },
      {
        id: 3,
        label: "Analyze Current News",
        question:
          "Analyze the content of the current news page I'm viewing. Provide insights about the article structure, content quality, SEO, and suggest any improvements.",
        icon: Search,
      },
      {
        id: 4,
        label: "News Overview",
        question:
          "Give me a general overview of the news articles and content in my Sitecore site, including recent publications and editorial trends.",
        icon: TrendingUp,
      },
    ],
    teaserCards: [
      {
        title: "Editorial Control",
        description:
          "Manage your entire editorial workflow. Track articles, drafts, and publication schedules in one place.",
        icon: FileText,
      },
      {
        title: "Content Strategy",
        description:
          "Analyze your content topics, identify gaps, and get SEO recommendations to maximize article performance.",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: AgentType.Events,
    name: "Events",
    headline: "Events Command Center",
    subheadline:
      "Manage your events calendar, registrations, and attendee engagement. Never miss an important date.",
    icon: Calendar,
    colors: {
      primary: "#0891B2",
      primaryLight: "#06B6D4",
      primaryDark: "#0E7490",
    },
    predefinedQuestions: [
      {
        id: 1,
        label: "Upcoming Events",
        question:
          "What events are coming up in the next 30 days? Include registration counts and any that need promotion.",
        icon: Calendar,
      },
      {
        id: 2,
        label: "Event Performance",
        question:
          "How did my recent events perform? Show me attendance rates, engagement metrics, and feedback highlights.",
        icon: TrendingUp,
      },
      {
        id: 3,
        label: "Event Content",
        question:
          "Review the content for my upcoming events. Are descriptions compelling? Do I have all speakers and agendas listed?",
        icon: FileText,
      },
      {
        id: 4,
        label: "Attendee Insights",
        question:
          "Give me insights about my event attendees. What are the most popular event types? Any patterns in registrations?",
        icon: Users,
      },
    ],
    teaserCards: [
      {
        title: "Event Management",
        description:
          "Complete oversight of your events calendar. Track registrations, manage schedules, and monitor attendance.",
        icon: Calendar,
      },
      {
        title: "Engagement Analytics",
        description:
          "Understand event performance with detailed metrics. Identify successful events and optimize future ones.",
        icon: Users,
      },
    ],
  },
  {
    id: AgentType.Allmighty,
    name: "Allmighty",
    headline: "The Allmighty Assistant",
    subheadline:
      "Omniscient AI with complete mastery over your entire Sitecore universe.",
    icon: Crown,
    colors: {
      primary: "#D97706",
      primaryLight: "#F59E0B",
      primaryDark: "#B45309",
    },
    predefinedQuestions: [
      {
        id: 1,
        label: "Site Overview",
        question:
          "Give me a comprehensive overview of my Sitecore site including content structure, recent changes, upcoming events, and product highlights.",
        icon: Zap,
      },
      {
        id: 2,
        label: "Content Health",
        question:
          "Analyze the health of my entire content ecosystem - identify outdated pages, missing metadata, broken links, and optimization opportunities.",
        icon: TrendingUp,
      },
      {
        id: 3,
        label: "Cross-Content Links",
        question:
          "Find opportunities to connect my products, news articles, and events. Suggest cross-linking strategies to improve user engagement.",
        icon: Layers,
      },
      {
        id: 4,
        label: "Strategic Insights",
        question:
          "Based on my content, products, and events, what strategic recommendations do you have for improving my digital presence?",
        icon: Star,
      },
    ],
    teaserCards: [
      {
        title: "Omniscient Knowledge",
        description:
          "Complete mastery over your entire Sitecore universe. Knows everything about your content, products, news, and events.",
        icon: Globe,
      },
      {
        title: "Strategic Intelligence",
        description:
          "Cross-domain insights and recommendations. Connect the dots across all your content to maximize impact.",
        icon: Star,
      },
    ],
  },
];

// Helper to get agent config by type
export function getAgentConfig(agentType: AgentType): AgentConfig {
  return (
    AGENT_CONFIGS.find((config) => config.id === agentType) || AGENT_CONFIGS[0]
  );
}

// Default agent - Sitecore
export const DEFAULT_AGENT = AgentType.Sitecore;
