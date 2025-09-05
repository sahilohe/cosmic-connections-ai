interface ReplicateResponse {
  id: string;
  status: string;
  output?: string[];
  error?: string;
}

export class ReplicateService {
  private apiKey: string;

  constructor() {
    // Try multiple ways to get the API key
    this.apiKey = import.meta.env.VITE_REPLICATE_API_KEY || 
                  import.meta.env.REPLICATE_API_KEY || 
                  (typeof window !== 'undefined' && (window as any).REPLICATE_API_KEY) || 
                  ''; // Fallback to actual key
    
    console.log('🔑 ReplicateService initialized with API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Not found');
    
    if (!this.apiKey || this.apiKey === 'your_replicate_api_key_here') {
      console.warn('Replicate API key not found. Please set VITE_REPLICATE_API_KEY in your .env file');
      this.apiKey = '';
    }
  }

  async generateSoulmateSketch(soulmateDescription: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Replicate API key not configured');
    }

    console.log('🎨 Starting soulmate sketch generation...');
    console.log('Description:', soulmateDescription);

    // Try multiple models for better compatibility
    const models = [
      {
        name: "Flux Sketch Model",
        version: "d592f6972aadf30aadf04272cabb1698eb80feb669cbc356e8a3610d4fb2fb39",
        input: {
          prompt: `pencil sketch portrait, ${soulmateDescription}, detailed pencil drawing, black and white, artistic, professional, high quality, realistic, facial features, expression, character study, sketch art, pencil shading, portrait drawing`,
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          num_outputs: 1
        }
      },
      {
        name: "Stable Diffusion v1.5",
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          prompt: `pencil sketch portrait, ${soulmateDescription}, detailed pencil drawing, black and white, artistic, professional, high quality, realistic, facial features, expression, character study, sketch art, pencil shading, portrait drawing`,
          width: 512,
          height: 512,
          num_inference_steps: 20,
          guidance_scale: 7.5,
          num_outputs: 1
        }
      }
    ];

    for (const model of models) {
      try {
        console.log(`🎨 Trying ${model.name} model...`);
        
        const response = await fetch('https://api.replicate.com/v1/predictions', {
          method: 'POST',
          headers: {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: model.version,
            input: model.input
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`❌ ${model.name} failed:`, response.status, response.statusText, errorData);
          continue; // Try next model
        }

        const prediction = await response.json();
        console.log(`✅ ${model.name} prediction created:`, prediction.id);
        
        const imageUrl = await this.pollForCompletion(prediction.id);
        if (imageUrl) {
          console.log(`✅ ${model.name} completed successfully!`);
          return imageUrl;
        }
      } catch (error) {
        console.error(`❌ ${model.name} error:`, error);
        continue; // Try next model
      }
    }

    // Final fallback attempt with minimal parameters
    try {
      console.log('🎨 Trying final fallback...');
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "d592f6972aadf30aadf04272cabb1698eb80feb669cbc356e8a3610d4fb2fb39",
          input: {
            prompt: `pencil sketch portrait, ${soulmateDescription}`,
            width: 512,
            height: 512,
            num_inference_steps: 10,
            guidance_scale: 5,
            num_outputs: 1
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.detail || response.statusText}`);
      }

      const prediction = await response.json();
      console.log('✅ Final fallback prediction created:', prediction.id);
      
      const imageUrl = await this.pollForCompletion(prediction.id);
      if (imageUrl) {
        console.log('✅ Final fallback completed successfully!');
        return imageUrl;
      }
    } catch (error) {
      console.error('❌ Final fallback error:', error);
    }

    throw new Error('All models failed to generate the sketch. Please try again later.');
  }

  private async pollForCompletion(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes max
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 Polling attempt ${attempt + 1}/${maxAttempts} for prediction ${predictionId}`);
        
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${this.apiKey}`,
          },
        });

        if (!response.ok) {
          console.error(`❌ Polling failed: ${response.status} ${response.statusText}`);
          throw new Error(`Polling failed: ${response.status} ${response.statusText}`);
        }

        const prediction: ReplicateResponse = await response.json();
        console.log(`📊 Prediction status: ${prediction.status}`);

        if (prediction.status === 'succeeded' && prediction.output && prediction.output.length > 0) {
          console.log('✅ Prediction succeeded!');
          return prediction.output[0];
        }

        if (prediction.status === 'failed') {
          console.error('❌ Prediction failed:', prediction.error);
          throw new Error(`Prediction failed: ${prediction.error}`);
        }

        if (prediction.status === 'canceled') {
          console.error('❌ Prediction was canceled');
          throw new Error('Prediction was canceled');
        }

        // Still processing, wait and try again
        console.log(`⏳ Still processing... waiting ${pollInterval/1000} seconds`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error(`❌ Polling error on attempt ${attempt + 1}:`, error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('Image generation timed out after 5 minutes');
  }

  // Test API key validity
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      console.error('No API key provided');
      return false;
    }

    try {
      console.log('Testing API key...');
      const response = await fetch('https://api.replicate.com/v1/account', {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });
      
      if (response.ok) {
        console.log('✅ API key is valid');
        return true;
      } else {
        console.error('❌ API key test failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('Error details:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ API key test failed with error:', error);
      return false;
    }
  }
}

export const replicateService = new ReplicateService();