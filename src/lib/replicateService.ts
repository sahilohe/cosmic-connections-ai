export class ReplicateService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  async generateSoulmateSketch(soulmateDescription: string): Promise<string> {
    try {
      const response = await fetch(`${this.backendUrl}/api/generate-soulmate-sketch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          soulmate_description: soulmateDescription
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Backend API Error: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.image_url) {
        return result.image_url;
      } else {
        throw new Error('No image URL returned from backend');
      }
    } catch (error) {
      throw new Error(`Failed to generate sketch: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test API key validity (now tests backend connectivity)
  async testApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/api/health`, {
        method: 'GET',
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const replicateService = new ReplicateService();