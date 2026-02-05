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
from owlready2 import *         # https://pypi.org/project/Owlready2/
from os.path import exists
import os
import shutil
import json 
import sys 
from random import randint
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Profile  # Importante importar o Model aqui

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



# Comandos básicos
# source venv/bin/activate
# python3 manage.py runserver 

def logout_user(request):
    """ Faz logout e redireciona para página de registro.
        
        :param request: HTTP Request. 
    
        :return: Redirect. 
    """
    
    logout(request)
    return redirect('register')

def login_page(request):
    """ Página de login.
        
        :param request: HTTP Request. 
    
        :return: Redirect ou mensagem de erro no login se usuário e senha não existem ou não batem. 
    """
    
    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            # messages.sucess(request, 'Welcome!')
            return redirect('/kipo_playground/welcome/')
        else:
            messages.info(request, 'bad login!')

    context = {}
    return render(request, 'login.html', context)

def register(request):
    """ Página de registro de usuário.
        
        :param request: HTTP Request. 
    
        :return: Redirect para início do sistema se registro foi criaod com sucesso ou mostra de página de registro. 
    """

    form = CreateUser()

    if request.method == 'POST':
        form = CreateUser(request.POST)
        if form.is_valid():
            form.save()

            # messages.sucess(request, 'Acccount created!')

            return redirect('/kipo_playground/welcome/')

    context = {'form':form}
    return render(request, 'register.html', context)

from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

# Importe seus models e serializers aqui, caso não estejam
# from .models import Profile, Producao

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

    if not username or not password or not email:
        return Response({'erro': 'Preencha todos os campos obrigatórios.'}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({'erro': 'Este nome de usuário já está em uso.'}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({'erro': 'Este e-mail já possui uma conta cadastrada.'}, status=400)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name 
        )
        
        profile, created = Profile.objects.get_or_create(user=user)
        profile.disciplina = disciplina
        profile.save()
        
        return Response({'mensagem': 'Conta criada com sucesso!'}, status=201)
        
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
            'avatar': avatar_url
        })

    elif request.method == 'PUT':
        data = request.data
        
        if 'disciplina' in data:
            profile.disciplina = data['disciplina']

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
            'disciplina': profile.disciplina
        })


# ============================================================================
# 2. PRODUÇÕES DIDÁTICAS (CRUD)
# ============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_create_production(request):
    user = request.user
    data = request.data
    
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
            arquivo=request.FILES.get('arquivo')
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
            
            # --- DADOS DA REVISÃO ---
            # 1. Flag para saber se mostra o painel (Se nota > 0, tem revisão)
            'revisao_realizada': p.nota_coerencia > 0, 
            
            # 2. Verifica se foi aprovado para mudar a cor do card
            'is_aprovado': p.status == 'Aprovado' or p.status == 'Concluído',

            # 3. O texto concatenado (Pontos fortes + Melhoria)
            'feedback_texto': p.feedback_revisao, 
            
            # 4. As notas individuais (Já estava no seu código, mantive igual)
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

