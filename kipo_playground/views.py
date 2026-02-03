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
from .forms import CreateUser, novo_instancias_tipoForm, inserir_instancias_tipoForm, inserir_instancias_dada_classeForm, definir_status_backlogitem_Form, definir_obs_backlogitem_Form, definir_esforco_backlogitem_Form, MateriaJornalistica_Form
from .models import MateriaJornalistica
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

# !SCRIPTS AUXILIARES
# !------------------------------------------------------------
def faz_id(input_str):
    """ Pega uma string e gera um id único básico para cada instância na Ontologia.
        
        :param input_str: String que vai servir como input para o ID. 
    
        :return: Valor numérico único como string de até 4 caracteres. 
    """
    
    resultado_id = str(abs(hash(input_str)) % (10 ** 4))
    
    if len(resultado_id) == 3:
        
        resultado_id = "0" + resultado_id

    elif len(resultado_id) == 2:

        resultado_id = "00" + resultado_id
    
    elif len(resultado_id) == 1:
    
        resultado_id = "000" + resultado_id
    
    return resultado_id

login_required(login_url='/app1/kipo_playground/login_page')
def transforma_objeto(lista_instancias):
    """ Pega um objeto da Ontologia e transforma em um dicionário, no formato que o DJango bota no template corretamente.
        
        :param lista_instancias: Lista de instâncias que viram objeto. 
    
        :return: Dicionário com campos 'classe', 'instância', 'nome' e 'observação'. 
    """
    
    objetos_final = []
    
    list_nomes = []
    list_obs = []
    list_classe = []
    
    if len(lista_instancias) == 0:
        
        list_nomes.append("Sem Nome!")
        list_classe.append("Sem Classe!")
        list_obs.append("Sem Observações!")
        #lista_instancias.append("Sem instancias!")
        
        objetos_final.append({'classe_inst': "Sem Classe!", 'instancia': "Sem instancias!",'nome': "Sem Nome!", 'obs': "Sem Observações!"})
        return objetos_final
        
    else:
    
        for i in range(len(lista_instancias)):
                            
            list_nomes.append(str(lista_instancias[i].Nome[0]))
            
            list_classe.append(str(lista_instancias[i].is_a.pop(0)))
            
            if not lista_instancias[i].Observacao:
                list_obs.append("Sem observações")
            else:
                list_obs.append(str(lista_instancias[i].Observacao))
            
        print("---------------")
        print(len(list_nomes))
        print(len(list_obs))
        print(len(list_classe))
        print(len(lista_instancias))
        print(str(lista_instancias[0]))
        print("---------------")
        
        for i in range(len(lista_instancias)):
            objetos_final.append({'classe_inst':list_classe[i], 'instancia':str(lista_instancias[i]),'nome':list_nomes[i], 'obs':list_obs[i]})
            
        return objetos_final                 

# !------------------------------------------------------------

login_required(login_url='/app1/kipo_playground/login_page')
def welcome(request):
    """ View de tela de início do sistema.
        
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'welcome_graficos.html'. 
    """
    
    if request.user.is_authenticated:
        print("--------------Logged in--------------")
    else:
        print("--------------Not logged in--------------")
        return redirect('/kipo_playground/login_page/')


    # https://developers.google.com/chart/interactive/docs/gallery/barchart

    if 'status' in request.session:
        del request.session['status']
    
    # pegar quantidade de scrum_Sprint
    # quantidade de KIPCO__Agent
    # quantidade de Task_Description
    # quantidade de scrum_Daily
    # quantidade de DO__Decision
    ''' Formato dos dados pro Gráfico de Barras 
    [['Year', 'Sales'],
    ['2014', 1000],
    ['2015', 1170],
    ['2016', 660],
    ['2017', 1030] ]
    '''
    
    files = os.listdir('.')
    achou_bd = 0
    
    for file in files:
            
        if "backup.db" in file:
            achou_bd = 1
        
    if achou_bd == 0:
        print("NÃO ACHEI BD")
    
        
        # OWLREADY2
        try:
                
            myworld = World(filename='backup.db', exclusive=False)
            
            onto_path.append(os.path.dirname(__file__))
        
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology(os.path.dirname(__file__) + '/kipo_fialho.owl').load()
            
            kiposcrum["Product_Backlog"]("backlog_do_sistema" + "1234")
            kiposcrum["backlog_do_sistema" + "1234"].Nome.append("backlog_do_sistema")
            kiposcrum["backlog_do_sistema" + "1234"].Observacao.append("Criado automaticamente na abertura do sistema!")
        
            myworld.save()
        
        except:
            
            print("Erro no começo criando BD")
            
        finally:
            
            myworld.close()
            
            return render(request, 'welcome_graficos.html', context)
    
    
    else:    
    #-----------------------------------------------------
        
        
        lista_dados_qtd_fim = []

        planning_poker_esforco = []
        
        try:
            
            myworld = World(filename='backup.db', exclusive=False)
            
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            
            with kiposcrum:

                # ---------------------
                
                qtd_agentes = len(kiposcrum["KIPCO__Agent"].instances())
                qtd_taskdescription = len(kiposcrum["Task_Description"].instances())
                qtd_daily = len(kiposcrum["scrum_Daily"].instances())
                qtd_decision = len(kiposcrum["DO__Decision"].instances())
                qtd_sprints = len(kiposcrum["scrum_Sprint"].instances())
                
                lista_dados_qtd = [["Classe", "Quantidade de Instâncias"],
                                    ["KIPCO__Agent", qtd_agentes], 
                                    ["Task_Description", qtd_taskdescription], 
                                    ["scrum_Daily", qtd_daily], 
                                    ["DO__Decision", qtd_decision], 
                                    ["scrum_Sprint", qtd_sprints]]
                
                lista_dados_qtd_fim = json.dumps(lista_dados_qtd)
                

                # ---------------------

                '''
                
                # Opcoes cadastradas no planning poker

                '2' 
                '3' 
                '5' 
                '7' 
                '11' 
                '13' 
                '17' 
                '19'
                
                '''

                planning_poker_esforco = [["Esforço da Tarefa", "Quantidade de Tarefas"],
                                        ["2", 0],
                                        ["3", 0],
                                        ["5", 0],
                                        ["7", 0],
                                        ["11", 0],
                                        ["13", 0],
                                        ["17", 0],
                                        ["19", 0]]

                tarefas_backlog = kiposcrum["Product_Backlog_Item"].instances()
                
                print(tarefas_backlog)
                print(len(tarefas_backlog))

                for j in range(len(tarefas_backlog)):

                    nome_tarefa = str(tarefas_backlog[j])[5:]
                    
                    esforco_tarefa = str(kiposcrum[nome_tarefa].EstimatedBusinessValue.pop(0))

                    for i in range(len(planning_poker_esforco)):
                        if planning_poker_esforco[i][0] == esforco_tarefa:
                            planning_poker_esforco[i][1] = planning_poker_esforco[i][1] + 1

                print(planning_poker_esforco)

                # ---------------------

                decisoes = kiposcrum["DO__Decision"]. instances()

                # resolvido = 1
                # aberto = 0

                for j in range(len(decisoes)):

                    nome_decisao = str(decisoes[j])[5:]

                    status = str(kiposcrum[nome_decisao].StatusProblemaResolvido.pop(0))

                    
                    if "0" in status:
                        decisao_pendente = "Sim"
                        break
                    else:
                        decisao_pendente = "Não"


                # ---------------------
                
                status = "OK!"

        except:
            
            qtd_agentes = 0
            status = "Erro!"
        
        finally:

            myworld.close()
        
        context = {"lista_dados_qtd": lista_dados_qtd_fim, "planning_poker_esforco": planning_poker_esforco, "decisao_pendente": decisao_pendente}
        request.session['status'] = status
        return render(request, 'welcome_graficos.html', context)

def sobre(request):
    """ Exibe tela de "Sobre".
        
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'sobre.html'. 
    """
    
    return render(request, 'sobre.html')

login_required(login_url='/app1/kipo_playground/login_page')
def tutorial(request):
    """ Exibe tela de "Tutorial".
        
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'tutorial.html'. 
    """
    
    
    return render(request, 'tutorial.html')

login_required(login_url='/app1/kipo_playground/login_page')
def reiniciar(request):
    """ Reinicia o Banco de Dados, dando copy e paste de um backup para a pasta principal.
    Serve para reiniciar as instâncias, para ficar igual caso de estudo inicial.
        
        :param request: HTTP Request. 
    
        :return: Redireciona para /kipo_playground/welcome/. 
    """
    

    diretorio_raiz_projeto = os.getcwd()
    print("\n\n\n\n\n\n\n")
    print(diretorio_raiz_projeto)
    print("\n\n\n\n\n\n\n")

    bd_backup = str(diretorio_raiz_projeto) + "/BackupBD/backup.db"

    shutil.copy(bd_backup, diretorio_raiz_projeto)

    return redirect('/kipo_playground/welcome/')

# !TESTE DE ACESSO AO BANCO DE DADOS
# !------------------------------------------------------------

