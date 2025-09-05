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

interface CompatibilityAnalysisResponse {
  compatibilityScore: number;
  overallInsights: string[];
  emotionalConnection: string[];
  communication: string[];
  sharedValues: string[];
  challenges: string[];
  opportunities: string[];
  funFacts: string[];
}

interface SoulmateAnalysisResponse {
  idealSoulmate: string[];
  personalityTraits: string[];
  physicalCharacteristics: string[];
  meetingWindow: string[];
  howYoullMeet: string[];
  relationshipDynamics: string[];
  soulmateFacts: string[];
  timingInsights: string[];
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

  async analyzeCompatibility(
    userBirthData: BirthChartData, 
    partnerBirthData: BirthChartData, 
    userChartData?: any, 
    partnerChartData?: any
  ): Promise<CompatibilityAnalysisResponse> {
    // If no API key is configured, return a placeholder response
    if (!this.apiKey) {
      return {
        compatibilityScore: 75,
        overallInsights: ['Please configure your OpenAI API key to get AI-powered compatibility insights'],
        emotionalConnection: ['API key not configured'],
        communication: ['Please set up your OpenAI API key in the .env file'],
        sharedValues: ['Configuration required'],
        challenges: ['Set VITE_OPENAI_API_KEY in your environment variables'],
        opportunities: ['Configure API key for full functionality'],
        funFacts: ['API key needed']
      };
    }

    try {
      const prompt = this.buildCompatibilityPrompt(userBirthData, partnerBirthData, userChartData, partnerChartData);
      
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
              content: `You are a friendly astrologer who gives short, helpful compatibility readings. Use simple words everyone understands. Be warm and encouraging. Give practical advice they can use today. Keep everything short and easy to read.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
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
        throw new Error('No compatibility analysis received from OpenAI');
      }

      return this.parseCompatibilityResponse(analysis);
    } catch (error) {
      console.error('Error analyzing compatibility:', error);
      throw error;
    }
  }

  private buildCompatibilityPrompt(
    userBirthData: BirthChartData, 
    partnerBirthData: BirthChartData, 
    userChartData?: any, 
    partnerChartData?: any
  ): string {
    const basePrompt = `
Analyze the compatibility between ${userBirthData.name} and ${partnerBirthData.name} based on their birth charts.

USER BIRTH INFO:
- Name: ${userBirthData.name}
- Born: ${userBirthData.date} at ${userBirthData.time}
- Location: ${userBirthData.city}

PARTNER BIRTH INFO:
- Name: ${partnerBirthData.name}
- Born: ${partnerBirthData.date} at ${partnerBirthData.time}
- Location: ${partnerBirthData.city}

${userChartData ? `USER CHART DATA: ${JSON.stringify(userChartData, null, 2)}` : 'USER CHART DATA: Not provided'}
${partnerChartData ? `PARTNER CHART DATA: ${JSON.stringify(partnerChartData, null, 2)}` : 'PARTNER CHART DATA: Not provided'}

Respond in this exact JSON format:
{
  "compatibilityScore": 85,
  "overallInsights": ["2-3 short sentences about their overall compatibility"],
  "emotionalConnection": ["2-3 short sentences about their emotional bond"],
  "communication": ["2-3 short sentences about how they communicate"],
  "sharedValues": ["2-3 short sentences about what they have in common"],
  "challenges": ["2-3 short sentences about potential difficulties"],
  "opportunities": ["2-3 short sentences about growth areas and recommendations"],
  "funFacts": ["2-3 short, interesting facts about their astrological connection"]
}

RULES:
• Use simple words everyone understands
• Keep each point short (2-3 sentences max)
• Be warm and encouraging
• Give practical advice they can use today
• Write like talking to a friend
• Focus on what they can actually do
• Be specific to their charts, not generic
• Include both strengths and growth areas
• Make it feel personal and helpful
• Give a realistic compatibility score (0-100)
`;

    return basePrompt;
  }

  private parseCompatibilityResponse(analysis: string): CompatibilityAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          compatibilityScore: parsed.compatibilityScore || 75,
          overallInsights: parsed.overallInsights || [],
          emotionalConnection: parsed.emotionalConnection || [],
          communication: parsed.communication || [],
          sharedValues: parsed.sharedValues || [],
          challenges: parsed.challenges || [],
          opportunities: parsed.opportunities || [],
          funFacts: parsed.funFacts || []
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to text parsing:', error);
    }

    // Fallback: return a basic response
    return {
      compatibilityScore: 75,
      overallInsights: ['Compatibility analysis completed'],
      emotionalConnection: ['Emotional connection analyzed'],
      communication: ['Communication patterns reviewed'],
      sharedValues: ['Shared values identified'],
      challenges: ['Growth areas noted'],
      opportunities: ['Opportunities for improvement found'],
      funFacts: ['Interesting astrological connections discovered']
    };
  }

  async generateSoulmateDescription(
    userBirthData: BirthChartData, 
    userChartData?: any
  ): Promise<string> {
    // If no API key is configured, return a placeholder description
    if (!this.apiKey) {
      return "A warm, kind person with gentle eyes and a genuine smile, around your age, with a caring personality and good sense of humor.";
    }

    try {
      const prompt = `Based on ${userBirthData.name}'s birth chart, create a detailed physical description of their ideal soulmate for AI image generation.

BIRTH INFO:
- Name: ${userBirthData.name}
- Born: ${userBirthData.date} at ${userBirthData.time}
- Location: ${userBirthData.city}

${userChartData ? `CHART DATA: ${JSON.stringify(userChartData, null, 2)}` : 'CHART DATA: Not provided'}

Create a detailed physical description focusing on:
- Facial features and structure
- Hair color and style
- Eye color and expression
- Body type and build
- Age range
- Overall appearance and style
- Facial expression and demeanor

Keep it realistic and specific for image generation. Focus on physical characteristics that would be visible in a portrait sketch. Use "You" and "${userBirthData.name}" instead of "they" or "their" to make it personal.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating detailed physical descriptions for AI image generation. Be specific about facial features, hair, eyes, and overall appearance. Use "You" and the person\'s name instead of "they" or "their" to make it personal and direct.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "A warm, kind person with gentle eyes and a genuine smile.";
      
    } catch (error) {
      console.error('Error generating soulmate description:', error);
      return "A warm, kind person with gentle eyes and a genuine smile, around your age, with a caring personality.";
    }
  }

