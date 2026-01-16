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
  ShieldCheck,
  Image,
  Link,
  Settings,
  BarChart3,
  Edit,
  Copy,
  Clock,
  GitBranch,
  type LucideIcon,
} from "lucide-react";

// Agent types matching the API route
export enum AgentType {
  Sitecore = "sitecore",
  Products = "products",
  News = "news",
  Events = "events",
  Allmighty = "all",
  Delegation = "delegation",
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
        label: "Sites & Languages",
        question:
          "Get all available sites and languages configured in this Sitecore instance. Show me the site names, IDs, language codes, display names, and their configuration details.",
        icon: Globe,
      },
      {
        id: 3,
        label: "Get Analytics",
        question:
          "Show me the analytics data for the current page. Please provide a brief summary highlighting key insights, trends, and notable patterns. Focus on the overall story the data tells rather than listing individual data points.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Brand Validation",
        question:
          "Execute a brand analysis for the current page content. First, use getPageHtml to retrieve the HTML content of the current page. Then, use generateBrandReviewFromContent with the retrieved HTML content to analyze it against brand guidelines. At the end, provide only a 1-2 sentence summary of the overall brand compliance status, not a detailed overview.",
        icon: ShieldCheck,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Summarize the current page content. Use getPageHtml to retrieve the HTML content of the current page, then provide a short paragraph (3-5 sentences) summarizing what the page is about, its main purpose, key topics covered, and overall message. Focus on giving a clear, concise overview that helps understand the page's content at a glance.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Translate Page",
        question:
          "Translate the current page to another language. Use the translatePage tool to create a new language version. First, check available languages using getLanguages, then translate the page to the target language. Specify the source language, target language, and translation strategy (AddVersion or CreateNew).",
        icon: Globe,
      },
      {
        id: 7,
        label: "Find Assets",
        question:
          "Help me find and retrieve details about assets in my Sitecore media library. Use searchForAssets to search for assets by name or keywords, then use getAssetDetails to get comprehensive information about specific assets including dimensions, file size, and URLs.",
        icon: Image,
      },
      {
        id: 8,
        label: "Page Screenshot",
        question:
          "Get a visual screenshot of the current page. Use the getPageScreenshot tool to capture how the page appears visually. This is useful for reviewing the rendered appearance, checking layouts, or documenting the page design.",
        icon: Image,
      },
      {
        id: 9,
        label: "SEO/GEO Check",
        question:
          "Analyze page HTML (getPageHtml) for SEO and AEO/GEO. Output table: Topic | How to Fix | Severity (Critical/High/Medium/Low). One row per issue, sorted by severity. SEO: meta tags, headings, semantic markup, accessibility. AEO: content structure, clarity, structured data (JSON-LD/Schema.org). End with 2-3 sentence overall summary.",
        icon: FileText,
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
      {
        title: "Brand Compliance",
        description:
          "Ensure your content aligns with brand guidelines. Get automated brand reviews and compliance insights for consistent messaging.",
        icon: Star,
      },
      {
        title: "Multi-Language Support",
        description:
          "Seamlessly translate and manage content across multiple languages. Maintain consistency and quality in every translation.",
        icon: Globe,
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
        label: "Get Analytics",
        question:
          "Show me the analytics data for the current page. Please provide a brief summary highlighting key insights, trends, and notable patterns. Focus on the overall story the data tells rather than listing individual data points.",
        icon: TrendingUp,
      },
      {
        id: 2,
        label: "Catalog Overview",
        question:
          "Give me an overview of my product catalog including categories, total products, and any items that need attention.",
        icon: Package,
      },
      {
        id: 3,
        label: "Top Products",
        question:
          "What are my top-performing products? Include insights on views, engagement, and any trends you notice.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Brand Validation",
        question:
          "Execute a brand analysis for the current page content. First, use getContentItemContent to retrieve the content of the current page. Then, use generateBrandReviewFromContent with the retrieved content to analyze it against brand guidelines. At the end, provide only a 1-2 sentence summary of the overall brand compliance status, not a detailed overview.",
        icon: ShieldCheck,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Summarize the current page content. Use getContentItemContent to retrieve the content of the current page, then provide a short paragraph (3-5 sentences) summarizing what the page is about, its main purpose, key topics covered, and overall message. Focus on giving a clear, concise overview that helps understand the page's content at a glance.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Find Product Assets",
        question:
          "Search for product-related assets in the media library. Use searchForAssets to find images, documents, or media files related to products, then retrieve detailed information using getAssetDetails. Help me locate high-quality product images, specifications, or marketing materials.",
        icon: Image,
      },
      {
        id: 7,
        label: "Translate Product Page",
        question:
          "Translate this product page to support multiple languages. First check available languages with getLanguages, then use translatePage to create language versions. This helps make products accessible to international audiences.",
        icon: Globe,
      },
      {
        id: 8,
        label: "Product Page Screenshot",
        question:
          "Capture a visual screenshot of this product page. Use getPageScreenshot to see how the product page renders visually. Useful for reviewing product presentation, layout, and visual consistency across different views.",
        icon: Image,
      },
      {
        id: 9,
        label: "Product Content Analysis",
        question:
          "Analyze the HTML structure and content of this product page. Use getPageHtml to retrieve the rendered HTML, then examine the semantic structure, product information organization, and content quality. Provide recommendations for improvement.",
        icon: FileText,
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
      {
        title: "Product Optimization",
        description:
          "Get AI-powered recommendations to improve product descriptions, enhance SEO, and increase conversion rates.",
        icon: Zap,
      },
      {
        title: "Inventory Intelligence",
        description:
          "Monitor stock levels, identify low-performing products, and get alerts for items that need attention or promotion.",
        icon: Search,
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
        label: "Get Analytics",
        question:
          "Show me the analytics data for the current page. Please provide a brief summary highlighting key insights, trends, and notable patterns. Focus on the overall story the data tells rather than listing individual data points.",
        icon: TrendingUp,
      },
      {
        id: 3,
        label: "Brand Validation",
        question:
          "Execute a brand analysis for the current page content. First, use getContentItemContent to retrieve the content of the current page. Then, use generateBrandReviewFromContent with the retrieved content to analyze it against brand guidelines. At the end, provide only a 1-2 sentence summary of the overall brand compliance status, not a detailed overview.",
        icon: ShieldCheck,
      },
      {
        id: 4,
        label: "Create News Page",
        question:
          "Help me create a new news page. I'll provide the details like title, content, and other required fields. Guide me through the process.",
        icon: Newspaper,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Summarize the current page content. Use getContentItemContent to retrieve the content of the current page, then provide a short paragraph (3-5 sentences) summarizing what the page is about, its main purpose, key topics covered, and overall message. Focus on giving a clear, concise overview that helps understand the page's content at a glance.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Translate News Article",
        question:
          "Translate this news article to another language to reach a broader audience. First check available languages with getLanguages, then use translatePage to create a translated version. Specify the source and target languages, and choose whether to add a version or create a new page.",
        icon: Globe,
      },
      {
        id: 7,
        label: "Find News Images",
        question:
          "Search for images and assets that could be used with this news article. Use searchForAssets to find relevant images, photos, or graphics from the media library, then retrieve their details with getAssetDetails. Help me find appropriate visuals to accompany the article.",
        icon: Image,
      },
      {
        id: 8,
        label: "News Article Screenshot",
        question:
          "Capture a visual screenshot of how this news article appears when published. Use getPageScreenshot to see the rendered article layout, typography, and visual presentation. Useful for reviewing how the article looks to readers.",
        icon: Image,
      },
      {
        id: 9,
        label: "News HTML Structure",
        question:
          "Analyze the HTML structure and markup of this news article. Use getPageHtml to retrieve the rendered HTML, then examine the semantic structure, heading hierarchy, content organization, and accessibility. Provide insights on how the article structure could be optimized.",
        icon: FileText,
      },
      {
        id: 10,
        label: "SEO/GEO Check",
        question:
          "Analyze page HTML (getPageHtml) for SEO and AEO/GEO. Output table: Topic | How to Fix | Severity (Critical/High/Medium/Low). One row per issue, sorted by severity. SEO: meta tags, headings, semantic markup, accessibility. AEO: content structure, clarity, structured data (JSON-LD/Schema.org). End with 2-3 sentence overall summary.",
        icon: FileText,
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
      {
        title: "Brand Alignment",
        description:
          "Ensure every article follows brand guidelines. Get automated brand reviews and suggestions for consistent tone and messaging.",
        icon: Star,
      },
      {
        title: "Asset Management",
        description:
          "Easily find and attach images, documents, and media to your articles. Search and manage all your content assets efficiently.",
        icon: Layers,
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
        label: "Get Analytics",
        question:
          "Show me the analytics data for the current page. Please provide a brief summary highlighting key insights, trends, and notable patterns. Focus on the overall story the data tells rather than listing individual data points.",
        icon: TrendingUp,
      },
      {
        id: 2,
        label: "Upcoming Events",
        question:
          "What events are coming up in the next 30 days? Include registration counts and any that need promotion.",
        icon: Calendar,
      },
      {
        id: 3,
        label: "Event Performance",
        question:
          "How did my recent events perform? Show me attendance rates, engagement metrics, and feedback highlights.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Brand Validation",
        question:
          "Execute a brand analysis for the current page content. First, use getContentItemContent to retrieve the content of the current page. Then, use generateBrandReviewFromContent with the retrieved content to analyze it against brand guidelines. At the end, provide only a 1-2 sentence summary of the overall brand compliance status, not a detailed overview.",
        icon: ShieldCheck,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Summarize the current page content. Use getContentItemContent to retrieve the content of the current page, then provide a short paragraph (3-5 sentences) summarizing what the page is about, its main purpose, key topics covered, and overall message. Focus on giving a clear, concise overview that helps understand the page's content at a glance.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Translate Event Page",
        question:
          "Translate this event page to support multiple languages for international attendees. First check available languages with getLanguages, then use translatePage to create language versions. This helps make event information accessible to a global audience.",
        icon: Globe,
      },
      {
        id: 7,
        label: "Find Event Assets",
        question:
          "Search for event-related images and media assets. Use searchForAssets to find event photos, speaker images, venue pictures, or promotional graphics, then get detailed information with getAssetDetails. Help me locate visual assets for event promotion.",
        icon: Image,
      },
      {
        id: 8,
        label: "Event Page Screenshot",
        question:
          "Capture a visual screenshot of how this event page appears. Use getPageScreenshot to review the visual presentation, layout, and design of the event page. Useful for ensuring the event information is displayed attractively.",
        icon: Image,
      },
      {
        id: 9,
        label: "Event HTML Analysis",
        question:
          "Analyze the HTML structure and content organization of this event page. Use getPageHtml to retrieve the rendered HTML, then examine the semantic markup, content structure, and accessibility. Provide recommendations for improving the event page structure.",
        icon: FileText,
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
      {
        title: "Content Creation",
        description:
          "Generate compelling event descriptions, speaker bios, and promotional content. Ensure all event details are complete and engaging.",
        icon: FileText,
      },
      {
        title: "Multi-Language Events",
        description:
          "Translate event content seamlessly across languages. Reach global audiences with consistent, high-quality translations.",
        icon: Globe,
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
        label: "Get Analytics",
        question:
          "Show me the analytics data for the current page. Please provide a brief summary highlighting key insights, trends, and notable patterns. Focus on the overall story the data tells rather than listing individual data points.",
        icon: TrendingUp,
      },
      {
        id: 2,
        label: "Site Overview",
        question:
          "Give me a comprehensive overview of my Sitecore site including content structure, recent changes, upcoming events, and product highlights.",
        icon: Zap,
      },
      {
        id: 3,
        label: "Content Health",
        question:
          "Analyze the health of my entire content ecosystem - identify outdated pages, missing metadata, broken links, and optimization opportunities.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Brand Validation",
        question:
          "Execute a brand analysis for the current page content. First, use getContentItemContent to retrieve the content of the current page. Then, use generateBrandReviewFromContent with the retrieved content to analyze it against brand guidelines. At the end, provide only a 1-2 sentence summary of the overall brand compliance status, not a detailed overview.",
        icon: ShieldCheck,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Summarize the current page content. Use getContentItemContent to retrieve the content of the current page, then provide a short paragraph (3-5 sentences) summarizing what the page is about, its main purpose, key topics covered, and overall message. Focus on giving a clear, concise overview that helps understand the page's content at a glance.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Translate Content",
        question:
          "Translate the current page to multiple languages to expand global reach. Use getLanguages to see available languages, then use translatePage to create translations. This enables multilingual content delivery across products, news, and events.",
        icon: Globe,
      },
      {
        id: 7,
        label: "Search Media Library",
        question:
          "Search across the entire media library to find assets for any content type. Use searchForAssets with keywords to locate images, documents, or media files, then getAssetDetails for comprehensive information. Help me discover and organize assets across all content domains.",
        icon: Image,
      },
      {
        id: 8,
        label: "Visual Page Review",
        question:
          "Capture screenshots of pages across different content types to review visual consistency. Use getPageScreenshot to see how products, news articles, and event pages render visually. Compare layouts and ensure consistent design patterns.",
        icon: Image,
      },
      {
        id: 9,
        label: "Content Structure Analysis",
        question:
          "Analyze HTML structure across different content types to ensure consistency and quality. Use getPageHtml to retrieve rendered HTML from products, news, and events, then compare structures, semantic markup, and content organization. Provide unified recommendations.",
        icon: FileText,
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
      {
        title: "Unified Brand Management",
        description:
          "Maintain brand consistency across all content types. Access brand kits, guidelines, and automated compliance reviews.",
        icon: Crown,
      },
      {
        title: "Advanced Analytics",
        description:
          "Comprehensive analytics across all domains. Get unified insights into content performance, user engagement, and business metrics.",
        icon: TrendingUp,
      },
    ],
  },
  {
    id: AgentType.Delegation,
    name: "Delegation",
    headline: "Smart Agent Router",
    subheadline:
      "Intelligent routing assistant that analyzes your query and recommends the best specialized agent for your needs.",
    icon: GitBranch,
    colors: {
      primary: "#7C3AED",
      primaryLight: "#8B5CF6",
      primaryDark: "#6D28D9",
    },
    predefinedQuestions: [
      {
        id: 1,
        label: "Which agent should I use?",
        question:
          "I have a question but I'm not sure which agent would be best suited to help me. Can you analyze my needs and recommend the most appropriate specialized agent?",
        icon: GitBranch,
      },
      {
        id: 2,
        label: "Route my query",
        question:
          "Please analyze my query and recommend which specialized agent would be best to handle it. Explain why that agent is the right choice.",
        icon: Search,
      },
      {
        id: 3,
        label: "List available agents",
        question:
          "Show me all available specialized agents in the system and what each one specializes in.",
        icon: MessageCircle,
      },
      {
        id: 4,
        label: "Agent comparison",
        question:
          "I need help with a specific task. Can you compare the available agents and tell me which one would be most suitable for my needs?",
        icon: BarChart3,
      },
    ],
    teaserCards: [
      {
        title: "Smart Routing",
        description:
          "Automatically analyzes your query and routes you to the most appropriate specialized agent for the best assistance.",
        icon: GitBranch,
      },
      {
        title: "Agent Discovery",
        description:
          "Discover all available specialized agents and understand what each one can help you with.",
        icon: Search,
      },
      {
        title: "Expert Recommendations",
        description:
          "Get intelligent recommendations on which agent is best suited for your specific needs and content type.",
        icon: Star,
      },
      {
        title: "Seamless Experience",
        description:
          "Navigate between specialized agents effortlessly. We'll guide you to the right expert for every task.",
        icon: Zap,
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
