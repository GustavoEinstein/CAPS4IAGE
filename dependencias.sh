# Script shell para instalação de dependências

# echo "Hello $USER"
# echo "Se certifique que seu Python3 está em dia (Python 3.9.7)"
# python3 --version
# pip3 install Owlready2
# pip3 install Django
# pip install django-crispy-forms
# pip3 install django-crispy-form
# pip3 install --upgrade pip
# pip3 install django-ckeditor
# pip3 install numpy
# pip install djangorestframework django-cors-headers
# echo "Rodando Django -> 'python3 manage.py runserver'"
# python3 manage.py runserver
# echo "Tchau $USER"

#!/bin/bash

echo "Ativando ambiente virtual..."
source venv/bin/activate

echo "Instalando setuptools e wheel..."
pip install --upgrade setuptools wheel

echo "Instalando todas as dependências do requirements.txt..."
pip install -r requirements.txt

echo "Migrações do banco de dados..."
python3 manage.py migrate

echo "Setup concluído com sucesso!"
echo "Para rodar o servidor, execute: python3 manage.py runserver"
