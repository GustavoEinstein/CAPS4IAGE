"""Módulo de Views de kipo_playground"""

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
from owlready2 import *
from os.path import exists
import os
import shutil
import json 
import sys 
import re 
from random import randint
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
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

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.throttling import ScopedRateThrottle 

from .models import Profile, Producao, Avaliacao, Topico, Comentario

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
            
        if not hasattr(user, 'profile'):
            raise AuthenticationFailed('Perfil não encontrado. Acesso negado.')
            
        if user.profile.status_conta == 'Em análise':
            raise AuthenticationFailed('Sua conta está em análise. Aguarde a aprovação do administrador.')
        elif user.profile.status_conta == 'Rejeitado':
            raise AuthenticationFailed('Sua conta foi rejeitada e não tem acesso ao sistema.')
            
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
        profile.status_conta = 'Em análise'
        profile.save()
        
        return Response({'mensagem': 'Conta criada com sucesso! Aguarde aprovação.'}, status=201)
        
    except Exception as e:
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
            'is_superuser': user.is_superuser,
            'pontos': profile.pontos,
            'nivel': profile.get_nivel() # <--- CORREÇÃO AQUI
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
            'escola': profile.escola,
            'pontos': profile.pontos,
            'nivel': profile.get_nivel() # <--- CORREÇÃO AQUI
        })


