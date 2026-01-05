# Script shell para instalação de dependências

echo "Hello $USER"
echo "Se certifique que seu Python3 está em dia (Python 3.9.7)"
python3 --version
pip3 install Owlready2
pip3 install Django
pip install django-crispy-forms
pip3 install django-crispy-form
pip3 install --upgrade pip
pip3 install django-ckeditor
pip3 install numpy
pip install djangorestframework django-cors-headers
echo "Rodando Django -> 'python3 manage.py runserver'"
python3 manage.py runserver
echo "Tchau $USER"
