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

from django.contrib.auth import authenticate, login, logout
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

from rest_framework.decorators import api_view
from rest_framework.response import Response

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

@api_view(['GET'])
def api_listar_ciclos(request):
    """
    API que retorna os Ciclos de Aprendizagem (antigas Sprints) em formato JSON
    para o React consumir.
    """
    objetos_finais = []
    
    try:
        # Carrega a ontologia (Copiado da sua lógica original)
        myworld = World(filename='backup.db', exclusive=False)
        # Ajuste o caminho se necessário, usando os.path.dirname como você já faz
        kiposcrum = myworld.get_ontology("http://www.semanticweb.org/fialho/kipo").load()
        sync_reasoner()
        
        with kiposcrum:
            # Busca todas as Sprints (Ciclos)
            lista_instancias = kiposcrum["scrum_Sprint"].instances()
            
            # REUSA sua função auxiliar 'transforma_objeto' que já limpa os dados!
            # Isso economiza muito trabalho.
            objetos_finais = transforma_objeto(lista_instancias)
            
    except Exception as e:
        return Response({"status": "Erro", "mensagem": str(e)}, status=500)
        
    finally:
        myworld.close()

    # O DRF converte a lista de dicionários em JSON automaticamente
    return Response(objetos_finais)
# ------------------------------------------------------------
