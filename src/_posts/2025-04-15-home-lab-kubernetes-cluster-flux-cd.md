---
title: "Home Lab Kubernetes Cluster: GitOps with Flux CD"
date: 2025-04-15
description: "Setting up Flux CD for GitOps on my home lab Kubernetes cluster - because managing a cluster by hand gets old fast."
tags:
- kubernetes
- homelab
- flux
- gitops
hero: "/uploads/2025/04/hp-elitedesk-mini-cluster-stack.jpg"
---

This is the third post in my home lab Kubernetes series. In the [previous post](/posts/2025-04-13-home-lab-kubernetes-cluster-installing-talos-on-bare-metal) I got Talos Linux installed on all six nodes. Now I have a running cluster, but it's empty — and I don't want to manage it by running `kubectl apply` commands by hand every time I want to change something.

Enter GitOps.

## Why Flux CD

The idea behind GitOps is simple: your Git repository is the single source of truth for your cluster's desired state. You commit YAML files to a repo, and a controller running inside the cluster watches that repo and automatically applies changes. Want to install something? Commit a file. Want to remove it? Delete the file and push.

I looked at both [Flux CD](https://fluxcd.io/) and [ArgoCD](https://argo-cd.readthedocs.io/) — the two most popular GitOps tools for Kubernetes. I went with Flux because it seemed a bit more lightweight and also a popular choice that a lot of people have had a good experience with. ArgoCD has a nice UI, but I didn't feel like I needed one for a home lab, and Flux felt more "Kubernetes-native" in how it works.

I also wanted the GitHub repo defining my infrastructure to be manageable with minimal permissions — I wanted Flux to have as limited access as possible and not touch my other private repos.

## Setting Up the GitHub Repo

First, I created a new repo on GitHub called `hlkube`. Then I cloned it locally inside the folder I use for everything related to my cluster:

```bash
git clone git@github.com:nmajor/hlkube.git
cd hlkube
```

## Creating a GitHub Personal Access Token

Flux needs a way to authenticate with GitHub. I created a fine-grained Personal Access Token:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Click "Generate new token"
3. Give it a name (e.g., `hlkube-flux`)
4. Set an expiration date
5. Under "Repository access," select "Only select repositories" and choose your repo
6. Under "Permissions":
   - **Contents:** Read and write
   - **Administration:** Read and write (required for image automation)
   - **Metadata:** Read-only (default)
7. Generate and copy the token immediately — you won't see it again

## Installing the Flux CLI

```bash
brew install fluxcd/tap/flux
```

## Bootstrapping Flux

This is where the magic happens. The `flux bootstrap` command does a lot in one shot — it installs the Flux controllers into your cluster and sets up the Git repository with the initial structure:

```bash
export GITHUB_TOKEN=<your-pat>
export GITHUB_USER=nmajor
export GITHUB_REPO=hlkube

flux bootstrap github \
  --components-extra=image-reflector-controller,image-automation-controller \
  --owner=$GITHUB_USER \
  --repository=$GITHUB_REPO \
  --branch=main \
  --path=clusters/hlkube \
  --read-write-key \
  --personal \
  --kubeconfig ../kubeconfig

# Unset the token when done
unset GITHUB_TOKEN
```

A few things to note:
- The `--components-extra` flag adds the image automation controllers, which I want for automatically updating container image tags later
- The `--path=clusters/hlkube` tells Flux where in the repo to look for its configuration
- The GitHub PAT gets stored in the cluster as a Kubernetes Secret named `flux-system` in the `flux-system` namespace

After a minute or so, everything was up:

```bash
❯ kubectl get pods -n flux-system
NAME                                           READY   STATUS    RESTARTS   AGE
helm-controller-b6767d66-jdtk2                 1/1     Running   0          3m36s
kustomize-controller-57c7ff5596-ttbnm          1/1     Running   0          3m36s
notification-controller-58ffd586f7-dgbdk       1/1     Running   0          3m36s
source-controller-6ff87cb475-4cxtx             1/1     Running   0          3m36s
```

### Mistake: Forgetting Image Automation

Actually, I initially forgot to include the `--components-extra` flag for image automation. No big deal — you can safely re-run the `flux bootstrap` command. I just had to delete the existing secret first:

```bash
kubectl delete secret flux-system -n flux-system
```

Then re-run the bootstrap with the extra components. It's nice that this is idempotent.

## Repository Structure

After bootstrapping, Flux creates some initial files in `clusters/hlkube/flux-system/`. But the real power comes from how you organize the rest of the repo. After a lot of iteration, I ended up with a three-layer structure with explicit dependencies:

```
hlkube/
├── clusters/hlkube/           # Cluster-specific Flux entry point
│   ├── flux-system/           # Flux components (managed by bootstrap)
│   ├── sources.yaml           # Layer 1: Helm repository sources
│   ├── infrastructure.yaml    # Layer 2: Infrastructure (depends on sources)
│   └── apps.yaml              # Layer 3: Applications (depends on infrastructure)
├── infrastructure/
│   ├── sources/               # HelmRepository definitions
│   ├── cert-manager/          # TLS certificate management
│   ├── traefik/               # Ingress controller
│   ├── longhorn/              # Persistent storage
│   ├── cloudnativepg/         # PostgreSQL operator
│   ├── monitoring/            # Prometheus + Grafana
│   ├── sealed-secrets/        # Encrypted secrets in Git
│   ├── cloudflared/           # Cloudflare Tunnel
│   └── ...
└── apps/
    ├── custom/                # My own applications
    └── third-party/           # Apps built by others (NocoDB, n8n, etc.)
```

### The Dependency Chain

The key insight is the `dependsOn` field. Each layer waits for the previous one to be ready:

**Layer 1 — Sources** (`clusters/hlkube/sources.yaml`):

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: sources
  namespace: flux-system
spec:
  interval: 10m
  path: ./infrastructure/sources
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
```

This deploys all the Helm repository definitions first. For example, here's the Longhorn source:

```yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: longhorn
  namespace: flux-system
spec:
  interval: 1h
  url: https://charts.longhorn.io
```

**Layer 2 — Infrastructure** (`clusters/hlkube/infrastructure.yaml`):

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: infrastructure
  namespace: flux-system
spec:
  interval: 10m
  path: ./infrastructure
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
  dependsOn:
    - name: sources
```

Infrastructure depends on sources being ready — because you can't install a Helm chart if the repository definition doesn't exist yet.

**Layer 3 — Apps** (`clusters/hlkube/apps.yaml`):

```yaml
apiVersion: kustomize.toolkit.fluxcd.io/v1
kind: Kustomization
metadata:
  name: apps
  namespace: flux-system
spec:
  interval: 10m0s
  path: ./apps
  prune: true
  wait: true
  timeout: 5m0s
  sourceRef:
    kind: GitRepository
    name: flux-system
  dependsOn:
    - name: infrastructure
```

Apps depend on infrastructure — because your app needs Longhorn for storage, Traefik for ingress, CloudNativePG for databases, etc.

## How Adding New Things Works

This is the part I really love. Want to add a new piece of infrastructure? Create a folder, add the YAML files, reference it in the infrastructure `kustomization.yaml`, commit, and push. Flux picks it up within minutes and applies it to the cluster.

Want to remove something? Delete the files and push. Flux sees the resources are gone from Git and removes them from the cluster (that's what `prune: true` does).

No more SSH-ing into machines. No more running `kubectl apply` and hoping you remember what you changed last time. Everything is in Git, everything is versioned, and you can always see the full state of your cluster by looking at the repo.

## What's Next

With Flux CD in place, I can now manage my entire cluster through Git commits. In the [next post](/posts/2025-04-18-home-lab-kubernetes-cluster-longhorn-storage) I'll cover setting up Longhorn for persistent storage — which turned out to be quite the adventure involving a detour through OpenEBS Mayastor and a humbling lesson about read-only filesystems in Talos.