  async analyzeSoulmate(
    userBirthData: BirthChartData, 
    userChartData?: any
  ): Promise<SoulmateAnalysisResponse> {
    // If no API key is configured, return a placeholder response
    if (!this.apiKey) {
      return {
        idealSoulmate: ['Please configure your OpenAI API key to get AI-powered soulmate insights'],
        personalityTraits: ['API key not configured'],
        physicalCharacteristics: ['Please set up your OpenAI API key in the .env file'],
        meetingWindow: ['Configuration required'],
        howYoullMeet: ['Set VITE_OPENAI_API_KEY in your environment variables'],
        relationshipDynamics: ['Configure API key for full functionality'],
        soulmateFacts: ['API key needed'],
        timingInsights: ['Missing OpenAI configuration']
      };
    }

    try {
      const prompt = this.buildSoulmatePrompt(userBirthData, userChartData);
      
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
              content: `You are a friendly astrologer who gives short, helpful soulmate readings. Use simple words everyone understands. Be warm and encouraging. Give practical advice they can use today. Keep everything short and easy to read. Always use "You" and the person's name instead of "they" or "their" to make it personal and direct.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
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
        throw new Error('No soulmate analysis received from OpenAI');
      }

      return this.parseSoulmateResponse(analysis);
    } catch (error) {
      console.error('Error analyzing soulmate:', error);
      throw error;
    }
  }

  private buildSoulmatePrompt(
    userBirthData: BirthChartData, 
    userChartData?: any
  ): string {
    const basePrompt = `
Analyze ${userBirthData.name}'s birth chart to reveal their ideal soulmate and when they might meet.

USER BIRTH INFO:
- Name: ${userBirthData.name}
- Born: ${userBirthData.date} at ${userBirthData.time}
- Location: ${userBirthData.city}

${userChartData ? `CHART DATA: ${JSON.stringify(userChartData, null, 2)}` : 'CHART DATA: Not provided (give general soulmate insights based on birth info)'}

Respond in this exact JSON format:
{
  "idealSoulmate": ["2-3 short sentences about your ideal soulmate's overall nature"],
  "personalityTraits": ["2-3 short sentences about your soulmate's personality"],
  "physicalCharacteristics": ["2-3 short sentences about your soulmate's appearance"],
  "meetingWindow": ["2-3 short sentences about when you might meet your soulmate"],
  "howYoullMeet": ["2-3 short sentences about how you'll meet your soulmate"],
  "relationshipDynamics": ["2-3 short sentences about your relationship dynamics"],
  "soulmateFacts": ["2-3 short, interesting facts about your soulmate connection"],
  "timingInsights": ["2-3 short sentences about timing and preparation"]
}

RULES:
• Use "You" and "${userBirthData.name}" instead of "they" or "their"
• Use simple words everyone understands
• Keep each point short (2-3 sentences max)
• Be warm and encouraging
• Give practical advice you can use today
• Write like talking to a friend
• Focus on what you can actually do
• Be specific to your chart, not generic
• Include both personality and physical traits
• Make it feel personal and helpful
• Be positive and hopeful about love
`;

    return basePrompt;
  }

  private parseSoulmateResponse(analysis: string): SoulmateAnalysisResponse {
    try {
      // Try to extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          idealSoulmate: parsed.idealSoulmate || [],
          personalityTraits: parsed.personalityTraits || [],
          physicalCharacteristics: parsed.physicalCharacteristics || [],
          meetingWindow: parsed.meetingWindow || [],
          howYoullMeet: parsed.howYoullMeet || [],
          relationshipDynamics: parsed.relationshipDynamics || [],
          soulmateFacts: parsed.soulmateFacts || [],
          timingInsights: parsed.timingInsights || []
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to text parsing:', error);
    }

    // Fallback: return a basic response
    return {
      idealSoulmate: ['Soulmate analysis completed'],
      personalityTraits: ['Personality traits analyzed'],
      physicalCharacteristics: ['Physical characteristics reviewed'],
      meetingWindow: ['Meeting timing identified'],
      howYoullMeet: ['Meeting circumstances revealed'],
      relationshipDynamics: ['Relationship dynamics explored'],
      soulmateFacts: ['Interesting soulmate connections discovered'],
      timingInsights: ['Timing insights provided']
    };
  }
}

export const openAIService = new OpenAIService();
