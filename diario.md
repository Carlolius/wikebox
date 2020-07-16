
# Diario

**27/03/2020**  
Seguindo as instrucións [deste tutorial](https://www.ionicanddjangotutorial.com/design-and-setup.html) se crea un novo cartafol chamado traballo, dentro deste creamos o cartafol backend no que se inclua o wikebackend que contén:  

1. wikebackend: as settings e url do proxecto de django.
1. requeriments: especificazón de librarias necesárias para o proxecto.
1. manage.py: python comand to run the server.
1. api: manage the data and serve it to the frontend.

Se supón que a encriptación de Django por defecto é lenta para desencriptar en dispositivos móbis, poderia facer unha extensión de usuário para modificar isto.
[Mais info sobre a extensión de usuário](https://simpleisbetterthancomplex.com/tutorial/2016/07/22/how-to-extend-django-user-model.html#abstractbaseuser)

**Cambio de idea mirar como crear unha api en django.**

**30/03/2020**  
Partindo da idea de onte te comprobar como facer unha api en django, [este tutorial](https://medium.com/@BennettGarner/build-your-first-rest-api-with-django-rest-framework-e394e39a482c) me serve para comprobar que a primeira parte de onte serve: Creación do proxecto, e unha app separada chamada api que é o que utilizarei para api.

A api hai que introducilo nas settings do proxecto. Creamos o superusuario. E o próximo sería crear o modelo da base de datos no models.
O tutorial está bastante ben explicado.

[Quickstart tutorial](https://www.django-rest-framework.org/tutorial/quickstart/) "official" pra crear unha api con django rest framework.

**31/03/2020**  
Descuberto un proxecto similar o meu [raveberry](https://github.com/raveberry/raveberry/).  
Creazón de Song no models.py é o primeiro modelo, funciona como a definición da base de datos.
Tiven problemas para activar a api en installed apps xa que o cartafol non se atopaba na ruta axeitada.
Para mañá estaría ben definir máis modelos e seguir o [Quickstart tutorial](https://www.django-rest-framework.org/tutorial/quickstart/) apoiandose no outro tamén.

**01/04/2020**  
Aprendizaxe do uso dos serializers, probas e tests.

**03/04/2020**
Creazón do modelo da canción que está a soar. Current song

**04/04/2020**
Uso dos serializers con *Hyperlinkedmodes* que fai que non sexa necesario reescribir os modelos nos serializers.
Creación dos primeiros datos e se amosan na api, se poden comprobar dende o navegador, como se obteñen os datos e facer tanto get como post.
O próximo sería: intentar que esto se vexa en Ionic, continuar creando modelos ou seguir co tutorial de djangoframework.

**07/04/2020**  
Xa que algunhas cousas non estaban claras de todo busquei mais tutos, [este](https://www.valentinog.com/blog/drf/) está bastante actualizado, ten algo de información de como facer os tests, e ben explicado. É o mais recomendable dos que vin agora xa que está actualizado.

**10/04/2020**  
Cambiouse a organización de carpetas e se subiu o gitlab para manter mellor a xestión do proxecto.

**11/04/2020**  
Diferentes probas para ir conectando a aplicación coa api de Spotify así poder ir traballando un pouco coas cancións.

**13/04/2020**  
Se creou a aplicación de spotify en Spotify developers. Parece ser que o tekore funciona mellor para o que eu quero que o spotipy.  
Libraría que uso para a conexión co Spotify [Tekore](https://tekore.readthedocs.io/) [Git Tekore](https://github.com/felix-hilden/tekore).  
Creei o frontend e tamén creei a api de Ionic que se vai a utilizar pra facer as requests sobre http ao django.

**15/04/2020**  
Intento de obter os datos con ionic facendo unha api (servicio) que se supon que obtén os datos da api de django sen moito problema. Non funciona ten pinta de que por culpa dos imports. Tal vez o mellor sería borrar o proxecto enteiro e comezar de novo con algo similar porque a verdade que é bastante complicado tocar tantos arquivos a vez.

**16/04/2020**  
Se borrou o proxecto enteiro de Ionic para comezar de novo. Os erros que atopei onte se dan igual hoxe co proxecto novo Ionic non é capaz de facer o get, pero non di onde están os erros. Revisar isto mañá: [Facer peticións http en ionic](https://www.techiediaries.com/ionic-http-client/)

**18/04/2020**  
Non consigo que se mostren os datos por html, entre varios tutos [este,](https://blog.ng-classroom.com/blog/ionic2/rest-api-with-ionic/) [este,](https://www.nigmacode.com/ionic/Conectar-api-con-ionic) [este,](https://www.freecodecamp.org/news/how-to-build-your-first-ionic-4-app-with-api-calls-f6ea747dc17a/) e [este](https://www.techiediaries.com/ionic-http-client/) creo que conseguin que se faga a petición dende Ionic pero non sei ben como podo comprobalo. O ideal sería imprimilo no html de algunha maneira pero non da xeito. Mañá debería seguir tentando facer isto, xa que unha vez que o teña pois podo xestionar todo dunha forma mais sinxela.

**20/04/2020**  
Parece ser que non estaba a funcionar ben xa que a páxina non se cargaba correctamente entón non funciona o `ionViewDidLoad()` non teño claro de todo por que non está a cargar a páxina, unha vez cargada parece que tampouco fai ben de todo o get. [Aquí](https://www.joshmorony.com/loading-remote-json-data-with-http-in-ionic-2/) está a info dunha forma mais sinxela que nos tutos do último día.  
Para mañá buscar o erro que fai que a páxina non cargue ben e fai que `ionViewDidLoad` non funcione adecuadamente.

**21/04/2020**  
O problema de onte era de versións, `ionViewDidLoad` xa non funciona, hai que usar o ciclo de angular `ngOnInit` parece que a petición se fai, pero non devolve o que debería de devolver con outras webs sí que funciona así que o problema debe de ser porque os datos non proceden do mesmo sitio (host) pode ter que ver co bloqueo de `CORS`. [Nesta páxina](https://www.djamware.com/post/5b94bb1d80aca74669894415/ionic-4-angular-6-tutorial-call-multiple-services-at-once) hai información de como usar os observables e como facer peticións asíncronas é o que usei mais ou menos para arranxar os erros de hoxe.

**22/04/2020**  
Efectivamente a problematica do erro nas peticións ven dado polo bloqueo Cross-Origin Resource Sharing (CORS). Para mañá habería que mirar como mandar os headers para que non haxa problemas co CORS.

**23/04/2020**  
Tiven que meter no django o middleware para que non dea problemas as peticións CORS ao mandar a información, pero no front en ionic tamén fai falta meter unhas cabeceiras para que se saiba que a petición devolve un json. O problema agora é coa promise, supoño que é que a consulta a api non é suficientemente rápida entón hai que meter un promise para que se tarda, non dea o erro. Para mañá sería ideal arranxar o do promise polo menos.

**27/04/2020**  
O problema era que na configuración dos middleware de Django o middleware de CORS se cargaba despois de outros middleware o que fai que estes bloqueen as peticións de CORS, simplemente cargandoo antes se arranxa o problema. Para mañá mostrar o json no frontend.

**29/04/2020**  
Intento de facer o get dunha mellor maneira, consultando a documentación de [angular](https://angular.io/guide/http) e este [tutorial de get](https://angular.io/tutorial/toh-pt6) teño que mirar ben como funcionan os observables, xa que cambiaron recentemente e a sintaxis non a teño clara. Tecnicamente o que deixei hoxe funciona, pero non obteño os logs na consola do navegador.

**30/04/2020**  
Lectura de tutoriais sobre programación reactiva para tentar como funciona RxJS e a sua vez aprender a usar o obvserver que ten pinta de ser o mellor que hai para o que eu quero facer. [Tutorial 1](https://medium.com/@osmancea/programaci%C3%B3n-reactiva-en-javascript-997478d45bfb) non está mal, pero non é demasiado doado de comprender. [Tutorial 2](http://blog.enriqueoriol.com/2019/03/aprende-rxjs-1.html) parece mais comprensible. Haberá que adicarlle mais tempo a isto, unha vez que controle mais debería de ir todo mais de corrido.

**05/05/2020**  
Os días anteriores estiven aprendendo a usar RxJS.

**06/05/2020**  
Limpeza das probas con RxJS e intento de facela mellor.

**08/05/2020**  
Definición do desenvolvemento dos próximos días. Xestión de usuarios.

**09/05/2020**  
Documentación sobre como xestionar os usuarios. As formas mais viables parecen ou por authentication token ou con session authentication baseada en cookies, parece a mais axeitada para o meu uso. A implementación sería: xestionar os usuarios con django e dende ionic facer o login e manter a sesión aberta con sessions. [Documentación de atenticación en Django](https://www.django-rest-framework.org/api-guide/authentication/), [Video sobre a atentificacion en django](https://www.youtube.com/watch?v=kh4YFQrvVyE)
Mañá crear usuarios e probar o tema de sessions a ver como é.

**29/05/2020**  
Con [este vídeo](https://www.youtube.com/watch?v=_OhF6FEdIao&t=210s), [este](https://dev.to/nemecek_f/how-to-create-register-user-account-with-django-rest-framework-api-15pc), mais [este tutorial](https://wsvincent.com/django-rest-framework-user-authentication-tutorial/) crear os usuarios para Django.

**01/06/2020**  
Intento de cración dos usuarios de django, un pouco complicado debido a todos os diferentes sistemas que existen. [Token auth tutorial](https://simpleisbetterthancomplex.com/tutorial/2018/11/22/how-to-implement-token-authentication-using-django-rest-framework.html) neste tutorial explica como facer unha autentificación de token, probablemente sexa algo así o que fai falta.

**07/06/2020**  
Probar a crear usuarios con peticións post e conseguir así o manexo de usuarios.

**08/06/2020**  
Atopei [este tuto](https://spapas.github.io/2018/03/01/django-rest-auth/) no que parece que se explica como facer a autentificación con sessions ainda que é necesario tamén usar o token. De todas formas o sistema de drf parece que me serviría de todas formas, pero sería mellor modificalo xa que hai campos que non usaréi.

**15/06/2020**  
[Esta libraría](https://sunscrapers.com/blog/django-rest-framework-login-and-authentication/) e mais [este tuto](https://iheanyi.com/journal/user-registration-authentication-with-django-django-rest-framework-react-and-redux/) son os que estiven vendo hoxe, os que parece que poden axudar algo co tema de crear usuarios e así.

**16/06/2020**  
Probas co último tuto de onte.

**19/06/2020**  
Realización do [tutorial](https://iheanyi.com/journal/user-registration-authentication-with-django-django-rest-framework-react-and-redux/)
Se crea a aplicación users para facer a xestión dos usuarios.
Falta por ver como facer CRUD con usuarios, se crean e se pode obter o token, podería estar ben facer o login [así](https://docs.djangoproject.com/en/3.0/topics/auth/default/#django.contrib.auth.login). Aínda é necesario ver como tratalos ben.

**24/06/2020**  
Creamos usuarios e crease o token automáticamente, podemos obter o token pasando usuario e contrasinal. Non sei borrar usuarios e tampouco teño moi claro que a forma de crearlos en views e en serializers sexa de todo a correcta. Supoño que o seguinte será facer o login co frontend. Usei [este vídeo](https://www.youtube.com/watch?v=junWE5DoaVk).

**25/06/2020**  
Se comeza a facer a páxina de login e rexistro en ionic. [Este](https://www.techiediaries.com/ionic/ionic-5-jwt-authentication-node-expressjs/), mais [este](https://www.techiediaries.com/ionic-http/) son tutoriais que enlazan outros, sendo estes os necesarios para crear as páxinas de rexistro coa funcionalidade de facer peticións http.

**29/06/2020**  
O primeiro desta [serie de tutoriais](https://www.techiediaries.com/ionic/ionic-5-jwt-authentication-node-expressjs/) permite facer a xestión de usuarios en ionic con unha api. Hai que crear un servizo e as páxinas de autentificación que no meu caso será unha soa co login e rexistro xunto. [Este outro](https://blog.flicher.net/ionic-4-user-registration-login-tutorial/) pode axudar tamén.
Instálase @ionic/storage
Creouse a páxina de rexistro seguindo o tutorial anteriormente indicado, pero hai algún problema co npm e non funciona o ionic serve.

**30/06/2020**  
Arreglouse o problema con npm, era un problema de versións.

**01/07/2020**  
Coma non entendo ben de todo como funcionan os usuarios, como se fan as peticións e demais creo que o mellor vais ser usar algo coma unha librería para xestionar todo e facelo mais doado, esta habería que instalala con pip para django e con npm para angular, serán diferentes librerías pero que traballan xuntas. [Este tutorial explica como facer a parte de django](https://simpleisbetterthancomplex.com/tutorial/2018/11/22/how-to-implement-token-authentication-using-django-rest-framework.html) e [este explica a parte de angular](https://www.techiediaries.com/angular/jwt-authentication-angular-9-example/).
Cambiando os métodos tal vez se poida intentar facer sen usar librerías nin para ángular nin para django, pero se non é posible o mais lóxico parece usar jwt que hai bastante información e ten que ser algo mais doado.

**02/07/2020**  
[Engadimos este](https://medium.com/engineerbabu/angular-authentication-using-jwt-d846c5ce0ac6) a ver se así vale. Mañá se fai.

**13/07/2020**  
Usuarios usuarios usuarios

**15/07/2020**  
[Jwt Ionic](https://devdactic.com/jwt-authentication-ionic/), [este xa estaba](https://www.techiediaries.com/ionic/ionic-5-jwt-authentication-node-expressjs/) seguindo estes dous debería de avanzarse no tema dos usuarios, este último parece mais completo e mais complicado de entender, pero facendo unha mistura de ambos debería de chegar, hai que leelos ben e ir tirando.