login_required(login_url='/app1/kipo_playground/login_page')
def instancias_teste(request):
    """ View de tela de testes de acesso ao Banco de Dados. Visualização de Agentes.
        
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'instancias.html'. 
    """
    
    query_feita = "kiposcrum['KIPCO__Agent'].instances()"
    
    print(query_feita)
    
    sync_reasoner()
    
    list_nomes = []
    list_obs = []
    list_classes = []
    objetos_final = [] 


    # OWLREADY2
    try:
        
        myworld = World(filename='backup.db', exclusive=False)
        
        #onto_path.append(os.path.dirname(__file__))
        
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
        
        with kiposcrum:
            
            lista_instancias = kiposcrum["KIPCO__Agent"].instances() 
            
            
            for i in range(len(lista_instancias)):
                
                list_nomes.append(lista_instancias[i].Nome[0])
                
                list_classes.append(str(lista_instancias[i].is_a.pop(0)))
                
                if not lista_instancias[i].Observacao:
                    list_obs.append("Sem observações")
                else:
                    list_obs.append(lista_instancias[i].Observacao)
            
            for i in range(len(lista_instancias)):
                objetos_final.append({'classe_inst':list_classes[i], 'instancia':lista_instancias[i],'nome':list_nomes[i], 'obs':list_obs[i]})
                
            num_inst = len(lista_instancias)
            
            status = "OK!"
            
        
    except:
        
        lista_final = ["Erro!"]
        status = "Erro!"
        print("Falha de acesso!")
        num_inst = 0
        
    finally:
        
        myworld.close()
        
        context = {"objetos_final": objetos_final, "query_feita": query_feita, "num_inst": num_inst, "status": status}
    
    return render(request, 'instancias.html', context)

# !VISUALIZAÇÃO DE INSTÂNCIAS DE UMA CLASSE
# !------------------------------------------------------------

# instancias_tipo -> instancias_tipo_show

# mostra o input de todas as instâncias de dada classe

login_required(login_url='/app1/kipo_playground/login_page')
def instancias_tipo_show(request):
    """ View de visualização de instâncias de uma dada classe no Banco de Dados. 
        
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'instancias_tipo_show.html'. 
    """
    
    return render(request, 'instancias_tipo_show.html')

# seleciona classe para ver
def instancias_tipo(request):
    """ View de seleção para visualização de instâncias de uma dada classe no Banco de Dados. 
        
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'instancias_tipo_show.html' (método POST) e instancias_tipo_select.html (método GET). 
    """
    
    form = novo_instancias_tipoForm()

    context = {'form':form}
    
    if request.method == 'POST':
        
        if 'input_dado' in request.session:
            del request.session['input_dado']
    
        if 'num_inst' in request.session:
            del request.session['num_inst']
            
            
        if 'status' in request.session:
            del request.session['status']
            
        input_dado = str(request.POST.get('busca'))
        
        print(input_dado)
        
        objetos_final = []
        
        list_nomes = []
        list_obs = []
        
        # OWLREADY2
        try:
            
            myworld = World(filename='backup.db', exclusive=False)
            
            #onto_path.append(os.path.dirname(__file__))
            
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()

            sync_reasoner()
        
            with kiposcrum:
                
                lista_instancias = kiposcrum[input_dado].instances()
        
                num_inst = len(lista_instancias)
                
                status = "OK!"
                
                
                for i in range(len(lista_instancias)):
                    
                    list_nomes.append(lista_instancias[i].Nome[0])
                
                    if not lista_instancias[i].Observacao:
                        list_obs.append("Sem observações")
                    else:
                        list_obs.append(lista_instancias[i].Observacao)
                
                
                for i in range(len(lista_instancias)):
                    objetos_final.append({'instancia':lista_instancias[i],'nome':list_nomes[i], 'obs':list_obs[i]})
                
                
                #myworld.close() # só fecha o bd, deixa as instâncias no bd
        
        except:
            
            status = "Erro!" 
            num_inst = "Desconhecido"
            
            print("Falha de acesso!")
        
        finally:
            
            myworld.close()
        
        #del myworld, kiposcrum    
        
        # fazer uma query aqui de SPARQL
        
        # faz query e bota resultado na sessão, um redirect vai botar o resultado
        #request.session['input_dado'] = lista_instancias
        request.session['num_inst'] = num_inst
        request.session['status'] = status
        
        context = {"objetos_final": objetos_final}
        return render(request, 'instancias_tipo_show.html', context)
    
    return render(request, 'instancias_tipo_select.html', context)

# !INSERINDO INSTÂNCIAS
# !------------------------------------------------------------

def inserir_instancia_tela_ok(request):
    """ View de confirmação de que uma instância foi adicionada com sucesso.
    
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'inserir_instancia_tela_ok.html'. 
    """
    
    return render(request, 'inserir_instancia_tela_ok.html')

# instancia pra botar + espaço pra definir o nome
def inserir_instancia(request):
    """ View para pegar uma instância a ser adicionada no Banco de Dados.
    
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'instancias_inserir_select.html' ou redirect para view 'inserir_instancia_tela_ok'. 
    """
    

    form = inserir_instancias_tipoForm()

    context = {'form':form}
    
    if request.method == 'POST':
        
        if 'input_dado' in request.session:
            del request.session['input_dado']
    
        input_nome = request.POST.get('nome')
        input_classe = request.POST.get('classe')
        input_obs = request.POST.get('observacao')
        
        seed = str(time.time())
        id_unico = faz_id(seed)
        
        # OWLREADY2
        try:
    
            myworld = World(filename='backup.db', exclusive=False)
                
            #onto_path.append(os.path.dirname(__file__))
                
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            with kiposcrum:
                
                kiposcrum[input_classe](input_nome + id_unico)
                
                kiposcrum[input_nome + id_unico].Nome.append(input_nome)
                
                if input_obs != "":
                    kiposcrum[input_nome + id_unico].Observacao.append(input_obs)
                
                myworld.save()
                
                status = "OK!"
            
        except:
            status = "Erro!"    

        finally:
            myworld.close()
            
        # faz query e bota resultado na sessão, um redirect vai botar o resultado
        request.session['input_nome'] = input_nome
        request.session['input_classe'] = input_classe
        request.session['input_status'] = status
        return redirect('/kipo_playground/inserir_instancia_tela_ok/')
        
    
    return render(request, 'instancias_inserir_select.html', context)


def retirar_instancia(request, instancia, classe):
    """ Deleta instância do Banco de Dados da ontologia.
        
        :param request: HTTP Request. 
        :param instancia: Instância a ser retirada (string). 
        :param classe: Classe em string para ser retirada. 
    
        :return: Objeto de render de 'inserir_instancia_tela_ok.html'. 
    """
    
    # tirando prefixo "kipo."
    input_nome = instancia[5:]
    input_classe = classe[5:] 
    
    try:
        myworld = World(filename='backup.db', exclusive=False)
                
                
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
        
        with kiposcrum:
            
            sync_reasoner()

            # nome ja recuperado
            # recupera classe!
            # deleta instancia!
                
            #input_classe = str(input_nome.is_a.pop(0))
                
            print("------------------")
            print(input_nome)
            print(input_classe)
            print("------------------")
                
            destroy_entity(kiposcrum[input_classe](input_nome))
            
            status = "OK!"
            input_classe = classe
            
            myworld.save()
            
    except:
        
        status = "Erro!"    
        input_classe = "Erro!"

    finally:
        
        myworld.close()
    
    request.session['input_nome'] = input_nome
    request.session['input_classe'] = input_classe
    request.session['input_status'] = status
    return render(request, 'inserir_instancia_tela_ok.html')
    

# !MÓDULO DE GESTÃO DE SPRINTS
# !SELECIONA SPRINT
# !------------------------------------------------------------

def sprint_select(request):
    """ View de seleção de Sprints para sua visualização.
    
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'seleciona_sprint.html'. 
    """
    
    objetos_sprints = []
    
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
        
        with kiposcrum:
                
            lista_instancias = kiposcrum["scrum_Sprint"].instances()
            
            print("\n\n\n\n")
            print(lista_instancias)
            print("\n\n\n\n")

            num_inst = len(lista_instancias)
            
            print("\n\n\n\n")
            print(num_inst)
            print("\n\n\n\n")
            
            status = "OK!"
            
            # poderia ser instâncias de "kipo.KIPCO__Knowledge_Intensive_Process"
            # objetos_sprints = transforma_objeto(lista_instancias)
            
            print(str(lista_instancias[0].Nome[0]))
            print(str(lista_instancias[0].is_a.pop(0)))
            print(str(lista_instancias[0].Observacao))
            
            
            objetos_sprints = transforma_objeto(lista_instancias)
            
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        
        print("---------------------------")
        print("Falha de acesso!")
        print(sys.exc_info()[0])
        print(sys.exc_info()[1])
        print(sys.exc_info()[2])
        
        print("---------------------------")

    finally:
        
        myworld.close() # só fecha o bd, deixa as instâncias no bd
    
    
    
    request.session['num_inst'] = num_inst
    request.session['status'] = status
        
    context = {"objetos_sprints": objetos_sprints}
    return render(request, 'seleciona_sprint.html', context)

