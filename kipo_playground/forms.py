"""Módulo de Forms de kipo_playground

Em base de modelos estabelecidos, contém formulários para inserir uma nova instância, para recuperar as instâncias de um tipo e para inserir uma sprint nova.

"""

from django.forms import ModelForm
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .models import MateriaJornalistica, novo_instancias_tipo, inserir_instancias_tipo, inserir_instancias_dada_classe, definir_obs_backlogitem, definir_status_backlogitem, definir_esforco_backlogitem

# criação de usuário default!
class CreateUser(UserCreationForm):
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

#! Form de Matéria Jornalística
class MateriaJornalistica_Form(ModelForm):
    
    class Meta:
        model = MateriaJornalistica
        fields = ['id', 'titulo', 'texto', 'sutien', 'editores', 'autores', 'main_keyword', 'status', 'data_atualizacao']

#! Form de Esforço de Backlog Item
class definir_esforco_backlogitem_Form(ModelForm):
    
    class Meta:
        model = definir_esforco_backlogitem
        fields = ['esforco']

#! Form de nova instância, dada uma classe.
class inserir_instancias_dada_classeForm(ModelForm):
    
    class Meta:
        model = inserir_instancias_dada_classe
        fields = ['nome', 'observacao']
        

#! Form de nova instância.
class inserir_instancias_tipoForm(ModelForm):
    
    class Meta:
        model = inserir_instancias_tipo
        fields = ['nome', 'classe', 'observacao']
        

#! Form de busca de instâncias.
class novo_instancias_tipoForm(ModelForm):
    
    class Meta:
        model = novo_instancias_tipo
        fields = ['busca']
        

#! Form de definição de status de Item de Backlog
class definir_status_backlogitem_Form(ModelForm):

    class Meta:
        model = definir_status_backlogitem
        fields = ['classe']
        

#! Form de adição de comentário em Item de Backlog
class definir_obs_backlogitem_Form(ModelForm):
    
    class Meta:
        model = definir_obs_backlogitem
        fields = ['observacao']
        