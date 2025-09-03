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
              content: `You are a friendly astrologer who gives short, helpful readings. Use simple words everyone understands. Be warm and encouraging. Give practical advice they can use today. Keep everything short and easy to read.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1200,
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
Give ${birthData.name} a friendly, easy-to-read astrological reading based on their birth info.

BIRTH INFO:
- Born: ${birthData.date} at ${birthData.time}
- Location: ${birthData.city}
${birthData.coordinates ? `- Coordinates: ${birthData.coordinates.lat}°N, ${birthData.coordinates.lng}°E` : ''}

${chartData ? `CHART DATA: ${JSON.stringify(chartData, null, 2)}` : 'CHART DATA: Not provided (give general insights based on birth info)'}

Respond in this exact JSON format:
{
  "insights": ["2-3 short, friendly sentences about their overall personality"],
  "personalityTraits": ["2-3 short sentences about their natural behaviors and character"],
  "personalLife": ["2-3 short sentences about their relationships and emotional nature"],
  "workLife": ["2-3 short sentences about their career path and work style"],
  "lifePath": ["2-3 short sentences about their life journey and purpose"],
  "relationships": ["2-3 short sentences about how they connect with others"],
  "challenges": ["2-3 short sentences about potential difficulties and solutions"],
  "opportunities": ["2-3 short sentences about growth areas and improvements"]
}

RULES:
• Use simple words everyone understands
• Keep each point short (2-3 sentences max)
• Be warm and encouraging
• Give practical advice they can use today
• Write like talking to a friend
• Focus on what they can actually do
• Be specific to them, not generic
• Include both strengths and growth areas
• Make it feel personal and helpful
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
