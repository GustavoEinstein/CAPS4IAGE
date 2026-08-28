"""
Django settings for TCC_DjangoScrumKipo project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
load_dotenv()

# Constrói os caminhos base do projeto. BASE_DIR = .../TEIA/backend
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-substitua-esta-chave-em-producao')

# SECURITY WARNING: don't run with debug turned on in production!
# Puxa o valor do .env (Se não achar, o padrão é True para dev local)
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Lê do .env (Ex: 164.41.76.34/28,localhost,127.0.0.1) e transforma em lista
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')


# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Bibliotecas de Terceiros
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # O seu App
    'kipo_playground',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # CORS DEVE VIR NO TOPO PARA O REACT
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'TCC_DjangoScrumKipo.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'TCC_DjangoScrumKipo.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True


# ============================================================================
# ARQUIVOS ESTÁTICOS (CSS, JS, Imagens, Logo da UnB)
# ============================================================================
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'kipo_playground', 'static')
]

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ============================================================================
# 1. CONFIGURAÇÕES DO REST FRAMEWORK E AUTENTICAÇÃO JWT
# ============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'login_attempts': '10/m', # <-- CORREÇÃO DO ERRO 500 APLICADA AQUI
    }
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}


# ============================================================================
# 2. CONFIGURAÇÕES DO CORS (Para o React conseguir consumir a API)
# ============================================================================
CORS_ALLOW_ALL_ORIGINS = True # Deixe True ou liste domínios específicos

# Origens confiáveis (Lê do .env, ex: http://192.168.0.100,http://localhost)
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:8000').split(',')


# ============================================================================
# 3. CONFIGURAÇÕES DE ARQUIVOS (MEDIA FILES: Uploads de PDF, Docs, etc)
# ============================================================================
# A URL pública pelo qual o navegador e o React vão acessar o arquivo
MEDIA_URL = '/media/'

# O caminho FÍSICO exato no seu servidor/Docker
# Vai gerar exatamente: .../backend/kipo_playground/media
MEDIA_ROOT = os.path.join(BASE_DIR, 'kipo_playground', 'media')


# ============================================================================
# 4. CONFIGURAÇÕES DE E-MAIL (Recuperação de Senha)
# ============================================================================
EMAIL_BACKEND = 'kipo_playground.email_backend.EmailBackend' 

EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# Puxando as credenciais de forma segura do arquivo .env!
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')