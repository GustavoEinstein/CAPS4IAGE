"""Módulo de Models de kipo_playground

Define modelos de dados para gerar os formulários usados na interação básica com o Sistema Calliandra.

Foi feito um modelo para uma nova instância de Sprint (campos 'nome' e 'observação'), para inserir uma nova instância (campos 'nome', 'classe' e 'observação') e para recuperar uma instância baseada em tipo (campo 'busca', com a listagem de possíveis classes).


"""
from django.db import models
from ckeditor.fields import RichTextField
import random
from datetime import date

def random_string():
    return str(random.randint(1000000, 99999999))

# Create your models here.

#! Matéria Jornalística.
class MateriaJornalistica(models.Model):
    
    OPCOES = (
        ('Política', 'Política'),
        ('Esportes', 'Esportes'),
        ('Coluna Autoral', 'Coluna Autoral'),
        ('Variedades', 'Variedades'),
        ('Notícias Internacionais', 'Notícias Internacionais'),
        ('Celebridades', 'Celebridades'),
        ('Anúncio', 'Anúncio'),
        ('Tecnologia', 'Tecnologia'),
        ('Vida e Estilo', 'Vida e Estilo'),
        ('Saúde', 'Saúde'),
        ('Notícia Regional', 'Notícia Regional')
    )

    OPCOES_STATUS = (
        ('Publicado', 'Publicado'),
        ('Publicar em breve', 'Publicar em breve'),
        ('Guardado', 'Guardado'),
        ('Indefinido', 'Indefinido'),
    )

    CKEDITOR_CONFIGS = {
        'awesome_ckeditor': {
            'toolbar': 'Basic',
        },
    }

    id = models.CharField(max_length=255, primary_key=True, default=random_string())
    titulo = models.CharField(max_length=255, null=False)
    #
    texto = RichTextField(config_name='awesome_ckeditor')
    
    #texto = models.CharField(max_length=255)

    sutien = models.CharField(max_length=255)
    editores = models.CharField(max_length=255)
    autores = models.CharField(max_length=255, null=False)
    main_keyword = models.CharField(max_length=255, null=False, choices=OPCOES)
    status = models.CharField(max_length=255, null=False, choices=OPCOES_STATUS, default="Indefinido")

    data_atualizacao = models.DateField(default=date.today)

    def _str_(self):
        return self.id

#! Esforço de Item do Backlog.
class definir_esforco_backlogitem(models.Model):
    
    OPCOES = (
        ('2', '2'), 
        ('3', '3'), 
        ('5', '5'), 
        ('7', '7'), 
        ('11', '11'), 
        ('13', '13'), 
        ('17', '17'), 
        ('19', '19')
        )
    
    esforco = models.CharField(max_length=255, null=False, choices=OPCOES)
    
    def __str__(self):
        return self.esforco

#! Status de Item de backlog.
class definir_status_backlogitem(models.Model):
    
    OPCOES = (
        ('Item não foi resolvido', 'Não'), 
        ('Item foi resolvido', 'Sim')
    )
    
    classe = models.CharField(max_length=255, null=False, choices=OPCOES)
    
    def __str__(self):
        return self.classe

#! Observação de Item de backlog.
class definir_obs_backlogitem(models.Model):
    
    
    observacao = models.TextField()
    
    def __str__(self):
        return self.observacao

#! Inserção de instância dada uma classe.
class inserir_instancias_dada_classe(models.Model):
    
    
    nome = models.CharField(max_length=255, null=False)
    observacao = models.TextField()
    
    def __str__(self):
        return self.nome

