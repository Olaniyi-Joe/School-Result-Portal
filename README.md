# Result Portal

A comprehensive school result management system built with Django REST Framework and React. This application allows schools to manage and generate student results efficiently.

## Features

- Student result management and generation
- Comprehensive grading system
- Affective and Psychomotor domain assessments
- Advanced student search functionality
- Session and term management
- Printable result sheets
- School profile management (logo, stamps, signatures)

## Technology Stack

### Backend
- Python 3.10+
- Django 
- Django REST Framework
- SQLite3 Database
- Media file handling for images

### Frontend
- React 
- Vite
- Tailwind CSS
- Axios for API communication
- React Toastify for notifications

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.10 or higher
- Node.js 14.0 or higher
- npm or yarn

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On Linux/Mac:
     ```bash
     source venv/bin/activate
     ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the Django development server:
   ```bash
   python manage.py runserver
   ```

The backend will be available at http://127.0.0.1:8000/

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend/result-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at http://localhost:5173/

## Usage

1. Access the Django admin panel at http://127.0.0.1:8000/admin
2. Log in with your superuser credentials
3. Set up your school profile, including logo, stamps, and signatures
4. Add students, classes, subjects, and other necessary data
5. Access the frontend application to manage and generate results

## API Documentation

The API endpoints are available at:
- API Root: http://127.0.0.1:8000/api/
- Students: http://127.0.0.1:8000/api/students/
- Sessions: http://127.0.0.1:8000/api/sessions/
- School Profile: http://127.0.0.1:8000/api/school/
- Scores: http://127.0.0.1:8000/api/scores/
- And more...

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.