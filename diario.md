
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

**17/07/2020**  
Usando os tutoriais anteriores fixen un mix para a autentificación, queda probalo e pulilo ben.

**22/07/2020**  
Refactor do servizo de autentificación, non funciona ben de todo, a páxina de rexistro/login non ten ben os botóns.

**23/07/2020**  
Vai mais ou menos o tema dos usuarios, hai que comprobar ben o de isLoggedIn para imprima o token ou algo así e saber que tira guai, unha vez iso pois xa iría todo un pouco mais de corrido.

**30/07/2020**  
Nova rama de traballo no que estou tentando probar outros métodos para facer a xestión de usuarios. Por ahora parece que hai problemas con algo da compilación do npm.

**07/08/2020**  
Na nova rama parece que se axeitou algo o tema dos usuarios e parece algo mais comprensible, queda que funcione de todo, co postman vai ben, pero parece que as peticións non se están a facer ben de todo. No rexitro ao menos.

**10/08/2020**  
Cambio de formularios a algo mais sinxelo.

**12/08/2020**  
Se crean usuarios e ao facer login se obtéñen o token de refresco e o token de acceso, estes se almacenan no ionic storage.  
Hay que [crear o token](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/creating_tokens_manually.html) tamén cando se fai login por se acaso non existe, comprobar que funciona o isloggedin, comprobar tamén as validacións dos formularios.

