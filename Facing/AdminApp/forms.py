
from tkinter import Widget
from django import forms 
from django.forms import fields
from carrerasApp.models import *
from noticiasApp.models import *
from tesisApp.models import *

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
        fields = ['titulo', 'descripcion', 'seccion', 'fecha','idusuario', 'ruta']
        widgets = {
            'fecha':DateInput()
        }
class VideoForm(forms.ModelForm):
    class Meta:
        model=Videos
        fields = ['ruta','titulo','descripcion','seccion','idusuario']


class CurriculaForm(forms.ModelForm):
    class Meta:
        model=Curriculas
        fields = ['codigo','codigoint','asignatura','tipo','creditos','condicion',
                'ht','hp','hl','requisito','departamento','idciclo','idescuela']

class tesisForm(forms.ModelForm):
    class Meta:
        model=Tesis
        fields = ['ruta','titulo','descripcion','autor']

