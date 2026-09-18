pipeline {
  agent any
  options { timestamps(); disableConcurrentBuilds(); buildDiscarder(logRotator(numToKeepStr: '20')) }
  parameters {
    string(name: 'NAS_HOST', defaultValue: '192.168.10.70', description: 'NAS 地址，Jenkins 需可访问')
    string(name: 'NAS_USER', defaultValue: 'makun', description: 'NAS SSH 用户')
    string(name: 'SSH_CREDENTIALS_ID', defaultValue: 'fn-nas-ssh', description: 'NAS SSH 私钥凭据')
    string(name: 'DEPLOY_DIR', defaultValue: '/vol3/@appdata/my_apps/star-island/repo', description: '独立代码目录')
    string(name: 'DATA_DIR', defaultValue: '/vol3/@appdata/my_apps/appdata/star-island', description: '独立持久化目录')
    string(name: 'APP_PORT', defaultValue: '18082', description: 'NAS 访问端口')
    string(name: 'APP_ORIGIN', defaultValue: 'http://mk-nas:18082', description: '浏览器实际使用的完整访问地址，不带末尾斜杠')
  }
  stages {
    stage('检查参数') {
      steps {
        script {
          if (!(params.NAS_HOST ==~ /[a-zA-Z0-9.-]+/) || !(params.NAS_USER ==~ /[a-zA-Z0-9_-]+/)) { error('NAS 地址或用户格式错误') }
          if (!(params.DEPLOY_DIR ==~ /\/[a-zA-Z0-9_@\/-]+\/star-island\/repo/) || params.DEPLOY_DIR.contains('..')) { error('代码目录必须为独立 star-island/repo 目录') }
          if (!(params.DATA_DIR ==~ /\/[a-zA-Z0-9_@\/-]+\/star-island/) || params.DATA_DIR.contains('..')) { error('数据目录必须为独立 star-island 目录') }
          if (!(params.APP_PORT ==~ /[0-9]{4,5}/) || !(params.APP_ORIGIN ==~ /https?:\/\/[a-zA-Z0-9.:-]+/)) { error('端口或访问地址格式错误') }
        }
      }
    }
    stage('同步并部署') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: params.SSH_CREDENTIALS_ID, keyFileVariable: 'NAS_SSH_KEY')]) {
          sh '''
            set -eu
            command -v rsync >/dev/null
            IMAGE_TAG=$(git rev-parse --short=12 HEAD)
            export IMAGE_TAG
            ssh -i "$NAS_SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$NAS_USER@$NAS_HOST" "mkdir -p '$DEPLOY_DIR'"
            rsync -az --delete -e "ssh -i '$NAS_SSH_KEY' -o BatchMode=yes -o StrictHostKeyChecking=accept-new" \
              --exclude '.git/' --exclude '.env*' --exclude 'node_modules/' --exclude 'dist/' \
              --exclude 'work/' --exclude 'data/' --exclude 'backups/' --exclude '.codex/' \
              --exclude 'test-results/' --exclude '*.log' ./ "$NAS_USER@$NAS_HOST:$DEPLOY_DIR/"
            ssh -i "$NAS_SSH_KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$NAS_USER@$NAS_HOST" \
              "cd '$DEPLOY_DIR' && DATA_DIR='$DATA_DIR' APP_PORT='$APP_PORT' APP_ORIGIN='$APP_ORIGIN' IMAGE_TAG='$IMAGE_TAG' bash deploy/nas.sh"
          '''
        }
      }
    }
  }
}
