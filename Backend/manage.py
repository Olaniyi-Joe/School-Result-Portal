#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import socket

def get_local_ip():
    try:
        # Create a socket to detect the local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"  # Fallback to localhost

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'result.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    local_ip = get_local_ip()
    print(f"Detected local IP: {local_ip}")

    # Update the .env file dynamically
    env_file_path = "/home/olaniyi/Documents/School-Result-Portal/Frontend/result-portal/.env"
    with open(env_file_path, "w") as env_file:
        env_file.write(f"VITE_API_BASE_URL=http://{local_ip}:8000/api/\n")

    # Run the server with the detected IP
    execute_from_command_line(["manage.py", "runserver", f"{local_ip}:8000"])

if __name__ == '__main__':
    main()
