#!/bin/bash
# ===========================================
# GitHub Actions用のWorkload Identity Federation設定スクリプト
# ===========================================
#
# 使用方法:
# chmod +x scripts/setup-github-actions.sh
# ./scripts/setup-github-actions.sh
#
# 前提条件:
# - gcloud CLIがインストール済み
# - GCPプロジェクトに対する適切な権限がある

set -e

# 設定
PROJECT_ID="prerebi-production"
GITHUB_REPO="your-username/DokoSumu_Web"  # ← GitHubのリポジトリ名に変更してください
SERVICE_ACCOUNT_NAME="github-actions-deployer"
POOL_NAME="github-actions-pool"
PROVIDER_NAME="github-provider"

echo "=== GitHub Actions Workload Identity Federation 設定 ==="
echo "Project ID: $PROJECT_ID"
echo "GitHub Repo: $GITHUB_REPO"
echo ""

# 1. サービスアカウント作成
echo "1. サービスアカウントを作成..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --project=$PROJECT_ID \
    --display-name="GitHub Actions Deployer" \
    --description="Service account for GitHub Actions CI/CD" \
    2>/dev/null || echo "サービスアカウントは既に存在します"

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# 2. 必要な権限を付与
echo "2. IAM権限を付与..."
ROLES=(
    "roles/run.admin"
    "roles/storage.admin"
    "roles/secretmanager.secretAccessor"
    "roles/secretmanager.secretVersionAdder"
    "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
        --role="$ROLE" \
        --quiet
done

# 3. Workload Identity Pool作成
echo "3. Workload Identity Poolを作成..."
gcloud iam workload-identity-pools create $POOL_NAME \
    --project=$PROJECT_ID \
    --location="global" \
    --display-name="GitHub Actions Pool" \
    2>/dev/null || echo "Poolは既に存在します"

# 4. Workload Identity Provider作成
echo "4. Workload Identity Providerを作成..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --project=$PROJECT_ID \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --attribute-condition="assertion.repository=='$GITHUB_REPO'" \
    2>/dev/null || echo "Providerは既に存在します"

# 5. サービスアカウントにWorkload Identityを紐付け
echo "5. Workload Identityとサービスアカウントを紐付け..."
WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe $POOL_NAME \
    --project=$PROJECT_ID \
    --location="global" \
    --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
    --project=$PROJECT_ID \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/${WORKLOAD_IDENTITY_POOL_ID}/attribute.repository/${GITHUB_REPO}"

# 6. 必要な情報を出力
echo ""
echo "=== 設定完了 ==="
echo ""
echo "以下の値をGitHub Secretsに設定してください:"
echo ""

PROVIDER_FULL_NAME="projects/$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

echo "GCP_WORKLOAD_IDENTITY_PROVIDER:"
echo "$PROVIDER_FULL_NAME"
echo ""
echo "GCP_SERVICE_ACCOUNT:"
echo "$SERVICE_ACCOUNT_EMAIL"
echo ""
echo "ENV_PRODUCTION:"
echo "src/.env.production の内容をコピーして設定してください"
echo ""
echo "=== GitHub Secretsの設定方法 ==="
echo "1. GitHubリポジトリの Settings > Secrets and variables > Actions"
echo "2. 'New repository secret' をクリック"
echo "3. 上記の3つのシークレットを追加"