# VER DADOS DA SPRINT
login_required(login_url='/app1/kipo_playground/login_page')
def sprint_dashboard(request, instancia_sprint):
    """ View de seleção de Sprints para sua visualização.
    
        :param request: HTTP Request. 
        :param instancia_sprint: String com Instância a ser visualizada no formato 'nome + id_único'. Exemplo: 'sprint_da_semana1234'. 
    
        :return: Objeto de render de 'sprint_dashboard.html'. 
    """
    
    # instancia_sprint é a sprint a ser usada
    
    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_prop_correlatas' in request.session:
        del request.session['num_prop_correlatas']
        
    if 'num_inst' in request.session:
        del request.session['num_inst']
        
        
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
    
    
        with kiposcrum:
            
            print("Criando dashboard de Sprint!")
            
            num_inst = 0
            
            # kiposcrum.KIPCO__Agent("desenvolvedornovo")
            
            # a query sai com prefixo "kipo."

            if "kipo" in instancia_sprint:
                instancia = instancia_sprint[5:]
                print(instancia)
            else:
                instancia = instancia_sprint
            
            # propriedades
            propriedades = kiposcrum[instancia].get_properties()
            print(propriedades)
            num_prop_correlatas = len(propriedades)
            
            # lista de instâncias tudo que ocorre ontoscrum__during
            during = kiposcrum[instancia].ontoscrum__during
            print("During " + str(during))
            num_inst = num_inst + len(during)
            
            # lista de instâncias tudo que ocorre ontoscrum__has_input
            has_input = kiposcrum[instancia].ontoscrum__has_input
            print("Input " + str(has_input))
            num_inst = num_inst + len(has_input)

            # lista de instâncias tudo que ocorre ontoscrum__has_has_output
            has_output = kiposcrum[instancia].ontoscrum__has_output
            print("Output " + str(has_output))
            num_inst = num_inst + len(has_output)
    
            # lista de instâncias tudo que ocorre ontoscrum__isExecutedBy
            has_isexecutedby = kiposcrum[instancia].ontoscrum__is_executed_by
            print("Executado por " + str(has_isexecutedby))
            num_inst = num_inst + len(has_isexecutedby)

            # lista de instâncias tudo que ocorre ontoscrum__simultaneously
            INV_simultaneo = kiposcrum[instancia].INV_ontoscrum__simultaneously
            print("Simultaneo " + str(INV_simultaneo))
            num_inst = num_inst + len(INV_simultaneo)
            
            invfinishes = kiposcrum[instancia].INV_ontoscrum__finishes
            print("Simultaneo " + str(invfinishes))
            num_inst = num_inst + len(invfinishes)
            

            # lista de items que terminam a sprint

            objeto_during = transforma_objeto(during)
            objeto_has_input = transforma_objeto(has_input)
            objeto_has_output = transforma_objeto(has_output)
            objeto_has_isexecutedby = transforma_objeto(has_isexecutedby)
            objeto_INV_simultaneo = transforma_objeto(INV_simultaneo)
            objeto_finishes = transforma_objeto(invfinishes)

            status = "OK!" 
        
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        num_prop_correlatas = "Desconhecido"
        num_inst = 0
        
        print("Falha de acesso!")
        
    
    finally:
        
        myworld.close() 
        
    
    request.session['num_inst'] = num_inst
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_prop_correlatas'] = num_prop_correlatas
    request.session['num_inst'] = str(num_inst)
    
    context = {"instancia_sprint":instancia_sprint , "objetos_during":objeto_during, "objetos_has_input":objeto_has_input, "objetos_has_output":objeto_has_output,
                "objetos_has_isexecutedby":objeto_has_isexecutedby, "objetos_INV_simultaneo":objeto_INV_simultaneo, "objeto_finishes": objeto_finishes}
    
    return render(request, 'sprint_dashboard.html', context)
    
    
def add_classe(request, classe_inst):
    """ View de adiçao de uma nova instancia, dada uma classe.
    
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'instancias_tipo_select.html' ou redirect para view de 'inserir_instancia_tela_ok'. 
    """
    
    form = inserir_instancias_dada_classeForm()

    context = {'form':form}
    
    if request.method == 'POST':
        
        if 'nome' in request.session:
            del request.session['nome']
        if 'observacao' in request.session:
            del request.session['observacao']
            
        input_nome = str(request.POST.get('nome'))
        input_observacao = str(request.POST.get('observacao'))
        
        status = "Erro!"
        
        seed = str(time.time())
        id_unico = faz_id(seed)
        
        
        # OWLREADY2
        try:
            
            myworld = World(filename='backup.db', exclusive=False)
            
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            sync_reasoner()
        
            print(classe_inst)
            
            with kiposcrum:
                
                kiposcrum[classe_inst](input_nome + id_unico)
                
                kiposcrum[input_nome + id_unico].Nome.append(input_nome)
                
                if input_observacao != "":
                    kiposcrum[input_nome + id_unico].Observacao.append(input_observacao)
                
                if classe_inst == "KIPCO__Knowledge_Intensive_Process":
                    # é uma sprint, tenho que criar um backlog também!
                    
                    kiposcrum["Sprint_Backlog"]("backlog_" + input_nome + id_unico)

                    kiposcrum["backlog_" + input_nome + id_unico].Nome.append("backlog_" + input_nome)
                    
                    kiposcrum["backlog_" + input_nome + id_unico].Observacao.append("Backlog criado automaticamente para " + input_nome)
                    
                sync_reasoner()
                
                status = "OK!"
                
                
                myworld.save() # persiste na ontologia
        
        except:
            
            print("Falha de acesso!")
            input_nome = "Não foi recuperado"
            input_classe = "Não foi recuperado"
        
        finally:
            
            myworld.close()
            
        # faz query e bota resultado na sessão, um redirect vai botar o resultado
        request.session['input_nome'] = input_nome + id_unico
        request.session['input_classe'] = classe_inst
        request.session['ontologia_status'] = status
        
        return redirect('/kipo_playground/inserir_instancia_tela_ok/')
        
    return render(request, 'instancias_tipo_select.html', context)

def add_classe_com_relacionamento(request, classe_inst, relacinamento_inst, referencia_inst):
    """ Adiçao de uma nova instancia, dada uma classe, já em relacionamento com outra classe.
    
        :param request: HTTP Request. 
        :param classe_inst: Classe da instância. 
        :param relacinamento_inst: Relacionamento a ser criado. 
        :param referencia_inst: Instância que será relacionada, já existente. 
    
        :return: Objeto de render de 'instancias_tipo_select.html' ou redirect para view de 'inserir_instancia_tela_ok'. 
    """

    form = inserir_instancias_dada_classeForm()

    context = {'form':form}
    
    if request.method == 'POST':
        
        if 'nome' in request.session:
            del request.session['nome']
        if 'observacao' in request.session:
            del request.session['observacao']
        if 'input_status' in request.session:
            del request.session['input_status']
            
        input_nome = str(request.POST.get('nome'))
        input_observacao = str(request.POST.get('observacao'))
        
        seed = str(time.time())
        id_unico = faz_id(seed)

        status = "Erro!"
        
        if "kipo" in referencia_inst:
            inst = referencia_inst[5:]
        else:
            inst = referencia_inst

        # OWLREADY2
        try:
            
            myworld = World(filename='backup.db', exclusive=False)
            
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            #sync_reasoner()
        
            print(classe_inst)
            
            status = "OK!"
            

            with kiposcrum:
                
                print("input_nome " + str(input_nome))
                print("classe_inst " + str(classe_inst))
                print("relacinamento_inst " + str(relacinamento_inst))
                print("referencia_inst " + str(inst))
                
                # input_nome = nome da nova instância
                # classe_inst = classe da nova instância
                # relacinamento_inst = relacionamento que nova instancia vai ter com "referencia_inst"
                # input_nome da classe classe_int tem relacionamento_inst com referencia_inst, que é uma instância
                
                kiposcrum[classe_inst](input_nome + id_unico)
                
                kiposcrum[input_nome + id_unico].Nome.append(input_nome)
                
                if input_observacao != "":
                    kiposcrum[input_nome + id_unico].Observacao.append(input_observacao)
                
                
                # relacionamentos
                # --------------------------
                
                if relacinamento_inst == "INV_influences":
                    
                    kiposcrum[inst].INV_influences.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "INV_composes":
                    
                    kiposcrum[inst].INV_composes.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "INV_threatens":
                    
                    kiposcrum[inst].INV_threatens.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "considers":
                    
                    kiposcrum[inst].considers.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "ontoscrum__is_executed_by":
                    
                    kiposcrum[inst].ontoscrum__is_executed_by.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "ontoscrum__simultaneously":
                    
                    kiposcrum[inst].ontoscrum__simultaneously.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "ontoscrum__contains":
                    
                    kiposcrum[inst].ontoscrum__contains.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "ontoscrum__during":
                    
                    kiposcrum[inst].ontoscrum__during.append(kiposcrum[input_nome + id_unico])
                
                if relacinamento_inst == "ontoscrum__performs":
                    
                    kiposcrum[inst].ontoscrum__performs.append(kiposcrum[input_nome + id_unico])
                
                # --------------------------
                
                sync_reasoner()
                
                myworld.save() # persiste na ontologia
                
                
        except:
            
            print("Falha de acesso!")
            input_nome = "Não foi recuperado"
            input_classe = "Não foi recuperado"
            
        
        finally:
            
            myworld.close()
            
        # faz query e bota resultado na sessão, um redirect vai botar o resultado
        request.session['input_nome'] = input_nome + id_unico
        request.session['input_classe'] = classe_inst
        request.session['input_status'] = status
        
        return redirect('/kipo_playground/inserir_instancia_tela_ok/')
        
    return render(request, 'instancias_tipo_select.html', context)

