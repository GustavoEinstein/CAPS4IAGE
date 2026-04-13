"""Módulo de Views de kipo_playground

Módulo principal que define a visualização com contexto de templates em HTML na pasta '/kipo_playground/templates', que também usa '/kipo_playground/static'.

Módulo de gestão de formulários, gestão de Banco de Dados e definição de contexto por meio de acesso para ontologia '/kipo_playground/kipo_fialho.owl', com instâncias de caso de estudo definidas em 'backup.db'. 

Essas views são geridas com endereços por meio do arquivo 'urls.py'.  

"""

from multiprocessing import context
from typing import final
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from django.template import Template, Context
from django.contrib.auth.decorators import login_required
from django.core.files.storage import FileSystemStorage
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from owlready2 import * # https://pypi.org/project/Owlready2/
from os.path import exists
import os
import shutil
import json 
import sys 
import re 
from random import randint
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Profile  

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Producao
from django.utils import timezone

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.throttling import ScopedRateThrottle 

# --- CONFIGURAÇÃO GLOBAL DE SEGURANÇA DE ARQUIVOS ---
ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.txt', 
    '.ppt', '.pptx', '.xls', '.xlsx', 
    '.jpg', '.jpeg', '.png'
]
# ----------------------------------------------------

def logout_user(request):
    logout(request)
    return redirect('register')

