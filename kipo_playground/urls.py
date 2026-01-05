"""Módulo de URLs de kipo_playground

Define uma lista com as possíveis URLs e sua equivalências com as suas views.

"""

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    
    # Tela de início
    path('welcome/', views.welcome),
    
    #------------------------------------------------------------

    # Extras (menu do canto superior direito)
    path('sobre/', views.sobre),
    path('tutorial/', views.tutorial), 
    path('reiniciar/', views.reiniciar), 
    
    #------------------------------------------------------------

    # Teste para ver instâncias
    path('instancias_teste/', views.instancias_teste),
    
    #------------------------------------------------------------

    # ver instâncias por tipo
    path('instancias_tipo/', views.instancias_tipo),
    path('instancias_tipo_show/', views.instancias_tipo_show), 
    
    #------------------------------------------------------------

    # Inserir instâncias
    path('inserir_instancia/', views.inserir_instancia),
    path('inserir_instancia_tela_ok/', views.inserir_instancia_tela_ok),
    path('retirar_instancia/<str:instancia>/<str:classe>', views.retirar_instancia),
    
    #------------------------------------------------------------

    # selecionar sprints
    path('sprint_select/', views.sprint_select),
    path('sprint_dashboard/<str:instancia_sprint>', views.sprint_dashboard),
    path('add_classe/<str:classe_inst>', views.add_classe),
    path('add_classe_com_relacionamento/<str:classe_inst>/<str:relacinamento_inst>/<str:referencia_inst>', views.add_classe_com_relacionamento),
    path('sprint_options/<str:instancia_sprint>', views.sprint_options),
    
    #------------------------------------------------------------

    # visualização de dashboard
    path('daily_dashboard/<str:instancia_daily>', views.daily_dashboard),
    path('sprint_backlog/<str:instancia_sprint>', views.ver_sprint_backlog),
    
    #------------------------------------------------------------

    # backlog do produto
    path('ver_backlog_produto/', views.ver_backlog_produto), 
    path('ver_item_backlog/<str:instancia_item>', views.ver_item_backlog), 
    path('mudar_obs/<str:item>', views.mudar_obs), 
    path('inserir_obs_tela_ok/', views.inserir_obs_tela_ok),
    path('mudar_status/<str:item>', views.mudar_status), 
    path('mudar_esforco/<str:item>', views.mudar_esforco),

    #------------------------------------------------------------

    # Add instancia pre existente
    path('adicionar_relacionamento_insts_antigas/<str:instancia_A>/<str:relacionamento>/<str:classe_da_nova_inst>', views.adicionar_relacionamento_insts_antigas),
    path('executar_relacionamento_insts_antigas/<str:instancia_A>/<str:relacionamento>/<str:instancia_B>', views.executar_relacionamento_insts_antigas),
    
    #------------------------------------------------------------

    # visualização da decisão
    path('decision_select/', views.decision_select),
    path('decision_dashboard/<str:instancia_decisao>', views.decision_dashboard),
    path('mudar_decisao_status/<str:instancia_decisao>', views.mudar_decisao_status),
    
    #------------------------------------------------------------

    # gestão de artefatos
    path('gestao_artefatos/', views.gestao_artefatos),
    path('detalhar_artefato/<str:instancia_artefato>/<str:classe_artefato>', views.detalhar_artefato),
    path('alocar_para_tarefa/<str:instancia_artefato>', views.alocar_para_tarefa),
    
    #------------------------------------------------------------

    # gestão de pessoas
    path('gestao_pessoas/', views.gestao_pessoas),
    path('alocar_pessoa/<str:instancia_pessoa>', views.alocar_pessoa),
    path('add_relacionamento/<str:instancia1>/<str:relacao>/<str:instancia2>', views.add_relacionamento),
    
    #------------------------------------------------------------

    # matérias jornalisticas (funcionalidades particulares ao caso de estudo)
    path('add_materia/', views.add_materia),
    path('ver_materia/', views.ver_materias), 
    path('ler_materia/<str:id_materia>', views.ler_materia), 
    path('editar_materia/<str:id_materia>', views.editar_materia), 

    #------------------------------------------------------------

    # usuarios
    path('logout_user', views.logout_user), 
    path('login_page', views.login_page), 
    path('register', views.register), 

    #------------------------------------------------------------
   # Rotas de login novas do react
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.api_register_user),
]