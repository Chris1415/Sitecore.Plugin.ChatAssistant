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
  FolderOpen,
  Wand2,
  Eye,
  List,
  Grid3x3,
  BookOpen,
  Palette,
  UserPlus,
  ClipboardCheck,
  Globe2,
  Activity,
  FileSearch,
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
  group?: string; // Group name for organizing questions in dropdown
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
          "Display current page details from Pages Context as a well-formatted markdown table with columns: Property | Value. Extract all relevant information (page name, ID, path, template, language, version, etc.). Only use tools if information is missing from Pages Context.",
        icon: FileText,
        group: "Page Information",
      },
      {
        id: 2,
        label: "Sites & Languages",
        question:
          "Use getSites and getLanguages tools. Display results in two well-formatted markdown tables: 1) Sites table (Name | ID | Root Path from properties), 2) Languages table (Name | Regional ISO Code | ISO Code). Add a brief summary header showing total counts. Format tables with clear headers and proper alignment.",
        icon: Globe,
        group: "Page Information",
      },
      {
        id: 10,
        label: "Publishing & Translation Status",
        question:
          "Use getLanguages, then for each language: checkPagePublishedToEdge for publishing status and check current page version status for translation coverage. Display results in a consolidated markdown table: Language | Published (✅/❌) | Version Exists (✅/❌) | Version Number. Include a summary showing: total languages, published count, unpublished count, translated count, missing translations count.",
        icon: CheckCircle2,
        group: "Page Information",
      },
      {
        id: 12,
        label: "Visual Preview",
        question:
          "Use getPageScreenshot to capture page preview. Display the screenshot and provide a 2-3 sentence description covering layout structure, visual elements, and overall appearance.",
        icon: Image,
        group: "Page Information",
      },
      {
        id: 4,
        label: "Translate Page",
        question:
          "Ask user for: source language, target language, and translation strategy (AddVersion/CreateNew). Use getLanguages to verify languages exist, then translatePage. After successful translation, use navigatePages to navigate to the new language version using returned itemId, targetLanguage, and siteName.",
        icon: Globe,
        group: "Content Management",
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getPageHtml tool, then provide a concise 3-5 sentence summary covering: page purpose, key topics, and overall message.",
        icon: FileText,
        expensive: true,
        group: "Content Management",
      },
      {
        id: 14,
        label: "Update Component Content",
        question:
          "Ask user precisely for: 1) component name, 2) field(s) to update, 3) new content for each field. If information is missing, ask specifically. Get pageId from Pages Context, find component by name using getPageComponents, update datasource fields using updateComponentContent. After update, refresh page using refreshPagesContext.",
        icon: Edit,
        new: true,
        group: "Content Management",
      },
      {
        id: 18,
        label: "List Page Components",
        question:
          "Get pageId from Pages Context. Use getPageComponents to retrieve all components on the current page. For each component, get the datasource using getContentItemContent with the datasource ID to retrieve its fields. Display results in a formatted markdown table: Component Name | Type | Placeholder | Datasource ID | Datasource Fields. Include a summary showing total component count and component types.",
        icon: List,
        new: true,
        group: "Content Management",
      },
      {
        id: 19,
        label: "Component Inventory",
        question:
          "Get pageId from Pages Context. Use getPageComponents to analyze component usage. Display analysis in formatted markdown tables: 1) Component Summary (Component Name | Count | Type), 2) Component Types (Type | Count | Usage). Identify reusable vs unique components and provide optimization recommendations.",
        icon: Grid3x3,
        new: true,
        group: "Content Management",
      },
      {
        id: 15,
        label: "Browse Asset Library",
        question:
          "Ask user for search keywords. Use searchForAssets to find matching assets. Use getAssetDetails for each result to get complete information. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 most relevant results.",
        icon: FolderOpen,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 16,
        label: "Generate & Upload Image (Beta)",
        question:
          "Ask user for: 1) image description/prompt, 2) asset name (optional), 3) site name. Use generateImage tool which will generate an AI image and automatically upload it to Sitecore Media Library. Display the uploaded asset details including ID, embed URL, size, and dimensions.",
        icon: Wand2,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getPageHtml, then generateBrandReviewFromContent. Display results in a brief markdown table: Aspect | Status | Notes. Provide a 1-2 sentence brand compliance summary.",
        icon: ShieldCheck,
        expensive: true,
        group: "Brand & Compliance",
      },
      {
        id: 20,
        label: "Explore Brand Kit",
        question:
          "Use listBrandKits to get available brand kits, then retrieveBrandKit to get details. Use listBrandKitSections to get sections, and listBrandKitSubsections for each section to explore fields. Display brand kit structure in formatted markdown tables: 1) Brand Kit Overview (Name | Description | Status), 2) Sections (Section Name | Fields Count | Purpose), 3) Fields (Field Name | Type | Value | Intent). Provide a summary of brand guidelines available.",
        icon: BookOpen,
        new: true,
        group: "Brand & Compliance",
      },
      {
        id: 13,
        label: "Content Performance",
        question:
          "Use getContentAnalyticsData tool. Display key metrics in a formatted markdown table: Metric | Value (include views, engagement rate, trends). Provide a one-sentence performance insight at the top.",
        icon: TrendingUp,
        group: "Analysis & Insights",
      },
      {
        id: 9,
        label: "SEO/GEO Check",
        question:
          "Use getPageHtml to analyze SEO and AEO/GEO. Display findings in a markdown table: Issue | How to Fix | Severity (Critical/High/Medium/Low), sorted by severity. Check: meta tags, headings, semantic markup, accessibility, content structure, structured data (JSON-LD/Schema.org). End with a 2-3 sentence overall summary.",
        icon: FileText,
        expensive: true,
        group: "Analysis & Insights",
      },
      {
        id: 25,
        label: "Content Health Dashboard",
        question:
          "Get pageId from Pages Context. Perform health check: use getLanguages and checkPagePublishedToEdge for publishing status, getLanguages for translation status, getContentAnalyticsData for performance metrics. If brand review is needed, use generateBrandReviewFromContent and output the results using the BrandReview component format. Display concise dashboard: 1) Publishing (Language | Status), 2) Translations (Language | Version), 3) Performance (Views | Engagement). Keep output factual and focused on key metrics only.",
        icon: Activity,
        new: true,
        expensive: true,
        group: "Analysis & Insights",
      },
      {
        id: 28,
        label: "Content Type Analysis",
        question:
          "Get current page template from Pages Context. Use getSitePages to find all pages using this template. Use getContentAnalyticsData for each page to get analytics data. Use getPageComponents for each page to analyze component usage patterns. Display crisp factual analysis: 1) Analytics Summary (Total Pages | Avg Views | Avg Engagement | Top Performer), 2) Component Usage (Component Name | Usage Count | Usage % | Pages Using). Focus on facts and metrics only, no recommendations.",
        icon: BarChart3,
        new: true,
        group: "Analysis & Insights",
      },
      {
        id: 22,
        label: "Create Person Profile",
        question:
          "Ask user for: 1) person ID/name, 2) first name, 3) last name, 4) about me description, 5) optional image asset ID, 6) site name. Use getPersonsRoot and getPersonsTemplate to get required information, then createPerson to create the profile. After successful creation, immediately use navigatePages with the returned itemId, language, and siteName to navigate to the new person page.",
        icon: UserPlus,
        new: true,
        group: "Advanced",
      },
      {
        id: 24,
        label: "Multi-Language Content Comparison",
        question:
          "Get pageId from Pages Context. Use getLanguages to get all available languages. For each language, use getContentItemContent to get content. Display comparison in a concise markdown table: Language | Version Exists | Content Length | Key Fields Status. Identify missing translations and content gaps. Keep output factual and concise.",
        icon: Globe2,
        new: true,
        group: "Advanced",
      },
      {
        id: 26,
        label: "Bulk Component Update",
        question:
          "Get pageId from Pages Context. Ask user for multiple component updates in format: component name, field, new value. Use getPageComponents to find all components, then updateComponentContent for each update. Display update summary in a formatted markdown table: Component | Field | Old Value | New Value | Status. After all updates, refresh page using refreshPagesContext.",
        icon: Edit,
        new: true,
        group: "Advanced",
      },
      {
        id: 27,
        label: "Find Similar Pages",
        question:
          "Get current page template and pageId from Pages Context. Use getPageComponents to get components and datasources for current page. Use getSitePages to find pages with the same template. For each similar page, use getPageComponents to get components and datasources, then use getContentItemContent to compare datasource content similarity. Display similar pages in a formatted markdown table: Page Name | Path | Component Match | Datasource Similarity | Content Similarity Score. Focus on factual similarity metrics.",
        icon: FileSearch,
        new: true,
        group: "Advanced",
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
      }
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
          "Use getSitePages to retrieve product pages. Analyze and display catalog overview in a formatted markdown table: Metric | Value (Total Products, Categories, Items Needing Attention). Provide a brief summary of catalog health.",
        icon: Package,
      },
      {
        id: 3,
        label: "Top Products",
        question:
          "Use getContentAnalyticsData to identify top-performing products. Display results in a formatted markdown table: Product | Views | Engagement | Trend. Show top 10 products with a brief performance summary.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Translate Product Page",
        question:
          "Ask user for source language, target language, and strategy (AddVersion/CreateNew). Use getLanguages to verify, then translatePage. After translation, use navigatePages to navigate to the new language version.",
        icon: Globe,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then provide a concise 3-5 sentence summary covering: product purpose, key features, and overall message.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Find Product Assets",
        question:
          "Ask user for search keywords. Use searchForAssets for product images/docs, then getAssetDetails. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 results.",
        icon: Image,
      },
      {
        id: 7,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Display results in a brief markdown table: Aspect | Status | Notes. Provide a 1-2 sentence brand compliance summary.",
        icon: ShieldCheck,
      },
      {
        id: 8,
        label: "Product Page Screenshot",
        question:
          "Use getPageScreenshot to capture product page preview. Display the screenshot and provide a 2-3 sentence description of product presentation, layout, and visual elements.",
        icon: Image,
      },
      {
        id: 9,
        label: "Product Content Analysis",
        question:
          "Use getPageHtml to analyze HTML structure, semantic markup, and product information organization. Display findings in a markdown table: Aspect | Current State | Recommendation. Provide improvement recommendations prioritized by impact.",
        icon: FileText,
        expensive: true,
      },
      {
        id: 15,
        label: "Browse Product Assets",
        question:
          "Ask user for search keywords. Use searchForAssets to find matching product assets (images, documents). Use getAssetDetails for complete information. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 most relevant results.",
        icon: FolderOpen,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 16,
        label: "Generate Product Image (Beta)",
        question:
          "Ask user for: 1) product image description/prompt, 2) asset name (optional), 3) site name. Use generateImage tool to create AI-generated product image and automatically upload to Sitecore Media Library. Display uploaded asset details.",
        icon: Wand2,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 18,
        label: "List Product Page Components",
        question:
          "Get pageId from Pages Context. Use getPageComponents to retrieve all components on the product page. For each component, get the datasource using getContentItemContent with the datasource ID to retrieve its fields. Display results in a formatted markdown table: Component Name | Type | Placeholder | Datasource ID | Datasource Fields. Include summary of component structure.",
        icon: List,
        new: true,
        group: "Content Management",
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
        id: 3,
        label: "Create Page",
        question:
          "Ask user for: article title, content, subtitle, excerpt, and any required fields. Use getNewsRootPage and getNewsTemplate, then createNewsPage. After creation, use navigatePages to navigate to the new page using returned itemId, language, and siteName.",
        icon: Newspaper,
        group: "Content",
      },
      {
        id: 4,
        label: "Translate Article",
        question:
          "Ask user for source language, target language, and strategy (AddVersion/CreateNew). Use getLanguages to verify, then translatePage. After translation, use navigatePages to navigate to the new language version using itemId, targetLanguage, and siteName.",
        icon: Globe,
        group: "Content",
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then provide a concise 3-5 sentence summary covering: article purpose, key topics, and overall message.",
        icon: FileText,
        group: "Content",
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Display results in a brief markdown table: Aspect | Status | Notes. Provide a 1-2 sentence brand compliance summary.",
        icon: ShieldCheck,
        group: "Content",
      },
      {
        id: 10,
        label: "Publishing & Translation Status",
        question:
          "Use getLanguages, then for each language: checkPagePublishedToEdge for publishing status and check current page version status for translation coverage. Display results in a consolidated markdown table: Language | Published (✅/❌) | Version Exists (✅/❌) | Version Number. Include a summary showing: total languages, published count, unpublished count, translated count, missing translations count.",
        icon: CheckCircle2,
        group: "Content",
      },
      {
        id: 12,
        label: "Visual Preview",
        question:
          "Use getPageScreenshot to capture article preview. Display the screenshot and provide a 2-3 sentence description covering layout structure, typography, and visual presentation.",
        icon: Image,
        group: "Content",
      },
      {
        id: 15,
        label: "News Campaign Launch",
        question:
          "Ask user for: 1) article details (title, content, subtitle, excerpt), 2) Hero Banner promotional title, 3) Hero Banner promotional description. Use getNewsRootPage and getNewsTemplate, create article with createNewsPage. Find home page using searchPages or getPageDetails, get components with getPageComponents, find Hero Banner component, update Title/Description fields with updateComponentContent. Navigate to new article with navigatePages, then provide link to home page explaining Hero Banner update.",
        icon: Zap,
        new: true,
        group: "Content",
      },
      {
        id: 18,
        label: "List Article Page Components",
        question:
          "Get pageId from Pages Context. Use getPageComponents to retrieve all components on the article page. For each component, get the datasource using getContentItemContent with the datasource ID to retrieve its fields. Display results in a formatted markdown table: Component Name | Type | Placeholder | Datasource ID | Datasource Fields. Include summary of component structure.",
        icon: List,
        new: true,
        group: "Content",
      },
      {
        id: 7,
        label: "Find Images",
        question:
          "Ask user for search keywords. Use searchForAssets for article images/graphics, then getAssetDetails. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 results.",
        icon: Image,
        group: "Assets",
      },
      {
        id: 16,
        label: "Browse Article Assets",
        question:
          "Ask user for search keywords. Use searchForAssets to find matching article assets (images, graphics, documents). Use getAssetDetails for complete information. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 most relevant results.",
        icon: FolderOpen,
        new: true,
        group: "Assets",
      },
      {
        id: 17,
        label: "Generate Article Image (Beta)",
        question:
          "Ask user for: 1) article image description/prompt, 2) asset name (optional), 3) site name. Use generateImage tool to create AI-generated article image and automatically upload to Sitecore Media Library. Display uploaded asset details.",
        icon: Wand2,
        new: true,
        group: "Assets",
      },
      {
        id: 13,
        label: "Article Performance",
        question:
          "Use getContentAnalyticsData tool. Display key metrics in a formatted markdown table: Metric | Value (include views, engagement rate, trends). Provide a one-sentence performance insight at the top.",
        icon: TrendingUp,
        group: "Analytics",
      },
      {
        id: 1,
        label: "Articles Statistics",
        question:
          "Use getNewsRootPage, getSites, getSitePages (filter by News Root path), getLanguages, and checkPagePublishedToEdge for each article/language. Display two formatted markdown tables: 1) Overview (Metric | Count): Total Articles, Published (any language), Unpublished, All languages published, Missing versions, Percentage Published. 2) Deep Dive (Article Title | Published Languages | Missing Languages | Last Modified | Status). Include summary statistics.",
        icon: FileText,
        group: "Analytics",
      },
      {
        id: 9,
        label: "SEO/GEO Check",
        question:
          "Use getPageHtml to analyze SEO and AEO/GEO. Display findings in a markdown table: Issue | How to Fix | Severity (Critical/High/Medium/Low), sorted by severity. Check: meta tags, headings, semantic markup, accessibility, content structure, structured data (JSON-LD/Schema.org). End with a 2-3 sentence overall summary.",
        icon: FileText,
        expensive: true,
        group: "Analytics",
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
          "Use getSitePages to retrieve event pages, filter by date (next 30 days). Display results in a formatted markdown table: Event Name | Date | Registration Count | Promotion Status. Include a summary of upcoming events requiring attention.",
        icon: Calendar,
      },
      {
        id: 3,
        label: "Event Performance",
        question:
          "Use getContentAnalyticsData for recent events. Display performance metrics in a formatted markdown table: Event | Attendance Rate | Engagement | Feedback Score. Provide a brief summary of top performers and areas for improvement.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Translate Event Page",
        question:
          "Ask user for source language, target language, and strategy (AddVersion/CreateNew). Use getLanguages to verify, then translatePage. After translation, use navigatePages to navigate to the new language version.",
        icon: Globe,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then provide a concise 3-5 sentence summary covering: event purpose, key details, and overall message.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Display results in a brief markdown table: Aspect | Status | Notes. Provide a 1-2 sentence brand compliance summary.",
        icon: ShieldCheck,
      },
      {
        id: 7,
        label: "Find Event Assets",
        question:
          "Ask user for search keywords. Use searchForAssets for event photos/speaker images/promotional graphics, then getAssetDetails. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 results.",
        icon: Image,
      },
      {
        id: 8,
        label: "Event Page Screenshot",
        question:
          "Use getPageScreenshot to capture event page preview. Display the screenshot and provide a 2-3 sentence description of visual presentation, layout, and key visual elements.",
        icon: Image,
      },
      {
        id: 9,
        label: "Event HTML Analysis",
        question:
          "Use getPageHtml to analyze semantic markup, content structure, and accessibility. Display findings in a markdown table: Aspect | Current State | Recommendation. Provide prioritized improvement recommendations.",
        icon: FileText,
        expensive: true,
      },
      {
        id: 15,
        label: "Browse Event Assets",
        question:
          "Ask user for search keywords. Use searchForAssets to find matching event assets (photos, speaker images, promotional graphics). Use getAssetDetails for complete information. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL. Show up to 10 most relevant results.",
        icon: FolderOpen,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 16,
        label: "Generate Event Image (Beta)",
        question:
          "Ask user for: 1) event image description/prompt, 2) asset name (optional), 3) site name. Use generateImage tool to create AI-generated event image and automatically upload to Sitecore Media Library. Display uploaded asset details.",
        icon: Wand2,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 18,
        label: "List Event Page Components",
        question:
          "Get pageId from Pages Context. Use getPageComponents to retrieve all components on the event page. For each component, get the datasource using getContentItemContent with the datasource ID to retrieve its fields. Display results in a formatted markdown table: Component Name | Type | Placeholder | Datasource ID | Datasource Fields. Include summary of component structure.",
        icon: List,
        new: true,
        group: "Content Management",
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
          "Use getSites, getSitePages, and getContentAnalyticsData. Display comprehensive site overview in formatted markdown tables: 1) Site Structure (Site | Total Pages | Content Types), 2) Recent Activity (Content Type | Recent Changes | Status), 3) Highlights (Category | Count | Status). Include a brief summary of site health and key metrics.",
        icon: Zap,
      },
      {
        id: 3,
        label: "Content Health",
        question:
          "Use getSitePages and analyze content across types. Display health analysis in a formatted markdown table: Issue | Count | Severity | Recommendation. Check: outdated pages, missing metadata, broken links, optimization opportunities. Provide prioritized action items.",
        icon: TrendingUp,
      },
      {
        id: 4,
        label: "Translate Content",
        question:
          "Ask user for source language, target language, content type (product/news/event), and strategy (AddVersion/CreateNew). Use getLanguages to verify, then translatePage. After translation, use navigatePages to navigate to the new language version.",
        icon: Globe,
      },
      {
        id: 5,
        label: "Summarize Page",
        question:
          "Use getContentItemContent, then provide a concise 3-5 sentence summary covering: content purpose, key topics, and overall message.",
        icon: FileText,
      },
      {
        id: 6,
        label: "Brand Validation",
        question:
          "Use getContentItemContent, then generateBrandReviewFromContent. Display results in a brief markdown table: Aspect | Status | Notes. Provide a 1-2 sentence brand compliance summary.",
        icon: ShieldCheck,
      },
      {
        id: 7,
        label: "Search Media Library",
        question:
          "Ask user for search keywords. Use searchForAssets, then getAssetDetails. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL | Content Type. Show up to 15 results across all content types.",
        icon: Image,
      },
      {
        id: 8,
        label: "Visual Page Review",
        question:
          "Ask user for content types to compare (products/news/events). Use getPageScreenshot for each type. Display screenshots side-by-side with a comparison table: Content Type | Layout Consistency | Visual Elements | Notes. Provide design consistency recommendations.",
        icon: Image,
      },
      {
        id: 9,
        label: "Content Structure Analysis",
        question:
          "Use getPageHtml across specified content types (products/news/events). Display comparative analysis in a markdown table: Content Type | Structure Score | Semantic Markup | Organization | Recommendations. Provide unified improvement recommendations prioritized by impact.",
        icon: FileText,
        expensive: true,
      },
      {
        id: 10,
        label: "Browse Asset Library",
        question:
          "Ask user for search keywords. Use searchForAssets to find matching assets across all content types. Use getAssetDetails for complete information. Display results in a formatted markdown table: Name | Type | Dimensions | Size | URL | Content Type. Show up to 15 most relevant results.",
        icon: FolderOpen,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 11,
        label: "Generate & Upload Image (Beta)",
        question:
          "Ask user for: 1) image description/prompt, 2) asset name (optional), 3) site name. Use generateImage tool which will generate an AI image and automatically upload it to Sitecore Media Library. Display the uploaded asset details including ID, embed URL, size, and dimensions.",
        icon: Wand2,
        new: true,
        group: "Assets & Media",
      },
      {
        id: 13,
        label: "List Page Components",
        question:
          "Get pageId from Pages Context. Use getPageComponents to retrieve all components on the current page. For each component, get the datasource using getContentItemContent with the datasource ID to retrieve its fields. Display results in a formatted markdown table: Component Name | Type | Placeholder | Datasource ID | Datasource Fields. Include a summary showing total component count and component types.",
        icon: List,
        new: true,
        group: "Content Management",
      },
      {
        id: 14,
        label: "Component Inventory",
        question:
          "Get pageId from Pages Context. Use getPageComponents to analyze component usage. Display analysis in formatted markdown tables: 1) Component Summary (Component Name | Count | Type), 2) Component Types (Type | Count | Usage). Identify reusable vs unique components and provide optimization recommendations.",
        icon: Grid3x3,
        new: true,
        group: "Content Management",
      },
      {
        id: 15,
        label: "Explore Brand Kit",
        question:
          "Use listBrandKits to get available brand kits, then retrieveBrandKit to get details. Use listBrandKitSections to get sections, and listBrandKitSubsections for each section to explore fields. Display brand kit structure in formatted markdown tables: 1) Brand Kit Overview (Name | Description | Status), 2) Sections (Section Name | Fields Count | Purpose), 3) Fields (Field Name | Type | Value | Intent). Provide a summary of brand guidelines available.",
        icon: BookOpen,
        new: true,
        group: "Brand & Compliance",
      },
      {
        id: 17,
        label: "Create Person Profile",
        question:
          "Ask user for: 1) person ID/name, 2) first name, 3) last name, 4) about me description, 5) optional image asset ID, 6) site name. Use getPersonsRoot and getPersonsTemplate to get required information, then createPerson to create the profile. After successful creation, immediately use navigatePages with the returned itemId, language, and siteName to navigate to the new person page.",
        icon: UserPlus,
        new: true,
        group: "Advanced",
      },
      {
        id: 19,
        label: "Multi-Language Content Comparison",
        question:
          "Get pageId from Pages Context. Use getLanguages to get all available languages. For each language, use getContentItemContent to get content. Display comparison in a concise markdown table: Language | Version Exists | Content Length | Key Fields Status. Identify missing translations and content gaps. Keep output factual and concise.",
        icon: Globe2,
        new: true,
        group: "Advanced",
      },
      {
        id: 20,
        label: "Content Health Dashboard",
        question:
          "Get pageId from Pages Context. Perform health check: use getLanguages and checkPagePublishedToEdge for publishing status, getLanguages for translation status, getContentAnalyticsData for performance metrics. If brand review is needed, use generateBrandReviewFromContent and output the results using the BrandReview component format. Display concise dashboard: 1) Publishing (Language | Status), 2) Translations (Language | Version), 3) Performance (Views | Engagement). Keep output factual and focused on key metrics only.",
        icon: Activity,
        new: true,
        expensive: true,
        group: "Analysis & Insights",
      },
      {
        id: 21,
        label: "Bulk Component Update",
        question:
          "Get pageId from Pages Context. Ask user for multiple component updates in format: component name, field, new value. Use getPageComponents to find all components, then updateComponentContent for each update. Display update summary in a formatted markdown table: Component | Field | Old Value | New Value | Status. After all updates, refresh page using refreshPagesContext.",
        icon: Edit,
        new: true,
        group: "Advanced",
      },
      {
        id: 22,
        label: "Find Similar Pages",
        question:
          "Get current page template and pageId from Pages Context. Use getPageComponents to get components and datasources for current page. Use getSitePages to find pages with the same template. For each similar page, use getPageComponents to get components and datasources, then use getContentItemContent to compare datasource content similarity. Display similar pages in a formatted markdown table: Page Name | Path | Component Match | Datasource Similarity | Content Similarity Score. Focus on factual similarity metrics.",
        icon: FileSearch,
        new: true,
        group: "Advanced",
      },
      {
        id: 23,
        label: "Content Type Analysis",
        question:
          "Get current page template from Pages Context. Use getSitePages to find all pages using this template. Use getContentAnalyticsData for each page to get analytics data. Use getPageComponents for each page to analyze component usage patterns. Display crisp factual analysis: 1) Analytics Summary (Total Pages | Avg Views | Avg Engagement | Top Performer), 2) Component Usage (Component Name | Usage Count | Usage % | Pages Using). Focus on facts and metrics only, no recommendations.",
        icon: BarChart3,
        new: true,
        group: "Analysis & Insights",
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
          "Analyze the user's needs and recommend the most appropriate specialized agent. Display recommendation in a formatted markdown table: Agent | Specialization | Why Recommended | Best For. Provide a clear explanation.",
        icon: GitBranch,
      },
      {
        id: 2,
        label: "Route my query",
        question:
          "Analyze the user's query and recommend the best specialized agent. Display results in a formatted markdown table: Agent | Match Score | Capabilities | Why Recommended. Explain why it's the right choice with specific reasons.",
        icon: Search,
      },
      {
        id: 3,
        label: "List available agents",
        question:
          "List all available specialized agents in a formatted markdown table: Agent | Specialization | Key Capabilities | Use Cases. Provide a brief description for each agent.",
        icon: MessageCircle,
      },
      {
        id: 4,
        label: "Agent comparison",
        question:
          "Compare available agents for the user's task. Display comparison in a formatted markdown table: Agent | Strengths | Limitations | Best For | Recommendation. Provide a clear recommendation with reasoning.",
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
