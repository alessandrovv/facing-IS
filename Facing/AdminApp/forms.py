from django import forms
from django.forms import fields
from .models import *

class EscuelaForm(forms.ModelForm):
    class Meta:
        model=Escuela
        fields = ['nombre','slug','visto']

class NoticiaForm(forms.ModelForm):
    class Meta:
        model = Noticia
        fields = ['titulo', 'descripcion', 'seccion', 'fecha']