#! Inserir instância com classe.
class inserir_instancias_tipo(models.Model):
    
    CLASSES = (
        ('BPO__Activity', 'BPO__Activity'),
        ('BPO__Association', 'BPO__Association'),
        ('BPO__Data_Object', 'BPO__Data_Object'),
        ('BPO__Flow', 'BPO__Flow'),
        ('BPO__Message_Flow', 'BPO__Message_Flow'),
        ('BRO__Derivation_Foundational_Rule', 'BRO__Derivation_Foundational_Rule'),
        ('BRO__Foundational_Conclusion', 'BRO__Foundational_Conclusion'),
        ('BRO__Foundational_Condition', 'BRO__Foundational_Condition'),
        ('BRO__Foundational_Event', 'BRO__Foundational_Event'),
        ('BRO__Foundational_Integrity_Rule', 'BRO__Foundational_Integrity_Rule'),
        ('BRO__Foundational_Business_Rule', 'BRO__Foundational_Business_Rule'),
        ('BRO__Reaction_Foundational_Rule', 'BRO__Reaction_Foundational_Rule'),
        ('CO__COM__Communicative_Interaction', 'CO__COM__Communicative_Interaction'),
        ('CO__COM__Message', 'CO__COM__Message'),
        ('CO__COM__Perception', 'CO__COM__Perception'),
        ('CO__COM__Receiver', 'CO__COM__Receiver'),
        ('CO__COM__Sender', 'CO__COM__Sender'),
        ('DO__Advantage', 'DO__Advantage'),
        ('DO__Alternative', 'DO__Alternative'),
        ('DO__Criterion', 'DO__Criterion'),
        ('DO__Decision', 'DO__Decision'),
        ('DO__Disadvantage', 'DO__Disadvantage'),
        ('DO__Evidence', 'DO__Evidence'),
        ('DO__Fact', 'DO__Fact'),
        ('DO__Feeling', 'DO__Feeling'),
        ('DO__Question', 'DO__Question'),
        ('DO__Resource', 'DO__Resource'),
        ('DO__Chosen_Alternative', 'DO__Chosen_Alternative'),
        ('DO__Discarted_Alternative', 'DO__Discarted_Alternative'),
        ('DO__Restriction', 'DO__Restriction'),
        ('DO__Risk', 'DO__Risk'),
        ('DO_Fact', 'DO_Fact'),
        ('KIPCO__Knowledge_Intensive_Activity', 'KIPCO__Knowledge_Intensive_Activity'),
        ('KIPCO__Message_Flow', 'KIPCO__Message_Flow'),
        ('KIPCO__Socialization', 'KIPCO__Socialization'),
        ('KIPCO__Derivation_Rule', 'KIPCO__Derivation_Rule'),
        ('KIPCO__Integrity_Rule', 'KIPCO__Integrity_Rule'),
        ('KIPCO__Reaction_Rule', 'KIPCO__Reaction_Rule'),
        ('KIPCO__Business_Rule', 'KIPCO__Business_Rule'),
        ('KIPCO__Activity_Goal', 'KIPCO__Activity_Goal'),
        ('KIPCO__Agent', 'KIPCO__Agent'),
        ('KIPCO__Impact_Agent', 'KIPCO__Impact_Agent'),
        ('KIPCO__Innovation_Agent', 'KIPCO__Innovation_Agent'),
        ('KIPCO__External_Agent', 'KIPCO__External_Agent'),
        ('KIPCO__Assertion', 'KIPCO__Assertion'),
        ('KIPCO__Belief', 'KIPCO__Belief'),
        ('KIPCO__Communication', 'KIPCO__Communication'),
        ('KIPCO__Contingency', 'KIPCO__Contingency'),
        ('KIPCO__Desire', 'KIPCO__Desire'),
        ('KIPCO__Experience', 'KIPCO__Experience'),
        ('KIPCO__Intention', 'KIPCO__Intention'),
        ('KIPCO__Knowledge_Intensive_Process', 'KIPCO__Knowledge_Intensive_Process'),
        ('KIPCO__Knowledge_Structure', 'KIPCO__Knowledge_Structure'),
        ('KIPCO__Makes_To_Solve', 'KIPCO__Makes_To_Solve'),
        ('KIPCO__Mental_Image', 'KIPCO__Mental_Image'),
        ('KIPCO__Process_Goal', 'KIPCO__Process_Goal'),
        ('KIPCO__Specialty', 'KIPCO__Specialty'),
        ('Sprint_Backlog', 'Sprint_Backlog'),
        ('Product_Backlog', 'Product_Backlog'),
        ('Product_Backlog_Item', 'Product_Backlog_Item'),
        ('Product_Feature', 'Product_Feature'),
        ('Release_Plan', 'Release_Plan'),
        ('Task_Description', 'Task_Description'),
        ('scrum_Continuous', 'scrum_Continuous'),
        ('scrum_Daily', 'scrum_Daily'),
        ('scrum_Daily_Scrum_Meeting', 'scrum_Daily_Scrum_Meeting'),
        ('scrum_Meeting', 'scrum_Meeting'),
        ('scrum_PlanningHorizon', 'scrum_PlanningHorizon'),
        ('scrum_Release_Planning_Horizon', 'scrum_Release_Planning_Horizon'),
        ('scrum_Sprint', 'scrum_Sprint'),
        ('scrum_Sprint_Planning_Meeting', 'scrum_Sprint_Planning_Meeting'),
        ('scrum_Sprint_Retrospective_Meeting', 'scrum_Sprint_Retrospective_Meeting'),
        ('scrum_Sprint_Review_Meeting', 'scrum_Sprint_Review_Meeting'),
        ('scrum_Strategy_Planning_Horizon', 'scrum_Strategy_Planning_Horizon'),
        ('Vision_Creation', 'Vision_Creation'),
        ('scrum_Daily', 'scrum_Daily'),
        ('Product_Roadpmap_Creation', 'Product_Roadpmap_Creation'),
        ('Backlog_Updating', 'Backlog_Updating'),
        ('Feature_Development', 'Feature_Development'),
        ('Impedments_Reporting', 'Impedments_Reporting'),
        ('Initial_Backlog_Creation', 'Initial_Backlog_Creation'),
        ('Initial_Sprint_Planning', 'Initial_Sprint_Planning'),
        ('Release_Planning', 'Release_Planning'),
        ('Sprint_Retrospective', 'Sprint_Retrospective'),
        ('Sprint_Review', 'Sprint_Review'),
        ('Sprint_Tasks_Control', 'Sprint_Tasks_Control'),
        ('Sprint_Tasks_Updating', 'Sprint_Tasks_Updating'),
        ('Product_Owner', 'Product_Owner'),
        ('Scrum_Master', 'Scrum_Master'),
        ('scrum_Team_Member', 'scrum_Team_Member'),
        ('Stakeholder', 'Stakeholder'),
        ('Commited_Team_Member', 'Commited_Team_Member'),
        ('Involved_Team_Member', 'Involved_Team_Member')
    )
    
    nome = models.CharField(max_length=255, null=False)
    classe = models.CharField(max_length=255, null=False, choices=CLASSES)
    observacao = models.TextField()
    
    def __str__(self):
        return self.nome