**13/08/2020**  
Is logged in funciona. E a xestión do token tamén. Non é necesario crear os tokens ao facer o login, xa se fai só, pero ao facer o rexistro os garda no admin de django.  
[Validacións formularios](https://ionicthemes.com/tutorials/about/forms-and-validation-in-ionic)

**18/08/2020**  
[Manexar usuarios en Django](https://medium.com/swlh/jwt-auth-with-djangorest-api-9fb32b99b33c)  
No django xa non se permiten peticións non autentificadas, hai que pasar o token de autentificación, non está feito. Cando caduque segundo a resposta se tenta refrescar e voltar facer a petición, se tampouco vai xa o erro.

**19/08/2020**  
[Aquí](https://angular-academy.com/angular-jwt/) explicase como facer un interceptor para pasar o token en cada petición mais tamén xestiona o tema de facer o refresco do token. [Neste](https://medium.com/@insomniocode/angular-autenticaci%C3%B3n-usando-interceptors-a26c167270f4) explica onde vai cada cousa mais ou menos, explica o interceptor sen refresco.

**20/08/2020**  
Cambiouse o storage de ionic por localstorage. Cambiar refresh a localstorage tamén para que funcione a función de refresh automáticamente.

**21/08/2020**  
Funciona o refresh.

**22/08/2020**  
Non necesito modificar o modelo do usuario en django xa que só teño que gardar 1 token de spotify, se pode gardar nun arquivo.  
Crear a captura do token de spotify [así](https://tekore.readthedocs.io/en/stable/examples/auth_server.html#auth-server) en spotify.py se se pode irán todas as funcións que teñen que ve rcon spotify. Se engadiu un botón para testar a captura do token, fará falla unha páxina de callback probablemente.

**23/08/2020**  
Cambiase a librería de spotify de tekore a spotipy.  
Mais ou menos teño a lóxica de como obter o token de spotify pero a documentación é un pouco escasa, pódese [ver aquí](https://spotipy.readthedocs.io/en/2.13.0/#)

**24/08/2020**  
Crease a lóxica para obter o cliente de spotify, a idea é que dende o front se fai unha petición ao facer click no botón "conectar con spotify" na que se manda o parámetro url_response a None entón a función do back devolve unha url que haberá que comprobar no front e se comeza por http abrir unha ventá que é a de acceso a spotify. Igual o de abrir a ventá se pode facer dende back, pero parece menos doado.  
Unha vez logeado en spotify e aceptado os scopes este te devolve a unha url de callback, dende esa url facer unha chamada a mesma función pero pasando a url de callback, entón se obtén o token.  
Igual funciona, igual non.  

**25/08/2020**  
Dende o front se pode abrir a url de autentificacion de spotify. Creouse a páxina no front de callback a que devolve a api de spotify, falta capturar a resposta e pasala ao backend [aquí explica](https://www.valentinog.com/blog/drf-request/) tamén pode que se poda capturar a url completa directamente dende django.

**26/08/2020**  
Obtense o token de acceso a api de spotify. O funcionamento final é que dende o front se fai un click que obtén a url para autenticarse contra a api de spotify, esa api redirixe a /callbak e dende ahí chamase o backend que captura a uri completa de callback, a cropea, e obtén o token. Hai que mirar que se está o token en cache non faga todo isto.

**27/08/2020**  
[Con isto](https://www.freecodecamp.org/news/how-to-build-your-first-ionic-4-app-with-api-calls-f6ea747dc17a/) creei a parte de que cando se fai unha búsqueda se faga a petición directamente ó backend e a busqueda no backend que devolve un diccionario con os 10 resultados que da por defecto Spotify. Falta que se mostren os resultados da busqueda debaixo da barra de busqueda mentres se fai a búsqueda. O problema está en ApiService.

**28/08/2020**  
Ainda non conseguín que se mostren os resultados despois de buscar.

**29/08/2020**  
Xa se mostran os resultados despois de buscar e é clickable.  
Lóxica para funcionar, se escolle ou xenera unha nova playlist se lle chama session, a esta playlist é a onde se van a engadir as cancións que se busquen.

**01/09/2020**  
[Aquí](https://como-programar.net/ionic/ion-select/) explica como facer a selección das playlist para cargala debaixo, ainda falta facer que cargue mais listas cando chegue abaixo.  Cando se fai click nunha lista das que se amosa co que explico antes, se recibe un json coas cancións e o primeiro artista(little bug) da lista.

**28/11/2020**  
Estes últimos días estiven facendo a páxina de login e rexistro, funciona aparentemente ben, con detalles por pulir. Non se validan os campos nin se valida que o contrasinal sexa o mesmo introducido duas veces. [Aquí explica como se fan ambas cousas](https://ionicthemes.com/tutorials/about/forms-and-validation-in-ionic). Tamén engadín a cor por defecto da APP é a cor de Spotify.

**03/12/2020**  
Creación e deseño da páxina principal do administrador, creando un popover pra que os resultados da busqueda se amosen enriba do resto da páxina.

**08/12/2020**  
[Popover vídeo 1](https://www.youtube.com/watch?v=5FN2_m2gQB8) [Popover video 2](https://www.youtube.com/watch?v=_roU5wAyaug) nestes videos explica como facer o tema de montar o popover, hai que ter ollo ao crear o compoñente e ir engadindo nos modulos correspondentes, facendo os imports tamén. Mostra os resultados no popover, pero ainda fai falla que se poida clickar nel e que responda.

**09/12/2020**  
O popover de busqueda funciona como debería, baseime nos vídeos de onte. Pra facer unha búsqueda nova hai que facer click de novo na barra de búsqueda, non vai perfecto.

**10/12/2020**  
Creado o sistema para comprobar se o usuario está logeado nas páxinas restrinxidas, se non o está se vai ata a páxina de login. CanActivate executa isLoggedIn e espera a resposta nun promise. CanActivate é unha función do servizo de autentificación e no routing-module é onde se limita as páxinas as que se pode acceder. Isto é o que usei pra facelo: [ionic route gurads](https://www.joshmorony.com/prevent-access-to-pages-in-ionic-with-angular-route-guards/)

**14/12/2020**  
Leve colocación do selector de playlists e como se amosan.

**15/12/2020**  
Cando se solicita o refresh token, o backend non autoriza o acceso a usuarios non identificados a /token/refresh polo tanto non se pode obter o token co de refresco.  
O problema é que cando se fai a petición de refresco o user non está autenticado e polo tanto o backend devolve erro de autentificación. Unha posible solución é que cando se detecte o erro de autentificación marcar o loggedin como false ou ao comprobar o logged in comprobar se devolve un erro de autentificación.  
Cando chega o token o interceptor non é nulo porque a response é "token inválido".  
Despois de mirar bastante opto por probar [diferentes interceptors](https://jasonwatmore.com/post/2020/07/25/angular-10-jwt-authentication-with-refresh-tokens).

**18/12/2020**  
Agora cando se fai o login tamén se garda a data de caducidade do refresh token +1 día. Pra comprobar isLoggedIn primeiro se comproba se a data de caducidade é anterior ao timestamp. Cando se fai o refresh token tamén se almacena o novo refresh token e se actualiza a data de caducidade, a priori funciona todo ben.

**21/12/2020**  
O refresh token non cambia o obter un novo access token, polo tanto non se pode actualizar, non sei se non se actualiza, pero como caduca despois de 1 día non debería de ser moi importante.  
Tentando facer que as cancións se vaian engadindo a unha nova playlist creada manualmente por min.

**04/01/2021**  
Creando o modelo para almacear as playlists que vaian a soar. Duda, unha taboa de "playlists" pra todos os usuarios ou unha táboa para cada un? Unha taboa para cada un, podería ser [así](https://learndjango.com/tutorials/django-best-practices-referencing-user-model)  

**28/04/2021**  
Por cambios en angular o sistema de almacenaxe (Storage) xa non creaba a base de datos o inicio polo tanto non se podían gardar os token. Na páxina do modulo de angular en GitHub [iexplican como crear a base de datos o inicio](https://github.com/ionic-team/ionic-storage#with-angular).

**29/04/2021**  
Había un problema coas playlist que parece que non as gardaba ben e agora xa vai sen facerlle nada, tal vez un problema co almacenamento destas.

**10/05/2021**  
Creados os serializers pra introducir os datos nas bases.  
Novo problema, o querer facer o rexistro o interceptor de angular detecta que non ten o access token polo tanto rexeita a conexión cando ao facer o rexistro non é posible obter ese token xa que non existe ata que o usuario se rexistre.

**11/05/2021**  
Xa funciona ben o rexistro, nas settings the django oubo que quitar IsAuthenticated dos permisos por defecto, [o principio deste tutorial mais ou menos](https://python.plainenglish.io/django-rest-framework-jwt-auth-with-login-and-register-77f830cd8789).  
Para playlistmode, ten que haber unha playlist de spotify seleccionada e se van a ir engadindo na playlist as cancións que se seleccionen. Para o queue mode se engaden as cancións a unha playlist local.  
[Aquí](https://www.geeksforgeeks.org/modelserializer-in-serializers-django-rest-framework/) explicase como facer o dos serializes e models, seguir por ahí.

**12/05/2021**  
Dende postman consigo cargar os datos nas tablas correspondentes da base. Pra parsear directamente os datos de spotify a BD faría falla un serializer?  

**Outra dúbida**, podería parsear os datos de search e getplaylists coa axuda dun serializador? Recollería un json e o podería pasar a un diccionario.  

Cando se fai click nunha canción que aparece no popover hai que metela na BD:  

* Facer unha view que chame o viewset que mete as cancións na BD. Con pasar a uri sería suficiente porque fai outra consulta a Spotify para obter o resto de datos da canción.
  * Obteño un json que tería que transformar en algo para a BD cun serializer, o mesmo que quero para search e getplaylists.
* Pasar os datos directamente dende o frontend ao viewset.

**13/05/2021**  
Creación do modelo relacional da base de datos. Hai 4 táboas:

1) Wike, táboa das instancias que haxa de Wikebox.
1) User, táboa de Django que contén os usuarios.
1) Groups, táboa de Django que contén grupos cos seus permisos.
1) Playlist, táboa coas cancións.

Os permisos de Django poden bloquear os accesos, [documentación](https://www.django-rest-framework.org/api-guide/permissions/)  
Engadidos os permisos as views da api `@permission_classes([IsAuthenticated])` agora non se poden facer peticións a api sen estar autentificado, de todas formas pódese crear un usuario sen estar autentificado, pero non borralos (creo).

**14/05/2021**  
O modelo de usuario necesita ser modificado para que se poida engadir a qué instancia pertence. O resto de modelos están feitos.  
Pequena actualización da memoria.

**19/05/2021**  
Estou intentando modificar o modelo de usuario para que se poida engadir a qué número de instancia pertence cada usuario. Hai que crear un novo modelo de usuario baseado no AbstractUser de Django, aínda non funciona e non sei ben cal é a razón.

**20/05/2021**  
Modificación do modelo de usuario usando [este](https://testdriven.io/blog/django-custom-user-model/#model-manager) mais [este](https://docs.hektorprofe.net/django/api-django-rest/sistema-autenticacion-registro/) tutoriais.
No modelo de usuario xa se pode engadir a instancia a que pertence o usuario, a idea é:  

1. Créase admin.
1. Usuario admin da nome e engade url a instancia.
1. A instancia créase automáticamente.
1. Os usuarios rexístranse através da url e entón xa pertencen a instancia.

Engadida unha pequena parte do capítulo 2 da memoria.

**21/05/2021**  
Nota da idea desta noite:  
Para solventar o problema de ter unha instancia antes de crear o usuario, mostrarase unha páxina onde se rexistra a instancia e despois os usuarios se rexistran en: www.wikebox.com/instancia/register e o login en www.wikebox.com/instancia/login

Problema: rexitrase a instancia pero non usuarios.  
Se hai instancias sen usuarios borranse despois de 24 horas.  
Os usuarios seguen sendo independientes das instancias xa que conservan o seu id.

Hoxe:  
Intento engadir as cancións de unha playlist de Spotify ao modelo de LocalPlaylist non satisfactoriamente.

**22/05/2021**  
En spotify.py estou intentando reformatear a forma de obter as cancións e metelas no modelo. Hai que ver que datos son os que fan falla "track" probablemente e despois facer un bucle para meter todas as cancións. Igual non é mala idea facer o diccionario primeiro e despois metelas na bd.

**24/05/2021**  
Se engaden playlists a LocalPlaylist. Pero non se recorre ben o bucle das cancións recibidas xa que o parámetro non é iterable, tal vez haxa que facer un diccionario coas cancións antes de metelo no modelo.
