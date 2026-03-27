---
title: Git
icon: git
order: 2
category:
  - 开发工具
tag:
  - Git
  - 版本控制
---

# Git

> Git 是每个开发者的吃饭工具。但多数人只会 `add`、`commit`、`push`。遇到冲突不会解决，回滚操作不敢执行，分支管理一团糟。这篇文章覆盖 Git 在实际开发中最核心的使用场景。

## 基础入门：Git 5 分钟上手

### 什么是 Git？

```
Git 是分布式版本控制系统：
- 每个开发者本地都有完整的代码仓库
- 可以离线工作
- 分支操作非常快（不需要联网）
```

### 工作流程

```
工作区 → add → 暂存区 → commit → 本地仓库 → push → 远程仓库
```

### 日常命令

```bash
git init                      # 初始化仓库
git clone <url>               # 克隆远程仓库
git add .                     # 暂存所有修改
git commit -m "feat: xxx"     # 提交
git push origin main          # 推送到远程
git pull origin main          # 拉取远程更新
git branch feature/login      # 创建分支
git checkout feature/login    # 切换分支
git merge feature/login       # 合并分支
```

---


## 核心概念——一张图

```
工作区（Working Directory）→ add → 暂存区（Staging Area）→ commit → 本地仓库（.git）→ push → 远程仓库

git add    ：把修改从工作区放到暂存区
git commit ：把暂存区的修改提交到本地仓库
git push   ：把本地仓库推送到远程仓库
git pull   ：拉取远程更新并合并到当前分支
git fetch  ：只拉取远程更新，不合并
```

## 必会操作

```bash
# 撤销操作（小心使用）
git checkout -- file        # 撤销工作区的修改（未 add）
git reset HEAD file         # 撤销暂存区（已 add，未 commit）
git reset --soft HEAD~1     # 撤销最近一次 commit（保留修改）
git reset --hard HEAD~1     # 撤销最近一次 commit（丢弃修改，危险！）
git revert HEAD             # 创建一个新 commit 来撤销上一次 commit（安全）

# 分支管理
git branch feature/login    # 创建分支
git checkout feature/login  # 切换分支
git checkout -b feature/login  # 创建并切换（二合一）
git merge feature/login     # 合并分支到当前分支
git branch -d feature/login # 删除已合并的分支

# 暂存工作区
git stash                   # 暂存当前修改
git stash pop               # 恢复暂存并删除记录
git stash list              # 查看暂存列表

# 查看历史
git log --oneline --graph   # 图形化查看提交历史
git diff                    # 查看工作区与暂存区的差异
git diff --staged           # 查看暂存区与仓库的差异
```

## 分支策略

```
main（生产）：稳定的发布版本
develop（开发）：最新的开发代码
feature/*（功能）：每个功能一个分支
hotfix/*（修复）：紧急修复
release/*（发布）：发布前的准备

Git Flow（适合大团队）：
  main → release/* → hotfix/*
  develop → feature/* → develop → release/*

GitHub Flow（适合小团队）：
  main ← feature/*（PR/MR 合并）
  简单高效，推荐
```

## 面试高频题

**Q1：`git merge` 和 `git rebase` 的区别？**

`merge`：创建一个合并提交，保留两个分支的完整历史。`rebase`：将当前分支的提交"变基"到目标分支上，历史线性但改写了提交。团队协作推荐 `merge`（安全、不改变历史），个人分支整理可以用 `rebase`（历史更清晰）。

## 延伸阅读

- 上一篇：[Docker](docker.md) — 容器化部署
- 下一篇：[Maven](maven.md) — 依赖管理、构建