def sprint_options(request, instancia_sprint):
    """ Adiçao de uma nova instancia, dada uma classe, já em relacionamento com outra classe.
    
        :param request: HTTP Request. 
        :param instancia_sprint: Instância da Sprint.  
        :param referencia_inst: Instância que será relacionada, já existente. 
    
        :return: Objeto de render de 'sprint_options.html'. 
    """
    
    instancia = instancia_sprint[5:]
    
    context = {"instancia_sprint":instancia}
    
    return render(request, 'sprint_options.html', context)

# !VISUALIZAÇÃO DE TRABALHO DIÁRIO DENTRO DE UMA SPRINT
# !------------------------------------------------------------

login_required(login_url='/app1/kipo_playground/login_page')
def daily_dashboard(request, instancia_daily):
    """ View de visualizaçao de Trabalho Diário de uma Sprint.
    
        :param request: HTTP Request. 
        :param instancia_daily: String com Instância a ser visualizada no formato 'nome + id_único'. Exemplo: 'daily_dia_29_setembro1234'. 
    
        :return: Objeto de render de 'daily_dashboard.html'. 
    """
    
    # a query sai com prefixo "kipo."
    instancia = instancia_daily[5:]
    print(instancia)
    
    # ontoscrum__perfoms
    # INV_ontoscrum__during
    # ontoscrum__hasOutput
    # ontoscrum__hasInput
    # ontoscrum__is_executed_by
    
    # instancia_sprint é a sprint a ser usada
    
    
    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_prop_correlatas' in request.session:
        del request.session['num_prop_correlatas']
        
    if 'num_inst' in request.session:
        del request.session['num_inst']
        
        
    # OWLREADY2
    try:
        
        myworld = World(filename='backup.db', exclusive=False)
        
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
        
        sync_reasoner()

        num_inst = 0

        with kiposcrum:
            
            print("Criando dashboard de Sprint!")
            
            
            # kiposcrum.KIPCO__Agent("desenvolvedornovo")
            
            # a query sai com prefixo "kipo."
            instancia = instancia_daily[5:]
            print(instancia)
            
            # propriedades
            propriedades = kiposcrum[instancia].get_properties()
            print(propriedades)
            num_prop_correlatas = len(propriedades)
            
            # lista de instâncias tudo que ocorre ontoscrum__during
            inv_during = kiposcrum[instancia].INV_ontoscrum__during
            print("INV_During " + str(inv_during))
            num_inst = num_inst + len(inv_during)
            
            # lista de instâncias tudo que ocorre ontoscrum__has_input
            has_input = kiposcrum[instancia].ontoscrum__has_input
            print("Input " + str(has_input))
            num_inst = num_inst + len(has_input)

            # lista de instâncias tudo que ocorre ontoscrum__has_has_output
            has_output = kiposcrum[instancia].ontoscrum__has_output
            print("Output " + str(has_output))
            num_inst = num_inst + len(has_output)
    
            # lista de instâncias tudo que ocorre ontoscrum__isExecutedBy
            has_isexecutedby = kiposcrum[instancia].ontoscrum__is_executed_by
            print("Executado por " + str(has_isexecutedby))
            num_inst = num_inst + len(has_isexecutedby)

            # lista de instâncias tudo que ocorre ontoscrum__simultaneously
            performs = kiposcrum[instancia].ontoscrum__performs
            print("Performs " + str(performs))
            num_inst = num_inst + len(performs)
            
            objeto_inv_during = transforma_objeto(inv_during)
            objeto_has_input = transforma_objeto(has_input)
            objeto_has_output = transforma_objeto(has_output)
            objeto_has_isexecutedby = transforma_objeto(has_isexecutedby)
            objeto_performs = transforma_objeto(performs)
            
            status = "OK!" 
        
    except:
            
        status = "Erro!" 
        num_prop_correlatas = "Desconhecido"
        num_inst = "?"
            
        print("Falha de acesso!")
    
    finally:
        
        myworld.close() 
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_prop_correlatas'] = num_prop_correlatas
    request.session['num_inst'] = str(num_inst)
    
    context = {"instancia_daily":instancia_daily , "objeto_inv_during":objeto_inv_during, "objetos_has_input":objeto_has_input, "objetos_has_output":objeto_has_output,
                "objetos_has_isexecutedby":objeto_has_isexecutedby, "objeto_performs":objeto_performs}
    
    
    return render(request, 'daily_dashboard.html', context)
    
    
# !BACKLOGS
#!-----------------------------------------------------

def ver_sprint_backlog(request, instancia_sprint):
    """ View de visualizaçao de Backlog de uma Sprint.
    
        :param request: HTTP Request. 
        :param instancia_sprint: String com Instância a ser visualizada no formato 'nome + id_único'. Exemplo: 'backlog_primeira_sprint1234'. 
    
        :return: Objeto de render de 'backlog_sprint.html'. 
    """
    
    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_prop_correlatas' in request.session:
        del request.session['num_prop_correlatas']
        
        
    instancia = instancia_sprint[5:]
    print(instancia)
    
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()

        num_inst = 0
    
        
        with kiposcrum:
            
            print("Criando Visualização de Sprint Backlog!")
            
            status = "OK!"
            
            instancia_backlog_sprint = str(kiposcrum[instancia].ontoscrum__has_input.pop(0))
            
            if not instancia_backlog_sprint:

                # criando um backlog para essa sprint
                kiposcrum["Sprint_Backlog"]("backlog_para_" + instancia)
                kiposcrum["backlog_para_" + instancia].Nome.append("backlog_para_" + instancia)
                kiposcrum["backlog_para_" + instancia].Observacao.append("Gerado automaticamente ao se averiguar que n existia instancia previa!")

            backlog_sprint = instancia_backlog_sprint[5:]
            
            print(backlog_sprint)
            
            propriedades = kiposcrum[backlog_sprint].get_properties()
            print(propriedades)
            num_prop_correlatas = len(propriedades)
            
            
            # faz as queries do que vai para a tela!
            '''
            {kipo.ontoscrum__during, kipo.ontoscrum__has_input, kipo.Nome, 
            kipo.ontoscrum__contains, kipo.ontoscrum__has_output, kipo.ontoscrum__is_executed_by, 
            kipo.ontoscrum__is_managed_by, kipo.INV_ontoscrum__affects, kipo.INV_ontoscrum__has_input, 
            kipo.ontoscrum__performs, kipo.INV_ontoscrum__has_output}
            '''
            
            # sprint backlog contains task descriptions!
            contains = kiposcrum[backlog_sprint].ontoscrum__contains
            print("Contains" + str(contains))
            num_inst = num_inst + len(contains)
            
            # o que ocorre durante essa sprint?
            during = kiposcrum[backlog_sprint].ontoscrum__during
            print("During" + str(during))
            num_inst = num_inst + len(during)
            
            # input
            has_input = kiposcrum[backlog_sprint].ontoscrum__has_input
            print("has_input" + str(has_input))
            num_inst = num_inst + len(has_input)
            
            # output
            has_output = kiposcrum[backlog_sprint].ontoscrum__has_output
            print("has_output" + str(has_output))
            num_inst = num_inst + len(has_output)
            
            # sprint performs o que?
            performs = kiposcrum[backlog_sprint].ontoscrum__performs
            print("performs" + str(performs))
            num_inst = num_inst + len(performs)
            
            # quem executa sprint?
            is_executed_by = kiposcrum[backlog_sprint].ontoscrum__is_executed_by
            print("is_executed_by" + str(is_executed_by))
            num_inst = num_inst + len(is_executed_by)
            
            
            objeto_contains = transforma_objeto(contains)
            objeto_during = transforma_objeto(during)
            objeto_has_input = transforma_objeto(has_input)
            objeto_has_output = transforma_objeto(has_output)
            objeto_performs = transforma_objeto(performs)
            objeto_is_executed_by = transforma_objeto(is_executed_by)
            
    except:
        
        status = "Erro!" 
        num_prop_correlatas = "Desconhecido"
        num_inst = "?"
        instancia = "Erro!" 
        
        print("Falha de acesso!")
        
    finally:
        
        myworld.close()
        
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_prop_correlatas'] = num_prop_correlatas
    request.session['num_inst'] = str(num_inst)
    
    #context = {"instancia_backlog": instancia_backlog, "objeto_ismanagedby": objeto_ismanagedby, "objeto_contains": objeto_contains}
    
    context = {"instancia_backlog_sprint":instancia_backlog_sprint, "objeto_contains": objeto_contains, "objeto_during": objeto_during, "objeto_has_input": objeto_has_input, "objeto_has_output": objeto_has_output, "objeto_performs": objeto_performs, "objeto_is_executed_by": objeto_is_executed_by}
    
    return render(request, 'backlog_sprint.html', context)


