# Cosmic Connections AI - Setup Guide

This guide will help you set up the required API keys to use the Google Places API for birth location coordinates and OpenAI API for AI-powered astrological insights.

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Google Cloud Platform account
- OpenAI API account

## Step 1: Google Places API Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing for your project

### 1.2 Enable Required APIs
1. Go to the [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for and enable these APIs:
   - **Places API**
   - **Maps JavaScript API**
   - **Geocoding API**

### 1.3 Create API Key
1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. **Important**: Restrict the API key to only the enabled APIs for security

### 1.4 Restrict API Key (Recommended)
1. Click on your API key to edit it
2. Under "Application restrictions", select "HTTP referrers (web sites)"
3. Add your domain (e.g., `localhost:8080/*` for development)
4. Under "API restrictions", select "Restrict key" and choose the APIs you enabled

## Step 2: OpenAI API Setup

### 2.1 Create OpenAI Account
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)

### 2.2 Generate API Key
1. Click "Create new secret key"
2. Give it a descriptive name (e.g., "Cosmic Connections AI")
3. Copy the generated API key immediately (you won't see it again)

### 2.3 Check Credits
1. Go to [Usage](https://platform.openai.com/usage) to check your account balance
2. Ensure you have sufficient credits for API calls
3. Note: GPT-4 calls cost more than GPT-3.5-turbo

## Step 3: Environment Configuration

### 3.1 Create Environment File
1. Copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

### 3.2 Add Your API Keys
Edit the `.env` file in the root directory and replace the placeholder values:

```env
# ===========================================
# EigenSage AI - Environment Variables
# ===========================================

# Google Places API Key
VITE_GOOGLE_PLACES_API_KEY=your_actual_google_api_key_here

# Replicate API Key for image generation
VITE_REPLICATE_API_KEY=your_actual_replicate_api_key_here

# OpenAI API Key
VITE_OPENAI_API_KEY=your_actual_openai_api_key_here

# Optional: OpenAI Organization ID (if you have one)
VITE_OPENAI_ORG_ID=your_openai_org_id_here

# Backend API URL
VITE_BACKEND_URL=http://localhost:8000
```

**Important**: Never commit your `.env` file to version control!

## Step 4: Install Dependencies

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

## Step 5: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Step 6: Test the Integration

1. **Test Google Places API**:
   - Go to the Solo Birth Chart page
   - Try searching for a city in the birth location field
   - You should see autocomplete suggestions
   - Selecting a city should populate coordinates

2. **Test OpenAI API**:
   - Fill in birth details including location
   - Generate a birth chart
   - Click "Generate Analysis" to test AI insights
   - Check the browser console for any API errors

## Troubleshooting

### Google Places API Issues
- **"API key not valid"**: Check that your API key is correct and not restricted
- **"Quota exceeded"**: Check your Google Cloud billing and quotas
- **"API not enabled"**: Ensure Places API and Maps JavaScript API are enabled

### OpenAI API Issues
- **"Invalid API key"**: Verify your OpenAI API key is correct
- **"Insufficient credits"**: Check your OpenAI account balance
- **"Rate limit exceeded"**: Wait a moment and try again

### General Issues
- **Environment variables not loading**: Restart your development server after creating `.env`
- **CORS errors**: Ensure your API keys have proper restrictions set
- **Network errors**: Check your internet connection and firewall settings

## Security Notes

1. **Never expose API keys in client-side code** (the current setup is for development only)
2. **Use environment variables** for all sensitive configuration
3. **Restrict API keys** to only necessary APIs and domains
4. **Monitor API usage** to prevent unexpected charges
5. **Consider using a backend proxy** for production applications

## Production Considerations

For production deployment, consider:
- Moving API calls to a backend server
- Implementing rate limiting and caching
- Adding user authentication and API key management
- Using environment-specific configuration files
- Implementing proper error handling and logging

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API keys are correct
3. Ensure all required APIs are enabled
4. Check your account quotas and billing status
5. Review the troubleshooting section above

## API Usage Costs

- **Google Places API**: Free tier includes $200 monthly credit
- **OpenAI API**: Pay-per-use pricing (check [OpenAI Pricing](https://openai.com/pricing))
- **Monitor usage** to avoid unexpected charges
