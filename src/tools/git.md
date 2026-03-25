---
title: Git
icon: git
order: 2
category:
  - 工具
tag:
  - Git
  - 版本控制
---

# Git

Git是分布式版本控制系统，是现代开发必备工具。

## 基本配置

```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# 配置编辑器
git config --global core.editor vim

# 配置别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"

# 查看配置
git config --list
```

## 基本命令

### 初始化和克隆

```bash
# 初始化仓库
git init

# 克隆仓库
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git
```

### 日常工作流

```bash
# 查看状态
git status

# 添加到暂存区
git add file.txt
git add .
git add -p  # 交互式添加

# 提交
git commit -m "feat: add new feature"
git commit -am "fix: bug fix"  # 添加并提交

# 查看历史
git log
git log --oneline
git log --oneline --graph
git log -p file.txt  # 文件修改历史

# 查看差异
git diff              # 工作区 vs 暂存区
git diff --cached     # 暂存区 vs 最新提交
git diff HEAD~1       # 当前 vs 上一次提交
```

### 分支操作

```bash
# 查看分支
git branch            # 本地分支
git branch -r         # 远程分支
git branch -a         # 所有分支

# 创建分支
git branch feature    # 创建
git checkout -b feature  # 创建并切换
git switch -c feature    # 新语法

# 切换分支
git checkout main
git switch main

# 合并分支
git merge feature
git merge --no-ff feature  # 禁用快进

# 删除分支
git branch -d feature
git branch -D feature  # 强制删除

# 重命名分支
git branch -m old-name new-name
```

### 远程操作

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/user/repo.git

# 拉取
git fetch origin
git pull origin main

# 推送
git push origin main
git push -u origin main  # 设置上游
git push --force origin main  # 强制推送（谨慎使用）

# 删除远程分支
git push origin --delete feature
```

## 撤销操作

```bash
# 撤销工作区修改
git checkout -- file.txt
git restore file.txt

# 撤销暂存
git reset HEAD file.txt
git restore --staged file.txt

# 撤销提交（保留修改）
git reset --soft HEAD~1

# 撤销提交（丢弃修改）
git reset --hard HEAD~1

# 修改最后一次提交
git commit --amend -m "new message"

# 使用stash暂存
git stash
git stash list
git stash pop
git stash apply stash@{0}
```

## 标签管理

```bash
# 创建标签
git tag v1.0.0
git tag -a v1.0.0 -m "Release 1.0.0"

# 查看标签
git tag
git show v1.0.0

# 推送标签
git push origin v1.0.0
git push origin --tags

# 删除标签
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## Git Flow

```
main (master)
  │
  ├─── develop
  │      │
  │      ├─── feature/xxx
  │      │
  │      ├─── release/x.x.x
  │      │
  │      └─── hotfix/xxx
  │
  └───────────────────────────→
```

```bash
# 初始化Git Flow
git flow init

# 开始新功能
git flow feature start login

# 完成功能
git flow feature finish login

# 开始发布
git flow release start 1.0.0

# 完成发布
git flow release finish 1.0.0

# 紧急修复
git flow hotfix start bug-xxx
git flow hotfix finish bug-xxx
```

## 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type类型**：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例**：
```
feat(auth): add JWT authentication

- Implement JWT token generation
- Add token validation filter
- Update login endpoint

Closes #123
```

## 小结

| 操作 | 命令 |
|------|------|
| 克隆 | git clone |
| 添加 | git add |
| 提交 | git commit |
| 推送 | git push |
| 拉取 | git pull |
| 分支 | git branch |
| 合并 | git merge |
| 撤销 | git reset/restore |
