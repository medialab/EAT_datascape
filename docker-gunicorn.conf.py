import os
import gunicorn
gunicorn.SERVER_SOFTWARE = 'gunicorn'

bind = "0.0.0.0:8000"
workers = 1

for k,v in os.environ.items():
    if k.startswith("GUNICORN_"):
        key = k.split('_', 1)[1].lower()
        locals()[key] = v
