/* help y man: explicaciones en castellano para cada comando */

const MAN = {
  pwd: 'print working directory. Muestra la ruta absoluta de la carpeta donde estás.\nEj: pwd → /home/leo',
  ls: 'Lista el contenido de una carpeta.\n  -l  formato largo: permisos, dueño, tamaño, fecha\n  -a  incluye ocultos (los que empiezan con punto)\nEj: ls -la ~/proyectos',
  cd: 'change directory. Te mueve a otra carpeta.\n  cd dir   entra\n  cd ..    sube un nivel\n  cd ~     vuelve al home (cd solo también)\n  cd -     vuelve a la carpeta anterior',
  tree: 'Dibuja el árbol de carpetas y archivos.\nEj: tree proyectos',
  mkdir: 'make directory. Crea carpetas.\n  -p  crea también las carpetas padre si no existen\nEj: mkdir -p app/src/components',
  touch: 'Crea un archivo vacío, o actualiza la fecha si ya existe.\nEj: touch index.js',
  cp: 'copy. Copia archivos.\n  -r  recursivo, obligatorio para copiar carpetas\nEj: cp cv.txt backup/   ·   cp -r src src-old',
  mv: 'move. Mueve o renombra (en Linux es la misma operación).\nEj: mv viejo.txt nuevo.txt   ·   mv a.txt docs/',
  rm: 'remove. Borra archivos. No hay papelera.\n  -r  recursivo (carpetas)\n  -f  force: no avisa ni pregunta\nEj: rm -r build/',
  rmdir: 'Borra carpetas, solo si están vacías.',
  cat: 'concatenate. Imprime el contenido de uno o más archivos.\nEj: cat notas.txt',
  less: 'Visor paginado para archivos largos: flechas para moverte, / para buscar, q para salir. (Acá se comporta como cat.)',
  head: 'Primeras líneas de un archivo (10 por defecto).\n  -n N  cantidad de líneas\nEj: head -n 3 archivo',
  tail: 'Últimas líneas de un archivo.\n  -n N  cantidad\n  -f    sigue el archivo en vivo (logs)\nEj: tail -f /var/log/syslog',
  nano: 'Editor de texto en la terminal.\n  Ctrl+S (o Ctrl+O) guarda\n  Ctrl+X sale',
  echo: 'Imprime texto. Combinado con > o >> escribe en archivos.\nEj: echo "hola" > saludo.txt',
  grep: 'Busca texto (o regex) dentro de archivos o de la entrada de un pipe.\n  -r  recursivo   -n  número de línea\n  -i  ignora mayúsculas   -v  invierte   -c  cuenta\nEj: grep -rn "TODO" src/',
  find: 'Busca archivos por nombre o tipo.\n  -name "*.js"   -type f (archivos) / -type d (carpetas)\nEj: find . -name "*.js"',
  wc: 'word count. Cuenta líneas (-l), palabras (-w) y bytes (-c).\nEj: cat log | wc -l',
  sort: 'Ordena líneas. -r invierte, -n numérico.',
  uniq: 'Quita líneas repetidas consecutivas (se usa después de sort).',
  chmod: 'change mode. Cambia permisos.\n  r=4 w=2 x=1, tres dígitos: dueño, grupo, otros\n  chmod 755 f  → rwxr-xr-x\n  chmod +x f   → agrega ejecución',
  sudo: 'superuser do. Ejecuta un comando como root. Hace falta para instalar paquetes o tocar archivos del sistema.',
  whoami: 'Muestra con qué usuario estás logueado.',
  ps: 'process status. Lista procesos.\n  ps aux  todos los procesos de todos los usuarios\nEj: ps aux | grep node',
  kill: 'Manda una señal a un proceso por su PID.\n  kill PID     SIGTERM: le pide que cierre\n  kill -9 PID  SIGKILL: lo corta en seco',
  apt: 'Gestor de paquetes de Ubuntu/Debian.\n  sudo apt update           actualiza la lista\n  sudo apt install curl    instala\n  sudo apt remove curl     desinstala',
  curl: 'Hace pedidos HTTP desde la terminal. Clave para probar APIs REST.\n  -X POST  método   -H  header   -d  body   -i  muestra headers\nEj: curl -X POST -H "Content-Type: application/json" -d \'{"name":"Leo"}\' https://jsonplaceholder.typicode.com/users',
  history: 'Lista los comandos que ejecutaste.',
  clear: 'Limpia la pantalla (atajo: Ctrl+L).',
  cls: 'Limpia la pantalla. Es el comando de Windows (cmd y PowerShell): en un Linux real da "command not found" y se usa clear. Acá funciona igual que clear.',
  man: 'Muestra el manual de un comando.',
  env: 'Muestra las variables de entorno.',
  date: 'Fecha y hora actual.',
  uname: 'Info del sistema. uname -a muestra todo.'
};

C.man = (a) => {
  const k = a[0];
  if (!k) return { out: "What manual page do you want?\nFor example, try 'man man'.\n" };
  if (!MAN[k]) return { err: `No manual entry for ${k}`, code: 16 };
  return { out: `${k.toUpperCase()}(1)\n\n${MAN[k]}\n` };
};

C.help = () => ({ out:
`Comandos disponibles (man <comando> para ver la explicación):

  Navegar      pwd  ls  cd  tree
  Archivos     mkdir  touch  cp  mv  rm  rmdir
  Leer/editar  cat  less  head  tail  nano  echo
  Buscar       grep  find  wc  sort  uniq
  Permisos     chmod  sudo  whoami
  Procesos     ps  kill  top
  Paquetes     apt  (y curl, si lo instalás)
  Sistema      history  clear/cls  date  uname  hostname  env  man

Operadores: |  >  >>  <  &&  ||  ;   Comodines: *  ?
Ejecutar un script: ./archivo.sh (necesita permiso x)
` });
