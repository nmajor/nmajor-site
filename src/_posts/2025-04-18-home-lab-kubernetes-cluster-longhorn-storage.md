---
title: "Home Lab Kubernetes Cluster: The Longhorn Storage Saga"
date: 2025-04-18
description: "My journey setting up persistent storage on a home lab Kubernetes cluster - trying Longhorn, giving up for OpenEBS Mayastor, and crawling back to Longhorn after finding the real issue."
tags:
- kubernetes
- homelab
- longhorn
- storage
- talos
hero: "/uploads/2025/04/hp-elitedesk-mini-cluster-stack.jpg"
---

This is the fourth post in my home lab Kubernetes series. With [Talos installed](/posts/2025-04-13-home-lab-kubernetes-cluster-installing-talos-on-bare-metal) and [Flux CD managing the cluster](/posts/2025-04-15-home-lab-kubernetes-cluster-flux-cd), the next big piece is persistent storage. Without it, any data your apps create disappears when a pod restarts. Not great for databases.

This post is a bit of a saga. I tried Longhorn, hit a wall, gave up, tried OpenEBS Mayastor, hit a different wall, realized my original problem was embarrassingly simple, and crawled back to Longhorn. If you want to skip the drama, jump to the [solution](#the-actual-fix). But I think the journey is worth sharing because debugging Kubernetes storage issues can feel like this sometimes.

## Why Longhorn

Each of my 3 worker nodes has a dedicated 2TB WD Blue SN580 NVMe drive for storage. With 3 nodes I can satisfy Longhorn's recommended 3 replicas for redundancy.

I chose [Longhorn](https://longhorn.io/) with the v1 storage engine because v2 is still experimental and has some [steep resource requirements](https://documentation.suse.com/cloudnative/virtualization/v1.4/en/storage/longhorn-v2-data-engine.html) that don't make sense for a home lab.

## First Problem: Missing iSCSI Tools

After deploying Longhorn via Flux CD, the Longhorn manager pods immediately went into `CrashLoopBackOff`. The issue was that Longhorn requires the `iscsiadm` utility, which isn't included in Talos OS by default.

The fix is to apply Talos [system extensions](https://www.talos.dev/v1.9/talos-guides/configuration/system-extensions/). I created an extensions config file:

```yaml
# extensions/longhorn.yaml
customization:
  systemExtensions:
    officialExtensions:
      - siderolabs/iscsi-tools
      - siderolabs/util-linux-tools
```

Then submitted it to the Talos factory to get a custom installer image:

```bash
curl -X POST --data-binary @extensions/longhorn.yaml https://factory.talos.dev/schematics
```

Which returns an ID:

```json
{"id":"613e1592..."}
```

Then use that ID to upgrade each node:

```bash
talosctl upgrade --preserve \
  --image factory.talos.dev/installer/613e1592...:v1.9.5 \
  --nodes 192.168.10.51 \
  --talosconfig talosconfig \
  --endpoints 192.168.10.10
```

I ran this for every node, including the control plane nodes. I did have one upgrade command hang for about 20 minutes, but when I checked the node in a new terminal it was up and running with the extensions installed, so I just cancelled the command.

Confirmed the extensions were installed:

```bash
❯ kubectl get node w1 --show-labels
NAME   STATUS   ROLES    AGE   VERSION   LABELS
w1     Ready    <none>   5d    v1.32.3   ...extensions.talos.dev/iscsi-tools=v0.1.6,extensions.talos.dev/util-linux-tools=2.40.4...
```

## Second Problem: Mounting the Storage Disks

With the iSCSI tools in place, I needed to configure Talos to actually mount the 2TB storage drives. I added this to my worker patch files:

```yaml
machine:
  kubelet:
    extraMounts:
      - destination: /data/volumes
        type: bind
        source: /data/volumes
        options:
          - bind
          - rshared
          - rw
  disks:
    - device: /dev/nvme1n1
      partitions:
        - mountpoint: /data/volumes
```

Applied it, and... the workers got stuck in `NotReady`:

```bash
❯ kubectl get node -A
NAME   STATUS     ROLES           AGE     VERSION
cp1    Ready      control-plane   6d22h   v1.32.3
w1     NotReady   <none>          5d1h    v1.32.3
w2     NotReady   <none>          4d19h   v1.32.3
w3     Ready      <none>          4d17h   v1.32.3
```

The kubelet was stuck waiting for the container runtime:

```
EVENTS   [Waiting]: Waiting for service "cri" to be registered
```

I tried using stable disk IDs instead of `/dev/nvme1n1`:

```yaml
machine:
  disks:
    - device: /dev/disk/by-id/nvme-WD_Blue_SN580_2TB_245105803152
      partitions:
        - mountpoint: /data/volumes
```

Same result. I couldn't get a single worker to come up with the disk config applied.

## Giving Up on Longhorn

After days of troubleshooting, I gave up. I reverted the Talos extensions:

```bash
talosctl upgrade --preserve \
  --image ghcr.io/siderolabs/installer:v1.9.5 \
  --nodes 192.168.10.51 \
  --talosconfig talosconfig \
  --endpoints 192.168.10.10
```

Removing Longhorn itself was easy with Flux — just delete the Longhorn files and any references in the kustomization files, commit, and push. Then I cleaned up any leftovers:

1. Check namespaces: `kubectl get ns` — make sure `longhorn-system` is gone
2. Check CRDs: `kubectl get crd | grep longhorn.io` — should return nothing
3. Check StorageClass: `kubectl get sc` — make sure `longhorn` is gone

I also used `talosctl wipe disk` to clear any leftover formatting on the storage drives.

## Trying OpenEBS Mayastor

I pivoted to [OpenEBS Mayastor](https://openebs.io/) since Talos mentions it directly in [their storage documentation](https://www.talos.dev/v1.9/kubernetes-guides/configuration/storage/). It seemed like it would work better with Talos since it doesn't need iSCSI tools.

I added the required config to my worker patches:

```yaml
machine:
  sysctls:
    vm.nr_hugepages: "1024"
  nodeLabels:
    openebs.io/engine: "mayastor"
  kubelet:
    extraMounts:
      - destination: /var/local
        type: bind
        source: /var/local
        options:
          - bind
          - rshared
          - rw
```

And added `openebs` to the PodSecurity namespace exemptions in `controlplane.yaml`.

But then the `openebs-io-engine` pods kept crashing with:

```
EAL: alloc_pages_on_heap(): couldn't allocate memory due to IOVA exceeding limits of current DMA mask
EAL: alloc_pages_on_heap(): Please try initializing EAL with --iova-mode=pa parameter
```

After more troubleshooting, I started Googling what people were actually using for storage on their home labs. Longhorn kept coming up over and over. Which made me rethink what had actually gone wrong with Longhorn in the first place.

The disk _mounting_ was the problem, not Longhorn itself. If I could solve that, Longhorn should work fine.

## Crawling Back to Longhorn

I pulled out a monitor and connected it directly to one of the stuck worker nodes. First, I noticed the boot order had changed — it was trying to network boot, then boot from the 2TB storage drive, then the OS drive. I fixed the boot order in the BIOS.

Then in the Talos logs I saw this:

```
Error creating mount point directory /data/volumes: mkdir /data: read-only file system.
```

**Bingo.**

## The Actual Fix

The whole problem was that I'd chosen `/data/volumes` as the mount path, but `/data` is a read-only path in Talos. Talos is an immutable OS — most of the filesystem is read-only by design. The `/var` directory is one of the few writable areas.

I changed the mount path to `/var/mnt/volumes`:

```yaml
machine:
  kubelet:
    extraMounts:
      - destination: /var/mnt/volumes
        type: bind
        source: /var/mnt/volumes
        options:
          - bind
          - rshared
          - rw
  disks:
    - device: /dev/disk/by-id/nvme-WD_Blue_SN580_2TB_245105803152
      partitions:
        - mountpoint: /var/mnt/volumes
```

Applied it with a reboot:

```bash
talosctl apply-config --talosconfig talosconfig \
  --nodes 192.168.10.51 --file worker.yaml \
  --config-patch @patches/w1-patch.yaml \
  --mode reboot --endpoints 192.168.10.10
```

And it worked:

```bash
❯ kubectl get nodes -o wide
NAME   STATUS   ROLES           AGE     VERSION   INTERNAL-IP     EXTERNAL-IP   OS-IMAGE         KERNEL-VERSION   CONTAINER-RUNTIME
cp1    Ready    control-plane   8d      v1.32.3   192.168.10.11   <none>        Talos (v1.9.5)   6.12.18-talos    containerd://2.0.3
cp2    Ready    control-plane   6d18h   v1.32.3   192.168.10.12   <none>        Talos (v1.9.5)   6.12.18-talos    containerd://2.0.3
cp3    Ready    control-plane   6d18h   v1.32.3   192.168.10.13   <none>        Talos (v1.9.5)   6.12.18-talos    containerd://2.0.3
w1     Ready    <none>          18h     v1.32.3   192.168.10.51   <none>        Talos (v1.9.5)   6.12.18-talos    containerd://2.0.3
w2     Ready    <none>          3h31m   v1.32.3   192.168.10.52   <none>        Talos (v1.9.5)   6.12.18-talos    containerd://2.0.3
w3     Ready    <none>          6d18h   v1.32.3   192.168.10.53   <none>        Talos (v1.9.5)   6.12.18-talos    containerd://2.0.3
```

All `Ready`. After days of frustration, the fix was changing one path. I can't overstate how annoying it was to realize the issue was this simple.

## Configuring Longhorn

With the disks properly mounted, I set up Longhorn through the UI. For each worker node:

1. Go to Nodes, select the dropdown on a node, and click "Edit node and disks"
2. Click "Add Disk" with these settings:
   - **Name:** `nvme-disk`
   - **Disk Type:** File System
   - **Path:** `/var/mnt/volumes`
   - **Storage Reserved:** `100Gi`
   - **Scheduling:** Enable
3. Remove the default drive that Longhorn auto-adds (mounted to `/var/lib/longhorn/`) so only the dedicated storage drive is used

## One More Issue: exec format error on w2

Just when I thought things were smooth, the `kube-proxy` pods started failing with "exec format error" on worker node 2 only. This usually means trying to run a binary compiled for a different architecture, which was weird since all my nodes are x86_64.

I solved it by doing a clean slate — wiping the drives in BIOS and reinstalling Talos from scratch on w2. After that, everything came up clean.

## What's Next

With Longhorn providing persistent storage across the cluster, I can finally run stateful workloads. In the [next post](/posts/2025-04-22-home-lab-kubernetes-cluster-cloudnativepg) I'll cover setting up CloudNativePG for managed PostgreSQL — including an interesting discovery about how Longhorn's replication interacts with database-level replication that was causing my data to be replicated 9 times.
