import { Tool, tool } from "ai";
import z from "zod";

export function getPageAnalyticsDataTool(): Tool {
  return tool({
    description: "Get content analytics data for the last 30 days including daily visit counts and visitor counts",
    inputSchema: z.object({}),
    outputSchema: z.object({
      data: z.array(
        z.object({
          Day: z.string().describe("Date in ISO format (YYYY-MM-DD)"),
          "Number Visits": z.number().describe("Number of visits (page views) for that day"),
          "Number Visitors": z.number().describe("Number of unique visitors for that day"),
        })
      ),
    }),
    execute: async () => {
      // Generate dummy data for the last 30 days
      const data = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Format date as YYYY-MM-DD
        const dayStr = date.toISOString().split('T')[0];
        
        // Generate random number of visits between 50 and 500
        const visits = Math.floor(Math.random() * (500 - 50 + 1)) + 50;
        
        // Generate visitors - fewer visitors but more visits per visitor
        // Visitors should be much less than visits (typically 15-30% of visits)
        // This shows that each visitor has multiple visits/views
        const visitorRatio = 0.15 + Math.random() * 0.15; // Random ratio between 0.15 and 0.3
        const visitors = Math.floor(visits * visitorRatio);
        
        data.push({
          Day: dayStr,
          "Number Visits": visits,
          "Number Visitors": visitors,
        });
      }
      
      return {
        data,
      };
    },
  });
}