# ============================================================================
# 3. SISTEMA DE REVISÃO (DUPLO CEGO & HISTÓRICO)
# ============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_list_review_queue(request):
    """
    Lista produções pendentes.
    """
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
    """
    Salva a revisão (notas + feedback), define status e envia EMAIL HTML se rejeitado.
    """
    try:
        p = Producao.objects.get(id=pk)
        data = request.data
        
        aprovado = data.get('aprovado') 
        pontos_fortes = data.get('pontos_fortes', '')
        pontos_melhoria = data.get('pontos_melhoria', '')
        
        feedback_texto = f"PONTOS FORTES:\n{pontos_fortes}\n\nSUGESTÕES DE MELHORIA:\n{pontos_melhoria}"
        
        # --- ATUALIZAÇÃO DOS DADOS ---
        p.feedback_revisao = feedback_texto
        p.revisor = request.user
        p.data_revisao = timezone.now()

        # Salva as notas da rubrica
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

            # --- ENVIO DE E-MAIL HTML (VISUAL PREMIUM) ---
            try:
                autor_email = p.user.email
                if autor_email:
                    assunto = f"Ação Necessária: Sua produção '{p.titulo}' precisa de atenção"
                    
                    # Nome formatado do autor
                    nome_autor = p.user.first_name.split()[0].title() if p.user.first_name else "Professor(a)"
                    
                    # Mensagem texto puro (fallback para e-mails antigos)
                    mensagem_texto = f"""
                    Olá, {nome_autor}.
                    Sua produção "{p.titulo}" tem grande potencial, mas precisa de alguns ajustes.
                    Sugestões: {pontos_melhoria}
                    Acesse o sistema para editar.
                    """

                    # Mensagem HTML Estilizada
                    mensagem_html = f"""
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            /* Reset e Estilos Base */
                            body {{ font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #F3F4F6; color: #334155; }}
                            .email-wrapper {{ width: 100%; background-color: #F3F4F6; padding: 40px 0; }}
                            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }}
                            
                            /* Cabeçalho */
                            .header {{ background-color: #0F172A; padding: 30px 20px; text-align: center; }}
                            .logo {{ color: #ffffff; font-size: 24px; font-weight: 800; text-decoration: none; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 10px; }}
                            
                            /* Conteúdo */
                            .content {{ padding: 40px 30px; line-height: 1.6; font-size: 16px; }}
                            .h1 {{ color: #1E293B; font-size: 22px; margin-top: 0; font-weight: 700; margin-bottom: 20px; }}
                            .text-intro {{ color: #475569; margin-bottom: 25px; }}
                            
                            /* Caixa de Destaque (Feedback) */
                            .feedback-box {{ 
                                background-color: #FFFBEB; 
                                border-left: 5px solid #F59E0B; 
                                padding: 20px; 
                                margin: 25px 0; 
                                border-radius: 4px;
                                color: #92400E; 
                                font-style: italic;
                                font-weight: 500;
                            }}
                            
                            /* Botão */
                            .btn-container {{ text-align: center; margin: 35px 0; }}
                            .btn {{ 
                                display: inline-block; 
                                background-color: #2563EB; /* Azul vibrante */
                                color: #ffffff !important; 
                                padding: 14px 32px; 
                                text-decoration: none; 
                                border-radius: 8px; 
                                font-weight: 700; 
                                font-size: 16px;
                                box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
                                transition: background-color 0.2s;
                            }}
                            .btn:hover {{ background-color: #1D4ED8; }}
                            
                            /* Rodapé */
                            .footer {{ background-color: #F8FAFC; padding: 20px; text-align: center; font-size: 13px; color: #94A3B8; border-top: 1px solid #E2E8F0; }}
                            .footer a {{ color: #64748B; text-decoration: none; }}
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
                                    
                                    <p class="text-intro">
                                        Sua produção <strong>"{p.titulo}"</strong> tem um enorme potencial para a nossa comunidade!
                                    </p>
                                    
                                    <p>
                                        Ela passou pela nossa revisão por pares e o revisor identificou alguns pontos que, se ajustados, deixarão seu material ainda mais rico e alinhado aos nossos padrões de qualidade.
                                    </p>
                                    
                                    <p><strong>Confira as observações do revisor:</strong></p>

                                    <div class="feedback-box">
                                        "{pontos_melhoria}"
                                    </div>

                                    <p>Não desanime! Esse processo de refinamento é normal e essencial para garantirmos a excelência do conteúdo. Faça os ajustes e reenvie para aprovação.</p>

                                    <div class="btn-container">
                                        <a href="http://localhost:5173/dashboard/minhas-producoes" class="btn">
                                            Editar e Reenviar Agora
                                        </a>
                                    </div>
                                    
                                    <p style="font-size: 13px; margin-top: 30px; color: #94A3B8; text-align: center;">
                                        Se o botão não funcionar, acesse sua conta e vá até a aba "Minhas Produções".
                                    </p>
                                </div>

                                <div class="footer">
                                    © 2026 CAPSIAGE - Conectando inteligência humana e artificial.<br>
                                    Este é um e-mail automático, por favor não responda.
                                </div>
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
                        html_message=mensagem_html # <--- ENVIA O HTML
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
    """
    Lista todas as produções que o usuário atual JÁ revisou.
    """
    user = request.user
    
    # Busca produções onde o campo 'revisor' é o usuário logado
    revisoes = Producao.objects.filter(revisor=user).order_by('-data_revisao')
    
    lista = []
    for p in revisoes:
        # Define se o veredito foi positivo ou negativo baseado no status
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
@authentication_classes([]) # Remove a autenticação por sessão para evitar erro CSRF
@permission_classes([AllowAny])
def api_password_reset_request(request):
    """
    Recebe o e-mail, gera o token e envia o e-mail com template HTML.
    """
    email = request.data.get('email')
    if not email:
        return Response({'erro': 'E-mail é obrigatório.'}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Por segurança, não dizemos que o usuário não existe
        return Response({'mensagem': 'Se o e-mail existir, um link foi enviado.'})

    # 1. Gerar Tokens
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    # 2. Criar o Link
    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

    # 3. Preparar o E-mail
    subject = "Redefinição de Senha - Comunidade IA"
    from_email = settings.DEFAULT_FROM_EMAIL
    to = [email]

    # Ajuste do Nome
    raw_name = user.first_name or user.username
    first_name = raw_name.split()[0].title()

    context = {
        'nome': first_name,
        'link': reset_link
    }

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
@authentication_classes([]) # Remove a autenticação por sessão aqui também
@permission_classes([AllowAny])
def api_password_reset_confirm(request, uidb64, token):
    """
    Recebe o token e a nova senha para efetivar a troca.
    """
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
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def api_update_production(request, pk):
    """
    Permite ao autor editar uma produção que foi rejeitada ('Correção solicitada').
    Ao salvar, o status volta para 'Em revisão'.
    """
    try:
        # Garante que só o dono pode editar e busca pelo ID
        p = Producao.objects.get(id=pk, user=request.user)
        
        # Só permite editar se estiver pedindo correção (segurança)
        if p.status != 'Correção solicitada':
            return Response({'erro': 'Esta produção não pode ser editada no momento.'}, status=403)

        data = request.data

        # Atualiza campos de texto
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

        # Trata recursos (pode vir como lista ou string)
        recursos_input = data.getlist('recursos') if hasattr(data, 'getlist') else data.get('recursos')
        if recursos_input:
            if isinstance(recursos_input, list):
                p.recursos = ", ".join(recursos_input)
            else:
                p.recursos = str(recursos_input)

        # Atualiza arquivo se um novo for enviado
        novo_arquivo = request.FILES.get('arquivo')
        if novo_arquivo:
            p.arquivo = novo_arquivo

        # --- O PULO DO GATO: RESETA O STATUS ---
        p.status = 'Em revisão' 
        p.feedback_revisao = None # Limpa o feedback antigo ou mantém histórico (opcional, aqui limpamos para nova rodada)
        p.revisor = None # Reseta o revisor para cair na fila geral de novo (ou mantém se quiser o mesmo)
        
        p.save()

        return Response({'mensagem': 'Produção atualizada e reenviada para fila de revisão!'})

    except Producao.DoesNotExist:
        return Response({'erro': 'Produção não encontrada.'}, status=404)
    except Exception as e:
        print(f"Erro ao atualizar: {e}")
        return Response({'erro': 'Erro interno ao atualizar.'}, status=500)