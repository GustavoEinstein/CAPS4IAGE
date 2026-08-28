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

# --- IMPORTS DO REST FRAMEWORK ---
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
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
from django.db.models import Count, Q

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.throttling import ScopedRateThrottle 

# Importação dos modelos
from .models import (
    Profile, Producao, Avaliacao, Topico, Comentario, RegistroXP, 
    Conquista, ConquistaUsuario, DiarioOperacao, NotaDiario, ConfiguracaoXP, Escola, Disciplina, Notificacao
)


# Lista de arquivos permitidos no servidor
ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.txt', 
    '.ppt', '.pptx', '.xls', '.xlsx', 
    '.jpg', '.jpeg', '.png'
]

# ============================================================================
# FUNÇÃO AUXILIAR DE GAMIFICAÇÃO
# ============================================================================
def adicionar_xp(perfil, quantidade, descricao):
    """Adiciona XP ao perfil, gera histórico e dispara notificações"""
    nivel_anterior = perfil.get_nivel()
    
    perfil.pontos += quantidade
    perfil.save()
    
    RegistroXP.objects.create(
        perfil=perfil,
        quantidade=quantidade,
        descricao=descricao
    )

    Notificacao.objects.create(
        user=perfil.user,
        titulo=f"+{quantidade} XP",
        mensagem=descricao,
        tipo='XP'
    )

    nivel_atual = perfil.get_nivel()
    if nivel_anterior != nivel_atual:
        Notificacao.objects.create(
            user=perfil.user,
            titulo="🎉 Subiu de Nível!",
            mensagem=f"Parabéns! Você alcançou o título de: {nivel_atual}",
            tipo='NIVEL'
        )

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
# OPÇÕES PARA O FORMULÁRIO DE REGISTRO
# ============================================================================
@api_view(['GET'])
@authentication_classes([]) 
@permission_classes([AllowAny])
def api_get_register_options(request):
    escolas = list(Escola.objects.values_list('nome', flat=True).order_by('nome'))
    disciplinas = list(Disciplina.objects.values_list('nome', flat=True).order_by('nome'))
    
    if "Outra" not in disciplinas:
        disciplinas.append("Outra")

    return Response({
        'escolas': escolas,
        'disciplinas': disciplinas
    })


# ============================================================================
# AUTENTICAÇÃO E PERFIL
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
        progresso = profile.get_progresso_proximo_nivel()

        conquistas_usuario = profile.conquistas.all().select_related('conquista')
        lista_conquistas = [{
            'id': c.conquista.id,
            'nome': c.conquista.nome,
            'descricao': c.conquista.descricao,
            'icone': c.conquista.icone,
            'data': c.data_conquista.strftime('%d/%m/%Y')
        } for c in conquistas_usuario]

        return Response({
            'id': user.id,
            'username': nome_exibicao,
            'email': user.email,
            'disciplina': profile.disciplina,
            'escola': profile.escola, 
            'avatar': avatar_url,
            'is_superuser': user.is_superuser,
            'pontos': profile.pontos,
            'nivel': profile.get_nivel(),
            'progresso': progresso,
            'conquistas': lista_conquistas
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
            'nivel': profile.get_nivel(),
            'progresso': profile.get_progresso_proximo_nivel()
        })