def login_page(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('/kipo_playground/welcome/')
        else:
            messages.info(request, 'bad login!')

    context = {}
    return render(request, 'login.html', context)

def register(request):
    form = CreateUser()
    if request.method == 'POST':
        form = CreateUser(request.POST)
        if form.is_valid():
            form.save()
            return redirect('/kipo_playground/welcome/')

    context = {'form':form}
    return render(request, 'register.html', context)


# ============================================================================
# LOGIN CUSTOMIZADO (VERIFICA APROVAÇÃO)
# ============================================================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        
        if user.is_superuser:
            return data
            
        # --- CORREÇÃO DE SEGURANÇA: BLOQUEIO RÍGIDO DE PERFIL ---
        if not hasattr(user, 'profile'):
            raise AuthenticationFailed('Perfil não encontrado. Acesso negado.')
            
        if user.profile.status_conta == 'Em análise':
            raise AuthenticationFailed('Sua conta está em análise. Aguarde a aprovação do administrador.')
        elif user.profile.status_conta == 'Rejeitado':
            raise AuthenticationFailed('Sua conta foi rejeitada e não tem acesso ao sistema.')
        # --------------------------------------------------------
            
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'login_attempts'


# ============================================================================
# 1. AUTENTICAÇÃO & PERFIL
# ============================================================================

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_register_user(request): 
    data = request.data
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    disciplina = data.get('disciplina', 'Outra')
    escola = data.get('escola', '') 

    if not username or not password or not email:
        return Response({'erro': 'Preencha todos os campos obrigatórios.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'erro': 'Este nome de usuário já está em uso.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'erro': 'Este e-mail já possui uma conta cadastrada.'}, status=400)

    if len(password) < 8:
        return Response({'erro': 'A senha precisa ter no mínimo 8 caracteres.'}, status=400)

    if not re.search(r'[A-Z]', password):
        return Response({'erro': 'A senha precisa ter pelo menos uma letra maiúscula.'}, status=400)

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return Response({'erro': 'A senha precisa ter pelo menos um símbolo especial.'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name 
        )
        
        profile, created = Profile.objects.get_or_create(user=user)
        profile.disciplina = disciplina
        profile.escola = escola 
        profile.status_conta = 'Em análise' # <--- CORREÇÃO: FORÇAR STATUS DE ANÁLISE!
        profile.save()
        
        return Response({'mensagem': 'Conta criada com sucesso! Aguarde aprovação.'}, status=201)
        
    except Exception as e:
        print("Erro ao criar user:", e)
        return Response({'erro': 'Erro interno ao criar conta.'}, status=500)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def api_user_profile(request):
    user = request.user
    profile, created = Profile.objects.get_or_create(user=user)

    if request.method == 'GET':
        avatar_url = None
        try:
            if profile.avatar:
                avatar_url = request.build_absolute_uri(profile.avatar.url)
        except:
            pass

        nome_exibicao = user.first_name if user.first_name else user.username

        return Response({
            'id': user.id,
            'username': nome_exibicao,
            'email': user.email,
            'disciplina': profile.disciplina,
            'escola': profile.escola, 
            'avatar': avatar_url,
            'is_superuser': user.is_superuser
        })

    elif request.method == 'PUT':
        data = request.data
        
        if 'disciplina' in data:
            profile.disciplina = data['disciplina']
            
        if 'escola' in data:
            profile.escola = data['escola']

        file = request.FILES.get('avatar')
        if file:
            profile.avatar = file
            
        profile.save()

        if 'username' in data and data['username']: 
             user.first_name = data['username']
             user.save()
        
        avatar_url = request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
        nome_exibicao = user.first_name if user.first_name else user.username

        return Response({
            'mensagem': 'Perfil atualizado com sucesso!',
            'username': nome_exibicao,
            'avatar': avatar_url,
            'disciplina': profile.disciplina,
            'escola': profile.escola 
        })


# ============================================================================
# 2. PRODUÇÕES DIDÁTICAS (CRUD)
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_create_production(request):
    user = request.user
    data = request.data
    arquivo = request.FILES.get('arquivo')

    if arquivo:
        extensao = os.path.splitext(arquivo.name)[1].lower()
        if extensao not in ALLOWED_EXTENSIONS:
            return Response({'erro': f'Formato de arquivo inválido ({extensao}). Formatos permitidos: PDF, Imagens ou Documentos Office.'}, status=400)
    
    try:
        recursos_input = data.getlist('recursos') if hasattr(data, 'getlist') else data.get('recursos', '')
        
        if isinstance(recursos_input, list):
            recursos_str = ", ".join(recursos_input)
        else:
            recursos_str = str(recursos_input)

        nova_producao = Producao.objects.create(
            user=user, 
            titulo=data.get('titulo'),
            disciplina=data.get('disciplina'),
            nivel=data.get('nivel_ensino'), 
            modelo_ia=data.get('modelo_ia'),
            categoria=data.get('categoria'),
            bncc=data.get('bncc'),
            metodologia=data.get('metodologia'),
            duracao=data.get('duracao'),
            recursos=recursos_str,
            experiencia=data.get('experiencia'), 
            resultados=data.get('resultados'),
            arquivo=arquivo 
        )
        return Response({'mensagem': 'Produção criada com sucesso!', 'id': nova_producao.id}, status=201)
    
    except Exception as e:
        print(f"Erro ao criar produção: {e}")
        return Response({'erro': 'Erro ao salvar produção.'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_my_productions(request):
    user = request.user
    producoes = Producao.objects.filter(user=user).order_by('-data_criacao')
    
    lista = []
    for p in producoes:
        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'status': p.status,
            'modelo_ia': p.modelo_ia,
            'feedback_revisor': p.feedback_revisao
        })
    
    return Response(lista)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_get_production_details(request, pk):
    try:
        p = Producao.objects.get(id=pk)

        is_dono = p.user == request.user
        is_admin = request.user.is_superuser
        is_aprovado = p.status in ['Aprovado', 'Concluído']
        is_revisor = p.revisor == request.user
        
        minha_disciplina = request.user.profile.disciplina if hasattr(request.user, 'profile') else 'Outra'
        is_potencial_revisor = (p.status == 'Em revisão' and p.disciplina == minha_disciplina and not is_dono)

        if not (is_dono or is_admin or is_aprovado or is_revisor or is_potencial_revisor):
            return Response({'erro': 'Acesso negado. Esta produção é privada ou ainda está em avaliação.'}, status=403)
        
        arquivo_url = None
        if p.arquivo:
            arquivo_url = request.build_absolute_uri(p.arquivo.url)

        data = {
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'nivel': p.nivel,
            'modelo_ia': p.modelo_ia,
            'categoria': p.categoria,
            'bncc': p.bncc,
            'metodologia': p.metodologia,
            'duracao': p.duracao,
            'recursos': p.recursos,
            'experiencia': p.experiencia,
            'resultados': p.resultados,
            'arquivo': arquivo_url, 
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'status': p.status,
            'autor': p.user.first_name or p.user.username,
            
            'revisao_realizada': p.nota_coerencia > 0, 
            'is_aprovado': p.status == 'Aprovado' or p.status == 'Concluído',
            'feedback_texto': p.feedback_revisao, 
            'notas': {
                'coerencia': p.nota_coerencia,
                'qualidade': p.nota_qualidade,
                'metodologia': p.nota_metodologia,
                'avaliacao': p.nota_avaliacao,
                'inclusao': p.nota_inclusao,
                'inovacao': p.nota_inovacao
            }
        }
        return Response(data)
    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada'}, status=404)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_production(request, pk):
    try:
        p = Producao.objects.get(id=pk, user=request.user)
        
        if p.status != 'Correção solicitada':
            return Response({'erro': 'Esta produção não pode ser editada no momento.'}, status=403)

        data = request.data
        p.titulo = data.get('titulo', p.titulo)
        p.disciplina = data.get('disciplina', p.disciplina)
        p.nivel = data.get('nivel_ensino', p.nivel)
        p.modelo_ia = data.get('modelo_ia', p.modelo_ia)
        p.categoria = data.get('categoria', p.categoria)
        p.bncc = data.get('bncc', p.bncc)
        p.metodologia = data.get('metodologia', p.metodologia)
        p.duracao = data.get('duracao', p.duracao)
        p.experiencia = data.get('experiencia', p.experiencia)
        p.resultados = data.get('resultados', p.resultados)

        recursos_input = data.getlist('recursos') if hasattr(data, 'getlist') else data.get('recursos')
        if recursos_input:
            if isinstance(recursos_input, list):
                p.recursos = ", ".join(recursos_input)
            else:
                p.recursos = str(recursos_input)

        novo_arquivo = request.FILES.get('arquivo')
        if novo_arquivo:
            extensao = os.path.splitext(novo_arquivo.name)[1].lower()
            if extensao not in ALLOWED_EXTENSIONS:
                return Response({'erro': f'Formato de arquivo inválido ({extensao}). Formatos permitidos: PDF, Imagens ou Documentos Office.'}, status=400)
            p.arquivo = novo_arquivo

        p.status = 'Em revisão' 
        p.feedback_revisao = None 
        p.revisor = None 
        
        p.save()
        return Response({'mensagem': 'Produção atualizada e reenviada para fila de revisão!'})

    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada.'}, status=404)
    except Exception as e:
        print(f"Erro ao atualizar: {e}")
        return Response({'erro': 'Erro interno ao atualizar.'}, status=500)

# ============================================================================
# 3. SISTEMA DE REVISÃO (DUPLO CEGO & HISTÓRICO)
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_review_queue(request):
    user = request.user
    
    try:
        minha_disciplina = user.profile.disciplina
    except:
        minha_disciplina = 'Outra'

    producoes_para_revisar = Producao.objects.filter(
        disciplina=minha_disciplina,
        status='Em revisão'
    ).exclude(user=user).order_by('data_criacao')

    lista = []
    for p in producoes_para_revisar:
        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'nivel': p.nivel,
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'modelo_ia': p.modelo_ia
        })
    
    return Response(lista)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_submit_review(request, pk):
    try:
        p = Producao.objects.get(id=pk)
        
        if p.user == request.user:
            return Response({'erro': 'Não pode avaliar a sua própria produção.'}, status=403)
            
        if p.status != 'Em revisão':
            return Response({'erro': 'Esta produção não está disponível para avaliação.'}, status=400)
        
        data = request.data
        
        aprovado = data.get('aprovado') 
        pontos_fortes = data.get('pontos_fortes', '')
        pontos_melhoria = data.get('pontos_melhoria', '')
        
        feedback_texto = f"PONTOS FORTES:\n{pontos_fortes}\n\nSUGESTÕES DE MELHORIA:\n{pontos_melhoria}"
        
        p.feedback_revisao = feedback_texto
        p.revisor = request.user
        p.data_revisao = timezone.now()

        p.nota_coerencia = data.get('nota_coerencia', 0)
        p.nota_qualidade = data.get('nota_qualidade', 0)
        p.nota_metodologia = data.get('nota_metodologia', 0)
        p.nota_avaliacao = data.get('nota_avaliacao', 0)
        p.nota_inclusao = data.get('nota_inclusao', 0)
        p.nota_inovacao = data.get('nota_inovacao', 0)

        if aprovado:
            p.status = 'Aprovado'
            msg_response = 'Revisão registrada e aprovada!'
        else:
            p.status = 'Correção solicitada'
            msg_response = 'Produção devolvida para correção.'

            try:
                autor_email = p.user.email
                if autor_email:
                    assunto = f"Ação Necessária: Sua produção '{p.titulo}' precisa de atenção"
                    
                    nome_autor = p.user.first_name.split()[0].title() if p.user.first_name else "Professor(a)"
                    
                    mensagem_texto = f"""
                    Olá, {nome_autor}.
                    Sua produção "{p.titulo}" tem grande potencial, mas precisa de alguns ajustes.
                    Sugestões: {pontos_melhoria}
                    Acesse o sistema para editar.
                    """

                    mensagem_html = f"""
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body {{ font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F3F4F6; color: #334155; }}
                            .email-wrapper {{ width: 100%; background-color: #F3F4F6; padding: 40px 0; }}
                            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }}
                            .header {{ background-color: #0F172A; padding: 30px 20px; text-align: center; }}
                            .logo {{ color: #ffffff; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 10px; }}
                            .content {{ padding: 40px 30px; line-height: 1.6; font-size: 16px; }}
                            .h1 {{ color: #1E293B; font-size: 22px; margin-top: 0; font-weight: 700; margin-bottom: 20px; }}
                            .text-intro {{ color: #475569; margin-bottom: 25px; }}
                            .feedback-box {{ background-color: #FFFBEB; border-left: 5px solid #F59E0B; padding: 20px; margin: 25px 0; border-radius: 4px; color: #92400E; font-style: italic; font-weight: 500; }}
                            .btn-container {{ text-align: center; margin: 35px 0; }}
                            .btn {{ display: inline-block; background-color: #2563EB; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2); transition: background-color 0.2s; }}
                            .btn:hover {{ background-color: #1D4ED8; }}
                            .footer {{ background-color: #F8FAFC; padding: 20px; text-align: center; font-size: 13px; color: #94A3B8; border-top: 1px solid #E2E8F0; }}
                        </style>
                    </head>
                    <body>
                        <div class="email-wrapper">
                            <div class="container">
                                <div class="header">
                                    <span class="logo">📘 CAPSIAGE</span>
                                </div>
                                <div class="content">
                                    <h1 class="h1">Olá, {nome_autor}!</h1>
                                    <p class="text-intro">Sua produção <strong>"{p.titulo}"</strong> tem um enorme potencial para a nossa comunidade!</p>
                                    <p>Ela passou pela nossa revisão por pares e o revisor identificou alguns pontos que, se ajustados, deixarão seu material ainda mais rico e alinhado aos nossos padrões de qualidade.</p>
                                    <p><strong>Confira as observações do revisor:</strong></p>
                                    <div class="feedback-box">"{pontos_melhoria}"</div>
                                    <p>Não desanime! Esse processo de refinamento é normal e essencial para garantirmos a excelência do conteúdo. Faça os ajustes e reenvie para aprovação.</p>
                                    <div class="btn-container">
                                        <a href="http://localhost:5173/dashboard/minhas-producoes" class="btn">Editar e Reenviar Agora</a>
                                    </div>
                                    <p style="font-size: 13px; margin-top: 30px; color: #94A3B8; text-align: center;">Se o botão não funcionar, acesse sua conta e vá até a aba "Minhas Produções".</p>
                                </div>
                                <div class="footer">© 2026 CAPSIAGE - Conectando inteligência humana e artificial.<br>Este é um e-mail automático, por favor não responda.</div>
                            </div>
                        </div>
                    </body>
                    </html>
                    """
                    
                    send_mail(
                        assunto,
                        mensagem_texto,
                        settings.DEFAULT_FROM_EMAIL,
                        [autor_email],
                        fail_silently=False,
                        html_message=mensagem_html
                    )
            except Exception as e:
                print(f"Erro ao enviar email de rejeição: {e}")
            
        p.save()
        return Response({'mensagem': msg_response})
        
    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada'}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_review_history(request):
    user = request.user
    revisoes = Producao.objects.filter(revisor=user).order_by('-data_revisao')
    
    lista = []
    for p in revisoes:
        veredito_final = "APROVADO" if "Aprovado" in p.status else "REJEITADO"
        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'data_revisao': p.data_revisao.strftime('%d/%m/%Y') if p.data_revisao else 'Data n/d',
            'meu_veredito': veredito_final,
            'autor_anonimo': f"Prof. de {p.disciplina}" 
        })
    
    return Response(lista)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_public_feed(request):
    producoes = Producao.objects.filter(status='Aprovado').order_by('-data_criacao')
    
    lista = []
    for p in producoes:
        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'nivel': p.nivel,
            'modelo_ia': p.modelo_ia,
            'categoria': p.categoria,
            'autor': p.user.first_name or p.user.username,
            'resumo': p.experiencia[:150] + '...' if p.experiencia else '',
            'likes': 0
        })
    
    return Response(lista)