# ============================================================================
# 2. PRODUÇÕES DIDÁTICAS (CRUD E RASCUNHOS)
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
            return Response({'erro': f'Formato de arquivo inválido ({extensao}).'}, status=400)
    
    try:
        recursos_input = data.getlist('recursos') if hasattr(data, 'getlist') else data.get('recursos', '')
        recursos_str = ", ".join(recursos_input) if isinstance(recursos_input, list) else str(recursos_input)

        # --- LÓGICA DE RASCUNHO APLICADA (ROBUSTA) ---
        is_draft_val = data.get('is_draft')
        is_draft = str(is_draft_val).strip().lower() in ['true', '1', 't', 'y', 'yes']
        status_inicial = 'Rascunho' if is_draft else 'Em revisão'

        nova_producao = Producao.objects.create(
            user=user, 
            titulo=data.get('titulo', ''),
            disciplina=data.get('disciplina', ''),
            nivel=data.get('nivel_ensino', ''), 
            modelo_ia=data.get('modelo_ia', ''),
            prompts_ia=data.get('prompts_ia', ''),
            categoria=data.get('categoria', ''),
            bncc=data.get('bncc', ''),
            metodologia=data.get('metodologia', ''),
            duracao=data.get('duracao', ''),
            recursos=recursos_str,
            experiencia=data.get('experiencia', ''), 
            resultados=data.get('resultados', ''),
            arquivo=arquivo,
            status=status_inicial # Salva corretamente no banco!
        )
        return Response({'mensagem': 'Produção criada com sucesso!', 'id': nova_producao.id}, status=201)
    
    except Exception as e:
        return Response({'erro': 'Erro ao salvar produção.'}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_my_productions(request):
    user = request.user
    producoes = Producao.objects.filter(user=user).order_by('-data_criacao')
    
    lista = []
    for p in producoes:
        ultima_avaliacao = p.avaliacoes.order_by('-data_avaliacao').first()
        feedback = ultima_avaliacao.feedback_revisao if ultima_avaliacao else None

        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'status': p.status,
            'modelo_ia': p.modelo_ia,
            'feedback_revisor': feedback
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
        is_revisor = p.avaliacoes.filter(revisor=request.user).exists() 
        
        minha_disciplina = request.user.profile.disciplina if hasattr(request.user, 'profile') else 'Outra'
        is_potencial_revisor = (p.status == 'Em revisão' and p.disciplina == minha_disciplina and not is_dono)

        if not (is_dono or is_admin or is_aprovado or is_revisor or is_potencial_revisor):
            return Response({'erro': 'Acesso negado. Esta produção é privada ou ainda está em avaliação.'}, status=403)
        
        arquivo_url = request.build_absolute_uri(p.arquivo.url) if p.arquivo else None

        avaliacoes = p.avaliacoes.all()
        ultima_avaliacao = avaliacoes.order_by('-data_avaliacao').first()
        
        notas = None
        feedback_texto = None

        if ultima_avaliacao:
            feedback_texto = ultima_avaliacao.feedback_revisao
            notas = {
                'coerencia': ultima_avaliacao.nota_coerencia,
                'qualidade': ultima_avaliacao.nota_qualidade,
                'metodologia': ultima_avaliacao.nota_metodologia,
                'avaliacao': ultima_avaliacao.nota_avaliacao,
                'inclusao': ultima_avaliacao.nota_inclusao,
                'inovacao': ultima_avaliacao.nota_inovacao
            }

        lista_recursos = [r.strip() for r in p.recursos.split(',')] if p.recursos else []

        data = {
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'nivel': p.nivel,
            'modelo_ia': p.modelo_ia,
            'prompts_ia': p.prompts_ia,
            'categoria': p.categoria,
            'bncc': p.bncc,
            'metodologia': p.metodologia,
            'duracao': p.duracao,
            'recursos': lista_recursos,
            'experiencia': p.experiencia,
            'resultados': p.resultados,
            'arquivo': arquivo_url, 
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'status': p.status,
            'autor': p.user.first_name or p.user.username,
            'revisao_realizada': avaliacoes.exists(), 
            'is_aprovado': p.status == 'Aprovado' or p.status == 'Concluído',
            'feedback_texto': feedback_texto, 
            'notas': notas,
            'total_avaliacoes': avaliacoes.count()
        }
        return Response(data)
        
    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada'}, status=404)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_production(request, pk):
    try:
        p = Producao.objects.get(id=pk, user=request.user)
        
        if p.status not in ['Correção solicitada', 'Rascunho']:
            return Response({'erro': 'Esta produção não pode ser editada no momento.'}, status=403)

        data = request.data
        p.titulo = data.get('titulo', p.titulo)
        p.disciplina = data.get('disciplina', p.disciplina)
        p.nivel = data.get('nivel_ensino', p.nivel)
        p.modelo_ia = data.get('modelo_ia', p.modelo_ia)
        p.prompts_ia = data.get('prompts_ia', p.prompts_ia)
        p.categoria = data.get('categoria', p.categoria)
        p.bncc = data.get('bncc', p.bncc)
        p.metodologia = data.get('metodologia', p.metodologia)
        p.duracao = data.get('duracao', p.duracao)
        p.experiencia = data.get('experiencia', p.experiencia)
        p.resultados = data.get('resultados', p.resultados)

        recursos_input = data.getlist('recursos') if hasattr(data, 'getlist') else data.get('recursos')
        if recursos_input:
            p.recursos = ", ".join(recursos_input) if isinstance(recursos_input, list) else str(recursos_input)

        novo_arquivo = request.FILES.get('arquivo')
        if novo_arquivo:
            p.arquivo = novo_arquivo

        # --- LÓGICA DE UPDATE DE STATUS ---
        is_draft_val = data.get('is_draft')
        is_draft = str(is_draft_val).strip().lower() in ['true', '1', 't', 'y', 'yes']
        
        if is_draft:
            p.status = 'Rascunho'
        else:
            p.status = 'Em revisão' 
            p.avaliacoes.all().delete() # Limpa avaliações antigas se estiver mandando pra revisão de novo
            
        p.save()
        
        return Response({'mensagem': 'Produção atualizada com sucesso!'})

    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada.'}, status=404)
    except Exception as e:
        return Response({'erro': 'Erro interno ao atualizar.'}, status=500)


# ============================================================================
# 3. SISTEMA DE REVISÃO E GAMIFICAÇÃO
# ============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_review_queue(request):
    user = request.user
    
    try:
        minha_disciplina = user.profile.disciplina
    except:
        minha_disciplina = 'Outra'

    # SÓ BUSCA O QUE ESTIVER "Em revisão". Rascunhos e aprovações são ignorados!
    producoes_para_revisar = Producao.objects.filter(
        disciplina=minha_disciplina,
        status='Em revisão'
    ).exclude(user=user).exclude(avaliacoes__revisor=user).order_by('data_criacao')

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
            
        if Avaliacao.objects.filter(producao=p, revisor=request.user).exists():
            return Response({'erro': 'Você já avaliou esta produção.'}, status=400)
        
        data = request.data
        
        aprovado_raw = data.get('aprovado')
        if isinstance(aprovado_raw, str):
            aprovado = aprovado_raw.lower() in ['true', '1', 't', 'y', 'yes']
        else:
            aprovado = bool(aprovado_raw)
            
        pontos_fortes = data.get('pontos_fortes', '')
        pontos_melhoria = data.get('pontos_melhoria', '')
        
        feedback_texto = f"PONTOS FORTES:\n{pontos_fortes}\n\nSUGESTÕES DE MELHORIA:\n{pontos_melhoria}"
        
        avaliacao = Avaliacao.objects.create(
            producao=p,
            revisor=request.user,
            aprovado=aprovado,
            feedback_revisao=feedback_texto,
            nota_coerencia=int(data.get('nota_coerencia', 0)),
            nota_qualidade=int(data.get('nota_qualidade', 0)),
            nota_metodologia=int(data.get('nota_metodologia', 0)),
            nota_avaliacao=int(data.get('nota_avaliacao', 0)),
            nota_inclusao=int(data.get('nota_inclusao', 0)),
            nota_inovacao=int(data.get('nota_inovacao', 0))
        )

        perfil_revisor = request.user.profile
        perfil_revisor.pontos += 15
        perfil_revisor.save()

        if not aprovado:
            p.status = 'Correção solicitada'
            msg_response = 'Sua avaliação foi registrada. Você ganhou +15 XP! A produção foi devolvida ao autor para correção.'
            
            try:
                autor_email = p.user.email
                if autor_email:
                    assunto = f"Ação Necessária: Sua produção '{p.titulo}' precisa de atenção"
                    nome_autor = p.user.first_name.split()[0].title() if p.user.first_name else "Professor(a)"
                    mensagem_texto = f"Olá, {nome_autor}. Sua produção '{p.titulo}' precisa de ajustes. Acesse o sistema."
                    send_mail(assunto, mensagem_texto, settings.DEFAULT_FROM_EMAIL, [autor_email], fail_silently=True)
            except Exception:
                pass
        else:
            total_aprovacoes = p.avaliacoes.filter(aprovado=True).count()
            
            if total_aprovacoes >= 2:
                p.status = 'Aprovado'
                msg_response = 'Revisão registrada! Você ganhou +15 XP. A produção alcançou 2 aprovações e foi publicada na comunidade.'
                
                perfil_autor = p.user.profile
                perfil_autor.pontos += 50
                perfil_autor.save()
            else:
                p.status = 'Em revisão'
                msg_response = f'Revisão registrada! Você ganhou +15 XP. Esta produção agora possui {total_aprovacoes} aprovação(ões). Aguardando o segundo revisor.'

        p.save()
        return Response({'mensagem': msg_response})
        
    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada'}, status=404)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_review_history(request):
    user = request.user
    avaliacoes = Avaliacao.objects.filter(revisor=user).select_related('producao').order_by('-data_avaliacao')
    
    lista = []
    for a in avaliacoes:
        veredito_final = "APROVADO" if a.aprovado else "REJEITADO"
        lista.append({
            'id': a.producao.id,
            'titulo': a.producao.titulo,
            'disciplina': a.producao.disciplina,
            'data_revisao': a.data_avaliacao.strftime('%d/%m/%Y') if a.data_avaliacao else 'Data n/d',
            'meu_veredito': veredito_final,
            'autor_anonimo': f"Prof. de {a.producao.disciplina}" 
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

    try:
        text_content = f"Clique no link para redefinir: {reset_link}"
        send_mail(subject, text_content, from_email, to, fail_silently=False)
        return Response({'mensagem': 'E-mail enviado com sucesso!'})
    except Exception as e:
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


# ============================================================================
# 6. FÓRUM DA COMUNIDADE 
# ============================================================================
@api_view(['GET', 'POST', 'PUT', 'DELETE']) 
@permission_classes([IsAuthenticated])
def api_forum_detalhe_comentarios(request, pk):
    try:
        topico = Topico.objects.get(id=pk)
    except Topico.DoesNotExist:
        return Response({'erro': 'Tópico não encontrado'}, status=404)

    if request.method == 'GET':
        comentarios_db = topico.comentarios.all().order_by('data_criacao')
        lista_comentarios = []
        for c in comentarios_db:
            lista_comentarios.append({
                'id': c.id,
                'autor': c.autor.first_name or c.autor.username,
                'is_autor_topico': c.autor == topico.autor,
                'conteudo': c.conteudo,
                'data': timezone.localtime(c.data_criacao).strftime('%d/%m/%Y %H:%M')
            })

        arquivo_url = request.build_absolute_uri(topico.arquivo.url) if topico.arquivo else None

        dados_topico = {
            'id': topico.id,
            'titulo': topico.titulo,
            'conteudo': topico.conteudo,
            'categoria': topico.categoria,
            'resolvido': topico.resolvido,
            'autor': topico.autor.first_name or topico.autor.username,
            'is_dono_topico': topico.autor == request.user,
            'data': timezone.localtime(topico.data_criacao).strftime('%d/%m/%Y %H:%M'),
            'arquivo': arquivo_url,
            'comentarios': lista_comentarios
        }
        return Response(dados_topico)

    elif request.method == 'POST':
        if topico.resolvido:
            return Response({'erro': 'Este tópico já está resolvido e fechado.'}, status=400)
            
        conteudo = request.data.get('conteudo')
        if not conteudo:
            return Response({'erro': 'O comentário não pode ser vazio.'}, status=400)
            
        Comentario.objects.create(
            topico=topico,
            autor=request.user,
            conteudo=conteudo
        )

        perfil_comentarista = request.user.profile
        perfil_comentarista.pontos += 5
        perfil_comentarista.save()

        return Response({'mensagem': 'Comentário adicionado com sucesso! Você ganhou +5 XP.'})

    elif request.method == 'PUT':
        if topico.autor != request.user:
            return Response({'erro': 'Apenas o autor pode fechar o tópico.'}, status=403)
            
        topico.resolvido = True
        topico.save()
        return Response({'mensagem': 'Tópico marcado como resolvido!'})

    elif request.method == 'DELETE':
        if topico.autor != request.user and not request.user.is_superuser:
            return Response({'erro': 'Você não tem permissão para excluir este tópico.'}, status=403)
        
        topico.delete()
        return Response({'mensagem': 'Tópico excluído com sucesso!'}, status=200)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_forum_topicos(request):
    if request.method == 'GET':
        topicos = Topico.objects.all().order_by('-data_criacao')
        
        lista = []
        for t in topicos:
            disciplina = t.autor.profile.disciplina if hasattr(t.autor, 'profile') else 'Geral'
            
            lista.append({
                'id': t.id,
                'titulo': t.titulo,
                'categoria': t.categoria,
                'autor': t.autor.first_name or t.autor.username,
                'disciplina_autor': disciplina,
                'data': timezone.localtime(t.data_criacao).strftime('%d/%m/%Y %H:%M'),
                'resolvido': t.resolvido,
                'total_comentarios': t.comentarios.count()
            })

        return Response(lista)

    elif request.method == 'POST':
        titulo = request.data.get('titulo')
        conteudo = request.data.get('conteudo')
        categoria = request.data.get('categoria', 'Geral')
        
        arquivo_enviado = request.FILES.get('arquivo') 

        if not titulo or not conteudo:
            return Response({'erro': 'Título e conteúdo são obrigatórios.'}, status=400)

        Topico.objects.create(
            titulo=titulo,
            conteudo=conteudo,
            categoria=categoria,
            autor=request.user,
            arquivo=arquivo_enviado 
        )

        perfil_autor = request.user.profile
        perfil_autor.pontos += 5
        perfil_autor.save()

        return Response({'mensagem': 'Tópico criado com sucesso! Você ganhou +5 XP.'}, status=201)

# ============================================================================
# 7. PAINEL DE ADMINISTRAÇÃO GERAL
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_list_users(request):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    users = User.objects.all().select_related('profile').order_by('-date_joined')
    lista = []
    for u in users:
        disciplina = u.profile.disciplina if hasattr(u, 'profile') else 'N/A'
        lista.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'disciplina': disciplina,
            'is_superuser': u.is_superuser
        })
    return Response(lista)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_admin_delete_user(request, pk):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    if request.user.id == pk:
        return Response({'erro': 'Você não pode excluir a si mesmo.'}, status=400)
        
    user_to_delete = get_object_or_404(User, id=pk)
    user_to_delete.delete()
    return Response({'mensagem': 'Usuário excluído com sucesso.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_list_productions(request):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    prods = Producao.objects.all().order_by('-data_criacao')
    lista = [{
        'id': p.id,
        'titulo': p.titulo,
        'autor': p.user.username,
        'status': p.status,
        'data': timezone.localtime(p.data_criacao).strftime('%d/%m/%Y')
    } for p in prods]
    
    return Response(lista)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_admin_delete_production(request, pk):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    prod = get_object_or_404(Producao, id=pk)
    prod.delete()
    return Response({'mensagem': 'Produção excluída com sucesso.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_admin_list_forum(request):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    topicos = Topico.objects.all().order_by('-data_criacao')
    lista = [{
        'id': t.id,
        'titulo': t.titulo,
        'autor': t.autor.username,
        'categoria': t.categoria
    } for t in topicos]
    
    return Response(lista)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_admin_delete_forum(request, pk):
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    topico = get_object_or_404(Topico, id=pk)
    topico.delete()
    return Response({'mensagem': 'Tópico excluído com sucesso.'})


# --- ONTOLOGIA (LEGADO) COISAS DO PROJETO ANTIGO PARA FUNCIONAR ---
@api_view(['GET'])
@permission_classes([AllowAny])
def api_listar_ciclos(request):
    return Response([])