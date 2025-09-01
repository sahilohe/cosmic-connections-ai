# Cosmic Connections AI - Swiss Ephemeris Backend

This backend provides accurate astrological calculations using Swiss Ephemeris, the industry standard for astronomical calculations.

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Installation & Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Run the startup script:**
   ```bash
   ./start.sh
   ```

   This script will:
   - Check Python installation
   - Create a virtual environment
   - Install all dependencies
   - Start the FastAPI server

### Manual Setup (Alternative)

If you prefer manual setup:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

## 🌟 Features

- **Accurate Planetary Positions** - Using Swiss Ephemeris library
- **House Calculations** - Placidus house system
- **Aspect Calculations** - Major aspects with orbs
- **Retrograde Detection** - Automatic retrograde planet identification
- **RESTful API** - Easy integration with frontend

## 📡 API Endpoints

### POST `/api/birth-chart`
Calculate a complete birth chart.

**Request Body:**
```json
{
  "name": "John Doe",
  "date": "1990-05-15",
  "time": "14:30:00",
  "city": "New York",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  }
}
```

**Response:**
```json
{
  "ascendant": {
    "longitude": 123.456,
    "sign": "Leo",
    "degreeInSign": 3.46
  },
  "midheaven": {
    "longitude": 234.567,
    "sign": "Scorpio",
    "degreeInSign": 24.57
  },
  "planets": [...],
  "houses": [...],
  "aspects": [...],
  "metadata": {...}
}
```

### GET `/api/health`
Health check endpoint.

## 🔧 Configuration

The backend runs on `http://localhost:8000` by default.

To change the port or host, modify the last line in `main.py`:
```python
uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 📊 Swiss Ephemeris Accuracy

This backend uses Swiss Ephemeris, which provides:
- **High Precision** - Sub-arcsecond accuracy
- **Wide Date Range** - 13201 BCE to 17191 CE
- **Industry Standard** - Used by professional astrologers worldwide
- **Comprehensive Data** - Planets, asteroids, fixed stars, and more

## 🛠️ Development

### Adding New Features

1. **New Endpoints** - Add to `main.py`
2. **New Calculations** - Create helper functions
3. **Data Models** - Add Pydantic models

### Testing

Test the API with curl:
```bash
curl -X POST "http://localhost:8000/api/birth-chart" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "date": "1990-01-01",
    "time": "12:00:00",
    "city": "New York",
    "coordinates": {"lat": 40.7128, "lng": -74.0060}
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Change port in `main.py`
   - Or kill existing process: `lsof -ti:8000 | xargs kill`

2. **Swiss Ephemeris Not Found**
   - Ensure `swisseph` is installed: `pip install swisseph`
   - Check ephemeris files are available

3. **CORS Errors**
   - Frontend origin is configured in `main.py`
   - Add your frontend URL to `allow_origins`

### Logs

Check the console output for detailed error messages and debugging information.

## 📚 Dependencies

- **FastAPI** - Modern web framework
- **Swiss Ephemeris** - Astronomical calculations
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **python-dateutil** - Date parsing

## 🔗 Integration with Frontend

The frontend is configured to call this backend at `http://localhost:8000`.

To change the backend URL, update the frontend's `.env` file:
```env
VITE_BACKEND_URL=http://your-backend-url:port
```