def ver_backlog_produto(request):
    """ View de visualizaçao de Backlog do Produto. 

        :param request: HTTP Request. 
    
        :return: Objeto de render de 'backlog_produto.html'. 
    """
    
    # ObjectProperty!
    # ontoscrum__originator
    # ontoscrum__is_managed_by
    # ontoscrum__contains -> um item que ontoscrum__contains features e releaseplan
    
    # DataProperty!
    # EstimatedBusinessValue
    
    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_prop_correlatas' in request.session:
        del request.session['num_prop_correlatas']
    
    num_inst = 0
    
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()

        with kiposcrum:
            
            # falta o ontoscrum__originator
            # {kipo.Nome, kipo.ontoscrum__originator, kipo.ontoscrum__is_managed_by, kipo.INV_ontoscrum__has_output, 
            # kipo.INV_ontoscrum__has_input, kipo.INV_uses, kipo.INV_ontoscrum__affects, 
            # kipo.ontoscrum__contains, kipo.contains}
            
            print("Criando Visualização de Product Backlog!")
            
            instancia_backlog = str(kiposcrum["Product_Backlog"].instances().pop(0))
            
            print(instancia_backlog)
            
            print(kiposcrum["Product_Backlog"].instances())
            instancia = instancia_backlog[5:]
            #print(instancia)
            
            status = "OK!" 
            
            # propriedades
            propriedades = kiposcrum[instancia].get_properties()
            print(propriedades)
            num_prop_correlatas = len(propriedades)
            
            # lista de instâncias tudo que ocorre ontoscrum__during
            #originator = kiposcrum[instancia].ontoscrum__originator
            #print("Originator " + str(originator))
            #num_inst = num_inst + len(originator)
            
            ismanagedby = kiposcrum[instancia].ontoscrum__is_managed_by
            print("Ismanagedby" + str(ismanagedby))
            num_inst = num_inst + len(ismanagedby)
            
            contains = kiposcrum[instancia].ontoscrum__contains
            print("Contains" + str(contains))
            num_inst = num_inst + len(contains)
            

            # informações para dashboard de conteudo da tarefa
            tipo_de_conteudo = [["Tipo de Tarefa", "Quantidade"],
                                ["Financeiro", 0],
                                ["Logística", 0],
                                ["Gestão de Conteúdo", 0]]

            for i in range(len(contains)):
                descricao_tag = str(contains[i].TaskDescription.pop(0))
                
                for j in range(len(tipo_de_conteudo)):
                    if descricao_tag == str(tipo_de_conteudo[j][0]):
                        tipo_de_conteudo[j][1] = tipo_de_conteudo[j][1] + 1
            
            
            # objeto_originator = transforma_objeto(originator)
            objeto_ismanagedby = transforma_objeto(ismanagedby)
            objeto_contains = transforma_objeto(contains)    
            
            # se no objeto contains a classe é Decisão, fazer botão do dashboard
            # da pra fazer isso no html
            
            # pegar objeto de contains com EstimatedBusinessValue
            #------------------------------
        
    except:
            
        status = "Erro!" 
        num_prop_correlatas = "Desconhecido"
        num_inst = "?"
        instancia_backlog = "Erro!"
        instancia = "Erro!" 
        tipo_de_conteudo = [["Tipo de Tarefa", "Quantidade"],
                                ["Financeiro", 0],
                                ["Logística", 0],
                                ["Gestão de Conteúdo", 0]]
        
        print("Falha de acesso!")
        
    finally:
        
        myworld.close() 

    print("--------------")
    print(tipo_de_conteudo)
    print("--------------")

    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_prop_correlatas'] = num_prop_correlatas
    request.session['num_inst'] = str(num_inst)
    
    context = {"instancia_backlog": instancia_backlog, "objeto_ismanagedby": objeto_ismanagedby, "objeto_contains": objeto_contains, "tipo_de_conteudo": tipo_de_conteudo}
    
    return render(request, 'backlog_produto.html', context)

def ver_item_backlog(request, instancia_item):
    """ View de visualizaçao de Item do Backlog do Produto. 

        :param request: HTTP Request. 
    
        :return: Objeto de render de 'backlog_item_status.html'. 
    """

    
    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_prop_correlatas' in request.session:
        del request.session['num_prop_correlatas'] 
        
    
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()

        with kiposcrum:
            
            
            item = instancia_item[5:]
            print(item)
            
            status = "OK!" 
            
            if str(kiposcrum[item].Observacao)[0] == '[':
                observacao =  str(kiposcrum[item].Observacao)[2:-2]
            else:
                observacao =  str(kiposcrum[item].Observacao)
            
            print("--------------")
            print(observacao)
            print("--------------")
            
            if observacao == "[]" or observacao == "None" or observacao == " " :
                string_infos = "Não foram alocadas informações para esta tarefa!"
            else:
                string_infos = observacao
            
            propriedades = kiposcrum[item].get_properties()
            print(propriedades)
            
            item_resolvido = str(kiposcrum[item].StatusItemResolvido)
            
            if '1' in str(kiposcrum[item].StatusItemResolvido.pop(0)):
                item_resolvido = "Não"
            else:
                item_resolvido = "Sim"
            
            business_value = str(kiposcrum[item].EstimatedBusinessValue.pop(0))

        
    except:
        
        status = "Erro!" 
        string_infos = "Erro!"
        business_value = "0"
        
        print("Falha de acesso!")
        
    finally:
        
        myworld.close() 
        
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    
    context = {"string_infos" : string_infos, "business_value" : business_value, "item": item, "item_resolvido": item_resolvido}
    
    return render(request, 'backlog_item_status.html', context)


def mudar_obs(request, item):
    """ View de mudança de observação de Item do Backlog do Produto. 

        :param request: HTTP Request. 
        :param item: Item do backlog (string).
    
        :return: Objeto de render de 'item_inserir_obs.html' ou redirect para "kipo_playground/inserir_obs_tela_ok". 
    """


    form = definir_obs_backlogitem_Form()

    context = {'form':form}

    if "kipo." in item:
        item = item[5:]
    
    if request.method == 'POST':
        
        input_obs = str(request.POST.get('observacao'))
        
        print("string recuperada do form -> " + input_obs)
        
        # OWLREADY2
        try:
    
            myworld = World(filename='backup.db', exclusive=False)
                
            #onto_path.append(os.path.dirname(__file__))
                
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            with kiposcrum:
                
                kiposcrum[item].Observacao = [input_obs]
                
                myworld.save()
                
                status = "OK!"
            
        except:
            status = "Erro!"    

        finally:
            myworld.close()
            
        request.session['input_status'] = status
        return redirect('/kipo_playground/inserir_obs_tela_ok/')
        
    
    return render(request, 'item_inserir_obs.html', context)

def inserir_obs_tela_ok(request):
    """ View de mudança de observação de Item do Backlog do Produto ("tela de ok"). 

        :param request: HTTP Request. 
        
        :return: Redirect para "kipo_playground/inserir_obs_tela_ok". 
    """

    return render(request, 'inserir_obs_tela_ok.html')


def mudar_status(request, item):
    """ View de mudança de Status de Item do Backlog do Produto. 

        :param request: HTTP Request. 
        :param item: Item do backlog (string).
        
        :return: Objeto de render de 'item_inserir_obs.html' ou redirect para "kipo_playground/inserir_obs_tela_ok". 
    """

    form = definir_status_backlogitem_Form()

    context = {'form':form}
    
    if request.method == 'POST':
        
        input_classe = str(request.POST.get('classe'))
        
        print("string recuperada do form -> " + input_classe)
        
        # OWLREADY2
        try:
    
            myworld = World(filename='backup.db', exclusive=False)
                
            #onto_path.append(os.path.dirname(__file__))
                
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            with kiposcrum:
                
                # tem que ser uma string com "0" (S) ou "1" (N)
                
                if "não" in input_classe.lower():
                
                    kiposcrum[item].StatusItemResolvido = ["1"]
                
                else:
                
                    kiposcrum[item].StatusItemResolvido = ["0"]
                
                myworld.save()
                
                status = "OK!"
            
        except:
            status = "Erro!"    

        finally:
            myworld.close()
            
        request.session['input_status'] = status
        return redirect('/kipo_playground/inserir_obs_tela_ok/')
        
    
    return render(request, 'item_inserir_obs.html', context)

