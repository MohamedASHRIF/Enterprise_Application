pipeline {
  agent any
  environment {
    REGISTRY = 'docker.io'
    IMAGE = "myorg/notification"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build') {
      steps {
        bat 'mvn -B -DskipTests package'
      }
    }
    stage('Test') {
      steps {
        bat 'mvn test'
      }
    }
    stage('Build Docker') {
      steps {
        bat 'docker build -t %IMAGE%:latest Backend\\notification-system'
      }
    }
    stage('Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          bat 'docker login -u %DOCKER_USER% -p %DOCKER_PASS%'
          bat 'docker push %IMAGE%:latest'
        }
      }
    }
    stage('Deploy') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONF_FILE')]) {
          bat 'kubectl --kubeconfig=%KUBECONF_FILE% apply -f k8s\\'
        }
      }
    }
  }
}
