interface BirthChartData {
  name: string;
  date: string;
  time: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  chartData?: any; // Will contain the actual birth chart calculations
}

interface AIAnalysisResponse {
  insights: string[];
  personalityTraits: string[];
  personalLife: string[];
  workLife: string[];
  lifePath: string[];
  relationships: string[];
  challenges: string[];
  opportunities: string[];
}

export class OpenAIService {
  private apiKey: string;
  private orgId?: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    const orgId = import.meta.env.VITE_OPENAI_ORG_ID;
    
    // Don't throw error if API key is missing, just log a warning
    if (!this.apiKey || this.apiKey === 'your_actual_openai_api_key_here') {
      console.warn('OpenAI API key not found or not configured. Please set VITE_OPENAI_API_KEY in your .env file');
      this.apiKey = '';
    }
    
    // Only set orgId if it's provided, not empty, and not a placeholder
    if (orgId && orgId.trim() !== '' && !orgId.includes('your_openai_org_id_here')) {
      this.orgId = orgId.trim();
    } else {
      this.orgId = undefined;
    }
  }

  async analyzeBirthChart(birthData: BirthChartData, chartData?: any): Promise<AIAnalysisResponse> {
    // If no API key is configured, return a placeholder response
    if (!this.apiKey) {
      return {
        insights: ['Please configure your OpenAI API key to get AI-powered insights'],
        personalityTraits: ['API key not configured'],
        personalLife: ['Please set up your OpenAI API key in the .env file'],
        workLife: ['Configuration required'],
        lifePath: ['Set VITE_OPENAI_API_KEY in your environment variables'],
        relationships: ['API key needed'],
        challenges: ['Missing OpenAI configuration'],
        opportunities: ['Configure API key for full functionality']
      };
    }

    try {
      const prompt = this.buildAnalysisPrompt(birthData, chartData);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      };
      
      // Only add organization header if we have a valid org ID
      if (this.orgId) {
        headers['OpenAI-Organization'] = this.orgId;
      }
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are a friendly astrologer who helps people understand themselves better. Use simple, everyday words that anyone can understand. 
              Avoid fancy or complicated terms. Be warm, encouraging, and helpful. Focus on practical advice that people can actually use in their daily lives. 
              Make everything easy to read and understand.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const analysis = data.choices[0]?.message?.content;
      
      if (!analysis) {
        throw new Error('No analysis received from OpenAI');
      }

      return this.parseAnalysisResponse(analysis);
    } catch (error) {
      console.error('Error analyzing birth chart:', error);
      throw error;
    }
  }

  private buildAnalysisPrompt(birthData: BirthChartData, chartData?: any): string {
    const basePrompt = `
Please look at this person's birth information and give them helpful, easy-to-understand insights about themselves.

BIRTH INFORMATION:
- Name: ${birthData.name}
- Date: ${birthData.date}
- Time: ${birthData.time}
- Location: ${birthData.city}
${birthData.coordinates ? `- Coordinates: ${birthData.coordinates.lat}°N, ${birthData.coordinates.lng}°E` : ''}

${chartData ? `CHART DATA: ${JSON.stringify(chartData, null, 2)}` : 'CHART DATA: Not provided (please provide general astrological insights based on birth information)'}

Please give your analysis in this exact format:
{
  "insights": ["3-4 detailed paragraphs about this person's overall personality and life approach"],
  "personalityTraits": ["3-4 detailed paragraphs about their natural behaviors, thinking patterns, and character"],
  "personalLife": ["3-4 detailed paragraphs about their personal relationships, family life, and emotional nature"],
  "workLife": ["3-4 detailed paragraphs about their career path, work style, and professional talents"],
  "lifePath": ["3-4 detailed paragraphs about their life journey, purpose, and spiritual growth"],
  "relationships": ["3-4 detailed paragraphs about how they connect with others, love style, and social nature"],
  "challenges": ["3-4 detailed paragraphs about potential difficulties and how to work through them"],
  "opportunities": ["3-4 detailed paragraphs about growth areas and ways to improve their life"]
}

IMPORTANT INSTRUCTIONS:
- Use simple, everyday words that anyone can understand
- Avoid fancy or complicated astrology terms
- Be warm, encouraging, and positive
- Give practical advice they can actually use
- Make each bullet point a detailed paragraph (3-4 sentences each)
- Write like you're talking to a friend, not a textbook
- Focus on actionable insights they can use in their daily life
- Be specific and personal, not generic
- Include both strengths and areas for growth
- Make it feel like a personal reading just for them
`;

    return basePrompt;
  }

  private parseAnalysisResponse(analysis: string): AIAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          insights: parsed.insights || [],
          personalityTraits: parsed.personalityTraits || [],
          personalLife: parsed.personalLife || [],
          workLife: parsed.workLife || [],
          lifePath: parsed.lifePath || [],
          relationships: parsed.relationships || [],
          challenges: parsed.challenges || [],
          opportunities: parsed.opportunities || []
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to text parsing:', error);
    }

    // Fallback: parse the text response manually
    return this.fallbackTextParsing(analysis);
  }

  private fallbackTextParsing(analysis: string): AIAnalysisResponse {
    const lines = analysis.split('\n').filter(line => line.trim());
    
    return {
      insights: lines.slice(0, 5).map(line => line.replace(/^[-•*]\s*/, '')),
      personalityTraits: [],
      personalLife: [],
      workLife: [],
      lifePath: [],
      relationships: [],
      challenges: [],
      opportunities: []
    };
  }
}

export const openAIService = new OpenAIService();
