pipeline {
  agent none

  environment {
    NETLIFY_AUTH_TOKEN = credentials('NETLIFY_TOKEN')
    NETLIFY_SITE_ID = '3c8adef6-ba3b-444f-a8ae-250c4f1dbb27'
  }

  stages {

    stage('Unit Tests (Vitest)') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.58.0-noble'
          args '--network=host'
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm run test'
      }
      post {
        always {
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'html',
            reportFiles: 'index.html',
            reportName: 'VitestReport',
            useWrapperFileDirectly: true
          ])
        }
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
        sh 'npm ci'
        sh 'npm run test:e2e'
      }
      post {
        always {
          publishHTML([
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'PlaywrightReport',
            useWrapperFileDirectly: true
          ])
        }
      }
    }

    stage('Deploy (Netlify)') {
      when { branch 'main' }   // change en 'master' si besoin
      agent {
        docker {
          image 'node:20-alpine'
          args '--network=host'
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm run build'
        sh 'npx netlify deploy --prod --dir=dist --site $NETLIFY_SITE_ID --auth $NETLIFY_AUTH_TOKEN --no-build'
      }
    }

        
        stage('Docker Build & Push') {
            when {
                branch 'main'
            }
            agent any
            environment {
                CI_REGISTRY = 'ghcr.io'
                CI_REGISTRY_USER = 'abys31'
                CI_REGISTRY_IMAGE = "${CI_REGISTRY}/${CI_REGISTRY_USER}/chess"
                CI_REGISTRY_PASSWORD = credentials('CI_REGISTRY_PASSWORD')
            }
            steps {
                sh 'docker build --network=host -t $CI_REGISTRY_IMAGE .'
                sh 'echo $CI_REGISTRY_PASSWORD | docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY'
                sh 'docker push $CI_REGISTRY_IMAGE'
            }
        }

  }
}
