
/*
mongodump --db=devpakkiDB --collection=postalCodes --out="C:\Users\LAMUX\Desktop\Pakki\mongobkp"

scp "C:\Users\LAMUX\Desktop\Pakki\mongobkp\postal\*" root@77.243.85.223:/home/dbackup/ -p:5522

mongorestore --db=devpakkiDB /home/dbackup/