#! Busca de instância.
class novo_instancias_tipo(models.Model):
    
    CLASSES = (
        ('BPO__Activity', 'BPO__Activity'),
        ('BPO__Association', 'BPO__Association'),
        ('BPO__Data_Object', 'BPO__Data_Object'),
        ('BPO__Flow', 'BPO__Flow'),
        ('BPO__Message_Flow', 'BPO__Message_Flow'),
        ('BRO__Derivation_Foundational_Rule', 'BRO__Derivation_Foundational_Rule'),
        ('BRO__Foundational_Conclusion', 'BRO__Foundational_Conclusion'),
        ('BRO__Foundational_Condition', 'BRO__Foundational_Condition'),
        ('BRO__Foundational_Event', 'BRO__Foundational_Event'),
        ('BRO__Foundational_Integrity_Rule', 'BRO__Foundational_Integrity_Rule'),
        ('BRO__Foundational_Business_Rule', 'BRO__Foundational_Business_Rule'),
        ('BRO__Reaction_Foundational_Rule', 'BRO__Reaction_Foundational_Rule'),
        ('CO__COM__Communicative_Interaction', 'CO__COM__Communicative_Interaction'),
        ('CO__COM__Message', 'CO__COM__Message'),
        ('CO__COM__Perception', 'CO__COM__Perception'),
        ('CO__COM__Receiver', 'CO__COM__Receiver'),
        ('CO__COM__Sender', 'CO__COM__Sender'),
        ('DO__Advantage', 'DO__Advantage'),
        ('DO__Alternative', 'DO__Alternative'),
        ('DO__Criterion', 'DO__Criterion'),
        ('DO__Decision', 'DO__Decision'),
        ('DO__Disadvantage', 'DO__Disadvantage'),
        ('DO__Evidence', 'DO__Evidence'),
        ('DO__Fact', 'DO__Fact'),
        ('DO__Feeling', 'DO__Feeling'),
        ('DO__Question', 'DO__Question'),
        ('DO__Resource', 'DO__Resource'),
        ('DO__Chosen_Alternative', 'DO__Chosen_Alternative'),
        ('DO__Discarted_Alternative', 'DO__Discarted_Alternative'),
        ('DO__Restriction', 'DO__Restriction'),
        ('DO__Risk', 'DO__Risk'),
        ('DO_Fact', 'DO_Fact'),
        ('KIPCO__Knowledge_Intensive_Activity', 'KIPCO__Knowledge_Intensive_Activity'),
        ('KIPCO__Message_Flow', 'KIPCO__Message_Flow'),
        ('KIPCO__Socialization', 'KIPCO__Socialization'),
        ('KIPCO__Derivation_Rule', 'KIPCO__Derivation_Rule'),
        ('KIPCO__Integrity_Rule', 'KIPCO__Integrity_Rule'),
        ('KIPCO__Reaction_Rule', 'KIPCO__Reaction_Rule'),
        ('KIPCO__Business_Rule', 'KIPCO__Business_Rule'),
        ('KIPCO__Activity_Goal', 'KIPCO__Activity_Goal'),
        ('KIPCO__Agent', 'KIPCO__Agent'),
        ('KIPCO__Impact_Agent', 'KIPCO__Impact_Agent'),
        ('KIPCO__Innovation_Agent', 'KIPCO__Innovation_Agent'),
        ('KIPCO__External_Agent', 'KIPCO__External_Agent'),
        ('KIPCO__Assertion', 'KIPCO__Assertion'),
        ('KIPCO__Belief', 'KIPCO__Belief'),
        ('KIPCO__Communication', 'KIPCO__Communication'),
        ('KIPCO__Contingency', 'KIPCO__Contingency'),
        ('KIPCO__Desire', 'KIPCO__Desire'),
        ('KIPCO__Experience', 'KIPCO__Experience'),
        ('KIPCO__Intention', 'KIPCO__Intention'),
        ('KIPCO__Knowledge_Intensive_Process', 'KIPCO__Knowledge_Intensive_Process'),
        ('KIPCO__Knowledge_Structure', 'KIPCO__Knowledge_Structure'),
        ('KIPCO__Makes_To_Solve', 'KIPCO__Makes_To_Solve'),
        ('KIPCO__Mental_Image', 'KIPCO__Mental_Image'),
        ('KIPCO__Process_Goal', 'KIPCO__Process_Goal'),
        ('KIPCO__Specialty', 'KIPCO__Specialty'),
        ('Sprint_Backlog', 'Sprint_Backlog'),
        ('Product_Backlog', 'Product_Backlog'),
        ('Product_Backlog_Item', 'Product_Backlog_Item'),
        ('Product_Feature', 'Product_Feature'),
        ('Release_Plan', 'Release_Plan'),
        ('Task_Description', 'Task_Description'),
        ('scrum_Continuous', 'scrum_Continuous'),
        ('scrum_Daily', 'scrum_Daily'),
        ('scrum_Daily_Scrum_Meeting', 'scrum_Daily_Scrum_Meeting'),
        ('scrum_Meeting', 'scrum_Meeting'),
        ('scrum_PlanningHorizon', 'scrum_PlanningHorizon'),
        ('scrum_Release_Planning_Horizon', 'scrum_Release_Planning_Horizon'),
        ('scrum_Sprint', 'scrum_Sprint'),
        ('scrum_Sprint_Planning_Meeting', 'scrum_Sprint_Planning_Meeting'),
        ('scrum_Sprint_Retrospective_Meeting', 'scrum_Sprint_Retrospective_Meeting'),
        ('scrum_Sprint_Review_Meeting', 'scrum_Sprint_Review_Meeting'),
        ('scrum_Strategy_Planning_Horizon', 'scrum_Strategy_Planning_Horizon'),
        ('Vision_Creation', 'Vision_Creation'),
        ('scrum_Daily', 'scrum_Daily'),
        ('Product_Roadpmap_Creation', 'Product_Roadpmap_Creation'),
        ('Backlog_Updating', 'Backlog_Updating'),
        ('Feature_Development', 'Feature_Development'),
        ('Impedments_Reporting', 'Impedments_Reporting'),
        ('Initial_Backlog_Creation', 'Initial_Backlog_Creation'),
        ('Initial_Sprint_Planning', 'Initial_Sprint_Planning'),
        ('Release_Planning', 'Release_Planning'),
        ('Sprint_Retrospective', 'Sprint_Retrospective'),
        ('Sprint_Review', 'Sprint_Review'),
        ('Sprint_Tasks_Control', 'Sprint_Tasks_Control'),
        ('Sprint_Tasks_Updating', 'Sprint_Tasks_Updating'),
        ('Product_Owner', 'Product_Owner'),
        ('Scrum_Master', 'Scrum_Master'),
        ('scrum_Team_Member', 'scrum_Team_Member'),
        ('Stakeholder', 'Stakeholder'),
        ('Commited_Team_Member', 'Commited_Team_Member'),
        ('Involved_Team_Member', 'Involved_Team_Member')
    )
        
    
    busca = models.CharField(max_length=255, null=False, choices=CLASSES)
    
    def __str__(self):
        return self.busca
    # retorna o titulo como string para aparecer na listagem de posts