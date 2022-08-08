from django import forms 
from django.forms import fields
from carrerasApp.models import Ciclos
from carrerasApp.models import Docentes

class CiclosForm(forms.ModelForm):
    class Meta:
        model=Ciclos
        fields=['ciclo'] 
    
class DocentesForm(forms.ModelForm):
    class Meta:
        model=Docentes
        fields=['Nombre','ImagenRuta','idEscuela']