def mudar_esforco(request, item):
    """ View de mudança de Esforço de Item do Backlog do Produto. 

        :param request: HTTP Request. 
        :param item: Item do backlog (string).
        
        :return: Objeto de render de 'item_inserir_esforco.html' ou redirect para "kipo_playground/inserir_obs_tela_ok". 
    """
    
    form = definir_esforco_backlogitem_Form()

    context = {'form':form}
    
    if request.method == 'POST':
        
        input_esforco = str(request.POST.get('esforco'))
        
        print("\n\n\n\n")
        print("string recuperada do form -> " + input_esforco)
        
        # OWLREADY2
        try:
    
            myworld = World(filename='backup.db', exclusive=False)
                
            #onto_path.append(os.path.dirname(__file__))
                
            # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
            kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
            with kiposcrum:
                
                kiposcrum[item].EstimatedBusinessValue = [input_esforco]
                
                
                myworld.save()
                
                status = "OK!"
            
        except:
            status = "Erro!"    

        finally:
            myworld.close()
            
        request.session['input_status'] = status
        return redirect('/kipo_playground/inserir_obs_tela_ok/')
        
    
    return render(request, 'item_inserir_esforco.html', context)

# !ADD INSTANCIA PRE-EXISTENTE
# !------------------------------------------------------------


def adicionar_relacionamento_insts_antigas(request, instancia_A, relacionamento, classe_da_nova_inst):
    """ Tela de seleção para realizar: "instancia_A -> relacionamento -> instancia_B"

        :param request: HTTP Request. 
        :param instancia_A: Instância que já existia (string).
        :param relacionamento: Relacionamento (string).
        :param classe_da_nova_inst: Classe da nova instância (string).
        
        :return: Objeto de render de 'escolher_instancia_previa.html'. 
    """
    # essa funçao pega uma instancia_A, relacionamento e uma classe (3 argumentos)
    # para entao fazer 
    # instancia_A -> relacionamento -> instancia_B
    # instancia_B deve ser selecionada entre opcoes de "classe_nova_inst"
    # Na visualizacao o usuario marca qual vai ser a instancia_B e chama nova funcao

    # Nova funcao faz o relacionamento e redireciona o usuario para uma tela de "ok"
    # tela de ok confirma o nome das instancias e o relacionamento!

    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']

    if 'instancia' in request.session:
        del request.session['instancia']
    if 'classe' in request.session:
        del request.session['classe']
    if 'relacionamento' in request.session:
        del request.session['relacionamento']



    if "kipo." in str(instancia_A):
        instancia_A = str(instancia_A)[5:]

    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
        
        
        with kiposcrum:

            lista_instancias = kiposcrum[str(classe_da_nova_inst)].instances()
            num_inst = len(lista_instancias)

            print("\n\n\n\n")
            print("Classe")
            print(str(classe_da_nova_inst))
            print("Quantidade de instancias")
            print(str(len(lista_instancias)))
            print("\n\n\n\n")

            objeto_instancias = transforma_objeto(lista_instancias)
            status = "OK!"

    except:

        status = "Erro!"
        num_inst = "0"

        print("---------------------------")
        print("Falha de acesso!")
        print(sys.exc_info()[0])
        print(sys.exc_info()[1])
        print(sys.exc_info()[2])
        
        print("---------------------------")
    
    finally:

        myworld.close() # só fecha o bd, deixa as instâncias no bd

    context = {"objeto_final":objeto_instancias}

    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_inst'] = num_inst   # String de numero

    request.session['instancia'] = str(instancia_A)   
    request.session['classe'] = str(classe_da_nova_inst)   
    request.session['relacionamento'] = str(relacionamento)   

    return render(request, 'escolher_instancia_previa.html', context)


def executar_relacionamento_insts_antigas(request, instancia_A, relacionamento, instancia_B):
    """ Executar: "instancia_A -> relacionamento -> instancia_B"

        :param request: HTTP Request. 
        :param instancia_A: Instância que já existia (string).
        :param relacionamento: Relacionamento (string).
        :param instancia_B: Instância nova para relacionamento (string).
        
        :return: Objeto de render de 'instancia_previa_tela_ok.html'. 
    """

    if "kipo." in instancia_A:
        instancia_A = str(instancia_A)[5:]

    if "kipo." in instancia_B:
        instancia_B = str(instancia_B)[5:]

    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()

        '''
        classes sendo tratadas!
        ontoscrum__is_managed_by
        ontoscrum__during
        ontoscrum__has_input
        ontoscrum__has_output
        ontoscrum__is_executed_by
        ontoscrum__simultaneously
        ontoscrum__performs
        INV_ontoscrum__during
        INV_influences
        INV_composes
        INV_threatens
        considers
        ontoscrum__contains
        '''
        
        with kiposcrum:

            if relacionamento == "ontoscrum__is_managed_by":
                kiposcrum[instancia_A].ontoscrum__is_managed_by.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "ontoscrum__during":
                kiposcrum[instancia_A].ontoscrum__during.append(kiposcrum[instancia_B])
                status = "OK!"

            elif relacionamento == "ontoscrum__has_input":
                kiposcrum[instancia_A].ontoscrum__has_input.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "ontoscrum__has_output":
                kiposcrum[instancia_A].ontoscrum__has_output.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "ontoscrum__is_executed_by":
                kiposcrum[instancia_A].ontoscrum__is_executed_by.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "ontoscrum__simultaneously":
                kiposcrum[instancia_A].ontoscrum__simultaneously.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "ontoscrum__performs":
                kiposcrum[instancia_A].ontoscrum__performs.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "INV_ontoscrum__during":
                kiposcrum[instancia_A].INV_ontoscrum__during.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "INV_influences":
                kiposcrum[instancia_A].INV_influences.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "INV_composes":
                kiposcrum[instancia_A].INV_composes.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "INV_threatens":
                kiposcrum[instancia_A].INV_threatens.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "considers":
                kiposcrum[instancia_A].considers.append(kiposcrum[instancia_B])
                status = "OK!"
            
            elif relacionamento == "ontoscrum__contains":
                kiposcrum[instancia_A].ontoscrum__contains.append(kiposcrum[instancia_B])
                status = "OK!"
            
            else:
            
                status = "Erro!"
            
            myworld.save()
            
    except:

        status = "Erro!"

        print("---------------------------")
        print("Falha de acesso!")
        print(sys.exc_info()[0])
        print(sys.exc_info()[1])
        print(sys.exc_info()[2])
        
        print("---------------------------")
    
    finally:

        myworld.close() # só fecha o bd, deixa as instâncias no bd

    context = {"instancia_A": instancia_A, "relacionamento": relacionamento, "instancia_B": instancia_B}

    request.session['status'] = status 
    return render(request, 'instancia_previa_tela_ok.html', context)


# !SELECIONA DECISAO
# !------------------------------------------------------------

def decision_select(request):
    """ View de seleção de Decisão. 
    
        :param request: HTTP Request. 
    
        :return: Objeto de render de 'seleciona_decisao.html'. 
    """
    
    objetos_final = []
    
    list_nomes = []
    list_obs = []
    list_status_problema = []
    
    qntd_decisoes_reais = 0
    problemas_resolvidos = 0
    problemas_em_aberto = 0

    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
        
        
        with kiposcrum:
            
            lista_instancias = kiposcrum["DO__Decision"].instances()
            
            num_inst = len(lista_instancias)
            
            print("\n\n\n\n")
            print(lista_instancias)
            print(str(lista_instancias[0].is_a))
            print(str(lista_instancias[1].is_a))
            print(lista_instancias[0].Nome[0])
            print("\n\n\n\n")
            
            status = "OK!"
            
            print(str(len(lista_instancias)))
            
            for i in range(len(lista_instancias)):
                
                if "DO__Decision" in str(lista_instancias[i].is_a):
                        
                    list_nomes.append(lista_instancias[i].Nome[0])
                    
                    if not lista_instancias[i].Observacao:
                        list_obs.append("Sem observações")
                    else:
                        list_obs.append(lista_instancias[i].Observacao)
                    
                    print("Status de Item Resolvido (1 = aberto, 0 = resolvido) -> " + str(lista_instancias[i].StatusProblemaResolvido))
                    
                    
                    # se lista n esta vazia
                    if len(lista_instancias[i].StatusProblemaResolvido) > 0:
                    
                        if str(lista_instancias[i].StatusProblemaResolvido.pop(0)) == "0":
                            
                            list_status_problema.append("Aberto")
                            problemas_em_aberto = problemas_em_aberto + 1
                            
                        else:
                            
                            list_status_problema.append("Resolvido")
                            problemas_resolvidos = problemas_resolvidos + 1
                            
                    
                    else:
                        
                        list_status_problema.append("Indefinido")
                        
                    qntd_decisoes_reais = qntd_decisoes_reais + 1
                    
            for i in range(qntd_decisoes_reais):
                objetos_final.append({'instancia':lista_instancias[i],'nome':list_nomes[i], 'obs':list_obs[i], 'status':list_status_problema[i]})
            
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        
        print("---------------------------")
        print("Falha de acesso!")
        print(sys.exc_info()[0])
        print(sys.exc_info()[1])
        print(sys.exc_info()[2])
        
        print("---------------------------")

    finally:
        
        myworld.close() # só fecha o bd, deixa as instâncias no bd

    request.session['num_inst'] = num_inst
    request.session['status'] = status
        
    context = {"objetos_final": objetos_final, "problemas_em_aberto": problemas_em_aberto, "problemas_resolvidos": problemas_resolvidos}
    return render(request, 'seleciona_decisao.html', context)


