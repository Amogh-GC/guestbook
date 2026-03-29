# Docker and Minikube (Kubernetes)

This project uses Docker to package a **two-tier app**:

- **Web/API container**: Node.js + Express serves `public/` and exposes JSON endpoints for MongoDB-backed guestbook messages.
- **Database container**: MongoDB stores messages.

It also uses Minikube to run the same containers on a local Kubernetes cluster.

## 1) How Docker works here

### Dockerfile (image build)

`Dockerfile` builds a container image named (used by Compose/K8s) `guestbook-app:local`.

Key idea: **multi-stage build** keeps the final image small:

1. `deps` stage installs dependencies (`npm ci --omit=dev`) and caches the `node_modules` layer.
2. runtime stage copies:
   - `node_modules` from the `deps` stage
   - server code (`server.js`)
   - static UI (`public/`)
3. the container starts with `node server.js` and listens on port `3000`.

### What gets connected

The app needs a MongoDB URI. In containers, this URI points to the **service name** on the container network:

- `MONGODB_URI=mongodb://mongo:27017/guestbook`

Where `mongo` is the service/container name defined by `docker-compose.yml` and mirrored in Kubernetes via the `mongo` Service/Deployment labels.

## 2) How Docker Compose works here

`docker-compose.yml` runs the app and its dependency locally using one command.

Typical flow:

1. `docker compose up --build`:
   - builds the app image from `Dockerfile`
   - starts MongoDB (`mongo:7`)
   - starts the app container
2. Containers communicate using Docker’s internal networking:
   - the app reaches MongoDB at `mongodb://mongo:27017/guestbook`
3. You can open the web app at `http://localhost:3000`.

Compose is great for local development and quick verification, but it isn’t Kubernetes.

## 3) How Minikube works here

Minikube provides a local Kubernetes cluster so you can apply `.yaml` manifests and observe pods/services using `kubectl`.

### Start Minikube

```powershell
minikube start
```

### Important: use Minikube’s Docker for the app image

In this repo, Kubernetes is configured with:

- `image: guestbook-app:local`
- `imagePullPolicy: Never`

That means Kubernetes will **only** use an image that already exists inside Minikube’s Docker daemon.

So you build the image *for Minikube*:

#### Windows (PowerShell)

```powershell
minikube docker-env | Invoke-Expression
docker build -t guestbook-app:local .
```

#### Bash (macOS/Linux/Git Bash)

```bash
eval "$(minikube docker-env)"
docker build -t guestbook-app:local .
```

### Apply Kubernetes manifests

The manifests are in `k8s/`:

- `k8s/mongo-deployment.yaml` and `k8s/mongo-service.yaml`
- `k8s/app-deployment.yaml` and `k8s/app-service.yaml`

Then run:

```powershell
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/mongo-service.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/app-service.yaml
```

What Kubernetes creates:

- **Deployment** (Mongo + App): keeps `replicas` running and recreates pods if they crash.
- **Service**:
  - `mongo` lets the app resolve MongoDB by name inside the cluster
  - `guestbook-app` exposes the app to your machine using `NodePort` (`30080`)

### Verify execution

```powershell
kubectl get pods
```

If pods are `Running`, expose the web UI:

```powershell
minikube service guestbook-app --url
```

## 4) Docker vs Minikube (quick mental model)

- **Docker** runs containers directly (you control them via `docker run` / `docker compose`).
- **Kubernetes (Minikube)** runs containers through **Deployments** and **Services**, and manages scaling/health automatically.
- With this repo, Docker is used to build the image; Minikube is used to orchestrate and run that image reliably.

