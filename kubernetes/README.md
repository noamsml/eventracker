Steps to deploying the cluster:

1. Use the dockerfile to create a docker image and upload it to dockerhub. (can be skipped if no code changes made)

2. Create mysql user/password secrets

```
# The tr -d portion removes unnecessary newlines which make it impossible to log in as an interactive user if necessary
pwgen 100 1 |  tr -d "\n" > /tmp/sheets_userpw
pwgen 100 1 |  tr -d "\n"  > /tmp/mysql_rootpw
kubectl create secret generic decentered-database-user-pw --from-literal=user=decentered --from-file=password=/tmp/sheets_userpw
kubectl create secret generic mysql-root-pw --from-file=password=/tmp/mysql_rootpw
```

3. Create your google service account and add it to the kubectl credentials

TODO(noam): Add instructions for creating a service account on google

Once you have this file in /tmp/serviceaccount.json, run the following:

```
kubectl create secret generic decentered-backend-credentials --from-file=serviceaccount.json=/tmp/serviceaccount.json
```

3. Create mysql volume and deploy mysql

NOTE: These instructions create a node-local persistent volume for mysql data and are not sufficient for cloud use. I'll follow up with cloud deployment
plans later.

ALSO NOTE: If you make a mess of the aformentioned secrets you can fully delete the mysql data by removing the deployment and persistent volume, and then sshing into
your node (or getting shell for it via docker-desktop if that's your jam) and then removing /mnt/data/mysql entirely.

```
kubectl apply -f kubernetes/mysql-volume-local.yaml
kubectl apply -f kubernetes/mysql-deploy-initial.yaml
```

Once mysql is fully up (check via `kubectl get pods`), deployed and ready, we should remove the needless env variables that contain passwords and other sensitive info

```
kubectl apply -f kubernetes/mysql-deploy-without-credentials.yaml
```

You can check that mysql login works by attempting a login

```
POD=$(kubectl get pods --selector=app=mysql --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
kubectl exec --tty --stdin $POD -- mysql -u decentered -p$(cat /tmp/sheets_userpw)
```

4. Create the deployment for the app itself

```
kubectl apply -f kubernetes/backend-config.yaml
kubectl apply -f kubernetes/backend-deploy.yaml
```

5. Use the app pod to migrate the db

```
POD=$(kubectl get pods --selector=app=decentered-backend --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -n 1)
kubectl exec $POD -- python scripts/migrate_db.py
```

You can then check the list of tables yourself:

```
POD=$(kubectl get pods --selector=app=mysql --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}')
kubectl exec $POD -- mysql -u decentered -p$(cat /tmp/sheets_userpw) sheets_containerized -e "SHOW TABLES"
```

This should show "cursors" and "events"

6. You can also manually run the import at this pt:

```
POD=$(kubectl get pods --selector=app=decentered-backend --template '{{range .items}}{{.metadata.name}}{{"\n"}}{{end}}' | head -n 1)
kubectl exec $POD -- python scripts/import_events.py
```

And check that the backend works by running

```
kubectl exec $POD -- curl http://localhost/v1/events
```

UPCOMING: Containerize or otherwise deploy the frontend -- idea is to create a composite image that contains nginx and the static files. Gonna research how to do tomorrow.

7. Apply the cronjob config

```
kubectl apply -f kubernetes/backend-cronjob.yaml
```