from django.contrib import admin
from .models import *

# Register your models here.

class DocentesAdmin(admin.ModelAdmin):
    list_display=("nombre","idEscuela")

admin.site.register(Docentes,DocentesAdmin)
admin.site.register(Escuelas)
admin.site.register(Grado_docente)
admin.site.register(Exp_lab)
admin.site.register(Ciclos)
admin.site.register(Curriculas)