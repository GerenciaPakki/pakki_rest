#!/bin/bash

echo "Ejecutando el hook post-push..."

while read local_ref local_sha remote_ref remote_sha
do
    if [[ $remote_ref = "refs/heads/develop" ]]; then
        # Establecer la conexión SSH al servidor y ejecutar el script devPull.sh
        ssh -p 5522 lamed@pakki.click 'cd /home/pakkiscript && ./devPull.sh'
        if [ $? -eq 0 ]; then
            echo "El script devPull.sh se ejecutó correctamente."
        else
            echo "El script devPull.sh encontró un error durante su ejecución."
        fi
    fi
done

exit 0