# VER DADOS DA DECISAO
login_required(login_url='/app1/kipo_playground/login_page')
def decision_dashboard(request, instancia_decisao):
    """ View de Visualização de dados da Decisão, com o objetivo de auxiliar na tomada de Decisão. 
    
        :param request: HTTP Request. 
        :param instancia_decisao: String com a Instância da Decisão a ser visualizada no formato "nome + id". Exemplo: "decidir_BD1234". 
        
        :return: Objeto de render de 'decision_dashboard.html'. 
    """
    
    
    if 'num_inst' in request.session:
        del request.session['num_inst']
            
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_prop_correlatas' in request.session:
        del request.session['num_prop_correlatas']
        
        
    num_inst = 0
    
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
        
        with kiposcrum:
            
            print("Criando dashboard de DO__Decision!")
            
            
            # a query sai com prefixo "kipo."
            instancia = instancia_decisao[5:]
            print(instancia)
            
            # propriedades
            propriedades = kiposcrum[instancia].get_properties()
            print(propriedades)
            num_prop_correlatas = len(propriedades)
            
            
            '''
            propriedades!
            
            {kipo.StatusProblemaResolvido, kipo.INV_influences, kipo.INV_composes, 
            kipo.INV_ontoscrum__performs, kipo.pos_state, 
            kipo.considers, kipo.Nome, kipo.INV_threatens}
            
            '''
            
            # decisão influenciada por
            INV_influences = kiposcrum[instancia].INV_influences
            print("INV_influences " + str(INV_influences))
            num_inst = num_inst + len(INV_influences)
            
            # itens que compoem decisão
            INV_composes = kiposcrum[instancia].INV_composes
            print("INV_composes " + str(INV_composes))
            num_inst = num_inst + len(INV_composes)
            
            # decisao considera
            considers = kiposcrum[instancia].considers
            print("considers " + str(considers))
            num_inst = num_inst + len(considers)
            
            # decisao ameaçada por
            INV_threatens = kiposcrum[instancia].INV_threatens
            print("INV_threatens " + str(INV_threatens))
            num_inst = num_inst + len(INV_threatens)
            
            objeto_INV_influences = transforma_objeto(INV_influences)
            objeto_INV_composes = transforma_objeto(INV_composes)
            objeto_considers = transforma_objeto(considers)
            objeto_INV_threatens = transforma_objeto(INV_threatens)

            if str(kiposcrum[instancia].StatusProblemaResolvido.pop(0)) == "0":
                
                status_decisao = "Aberto"
                
            else:
                
                status_decisao = "Resolvido"
            
            
            status = "OK!" 
        
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        num_prop_correlatas = "Desconhecido"
        num_inst = 0
        instancia = "Erro!"
        status_decisao = "Erro!" 
            
        print("Falha de acesso!")
    
    finally:
        
        myworld.close() 
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_prop_correlatas'] = num_prop_correlatas
    request.session['num_inst'] = str(num_inst)
    request.session['instancia_decision'] = str(instancia)
    request.session['decision_status'] = status_decisao
    
    context = {"objeto_INV_influences": objeto_INV_influences, "objeto_INV_composes": objeto_INV_composes, "objeto_considers": objeto_considers, "objeto_INV_threatens": objeto_INV_threatens}
    
    return render(request, 'decision_dashboard.html', context)
    

def mudar_decisao_status(request, instancia_decisao):
    """ View de mudança de status da Decisão. 
    
        :param request: HTTP Request. 
        :param instancia_decisao: String com a Instância da Decisão. 
        
        :return: Redirecionamento para "/kipo_playground/decision_select/". 
    """

    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
        
        with kiposcrum:
            
            if str(kiposcrum[instancia_decisao].StatusProblemaResolvido.pop(0)) == "0":
                print("aqui1")
                kiposcrum[instancia_decisao].StatusProblemaResolvido.append("1")
                
            else:
                print("aqui2")
                kiposcrum[instancia_decisao].StatusProblemaResolvido.append("0")

            myworld.save()

    except:
            
        print("Falha de acesso!")
    
    finally:
        
        myworld.close() 

    return redirect('/kipo_playground/decision_select/')

# ------------------------------------------------------------

login_required(login_url='/app1/kipo_playground/login_page')
def gestao_artefatos(request):
    """ View de listagem de Artefatos. 
    
        :param request: HTTP Request. 
        
        :return: Render de 'artefatos_dashboard.html'. 
    """
    
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_inst' in request.session:
        del request.session['num_inst']
        
        
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
    
    
        with kiposcrum:
        
            lista_instancias = kiposcrum["Sprint_Backlog"].instances()
            
            num_inst = len(lista_instancias)
            
            print("\n\n\n\n")
            print(num_inst)
            print("\n\n\n\n")
            
            objeto_artefatos = transforma_objeto(lista_instancias)
            
            status = "OK!"
        
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        
        print("Falha de acesso!")
        
    
    finally:
        
        myworld.close() 
        
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_inst'] = str(num_inst)
    
    context = {"objeto_artefatos": objeto_artefatos}
    
    #return render(request, 'artefatos_dashboard.html')

    return render(request, 'artefatos_dashboard.html', context)

def detalhar_artefato(request, instancia_artefato, classe_artefato):
    """ View de detalhes de um Artefato. 
    
        :param request: HTTP Request. 
        :param instancia_artefato: Instância do Artefato. 
        :param classe_artefato: Classe do artefato. 
        
        :return: Render de 'comentario_artefato.html'. 
    """

    if 'status' in request.session:
        del request.session['status']
        
    if 'num_inst' in request.session:
        del request.session['num_inst']
    
    if "kipo." in instancia_artefato:
        instancia_artefato = str(instancia_artefato)[5:]
    if "kipo." in classe_artefato:
        classe_artefato = str(classe_artefato)[5:]

    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
    
    
        with kiposcrum:

            status = "OK!"

            if str(kiposcrum[instancia_artefato].Observacao)[0] == '[':
                observacao =  str(kiposcrum[instancia_artefato].Observacao)[2:-2]
            else:
                observacao =  str(kiposcrum[instancia_artefato].Observacao)
            
            if not observacao:
                print("N existe observacao nessa instancia!")
                observacao = "Observação indefinida!"

            print("----------------------------")
            print(observacao)

    except:
            
        status = "Erro!" 
        observacao = "Desconhecido"
        
        print("Falha de acesso!")
        
    
    finally:
        
        myworld.close() 
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['comentario_artefato'] = observacao
    request.session['instancia'] = str(instancia_artefato)

    return render(request, 'comentario_artefato.html') 

def alocar_para_tarefa(request, instancia_artefato):
    """ View de instâncias para alocar um Artefato como input ou output. 
    
        :param request: HTTP Request. 
        :param instancia_artefato: Instância do Artefato. 
        
        :return: Render de 'artefatos_alocar_dashboard.html'. 
    """

    num_inst = 0
    
    if 'status' in request.session:
        del request.session['status']
        
    if 'num_inst' in request.session:
        del request.session['num_inst']
        
        
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
    
    
        with kiposcrum:
            
            '''
            !!!Classes para listar!!!
            KIPCO__Knowledge_Intensive_Process
            KIPCO__Knowledge_Intesive_Activity
            '''
            
            lista_process = kiposcrum["KIPCO__Knowledge_Intensive_Process"].instances()
            num_inst = num_inst + len(lista_process)
            
            lista_activity = kiposcrum["KIPCO__Knowledge_Intesive_Activity"].instances()
            num_inst = num_inst + len(lista_activity)
            
            lista_artefatos = kiposcrum["Sprint_Backlog"].instances()
            
            for i in range(len(lista_artefatos)):
                
                if instancia_artefato[5:] in str(lista_artefatos[i]):
                    
                    # artefato n pode ser input ou output dele mesmo...
                    # nem vai para a lista das possibilidades de se alocar input/output
                    lista_artefatos.pop(i)
                    break # n vai ter mais de uma ocorrencia, quando achar pode terminar o loop
            
            num_inst = num_inst + len(lista_artefatos)
            
            print("\n\n\n\n")
            print(num_inst)
            print("\n\n\n\n")
            
            objeto_processo = transforma_objeto(lista_process)
            objeto_atividade = transforma_objeto(lista_activity)
            objeto_artefatos = transforma_objeto(lista_artefatos)
            
            status = "OK!"
        
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        
        print("Falha de acesso!")
        
    
    finally:
        
        myworld.close() 
        
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_inst'] = str(num_inst)
    request.session['instancia'] = instancia_artefato[5:]
    
    context = {"objeto_processo": objeto_processo, "objeto_atividade": objeto_atividade, "objeto_artefatos": objeto_artefatos}
    
    #return render(request, 'artefatos_alocar_dashboard.html')
    
    # alocar input e output são "adicionar classe com relacionamento"
    return render(request, 'artefatos_alocar_dashboard.html', context)