# --- ONTOLOGIA (LEGADO) ---
@api_view(['GET'])
def api_listar_ciclos(request):
    return Response([])


# ============================================================================
# 4. RECUPERAÇÃO DE SENHA (SMTP GOOGLE)
# ============================================================================
@csrf_exempt
@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def api_password_reset_request(request):
    email = request.data.get('email')
    if not email:
        return Response({'erro': 'E-mail é obrigatório.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'mensagem': 'Se o e-mail existir, um link foi enviado.'})

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

    subject = "Redefinição de Senha - Comunidade IA"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [email]

    raw_name = user.first_name or user.username
    first_name = raw_name.split()[0].title()

    context = {'nome': first_name, 'link': reset_link}

    try:
        try:
            html_content = render_to_string('emails/password_reset.html', context)
            text_content = strip_tags(html_content)
        except Exception:
            html_content = None
            text_content = f"Olá, professor(a) {first_name}.\n\nClique no link: {reset_link}"

        if html_content:
            msg = EmailMultiAlternatives(subject, text_content, from_email, to)
            msg.attach_alternative(html_content, "text/html")
            msg.send()
        else:
            send_mail(subject, text_content, from_email, to, fail_silently=False)
        
        return Response({'mensagem': 'E-mail enviado com sucesso!'})
        
    except Exception as e:
        print("Erro ao enviar email:", e)
        return Response({'erro': 'Erro ao enviar e-mail.'}, status=500)

@csrf_exempt
@api_view(['POST'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def api_password_reset_confirm(request, uidb64, token):
    new_password = request.data.get('password')
    
    if not new_password:
        return Response({'erro': 'Nova senha é obrigatória.'}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'erro': 'Link inválido.'}, status=400)

    if default_token_generator.check_token(user, token):
        user.set_password(new_password)
        user.save()
        return Response({'mensagem': 'Senha alterada com sucesso!'})
    else:
        return Response({'erro': 'Link expirado ou inválido.'}, status=400)


# ============================================================================
# 5. ADMINISTRAÇÃO (APROVAÇÃO DE CONTAS)
# ============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_pending_users(request):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    profiles = Profile.objects.filter(status_conta='Em análise').select_related('user')
    lista = []
    for p in profiles:
        lista.append({
            'id': p.user.id,
            'nome': p.user.first_name or p.user.username,
            'email': p.user.email,
            'escola': p.escola,
            'disciplina': p.disciplina,
            'data_cadastro': p.user.date_joined.strftime('%d/%m/%Y')
        })
    return Response(lista)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_approve_reject_user(request, user_id):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    acao = request.data.get('acao')
    if acao not in ['Aprovado', 'Rejeitado']:
        return Response({'erro': 'Ação inválida'}, status=400)
        
    try:
        user_target = User.objects.get(id=user_id)
        profile = user_target.profile
        profile.status_conta = acao
        profile.save()
        
        mensagem = f"Usuário {user_target.username} foi {acao.lower()} com sucesso."
        return Response({'mensagem': mensagem})
    except User.DoesNotExist:
        return Response({'erro': 'Usuário não encontrado'}, status=404)