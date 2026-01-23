# Sistema Calliandra

Módulo de workflow com anotação semântica em Django. Implementação da [Knowledge Intensive Ontology](https://www.researchgate.net/publication/282939286_KIPO_the_knowledge-intensive_process_ontology) com [Ontologia de Scrum](https://www.researchgate.net/publication/260480541_Integration_of_classical_and_agile_project_management_methodologies_based_on_ontological_models) em caso de estudo. Usando [owlready2](https://owlready2.readthedocs.io/en/v0.37/#).

Feito como parte de Projeto de Conclusão de Curso por Guilherme Braga Pinto. 

**Recursos:**
- [Minha apresentação](https://www.youtube.com/watch?v=bHcpC9uw4fE)
- [Demo](https://youtu.be/rF9q-QBYfUI)
- [Mostra de como usar o sistema](https://youtu.be/z_WLy9MxVFA)

## Quickstart - Rodar Localmente

### 1. Clonar e Navegar ao Projeto
```bash
git clone https://github.com/GustavoEinstein/CAPS4IAGE.git
cd CAPS4IAGE
```

### 2. Setup Backend (Python/Django)

**IMPORTANTE: Execute os comandos separadamente (não em uma única linha)**

```bash
# Criar ambiente virtual
python3 -m venv venv

# Ativar o ambiente virtual
## Linux/Mac/WSL:
source venv/bin/activate

## Command Prompt (cmd.exe):
venv\Scripts\activate.bat
## PowerShell:
venv\Scripts\Activate.ps1
## Git Bash or other Unix-like shells on Windows:
source venv/Scripts/activate

# Windows (PowerShell):
# venv\Scripts\Activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações do banco de dados
python3 manage.py migrate

# Rodar servidor Django (Terminal 1)
python3 manage.py runserver
```

Backend estará disponível em: **http://127.0.0.1:8000**

### 3. Setup Frontend (React/Vite)

**Em um terminal separado:**

```bash
cd frontend-comunidade

# Instalar dependências Node.js
npm install

# Rodar servidor de desenvolvimento (Terminal 2)
npm run dev
```

Frontend estará disponível em: **http://localhost:5173**

## Usuário de Teste

- **Username:** `mcgil`
- **Senha:** `musgo123`

## Troubleshooting

### WSL (Windows Subsystem for Linux)

Se receber erros ao criar o venv, instale primeiro:
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv nodejs npm -y
```

### Resetar Ambiente Virtual

Se o venv ficar corrompido:
```bash
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Erro de Permissão no Script

```bash
chmod +x dependencias.sh
```

## Desenvolvimento - Comandos Úteis

### Backend

```bash
# Criar novas migrações após alterações em models
python3 manage.py makemigrations

# Aplicar migrações
python3 manage.py migrate

# Atualizar arquivo de dependências Python
pip freeze > requirements.txt
```

### Frontend

```bash
# Certifique-se de estar em frontend-comunidade e tenha rodado npm install
cd frontend-comunidade
npm install          

# Build para produção
npm run build

# Lint do código
npm run lint

# Preview da build
npm run preview
```

## Alterações para rodar no Servidor

Rodando com comando:

> python3 manage.py runserver 0.0.0.0:8081

### Mudar os hrefs

Os hrefs foram de href="/kipo_playground/" para href="app1/kipo_playground/". 

### settings.py

````

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'kipo_playground/staticfiles')
]

````

### views.py

````

  # No final do documento
  #-----------------------------------------------

  def show_styles_css(request):
      with open('staticfiles/css/styles.css', 'r') as f:
          data = f.read()

      response = HttpResponse(data, content_type='text/css') 
      response['Content-Disposition'] = 'attachment; filename=styles.css'
      return response

  def show_scripts_js(request):
      with open('staticfiles/js/scripts.js', 'r') as f:
          data = f.read()

      response = HttpResponse(data, content_type='text/javascript')
      response['Content-Disposition'] = 'attachment; filename=scripts.js'
      return response

  def show_ckeditor_int(request):
       with open('staticfiles/ckeditor/ckeditor-init.js', 'r') as f:
          data = f.read()

       response = HttpResponse(data, content_type='text/javascript')
       response['Content-Disposition'] = 'attachment; filename=ckeditor-init.js'
       return response

  def show_ckeditor(request):
       with open('staticfiles/ckeditor/ckeditor/ckeditor.js', 'r') as f:
          data = f.read()

       response = HttpResponse(data, content_type='text/javascript')
       response['Content-Disposition'] = 'attachment; filename=ckeditor.js'
       return response

    # Imagens

  def show_scrum_img(request):
       img = open('staticfiles/assets/scrum_img.png', 'rb')

       response = FileResponse(img)
       return response

  def show_img0132(request):
       img = open('staticfiles/assets/!IMG_0132.jpg', 'rb')

       response = FileResponse(img)
       return response

  def show_img0140(request):
       img = open('staticfiles/assets/IMG_0140.jpg', 'rb')

       response = FileResponse(img)
       return response
      
  #-----------------------------------------------

````

### urls.py

````

  # para rodar no servidor (alguns assets)
  path('static/css/styles.css', views.show_styles_css),
  path('static/js/scripts.js', views.show_scripts_js),
  #path('static/ckeditor/ckeditor/ckeditor.js', views.show_ckeditor),
  #path('static/ckeditor/ckeditor-init.js', views.show_ckeditor_init),

  path('static/assets/scrum_img.png', views.show_scrum_img),
  path('static/assets/!IMG_0132.jpg', views.show_img0132),
  path('static/assets/IMG_0140.jpg', views.show_img0140),


````

## Content Mapping do Sistema Calliandra

![Img](https://github.com/gui1080/TCC_ProjetoCalliandra/blob/master/Midia%20Externa/content_mapping.png)

## Sobre

A Calliandra (*Calliandra dysantha Benth*) é típicamente conhecida como a flor símbolo do Cerrado, de flores vermelhas e delicadas. Ela tem uso medicinal popular, é uma planta amplamente usada para paisagismo. O Cerrado é reconhecido como a savana com maior biodiversidade do mundo, apesar de muitas espécies estarem ameaçadas de extinção.

