
from django import forms 
from django.forms import fields
from carrerasApp.models import Ciclos
from carrerasApp.models import Docentes
from .models import *

class CiclosForm(forms.ModelForm):
    class Meta:
        model=Ciclos
        fields=['ciclo'] 
    
class DocentesForm(forms.ModelForm):
    class Meta:
        model=Docentes
        fields=['Nombre','ImagenRuta','idEscuela']

class EscuelaForm(forms.ModelForm):
    class Meta:
        model=Escuela
        fields = ['nombre','slug','visto']

class NoticiaForm(forms.ModelForm):
    class Meta:
        model = Noticia
        fields = ['titulo', 'descripcion', 'seccion', 'fecha']
