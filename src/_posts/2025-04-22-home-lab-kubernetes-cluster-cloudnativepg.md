---
title: "Home Lab Kubernetes Cluster: PostgreSQL with CloudNativePG"
date: 2025-04-22
description: "Setting up CloudNativePG on my home lab Kubernetes cluster for managed PostgreSQL - including a smart storage trick to avoid 9x data replication."
tags:
- kubernetes
- homelab
- postgresql
- cloudnativepg
hero: "/uploads/2025/04/hp-elitedesk-mini-cluster-stack.jpg"
---

This is the fifth post in my home lab Kubernetes series. With [Longhorn providing persistent storage](/posts/2025-04-18-home-lab-kubernetes-cluster-longhorn-storage), I can finally run databases. And since pretty much every web app I build uses PostgreSQL, I wanted a solid way to run Postgres on the cluster.

Enter [CloudNativePG](https://cloudnative-pg.io/) — a Kubernetes operator that manages the full lifecycle of PostgreSQL clusters. It handles provisioning, high availability, failover, connection pooling, monitoring, and more. Instead of manually setting up Postgres in a container and hoping for the best, you just define a `Cluster` resource in YAML and the operator takes care of the rest.

## Installing the Operator

Since I'm using [Flux CD](/posts/2025-04-15-home-lab-kubernetes-cluster-flux-cd) for GitOps, installing CloudNativePG is just adding some YAML files to the repo.

First, the Helm repository source:

```yaml
# infrastructure/sources/cloudnativepg.yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: HelmRepository
metadata:
  name: cloudnativepg
  namespace: flux-system
spec:
  interval: 1h
  url: https://cloudnative-pg.github.io/charts
```

Then the HelmRelease:

```yaml
# infrastructure/cloudnativepg/release.yaml
apiVersion: helm.toolkit.fluxcd.io/v2beta1
kind: HelmRelease
metadata:
  name: cloudnativepg
  namespace: cloudnativepg-system
spec:
  interval: 1h
  timeout: 5m
  chart:
    spec:
      chart: cloudnative-pg
      version: "0.23.2"
      sourceRef:
        kind: HelmRepository
        name: cloudnativepg
        namespace: flux-system
  values:
    monitoring:
      enablePodMonitor: true
      enableServiceMonitor: true
```

Add the namespace, reference everything in the kustomization files, commit, push, and Flux takes care of the rest. The operator is now running in the cluster and ready to manage PostgreSQL instances.

## The 9x Replication Discovery

Here's where things got interesting.

I had my default Longhorn storage class configured with 3 replicas — which makes sense for general use. Longhorn replicates each volume across 3 nodes so if one node goes down, your data is safe.

Then I created a CloudNativePG cluster with 3 instances (1 primary + 2 replicas) as a test. CloudNativePG handles its own replication at the PostgreSQL level — streaming replication from the primary to the replicas, each with their own persistent volume.

When I was looking at the Grafana dashboard that shows Longhorn volumes, I noticed there was a separate volume for each PostgreSQL instance. And each of those volumes had 3 Longhorn replicas.

So my data was being replicated **9 times**. 3 Longhorn replicas x 3 PostgreSQL instances.

That's... a lot. Especially on a home lab with 6TB of total storage across 3 nodes.

## The Fix: Single-Replica Storage Class

The solution was simple — create a separate Longhorn storage class specifically for database workloads that only keeps 1 replica:

```yaml
# infrastructure/longhorn/storageclass-single-replica.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn-single-replica
  annotations:
    storageclass.kubernetes.io/is-default-class: "false"
provisioner: driver.longhorn.io
allowVolumeExpansion: true
parameters:
  numberOfReplicas: "1"
  staleReplicaTimeout: "2880"
  fromBackup: ""
  fsType: "ext4"
```

The reasoning: CloudNativePG already handles replication for high availability at the database level. If a node goes down, PostgreSQL fails over to a replica on a different node. Having Longhorn _also_ replicate each volume across nodes is redundant — it's just burning through disk space for no real benefit.

I kept the default 3-replica storage class for everything else (general workloads, apps that don't have their own replication), but all database clusters now use `longhorn-single-replica`.

## Deploying a PostgreSQL Cluster

Here's what a real CloudNativePG cluster definition looks like. This is from one of the apps I'm running:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: nocodb-postgres
  namespace: nocodb
spec:
  instances: 2
  primaryUpdateStrategy: unsupervised
  storage:
    size: 5Gi
    storageClass: longhorn-single-replica
  monitoring:
    enablePodMonitor: true
  postgresql:
    parameters:
      max_connections: "100"
      shared_buffers: "128MB"
      work_mem: "4MB"
      maintenance_work_mem: "32MB"
      effective_cache_size: "512MB"
  replicationSlots:
    highAvailability:
      enabled: true
  bootstrap:
    initdb:
      database: nocodb
      owner: nocodb
      secret:
        name: nocodb-postgres-credentials
```

A few things to highlight:

- **`instances: 2`** — one primary, one replica. For a home lab this gives me high availability without going overboard.
- **`storageClass: longhorn-single-replica`** — using our single-replica class so we don't double up on replication.
- **`replicationSlots.highAvailability.enabled: true`** — ensures the replica stays in sync even if it temporarily falls behind.
- **`bootstrap.initdb`** — creates the database and user on first boot, using credentials from a Kubernetes Secret.

Commit this to the Flux repo and within a few minutes you have a running PostgreSQL cluster with streaming replication.

## Connection Pooling with PgBouncer

CloudNativePG also supports connection pooling through PgBouncer, which is great for web applications that might open a lot of short-lived database connections:

```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Pooler
metadata:
  name: nocodb-postgres-pooler
  namespace: nocodb
spec:
  cluster:
    name: nocodb-postgres
  type: rw
  instances: 2
  monitoring:
    enablePodMonitor: true
  pgbouncer:
    poolMode: session
    parameters:
      default_pool_size: "20"
      max_client_conn: "100"
```

Your app connects to the pooler service instead of directly to PostgreSQL, and PgBouncer handles connection multiplexing.

## Monitoring

Since I have Prometheus and Grafana set up on the cluster, CloudNativePG integrates nicely with both via the `enablePodMonitor: true` and `enableServiceMonitor: true` settings. This gives me dashboards showing replication lag, connection counts, query throughput, and storage usage — which is how I discovered the 9x replication issue in the first place.

## Current State

I now have about 9 PostgreSQL databases running via CloudNativePG across various apps — NocoDB, Postiz, n8n, Coder, and a few of my own projects. All using `longhorn-single-replica` for storage. The operator handles failover, and Flux handles deployment. It's been rock solid.

## Wrapping Up the Series

This was the last major piece of infrastructure for my home lab cluster. Looking back at the whole journey — from unboxing HP EliteDesk minis to running production databases on Kubernetes — it's been a fantastic learning experience. The cluster is now running real applications, accessible from the internet through Cloudflare Tunnel, with GitOps managing the entire state.

Was it overkill? Absolutely. Was it worth it? Also absolutely.