# ------------------------------------------------------------

login_required(login_url='/app1/kipo_playground/login_page')
def gestao_pessoas(request):
    """ View de listagem de Agentes. 
    
        :param request: HTTP Request. 
        
        :return: Render de 'gestao_pessoas.html'. 
    """

    if 'status' in request.session:
        del request.session['status']
        
    if 'num_inst' in request.session:
        del request.session['num_inst']
        
    num_inst = 0
        
    # OWLREADY2
    try:
            
        myworld = World(filename='backup.db', exclusive=False)
            
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
            
        
        sync_reasoner()
    
    
        with kiposcrum:
        
            lista_instancias_agentes = kiposcrum["KIPCO__Agent"].instances()
            
            lista_instancias_agentes_externo = kiposcrum["KIPCO__External_Agent"].instances()
            
            lista_instancias_agentes_impacto = kiposcrum["KIPCO__Impact_Agent"].instances()
            
            lista_instancias_agentes_inovacao = kiposcrum["KIPCO__Innovation_Agent"].instances()
            
            
            num_inst = num_inst + len(lista_instancias_agentes) + len(lista_instancias_agentes_externo) + len(lista_instancias_agentes_impacto) + len(lista_instancias_agentes_inovacao)
            
            print("\n\n\n\n")
            print(num_inst)
            print("\n\n\n\n")
            
            objeto_agentes = transforma_objeto(lista_instancias_agentes)
            objeto_agentes_externo = transforma_objeto(lista_instancias_agentes_externo)
            objeto_agentes_impacto = transforma_objeto(lista_instancias_agentes_impacto)
            objeto_agentes_inovacao = transforma_objeto(lista_instancias_agentes_inovacao)
            
            status = "OK!"
        
    except:
            
        status = "Erro!" 
        num_inst = "Desconhecido"
        
        print("Falha de acesso!")
        
    
    finally:
        
        myworld.close() 
        
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_inst'] = str(num_inst)
    
    context = {"objeto_agentes": objeto_agentes, "objeto_agentes_externo": objeto_agentes_externo, "objeto_agentes_impacto": objeto_agentes_impacto, "objeto_agentes_inovacao": objeto_agentes_inovacao}
    
    
    return render(request, 'gestao_pessoas.html', context)

def alocar_pessoa(request, instancia_pessoa):
    """ View de listagem de itens que um Agente pode executar. 
    
        :param request: HTTP Request. 
        :param instancia_pessoa: Instância do Agente sendo relacionado (string). 
        
        :return: Render de 'alocar_pessoas.html'. 
    """
    
    instancia = instancia_pessoa[5:] 
    
    num_inst = 0
    
    if 'status' in request.session:
        del request.session['status']
    
    if 'num_inst' in request.session:
        del request.session['num_inst']
    
    # listar
    # KIPCO__Knowledge_Intensive_Process -> Sprint
    # KIPCO__Knowledge_Intesive_Activity -> trabalho diário na sprint
    # Sprint_Backlog -> sprint backlog
    
    # OWLREADY2
    try:
        
        myworld = World(filename='backup.db', exclusive=False)
        
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
        
        
        sync_reasoner()

    
        with kiposcrum:
            
            lista_processos_intensivos = kiposcrum["KIPCO__Knowledge_Intensive_Process"].instances()
            lista_atividades = kiposcrum["KIPCO__Knowledge_Intesive_Activity"].instances()
            lista_sprint_backlog = kiposcrum["Sprint_Backlog"].instances()
            
            num_inst = num_inst + len(lista_processos_intensivos) + len(lista_atividades) + len(lista_sprint_backlog)
            
            print("\n\n\n\n")
            print(num_inst)
            print("\n\n\n\n")
            
            objetos_processos = transforma_objeto(lista_processos_intensivos)
            objetos_atividades = transforma_objeto(lista_atividades)
            objetos_sprint_backlogs = transforma_objeto(lista_sprint_backlog)
            
            status = "OK!"

    except:
        
        status = "Erro!"
        num_inst = "0"
    
    finally:
        
        myworld.close() 
        
    
    # ai aloca tarefa fazendo a relaçao
    # instancia -> ontoscrum__is_executed_by -> agente
    
    request.session['status'] = status   # "OK!" ou "Erro!"
    request.session['num_inst'] = str(num_inst)
    
    context = {"instancia": instancia, "objetos_processos": objetos_processos, "objetos_atividades": objetos_atividades, "objetos_sprint_backlogs": objetos_sprint_backlogs} 
    
    return render(request, 'alocar_pessoas.html', context)


def add_relacionamento(request, instancia1, relacao, instancia2):
    """ Cria relacionamento: "instancia1 -> relacao -> instancia2". 
    
        :param request: HTTP Request. 
        :param instancia1: Primeira Instância (string). 
        :param relacao: Relacionamento (string). 
        :param instancia2: Segunda instância (string). 
        
        :return: Render de 'inserir_relacao_tela_ok.html'. 
    """

    # instancia1 -> relacao -> instancia2
    
    if "kipo." in instancia1:
        instancia1 = instancia1.replace("kipo.", "")
    
    if "kipo." in instancia2:
        instancia2 = instancia2.replace("kipo.", "")
    
    # OWLREADY2
    try:
        
        myworld = World(filename='backup.db', exclusive=False)
        
        # aqui a KIPO e a Ontologia do Scrum tiveram um Merge!
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
        
        sync_reasoner()

        print("\n\n\n\n")
        print(relacao)
        print("\n\n\n\n")
        
        with kiposcrum:
            
            if relacao == "ontoscrum__is_executed_by":
                
                kiposcrum[instancia1].ontoscrum__is_executed_by.append(kiposcrum[instancia2])
            
            elif relacao == "ontoscrum__has_input":
            
                kiposcrum[instancia1].ontoscrum__has_input.append(kiposcrum[instancia2])
            
            elif relacao == "ontoscrum__has_output":
                
                kiposcrum[instancia1].ontoscrum__has_output.append(kiposcrum[instancia2])
            
            status = "OK!"

            myworld.save() # persiste na ontologia
            
    except:
        
        status = "Erro!"
    
    finally:
        
        myworld.close() 
        
    request.session['relacionamento'] = relacao
    request.session['instancia1'] = instancia1
    request.session['instancia2'] = instancia2
    request.session['status'] = status
    
    
    return render(request, 'inserir_relacao_tela_ok.html')

# ------------------------------------------------------------

login_required(login_url='/app1/kipo_playground/login_page')
def add_materia(request):
    """ Gestão de matérias. Adição de matéria jornalística nova. 
    
        :param request: HTTP Request. 
        
        :return: Render de 'nova_materia.html'. 
    """
    
    form = MateriaJornalistica_Form()

    context = {'form':form}
    
    if request.method == 'POST':
        
        form = MateriaJornalistica_Form(request.POST)
        # If data is valid, proceeds to create a new post
        if form.is_valid():
            post = form.save(commit=False)
            #post.author = request.user
            post.save()

            response = {
                'id': post.id,
                'texto': post.texto,
            }
            print(response)
            print(post.texto)
            return redirect('/kipo_playground/welcome/')
        print("Erro, formulario inválido!")

        return redirect('/kipo_playground/welcome/')
        
    return render(request, 'nova_materia.html', context)

login_required(login_url='/app1/kipo_playground/login_page')
def ver_materias(request):
    """ Gestão de matérias. Visualização de matérias jornalísticas. 
    
        :param request: HTTP Request. 
        
        :return: Render de 'ver_materia.html'. 
    """
    
    materias_jornalisticas = MateriaJornalistica.objects.all()

    quantidade_materias = str(len(materias_jornalisticas))

    context = {"materias_jornalisticas": materias_jornalisticas}

    print(materias_jornalisticas)

    request.session['quantidade_materias'] = quantidade_materias
    return render(request, 'ver_materia.html', context)

def ler_materia(request, id_materia):
    """ Gestão de matérias. Ler matéria jornalística. 
    
        :param request: HTTP Request. 
        
        :return: Render de 'ler_materia.html'. 
    """

    objeto_recuperado = get_object_or_404(MateriaJornalistica, id=id_materia)

    print(objeto_recuperado)

    context = {"objeto_recuperado": objeto_recuperado}

    return render(request, 'ler_materia.html', context)

def editar_materia(request, id_materia):
    """ Gestão de matérias. Edição de matéria jornalística. 
    
        :param request: HTTP Request. 
        
        :return: Render de 'nova_materia.html'. 
    """

    instance = get_object_or_404(MateriaJornalistica, id=id_materia)

    form = MateriaJornalistica_Form(request.POST or None, instance=instance)

    context = {'form':form}
    
    if form.is_valid():
        post = form.save(commit=False)
        #post.author = request.user
        post.save()

        response = {
            'id': post.id,
            'texto': post.texto,
        }
        print(response)
        print(post.texto)
        return redirect('/kipo_playground/welcome/')
    #print("Erro, formulario inválido!")

        
    return render(request, 'nova_materia.html', context)

# ------------------------------------------------------------

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
            'feedback_revisor': p.feedback_revisao
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