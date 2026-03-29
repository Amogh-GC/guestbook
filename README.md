# Guestbook (two-tier)

A small web app: **Express** serves a static **guestbook** UI and JSON **API**; messages are stored in **MongoDB**.

## Project overview

- **Web UI** (`public/`): form to post a name and message; list of recent messages.
- **API**: `GET /api/messages`, `POST /api/messages`, `GET /api/health`.
- **Database**: MongoDB via Mongoose.

## Run locally (Node + MongoDB)

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and adjust `MONGODB_URI` if needed.
3. Start MongoDB (local install or Docker).
4. Run: `npm start` and open `http://localhost:3000`.

## Docker Compose (recommended local stack)

From the project root:

```bash
docker compose up --build
```

Open `http://localhost:3000`.

## Kubernetes (Minikube)

Build the image **inside Minikube’s Docker** so Kubernetes can use `imagePullPolicy: Never` without pushing to a registry.

### Windows (PowerShell)

```powershell
minikube start
minikube docker-env | Invoke-Expression
docker build -t guestbook-app:local .
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

### Bash (macOS / Linux / Git Bash)

```bash
minikube start
eval "$(minikube docker-env)"
docker build -t guestbook-app:local .
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

**Open the app**

```bash
minikube service guestbook-app --url
```

Or use `minikube ip` and port **30080** (NodePort in `k8s/app-service.yaml`).

### Useful checks

```bash
kubectl get pods
kubectl get svc
```

## Assignment checklist

- [ ] Push this repo to a **public GitHub** repository and paste the link in your PDF.
- [ ] Capture **`git log --oneline`** for your report.
- [ ] Capture **`kubectl get pods`** when pods are Running.
- [ ] Screenshot the guestbook in the browser (Compose or Minikube URL).
