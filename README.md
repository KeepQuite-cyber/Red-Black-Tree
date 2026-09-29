# Red-Black Tree Visualizer

A beautiful Django + JavaScript project that visualizes Red-Black Tree insertion step-by-step with:

- animated node insertion
- parent/uncle/grandparent highlighting
- recoloring animations
- left/right rotation animations
- step descriptions
- Previous / Next / Play / Pause controls
- random input generator
- interactive timeline
- neon glassmorphism UI
- tree validation indicators

## Run locally

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Open:

http://127.0.0.1:8000/

## Example input

```text
41, 38, 31, 12, 19, 8
```
