
from tkinter import Widget
from django import forms 
from django.forms import fields
from carrerasApp.models import *
from noticiasApp.models import *

class DateInput(forms.DateInput):
    input_type = 'date'

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
        model=Escuelas
        fields = ['nombre','slug','visto']

class NoticiaForm(forms.ModelForm):
    class Meta:
        model = Noticias
        fields = ['titulo', 'descripcion', 'seccion', 'fecha','idusuario']
        widgets = {
            'fecha':DateInput()
        }