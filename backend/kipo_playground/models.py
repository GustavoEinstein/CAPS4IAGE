"""Módulo de Models de kipo_playground"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random

def random_string():
    return str(random.randint(1000000, 99999999))

# ============================================================================
# 1. PERFIL DO USUÁRIO
# ============================================================================
class Profile(models.Model):
    DISCIPLINAS_CHOICES = (
        ('História', 'História'), ('Matemática', 'Matemática'),
        ('Geografia', 'Geografia'), ('Português', 'Português'),
        ('Ciências', 'Ciências'), ('Física', 'Física'),
        ('Química', 'Química'), ('Biologia', 'Biologia'),
        ('Inglês', 'Inglês'), ('Artes', 'Artes'),
        ('Educação Física', 'Educação Física'), ('Filosofia', 'Filosofia'),
        ('Sociologia', 'Sociologia'), ('Pedagogia', 'Pedagogia'),
        ('Outra', 'Outra'),
    )

    STATUS_CHOICES = (
        ('Em análise', 'Em análise'),
        ('Aprovado', 'Aprovado'),
        ('Rejeitado', 'Rejeitado'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    disciplina = models.CharField(max_length=50, choices=DISCIPLINAS_CHOICES)
    escola = models.CharField(max_length=150, null=True, blank=True)
    status_conta = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Em análise')

    # --- CAMPO DE GAMIFICAÇÃO ---
    pontos = models.IntegerField(default=0)

    def get_nivel(self):
        """Retorna o título (badge) baseado na progressão pedagógica do usuário"""
        if self.pontos <= 50:
            return "Prof. Conectado(a)"
        elif self.pontos <= 150:
            return "Curador(a) Pedagógico(a)"
        elif self.pontos <= 300:
            return "Mentor(a) de Inovação"
        else:
            return "Embaixador(a) do Saber"

    def __str__(self):
        return f'{self.user.username} - {self.disciplina} ({self.get_nivel()})'

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    # Garantir que o perfil existe antes de salvar (evita erro em criações via shell/admin)
    if hasattr(instance, 'profile'):
        instance.profile.save()


# ============================================================================
# 2. PRODUÇÕES DIDÁTICAS
# ============================================================================
class Producao(models.Model):
    # Autor e Localização
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='producoes')
    escola = models.CharField(max_length=149, null=True, blank=True)
    
    # Dados do Material
    titulo = models.CharField(max_length=255)
    disciplina = models.CharField(max_length=100)
    nivel = models.CharField(max_length=100)
    modelo_ia = models.CharField(max_length=100)
    categoria = models.CharField(max_length=100)
    bncc = models.TextField(blank=True, null=True)
    metodologia = models.CharField(max_length=255, blank=True, null=True)
    duracao = models.CharField(max_length=100, blank=True, null=True)
    recursos = models.TextField(blank=True, null=True)
    experiencia = models.TextField(blank=True, null=True)
    resultados = models.TextField(blank=True, null=True) 
    
    # Arquivo e Status
    arquivo = models.FileField(upload_to='producoes/', blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Em revisão')

    def __str__(self):
        return f"{self.titulo} - {self.user.username} ({self.status})"


# ============================================================================
# 3. SISTEMA DE REVISÃO (DUPLO-CEGO)
# ============================================================================
class Avaliacao(models.Model):
    producao = models.ForeignKey(Producao, on_delete=models.CASCADE, related_name='avaliacoes')
    revisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='revisoes_feitas')
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    
    # Resultado e Comentários
    aprovado = models.BooleanField(default=False) 
    feedback_revisao = models.TextField(blank=True, null=True)
    
    # Notas da Rúbrica
    nota_coerencia = models.IntegerField(default=0)
    nota_qualidade = models.IntegerField(default=0)
    nota_metodologia = models.IntegerField(default=0)
    nota_avaliacao = models.IntegerField(default=0)
    nota_inclusao = models.IntegerField(default=0)
    nota_inovacao = models.IntegerField(default=0)

    class Meta:
        # Garante que um professor avalie cada produção apenas uma vez
        unique_together = ('producao', 'revisor')

    def __str__(self):
        return f"Avaliação de {self.revisor.username} para '{self.producao.titulo}'"


# ============================================================================
# 4. FÓRUM DE RASCUNHOS
# ============================================================================
class Topico(models.Model):
    CATEGORIAS_CHOICES = (
        ('Dúvida BNCC', 'Dúvida BNCC'),
        ('Metodologia', 'Metodologia'),
        ('Uso de IA', 'Uso de IA'),
        ('Sugestão', 'Sugestão'),
        ('Geral', 'Geral'),
    )

    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topicos_forum')
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    
    categoria = models.CharField(max_length=50, choices=CATEGORIAS_CHOICES, default='Geral')
    resolvido = models.BooleanField(default=False) 
    
    arquivo = models.FileField(upload_to='forum_anexos/', blank=True, null=True)
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tópico: {self.titulo} por {self.autor.username}"

class Comentario(models.Model):
    topico = models.ForeignKey(Topico, on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(User, on_delete=models.CASCADE)
    conteudo = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentário de {self.autor.username} em {self.topico.titulo}"