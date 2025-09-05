// Test script to verify Replicate API key
import dotenv from 'dotenv';
dotenv.config();

const testApiKey = async () => {
  // Get API key from environment or prompt user
  const apiKey = process.env.VITE_REPLICATE_API_KEY || 'your_replicate_api_key_here';
  
  console.log('🔑 Testing Replicate API Key...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set');
  
  if (!apiKey || apiKey === 'your_replicate_api_key_here') {
    console.error('❌ API key not configured');
    console.log('Please set VITE_REPLICATE_API_KEY in your .env file');
    console.log('Example: VITE_REPLICATE_API_KEY=r8_your_actual_key_here');
    return;
  }
  
  try {
    // Test account endpoint
    console.log('📡 Testing account endpoint...');
    const accountResponse = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('✅ Account API key is valid');
      console.log('Username:', accountData.username || 'Unknown');
    } else {
      console.error('❌ Account API key test failed');
      console.log('Status:', accountResponse.status);
      const errorData = await accountResponse.json();
      console.log('Error:', errorData);
    }
    
    // Test models endpoint
    console.log('📡 Testing models endpoint...');
    const modelsResponse = await fetch('https://api.replicate.com/v1/models', {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });
    
    if (modelsResponse.ok) {
      console.log('✅ Models API key is valid');
    } else {
      console.error('❌ Models API key test failed');
      console.log('Status:', modelsResponse.status);
    }
    
    // Test a simple prediction
    console.log('📡 Testing prediction creation...');
    const predictionResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "d592f6972aadf30aadf04272cabb1698eb80feb669cbc356e8a3610d4fb2fb39",
        input: {
          prompt: "test pencil sketch",
          width: 512,
          height: 512,
          num_inference_steps: 5,
          guidance_scale: 5,
          num_outputs: 1
        }
      })
    });
    
    if (predictionResponse.ok) {
      const predictionData = await predictionResponse.json();
      console.log('✅ Prediction creation successful');
      console.log('Prediction ID:', predictionData.id);
    } else {
      console.error('❌ Prediction creation failed');
      console.log('Status:', predictionResponse.status);
      const errorData = await predictionResponse.json();
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testApiKey();