# ============================================================================
# PRODUÇÃO DIDÁTICA E RASCUNHO (ATUALIZADO FASE 1)
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

        is_draft_val = data.get('is_draft')
        is_draft = str(is_draft_val).strip().lower() in ['true', '1', 't', 'y', 'yes']
        status_inicial = 'Rascunho' if is_draft else 'Em revisão'

        # --- LÓGICA DE AUTORIA (ANONIMATO) ---
        exibir_autor_val = data.get('exibir_autor', True)
        exibir_autor = str(exibir_autor_val).strip().lower() not in ['false', '0', 'f', 'n']

        # --- LÓGICA DE RELEITURA (HERANÇA) ---
        producao_base_id = data.get('producao_base')
        producao_base = None
        if producao_base_id:
            try:
                producao_base = Producao.objects.get(id=producao_base_id)
            except Producao.DoesNotExist:
                pass

        nova_producao = Producao.objects.create(
            user=user, 
            titulo=data.get('titulo', ''),
            exibir_autor=exibir_autor,     # Salva a escolha do anonimato
            producao_base=producao_base,   # Associa à prática que serviu de base
            disciplina=data.get('disciplina', ''),
            nivel=data.get('nivel_ensino', ''), 
            modelo_ia=data.get('modelo_ia', ''),
            prompts_ia=data.get('prompts_ia', ''),
            categoria=data.get('categoria', ''),
            bncc=data.get('bncc', ''),
            bncc_computacao=data.get('bncc_computacao', ''), 
            metodologia=data.get('metodologia', ''),
            duracao=data.get('duracao', ''),
            recursos=recursos_str,
            experiencia=data.get('experiencia', ''), 
            resultados=data.get('resultados', ''),
            arquivo=arquivo,
            link_material=data.get('link_material', ''),
            status=status_inicial 
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

        total_aprovacoes = p.avaliacoes.filter(aprovado=True).count()

        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'status': p.status,
            'modelo_ia': p.modelo_ia,
            'feedback_revisor': feedback,
            'total_aprovacoes': total_aprovacoes 
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
        is_revisor_desta_pratica = p.avaliacoes.filter(revisor=request.user).exists() 
        
        minha_disciplina = request.user.profile.disciplina if hasattr(request.user, 'profile') else 'Outra'
        is_potencial_revisor = (p.status == 'Em revisão' and p.disciplina == minha_disciplina and not is_dono)

        if not (is_dono or is_admin or is_aprovado or is_revisor_desta_pratica or is_potencial_revisor):
            return Response({'erro': 'Acesso negado. Esta produção é privada ou ainda está em avaliação.'}, status=403)
        
        arquivo_url = request.build_absolute_uri(p.arquivo.url) if p.arquivo else None

        avaliacoes = p.avaliacoes.all().order_by('data_avaliacao')
        avaliacoes_detalhadas = []
        
        for i, aval in enumerate(avaliacoes):
            raw_feedback = aval.feedback_revisao or ""
            pontos_fortes = ""
            pontos_melhoria = ""
            
            if "SUGESTÕES DE MELHORIA:" in raw_feedback:
                parts = raw_feedback.split("SUGESTÕES DE MELHORIA:")
                pontos_fortes = parts[0].replace("PONTOS FORTES:", "").strip()
                pontos_melhoria = parts[1].strip()
            else:
                pontos_fortes = raw_feedback
                
            avaliacoes_detalhadas.append({
                'ordem': i + 1,
                'revisor_id': aval.revisor.id, 
                'aprovado': aval.aprovado,
                'pontos_fortes': pontos_fortes,
                'pontos_melhoria': pontos_melhoria,
                'data': aval.data_avaliacao.strftime('%d/%m/%Y') if aval.data_avaliacao else '',
                'notas': {
                    'coerencia': aval.nota_coerencia,
                    'qualidade': aval.nota_qualidade,
                    'metodologia': aval.nota_metodologia,
                    'avaliacao': aval.nota_avaliacao,
                    'inclusao': aval.nota_inclusao,
                    'inovacao': aval.nota_inovacao
                }
            })

        ultima_avaliacao = avaliacoes.last()
        feedback_texto = ultima_avaliacao.feedback_revisao if ultima_avaliacao else None

        lista_recursos = [r.strip() for r in p.recursos.split(',')] if p.recursos else []

        dados_referencia = None
        if p.producao_base:
            # Pega o autor original respeitando o anonimato dele também!
            autor_original = p.producao_base.user.first_name or p.producao_base.user.username
            autor_exibicao_original = autor_original if p.producao_base.exibir_autor else "Professor(a) Anônimo(a)"
            
            dados_referencia = {
                'id': p.producao_base.id,
                'titulo': p.producao_base.titulo,
                'autor': autor_exibicao_original 
            }

        total_aprovacoes = avaliacoes.filter(aprovado=True).count()

        avaliacoes_filtradas = []
        if is_dono or is_admin:
            avaliacoes_filtradas = avaliacoes_detalhadas
        elif is_revisor_desta_pratica:
            avaliacoes_filtradas = [a for a in avaliacoes_detalhadas if a['revisor_id'] == request.user.id]

        notas = avaliacoes_filtradas[-1]['notas'] if avaliacoes_filtradas else None

        data = {
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'nivel': p.nivel,
            'modelo_ia': p.modelo_ia,
            'prompts_ia': p.prompts_ia,
            'categoria': p.categoria,
            'bncc': p.bncc,
            'bncc_computacao': p.bncc_computacao, 
            'metodologia': p.metodologia,
            'duracao': p.duracao,
            'recursos': lista_recursos,
            'experiencia': p.experiencia,
            'resultados': p.resultados,
            'arquivo': arquivo_url, 
            'link_material': p.link_material,
            'data': p.data_criacao.strftime('%d/%m/%Y'),
            'status': p.status,
            
            # --- NOVA LÓGICA DE AUTORIA ---
            # Se for o dono ou admin, vê o nome verdadeiro. Senão, respeita o check de anonimato
            'autor': p.user.first_name or p.user.username if (p.exibir_autor or is_dono or is_admin) else "Professor(a) Anônimo(a)",
            'exibir_autor': p.exibir_autor, # Passado para o front renderizar o checkbox/toggle
            
            'is_dono': is_dono,
            'is_admin': is_admin,
            'is_revisor': is_revisor_desta_pratica, 

            'revisao_realizada': len(avaliacoes_filtradas) > 0, 
            'avaliacoes_detalhadas': avaliacoes_filtradas,
            'feedback_texto': feedback_texto if (is_dono or is_admin) else None, 
            'notas': notas,
            'total_avaliacoes': avaliacoes.count(), 
            'total_aprovacoes': total_aprovacoes,

            'is_aprovado': is_aprovado,
            'producao_base': dados_referencia 
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
        p.bncc_computacao = data.get('bncc_computacao', p.bncc_computacao) 
        p.metodologia = data.get('metodologia', p.metodologia)
        p.duracao = data.get('duracao', p.duracao)
        p.experiencia = data.get('experiencia', p.experiencia)
        p.resultados = data.get('resultados', p.resultados)
        p.link_material = data.get('link_material', p.link_material)

        # Atualiza a preferência de anonimato se enviado no rascunho
        if 'exibir_autor' in data:
            exibir_autor_val = data.get('exibir_autor')
            p.exibir_autor = str(exibir_autor_val).strip().lower() not in ['false', '0', 'f', 'n']

        recursos_input = data.getlist('recursos') if hasattr(data, 'getlist') else data.get('recursos')
        if recursos_input:
            p.recursos = ", ".join(recursos_input) if isinstance(recursos_input, list) else str(recursos_input)

        novo_arquivo = request.FILES.get('arquivo')
        if novo_arquivo:
            p.arquivo = novo_arquivo

        is_draft_val = data.get('is_draft')
        is_draft = str(is_draft_val).strip().lower() in ['true', '1', 't', 'y', 'yes']
        
        if is_draft:
            p.status = 'Rascunho'
        else:
            p.status = 'Em revisão' 
            p.avaliacoes.all().delete()
            
        p.save()
        
        return Response({'mensagem': 'Produção atualizada com sucesso!'})

    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada.'}, status=404)
    except Exception as e:
        return Response({'erro': 'Erro interno ao atualizar.'}, status=500)


# ============================================================================
# NOVO: CONTROLE DE VISIBILIDADE DO AUTOR (LIGA/DESLIGA)
# ============================================================================
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_toggle_author_visibility(request, pk):
    """Permite que apenas o dono da prática ligue/desligue seu nome a qualquer momento"""
    try:
        p = Producao.objects.get(id=pk, user=request.user)
        p.exibir_autor = not p.exibir_autor
        p.save()
        status_msg = "visível" if p.exibir_autor else "oculto"
        return Response({
            'mensagem': f'Seu nome agora está {status_msg} na comunidade.', 
            'exibir_autor': p.exibir_autor
        })
    except Producao.DoesNotExist:
        return Response({'erro': 'Acesso negado ou prática não encontrada.'}, status=404)


# ============================================================================
# SISTEMA DE REVISÃO E GAMIFICAÇÃO DO SISTEMA
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
        
        Avaliacao.objects.create(
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

        config_xp, _ = ConfiguracaoXP.objects.get_or_create(pk=1)

        perfil_revisor = request.user.profile
        adicionar_xp(perfil_revisor, config_xp.xp_revisao, f"Revisão da produção: {p.titulo}")

        if not aprovado:
            p.status = 'Correção solicitada'
            msg_response = f'Sua avaliação foi registrada. Você ganhou +{config_xp.xp_revisao} XP! A produção foi devolvida ao autor para correção.'
            
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
                msg_response = f'Revisão registrada! Você ganhou +{config_xp.xp_revisao} XP. A produção alcançou 2 aprovações e foi publicada na comunidade.'
                
                perfil_autor = p.user.profile
                adicionar_xp(perfil_autor, config_xp.xp_aprovacao, f"Produção aprovada pela comunidade: {p.titulo}")
            else:
                p.status = 'Em revisão'
                msg_response = f'Revisão registrada! Você ganhou +{config_xp.xp_revisao} XP. Esta produção agora possui {total_aprovacoes} aprovação(ões). Aguardando o segundo revisor.'

        p.save()
        return Response({'mensagem': msg_response, 'xp_ganho': config_xp.xp_revisao})
        
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


# ============================================================================
# FEED DA COMUNIDADE (ATUALIZADO FASE 1)
# ============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_public_feed(request):
    producoes = Producao.objects.filter(status='Aprovado').select_related('producao_base').order_by('-data_criacao')
    
    busca = request.GET.get('search', '')
    
    if busca:
        producoes = producoes.filter(
            Q(titulo__icontains=busca) |
            Q(disciplina__icontains=busca) |
            Q(categoria__icontains=busca) |
            Q(experiencia__icontains=busca)
        )
    
    lista = []
    for p in producoes:
        # --- LÓGICA DE ANONIMATO NO FEED ---
        nome_autor = p.user.first_name or p.user.username
        autor_exibicao = nome_autor if p.exibir_autor else "Professor(a) Anônimo(a)"

        # --- LÓGICA DE RELEITURA (HERANÇA) ---
        base_info = None
        if p.producao_base:
            base_info = {
                'id': p.producao_base.id, 
                'titulo': p.producao_base.titulo
            }

        lista.append({
            'id': p.id,
            'titulo': p.titulo,
            'disciplina': p.disciplina,
            'nivel': p.nivel,
            'modelo_ia': p.modelo_ia,
            'categoria': p.categoria,
            'autor': autor_exibicao,
            'producao_base': base_info,
            'resumo': p.experiencia[:150] + '...' if p.experiencia else '', 
            'likes': 0 
        })
    
    return Response(lista) 


#painel de recuperação de senha
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
        # Por segurança, sempre dizemos que foi enviado mesmo se não existir
        return Response({'mensagem': 'Se o e-mail existir, um link foi enviado.'})

    # Gera o Token seguro do Django
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

    subject = "Redefinição de Senha - T.E.I.A"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [email]

    try:
        # Pega a URL base dinamicamente apontando para a pasta assets
        logo_url = request.build_absolute_uri(settings.STATIC_URL + 'assets/unb.png')
        
        # 1. Prepara as variáveis para o seu template HTML
        nome_usuario = user.first_name if user.first_name else user.username
        context = {
            'nome': nome_usuario.split()[0].title(), # Pega só o primeiro nome
            'link': reset_link,
            'logo_url': logo_url
        }

        # 2. Renderiza o HTML que você criou
        html_content = render_to_string('emails/password_reset_email.html', context)
        
        # 3. Cria uma versão em texto puro caso o provedor de e-mail bloqueie HTML
        text_content = strip_tags(html_content)

        # 4. Monta a mensagem e envia
        msg = EmailMultiAlternatives(subject, text_content, from_email, to)
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)

        return Response({'mensagem': 'E-mail enviado com sucesso!'})
        
    except Exception as e:
        print(f"ERRO AO ENVIAR E-MAIL: {e}") # Isso vai aparecer no seu terminal do backend para ajudar a debugar!
        return Response({'erro': 'Erro ao enviar e-mail. Verifique o console.'}, status=500)

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


#painel de aprovação de contas 
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


#views para o forum do sistema 
@api_view(['GET', 'POST', 'PUT', 'DELETE']) 
@permission_classes([IsAuthenticated])
def api_forum_detalhe_comentarios(request, pk):
    try:
        topico = Topico.objects.get(id=pk)
    except Topico.DoesNotExist:
        return Response({'erro': 'Tópico não encontrado'}, status=404)

    config_xp, _ = ConfiguracaoXP.objects.get_or_create(pk=1)

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
        
        dados_base = None
        if topico.producao_base:
            dados_base = {
                'id': topico.producao_base.id,
                'titulo': topico.producao_base.titulo,
                'disciplina': topico.producao_base.disciplina,
                'autor': topico.producao_base.user.first_name or topico.producao_base.user.username
            }

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
            'producao_base': dados_base,
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
        adicionar_xp(perfil_comentarista, config_xp.xp_comentario, f"Comentário no tópico: {topico.titulo}")

        return Response({
            'mensagem': f'Comentário adicionado com sucesso! Você ganhou +{config_xp.xp_comentario} XP.',
            'xp_ganho': config_xp.xp_comentario
        })

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
        producao_base_id = request.data.get('producao_base_id')
        
        arquivo_enviado = request.FILES.get('arquivo') 

        if not titulo or not conteudo:
            return Response({'erro': 'Título e conteúdo são obrigatórios.'}, status=400)
            
        producao_base = None
        if producao_base_id:
            try:
                producao_base = Producao.objects.get(id=producao_base_id, status='Aprovado')
            except Producao.DoesNotExist:
                pass

        Topico.objects.create(
            titulo=titulo,
            conteudo=conteudo,
            categoria=categoria,
            autor=request.user,
            arquivo=arquivo_enviado,
            producao_base=producao_base 
        )

        config_xp, _ = ConfiguracaoXP.objects.get_or_create(pk=1)
        perfil_autor = request.user.profile
        adicionar_xp(perfil_autor, config_xp.xp_topico, f"Novo tópico aberto: {titulo}")

        return Response({
            'mensagem': f'Tópico criado com sucesso! Você ganhou +{config_xp.xp_topico} XP.',
            'xp_ganho': config_xp.xp_topico
        }, status=201)



#views para o painel de administração

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


@api_view(['GET'])
@permission_classes([AllowAny])
def api_listar_ciclos(request):
    return Response([])


# SISTEMA DE RANKING
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_ranking_gamificacao(request):
    top_xp_users = Profile.objects.select_related('user').order_by('-pontos')[:10]
    top_xp = [{
        'id': p.user.id,
        'nome': p.user.first_name or p.user.username,
        'disciplina': p.disciplina,
        'pontos': p.pontos,
        'nivel': p.get_nivel(),
    } for p in top_xp_users if p.pontos > 0]

    revisores_qs = User.objects.annotate(
        total_revisoes=Count('revisoes_feitas', distinct=True)
    ).order_by('-total_revisoes')[:10]
    
    top_revisores = [{
        'id': u.id,
        'nome': u.first_name or u.username,
        'disciplina': u.profile.disciplina if hasattr(u, 'profile') else 'Geral',
        'total': u.total_revisoes,
        'nivel': u.profile.get_nivel() if hasattr(u, 'profile') else ''
    } for u in revisores_qs if u.total_revisoes > 0]

    forum_qs = User.objects.annotate(
        total_forum=Count('topicos_forum', distinct=True) + Count('comentarios_usuario', distinct=True)
    ).order_by('-total_forum')[:10]
    
    top_forum = [{
        'id': u.id,
        'nome': u.first_name or u.username,
        'disciplina': u.profile.disciplina if hasattr(u, 'profile') else 'Geral',
        'total': u.total_forum,
        'nivel': u.profile.get_nivel() if hasattr(u, 'profile') else ''
    } for u in forum_qs if u.total_forum > 0]

    return Response({
        'top_xp': top_xp,
        'top_revisores': top_revisores,
        'top_forum': top_forum
    })

# ============================================================================
# GESTÃO DE GAMIFICAÇÃO (ADMIN)
# ============================================================================
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def api_admin_gamificacao(request):
    """View para o Administrador gerenciar conquistas e auditar o histórico de XP"""
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)

    if request.method == 'GET':
        conquistas = Conquista.objects.all()
        lista_conquistas = [{
            'id': c.id,
            'nome': c.nome,
            'descricao': c.descricao,
            'icone': c.icone,
            'xp_bonus': c.xp_bonus
        } for c in conquistas]

        historico_recente = RegistroXP.objects.select_related('perfil__user').order_by('-data')[:20]
        lista_historico = [{
            'usuario': h.perfil.user.username,
            'quantidade': h.quantidade,
            'descricao': h.descricao,
            'data': h.data.strftime('%d/%m/%Y %H:%M')
        } for h in historico_recente]

        return Response({
            'conquistas_disponiveis': lista_conquistas,
            'auditoria_xp': lista_historico
        })

    elif request.method == 'POST':
        data = request.data
        try:
            Conquista.objects.create(
                nome=data.get('nome'),
                descricao=data.get('descricao'),
                icone=data.get('icone', 'award'),
                xp_bonus=int(data.get('xp_bonus', 0))
            )
            return Response({'mensagem': 'Conquista criada com sucesso!'}, status=201)
        except Exception as e:
            return Response({'erro': 'Erro ao criar conquista.'}, status=400)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def api_admin_delete_badge(request, pk):
    """Exclui uma badge cadastrada no sistema"""
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    conquista = get_object_or_404(Conquista, id=pk)
    conquista.delete()
    return Response({'mensagem': 'Badge excluída com sucesso.'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_admin_atribuir_badge(request):
    """Atribui manualmente uma medalha a um usuário e concede o XP"""
    if not request.user.is_superuser:
        return Response({'erro': 'Acesso negado'}, status=403)
        
    user_id = request.data.get('usuario_id')
    conquista_id = request.data.get('conquista_id')
    
    try:
        perfil = Profile.objects.get(user__id=user_id)
        conquista = Conquista.objects.get(id=conquista_id)
        
        if ConquistaUsuario.objects.filter(perfil=perfil, conquista=conquista).exists():
            return Response({'erro': 'O usuário já possui esta medalha.'}, status=400)
            
        ConquistaUsuario.objects.create(perfil=perfil, conquista=conquista)
        adicionar_xp(perfil, conquista.xp_bonus, f"Medalha Atribuída: {conquista.nome}")
        
        return Response({'mensagem': 'Medalha atribuída com sucesso!'})
    except Exception as e:
        return Response({'erro': 'Erro ao atribuir medalha.'}, status=400)


# ============================================================================
# DIÁRIO DE OPERAÇÕES (CRM INTERNO)
# ============================================================================
class DiarioOperacaoView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        logs = DiarioOperacao.objects.all().select_related('docente')
        dados = []
        
        for log in logs:
            dados.append({
                'id': log.id,
                'titulo': log.titulo,
                'tipo': log.tipo,
                'status': log.status,
                'contato': log.contato or (log.docente.first_name if log.docente else 'Não informado'),
                'docente_id': log.docente.id if log.docente else None,
                'data_evento': log.data_evento.strftime('%Y-%m-%d') if log.data_evento else None,
                'descricao': log.descricao,
                'proximos_passos': log.proximos_passos,
                'tags': log.tags,
                'participantes': log.participantes,
                'foto': request.build_absolute_uri(log.foto.url) if log.foto else None,
            })
        return Response(dados)

    def post(self, request):
        titulo = request.data.get('titulo')
        tipo = request.data.get('tipo')
        status_registro = request.data.get('status', 'Resolvido')
        docente_id = request.data.get('docente_id')
        contato = request.data.get('contato')
        data_evento = request.data.get('data_evento')
        descricao = request.data.get('descricao')
        proximos_passos = request.data.get('proximos_passos')
        tags = request.data.get('tags')
        participantes = request.data.get('participantes', 1)
        
        foto = request.FILES.get('foto')

        if not all([titulo, tipo, data_evento, descricao]):
            return Response({'erro': 'Campos obrigatórios faltando.'}, status=status.HTTP_400_BAD_REQUEST)

        docente = None
        if docente_id:
            try:
                docente = User.objects.get(id=docente_id)
            except User.DoesNotExist:
                pass

        novo_log = DiarioOperacao.objects.create(
            titulo=titulo,
            tipo=tipo,
            status=status_registro,
            docente=docente,
            contato=contato,
            data_evento=data_evento,
            descricao=descricao,
            proximos_passos=proximos_passos,
            tags=tags,
            participantes=participantes,
            foto=foto
        )

        return Response({
            'id': novo_log.id,
            'titulo': novo_log.titulo,
            'tipo': novo_log.tipo,
            'status': novo_log.status,
            'contato': novo_log.contato or (novo_log.docente.first_name if novo_log.docente else 'Não informado'),
            'docente_id': novo_log.docente.id if novo_log.docente else None,
            'data_evento': data_evento, 
            'descricao': novo_log.descricao,
            'proximos_passos': novo_log.proximos_passos,
            'tags': novo_log.tags,
            'participantes': novo_log.participantes,
            'foto': request.build_absolute_uri(novo_log.foto.url) if novo_log.foto else None,
        }, status=status.HTTP_201_CREATED)

class DiarioOperacaoDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, pk):
        try:
            log = DiarioOperacao.objects.get(pk=pk)
            log.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except DiarioOperacao.DoesNotExist:
            return Response({'erro': 'Registro não encontrado'}, status=status.HTTP_404_NOT_FOUND)

class DiarioNotaView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            diario = DiarioOperacao.objects.get(pk=pk)
        except DiarioOperacao.DoesNotExist:
            return Response({'erro': 'Registro não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        notas = diario.notas.all()
        lista_notas = [{
            'id': n.id,
            'autor': n.autor.first_name or n.autor.username if n.autor else 'Sistema',
            'texto': n.texto,
            'criado_em': timezone.localtime(n.criado_em).strftime('%d/%m/%Y %H:%M')
        } for n in notas]

        dados_diario = {
            'id': diario.id,
            'titulo': diario.titulo,
            'tipo': diario.tipo,
            'status': diario.status,
            'contato': diario.contato or (diario.docente.first_name if diario.docente else 'Não informado'),
            'data_evento': diario.data_evento.strftime('%Y-%m-%d') if diario.data_evento else None,
            'descricao': diario.descricao,
            'proximos_passos': diario.proximos_passos,
            'tags': diario.tags,
            'participantes': diario.participantes,
            'foto': request.build_absolute_uri(diario.foto.url) if diario.foto else None,
        }
        
        return Response({'diario': dados_diario, 'notas': lista_notas})

    def post(self, request, pk):
        try:
            diario = DiarioOperacao.objects.get(pk=pk)
        except DiarioOperacao.DoesNotExist:
            return Response({'erro': 'Registro não encontrado'}, status=status.HTTP_404_NOT_FOUND)
        
        texto = request.data.get('texto')
        novo_status = request.data.get('status') 

        if novo_status and novo_status != diario.status:
            diario.status = novo_status
            diario.save()

        if texto:
            NotaDiario.objects.create(
                diario=diario,
                autor=request.user,
                texto=texto
            )
        
        return Response({'mensagem': 'Ticket atualizado com sucesso!'})

# ============================================================================
# CONFIGURAÇÕES GERAIS (XP, Escolas e Disciplinas)
# ============================================================================
class ConfiguracoesGeraisView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        config_xp, _ = ConfiguracaoXP.objects.get_or_create(pk=1)
        escolas = Escola.objects.all().values('id', 'nome').order_by('nome')
        disciplinas = Disciplina.objects.all().values('id', 'nome').order_by('nome')

        return Response({
            'xp': {
                'xp_revisao': config_xp.xp_revisao,
                'xp_aprovacao': config_xp.xp_aprovacao,
                'xp_topico': config_xp.xp_topico,
                'xp_comentario': config_xp.xp_comentario
            },
            'escolas': list(escolas),
            'disciplinas': list(disciplinas)
        })

    def post(self, request):
        acao = request.data.get('acao')

        if acao == 'atualizar_xp':
            config_xp, _ = ConfiguracaoXP.objects.get_or_create(pk=1)
            config_xp.xp_revisao = request.data.get('xp_revisao', config_xp.xp_revisao)
            config_xp.xp_aprovacao = request.data.get('xp_aprovacao', config_xp.xp_aprovacao)
            config_xp.xp_topico = request.data.get('xp_topico', config_xp.xp_topico)
            config_xp.xp_comentario = request.data.get('xp_comentario', config_xp.xp_comentario)
            config_xp.save()
            return Response({'mensagem': 'Economia de XP atualizada!'})

        elif acao == 'adicionar_escola':
            nome = request.data.get('nome')
            if nome:
                Escola.objects.get_or_create(nome=nome)
                return Response({'mensagem': 'Escola adicionada com sucesso!'})
            return Response({'erro': 'Nome inválido'}, status=400)

        elif acao == 'remover_escola':
            escola_id = request.data.get('id')
            Escola.objects.filter(id=escola_id).delete()
            return Response({'mensagem': 'Escola removida!'})

        elif acao == 'adicionar_disciplina':
            nome = request.data.get('nome')
            if nome:
                Disciplina.objects.get_or_create(nome=nome)
                return Response({'mensagem': 'Disciplina adicionada com sucesso!'})
            return Response({'erro': 'Nome inválido'}, status=400)

        elif acao == 'remover_disciplina':
            disciplina_id = request.data.get('id')
            Disciplina.objects.filter(id=disciplina_id).delete()
            return Response({'mensagem': 'Disciplina removida!'})

        return Response({'erro': 'Ação desconhecida'}, status=400)

# ============================================================================
# SISTEMA DE NOTIFICAÇÕES (GET e POST)
# ============================================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_notifications(request):
    """Retorna as 20 notificações mais recentes do usuário."""
    notificacoes = request.user.notificacoes.all()[:20]
    lista = [{
        'id': n.id,
        'titulo': n.titulo,
        'mensagem': n.mensagem,
        'tipo': n.tipo,
        'lida': n.lida,
        'data': timezone.localtime(n.data_criacao).strftime('%d/%m %H:%M')
    } for n in notificacoes]
    
    return Response(lista)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_mark_notifications_read(request):
    """Marca todas as notificações não lidas como lidas."""
    request.user.notificacoes.filter(lida=False).update(lida=True)
    return Response({'mensagem': 'Notificações marcadas como lidas.'})