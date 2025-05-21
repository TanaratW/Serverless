pipeline {
  agent any

  stages {



    stage('Stop Existing Containers') {
      steps {

        echo '🛑 Stopping existing containers (if any)...'
        dir('assignments-6-powerpuffgod') {
          // Stop and remove existing containers
          sh 'docker-compose down || true'
        }
        sh 'docker-compose down || true'
      }
    }

    stage('Build Docker Containers') {
      steps {
        echo '🔧 Building containers...'
        sh 'docker-compose build'
      }
    }

    stage('Start Updated Containers') {
      steps {
        echo '🚀 Starting updated containers...'
        sh 'docker-compose up -d --build'
      }
    }
  }

  post {
    success {
      echo '✅ Deployment succeeded!'
    }
    failure {
      echo '❌ Deployment failed!'
    }
    always {
      echo '📦 Done updating containers!!!'
    }
  }
}
