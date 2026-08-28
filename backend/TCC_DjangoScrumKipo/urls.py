"""TCC_DjangoScrumKipo URL Configuration"""

from django.contrib import admin
from django.urls import path, include

# Importações necessárias para o Django servir os arquivos de mídia (PDFs, imagens)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Aqui importamos as rotas do seu app principal
    path('', include('kipo_playground.urls')),
]

# === O CÓDIGO QUE RESOLVE O ERRO 404 FICA AQUI ===
# Isso diz ao Django para criar rotas temporárias de download dos arquivos anexados
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)