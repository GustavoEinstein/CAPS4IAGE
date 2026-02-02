"""Módulo de URLs de kipo_playground"""

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    
    # ============================================================================
    # 1. ROTAS LEGADO (SISTEMA ANTIGO)
    # ============================================================================
    
    path('welcome/', views.welcome),
    path('sobre/', views.sobre),
    path('tutorial/', views.tutorial), 
    path('reiniciar/', views.reiniciar), 
    path('instancias_teste/', views.instancias_teste),
    path('instancias_tipo/', views.instancias_tipo),
    path('instancias_tipo_show/', views.instancias_tipo_show), 
    path('inserir_instancia/', views.inserir_instancia),
    path('inserir_instancia_tela_ok/', views.inserir_instancia_tela_ok),
    path('retirar_instancia/<str:instancia>/<str:classe>', views.retirar_instancia),
    path('sprint_select/', views.sprint_select),
    path('sprint_dashboard/<str:instancia_sprint>', views.sprint_dashboard),
    path('add_classe/<str:classe_inst>', views.add_classe),
    path('add_classe_com_relacionamento/<str:classe_inst>/<str:relacinamento_inst>/<str:referencia_inst>', views.add_classe_com_relacionamento),
    path('sprint_options/<str:instancia_sprint>', views.sprint_options),
    path('daily_dashboard/<str:instancia_daily>', views.daily_dashboard),
    path('sprint_backlog/<str:instancia_sprint>', views.ver_sprint_backlog),
    path('ver_backlog_produto/', views.ver_backlog_produto), 
    path('ver_item_backlog/<str:instancia_item>', views.ver_item_backlog), 
    path('mudar_obs/<str:item>', views.mudar_obs), 
    path('inserir_obs_tela_ok/', views.inserir_obs_tela_ok),
    path('mudar_status/<str:item>', views.mudar_status), 
    path('mudar_esforco/<str:item>', views.mudar_esforco),
    path('adicionar_relacionamento_insts_antigas/<str:instancia_A>/<str:relacionamento>/<str:classe_da_nova_inst>', views.adicionar_relacionamento_insts_antigas),
    path('executar_relacionamento_insts_antigas/<str:instancia_A>/<str:relacionamento>/<str:instancia_B>', views.executar_relacionamento_insts_antigas),
    path('decision_select/', views.decision_select),
    path('decision_dashboard/<str:instancia_decisao>', views.decision_dashboard),
    path('mudar_decisao_status/<str:instancia_decisao>', views.mudar_decisao_status),
    path('gestao_artefatos/', views.gestao_artefatos),
    path('detalhar_artefato/<str:instancia_artefato>/<str:classe_artefato>', views.detalhar_artefato),
    path('alocar_para_tarefa/<str:instancia_artefato>', views.alocar_para_tarefa),
    path('gestao_pessoas/', views.gestao_pessoas),
    path('alocar_pessoa/<str:instancia_pessoa>', views.alocar_pessoa),
    path('add_relacionamento/<str:instancia1>/<str:relacao>/<str:instancia2>', views.add_relacionamento),
    path('add_materia/', views.add_materia),
    path('ver_materia/', views.ver_materias), 
    path('ler_materia/<str:id_materia>', views.ler_materia), 
    path('editar_materia/<str:id_materia>', views.editar_materia), 
    path('logout_user', views.logout_user), 
    path('login_page', views.login_page), 
    path('register', views.register), 

    # ============================================================================
    # 2. ROTAS DA API (SISTEMA REACT) - Ajustadas e Corrigidas
    # ============================================================================
    
    # --- AUTENTICAÇÃO ---
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.api_register_user, name='register_user'),

    # --- PERFIL DO USUÁRIO ---
    # AQUI ESTÁ A CORREÇÃO: Mantive api/user/me/ pois é o que o seu Login.jsx pede
    path('api/user/me/', views.api_user_profile, name='user_profile'),

    # --- RECUPERAÇÃO DE SENHA ---
    path('api/password_reset/', views.api_password_reset_request, name='password_reset_request'),
    path('api/password_reset_confirm/<uidb64>/<token>/', views.api_password_reset_confirm, name='password_reset_confirm'),

    # --- PRODUÇÕES (CRUD) ---
    path('api/production/create/', views.api_create_production, name='create_production'),
    path('api/production/list/', views.api_list_my_productions, name='list_my_productions'),
    path('api/production/<int:pk>/', views.api_get_production_details, name='get_production_details'),

    # --- SISTEMA DE REVISÃO ---
    path('api/production/review-list/', views.api_list_review_queue, name='list_review_queue'),
    path('api/production/<int:pk>/review/', views.api_submit_review, name='submit_review'),
    path('api/production/history/', views.api_review_history, name='review_history'),

    # --- FEED PÚBLICO ---
    path('api/public/feed/', views.api_list_public_feed, name='public_feed'),

    # --- LEGADO (API) ---
    path('api/ontology/cycles/', views.api_listar_ciclos, name='list_cycles'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)