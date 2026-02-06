pipeline {
  agent none

  stages {
    stage('Build') {
      agent {
        docker {
          image 'mcr.microsoft.com/playwright:v1.57.0-noble'
          args '--network=host'
        }
      }
      steps {
        sh 'node -v'
        sh 'npm -v'
        sh 'npm ci || npm install'
        sh 'node ./node_modules/vite/bin/vite.js build'
      }
    }
  }
}
