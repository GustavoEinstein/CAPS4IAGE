"""Módulo de Models de kipo_playground"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random

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
        """Retorna o título baseado em uma curva de dificuldade crescente"""
        if self.pontos <= 100:
            return "🌱 Prof. Conectado(a)"
        elif self.pontos <= 400: # +300 para o próximo
            return "📖 Curador(a) Pedagógico(a)"
        elif self.pontos <= 1000: # +600 para o próximo
            return "💡 Mentor(a) de Inovação"
        else: # +1500 ou mais para elite
            return "🦉 Embaixador(a) do Saber"

    def get_progresso_proximo_nivel(self):
        """Calcula a lógica da barra de progresso para o React"""
        marcos = [0, 100, 400, 1000, 2500] 
        
        nivel_atual_idx = 0
        for i, marco in enumerate(marcos):
            if self.pontos >= marco:
                nivel_atual_idx = i
            else:
                break
        
        if nivel_atual_idx >= len(marcos) - 1:
            return {
                "porcentagem": 100, 
                "falta": 0, 
                "proximo_marco": "∞",
                "label": "Nível Máximo"
            }

        inicio_faixa = marcos[nivel_atual_idx]
        fim_faixa = marcos[nivel_atual_idx + 1]
        
        pontos_na_faixa = self.pontos - inicio_faixa
        tamanho_faixa = fim_faixa - inicio_faixa
        
        porcentagem = (pontos_na_faixa / tamanho_faixa) * 100
        falta = fim_faixa - self.pontos
        
        return {
            "porcentagem": round(porcentagem, 1),
            "falta": falta,
            "proximo_marco": fim_faixa,
            "label": f"{self.pontos} / {fim_faixa} XP"
        }

    def __str__(self):
        return f'{self.user.username} - {self.disciplina} ({self.get_nivel()})'

# ============================================================================
# 2. SISTEMA DE HISTÓRICO DE XP (EXTRATO)
# ============================================================================
class RegistroXP(models.Model):
    perfil = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='historico_xp')
    quantidade = models.IntegerField()
    descricao = models.CharField(max_length=255)
    data = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.perfil.user.username} | {self.quantidade} XP | {self.descricao}"

# ============================================================================
# 3. SISTEMA DE CONQUISTAS (BADGES)
# ============================================================================
class Conquista(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField()
    icone = models.CharField(max_length=50, help_text="Nome do ícone Lucide (ex: trophy, star)")
    xp_bonus = models.IntegerField(default=0)

    def __str__(self):
        return self.nome

class ConquistaUsuario(models.Model):
    perfil = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='conquistas')
    conquista = models.ForeignKey(Conquista, on_delete=models.CASCADE)
    data_conquista = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('perfil', 'conquista')

# ============================================================================
# 4. PRODUÇÕES DIDÁTICAS
# ============================================================================
class Producao(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='producoes')
    escola = models.CharField(max_length=149, null=True, blank=True)
    titulo = models.CharField(max_length=255)
    disciplina = models.CharField(max_length=100)
    nivel = models.CharField(max_length=100)
    modelo_ia = models.CharField(max_length=100)
    prompts_ia = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=100)
    bncc = models.TextField(blank=True, null=True)
    bncc_computacao = models.TextField(blank=True, null=True) 
    metodologia = models.CharField(max_length=255, blank=True, null=True)
    duracao = models.CharField(max_length=100, blank=True, null=True)
    recursos = models.TextField(blank=True, null=True)
    experiencia = models.TextField(blank=True, null=True)
    resultados = models.TextField(blank=True, null=True) 
    arquivo = models.FileField(upload_to='producoes/', blank=True, null=True)
    
    link_material = models.URLField(max_length=500, null=True, blank=True, verbose_name="Link Externo do Material")
    
    data_criacao = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='Em revisão')
    
    producao_base = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='derivacoes',
        help_text="Indica se esta prática foi baseada na produção de outro professor."
    )
    def __str__(self):
        return f"{self.titulo} - {self.user.username} ({self.status})"

# ============================================================================
# 5. SISTEMA DE REVISÃO
# ============================================================================
class Avaliacao(models.Model):
    producao = models.ForeignKey(Producao, on_delete=models.CASCADE, related_name='avaliacoes')
    revisor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='revisoes_feitas')
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    aprovado = models.BooleanField(default=False) 
    feedback_revisao = models.TextField(blank=True, null=True)
    nota_coerencia = models.IntegerField(default=0)
    nota_qualidade = models.IntegerField(default=0)
    nota_metodologia = models.IntegerField(default=0)
    nota_avaliacao = models.IntegerField(default=0)
    nota_inclusao = models.IntegerField(default=0)
    nota_inovacao = models.IntegerField(default=0)

    class Meta:
        unique_together = ('producao', 'revisor')

# ============================================================================
# 6. FÓRUM
# ============================================================================
class Topico(models.Model):
    CATEGORIAS_CHOICES = (
        ('Dúvida BNCC', 'Dúvida BNCC'), ('Metodologia', 'Metodologia'),
        ('Uso de IA', 'Uso de IA'), ('Sugestão', 'Sugestão'), ('Geral', 'Geral'),
    )
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topicos_forum')
    titulo = models.CharField(max_length=255)
    conteudo = models.TextField()
    categoria = models.CharField(max_length=50, choices=CATEGORIAS_CHOICES, default='Geral')
    resolvido = models.BooleanField(default=False) 
    arquivo = models.FileField(upload_to='forum_anexos/', blank=True, null=True)
    
    # Campo adicionado para referenciar a produção base
    producao_base = models.ForeignKey(
        Producao, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='topicos_referencia',
        help_text="Indica se este tópico se baseia em alguma produção aprovada da comunidade."
    )
    
    data_criacao = models.DateTimeField(auto_now_add=True)

class Comentario(models.Model):
    topico = models.ForeignKey(Topico, on_delete=models.CASCADE, related_name='comentarios')
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comentarios_usuario')
    conteudo = models.TextField()
    data_criacao = models.DateTimeField(auto_now_add=True)

# ============================================================================
# 7. DIÁRIO DE OPERAÇÕES (CRM INTERNO)
# ============================================================================
class DiarioOperacao(models.Model):
    TIPO_CHOICES = [
        ('Reunião', 'Reunião'),
        ('Treinamento', 'Treinamento'),
        ('Visita Escolar', 'Visita Escolar'),
        ('Suporte', 'Suporte'),
        ('Outros', 'Outros'),
    ]
    
    STATUS_CHOICES = [
        ('Pendente', 'Pendente'),
        ('Em andamento', 'Em andamento'),
        ('Resolvido', 'Resolvido'),
    ]
    
    titulo = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50, choices=TIPO_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Resolvido')
    
    # Vinculo com o professor (opcional) ou nome livre
    docente = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='interacoes_diario')
    contato = models.CharField(max_length=255, blank=True, null=True) 
    
    data_evento = models.DateField()
    descricao = models.TextField()
    proximos_passos = models.TextField(blank=True, null=True)
    tags = models.CharField(max_length=255, blank=True, null=True) 
    participantes = models.IntegerField(default=1)
    
    foto = models.ImageField(upload_to='diario_fotos/', null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_evento', '-criado_em']

    def __str__(self):
        return f"{self.data_evento} - {self.titulo}"

class NotaDiario(models.Model):
    diario = models.ForeignKey(DiarioOperacao, on_delete=models.CASCADE, related_name='notas')
    autor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    texto = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['criado_em']

    def __str__(self):
        return f"Nota em {self.diario.titulo}"

# ============================================================================
# 8. CONFIGURAÇÕES GERAIS DO SISTEMA
# ============================================================================
class ConfiguracaoXP(models.Model):
    xp_revisao = models.IntegerField(default=15)
    xp_aprovacao = models.IntegerField(default=50)
    xp_topico = models.IntegerField(default=5)
    xp_comentario = models.IntegerField(default=5)

    def save(self, *args, **kwargs):
        self.pk = 1 
        super(ConfiguracaoXP, self).save(*args, **kwargs)

class Escola(models.Model):
    nome = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.nome

class Disciplina(models.Model):
    nome = models.CharField(max_length=255, unique=True)
    def __str__(self): return self.nome

# ============================================================================
# SIGNALS
# ============================================================================
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()