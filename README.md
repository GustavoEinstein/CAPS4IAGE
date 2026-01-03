# Sistema Calliandra

Módulo de workflow com anotação semântica em Django. Implementação da [Knowledge Intensive Ontology](https://www.researchgate.net/publication/282939286_KIPO_the_knowledge-intensive_process_ontology) com [Ontologia de Scrum](https://www.researchgate.net/publication/260480541_Integration_of_classical_and_agile_project_management_methodologies_based_on_ontological_models) em caso de estudo. Usando [owl2ready](https://owlready2.readthedocs.io/en/v0.37/#).

Feito como parte de Projeto de Conclusão de Curso por Guilherme Braga Pinto. 

[Minha apresentação.](https://www.youtube.com/watch?v=bHcpC9uw4fE)

[Demo.](https://youtu.be/rF9q-QBYfUI)

[Mostra de como usar o sistema.](https://youtu.be/z_WLy9MxVFA)

Para rodar localmente o sistema, execute:

> python3 manage.py runserver

Para criar ambiente virtual de Python3, execute:

> python3 -m venv venv

## Usuário de teste

mcgil
musgo123

## Dependências

O script *./dependencias.sh* baixa dependências e executa o programa. 

Para dar permissão para rodar o script, execute:

> chmod +x dependencias.sh

Para verificar as permissões do script de dependências, execute:

> ls -l dependencias.sh

Para rodar, execute:

> python3 -m venv venv
> source venv/bin/activate
> ./dependencias.sh

Para atualizar models/forms:

> python3 manage.py makemigrations
> python3 manage.py migrate

Para gerar arquivos de requisitos:

> pip3 freeze > requirements.txt 

Para instalar o que veio no arquivo de requisitos:

> pip3 install -r requirements.txt

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

