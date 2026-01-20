import {
  Sparkles,
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
  BarChart3,
  GitBranch,
  CheckCircle2,
  Languages,
  Edit,
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
  expensive?: boolean; // Mark questions that use expensive operations like getPageHtml
  new?: boolean; // Mark newly added questions
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
          "Use Pages Context Information to display current page details as readable key-value pairs. Extract all relevant information from Pages Context - do not use tools unless information is missing.",
        icon: FileText,
      },
      {
        id: 2,
        label: "Sites & Languages",
        question:
          "List all sites and languages: names, IDs, language codes, display names, config details.",
        icon: Globe,
      },
      {
        id: 4,
        label: "Translate Page",
        question:
          "Check languages (getLanguages), then translatePage. Specify source/target languages and strategy (AddVersion/CreateNew). After translation, use navigatePages tool to navigate to the newly created language version using the pageId (itemId), targetLanguage, and siteName.",
        icon: Globe,
      },
      {
        id: 13,
        label: "Content Performance",
        question:
          "Use getContentAnalyticsData to show how this page is performing. Display key metrics: views, engagement, trends. Provide a one-line insight about performance.",
        icon: TrendingUp,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getPageHtml, then summarize in 3-5 sentences: purpose, key topics, overall message.",
        icon: FileText,
        expensive: true,
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getPageHtml, then generateBrandReviewFromContent. Provide 1-2 sentence brand compliance summary only.",
        icon: ShieldCheck,
        expensive: true,
      },
      {
        id: 7,
        label: "Find Assets",
        question:
          "Search media library: searchForAssets by keywords, then getAssetDetails for dimensions, size, URLs.",
        icon: Image,
      },
      {
        id: 9,
        label: "SEO/GEO Check",
        question:
          "Analyze page HTML (getPageHtml) for SEO and AEO/GEO. Output table: Topic | How to Fix | Severity (Critical/High/Medium/Low). One row per issue, sorted by severity. SEO: meta tags, headings, semantic markup, accessibility. AEO: content structure, clarity, structured data (JSON-LD/Schema.org). End with 2-3 sentence overall summary.",
        icon: FileText,
        expensive: true,
      },
      {
        id: 10,
        label: "Is This Live?",
        question:
          "Get the languages using getLanguages tool. Check if the page in each language version is published or not using checkPagePublishedToEdge. Display status for each language: Language | Status (✅ Published / ❌ Not published). Use emojis.",
        icon: CheckCircle2,
        new: true,
      },
      {
        id: 11,
        label: "Translation Status",
        question:
          "Get the languages using getLanguages tool. Check if and which version exists for the current page in each available language. Display for each language: Language | Version exists (✅ Yes / ❌ No) | Version number (if exists). Use emojis.",
        icon: Languages,
        new: true,
      },
      {
        id: 12,
        label: "Visual Preview",
        question:
          "Use getPageScreenshot to capture a visual preview of this page. Show the screenshot and provide a brief 2-3 sentence description of the layout, visual elements, and overall appearance.",
        icon: Image,
        new: true,
      },
      {
        id: 14,
        label: "Update Component Content",
        question:
          "Update component content on the current page. First, ask the user precisely for: 1) the component name, 2) which field(s) to change, and 3) the new content for each field. If any information is missing, ask specifically for it. Get the pageId from Pages Context, find the component by name, then update its datasource fields with the new values. After successfully updating, refresh the page using navigatePagesContext or refreshPagesContext to show the updated content.",
        icon: Edit,
        new: true,
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
        id: 2,
        label: "Catalog Overview",
        question:
          "Overview of product catalog: categories, total products, items needing attention.",
        icon: Package,
      },
      {
        id: 3,
        label: "Top Products",
        question:
          "List top-performing products with views, engagement metrics, and trends.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Translate Product Page",
        question:
          "Check languages (getLanguages), then translatePage to create language versions for international access.",
        icon: Globe,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then summarize in 3-5 sentences: purpose, key topics, overall message.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Find Product Assets",
        question:
          "Search media library: searchForAssets for product images/docs, then getAssetDetails for details.",
        icon: Image,
      },
      {
        id: 7,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Provide 1-2 sentence brand compliance summary only.",
        icon: ShieldCheck,
      },
      {
        id: 8,
        label: "Product Page Screenshot",
        question:
          "Capture screenshot using getPageScreenshot to review product presentation and layout.",
        icon: Image,
      },
      {
        id: 9,
        label: "Product Content Analysis",
        question:
          "Use getPageHtml to analyze HTML structure, semantic markup, product info organization. Provide improvement recommendations.",
        icon: FileText,
        expensive: true,
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
        id: 13,
        label: "Article Performance",
        question:
          "Use getContentAnalyticsData to show how this article is performing. Display key metrics: views, engagement, trends. Provide a one-line insight about performance.",
        icon: TrendingUp,
      },
      {
        id: 3,
        label: "Create Page",
        question:
          "Guide creation of new page. I'll provide title, content, and required fields. After creation, use navigatePages tool to navigate to the newly created page using the returned itemId, language, and siteName.",
        icon: Newspaper,
      },
      {
        id: 4,
        label: "Translate Article",
        question:
          "Check languages (getLanguages), then translatePage. Specify source/target languages and strategy (AddVersion/CreateNew). After translation, use navigatePages tool to navigate to the newly created language version using the pageId (itemId), targetLanguage, and siteName.",
        icon: Globe,
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Provide 1-2 sentence brand compliance summary only.",
        icon: ShieldCheck,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then summarize in 3-5 sentences: purpose, key topics, overall message.",
        icon: FileText,
      },
      {
        id: 7,
        label: "Find Images",
        question:
          "Search media library: searchForAssets for article images/graphics, then getAssetDetails for details.",
        icon: Image,
      },
      {
        id: 9,
        label: "SEO/GEO Check",
        question:
          "Analyze page HTML (getPageHtml) for SEO and AEO/GEO. Output table: Topic | How to Fix | Severity (Critical/High/Medium/Low). One row per issue, sorted by severity. SEO: meta tags, headings, semantic markup, accessibility. AEO: content structure, clarity, structured data (JSON-LD/Schema.org). End with 2-3 sentence overall summary.",
        icon: FileText,
        expensive: true,
      },
      {
        id: 10,
        label: "Is This Live?",
        question:
          "Get the languages using getLanguages tool. Check if the page in each language version is published or not using checkPagePublishedToEdge. Display status for each language: Language | Status (✅ Published / ❌ Not published). Use emojis.",
        icon: CheckCircle2,
        new: true,
      },
      {
        id: 11,
        label: "Translation Status",
        question:
          "Get the languages using getLanguages tool. Check if and which version exists for the current page in each available language. Display for each language: Language | Version exists (✅ Yes / ❌ No) | Version number (if exists). Use emojis.",
        icon: Languages,
        new: true,
      },
      {
        id: 12,
        label: "Visual Preview",
        question:
          "Use getPageScreenshot to capture a visual preview of this article. Show the screenshot and provide a brief 2-3 sentence description of the layout, typography, and visual presentation.",
        icon: Image,
        new: true,
      },
      {
        id: 15,
        label: "News Campaign Launch",
        question:
          "Launch a news campaign by creating a news article and promoting it on the home page. First, ask the user precisely for: 1) news article details (title, content, subtitle, excerpt, and any other fields), 2) promotional title for the Hero Banner, and 3) promotional description for the Hero Banner. If any information is missing, ask specifically for it. Then: 1) Get News Root Page and News Template using getNewsRootPage and getNewsTemplate, 2) Create the news article using createNewsPage with the provided details and capture the returned itemId, 3) Find the home page (typically at path '/sitecore/content/solo/solo-website/Home' or use getPageDetails/searchPages to locate it) and capture its itemId and language, 4) Get components on the home page using getPageComponents, 5) Find the Hero Banner component (look for component with name containing 'Hero' or 'Banner'), 6) Update the Hero Banner's Title and Description fields using updateContentItem (update the component's datasource) with the promotional title and description, 7) Navigate to the newly created news page using navigatePages with the news article's itemId and language, 8) After navigation, provide a clear message with a link/navigation option to the home page (using navigatePages with the home page's itemId and language) explaining that the Hero Banner has been updated there to promote the new article.",
        icon: Zap,
        new: true,
      },
      {
        id: 1,
        label: "Articles Statistics",
        question:
          "Get comprehensive articles statistics: use getNewsRootPage to get News Root Page path, then use getSites to get the site name, then use getSitePages to retrieve all pages in the site. Filter pages to find those under the News Root Page path (e.g., pages whose path starts with or contains the News Root Page path). Use getLanguages to get all available languages. For each article page, check publication status in each language using checkPagePublishedToEdge. Display in two tables: 1) Comprehensive overview table (Metric | Count) showing Total Articles, Published (any language), Unpublished (all languages), Articles with all languages published, Articles missing language versions, Percentage Published, 2) Deep dive table (Article Title | Published Languages | Missing Languages | Last Modified | Status) showing detailed information for each article. Format all tables with clear alignment and proper column headers.",
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
        id: 2,
        label: "Upcoming Events",
        question:
          "List events in next 30 days with registration counts and promotion needs.",
        icon: Calendar,
      },
      {
        id: 3,
        label: "Event Performance",
        question:
          "Show recent event performance: attendance rates, engagement metrics, feedback highlights.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Translate Event Page",
        question:
          "Check languages (getLanguages), then translatePage for international attendees.",
        icon: Globe,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then summarize in 3-5 sentences: purpose, key topics, overall message.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Provide 1-2 sentence brand compliance summary only.",
        icon: ShieldCheck,
      },
      {
        id: 7,
        label: "Find Event Assets",
        question:
          "Search media library: searchForAssets for event photos/speaker images/promotional graphics, then getAssetDetails.",
        icon: Image,
      },
      {
        id: 8,
        label: "Event Page Screenshot",
        question:
          "Capture screenshot using getPageScreenshot to review visual presentation and layout.",
        icon: Image,
      },
      {
        id: 9,
        label: "Event HTML Analysis",
        question:
          "Use getPageHtml to analyze semantic markup, content structure, accessibility. Provide structure improvement recommendations.",
        icon: FileText,
        expensive: true,
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
        id: 2,
        label: "Site Overview",
        question:
          "Comprehensive site overview: content structure, recent changes, upcoming events, product highlights.",
        icon: Zap,
      },
      {
        id: 3,
        label: "Content Health",
        question:
          "Analyze content ecosystem health: outdated pages, missing metadata, broken links, optimization opportunities.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Translate Content",
        question:
          "Check languages (getLanguages), then translatePage for multilingual delivery across products, news, events.",
        icon: Globe,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then summarize in 3-5 sentences: purpose, key topics, overall message.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Provide 1-2 sentence brand compliance summary only.",
        icon: ShieldCheck,
      },
      {
        id: 7,
        label: "Search Media Library",
        question:
          "Search media library: searchForAssets by keywords, then getAssetDetails for comprehensive asset info across all content types.",
        icon: Image,
      },
      {
        id: 8,
        label: "Visual Page Review",
        question:
          "Capture screenshots using getPageScreenshot across content types (products/news/events) to compare layouts and ensure design consistency.",
        icon: Image,
      },
      {
        id: 9,
        label: "Content Structure Analysis",
        question:
          "Use getPageHtml across content types (products/news/events) to compare structures, semantic markup, organization. Provide unified recommendations.",
        icon: FileText,
        expensive: true,
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
          "Analyze my needs and recommend the most appropriate specialized agent.",
        icon: GitBranch,
      },
      {
        id: 2,
        label: "Route my query",
        question:
          "Analyze query and recommend best specialized agent. Explain why it's the right choice.",
        icon: Search,
      },
      {
        id: 3,
        label: "List available agents",
        question:
          "List all available specialized agents and their specializations.",
        icon: MessageCircle,
      },
      {
        id: 4,
        label: "Agent comparison",
        question:
          "Compare available agents and recommend the most suitable for my task.",
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
