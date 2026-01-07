# CAPS4IAGE Copilot Instructions

## Project Overview

**CAPS4IAGE** (Sistema Calliandra) is a Django-based workflow management system with semantic annotation, implementing the Knowledge Intensive Process Ontology (KIPO) and Scrum ontologies. It combines a Django backend with a React frontend to manage projects, sprints, backlog items, and journalistic articles.

### Key Technology Stack
- **Backend**: Django 4.1.4, Python 3.x, owlready2 (ontology management)
- **Frontend**: React 19, Vite 7.2, React Router DOM 7.11
- **Database**: SQLite (db.sqlite3, backup.db)
- **APIs**: Django REST Framework with JWT authentication
- **Rich Text**: CKEditor integration for content editing
- **Authentication**: Django's built-in auth + JWT tokens

## Critical Architecture Patterns

### 1. Ontology-First Data Model
The system doesn't just use Django ORM—it manages instances through **owlready2**, a Python library for OWL (Web Ontology Language). Key points:
- **Ontology file**: `kipo_playground/kipo_fialho.owl` (merged KIPO + Scrum ontologies)
- **Persistent DB**: `backup.db` stores ontology instances
- Data flows: Django views → owlready2 → OWL ontology → backup.db
- Critical function `transforma_objeto()` converts ontology instances to dicts for templates

### 2. View-Model-Form Separation
- **Models** (`models.py`): Defines Django models for MateriaJornalistica (articles), backlog items, and effort definitions
- **Forms** (`forms.py`): ModelForm instances for user input
- **Views** (`views.py`): Large module (2890 lines) handling template rendering, ontology access, and business logic
- Views use `@login_required` decorator for protected routes

### 3. Template-Driven Frontend Rendering
- Django templates in `kipo_playground/templates/` are primary UI layer
- Static assets (CSS/JS) in `kipo_playground/static/`
- React frontend (`frontend-comunidade/`) is separate, handles login via JWT
- Two frontend approaches coexist: Django templates + React SPA component

## Important Conventions & Patterns

### ID Generation (`faz_id()` function)
```python
# Generate 4-character unique IDs from strings
resultado_id = str(abs(hash(input_str)) % (10 ** 4))
# Pads to 4 chars (e.g., "1234", "0123", "0012", "0001")
```
Used throughout for creating unique ontology instance identifiers.

### Ontology Access Pattern
```python
myworld = World(filename='backup.db', exclusive=False)
onto_path.append(os.path.dirname(__file__))
kiposcrum = myworld.get_ontology(os.path.dirname(__file__) + '/kipo_fialho.owl').load()
# Access classes: kiposcrum["Product_Backlog"]
# Create instances: kiposcrum["Product_Backlog"]("instance_id")
myworld.close()
```
Always use context managers where possible; `backup.db` must be closed after saves.

### Choice Fields Pattern
Models use tuple definitions:
```python
OPCOES = (('Política', 'Política'), ('Esportes', 'Esportes'), ...)
main_keyword = models.CharField(max_length=255, null=False, choices=OPCOES)
```

### CKEditor Integration
Rich text fields use `RichTextField(config_name='awesome_ckeditor')` with config in settings.
Upload path: `/kipo_playground/uploads/`

## Critical Workflows

### Development Server
```bash
# Backend
python3 manage.py runserver  # Django runs on http://127.0.0.1:8000

# Frontend (in frontend-comunidade/)
npm install
npm run dev  # Vite dev server, typically http://localhost:5173
```

### Authentication Flow
1. React Login component posts credentials to `/kipo_playground/api/token/`
2. JWT tokens returned → stored in localStorage
3. Subsequent requests include Bearer token in Authorization header
4. Backend validates with `rest_framework_simplejwt`

### Database Initialization
- First-time visit to `welcome/` view auto-creates `backup.db` if missing
- Creates default `Product_Backlog` instance: `backlog_do_sistema1234`
- Backup files: `kiposcrum_backup.db-journal` for transaction logs

## Key Files & Their Roles

| File | Purpose |
|------|---------|
| [kipo_playground/views.py](kipo_playground/views.py) | Main business logic; ontology CRUD, template context |
| [kipo_playground/models.py](kipo_playground/models.py) | Django ORM models: MateriaJornalistica, backlog items |
| [kipo_playground/urls.py](kipo_playground/urls.py) | URL routing to views; ~113 endpoints |
| [kipo_playground/forms.py](kipo_playground/forms.py) | ModelForms for user input |
| [kipo_playground/kipo_fialho.owl](kipo_playground/kipo_fialho.owl) | OWL ontology definition (KIPO + Scrum) |
| [TCC_DjangoScrumKipo/settings.py](TCC_DjangoScrumKipo/settings.py) | Django config; CORS, CKEDITOR, installed apps |
| [frontend-comunidade/src/App.jsx](frontend-comunidade/src/App.jsx) | React entry; routing setup |
| [frontend-comunidade/src/Login.jsx](frontend-comunidade/src/Login.jsx) | JWT login component, axios POST to `/api/token/` |

## Common Pitfalls to Avoid

1. **Ontology State**: `backup.db` can be locked if not properly closed. Always use try-finally blocks.
2. **CORS**: Frontend runs on `:5173`, backend on `:8000`. CORS origins hardcoded in settings—update if ports change.
3. **Static Files**: Use `python3 manage.py collectstatic` before production; staticfiles symlinked in project root.
4. **ID Collisions**: `faz_id()` uses hash-based generation; test for uniqueness in large datasets.
5. **Template Context**: Ontology objects must be converted via `transforma_objeto()` to render correctly in Django templates.

## Development Checklist

- [ ] Virtual environment: `python3 -m venv venv && source venv/bin/activate`
- [ ] Dependencies: `pip install -r requirements.txt`
- [ ] Django DB migrations: `python3 manage.py migrate`
- [ ] Test users: Username `mcgil`, password `musgo123`
- [ ] Frontend dependencies: `cd frontend-comunidade && npm install`
- [ ] Run both servers (separate terminals):
  - `python3 manage.py runserver` (backend)
  - `npm run dev` (frontend)
- [ ] Access backend at `http://127.0.0.1:8000`, frontend at `http://localhost:5173`

## References

- KIPO Ontology: https://www.researchgate.net/publication/282939286_KIPO_the_knowledge-intensive_process_ontology
- Scrum Ontology: https://www.researchgate.net/publication/260480541_Integration_of_classical_and_agile_project_management_methodologies_based_on_ontological_models
- owlready2 Docs: https://owlready2.readthedocs.io/
- Django 4.1 Docs: https://docs.djangoproject.com/en/4.1/
- Django REST Framework: https://www.django-rest-framework.org/
