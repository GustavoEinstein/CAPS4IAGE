"""Módulo de Models de kipo_playground

Define modelos de dados para gerar os formulários usados na interação básica com o Sistema Calliandra.

Foi feito um modelo para uma nova instância de Sprint (campos 'nome' e 'observação'), para inserir uma nova instância (campos 'nome', 'classe' e 'observação') e para recuperar uma instância baseada em tipo (campo 'busca', com a listagem de possíveis classes).
"""

from django.db import models
from ckeditor.fields import RichTextField
import random
from datetime import date
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

def random_string():
    return str(random.randint(1000000, 99999999))

# Create your models here.

# !-- MODELO DO PERFIL (PROFILE) --
class Profile(models.Model):
    DISCIPLINAS_CHOICES = (
        ('História', 'História'),
        ('Matemática', 'Matemática'),
        ('Geografia', 'Geografia'),
        ('Português', 'Português'),
        ('Ciências', 'Ciências'),
        ('Física', 'Física'),
        ('Química', 'Química'),
        ('Biologia', 'Biologia'),
        ('Inglês', 'Inglês'),
        ('Artes', 'Artes'),
        ('Educação Física', 'Educação Física'),
        ('Filosofia', 'Filosofia'),
        ('Sociologia', 'Sociologia'),
        ('Pedagogia', 'Pedagogia'),
        ('Outra', 'Outra'),
    )

    STATUS_CHOICES = (
        ('Em análise', 'Em análise'),
        ('Aprovado', 'Aprovado'),
        ('Rejeitado', 'Rejeitado'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    disciplina = models.CharField(max_length=50, choices=DISCIPLINAS_CHOICES,)
    escola = models.CharField(max_length=150, null=True, blank=True)
    status_conta = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Em análise')

    def __str__(self):
        return f'{self.user.username} - {self.disciplina}'

# Sinais para criar/atualizar o Profile automaticamente
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# !-- MODELO DE PRODUÇÃO DIDÁTICA (NOVO) --
class Producao(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='producoes')
    revisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='revisoes_feitas')
    data_revisao = models.DateTimeField(null=True, blank=True)
    titulo = models.CharField(max_length=255)
    disciplina = models.CharField(max_length=100)
    nivel = models.CharField(max_length=100)
    modelo_ia = models.CharField(max_length=100)
    categoria = models.CharField(max_length=100)
    bncc = models.TextField(blank=True, null=True)
    metodologia = models.CharField(max_length=255, blank=True, null=True)
    duracao = models.CharField(max_length=100, blank=True, null=True)
    # Recursos salvos como string (ex: "Projetor, Internet")
    recursos = models.TextField(blank=True, null=True)
    experiencia = models.TextField(blank=True, null=True)
    resultados = models.TextField(blank=True, null=True) 
    # Arquivos
    arquivo = models.FileField(upload_to='producoes/', blank=True, null=True)
    # Metadados
    data_criacao = models.DateTimeField(auto_now_add=True)
    feedback_revisao = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default='Em revisão')

    nota_coerencia = models.IntegerField(default=0)
    nota_qualidade = models.IntegerField(default=0)
    nota_metodologia = models.IntegerField(default=0)
    nota_avaliacao = models.IntegerField(default=0)
    nota_inclusao = models.IntegerField(default=0)
    nota_inovacao = models.IntegerField(default=0)
    escola = models.CharField(max_length=149, null=True, blank=True)

    def __str__(self):
        return f"{self.titulo} - {self.user.username}"