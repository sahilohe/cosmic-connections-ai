// Simple test script to verify Replicate API key
const testReplicateApi = async () => {
  const apiKey = process.env.VITE_REPLICATE_API_KEY || 'your_replicate_api_key_here';
  
  console.log('Testing Replicate API...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set');
  
  if (!apiKey || apiKey === 'your_replicate_api_key_here') {
    console.error('❌ API key not configured');
    console.log('Please set VITE_REPLICATE_API_KEY in your .env file');
    return;
  }
  
  if (!apiKey.startsWith('r8_')) {
    console.error('❌ Invalid API key format');
    console.log('API key should start with "r8_"');
    return;
  }
  
  try {
    const response = await fetch('https://api.replicate.com/v1/account', {
      headers: {
        'Authorization': `Token ${apiKey}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid');
      console.log('Account:', data.username || 'Unknown');
    } else {
      console.error('❌ API key is invalid');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
};

testReplicateApi();
