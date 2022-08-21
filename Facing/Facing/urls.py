"""Facing URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from unicodedata import name
from django.contrib import admin
from django.urls import path
from SeguridadApp.views import *
from AdminApp.views import *
from novedadesApp.views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',home ,name="home"),
    path('misionyvision/',mvision ,name="misionyvision"),
    path('organigrama/',organigrama ,name="organigrama"),
    path('faq/',faq ,name="preguntasfrec"),
    path('reseña/',reseñaH ,name="reseñahistorica"),
    path('logout/',salir,name="logout"),
    path('ingresar/', acceder, name='login'),
    path('subirvideo/', subir, name='subirvideo'),   
    path('dashboard/', dashboard, name='dashboard'),
    path('listarciclos',listarciclo,name='ciclos'),
    path('agregarciclo',agregarciclo,name='addciclo'),
    path('eliminarciclo/<int:id>/',eliminarciclo,name='deleteciclo'),
    path('editarciclo/<int:id>/',editarciclo,name='editciclo'),
    path('listardocente',listardocente,name='docentes'),
    path('agregardocente',agregardocente,name='adddocente'),
    path('eliminardocente/<int:id>/',eliminardocente,name='deletedocente'),
    path('editardocente/<int:id>/',editardocente,name='editdocente'),
    path('escuela/lista/',listarEscuela,name='listarescuela'),
    path('escuela/agregar/',agregarEscuela,name='agregarescuela'),
    path('escuela/editar/<int:id>/',editarEscuela,name='editarescuela'),
    path('escuela/eliminar/<int:id>/',eliminarEscuela,name='eliminarescuela'),
    path('noticia/lista/',listarNoticia,name='listarnoticia'),
    path('noticia/agregar/',agregarNoticia,name='agregarnoticia'),
    path('noticia/editar/<int:id>/',editarNoticia,name='editarnoticia'),
    path('noticia/eliminar/<int:id>/',eliminarNoticia,name='eliminarnoticia'),
    path('listarvideo',listarvideo, name='videos'),
    path('agregarvideo',agregarvideo,name='addvideo'),
    path('listarvideo/eliminarvideo/<int:id>/',eliminarvideo,name='deletevideo'),
    path('editarvideo/<int:id>/',editarvideo,name='editvideo'),
    path('concursodocente/', concursodocente, name='concursodocente'),
    path('resolucionesconsejo/', resolucionesconsejo, name='resolucionesconsejo'),
    path('virtual/', virtual, name='virtual'),
    path('calidad/', calidad, name='calidad'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)