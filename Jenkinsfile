pipeline {
  agent none
  environment {
  PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1"
  NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
  NETLIFY_SITE_ID = '26077973-d7c5-4a37-a420-a7e9f530bbc5'
}
  stages {
    stage('Install & Build') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.58.0-noble'
          args '--network=host'
        }
      }
      steps {
        sh 'npm i'
        sh 'chmod +x node_modules/.bin/*'
        sh 'npm run build'
      }
    }
    stage('UI Tests (Playwright)') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.58.0-noble'
          args '--network=host'
        }
      }
      steps {
        sh 'chmod +x node_modules/.bin/*'
        sh 'npm run test:e2e'
      }
      post {
        always {
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: false,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'PlaywrightReport',
            useWrapperFileDirectly: true
          ])
        }
      }
    }
    stage('Deploy') {
  when { branch 'main' }
  agent { docker { image 'node:20-alpine' } }
  steps {
    sh 'npm i'
    sh 'chmod +x node_modules/.bin/*'
    sh 'npm run build'

    // Netlify CLI lit NETLIFY_AUTH_TOKEN depuis l'environnement
    sh 'npx netlify link --id 26077973-d7c5-4a37-a420-a7e9f530bbc5'
    sh 'npx netlify deploy --prod --dir=dist --site 26077973-d7c5-4a37-a420-a7e9f530bbc5 --no-build'
  }
}


    stage('docker') {
      agent any
      when { branch 'main' }
      environment {
        CI_REGISTRY = 'ghcr.io'
        CI_REGISTRY_USER = 'abys31'
        CI_REGISTRY_IMAGE = "$CI_REGISTRY" + '/' + "$CI_REGISTRY_USER" + '/chessboard-jenkins'
        CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
      }
      steps {
        sh 'docker build --network=host -t ${CI_REGISTRY_IMAGE}:latest .'
        sh 'docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY'
        sh 'docker push ${CI_REGISTRY_IMAGE}:latest'
      }
    }
  }
}