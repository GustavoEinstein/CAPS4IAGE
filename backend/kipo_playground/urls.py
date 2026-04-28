"""Módulo de URLs de kipo_playground"""

from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    
    # ============================================================================
    # 2. ROTAS DA API (SISTEMA REACT) - Ajustadas e Corrigidas
    # ============================================================================
    
    # --- AUTENTICAÇÃO ---
    # ATUALIZADO: Agora aponta para a view customizada que bloqueia contas não aprovadas
    path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', views.api_register_user, name='register_user'),

    # --- PERFIL DO USUÁRIO ---
    # Mantive api/user/me/ pois é o que o seu Login.jsx pede
    path('api/user/me/', views.api_user_profile, name='user_profile'),

    # --- RECUPERAÇÃO DE SENHA ---
    path('api/password_reset/', views.api_password_reset_request, name='password_reset_request'),
    path('api/password_reset_confirm/<uidb64>/<token>/', views.api_password_reset_confirm, name='password_reset_confirm'),

    # --- PRODUÇÕES (CRUD) ---
    path('api/production/create/', views.api_create_production, name='create_production'),
    path('api/production/list/', views.api_list_my_productions, name='list_my_productions'),
    path('api/production/<int:pk>/', views.api_get_production_details, name='get_production_details'),
    path('api/production/<int:pk>/update/', views.api_update_production, name='update_production'),

    # --- SISTEMA DE REVISÃO ---
    path('api/production/review-list/', views.api_list_review_queue, name='list_review_queue'),
    path('api/production/<int:pk>/review/', views.api_submit_review, name='submit_review'),
    path('api/production/history/', views.api_review_history, name='review_history'),

    # --- FEED PÚBLICO ---
    path('api/public/feed/', views.api_list_public_feed, name='public_feed'),

    # --- LEGADO (API) ---
    path('api/ontology/cycles/', views.api_listar_ciclos, name='list_cycles'),

    # ============================================================================
    # 3. ROTAS DE ADMINISTRAÇÃO (APROVAÇÃO DE CONTAS) - NOVO
    # ============================================================================
    path('api/admin/pending-users/', views.api_list_pending_users, name='pending_users'),
    path('api/admin/approve-user/<int:user_id>/', views.api_approve_reject_user, name='approve_user'),


# --- FÓRUM ---
    path('api/forum/topicos/', views.api_forum_topicos, name='forum_topicos'),
    path('api/forum/topicos/<int:pk>/', views.api_forum_detalhe_comentarios, name='forum_detalhes'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)